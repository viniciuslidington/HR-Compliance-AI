"""Fila do DP: urgência, distribuição e SLA. Tudo determinístico, sem LLM.

Quem recebe uma tarefa precisa poder perguntar "por que caiu comigo?" e ouvir
uma regra. Ordem de decisão:
1. Urgência: P0 se o prazo vence em até 24h ou o caso mexe em pagamento;
   P1 até 72h; P2 no resto.
2. Elegíveis: presentes, com escopo da empresa e abaixo do limite de tarefas.
3. Menor carga ponderada (P0 pesa 3, P1 pesa 2, P2 pesa 1).
4. Empate: round robin a partir do último atribuído (ponteiro persistente).
5. SLA: P0 não aceito em 2h é reatribuído e a liderança é avisada.
"""

from __future__ import annotations

from datetime import datetime, timedelta
from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field


class Urgencia(str, Enum):
    P0 = "P0"
    P1 = "P1"
    P2 = "P2"


PESO = {Urgencia.P0: 3, Urgencia.P1: 2, Urgencia.P2: 1}
ORDEM = {Urgencia.P0: 0, Urgencia.P1: 1, Urgencia.P2: 2}
SLA_ACEITE = {Urgencia.P0: timedelta(hours=2)}


class Tarefa(BaseModel):
    id: str
    caso_id: str
    empresa_id: str
    criada_em: datetime
    prazo: datetime
    mexe_em_pagamento: bool = False
    atribuida_a: str | None = None
    atribuida_em: datetime | None = None
    aceita_em: datetime | None = None
    status: Literal["aberta", "em_andamento", "concluida"] = "aberta"


class Analista(BaseModel):
    id: str
    nome: str
    escopo_empresas: set[str] = Field(default_factory=set)  # vazio = todas
    presente: bool = True
    limite_abertas: int = 8


class Atribuicao(BaseModel):
    tarefa_id: str
    analista_id: str | None
    motivo: str
    evento: Literal["task_assigned", "task_reassigned", "task_unassigned"]
    ponteiro: str | None
    avisar_lideranca: bool = False


def classificar_urgencia(tarefa: Tarefa, agora: datetime) -> tuple[Urgencia, str]:
    restante = tarefa.prazo - agora
    horas = int(restante.total_seconds() // 3600)
    if restante <= timedelta(0):
        return Urgencia.P0, "prazo vencido"
    if restante <= timedelta(hours=24):
        return Urgencia.P0, f"prazo em {horas}h"
    if tarefa.mexe_em_pagamento:
        return Urgencia.P0, "mexe em pagamento"
    if restante <= timedelta(hours=72):
        return Urgencia.P1, f"prazo em {horas}h"
    return Urgencia.P2, f"prazo em {restante.days} dias"


def ordenar(tarefas: list[Tarefa], agora: datetime) -> list[Tarefa]:
    return sorted(tarefas, key=lambda t: (ORDEM[classificar_urgencia(t, agora)[0]], t.prazo, t.criada_em))


def _abertas_de(analista_id: str, tarefas: list[Tarefa]) -> list[Tarefa]:
    return [t for t in tarefas if t.atribuida_a == analista_id and t.status != "concluida"]


def _carga(analista_id: str, tarefas: list[Tarefa], agora: datetime) -> int:
    return sum(PESO[classificar_urgencia(t, agora)[0]] for t in _abertas_de(analista_id, tarefas))


def _proximo_no_rodizio(empatados: list[str], ponteiro: str | None) -> str:
    ordenados = sorted(empatados)
    if ponteiro is None:
        return ordenados[0]
    depois = [i for i in ordenados if i > ponteiro]
    return depois[0] if depois else ordenados[0]


def atribuir(
    tarefa: Tarefa,
    analistas: list[Analista],
    tarefas_abertas: list[Tarefa],
    agora: datetime,
    *,
    ponteiro: str | None,
    excluir: set[str] | None = None,
    evento: Literal["task_assigned", "task_reassigned"] = "task_assigned",
) -> Atribuicao:
    outras = [t for t in tarefas_abertas if t.id != tarefa.id]
    elegiveis = [
        a
        for a in analistas
        if a.presente
        and a.id not in (excluir or set())
        and (not a.escopo_empresas or tarefa.empresa_id in a.escopo_empresas)
        and len(_abertas_de(a.id, outras)) < a.limite_abertas
    ]
    if not elegiveis:
        return Atribuicao(
            tarefa_id=tarefa.id,
            analista_id=None,
            motivo="sem analista elegível (ausência, escopo ou limite)",
            evento="task_unassigned",
            ponteiro=ponteiro,
            avisar_lideranca=True,
        )
    cargas = {a.id: _carga(a.id, outras, agora) for a in elegiveis}
    menor = min(cargas.values())
    empatados = [i for i, c in cargas.items() if c == menor]
    escolhido = _proximo_no_rodizio(empatados, ponteiro)
    motivo = f"menor carga ({menor})" + (" e vez no rodízio" if len(empatados) > 1 else "")
    return Atribuicao(
        tarefa_id=tarefa.id,
        analista_id=escolhido,
        motivo=motivo,
        evento=evento,
        ponteiro=escolhido,
        avisar_lideranca=evento == "task_reassigned",
    )


def verificar_sla(
    tarefa: Tarefa,
    analistas: list[Analista],
    tarefas_abertas: list[Tarefa],
    agora: datetime,
    *,
    ponteiro: str | None,
) -> Atribuicao | None:
    """Reatribui se a tarefa estourou o prazo de aceite da sua urgência. None = nada a fazer."""
    if tarefa.atribuida_a is None or tarefa.aceita_em is not None or tarefa.atribuida_em is None:
        return None
    limite = SLA_ACEITE.get(classificar_urgencia(tarefa, agora)[0])
    if limite is None or agora - tarefa.atribuida_em <= limite:
        return None
    return atribuir(
        tarefa,
        analistas,
        tarefas_abertas,
        agora,
        ponteiro=ponteiro,
        excluir={tarefa.atribuida_a},
        evento="task_reassigned",
    )
