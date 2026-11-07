"""Agente documental: encadeia as etapas e devolve cada uma, com tempo e dados, para inspeção.

Fluxos:
- receber_documento: bucket → recebimento → transcrição → extração → fidelidade → conferência
  → decisão → tentativas (escala na 3ª recusa seguida) → registro → mensagem → fila e card (se
  escalou) → matriz.
- aprovar: aprovação humana → mensagem → matriz.
- rodar_regua: para cada pessoa e documento, a próxima etapa da régua de renovação; no
  impedimento, card P0 na fila do DP.

Mensagens ao colaborador saem de modelos fixos com os dados do caso; o canal (chat simulado,
WhatsApp, portal) só as entrega. Fila e mensagens ficam em memória neste MVP.
"""

from __future__ import annotations

import time
import uuid
from datetime import date, datetime, timedelta
from typing import Any

from pydantic import BaseModel, Field

from ia.card import montar_card
from ia.documentos import (
    DecisaoAceite,
    Funcionario,
    LeituraDocumento,
    ResultadoDocumento,
    Transcritor,
    conferir_documento,
    decidir_aceite,
    extrair_de_transcricao,
    problemas_de_fidelidade,
)
from ia.fila import Analista, Tarefa, atribuir
from ia.llm import LLM, ErroLLM
from ia.matriz import Matriz, situacao_matriz
from ia.regua import proxima_acao
from ia.relatorio import ResumoCaso
from infra.anexos import Bucket, RepositorioAnexos

NOME = {"aso": "ASO", "nr10": "certificado de NR-10", "nr35": "certificado de NR-35"}
ATIVIDADE = {"aso": "exercer a função", "nr10": "trabalhar com eletricidade", "nr35": "trabalhar em altura"}
ANALISTAS_PADRAO = [Analista(id="ana", nome="Ana (DP)"), Analista(id="bia", nome="Bia (DP)")]


class Etapa(BaseModel):
    nome: str
    resumo: str
    duracao_ms: int | None = None
    dados: dict[str, Any] = Field(default_factory=dict)


def _dmy(dia: date | None) -> str:
    return dia.strftime("%d/%m/%Y") if dia else "?"


