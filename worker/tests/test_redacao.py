from datetime import date

from ia.llm import ErroLLM
from ia.redacao import redigir_mensagem, renderizar_modelo, verificar_fidelidade
from ia.relatorio import ResumoCaso, redigir_relatorio_excecao
from tests.fakes import LLMRoteirizado

SLOTS = {"nome": "Marina", "data": "17/11", "dia_semana": "terça-feira", "marcacoes_registradas": "08:03, 12:00 e 13:01"}


def test_modelo_fixo_preenche_os_slots():
    texto = renderizar_modelo("pendencia_marcacao", SLOTS)
    assert "Marina" in texto and "17/11" in texto and "08:03, 12:00 e 13:01" in texto


def test_fidelidade_aponta_horario_que_nao_esta_nos_fatos():
    assert verificar_fidelidade("Você saiu às 17:00 no dia 17/11?", SLOTS) == ["17:00"]


def test_fidelidade_aponta_data_iso_inventada():
    fatos = {"data": date(2026, 11, 19)}
    assert verificar_fidelidade("Saída de 2026-11-19, prazo 2026-11-30.", fatos) == ["2026-11-30"]


def test_fidelidade_proibe_valor_em_reais():
    assert "R$" in verificar_fidelidade("Isso pode custar R$ 50", SLOTS)


def test_mensagem_redigida_fiel_e_usada():
    texto = "Oi Marina! No ponto de terça-feira (17/11) temos 08:03, 12:00 e 13:01. Qual foi seu horário de saída?"
    msg = redigir_mensagem(LLMRoteirizado([{"texto": texto}]), "pendencia_marcacao", SLOTS)
    assert msg.texto == texto
    assert msg.origem == "llm"


def test_mensagem_que_sugere_horario_cai_para_o_modelo_fixo():
    texto = "Oi Marina, você saiu às 17:00 no dia 17/11, certo?"
    msg = redigir_mensagem(LLMRoteirizado([{"texto": texto}]), "pendencia_marcacao", SLOTS)
    assert msg.origem == "modelo"
    assert msg.texto == renderizar_modelo("pendencia_marcacao", SLOTS)


def test_modelo_fora_do_ar_usa_o_modelo_fixo():
    msg = redigir_mensagem(LLMRoteirizado([ErroLLM("x"), ErroLLM("x")]), "pendencia_marcacao", SLOTS)
    assert msg.origem == "modelo"


RESUMO = ResumoCaso(
    caso_id="C-15",
    funcionario="Joana Pereira",
    data=date(2026, 11, 19),
    ocorrencia="saída não registrada",
    tentativas=["pedido ao funcionário em 24/11 09:10", "aprovação pedida à gestora em 24/11 09:40"],
    respostas=["funcionária informou 18:30", "gestora informou 17:00"],
    motivo_nao_resolucao="versões conflitantes entre funcionária e gestora",
    informacao_ausente="horário efetivo de saída",
    proxima_acao="DP confere a saída antes do fechamento",
    responsavel="DP",
    prazo=date(2026, 11, 25),
    evidencias=["espelho:V15:2026-11-19:v1", "msg:M-881", "aprovacao:A-112"],
)


def test_relatorio_usa_resumo_do_modelo_quando_fiel():
    resumo = "Saída de 19/11 não registrada. Joana informou 18:30 e a gestora informou 17:00. Nenhuma alteração aplicada."
    rel = redigir_relatorio_excecao(LLMRoteirizado([{"resumo": resumo}]), RESUMO)
    assert rel.resumo == resumo
    assert rel.origem_resumo == "llm"


def test_relatorio_descarta_resumo_com_horario_inventado():
    resumo = "Joana informou 18:30, a gestora 17:15."
    rel = redigir_relatorio_excecao(LLMRoteirizado([{"resumo": resumo}]), RESUMO)
    assert rel.origem_resumo == "modelo"
    assert "17:15" not in rel.resumo


def test_evidencias_e_responsavel_vem_do_codigo_nao_do_modelo():
    rel = redigir_relatorio_excecao(LLMRoteirizado([{"resumo": "Saída de 19/11 sem registro."}]), RESUMO)
    assert rel.evidencias == RESUMO.evidencias
    assert rel.responsavel == "DP"
    assert rel.prazo == date(2026, 11, 25)
