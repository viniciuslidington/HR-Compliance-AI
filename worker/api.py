"""API mínima do worker para o hackathon.

Rodar local:   uv run uvicorn api:app_do_ambiente --factory --reload
No Render:     ver render.yaml na raiz do repositório.

Leitura é aberta; escrita (enviar documento, aprovar) exige `Authorization: Bearer <API_TOKEN>`
quando API_TOKEN está definido, para que ninguém com o link gaste a chave do Featherless.
"""

from __future__ import annotations

import hmac
import hashlib
import re
import uuid
import json
import logging
import os
import threading
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Callable

from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi import Depends, FastAPI, File, Header, HTTPException, Query, UploadFile
from pydantic import BaseModel

from ia.config import carregar_env
from ia.conversa_documental import interpretar
from ia.documentos import Funcionario, Transcritor
from ia.llm import LLM, FeatherlessLLM, FeatherlessTranscritor
from ia.orquestrador import AgenteDocumental
from ia.fila import Tarefa
from ia.matriz import carregar_matriz, situacao_matriz
from infra.anexos import BucketLocal, RepositorioAnexos

log = logging.getLogger("worker.api")
RAIZ = Path(__file__).resolve().parent
CONTRATOS = RAIZ.parent / "contracts"
MIMES_ACEITOS = {"image/png", "image/jpeg", "image/webp"}
TAMANHO_MAXIMO = 10 * 1024 * 1024


class PedidoAprovacao(BaseModel):
    aprovador: str


class PedidoAcao(BaseModel):
    acao: str
    responsavel: str


class PedidoMensagem(BaseModel):
    texto: str


class PedidoAutonomia(BaseModel):
    emissor: str
    tipo: str
    aprovador: str


