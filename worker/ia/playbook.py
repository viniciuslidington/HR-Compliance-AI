"""Playbooks (contrato C4): procedimentos do DP como dados versionados.

Princípio: um playbook só escolhe e restringe; nunca concede. Ele só usa ações do
catálogo fechado e só autoaplica dentro do teto da política do cliente.
"""

from __future__ import annotations

from pathlib import Path
from typing import Literal

import yaml
from pydantic import BaseModel, Field

# Ações que existem como ferramenta. Pagamento, desconto, contrato, disciplina,
# fechamento de folha e eSocial não estão aqui: não há como um playbook pedi-las.
CATALOGO_ACOES = frozenset(
    {
        "get_case_context",
        "get_schedule",
        "get_punches",
        "get_adjustments",
        "get_rule",
        "get_destination_status",
        "open_case",
        "send_request",
        "send_reminder",
        "create_proposal",
        "create_approval_request",
        "apply_adjustment",
        "register_justification",
        "create_exception_task",
        "generate_report",
        "schedule_check",
        "descartar_com_fundamento",
    }
)


class Gatilho(BaseModel):
    ocorrencia: Literal["R1", "R2", "R3"]
    dia_util: bool = True
    feriado: bool = False


class Passo(BaseModel):
    id: str
    acao: str
    destinatario: str | None = None
    modelo: str | None = None
    aprovador: str | None = None
    se_existir_ajuste_valido: str | None = None


class AutoaplicarQuando(BaseModel):
    informado_pelo_proprio_funcionario: bool = True
    diferenca_max_minutos_vs_escala: int = Field(ge=0)
    gera_hora_extra: bool = False


class AposAutoaplicar(BaseModel):
    notificar: str
    janela_contestacao: str


class Autonomia(BaseModel):
    autoaplicar_quando: AutoaplicarQuando | None = None
    apos_autoaplicar: AposAutoaplicar | None = None


class Regua(BaseModel):
    lembrete_apos: str
    escalar: str


class Playbook(BaseModel):
    playbook: str
    versao: int = Field(ge=1)
    prioridade: int = 0
    gatilho: Gatilho
    fatos_necessarios: list[str]
    passos: list[Passo] = Field(min_length=1)
    autonomia: Autonomia = Field(default_factory=Autonomia)
    regua: Regua
    escalar_quando: list[str]
    resolvido_quando: str


class TetoPolitica(BaseModel):
    """Limite máximo de autonomia definido pelo cliente. Nenhum playbook passa dele."""

    diferenca_max_minutos: int = 5  # CLT art. 58 §1º: até 5 min por marcação
    variacao_diaria_max_minutos: int = 10  # ... observado o limite de 10 min diários
    permite_hora_extra_autonoma: bool = False
    exige_informacao_do_proprio_funcionario: bool = True


class ErroValidacao(BaseModel):
    codigo: str
    detalhe: str


def carregar_playbook(caminho: str | Path) -> Playbook:
    return Playbook.model_validate(yaml.safe_load(Path(caminho).read_text(encoding="utf-8")))


def validar_playbook(pb: Playbook, teto: TetoPolitica, ativos: list[Playbook]) -> list[ErroValidacao]:
    """Devolve a lista de erros; lista vazia significa que a versão pode ser ativada."""
    erros: list[ErroValidacao] = []

    for passo in pb.passos:
        for acao in filter(None, [passo.acao, passo.se_existir_ajuste_valido]):
            if acao not in CATALOGO_ACOES:
                erros.append(ErroValidacao(codigo="acao_fora_do_catalogo", detalhe=f"{passo.id}: {acao}"))

    auto = pb.autonomia.autoaplicar_quando
    if auto is not None:
        if auto.diferenca_max_minutos_vs_escala > teto.diferenca_max_minutos:
            erros.append(
                ErroValidacao(
                    codigo="autonomia_acima_do_teto",
                    detalhe=f"tolerância {auto.diferenca_max_minutos_vs_escala} min > teto {teto.diferenca_max_minutos} min",
                )
            )
        if auto.gera_hora_extra and not teto.permite_hora_extra_autonoma:
            erros.append(ErroValidacao(codigo="autonomia_acima_do_teto", detalhe="autoaplicar com hora extra"))
        if teto.exige_informacao_do_proprio_funcionario and not auto.informado_pelo_proprio_funcionario:
            erros.append(
                ErroValidacao(codigo="autonomia_acima_do_teto", detalhe="autoaplicar sem informação do funcionário")
            )
        if pb.autonomia.apos_autoaplicar is None:
            erros.append(
                ErroValidacao(
                    codigo="autoaplicacao_sem_contestacao", detalhe="autoaplicar exige notificar e janela de contestação"
                )
            )

    for outro in ativos:
        if outro.playbook != pb.playbook and outro.gatilho == pb.gatilho and outro.prioridade == pb.prioridade:
            erros.append(
                ErroValidacao(
                    codigo="gatilho_sobreposto",
                    detalhe=f"mesmo gatilho e prioridade de '{outro.playbook}' v{outro.versao}",
                )
            )

    return erros
