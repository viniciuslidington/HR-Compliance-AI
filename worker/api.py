"""API mínima do worker para o hackathon.

Rodar local:   uv run uvicorn api:app_do_ambiente --factory --reload
No Render:     ver render.yaml na raiz do repositório.

Leitura é aberta; escrita (enviar documento, aprovar) exige `Authorization: Bearer <API_TOKEN>`
quando API_TOKEN está definido, para que ninguém com o link gaste a chave do Featherless.
"""

from __future__ import annotations

import hmac
import json
import logging
import os
from datetime import date, datetime
from pathlib import Path
from typing import Callable

from fastapi import Depends, FastAPI, File, Header, HTTPException, Query, UploadFile
from pydantic import BaseModel

from ia.config import carregar_env
from ia.documentos import (
    DecisaoAceite,
    Funcionario,
    LeituraDocumento,
    ResultadoDocumento,
    Transcritor,
    processar_documento,
)
from ia.llm import LLM, ErroLLM, FeatherlessLLM, FeatherlessTranscritor
from ia.matriz import carregar_matriz, situacao_matriz
from infra.anexos import BucketLocal, RepositorioAnexos

log = logging.getLogger("worker.api")
RAIZ = Path(__file__).resolve().parent
CONTRATOS = RAIZ.parent / "contracts"
MIMES_ACEITOS = {"image/png", "image/jpeg", "image/webp"}
TAMANHO_MAXIMO = 10 * 1024 * 1024


class PedidoAprovacao(BaseModel):
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
) -> FastAPI:
    seed = json.loads((contratos / "seed" / "funcionarios.json").read_text(encoding="utf-8"))
    tenant = seed["tenant"]
    funcionarios = {f["id"]: Funcionario(**f) for f in seed["funcionarios"]}
    matrizes = {m.cargo: m for m in (carregar_matriz(p) for p in sorted((contratos / "matrizes").glob("*.yaml")))}
    dados = Path(dados_dir)
    bucket = BucketLocal(dados / "bucket")
    repo = RepositorioAnexos(dados / "anexos.db")
    autonomos = emissores_autonomos or set()

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

        chave = bucket.salvar(conteudo, tenant=tenant, sensivel=tipo == "aso")
        sha256 = chave.rsplit("/", 1)[1]
        anexo_id = repo.registrar_recebimento(
            tenant=tenant, funcionario_id=pessoa.id, tipo_esperado=tipo, sha256=sha256,
            mime=arquivo.content_type, tamanho=len(conteudo), chave=chave, recebido_em=agora(),
        )
        erro_tecnico = None
        try:
            resultado = processar_documento(
                transcritor, llm, conteudo, arquivo.content_type,
                funcionario=pessoa, exigencia=exigencia, hoje=hoje(), emissores_autonomos=autonomos,
            )
        except ErroLLM as erro:  # visão ou extração fora do ar: o anexo fica guardado e o caso vai para o DP
            erro_tecnico = str(erro)[:300]
            log.warning("leitura indisponível no anexo %s: %s", anexo_id, erro_tecnico)
            resultado = ResultadoDocumento(
                leitura=LeituraDocumento(hash_arquivo=sha256, transcricao=None, extracao=None, problemas_fidelidade=["leitura_indisponivel"]),
                conferencia=None,
                decisao=DecisaoAceite(decisao="escalar", mensagem="não foi possível ler o documento agora; conferência manual"),
            )
        repo.registrar_resultado(anexo_id, resultado)
        conferencia = resultado.conferencia
        return {
            "anexo_id": anexo_id,
            "decisao": resultado.decisao.decisao,
            "mensagem": resultado.decisao.mensagem,
            "validade_ate": conferencia.validade_ate.isoformat() if conferencia and conferencia.validade_ate else None,
            "motivos": [m.model_dump() for m in resultado.decisao.motivos],
            "problemas_fidelidade": resultado.leitura.problemas_fidelidade,
            "erro_tecnico": erro_tecnico,
        }

    @app.get("/anexos/{anexo_id}")
    def obter_anexo(anexo_id: str) -> dict:
        try:
            return repo.obter(anexo_id)
        except KeyError:
            raise HTTPException(status_code=404, detail="anexo não encontrado")

    @app.post("/anexos/{anexo_id}/aprovar", dependencies=[Depends(exigir_token)])
    def aprovar_anexo(anexo_id: str, pedido: PedidoAprovacao) -> dict:
        obter_anexo(anexo_id)
        try:
            repo.aprovar(anexo_id, aprovador=pedido.aprovador, em=agora())
        except ValueError as erro:
            raise HTTPException(status_code=409, detail=str(erro))
        return repo.obter(anexo_id)

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
        emissores_autonomos={c.strip() for c in os.environ.get("EMISSORES_AUTONOMOS", "").split(",") if c.strip()},
    )