def criar_app(
    *,
    dados_dir: str | Path,
    transcritor: Transcritor,
    llm: LLM,
    hoje: Callable[[], date] = date.today,
    agora: Callable[[], datetime] = datetime.now,
    api_token: str | None = None,
    emissores_autonomos: set[str] | None = None,
    contratos: Path = CONTRATOS,
    agendamento_automatico: bool = False,
) -> FastAPI:
    seed = json.loads((contratos / "seed" / "funcionarios.json").read_text(encoding="utf-8"))
    tenant = seed["tenant"]
    funcionarios = {f["id"]: Funcionario(**f) for f in seed["funcionarios"]}
    matrizes = {m.cargo: m for m in (carregar_matriz(p) for p in sorted((contratos / "matrizes").glob("*.yaml")))}
    dados = Path(dados_dir)
    bucket = BucketLocal(dados / "bucket")
    repo = RepositorioAnexos(dados / "anexos.db")
    autonomos = emissores_autonomos or set()

    agente = AgenteDocumental(transcritor=transcritor, llm=llm, bucket=bucket, repo=repo,
        tenant=tenant, funcionarios=funcionarios, matrizes=matrizes, emissores_autonomos=autonomos)
    lock = threading.RLock()
    with repo._conectar() as db:
        db.executescript("""
        CREATE TABLE IF NOT EXISTS agente_estado (id INTEGER PRIMARY KEY, dados TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS admissoes (pessoa_id TEXT PRIMARY KEY, iniciada_em TEXT NOT NULL, concluida_em TEXT);
        CREATE TABLE IF NOT EXISTS eventos_mock (id TEXT PRIMARY KEY, pessoa_id TEXT NOT NULL UNIQUE, evento_json TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS autonomia_documental (emissor TEXT NOT NULL, tipo TEXT NOT NULL, aprovador TEXT NOT NULL, ativada_em TEXT NOT NULL, PRIMARY KEY (emissor,tipo));
        CREATE TABLE IF NOT EXISTS execucoes_regua (dia TEXT PRIMARY KEY);
        """)
        row = db.execute("SELECT dados FROM agente_estado WHERE id=1").fetchone()
    cards = []
    if row:
        estado = json.loads(row["dados"])
        agente.tarefas = [Tarefa.model_validate(t) for t in estado.get("tarefas", [])]
        agente.mensagens = estado.get("mensagens", [])
        agente.ponteiro = estado.get("ponteiro")
        cards = estado.get("cards", [])

    def salvar_estado(etapas):
        cards.extend(e.dados for e in etapas if e.nome == "card")
        estado = {"tarefas": [t.model_dump(mode="json") for t in agente.tarefas],
                  "mensagens": agente.mensagens, "ponteiro": agente.ponteiro, "cards": cards}
        with repo._conectar() as db:
            db.execute("INSERT OR REPLACE INTO agente_estado (id, dados) VALUES (1, ?)",
                       (json.dumps(estado, ensure_ascii=False),))

    app = FastAPI(title="HR Compliance AI · worker", version="0.1.0")

    def exigir_token(authorization: str | None = Header(default=None)) -> None:
        if api_token is None:
            return
        if authorization is None or not hmac.compare_digest(authorization, f"Bearer {api_token}"):
            raise HTTPException(status_code=401, detail="token ausente ou inválido")

    def buscar_pessoa(pessoa_id: str) -> Funcionario:
        if pessoa_id not in funcionarios:
            raise HTTPException(status_code=404, detail=f"pessoa {pessoa_id} não encontrada")
        return funcionarios[pessoa_id]

    def concluir_admissao(pessoa: Funcionario, instante: datetime) -> list:
        itens = situacao_matriz(matrizes[pessoa.cargo], repo.validades_vigentes(tenant, pessoa.id), instante.date())
        if not all(i.status in ("valido", "a_vencer") for i in itens):
            return []
        with repo._conectar() as db:
            atualizou = db.execute("UPDATE admissoes SET concluida_em=? WHERE pessoa_id=? AND concluida_em IS NULL", (instante.isoformat(), pessoa.id)).rowcount
            if not atualizou:
                return []
            evento = {"tipo": "admissao_documental_concluida", "simulado": True, "pessoa_id": pessoa.id,
                      "nome": pessoa.nome, "cargo": pessoa.cargo, "documentos": [i.model_dump(mode="json") for i in itens]}
            db.execute("INSERT OR IGNORE INTO eventos_mock VALUES (?, ?, ?)", (uuid.uuid4().hex, pessoa.id, json.dumps(evento, ensure_ascii=False)))
        return [agente._mensagem(pessoa.nome, "Sua documentação obrigatória foi conferida. A etapa documental da admissão está concluída.", instante)]

    def calcular_autonomia() -> list[dict]:
        with repo._conectar() as db:
            linhas = db.execute("SELECT tipo_esperado, status, conferencia_json FROM anexos WHERE tenant=? AND status IN ('aprovado', 'recusar', 'escalar')", (tenant,)).fetchall()
            ativos = {(r['emissor'], r['tipo']) for r in db.execute("SELECT emissor, tipo FROM autonomia_documental")}
        grupos = {}
        for linha in linhas:
            conf = json.loads(linha['conferencia_json'] or '{}')
            emissor = conf.get('emissor_cnpj')
            if not emissor:
                continue
            chave = (emissor, linha['tipo_esperado'])
            g = grupos.setdefault(chave, {'emissor': emissor, 'tipo': chave[1], 'decisoes': 0, 'aprovadas': 0})
            g['decisoes'] += 1
            g['aprovadas'] += linha['status'] == 'aprovado'
        for chave, g in grupos.items():
            g['elegivel'] = g['decisoes'] >= 30 and g['aprovadas'] / g['decisoes'] >= .95
            g['ativa'] = chave in ativos
        return list(grupos.values())

    @app.post("/pessoas/{pessoa_id}/admissao/iniciar", dependencies=[Depends(exigir_token)])
    def iniciar_admissao(pessoa_id: str) -> dict:
        pessoa = buscar_pessoa(pessoa_id)
        instante = datetime.combine(hoje(), agora().time())
        with lock:
            with repo._conectar() as db:
                novo = db.execute("INSERT OR IGNORE INTO admissoes (pessoa_id, iniciada_em) VALUES (?, ?)", (pessoa.id, instante.isoformat())).rowcount
            if not novo:
                return {"iniciada": False, "etapas": []}
            itens = situacao_matriz(matrizes[pessoa.cargo], repo.validades_vigentes(tenant, pessoa.id), instante.date())
            faltantes = [i.tipo.upper().replace('NR', 'NR-') for i in itens if i.status in ('faltando', 'vencido')]
            etapas = []
            if faltantes:
                etapas.append(agente._mensagem(pessoa.nome, f"Olá, {pessoa.nome.split()[0]}! Para concluir sua admissão, envie por aqui: {', '.join(faltantes)}.", instante))
            etapas += concluir_admissao(pessoa, instante)
            salvar_estado(etapas)
            return {"iniciada": True, "etapas": [e.model_dump(mode='json') for e in etapas]}

    @app.get("/destino/eventos")
    def eventos_mock() -> list[dict]:
        with repo._conectar() as db:
            return [json.loads(r['evento_json']) for r in db.execute("SELECT evento_json FROM eventos_mock")]

    @app.get("/autonomia")
    def autonomia() -> list[dict]:
        return calcular_autonomia()

    @app.post("/autonomia/ativar", dependencies=[Depends(exigir_token)])
    def ativar_autonomia(pedido: PedidoAutonomia) -> dict:
        emissor = re.sub(r'\D', '', pedido.emissor)
        if not pedido.aprovador.strip():
            raise HTTPException(422, "informe quem autorizou")
        with lock:
            candidato = next((g for g in calcular_autonomia() if g['emissor'] == emissor and g['tipo'] == pedido.tipo), None)
            if not candidato or not candidato['elegivel']:
                raise HTTPException(409, "histórico insuficiente para ativar autonomia")
            with repo._conectar() as db:
                db.execute("INSERT OR IGNORE INTO autonomia_documental VALUES (?, ?, ?, ?)", (emissor, pedido.tipo, pedido.aprovador.strip(), agora().isoformat()))
            return {"ativa": True, "emissor": emissor, "tipo": pedido.tipo}

    @app.post("/pessoas/{pessoa_id}/mensagens", dependencies=[Depends(exigir_token)])
    def responder(pessoa_id: str, pedido: PedidoMensagem) -> dict:
        pessoa = buscar_pessoa(pessoa_id)
        texto = pedido.texto.strip()
        if not texto or len(texto) > 2000:
            raise HTTPException(422, "a resposta deve ter entre 1 e 2000 caracteres")
        with lock:
            tipo = interpretar(llm, texto)
            instante = datetime.combine(hoje(), agora().time())
            resposta = {"vai_enviar": "Obrigado! Fico no aguardo do documento por aqui.",
                        "nao_tem": "Entendi. Vou pedir ao DP para ajudar você com esse documento.",
                        "sensivel": "Obrigado por avisar. Por favor, fale diretamente com o DP para um atendimento reservado.",
                        "outra": "Obrigado pela resposta. Vou pedir ao DP para acompanhar com você."}[tipo]
            etapas = [agente._mensagem(pessoa.nome, resposta, instante)]
            if tipo != 'vai_enviar':
                from ia.relatorio import ResumoCaso
                caso = ResumoCaso(caso_id=f"MSG-{uuid.uuid4().hex[:12]}", funcionario=pessoa.nome, data=instante.date(),
                    ocorrencia="Resposta precisa de acompanhamento", tentativas=[], respostas=[],
                    motivo_nao_resolucao="colaborador precisa de atendimento do DP", informacao_ausente="próximo passo",
                    proxima_acao="conversar com o colaborador", responsavel="DP", prazo=instante.date()+timedelta(days=2), evidencias=[])
                etapas += agente._escalar_para_fila(caso, instante + timedelta(days=2), instante, ['falar_com_colaborador'])
            salvar_estado(etapas)
            return {"classificacao": tipo, "etapas": [e.model_dump(mode='json') for e in etapas]}

    @app.post("/fila/{tarefa_id}/acao", dependencies=[Depends(exigir_token)])
    def acao_fila(tarefa_id: str, pedido: PedidoAcao) -> dict:
        if pedido.acao not in ('pedir_de_novo', 'registrar_contato', 'concluir') or not pedido.responsavel.strip():
            raise HTTPException(422, "ação ou responsável inválido")
        with lock:
            tarefa = next((t for t in agente.tarefas if t.id == tarefa_id), None)
            card = next((c for c in cards if c['tarefa_id'] == tarefa_id), None)
            if not tarefa or not card:
                raise HTTPException(404, "tarefa não encontrada")
            if tarefa.status == 'concluida':
                raise HTTPException(409, "tarefa já concluída")
            etapas = []
            if pedido.acao == 'pedir_de_novo':
                try:
                    anexo = repo.obter(tarefa.caso_id)
                    pessoa = funcionarios[anexo['funcionario_id']]
                except KeyError:
                    raise HTTPException(409, "esta tarefa não está vinculada a um documento")
                etapas.append(agente._mensagem(pessoa.nome, f"Olá! Por favor, envie novamente seu {anexo['tipo_esperado'].upper()}. O DP está acompanhando.", datetime.combine(hoje(), agora().time())))
            card.setdefault('historico', []).append({'acao': pedido.acao, 'responsavel': pedido.responsavel.strip(), 'em': agora().isoformat()})
            if pedido.acao == 'concluir':
                tarefa.status = 'concluida'
            else:
                tarefa.status = 'em_andamento'
            card['status'] = tarefa.status
            salvar_estado(etapas)
            return {"tarefa_id": tarefa_id, "status": tarefa.status, "etapas": [e.model_dump(mode='json') for e in etapas]}

    @app.get("/saude")
    def saude() -> dict:
        return {
            "status": "ok",
            "hoje": hoje().isoformat(),
            "modelo_texto": getattr(llm, "modelo", None),
            "modelo_visao": getattr(transcritor, "modelo", None),
            "chave_featherless_configurada": bool(os.environ.get("FEATHERLESS_API_KEY")),
        }

    @app.get("/pessoas")
    def listar_pessoas() -> list[dict]:
        return [{"id": f.id, "nome": f.nome, "cargo": f.cargo} for f in funcionarios.values()]

    @app.get("/pessoas/{pessoa_id}/matriz")
    def matriz_da_pessoa(pessoa_id: str) -> dict:
        pessoa = buscar_pessoa(pessoa_id)
        itens = situacao_matriz(matrizes[pessoa.cargo], repo.validades_vigentes(tenant, pessoa.id), hoje())
        return {"pessoa": pessoa.id, "nome": pessoa.nome, "cargo": pessoa.cargo, "itens": [i.model_dump(mode="json") for i in itens]}

    @app.post("/pessoas/{pessoa_id}/documentos", dependencies=[Depends(exigir_token)])
    def enviar_documento(pessoa_id: str, tipo: str = Query(...), arquivo: UploadFile = File(...)) -> dict:
        pessoa = buscar_pessoa(pessoa_id)
        try:
            exigencia = matrizes[pessoa.cargo].exigencia(tipo)
        except KeyError:
            raise HTTPException(status_code=400, detail=f"o cargo {pessoa.cargo} não exige {tipo}")
        if arquivo.content_type not in MIMES_ACEITOS:
            raise HTTPException(status_code=415, detail="envie uma imagem PNG, JPEG ou WebP")
        conteudo = arquivo.file.read(TAMANHO_MAXIMO + 1)
        if len(conteudo) > TAMANHO_MAXIMO:
            raise HTTPException(status_code=413, detail="arquivo acima de 10 MB")

        with lock:
            # Reenvios idênticos não podem apagar uma aprovação ou contar outra recusa.
            sha = hashlib.sha256(conteudo).hexdigest()
            with repo._conectar() as db:
                existente = db.execute("SELECT id FROM anexos WHERE tenant=? AND funcionario_id=? AND tipo_esperado=? AND sha256=?", (tenant, pessoa.id, tipo, sha)).fetchone()
            if existente and repo.obter(existente["id"])["status"] != "recebido":
                anexo = repo.obter(existente["id"])
                return {"anexo_id": anexo["id"], "decisao": anexo["status"], "mensagem": anexo["decisao_mensagem"], "validade_ate": anexo["validade_ate"], "etapas": [], "duplicado": True}
            instante = datetime.combine(hoje(), agora().time())
            # Autonomia é específica do emissor e do tipo de documento.
            with repo._conectar() as db:
                agente.emissores_autonomos = autonomos | {r['emissor'] for r in db.execute('SELECT emissor FROM autonomia_documental WHERE tipo=?', (tipo,))}
            etapas = agente.receber_documento(pessoa_id, tipo, conteudo, arquivo.content_type, agora=instante)
            etapas += concluir_admissao(pessoa, instante)
            salvar_estado(etapas)
            anexo_id = next(e.dados["anexo_id"] for e in etapas if e.nome == "recebimento")
            anexo = repo.obter(anexo_id)
            erro = next((e.resumo.removeprefix("falhou: ") for e in etapas if e.nome == "transcricao" and e.resumo.startswith("falhou: ")), None)
            return {"anexo_id": anexo_id, "decisao": anexo["status"], "mensagem": anexo["decisao_mensagem"],
                    "validade_ate": anexo["validade_ate"], "motivos": json.loads(anexo["conferencia_json"] or "{}").get("motivos", []),
                    "problemas_fidelidade": json.loads(anexo["problemas_fidelidade"] or "[]"), "erro_tecnico": erro,
                    "etapas": [e.model_dump(mode="json") for e in etapas]}

    @app.get("/anexos/{anexo_id}")
    def obter_anexo(anexo_id: str) -> dict:
        try:
            return repo.obter(anexo_id)
        except KeyError:
            raise HTTPException(status_code=404, detail="anexo não encontrado")

    @app.post("/anexos/{anexo_id}/aprovar", dependencies=[Depends(exigir_token)])
    def aprovar_anexo(anexo_id: str, pedido: PedidoAprovacao) -> dict:
        obter_anexo(anexo_id)
        if not pedido.aprovador.strip():
            raise HTTPException(status_code=422, detail="informe quem aprovou")
        with lock:
            try:
                etapas = agente.aprovar(anexo_id, aprovador=pedido.aprovador.strip(), agora=datetime.combine(hoje(), agora().time()))
            except ValueError as erro:
                raise HTTPException(status_code=409, detail=str(erro))
            etapas += concluir_admissao(funcionarios[repo.obter(anexo_id)["funcionario_id"]], datetime.combine(hoje(), agora().time()))
            salvar_estado(etapas)
            return {**repo.obter(anexo_id), "etapas": [e.model_dump(mode="json") for e in etapas]}

    @app.get("/pessoas/{pessoa_id}/mensagens")
    def mensagens(pessoa_id: str) -> list[dict]:
        pessoa = buscar_pessoa(pessoa_id)
        return [m for m in agente.mensagens if m["para"] == pessoa.nome]

    @app.get("/fila")
    def fila() -> dict:
        with repo._conectar() as db:
            pendentes = [dict(r) for r in db.execute("SELECT id, funcionario_id, tipo_esperado, validade_ate, decisao_mensagem FROM anexos WHERE tenant=? AND status='pedir_aprovacao' ORDER BY recebido_em DESC", (tenant,))]
        return {"aprovacoes": pendentes, "cards": cards}

    @app.post("/regua/rodar", dependencies=[Depends(exigir_token)])
    def rodar_regua(dia: date) -> dict:
        with lock:
            etapas = agente.rodar_regua(hoje=dia, agora=datetime.combine(dia, agora().time()))
            salvar_estado(etapas)
            return {"dia": dia.isoformat(), "etapas": [e.model_dump(mode="json") for e in etapas]}

    parada = threading.Event()

    def executar_agendamento():
        while not parada.is_set():
            try:
                dia = hoje()
                with lock:
                    with repo._conectar() as db:
                        feita = db.execute("SELECT 1 FROM execucoes_regua WHERE dia=?", (dia.isoformat(),)).fetchone()
                    if not feita:
                        etapas = agente.rodar_regua(hoje=dia, agora=datetime.combine(dia, agora().time()))
                        salvar_estado(etapas)
                        with repo._conectar() as db:
                            db.execute("INSERT OR IGNORE INTO execucoes_regua VALUES (?)", (dia.isoformat(),))
            except Exception:
                log.exception("Falha na régua automática; nova tentativa em um minuto")
            parada.wait(60)

    if agendamento_automatico:
        @app.on_event("startup")
        def iniciar_agendamento():
            parada.clear()
            threading.Thread(target=executar_agendamento, name="regua-diaria", daemon=True).start()

        @app.on_event("shutdown")
        def parar_agendamento():
            parada.set()

    @app.get("/", include_in_schema=False)
    def interface():
        return FileResponse(RAIZ / "static" / "index.html")

    app.mount("/static", StaticFiles(directory=RAIZ / "static"), name="static")
    app.mount("/design-system", StaticFiles(directory=RAIZ.parent / "design-system"), name="design-system")

    return app


def app_do_ambiente() -> FastAPI:
    """Fábrica usada pelo uvicorn (--factory): lê worker/.env e as variáveis de ambiente."""
    carregar_env()
    hoje_fixo = os.environ.get("HOJE")  # congela a data da demo, por exemplo 2026-11-07
    return criar_app(
        dados_dir=os.environ.get("DADOS_DIR", str(RAIZ / "dados")),
        transcritor=FeatherlessTranscritor(),
        llm=FeatherlessLLM(),
        hoje=(lambda: date.fromisoformat(hoje_fixo)) if hoje_fixo else date.today,
        api_token=os.environ.get("API_TOKEN") or None,
        agendamento_automatico=True,
        emissores_autonomos={c.strip() for c in os.environ.get("EMISSORES_AUTONOMOS", "").split(",") if c.strip()},
    )
