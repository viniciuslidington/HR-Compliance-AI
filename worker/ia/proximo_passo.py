"""Escolha da próxima ação: o LLM propõe, o backend decide se é permitida.

As ações candidatas dependem do estado do caso (código) e só valem se o playbook
ativo as usa. Escalar para o DP é sempre permitido. Proposta fora da lista é
registrada como recusada; duas recusas seguidas, ou modelo indisponível, escalam.
"""

from __future__ import annotations

import json
from typing import Literal

from pydantic import BaseModel, Field

from ia.llm import LLM, estruturar
from ia.playbook import Playbook

VERSAO_PROMPT = "proximo_passo.v1"
ESCALAR = "create_exception_task"

# Estados em que o agente precisa escolher entre caminhos. Os demais estados têm
# uma única transição possível e são conduzidos pelo código, sem LLM.
CANDIDATAS_POR_ESTADO: dict[str, frozenset[str]] = {
    "em_investigacao": frozenset({"descartar_com_fundamento", "send_request", "create_proposal", ESCALAR}),
    "aguardando_funcionario": frozenset({"create_proposal", "send_request", ESCALAR}),
    "reaberto": frozenset({"send_request", "create_proposal", ESCALAR}),
}


class PropostaAcao(BaseModel):
    acao: str = Field(description="Uma das ações permitidas listadas")
    justificativa: str = Field(max_length=300, description="Justificativa operacional curta, citando fatos do caso")


class ResultadoProposta(BaseModel):
    acao: str
    justificativa: str
    origem: Literal["llm", "backend"]
    recusadas: list[str] = Field(default_factory=list)


def acoes_permitidas(pb: Playbook, estado: str) -> frozenset[str]:
    usadas = {p.acao for p in pb.passos} | {p.se_existir_ajuste_valido for p in pb.passos if p.se_existir_ajuste_valido}
    return frozenset(a for a in CANDIDATAS_POR_ESTADO.get(estado, frozenset()) if a in usadas or a == ESCALAR)


SISTEMA = """Você é o analista digital de pendências de ponto. Escolha a próxima ação do caso.
Use apenas uma das ações permitidas listadas. Justifique em uma frase, citando fatos do contexto.
Se já existe ajuste válido para o dia, descarte com fundamento. Se falta informação do funcionário, pergunte.
Se há conflito entre fontes ou dúvida que você não resolve com os fatos, escale para o DP."""


def propor_proxima_acao(llm: LLM, pb: Playbook, estado: str, contexto: dict) -> ResultadoProposta:
    permitidas = sorted(acoes_permitidas(pb, estado))
    recusadas: list[str] = []
    for _ in range(2):
        aviso = f"\nAções recusadas antes (não permitidas): {', '.join(recusadas)}." if recusadas else ""
        usuario = (
            f"Playbook: {pb.playbook} v{pb.versao}. Estado: {estado}.\n"
            f"Ações permitidas: {', '.join(permitidas)}.{aviso}\n"
            f"Contexto do caso:\n{json.dumps(contexto, ensure_ascii=False, default=str)}"
        )
        proposta = estruturar(
            llm,
            sistema=SISTEMA,
            usuario=usuario,
            modelo=PropostaAcao,
            nome="propor_acao",
            descricao="Propõe a próxima ação do caso.",
        )
        if proposta is None:
            break
        if proposta.acao in permitidas:
            return ResultadoProposta(
                acao=proposta.acao, justificativa=proposta.justificativa, origem="llm", recusadas=recusadas
            )
        recusadas.append(proposta.acao)
    return ResultadoProposta(
        acao=ESCALAR,
        justificativa="nenhuma proposta válida do modelo; caso escalado ao DP",
        origem="backend",
        recusadas=recusadas,
    )
