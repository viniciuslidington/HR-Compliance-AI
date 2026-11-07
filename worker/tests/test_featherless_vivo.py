"""Teste de fumaça contra o Featherless real. Só roda com FEATHERLESS_API_KEY definida.

É o teste da hora 0: confirma que o modelo escolhido devolve chamada de ferramenta
utilizável (nativa ou recuperada do texto) para a interpretação de resposta.
"""

import os
from datetime import date

import pytest

from ia.config import carregar_env
from ia.interpretacao import interpretar_resposta
from ia.llm import FeatherlessLLM

carregar_env()

pytestmark = pytest.mark.skipif(not os.environ.get("FEATHERLESS_API_KEY"), reason="FEATHERLESS_API_KEY não definida")


def test_featherless_interpreta_horario_informado():
    llm = FeatherlessLLM()
    enc = interpretar_resposta(
        llm, data_caso=date(2026, 11, 17), marcacoes=["08:03", "12:00", "13:01"], texto="Oi! Saí às 17:04 nesse dia."
    )
    print("trace:", llm.trace)
    assert enc.decisao == "seguir"
    assert enc.interpretacao.horario == "17:04"
