"""Relatório de exceção: estrutura do código, resumo do LLM sob guarda de fidelidade.

Evidências, responsável, prazo e próxima ação vêm do caso. O LLM só escreve o
parágrafo de resumo, e o resumo é descartado se citar horário ou data sem respaldo.
"""

from __future__ import annotations

from datetime import date
from typing import Literal

from pydantic import BaseModel, Field

from ia.llm import LLM, estruturar
from ia.redacao import verificar_fidelidade

VERSAO_PROMPT = "relatorio.v1"


class ResumoCaso(BaseModel):
    caso_id: str
    funcionario: str
    data: date
    ocorrencia: str
    tentativas: list[str]
    respostas: list[str]
    motivo_nao_resolucao: str
    informacao_ausente: str
    proxima_acao: str
    responsavel: str
    prazo: date
    evidencias: list[str]


class RelatorioExcecao(ResumoCaso):
    resumo: str
    origem_resumo: Literal["llm", "modelo"]


class TextoResumo(BaseModel):
    resumo: str = Field(min_length=1, max_length=600)


SISTEMA = """Você escreve o resumo de um relatório de exceção de ponto para o DP.
Em até 4 frases: o que ocorreu, o que foi tentado, por que não foi resolvido e o que falta.
Use só os fatos fornecidos. Não acrescente horários, datas ou valores. Não dê parecer jurídico."""


def _resumo_fixo(caso: ResumoCaso) -> str:
    return (
        f"{caso.ocorrencia.capitalize()} em {caso.data.strftime('%d/%m')} ({caso.funcionario}). "
        f"Motivo da exceção: {caso.motivo_nao_resolucao}. Nenhuma alteração aplicada. "
        f"Próxima ação: {caso.proxima_acao}, até {caso.prazo.strftime('%d/%m')}."
    )


def redigir_relatorio_excecao(llm: LLM, caso: ResumoCaso) -> RelatorioExcecao:
    saida = estruturar(
        llm,
        sistema=SISTEMA,
        usuario=f"Fatos do caso:\n{caso.model_dump_json(indent=2)}",
        modelo=TextoResumo,
        nome="registrar_resumo",
        descricao="Registra o resumo do relatório de exceção.",
    )
    fatos = caso.model_dump()
    if saida is not None and not verificar_fidelidade(saida.resumo, fatos):
        return RelatorioExcecao(**fatos, resumo=saida.resumo, origem_resumo="llm")
    return RelatorioExcecao(**fatos, resumo=_resumo_fixo(caso), origem_resumo="modelo")
