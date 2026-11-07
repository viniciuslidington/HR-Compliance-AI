from pathlib import Path

from ia.llm import ErroLLM
from ia.playbook import carregar_playbook
from ia.proximo_passo import acoes_permitidas, propor_proxima_acao
from tests.fakes import LLMRoteirizado

V1 = carregar_playbook(Path(__file__).resolve().parents[2] / "contracts" / "playbooks" / "marcacao_impar.v1.yaml")
CONTEXTO = {"caso_id": "C-1", "ajustes_existentes": [], "marcacoes": ["08:03", "12:00", "13:01"]}


def _proposta(acao):
    return {"acao": acao, "justificativa": "sem ajuste registrado; falta a saída"}


def test_em_investigacao_permite_perguntar_descartar_ou_escalar_mas_nao_aplicar():
    permitidas = acoes_permitidas(V1, "em_investigacao")
    assert {"send_request", "descartar_com_fundamento", "create_exception_task"} <= permitidas
    assert "apply_adjustment" not in permitidas


def test_escalar_e_sempre_permitido_mesmo_fora_dos_passos():
    assert "create_exception_task" in acoes_permitidas(V1, "aguardando_funcionario")


def test_proposta_permitida_e_aceita():
    resultado = propor_proxima_acao(LLMRoteirizado([_proposta("send_request")]), V1, "em_investigacao", CONTEXTO)
    assert resultado.acao == "send_request"
    assert resultado.origem == "llm"


def test_lista_de_acoes_permitidas_vai_no_prompt():
    llm = LLMRoteirizado([_proposta("send_request")])
    propor_proxima_acao(llm, V1, "em_investigacao", CONTEXTO)
    assert "send_request" in llm.chamadas[0]["usuario"]


def test_acao_nao_permitida_e_recusada_e_o_modelo_tenta_de_novo():
    llm = LLMRoteirizado([_proposta("apply_adjustment"), _proposta("send_request")])
    resultado = propor_proxima_acao(llm, V1, "em_investigacao", CONTEXTO)
    assert resultado.acao == "send_request"
    assert resultado.recusadas == ["apply_adjustment"]


def test_duas_propostas_invalidas_escalam():
    llm = LLMRoteirizado([_proposta("apply_adjustment"), _proposta("pagar_diferenca")])
    resultado = propor_proxima_acao(llm, V1, "em_investigacao", CONTEXTO)
    assert resultado.acao == "create_exception_task"
    assert resultado.origem == "backend"


def test_modelo_fora_do_ar_escala():
    llm = LLMRoteirizado([ErroLLM("x"), ErroLLM("x"), ErroLLM("x"), ErroLLM("x")])
    resultado = propor_proxima_acao(llm, V1, "em_investigacao", CONTEXTO)
    assert resultado.acao == "create_exception_task"
    assert resultado.origem == "backend"
