from datetime import date, datetime

from ia.card import montar_card
from ia.fila import Tarefa, Urgencia
from ia.llm import ErroLLM
from ia.relatorio import ResumoCaso
from tests.fakes import LLMRoteirizado

AGORA = datetime(2026, 11, 24, 15, 0)
TAREFA = Tarefa(id="T-15", caso_id="C-15", empresa_id="E1", criada_em=AGORA, prazo=datetime(2026, 11, 25, 9, 0))
ACOES = ["confirmar_18_30", "confirmar_17_00", "pedir_esclarecimento"]
CASO = ResumoCaso(
    caso_id="C-15",
    funcionario="Joana Pereira",
    data=date(2026, 11, 19),
    ocorrencia="saída não registrada",
    tentativas=["pedido à funcionária em 24/11 09:10", "aprovação pedida à gestora em 24/11 09:40"],
    respostas=["funcionária informou 18:30", "gestora informou 17:00"],
    motivo_nao_resolucao="versões conflitantes entre funcionária e gestora",
    informacao_ausente="horário efetivo de saída",
    proxima_acao="DP confere a saída antes do fechamento",
    responsavel="DP",
    prazo=date(2026, 11, 25),
    evidencias=["espelho:V15:2026-11-19:v1", "msg:M-881", "aprovacao:A-112"],
)


def _texto(titulo="Joana · saída de 19/11 · versões conflitantes",
           decisao="Confirmar a saída: 18:30 (funcionária) ou 17:00 (gestora).",
           resumo="A funcionária informou 18:30 e a gestora 17:00. Nenhuma alteração aplicada."):
    return {"titulo": titulo, "decisao_necessaria": decisao, "resumo": resumo}


def test_card_usa_o_texto_do_modelo_quando_fiel():
    card = montar_card(LLMRoteirizado([_texto()]), CASO, TAREFA, AGORA, acoes=ACOES)
    assert card.origem_texto == "llm"
    assert card.decisao_necessaria.startswith("Confirmar a saída")


def test_urgencia_evidencias_e_acoes_vem_do_codigo():
    card = montar_card(LLMRoteirizado([_texto()]), CASO, TAREFA, AGORA, acoes=ACOES)
    assert card.urgencia is Urgencia.P0
    assert card.motivo_urgencia == "prazo em 18h"
    assert card.evidencias == CASO.evidencias
    assert card.acoes == ACOES


def test_card_com_horario_inventado_cai_para_o_texto_fixo():
    card = montar_card(LLMRoteirizado([_texto(decisao="Confirmar a saída às 17:45.")]), CASO, TAREFA, AGORA, acoes=ACOES)
    assert card.origem_texto == "modelo"
    assert "17:45" not in card.decisao_necessaria


def test_card_sem_modelo_usa_o_texto_fixo():
    card = montar_card(LLMRoteirizado([ErroLLM("x"), ErroLLM("x")]), CASO, TAREFA, AGORA, acoes=ACOES)
    assert card.origem_texto == "modelo"
    assert "Joana Pereira" in card.titulo
