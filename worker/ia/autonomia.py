"""Decisão determinística de autoaplicação de ajuste.

Nenhum LLM participa daqui. A regra é a do playbook ativo, limitada pelo teto da
política: CLT art. 58 §1º, variações de até 5 min por marcação e 10 min por dia
não contam como hora extra nem desconto.
"""

from __future__ import annotations

from pydantic import BaseModel

from ia.playbook import Playbook, TetoPolitica


class DecisaoAutonomia(BaseModel):
    permitido: bool
    motivo: str
    playbook: str
    versao: int


def _minutos(hhmm: str) -> int:
    horas, minutos = hhmm.split(":")
    return int(horas) * 60 + int(minutos)


def pode_autoaplicar(
    pb: Playbook,
    teto: TetoPolitica,
    *,
    escala: list[str],
    marcacoes: list[str],
    horario_proposto: str,
    informado_por: str,
) -> DecisaoAutonomia:
    def decidir(permitido: bool, motivo: str) -> DecisaoAutonomia:
        return DecisaoAutonomia(permitido=permitido, motivo=motivo, playbook=pb.playbook, versao=pb.versao)

    regra = pb.autonomia.autoaplicar_quando
    if regra is None:
        return decidir(False, "playbook_sem_autoaplicacao")
    if regra.informado_pelo_proprio_funcionario and informado_por != "funcionario":
        return decidir(False, "informacao_nao_veio_do_funcionario")

    dia = sorted([*marcacoes, horario_proposto])
    if len(dia) != len(escala):
        return decidir(False, "marcacoes_incompativeis_com_escala")

    variacoes = [abs(_minutos(m) - _minutos(e)) for m, e in zip(dia, sorted(escala))]
    tolerancia = min(regra.diferenca_max_minutos_vs_escala, teto.diferenca_max_minutos)

    if variacoes[dia.index(horario_proposto)] > tolerancia:
        return decidir(False, "diferenca_acima_da_tolerancia")
    if any(v > teto.diferenca_max_minutos for v in variacoes):
        return decidir(False, "variacao_por_marcacao_acima_de_5_min")
    if sum(variacoes) > teto.variacao_diaria_max_minutos:
        return decidir(False, "variacao_diaria_acima_de_10_min")
    return decidir(True, "dentro_da_tolerancia_art_58")
