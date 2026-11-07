"""Matriz de exigências por cargo e situação documental de cada pessoa.

Validade, data de impedimento e início da renovação são calculados aqui, a
partir da data de realização e da periodicidade da matriz. Nunca vêm do modelo.
"""

from __future__ import annotations

import calendar
from datetime import date, timedelta
from pathlib import Path
from typing import Literal

import yaml
from pydantic import BaseModel, Field

TipoDocumento = Literal["aso", "nr10", "nr35"]


class Exigencia(BaseModel):
    tipo: TipoDocumento
    validade_meses: int = Field(gt=0)
    antecedencia_dias: int = Field(ge=0)
    carga_minima_horas: int | None = None
    exige_responsavel_tecnico: bool = False
    aso_funcoes_exigidas: list[str] = Field(default_factory=list)


class Matriz(BaseModel):
    cargo: str
    versao: int = Field(ge=1)
    exigencias: list[Exigencia] = Field(min_length=1)

    def exigencia(self, tipo: str) -> Exigencia:
        for exigencia in self.exigencias:
            if exigencia.tipo == tipo:
                return exigencia
        raise KeyError(f"cargo {self.cargo} não exige {tipo}")


def carregar_matriz(caminho: str | Path) -> Matriz:
    return Matriz.model_validate(yaml.safe_load(Path(caminho).read_text(encoding="utf-8")))


def somar_meses(dia: date, meses: int) -> date:
    total = dia.month - 1 + meses
    ano, mes = dia.year + total // 12, total % 12 + 1
    return date(ano, mes, min(dia.day, calendar.monthrange(ano, mes)[1]))


class ItemSituacao(BaseModel):
    tipo: TipoDocumento
    status: Literal["valido", "a_vencer", "vencido", "faltando"]
    validade_ate: date | None = None
    impedido_desde: date | None = None
    renovar_a_partir_de: date | None = None


def situacao_matriz(matriz: Matriz, validades: dict[str, date], hoje: date) -> list[ItemSituacao]:
    """Situação de cada exigência do cargo, dado o vencimento dos documentos aceitos."""
    itens = []
    for exigencia in matriz.exigencias:
        validade = validades.get(exigencia.tipo)
        if validade is None:
            itens.append(ItemSituacao(tipo=exigencia.tipo, status="faltando"))
            continue
        renovar = validade - timedelta(days=exigencia.antecedencia_dias)
        if validade <= hoje:
            status = "vencido"
        elif hoje >= renovar:
            status = "a_vencer"
        else:
            status = "valido"
        itens.append(
            ItemSituacao(
                tipo=exigencia.tipo,
                status=status,
                validade_ate=validade,
                impedido_desde=validade,
                renovar_a_partir_de=renovar,
            )
        )
    return itens
