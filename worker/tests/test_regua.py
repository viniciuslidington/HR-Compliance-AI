from datetime import date

from ia.matriz import ItemSituacao
from ia.regua import proxima_acao

VALIDADE = date(2026, 12, 3)
RENOVAR = date(2026, 10, 19)  # 45 dias antes


def item(status="a_vencer"):
    return ItemSituacao(tipo="nr35", status=status, validade_ate=VALIDADE, impedido_desde=VALIDADE, renovar_a_partir_de=RENOVAR)


def test_documento_valido_ou_faltando_nao_gera_acao():
    assert proxima_acao(item("valido"), date(2026, 9, 1), set()) is None
    assert proxima_acao(ItemSituacao(tipo="nr35", status="faltando"), date(2026, 11, 7), set()) is None


def test_dentro_da_janela_de_renovacao_manda_o_aviso():
    acao = proxima_acao(item(), date(2026, 11, 7), set())
    assert acao.etapa == "aviso_renovacao"
    assert acao.impedido_desde == VALIDADE


def test_aviso_ja_enviado_nao_repete():
    assert proxima_acao(item(), date(2026, 11, 7), {"aviso_renovacao"}) is None


def test_depois_da_metade_da_janela_manda_lembrete():
    assert proxima_acao(item(), date(2026, 11, 12), {"aviso_renovacao"}).etapa == "lembrete"


def test_dois_dias_antes_manda_lembrete_firme():
    assert proxima_acao(item(), date(2026, 12, 1), {"aviso_renovacao", "lembrete"}).etapa == "lembrete_firme"


def test_no_dia_do_vencimento_declara_impedimento():
    assert proxima_acao(item("vencido"), VALIDADE, {"aviso_renovacao", "lembrete", "lembrete_firme"}).etapa == "impedimento"


def test_agente_atrasado_pula_direto_para_a_etapa_mais_urgente():
    assert proxima_acao(item(), date(2026, 12, 2), set()).etapa == "lembrete_firme"


def test_impedimento_ja_declarado_nao_repete():
    assert proxima_acao(item("vencido"), date(2026, 12, 10), {"impedimento"}) is None
