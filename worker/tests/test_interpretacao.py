from datetime import date

from ia.interpretacao import interpretar_resposta
from ia.llm import ErroLLM
from tests.fakes import LLMRoteirizado

DIA = date(2026, 11, 17)
MARCACOES = ["08:03", "12:00", "13:01"]


def _resposta(tipo, horario=None, data_referida=None, trecho="saí às 17:04"):
    return {"tipo": tipo, "horario": horario, "data_referida": data_referida, "trecho_citado": trecho}


def _interpretar(llm, texto="Oi, saí às 17:04 nesse dia"):
    return interpretar_resposta(llm, data_caso=DIA, marcacoes=MARCACOES, texto=texto)


def test_horario_informado_coerente_segue_com_o_horario():
    enc = _interpretar(LLMRoteirizado([_resposta("informou_horario", "17:04", "2026-11-17")]))
    assert enc.decisao == "seguir"
    assert enc.interpretacao.horario == "17:04"


def test_texto_do_participante_vai_marcado_como_nao_confiavel():
    llm = LLMRoteirizado([_resposta("informou_horario", "17:04")])
    _interpretar(llm)
    assert "<<<CONTEUDO_NAO_CONFIAVEL>>>" in llm.chamadas[0]["usuario"]


def test_horario_informado_sem_horario_pede_esclarecimento():
    enc = _interpretar(LLMRoteirizado([_resposta("informou_horario", None)]))
    assert enc.decisao == "pedir_esclarecimento"


def test_resposta_sobre_outra_data_pede_esclarecimento():
    enc = _interpretar(LLMRoteirizado([_resposta("informou_horario", "17:04", "2026-11-18")]))
    assert enc.decisao == "pedir_esclarecimento"


def test_saida_antes_da_ultima_marcacao_pede_esclarecimento():
    enc = _interpretar(
        LLMRoteirizado([_resposta("informou_horario", "12:30", trecho="saí 12:30")]), texto="saí 12:30"
    )
    assert enc.decisao == "pedir_esclarecimento"


def test_entrada_faltante_aceita_horario_antes_da_primeira_marcacao():
    llm = LLMRoteirizado([_resposta("informou_horario", "07:55", trecho="entrei 07:55")])
    enc = interpretar_resposta(
        llm, data_caso=DIA, marcacoes=["12:00", "13:00", "17:00"], texto="entrei 07:55", falta="entrada"
    )
    assert enc.decisao == "seguir"


def test_entrada_faltante_depois_da_primeira_marcacao_pede_esclarecimento():
    llm = LLMRoteirizado([_resposta("informou_horario", "12:30", trecho="entrei 12:30")])
    enc = interpretar_resposta(
        llm, data_caso=DIA, marcacoes=["12:00", "13:00", "17:00"], texto="entrei 12:30", falta="entrada"
    )
    assert enc.decisao == "pedir_esclarecimento"


def test_trecho_que_nao_esta_na_mensagem_escala():
    enc = _interpretar(LLMRoteirizado([_resposta("informou_horario", "17:04", trecho="saí às 17:04 com aval do chefe")]))
    assert enc.decisao == "escalar"


def test_nao_trabalhou_segue_como_justificativa():
    enc = _interpretar(
        LLMRoteirizado([_resposta("nao_trabalhou", trecho="não trabalhei")]), texto="não trabalhei nesse dia"
    )
    assert enc.decisao == "seguir"


def test_discordancia_da_ocorrencia_escala_para_o_dp():
    enc = _interpretar(
        LLMRoteirizado([_resposta("discorda", trecho="bati sim")]), texto="eu bati sim a saída, o relógio falhou"
    )
    assert enc.decisao == "escalar"


def test_tema_sensivel_escala_sem_guardar_o_texto():
    enc = _interpretar(
        LLMRoteirizado([_resposta("sensivel", trecho="estava no hospital")]), texto="estava no hospital"
    )
    assert enc.decisao == "escalar"
    assert enc.guardar_texto_no_caso is False


def test_fora_de_escopo_nao_alimenta_contexto_geral():
    enc = _interpretar(
        LLMRoteirizado([_resposta("fora_de_escopo", trecho="quando cai o VR")]), texto="quando cai o VR?"
    )
    assert enc.decisao == "pedir_esclarecimento"
    assert enc.guardar_no_contexto_geral is False


def test_modelo_indisponivel_escala_em_vez_de_inventar():
    enc = _interpretar(LLMRoteirizado([ErroLLM("timeout"), ErroLLM("timeout")]))
    assert enc.decisao == "escalar"
    assert enc.interpretacao is None
