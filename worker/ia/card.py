"""Card de decisão: a tarefa de exceção reduzida ao que o DP precisa decidir.

O LLM escreve título, linha de decisão e resumo, sob o guarda de fidelidade.
Urgência, prazo, evidências e botões vêm do código (fila e caso).
"""

from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

from ia.fila import Tarefa, Urgencia, classificar_urgencia
from ia.llm import LLM, estruturar
from ia.redacao import verificar_fidelidade
from ia.relatorio import ResumoCaso

VERSAO_PROMPT = "card.v1"


class TextoCard(BaseModel):
    titulo: str = Field(min_length=1, max_length=90)
    decisao_necessaria: str = Field(min_length=1, max_length=160, description="Uma linha: o que o DP precisa decidir")
    resumo: str = Field(min_length=1, max_length=400)


class CardDecisao(BaseModel):
    tarefa_id: str
    caso_id: str
    titulo: str
    decisao_necessaria: str
    resumo: str
    urgencia: Urgencia
    motivo_urgencia: str
    prazo: datetime
    responsavel: str | None
    evidencias: list[str]
    acoes: list[str]
    origem_texto: Literal["llm", "modelo"]


SISTEMA = """Você escreve cards de decisão para analistas de DP. Seja direto.
Título: funcionário, assunto e data, em até 90 caracteres.
Decisão necessária: uma linha dizendo exatamente o que o analista precisa decidir.
Resumo: até 2 frases com os fatos. Use só os fatos fornecidos; não acrescente horários, datas ou valores."""


def _texto_fixo(caso: ResumoCaso) -> TextoCard:
    data = caso.data.strftime("%d/%m")
    return TextoCard(
        titulo=f"{caso.funcionario} · {caso.ocorrencia} · {data}",
        decisao_necessaria=f"Decidir: {caso.proxima_acao}.",
        resumo=f"{caso.motivo_nao_resolucao.capitalize()}. Respostas: {'; '.join(caso.respostas)}. Nenhuma alteração aplicada.",
    )


def montar_card(llm: LLM, caso: ResumoCaso, tarefa: Tarefa, agora: datetime, *, acoes: list[str]) -> CardDecisao:
    urgencia, motivo = classificar_urgencia(tarefa, agora)
    saida = estruturar(
        llm,
        sistema=SISTEMA,
        usuario=f"Fatos do caso:\n{caso.model_dump_json(indent=2)}\n\nOpções que o analista terá: {', '.join(acoes)}",
        modelo=TextoCard,
        nome="registrar_card",
        descricao="Registra título, decisão necessária e resumo do card.",
    )
    fatos = caso.model_dump()
    fiel = saida is not None and not any(
        verificar_fidelidade(texto, fatos) for texto in (saida.titulo, saida.decisao_necessaria, saida.resumo)
    )
    texto, origem = (saida, "llm") if fiel else (_texto_fixo(caso), "modelo")
    return CardDecisao(
        tarefa_id=tarefa.id,
        caso_id=caso.caso_id,
        titulo=texto.titulo,
        decisao_necessaria=texto.decisao_necessaria,
        resumo=texto.resumo,
        urgencia=urgencia,
        motivo_urgencia=motivo,
        prazo=tarefa.prazo,
        responsavel=tarefa.atribuida_a,
        evidencias=caso.evidencias,
        acoes=acoes,
        origem_texto=origem,
    )
