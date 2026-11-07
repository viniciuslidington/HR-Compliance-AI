"""Leitura real de certificados fictícios: visão (Qwen3-VL) + extração (modelo de texto) + conferência.
Só roda com FEATHERLESS_API_KEY."""

import os
from datetime import date
from pathlib import Path

import pytest

from ia.config import carregar_env
from ia.documentos import Funcionario, cpf_valido, processar_documento
from ia.llm import FeatherlessLLM, FeatherlessTranscritor
from ia.matriz import carregar_matriz

carregar_env()
pytestmark = pytest.mark.skipif(not os.environ.get("FEATHERLESS_API_KEY"), reason="FEATHERLESS_API_KEY não definida")

RAIZ = Path(__file__).resolve().parents[2]
NR35 = carregar_matriz(RAIZ / "contracts" / "matrizes" / "eletricista_manutencao.v1.yaml").exigencia("nr35")
FIXTURES = Path(__file__).parent / "fixtures"
HOJE = date(2026, 11, 7)


def _processar(arquivo, funcionario):
    return processar_documento(
        FeatherlessTranscritor(), FeatherlessLLM(), (FIXTURES / arquivo).read_bytes(), "image/png",
        funcionario=funcionario, exigencia=NR35, hoje=HOJE, emissores_autonomos=set(),
    )


def test_certificado_valido_do_carlos_vai_para_aprovacao_com_validade_calculada():
    carlos = Funcionario(id="F-12", nome="Carlos Alberto Souza", cpf="123.456.789-09", cargo="eletricista_manutencao")
    resultado = _processar("nr35_carlos_2024.png", carlos)
    print(resultado.decisao, resultado.leitura.problemas_fidelidade)
    assert resultado.decisao.decisao == "pedir_aprovacao"
    assert resultado.conferencia.validade_ate == date(2026, 12, 3)


def test_certificado_vencido_do_pedro_e_recusado_com_motivo():
    pedro = Funcionario(id="F-31", nome="Pedro Henrique Alves", cpf="529.982.247-25", cargo="eletricista_manutencao")
    assert cpf_valido(pedro.cpf)
    resultado = _processar("nr35_pedro_2023.png", pedro)
    print(resultado.decisao.mensagem)
    assert resultado.decisao.decisao == "recusar"
    assert "vencido em 15/08/2025" in resultado.decisao.mensagem
