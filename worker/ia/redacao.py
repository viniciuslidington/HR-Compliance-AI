"""Redação de mensagens com guarda de fidelidade.

Toda mensagem nasce de um modelo fixo. O LLM pode reescrever o texto para soar
natural, mas o resultado só é usado se cada horário e data citados existirem nos
fatos do caso e não houver valores em reais. Caso contrário, vai o modelo fixo.
"""

from __future__ import annotations

import re
from datetime import date
from typing import Any, Literal

from pydantic import BaseModel, Field

from ia.llm import LLM, estruturar

VERSAO_PROMPT = "redacao.v1"

MODELOS: dict[str, str] = {
    "pendencia_marcacao": (
        "Olá, {nome}. No seu ponto de {dia_semana} ({data}) estão registradas as marcações "
        "{marcacoes_registradas}, e falta uma marcação para completar o dia. Você pode informar o horário "
        "que ficou faltando ou dizer se não trabalhou nesse período? Sua resposta será encaminhada para "
        "validação conforme o procedimento da empresa."
    ),
    "lembrete_pendencia": (
        "Olá, {nome}. A pendência do seu ponto de {data} continua aberta. Você pode responder por aqui com o "
        "horário que ficou faltando, ou dizer se não trabalhou nesse período?"
    ),
    "pedido_esclarecimento": (
        "Olá, {nome}. Não consegui entender a resposta sobre o ponto de {data}. Você pode informar só o "
        "horário que ficou faltando, no formato HH:MM, ou dizer se não trabalhou nesse período?"
    ),
    "notificacao_autoaplicacao": (
        "{gestor}, o ajuste do ponto de {funcionario} em {data} (marcação {horario}) foi aplicado "
        "automaticamente pelo playbook {playbook} v{versao}, dentro da tolerância de 5 minutos da escala. "
        "Você pode contestar até {prazo_contestacao}."
    ),
}

_HORARIO = re.compile(r"\b\d{1,2}[:h]\d{2}\b")
_DATA = re.compile(r"\b\d{1,2}/\d{1,2}(?:/\d{2,4})?\b")


def _achatar(valor: Any) -> list[str]:
    if isinstance(valor, dict):
        return [s for v in valor.values() for s in _achatar(v)]
    if isinstance(valor, (list, tuple, set)):
        return [s for v in valor for s in _achatar(v)]
    if isinstance(valor, date):
        return [valor.strftime("%d/%m/%Y"), valor.strftime("%d/%m")]
    return [str(valor)]


def _normalizar_horario(token: str) -> str:
    horas, minutos = re.split(r"[:h]", token)
    return f"{int(horas):02d}:{minutos}"


def verificar_fidelidade(texto: str, fatos: Any) -> list[str]:
    """Devolve os trechos do texto sem respaldo nos fatos. Lista vazia = texto fiel."""
    base = " ".join(_achatar(fatos))
    horarios_base = {_normalizar_horario(h) for h in _HORARIO.findall(base)}
    sem_respaldo = [h for h in _HORARIO.findall(texto) if _normalizar_horario(h) not in horarios_base]
    sem_respaldo += [d for d in _DATA.findall(texto) if d not in base]
    if "R$" in texto:
        sem_respaldo.append("R$")
    return sem_respaldo


def renderizar_modelo(nome: str, slots: dict[str, Any]) -> str:
    return MODELOS[nome].format(**slots)


class TextoRedigido(BaseModel):
    texto: str = Field(min_length=1, max_length=700)


class MensagemRedigida(BaseModel):
    texto: str
    origem: Literal["llm", "modelo"]
    modelo: str


SISTEMA = """Você reescreve mensagens de um assistente de RH para funcionários e gestores.
Escreva em português do Brasil, cordial e curto. Mantenha o sentido do texto-base.
Não acrescente horários, datas, valores ou fatos. Nunca sugira o horário que está faltando."""


def redigir_mensagem(llm: LLM, modelo: str, slots: dict[str, Any]) -> MensagemRedigida:
    base = renderizar_modelo(modelo, slots)
    saida = estruturar(
        llm,
        sistema=SISTEMA,
        usuario=f"Texto-base:\n{base}",
        modelo=TextoRedigido,
        nome="registrar_mensagem",
        descricao="Registra a mensagem reescrita.",
    )
    if saida is not None and not verificar_fidelidade(saida.texto, slots):
        return MensagemRedigida(texto=saida.texto, origem="llm", modelo=modelo)
    return MensagemRedigida(texto=base, origem="modelo", modelo=modelo)
