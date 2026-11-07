from datetime import datetime, timedelta

from ia.fila import Analista, Tarefa, Urgencia, atribuir, classificar_urgencia, ordenar, verificar_sla

AGORA = datetime(2026, 11, 24, 15, 0)
CORTE = datetime(2026, 11, 25, 9, 0)  # fechamento em 18h


def tarefa(id_, prazo=CORTE, mexe_em_pagamento=False, criada_em=AGORA - timedelta(hours=1), **extra):
    return Tarefa(
        id=id_,
        caso_id=f"C-{id_}",
        empresa_id=extra.pop("empresa_id", "E1"),
        criada_em=criada_em,
        prazo=prazo,
        mexe_em_pagamento=mexe_em_pagamento,
        **extra,
    )


ANA = Analista(id="ana", nome="Ana", escopo_empresas={"E1", "E2"})
BIA = Analista(id="bia", nome="Bia", escopo_empresas={"E1"})
CAIO = Analista(id="caio", nome="Caio", escopo_empresas={"E2"})


# ---------- urgência ----------


def test_fechamento_em_ate_24h_e_p0_com_motivo_legivel():
    urg, motivo = classificar_urgencia(tarefa("1"), AGORA)
    assert urg is Urgencia.P0
    assert motivo == "fechamento em 18h"


def test_mexer_em_pagamento_e_p0_mesmo_com_prazo_longe():
    urg, motivo = classificar_urgencia(tarefa("1", prazo=AGORA + timedelta(days=10), mexe_em_pagamento=True), AGORA)
    assert urg is Urgencia.P0
    assert motivo == "mexe em pagamento"


def test_fechamento_em_ate_72h_e_p1_e_depois_disso_p2():
    assert classificar_urgencia(tarefa("1", prazo=AGORA + timedelta(hours=48)), AGORA)[0] is Urgencia.P1
    assert classificar_urgencia(tarefa("1", prazo=AGORA + timedelta(days=5)), AGORA)[0] is Urgencia.P2


def test_ordem_e_urgencia_depois_prazo_depois_antiguidade():
    p2 = tarefa("p2", prazo=AGORA + timedelta(days=5))
    p0_novo = tarefa("p0_novo", criada_em=AGORA - timedelta(minutes=5))
    p0_antigo = tarefa("p0_antigo", criada_em=AGORA - timedelta(hours=3))
    p1 = tarefa("p1", prazo=AGORA + timedelta(hours=48))
    assert [t.id for t in ordenar([p2, p0_novo, p1, p0_antigo], AGORA)] == ["p0_antigo", "p0_novo", "p1", "p2"]


# ---------- atribuição ----------


def test_vai_para_quem_tem_menor_carga():
    abertas = [tarefa("x", atribuida_a="ana", atribuida_em=AGORA)]
    resultado = atribuir(tarefa("novo"), [ANA, BIA], abertas, AGORA, ponteiro=None)
    assert resultado.analista_id == "bia"


def test_carga_pesa_urgencia():
    abertas = [
        tarefa("a1", atribuida_a="ana", atribuida_em=AGORA),  # P0, peso 3
        tarefa("b1", prazo=AGORA + timedelta(days=5), atribuida_a="bia", atribuida_em=AGORA),  # P2, peso 1
        tarefa("b2", prazo=AGORA + timedelta(days=5), atribuida_a="bia", atribuida_em=AGORA),  # P2, peso 1
    ]
    assert atribuir(tarefa("novo"), [ANA, BIA], abertas, AGORA, ponteiro=None).analista_id == "bia"


def test_empate_usa_round_robin_a_partir_do_ponteiro():
    assert atribuir(tarefa("t"), [ANA, BIA], [], AGORA, ponteiro=None).analista_id == "ana"
    assert atribuir(tarefa("t"), [ANA, BIA], [], AGORA, ponteiro="ana").analista_id == "bia"
    assert atribuir(tarefa("t"), [ANA, BIA], [], AGORA, ponteiro="bia").analista_id == "ana"


def test_respeita_escopo_da_empresa():
    assert atribuir(tarefa("t", empresa_id="E2"), [BIA, CAIO], [], AGORA, ponteiro=None).analista_id == "caio"


def test_ignora_quem_esta_ausente():
    ausente = ANA.model_copy(update={"presente": False})
    assert atribuir(tarefa("t"), [ausente, BIA], [], AGORA, ponteiro=None).analista_id == "bia"


def test_ignora_quem_atingiu_o_limite_de_tarefas():
    cheia = BIA.model_copy(update={"limite_abertas": 1})
    abertas = [tarefa("x", prazo=AGORA + timedelta(days=5), atribuida_a="bia", atribuida_em=AGORA)]
    assert atribuir(tarefa("t"), [ANA, cheia], abertas, AGORA, ponteiro="ana").analista_id == "ana"


def test_sem_ninguem_elegivel_escala_para_a_lideranca():
    resultado = atribuir(tarefa("t", empresa_id="E9"), [ANA, BIA], [], AGORA, ponteiro=None)
    assert resultado.analista_id is None
    assert resultado.avisar_lideranca


def test_atribuicao_gera_evento_e_move_o_ponteiro():
    resultado = atribuir(tarefa("t"), [ANA, BIA], [], AGORA, ponteiro=None)
    assert resultado.evento == "task_assigned"
    assert resultado.ponteiro == "ana"


# ---------- SLA ----------


def test_p0_nao_aceito_em_2h_e_reatribuido_para_outra_pessoa():
    parada = tarefa("t", atribuida_a="ana", atribuida_em=AGORA - timedelta(hours=2, minutes=1))
    resultado = verificar_sla(parada, [ANA, BIA], [parada], AGORA, ponteiro="ana")
    assert resultado is not None
    assert resultado.analista_id == "bia"
    assert resultado.evento == "task_reassigned"
    assert resultado.avisar_lideranca


def test_p0_aceito_nao_e_reatribuido():
    aceita = tarefa("t", atribuida_a="ana", atribuida_em=AGORA - timedelta(hours=3), aceita_em=AGORA - timedelta(hours=2))
    assert verificar_sla(aceita, [ANA, BIA], [aceita], AGORA, ponteiro="ana") is None


def test_p2_parado_nao_estoura_sla_de_2h():
    calma = tarefa("t", prazo=AGORA + timedelta(days=5), atribuida_a="ana", atribuida_em=AGORA - timedelta(hours=3))
    assert verificar_sla(calma, [ANA, BIA], [calma], AGORA, ponteiro="ana") is None
