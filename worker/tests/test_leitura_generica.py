from datetime import date

import pytest

from ia.leitura_generica import Candidato, ErroLeitura, ler_generico
from ia.llm import ErroLLM
from tests.fakes import LLMRoteirizado

RG = Candidato(id="rg_cnh", nome="RG ou CNH", campos=["nome", "numero", "data_nascimento", "filiacao", "validade_cnh"])
COMPROVANTE = Candidato(id="comprovante_residencia", nome="Comprovante de residência",
                        campos=["titular", "endereco", "data_emissao"])
BANCO = Candidato(id="dados_bancarios", nome="Dados bancários", campos=["banco", "agencia", "conta", "titular"])

TRANSCRICAO_RG = """REPÚBLICA FEDERATIVA DO BRASIL
CARTEIRA DE IDENTIDADE
NOME: MARIANA SOUZA LIMA
REGISTRO GERAL 12.345.678-9
DATA DE NASCIMENTO 14/03/1996
FILIAÇÃO ANA SOUZA / CARLOS LIMA"""

TRANSCRICAO_CONTA = """COMPANHIA DE ENERGIA
Titular: Mariana Souza Lima
Rua das Flores, 120 - Recife/PE
Emissão: 02/10/2026"""


class TranscritorFixo:
    def __init__(self, texto):
        self.texto = texto
        self.recebido = None

    def transcrever(self, imagem, mime):
        self.recebido = (imagem, mime)
        return self.texto


class TranscritorQuebrado:
    def transcrever(self, imagem, mime):
        raise ErroLLM("visão fora do ar")


def _ler(transcricao, resposta, candidatos=(RG, COMPROVANTE)):
    llm = LLMRoteirizado([resposta])
    return ler_generico(TranscritorFixo(transcricao), llm, b"img", "image/jpeg", list(candidatos)), llm


def test_identifica_o_tipo_e_extrai_os_campos_com_datas_iso():
    leitura, _ = _ler(TRANSCRICAO_RG, {
        "tipo": "rg_cnh", "legivel": True, "problema_legibilidade": None,
        "nome": "MARIANA SOUZA LIMA", "numero": "12.345.678-9", "data_nascimento": "1996-03-14",
        "filiacao": "ANA SOUZA / CARLOS LIMA", "validade_cnh": None,
        "titular": "não deveria aparecer",
    })
    assert leitura.tipo_documento_id == "rg_cnh"
    assert leitura.qualidade == "ok"
    assert leitura.dados_extraidos == {
        "nome": "MARIANA SOUZA LIMA", "numero": "12.345.678-9", "data_nascimento": "1996-03-14",
        "filiacao": "ANA SOUZA / CARLOS LIMA",
    }
    assert leitura.problemas_fidelidade == []


def test_campo_sem_respaldo_na_transcricao_e_descartado():
    leitura, _ = _ler(TRANSCRICAO_CONTA, {
        "tipo": "comprovante_residencia", "legivel": True, "problema_legibilidade": None,
        "titular": "Mariana Souza Lima", "endereco": "Rua das Flores, 120 - Recife/PE",
        "data_emissao": "2026-11-05",  # inventada: a conta diz 02/10/2026
    })
    assert "data_emissao" not in leitura.dados_extraidos
    assert leitura.problemas_fidelidade == ["data_emissao"]
    assert leitura.dados_extraidos["titular"] == "Mariana Souza Lima"


def test_numero_precisa_aparecer_na_transcricao():
    leitura, _ = _ler("Banco do Brasil\nAgência 1234\nConta 98765-4\nTitular Mariana Souza Lima", {
        "tipo": "dados_bancarios", "legivel": True, "problema_legibilidade": None,
        "banco": "Banco do Brasil", "agencia": "1234", "conta": "11111-1", "titular": "Mariana Souza Lima",
    }, candidatos=[BANCO])
    assert leitura.problemas_fidelidade == ["conta"]
    assert leitura.dados_extraidos == {"banco": "Banco do Brasil", "agencia": "1234", "titular": "Mariana Souza Lima"}


def test_documento_ilegivel_traz_o_detalhe():
    leitura, _ = _ler("[ilegível]", {"tipo": "rg_cnh", "legivel": False,
                                      "problema_legibilidade": "a foto está desfocada"})
    assert leitura.qualidade == "ilegivel"
    assert leitura.detalhe_qualidade == "a foto está desfocada"
    assert leitura.dados_extraidos == {}


def test_transcricao_quase_toda_ilegivel_vira_ilegivel_sem_chamar_o_modelo():
    borrada = "CUMENTO FIC\nDOCUMENTO\n[ilegível]\n[ilegível]\n[ilegível]\nCUMENTO FICTÍCIO — DEMO\n" * 3
    llm = LLMRoteirizado([])
    leitura = ler_generico(TranscritorFixo(borrada), llm, b"img", "image/png", [RG])
    assert leitura.qualidade == "ilegivel"
    assert leitura.detalhe_qualidade == "a imagem está borrada"
    assert llm.chamadas == []


def test_documento_que_nao_e_nenhum_dos_pedidos_e_tipo_errado():
    leitura, _ = _ler("CARDÁPIO DO DIA", {"tipo": "outro", "legivel": True, "problema_legibilidade": None})
    assert leitura.qualidade == "tipo_errado"
    assert leitura.tipo_documento_id is None


def test_a_transcricao_vai_ao_modelo_como_conteudo_nao_confiavel_e_lista_os_candidatos():
    _, llm = _ler(TRANSCRICAO_RG, {"tipo": "rg_cnh", "legivel": True, "problema_legibilidade": None})
    chamada = llm.chamadas[0]
    assert "<<<CONTEUDO_NAO_CONFIAVEL>>>" in chamada["usuario"]
    assert "rg_cnh" in chamada["usuario"] and "comprovante_residencia" in chamada["usuario"]
    assert set(chamada["ferramenta"]["function"]["parameters"]["properties"]["tipo"]["enum"]) == {
        "rg_cnh", "comprovante_residencia", "outro"}


def test_falha_na_visao_ou_na_extracao_levanta_erro_de_leitura():
    with pytest.raises(ErroLeitura):
        ler_generico(TranscritorQuebrado(), LLMRoteirizado([]), b"img", "image/jpeg", [RG])
    with pytest.raises(ErroLeitura):
        ler_generico(TranscritorFixo(TRANSCRICAO_RG), LLMRoteirizado([ErroLLM("x"), ErroLLM("x")]),
                     b"img", "image/jpeg", [RG])


def test_sem_candidatos_nao_chama_o_modelo():
    with pytest.raises(ValueError):
        ler_generico(TranscritorFixo(TRANSCRICAO_RG), LLMRoteirizado([]), b"img", "image/jpeg", [])
