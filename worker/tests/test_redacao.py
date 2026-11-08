from datetime import date

from ia.redacao import verificar_fidelidade

FATOS = {"nome": "Pedro", "data": "17/11", "horarios": "08:03, 12:00 e 13:01"}


def test_fidelidade_aponta_horario_que_nao_esta_nos_fatos():
    assert verificar_fidelidade("O treinamento foi às 17:00 no dia 17/11?", FATOS) == ["17:00"]


def test_fidelidade_aponta_data_iso_inventada():
    fatos = {"data": date(2026, 11, 19)}
    assert verificar_fidelidade("Realizado em 2026-11-19, vence em 2026-11-30.", fatos) == ["2026-11-30"]


def test_fidelidade_proibe_valor_em_reais():
    assert "R$" in verificar_fidelidade("Isso pode custar R$ 50", FATOS)
