"""Guarda de fidelidade para textos redigidos pelo LLM.

Um texto só é usado se cada horário e data citados existirem nos fatos do caso e não houver valores em reais.
"""

from __future__ import annotations

import re
from datetime import date
from typing import Any

_HORARIO = re.compile(r"\b\d{1,2}[:h]\d{2}\b")
_DATA = re.compile(r"\b\d{1,2}/\d{1,2}(?:/\d{2,4})?\b")
_DATA_ISO = re.compile(r"\b\d{4}-\d{2}-\d{2}\b")


def _achatar(valor: Any) -> list[str]:
    if isinstance(valor, dict):
        return [s for v in valor.values() for s in _achatar(v)]
    if isinstance(valor, (list, tuple, set)):
        return [s for v in valor for s in _achatar(v)]
    if isinstance(valor, date):
        return [valor.strftime("%d/%m/%Y"), valor.strftime("%d/%m"), valor.isoformat()]
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
    sem_respaldo += [d for d in _DATA_ISO.findall(texto) if d not in base]
    if "R$" in texto:
        sem_respaldo.append("R$")
    return sem_respaldo
