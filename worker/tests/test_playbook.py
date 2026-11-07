from pathlib import Path

import pytest

from ia.autonomia import pode_autoaplicar
from ia.playbook import TetoPolitica, carregar_playbook, validar_playbook

CONTRATOS = Path(__file__).resolve().parents[2] / "contracts" / "playbooks"
TETO = TetoPolitica()
ESCALA = ["08:00", "12:00", "13:00", "17:00"]


@pytest.fixture
def v1():
    return carregar_playbook(CONTRATOS / "marcacao_impar.v1.yaml")


@pytest.fixture
def v2():
    return carregar_playbook(CONTRATOS / "marcacao_impar.v2.yaml")


def _codigos(erros):
    return {e.codigo for e in erros}


# ---------- validação ----------


def test_playbooks_do_contrato_sao_validos(v1, v2):
    assert validar_playbook(v1, TETO, ativos=[]) == []
    assert validar_playbook(v2, TETO, ativos=[v1]) == []


def test_acao_fora_do_catalogo_e_recusada(v1):
    v1.passos[0].acao = "pagar_diferenca"
    assert "acao_fora_do_catalogo" in _codigos(validar_playbook(v1, TETO, ativos=[]))


def test_tolerancia_acima_do_teto_e_recusada(v2):
    v2.autonomia.autoaplicar_quando.diferenca_max_minutos_vs_escala = 10
    assert "autonomia_acima_do_teto" in _codigos(validar_playbook(v2, TETO, ativos=[]))


def test_autoaplicar_com_hora_extra_e_recusado(v2):
    v2.autonomia.autoaplicar_quando.gera_hora_extra = True
    assert "autonomia_acima_do_teto" in _codigos(validar_playbook(v2, TETO, ativos=[]))


def test_autoaplicar_exige_notificacao_e_janela_de_contestacao(v2):
    v2.autonomia.apos_autoaplicar = None
    assert "autoaplicacao_sem_contestacao" in _codigos(validar_playbook(v2, TETO, ativos=[]))


def test_outro_playbook_com_mesmo_gatilho_e_recusado(v1, v2):
    v2.playbook = "outro_playbook"
    assert "gatilho_sobreposto" in _codigos(validar_playbook(v2, TETO, ativos=[v1]))


def test_gatilho_sobreposto_com_prioridade_diferente_e_aceito(v1, v2):
    v2.playbook = "outro_playbook"
    v2.prioridade = 10
    assert validar_playbook(v2, TETO, ativos=[v1]) == []


# ---------- autoaplicação (art. 58 §1º) ----------


def test_v2_autoaplica_horario_do_proprio_funcionario_dentro_da_tolerancia(v2):
    decisao = pode_autoaplicar(
        v2, TETO, escala=ESCALA, marcacoes=["08:00", "12:00", "13:00"], horario_proposto="17:03", informado_por="funcionario"
    )
    assert decisao.permitido
    assert (decisao.playbook, decisao.versao) == ("marcacao_impar", 2)


def test_v1_nunca_autoaplica(v1):
    decisao = pode_autoaplicar(
        v1, TETO, escala=ESCALA, marcacoes=["08:00", "12:00", "13:00"], horario_proposto="17:03", informado_por="funcionario"
    )
    assert not decisao.permitido


def test_diferenca_acima_de_5_minutos_vai_para_o_gestor(v2):
    decisao = pode_autoaplicar(
        v2, TETO, escala=ESCALA, marcacoes=["08:00", "12:00", "13:00"], horario_proposto="18:30", informado_por="funcionario"
    )
    assert not decisao.permitido
    assert decisao.motivo == "diferenca_acima_da_tolerancia"


def test_soma_diaria_acima_de_10_minutos_vai_para_o_gestor(v2):
    decisao = pode_autoaplicar(
        v2, TETO, escala=ESCALA, marcacoes=["07:56", "12:04", "13:04"], horario_proposto="17:04", informado_por="funcionario"
    )
    assert not decisao.permitido
    assert decisao.motivo == "variacao_diaria_acima_de_10_min"


def test_horario_informado_por_outra_pessoa_nao_autoaplica(v2):
    decisao = pode_autoaplicar(
        v2, TETO, escala=ESCALA, marcacoes=["08:00", "12:00", "13:00"], horario_proposto="17:03", informado_por="gestor"
    )
    assert not decisao.permitido
