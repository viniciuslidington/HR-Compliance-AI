from pathlib import Path

import yaml

from ia.compilador import CasoHistorico, compilar_playbook, simular_playbook
from ia.estrategico import AchadoAutonomia, elegivel, propor_versao_autonoma, redigir_sugestao
from ia.llm import ErroLLM
from ia.playbook import TetoPolitica, carregar_playbook, validar_playbook
from tests.fakes import LLMRoteirizado

CONTRATOS = Path(__file__).resolve().parents[2] / "contracts" / "playbooks"
V1 = carregar_playbook(CONTRATOS / "marcacao_impar.v1.yaml")
V2 = carregar_playbook(CONTRATOS / "marcacao_impar.v2.yaml")
TETO = TetoPolitica()
TEXTO_DP = "Quando faltar a saída, pergunta pro funcionário; se bater com a escala em até 5 minutos, pode lançar."


def _yaml_como_dict(nome):
    return yaml.safe_load((CONTRATOS / nome).read_text(encoding="utf-8"))


# ---------- compilador ----------


def test_compilacao_valida_gera_rascunho_com_versao_definida_pelo_codigo():
    saida_llm = _yaml_como_dict("marcacao_impar.v2.yaml") | {"versao": 99}
    resultado = compilar_playbook(LLMRoteirizado([saida_llm]), TEXTO_DP, base=V1, teto=TETO, ativos=[V1])
    assert resultado.pode_ativar
    assert resultado.rascunho.versao == 2


def test_compilacao_mantem_o_id_do_playbook_base():
    saida_llm = _yaml_como_dict("marcacao_impar.v2.yaml") | {"playbook": "outro_nome"}
    resultado = compilar_playbook(LLMRoteirizado([saida_llm]), TEXTO_DP, base=V1, teto=TETO, ativos=[V1])
    assert resultado.rascunho.playbook == "marcacao_impar"


def test_compilacao_com_acao_proibida_nao_pode_ser_ativada():
    saida_llm = _yaml_como_dict("marcacao_impar.v1.yaml")
    saida_llm["passos"][4]["acao"] = "pagar_diferenca"
    resultado = compilar_playbook(LLMRoteirizado([saida_llm]), TEXTO_DP, base=V1, teto=TETO, ativos=[V1])
    assert not resultado.pode_ativar
    assert "acao_fora_do_catalogo" in {e.codigo for e in resultado.erros}


def test_compilacao_sem_modelo_devolve_erro_e_nenhum_rascunho():
    resultado = compilar_playbook(LLMRoteirizado([ErroLLM("x"), ErroLLM("x")]), TEXTO_DP, base=V1, teto=TETO, ativos=[])
    assert resultado.rascunho is None
    assert {e.codigo for e in resultado.erros} == {"compilacao_indisponivel"}


def test_simulacao_conta_o_que_a_versao_teria_fechado_sozinha():
    escala = ["08:00", "12:00", "13:00", "17:00"]
    historico = [
        CasoHistorico(escala=escala, marcacoes=["08:00", "12:00", "13:00"], horario_informado="17:03", informado_por="funcionario"),
        CasoHistorico(escala=escala, marcacoes=["08:00", "12:00", "13:00"], horario_informado="18:30", informado_por="funcionario"),
        CasoHistorico(escala=escala, marcacoes=["08:01", "12:00", "13:00"], horario_informado="17:02", informado_por="funcionario"),
    ]
    sim = simular_playbook(V2, TETO, historico)
    assert (sim.total, sim.autoaplicaria, sim.iria_para_aprovacao) == (3, 2, 1)
    assert simular_playbook(V1, TETO, historico).autoaplicaria == 0


# ---------- estratégico ----------

ACHADO = AchadoAutonomia(
    categoria="saida_esquecida_ate_5_min",
    aprovador_nome="Gestora G2",
    janela_dias=90,
    decisoes=49,
    aprovadas_na_primeira=48,
    reaberturas=0,
    playbook="marcacao_impar",
    versao_atual=1,
)


def test_achado_com_volume_e_taxa_suficientes_e_elegivel():
    assert elegivel(ACHADO)


def test_achado_com_reabertura_nao_e_elegivel():
    assert not elegivel(ACHADO.model_copy(update={"reaberturas": 1}))


def test_achado_com_pouco_volume_nao_e_elegivel():
    assert not elegivel(ACHADO.model_copy(update={"decisoes": 12, "aprovadas_na_primeira": 12}))


def test_versao_proposta_fica_no_teto_e_passa_na_validacao():
    proposta = propor_versao_autonoma(V1, TETO)
    assert proposta.versao == 2
    assert proposta.autonomia == V2.autonomia
    assert validar_playbook(proposta, TETO, ativos=[V1]) == []


def test_sugestao_fiel_aos_numeros_e_usada():
    texto = "A Gestora G2 aprovou 48 de 49 ajustes desse tipo em 90 dias, sem reaberturas. Sugiro a versão 2."
    sugestao = redigir_sugestao(LLMRoteirizado([{"titulo": "Autonomia para saídas esquecidas", "texto": texto}]), ACHADO, TETO, base=V1)
    assert sugestao.origem == "llm"
    assert sugestao.rascunho.versao == 2


def test_sugestao_com_numero_inventado_cai_para_o_texto_fixo():
    texto = "Isso economiza 40 horas do DP por mês."
    sugestao = redigir_sugestao(LLMRoteirizado([{"titulo": "Economia", "texto": texto}]), ACHADO, TETO, base=V1)
    assert sugestao.origem == "modelo"
    assert "40 horas" not in sugestao.texto