class AgenteDocumental:
    def __init__(
        self,
        *,
        transcritor: Transcritor,
        llm: LLM,
        bucket: Bucket,
        repo: RepositorioAnexos,
        tenant: str,
        funcionarios: dict[str, Funcionario],
        matrizes: dict[str, Matriz],
        analistas: list[Analista] | None = None,
        emissores_autonomos: set[str] | None = None,
        limite_falhas: int = 3,
    ):
        self.transcritor, self.llm, self.bucket, self.repo = transcritor, llm, bucket, repo
        self.tenant, self.funcionarios, self.matrizes = tenant, funcionarios, matrizes
        self.analistas = analistas or ANALISTAS_PADRAO
        self.emissores_autonomos = emissores_autonomos or set()
        self.limite_falhas = limite_falhas
        self.tarefas: list[Tarefa] = []
        self.ponteiro: str | None = None
        self.mensagens: list[dict[str, Any]] = []

    # ---------- utilidades ----------

    def _mensagem(self, para: str, texto: str, agora: datetime) -> Etapa:
        self.mensagens.append({"para": para, "texto": texto, "em": agora.isoformat()})
        return Etapa(nome="mensagem", resumo=f"→ {para}: {texto}", dados={"para": para, "texto": texto})

    def _matriz(self, pessoa: Funcionario, hoje: date) -> Etapa:
        itens = situacao_matriz(self.matrizes[pessoa.cargo], self.repo.validades_vigentes(self.tenant, pessoa.id), hoje)
        estados = {i.tipo: i.status for i in itens}
        completa = all(s in ("valido", "a_vencer") for s in estados.values())
        resumo = ", ".join(f"{t}={s}" for t, s in estados.items()) + (" · pronto para iniciar" if completa else "")
        return Etapa(nome="matriz", resumo=resumo, dados={"itens": estados, "completa": completa})

    def _escalar_para_fila(self, caso: ResumoCaso, prazo: datetime, agora: datetime, acoes: list[str]) -> list[Etapa]:
        tarefa = Tarefa(id=f"T-{uuid.uuid4().hex[:12]}", caso_id=caso.caso_id, empresa_id=self.tenant, criada_em=agora, prazo=prazo)
        atribuicao = atribuir(tarefa, self.analistas, self.tarefas, agora, ponteiro=self.ponteiro)
        self.ponteiro = atribuicao.ponteiro
        tarefa = tarefa.model_copy(update={"atribuida_a": atribuicao.analista_id, "atribuida_em": agora})
        self.tarefas.append(tarefa)
        etapas = [
            Etapa(
                nome="fila",
                resumo=f"{tarefa.id} atribuída a {atribuicao.analista_id or 'ninguém (liderança avisada)'}: {atribuicao.motivo}",
                dados=atribuicao.model_dump(),
            )
        ]
        inicio = time.monotonic()
        card = montar_card(self.llm, caso, tarefa, agora, acoes=acoes)
        etapas.append(
            Etapa(
                nome="card",
                resumo=f"[{card.urgencia.value} · {card.motivo_urgencia}] {card.titulo} | Decisão: {card.decisao_necessaria}",
                duracao_ms=int((time.monotonic() - inicio) * 1000),
                dados=card.model_dump(mode="json"),
            )
        )
        return etapas

    # ---------- recebimento ----------

    def receber_documento(self, pessoa_id: str, tipo: str, imagem: bytes, mime: str, *, agora: datetime) -> list[Etapa]:
        pessoa = self.funcionarios[pessoa_id]
        exigencia = self.matrizes[pessoa.cargo].exigencia(tipo)
        hoje = agora.date()
        etapas: list[Etapa] = []

        chave = self.bucket.salvar(imagem, tenant=self.tenant, sensivel=tipo == "aso")
        sha256 = chave.rsplit("/", 1)[1]
        etapas.append(Etapa(nome="bucket", resumo=f"{chave} ({len(imagem)} bytes)", dados={"chave": chave}))
        anexo_id = self.repo.registrar_recebimento(
            tenant=self.tenant, funcionario_id=pessoa.id, tipo_esperado=tipo, sha256=sha256,
            mime=mime, tamanho=len(imagem), chave=chave, recebido_em=agora,
        )
        etapas.append(Etapa(nome="recebimento", resumo=f"anexo {anexo_id}", dados={"anexo_id": anexo_id}))

        extracao = conferencia = None
        problemas: list[str] = []
        transcricao: str | None = None
        inicio = time.monotonic()
        try:
            transcricao = self.transcritor.transcrever(imagem, mime)
            ms = int((time.monotonic() - inicio) * 1000)
            if tipo == "aso":  # dado de saúde: a transcrição não aparece nem é guardada
                etapas.append(Etapa(nome="transcricao", resumo=f"{len(transcricao)} caracteres (oculta: dado de saúde)", duracao_ms=ms))
            else:
                etapas.append(Etapa(nome="transcricao", resumo=transcricao[:160].replace("\n", " "), duracao_ms=ms, dados={"texto": transcricao}))
            inicio = time.monotonic()
            extracao = extrair_de_transcricao(self.llm, transcricao)
            ms = int((time.monotonic() - inicio) * 1000)
            if extracao is None:
                problemas = ["extracao_indisponivel"]
                etapas.append(Etapa(nome="extracao", resumo="modelo não devolveu campos válidos", duracao_ms=ms))
            else:
                campos = extracao.model_dump(mode="json", exclude_none=True)
                etapas.append(Etapa(nome="extracao", resumo=str(campos), duracao_ms=ms, dados=campos))
                problemas = problemas_de_fidelidade(extracao, transcricao)
                etapas.append(
                    Etapa(
                        nome="fidelidade",
                        resumo="todos os campos aparecem na transcrição" if not problemas else f"sem respaldo: {', '.join(problemas)}",
                        dados={"problemas": problemas},
                    )
                )
        except ErroLLM as erro:
            problemas = ["leitura_indisponivel"]
            etapas.append(Etapa(nome="transcricao", resumo=f"falhou: {str(erro)[:200]}", duracao_ms=int((time.monotonic() - inicio) * 1000)))

        if extracao is not None and extracao.tipo == "aso":
            for etapa in etapas:
                if etapa.nome == "transcricao":
                    etapa.resumo = "Transcrição oculta: dado de saúde"
                    etapa.dados = {}

        if extracao is not None:
            conferencia = conferir_documento(extracao, pessoa, exigencia, hoje)
            etapas.append(
                Etapa(
                    nome="conferencia",
                    resumo="ok" if conferencia.aceitavel else "; ".join(m.texto for m in conferencia.motivos),
                    dados={"validade_ate": _dmy(conferencia.validade_ate), "motivos": [m.codigo for m in conferencia.motivos]},
                )
            )

        if conferencia is None or problemas:
            decisao = DecisaoAceite(decisao="escalar", mensagem="leitura não confiável: " + ", ".join(problemas))
        else:
            decisao = decidir_aceite(conferencia, emissores_autonomos=self.emissores_autonomos)
        etapas.append(Etapa(nome="decisao", resumo=f"{decisao.decisao}: {decisao.mensagem}", dados={"decisao": decisao.decisao}))

        if decisao.decisao == "recusar":
            falhas = self.repo.falhas_seguidas(self.tenant, pessoa.id, tipo) + 1
            escalou = falhas >= self.limite_falhas
            etapas.append(
                Etapa(
                    nome="tentativas",
                    resumo=f"{falhas}ª recusa seguida" + (f" · limite de {self.limite_falhas} atingido, escala para o DP" if escalou else ""),
                    dados={"falhas": falhas},
                )
            )
            if escalou:
                decisao = DecisaoAceite(
                    decisao="escalar",
                    mensagem=f"{NOME[tipo]} recusado {falhas} vezes seguidas; último motivo: {decisao.mensagem}",
                    motivos=decisao.motivos,
                )

        resultado = ResultadoDocumento(
            leitura=LeituraDocumento(hash_arquivo=sha256, transcricao=transcricao, extracao=extracao, problemas_fidelidade=problemas),
            conferencia=conferencia,
            decisao=decisao,
        )
        self.repo.registrar_resultado(anexo_id, resultado)
        etapas.append(Etapa(nome="registro", resumo=f"status={decisao.decisao}", dados={"status": decisao.decisao}))

        etapas.append(self._mensagem(pessoa.nome, self._texto_para_colaborador(tipo, decisao, conferencia), agora))

        if decisao.decisao == "escalar":
            caso = ResumoCaso(
                caso_id=anexo_id,
                funcionario=pessoa.nome,
                data=hoje,
                ocorrencia=f"{NOME[tipo]} não aceito",
                tentativas=[f"{self.repo.falhas_seguidas(self.tenant, pessoa.id, tipo)} envio(s) recusado(s)"],
                respostas=[],
                motivo_nao_resolucao=decisao.mensagem,
                informacao_ausente=f"{NOME[tipo]} válido",
                proxima_acao=f"conferir o {NOME[tipo]} com {pessoa.nome}",
                responsavel="DP",
                prazo=hoje + timedelta(days=2),
                evidencias=[f"anexo:{anexo_id}", f"bucket:{chave}"],
            )
            etapas += self._escalar_para_fila(caso, agora + timedelta(days=2), agora, ["aprovar_manualmente", "pedir_de_novo", "falar_com_colaborador"])

        etapas.append(self._matriz(pessoa, hoje))
        return etapas

    @staticmethod
    def _texto_para_colaborador(tipo: str, decisao: DecisaoAceite, conferencia) -> str:
        validade = _dmy(conferencia.validade_ate) if conferencia else "?"
        if decisao.decisao == "recusar":
            motivos = "; ".join(m.texto for m in decisao.motivos)
            return f"Recebi seu {NOME[tipo]}, mas não consigo aceitar: {motivos}. Pode me enviar um válido por aqui?"
        if decisao.decisao == "pedir_aprovacao":
            return f"Recebi e conferi seu {NOME[tipo]}: válido até {validade}. Vou passar para o RH confirmar."
        if decisao.decisao == "aceitar_sozinho":
            return f"Recebi e conferi seu {NOME[tipo]}: aceito, válido até {validade}. Obrigado!"
        return (
            f"Recebi seu documento, mas ainda não consegui aceitar o {NOME[tipo]}. "
            f"Vou pedir para alguém do RH conferir e te retorno por aqui."
        )

    # ---------- aprovação ----------

    def aprovar(self, anexo_id: str, *, aprovador: str, agora: datetime) -> list[Etapa]:
        anexo = self.repo.obter(anexo_id)
        self.repo.aprovar(anexo_id, aprovador=aprovador, em=agora)
        pessoa = self.funcionarios[anexo["funcionario_id"]]
        tipo = anexo["tipo_esperado"]
        validade = date.fromisoformat(anexo["validade_ate"]) if anexo["validade_ate"] else None
        return [
            Etapa(nome="aprovacao", resumo=f"{aprovador} aprovou o anexo {anexo_id}", dados={"aprovador": aprovador}),
            self._mensagem(pessoa.nome, f"O RH confirmou seu {NOME[tipo]}, válido até {_dmy(validade)}.", agora),
            self._matriz(pessoa, agora.date()),
        ]

    # ---------- renovação ----------

    def rodar_regua(self, *, hoje: date, agora: datetime) -> list[Etapa]:
        etapas: list[Etapa] = []
        for pessoa in self.funcionarios.values():
            itens = situacao_matriz(self.matrizes[pessoa.cargo], self.repo.validades_vigentes(self.tenant, pessoa.id), hoje)
            for item in itens:
                if item.validade_ate is None:
                    continue
                enviadas = self.repo.lembretes_enviados(self.tenant, pessoa.id, item.tipo, item.validade_ate)
                acao = proxima_acao(item, hoje, enviadas)
                if acao is None:
                    continue
                self.repo.registrar_lembrete(
                    tenant=self.tenant, funcionario_id=pessoa.id, tipo=item.tipo,
                    validade_ate=item.validade_ate, etapa=acao.etapa, enviado_em=agora,
                )
                dias = (item.validade_ate - hoje).days
                etapas.append(
                    Etapa(
                        nome="regua",
                        resumo=f"{pessoa.nome} · {NOME[item.tipo]} vence em {_dmy(item.validade_ate)} ({dias} dias) → {acao.etapa}",
                        dados={"pessoa": pessoa.id, "tipo": item.tipo, "etapa": acao.etapa, "dias": dias},
                    )
                )
                etapas.append(self._mensagem(pessoa.nome, self._texto_regua(acao.etapa, pessoa, item.tipo, item.validade_ate, dias), agora))
                if acao.etapa == "impedimento":
                    caso = ResumoCaso(
                        caso_id=f"IMP-{pessoa.id}-{item.tipo}",
                        funcionario=pessoa.nome,
                        data=item.validade_ate,
                        ocorrencia=f"{NOME[item.tipo]} vencido",
                        tentativas=[f"régua enviada: {', '.join(sorted(enviadas)) or 'nenhuma etapa anterior'}"],
                        respostas=[],
                        motivo_nao_resolucao="documento não renovado até o vencimento",
                        informacao_ausente=f"{NOME[item.tipo]} novo",
                        proxima_acao=f"retirar {pessoa.nome} de atividades em que precise {ATIVIDADE[item.tipo]} e agendar a reciclagem",
                        responsavel="DP",
                        prazo=item.validade_ate,
                        evidencias=[f"matriz:{pessoa.cargo}", f"validade:{item.validade_ate.isoformat()}"],
                    )
                    prazo = datetime.combine(item.validade_ate, datetime.min.time())
                    etapas += self._escalar_para_fila(caso, prazo, agora, ["confirmar_afastamento", "agendar_reciclagem", "falar_com_gestor"])
        return etapas

    @staticmethod
    def _texto_regua(etapa: str, pessoa: Funcionario, tipo: str, validade: date, dias: int) -> str:
        nome, doc, atividade = pessoa.nome.split()[0], NOME[tipo], ATIVIDADE[tipo]
        if etapa == "aviso_renovacao":
            return (
                f"Olá, {nome}. Seu {doc} vence em {_dmy(validade)}. Depois dessa data você não poderá {atividade}. "
                f"Quando fizer a reciclagem, me envie o certificado novo por aqui."
            )
        if etapa == "lembrete":
            return f"{nome}, ainda não recebi o novo {doc}. Ele vence em {_dmy(validade)} ({dias} dias)."
        if etapa == "lembrete_firme":
            return (
                f"{nome}, faltam {dias} dias: a partir de {_dmy(validade)} você não poderá {atividade} sem o {doc} novo. "
                f"O RH já foi avisado."
            )
        return f"{nome}, seu {doc} venceu em {_dmy(validade)}. Até enviar o novo, você não pode {atividade}. O RH vai falar com você."
