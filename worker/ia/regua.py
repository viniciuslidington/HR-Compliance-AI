"""Régua de renovação: qual contato fazer, e quando, antes de um documento vencer.

Etapas, da mais branda à mais urgente:
- aviso_renovacao: ao entrar na janela de antecedência da matriz;
- lembrete: a partir da metade da janela;
- lembrete_firme: a partir de 2 dias antes do vencimento;
- impedimento: no dia do vencimento sem documento novo (vira card P0).

Se o agente rodar atrasado, ele vai direto para a etapa mais urgente que já
vale, sem disparar as anteriores em sequência. Cada etapa sai uma vez por
documento (o chamador passa as etapas já enviadas para aquela validade).
"""

from __future__ import annotations

from datetime import date, timedelta
from typing import Literal

from pydantic import BaseModel

from ia.matriz import ItemSituacao

Etapa = Literal["aviso_renovacao", "lembrete", "lembrete_firme", "impedimento"]


class AcaoRegua(BaseModel):
    etapa: Etapa
    tipo: str
    impedido_desde: date


def proxima_acao(item: ItemSituacao, hoje: date, ja_enviadas: set[str]) -> AcaoRegua | None:
    if item.status not in ("a_vencer", "vencido") or item.validade_ate is None or item.renovar_a_partir_de is None:
        return None
    validade, inicio = item.validade_ate, item.renovar_a_partir_de
    metade = inicio + (validade - inicio) / 2
    marcos: list[tuple[Etapa, date]] = [
        ("impedimento", validade),
        ("lembrete_firme", validade - timedelta(days=2)),
        ("lembrete", metade),
        ("aviso_renovacao", inicio),
    ]
    for etapa, a_partir_de in marcos:
        if hoje >= a_partir_de:
            if etapa in ja_enviadas:
                return None
            return AcaoRegua(etapa=etapa, tipo=item.tipo, impedido_desde=validade)
    return None
