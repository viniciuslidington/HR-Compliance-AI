from datetime import date

import pytest
from fastapi.testclient import TestClient

from api import criar_app
from ia.llm import ErroLLM
from tests.fakes import LLMRoteirizado
from tests.test_documentos import TRANSCRICAO_NR35, TranscritorFixo, _extracao_llm

HOJE = date(2026, 11, 7)
PNG = ("cert.png", b"\x89PNG certificado", "image/png")


class TranscritorQuebrado:
    def transcrever(self, imagem, mime):
        raise ErroLLM("visão fora do ar")


def _cliente(tmp_path, *, respostas=None, transcritor=None, token=None):
    app = criar_app(
        dados_dir=tmp_path,
        transcritor=transcritor or TranscritorFixo(TRANSCRICAO_NR35),
        llm=LLMRoteirizado(list(respostas or [])),
        hoje=lambda: HOJE,
        api_token=token,
    )
    return TestClient(app)


def _status(cliente, pessoa):
    return {i["tipo"]: i["status"] for i in cliente.get(f"/pessoas/{pessoa}/matriz").json()["itens"]}


def test_saude_responde_sem_expor_a_chave(tmp_path):
    corpo = _cliente(tmp_path).get("/saude").json()
    assert corpo["status"] == "ok"
    assert "FEATHERLESS_API_KEY" not in str(corpo)


def test_saude_diz_se_a_chave_do_featherless_esta_configurada(tmp_path, monkeypatch):
    monkeypatch.delenv("FEATHERLESS_API_KEY", raising=False)
    assert _cliente(tmp_path).get("/saude").json()["chave_featherless_configurada"] is False
    monkeypatch.setenv("FEATHERLESS_API_KEY", "sk-secreta")
    corpo = _cliente(tmp_path).get("/saude").json()
    assert corpo["chave_featherless_configurada"] is True
    assert "sk-secreta" not in str(corpo)


def test_falha_de_leitura_devolve_o_motivo_tecnico(tmp_path):
    cliente = _cliente(tmp_path, transcritor=TranscritorQuebrado())
    corpo = cliente.post("/pessoas/F-12/documentos", params={"tipo": "nr35"}, files={"arquivo": PNG}).json()
    assert corpo["erro_tecnico"] == "visão fora do ar"


def test_lista_as_pessoas_do_seed(tmp_path):
    ids = {p["id"] for p in _cliente(tmp_path).get("/pessoas").json()}
    assert {"F-12", "F-31", "F-40"} <= ids


def test_matriz_comeca_com_tudo_faltando(tmp_path):
    assert _status(_cliente(tmp_path), "F-12") == {"aso": "faltando", "nr10": "faltando", "nr35": "faltando"}


def test_pessoa_inexistente_da_404(tmp_path):
    assert _cliente(tmp_path).get("/pessoas/F-999/matriz").status_code == 404


def test_envio_de_certificado_le_confere_e_aguarda_aprovacao(tmp_path):
    cliente = _cliente(tmp_path, respostas=[_extracao_llm()])
    resposta = cliente.post("/pessoas/F-12/documentos", params={"tipo": "nr35"}, files={"arquivo": PNG})
    assert resposta.status_code == 200
    corpo = resposta.json()
    assert corpo["decisao"] == "pedir_aprovacao"
    assert corpo["validade_ate"] == "2026-12-03"
    assert _status(cliente, "F-12")["nr35"] == "faltando"  # ainda não aprovado


def test_aprovacao_atualiza_a_matriz(tmp_path):
    cliente = _cliente(tmp_path, respostas=[_extracao_llm()])
    anexo_id = cliente.post("/pessoas/F-12/documentos", params={"tipo": "nr35"}, files={"arquivo": PNG}).json()["anexo_id"]
    assert cliente.post(f"/anexos/{anexo_id}/aprovar", json={"aprovador": "dp-ana"}).status_code == 200
    assert _status(cliente, "F-12")["nr35"] == "a_vencer"


def test_aprovar_duas_vezes_da_conflito(tmp_path):
    cliente = _cliente(tmp_path, respostas=[_extracao_llm()])
    anexo_id = cliente.post("/pessoas/F-12/documentos", params={"tipo": "nr35"}, files={"arquivo": PNG}).json()["anexo_id"]
    cliente.post(f"/anexos/{anexo_id}/aprovar", json={"aprovador": "dp-ana"})
    assert cliente.post(f"/anexos/{anexo_id}/aprovar", json={"aprovador": "dp-ana"}).status_code == 409


def test_documento_que_o_cargo_nao_exige_da_400(tmp_path):
    resposta = _cliente(tmp_path).post("/pessoas/F-40/documentos", params={"tipo": "nr35"}, files={"arquivo": PNG})
    assert resposta.status_code == 400


def test_arquivo_que_nao_e_imagem_da_415(tmp_path):
    resposta = _cliente(tmp_path).post(
        "/pessoas/F-12/documentos", params={"tipo": "nr35"}, files={"arquivo": ("x.txt", b"oi", "text/plain")}
    )
    assert resposta.status_code == 415


def test_visao_fora_do_ar_escala_e_guarda_o_anexo(tmp_path):
    cliente = _cliente(tmp_path, transcritor=TranscritorQuebrado())
    corpo = cliente.post("/pessoas/F-12/documentos", params={"tipo": "nr35"}, files={"arquivo": PNG}).json()
    assert corpo["decisao"] == "escalar"
    assert cliente.get(f"/anexos/{corpo['anexo_id']}").json()["status"] == "escalar"


def test_aso_vai_para_o_prefixo_sensivel_e_sem_transcricao(tmp_path):
    extracao = {
        "tipo": "aso", "nome": "Carlos Alberto Souza", "cpf": "123.456.789-09", "data_realizacao": "2026-03-10",
        "aso_resultado": "apto", "aso_funcoes": [], "medico_crm": "CRM-SP 123456",
    }
    transcricao = "ASO. Carlos Alberto Souza, CPF 123.456.789-09. Apto. 10/03/2026. CRM-SP 123456"
    cliente = _cliente(tmp_path, transcritor=TranscritorFixo(transcricao), respostas=[extracao])
    anexo_id = cliente.post("/pessoas/F-12/documentos", params={"tipo": "aso"}, files={"arquivo": PNG}).json()["anexo_id"]
    anexo = cliente.get(f"/anexos/{anexo_id}").json()
    assert anexo["chave"].startswith("demo/sensivel/")
    assert anexo["transcricao"] is None


@pytest.mark.parametrize("cabecalho, esperado", [({}, 401), ({"Authorization": "Bearer errado"}, 401)])
def test_escrita_exige_token_quando_configurado(tmp_path, cabecalho, esperado):
    cliente = _cliente(tmp_path, token="segredo")
    resposta = cliente.post(
        "/pessoas/F-12/documentos", params={"tipo": "nr35"}, files={"arquivo": PNG}, headers=cabecalho
    )
    assert resposta.status_code == esperado


def test_escrita_com_token_certo_passa(tmp_path):
    cliente = _cliente(tmp_path, token="segredo", respostas=[_extracao_llm()])
    resposta = cliente.post(
        "/pessoas/F-12/documentos", params={"tipo": "nr35"}, files={"arquivo": PNG},
        headers={"Authorization": "Bearer segredo"},
    )
    assert resposta.status_code == 200


def test_leitura_nao_exige_token(tmp_path):
    assert _cliente(tmp_path, token="segredo").get("/pessoas/F-12/matriz").status_code == 200
