"""Fatos de um caso escalado para o DP, usados pelo card de decisão."""

from __future__ import annotations

from datetime import date

from pydantic import BaseModel


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
