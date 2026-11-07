from datetime import date, datetime
from pathlib import Path

import pytest

from ia.documentos import Funcionario
from ia.fila import Urgencia
from ia.llm import ErroLLM
from ia.matriz import carregar_matriz
from ia.orquestrador import AgenteDocumental
from infra.anexos import BucketLocal, RepositorioAnexos
from tests.fakes import LLMRoteirizado
from tests.test_documentos import TRANSCRICAO_NR35, TranscritorFixo, _extracao_llm

MATRIZES = Path(__file__).resolve().parents[2] / "contracts" / "matrizes"
AGORA = datetime(2026, 11, 7, 10, 0)
CARLOS = Funcionario(id="F-12", nome="Carlos Alberto Souza", cpf="123.456.789-09", cargo="eletricista_manutencao")
SEM_CARD = [ErroLLM("x"), ErroLLM("x")]  # o card cai para o texto fixo


def _agente(tmp_path, transcricao=TRANSCRICAO_NR35, respostas=()):
    return AgenteDocumental(
        transcritor=TranscritorFixo(transcricao),
        llm=LLMRoteirizado(list(respostas)),
        bucket=BucketLocal(tmp_path / "bucket"),
        repo=RepositorioAnexos(tmp_path / "anexos.db"),
        tenant="demo",
        funcionarios={CARLOS.id: CARLOS},
        matrizes={m.cargo: m for m in (carregar_matriz(p) for p in MATRIZES.glob("*.yaml"))},
    )


def _nomes(etapas):
    return [e.nome for e in etapas]


def test_recebimento_mostra_cada_etapa_na_ordem(tmp_path):
    agente = _agente(tmp_path, respostas=[_extracao_llm()])
    etapas = agente.receber_documento("F-12", "nr35", b"png-1", "image/png", agora=AGORA)
    assert _nomes(etapas) == [
        "bucket", "recebimento", "transcricao", "extracao", "fidelidade", "conferencia", "decisao", "registro", "mensagem", "matriz",
    ]
    assert etapas[6].dados["decisao"] == "pedir_aprovacao"
    assert "válido até 03/12/2026" in agente.mensagens[-1]["texto"]


def test_transcricao_de_aso_nao_aparece_nas_etapas(tmp_path):
    extracao = {
        "tipo": "aso", "nome": "Carlos Alberto Souza", "cpf": "123.456.789-09", "data_realizacao": "2026-03-10",
        "aso_resultado": "apto", "aso_funcoes": ["Trabalho com eletricidade", "Trabalho em altura"], "medico_crm": "CRM-SP 123456",
    }
    transcricao = (
        "ASO. Carlos Alberto Souza, CPF 123.456.789-09. Trabalho com eletricidade. Trabalho em altura. "
        "Apto. 10/03/2026. CRM-SP 123456"
    )
    agente = _agente(tmp_path, transcricao=transcricao, respostas=[extracao])
    etapas = agente.receber_documento("F-12", "aso", b"aso", "image/png", agora=AGORA)
    transcricao_etapa = next(e for e in etapas if e.nome == "transcricao")
    assert "texto" not in transcricao_etapa.dados


def test_terceira_recusa_seguida_escala_e_gera_card_na_fila(tmp_path):
    vencida = TRANSCRICAO_NR35.replace("03/12/2024", "15/08/2023")
    extracao = _extracao_llm(data_realizacao="2023-08-15")
    agente = _agente(tmp_path, transcricao=vencida, respostas=[extracao, extracao, extracao, *SEM_CARD])
    for i in range(2):
        etapas = agente.receber_documento("F-12", "nr35", f"png-{i}".encode(), "image/png", agora=AGORA)
        assert next(e for e in etapas if e.nome == "decisao").dados["decisao"] == "recusar"
    etapas = agente.receber_documento("F-12", "nr35", b"png-3", "image/png", agora=AGORA)
    assert next(e for e in etapas if e.nome == "tentativas").dados["falhas"] == 3
    assert next(e for e in etapas if e.nome == "registro").dados["status"] == "escalar"
    assert {"fila", "card"} <= set(_nomes(etapas))
    assert agente.tarefas[-1].atribuida_a is not None
    assert "ainda não consegui aceitar o certificado de NR-35" in agente.mensagens[-1]["texto"]
    assert next(e for e in etapas if e.nome == "card").dados["motivo_urgencia"] == "prazo em 48h"


def test_aprovacao_atualiza_a_matriz_e_avisa_o_colaborador(tmp_path):
    agente = _agente(tmp_path, respostas=[_extracao_llm()])
    etapas = agente.receber_documento("F-12", "nr35", b"png-1", "image/png", agora=AGORA)
    anexo_id = etapas[1].dados["anexo_id"]
    etapas = agente.aprovar(anexo_id, aprovador="dp-ana", agora=AGORA)
    matriz = next(e for e in etapas if e.nome == "matriz").dados["itens"]
    assert matriz["nr35"] == "a_vencer"
    assert "confirmou" in agente.mensagens[-1]["texto"]


@pytest.fixture
def carlos_com_nr35_aprovada(tmp_path):
    agente = _agente(tmp_path, respostas=[_extracao_llm(), *SEM_CARD])
    anexo_id = agente.receber_documento("F-12", "nr35", b"png-1", "image/png", agora=AGORA)[1].dados["anexo_id"]
    agente.aprovar(anexo_id, aprovador="dp-ana", agora=AGORA)
    return agente


def test_regua_avisa_uma_vez_e_depois_escala_o_impedimento(carlos_com_nr35_aprovada):
    agente = carlos_com_nr35_aprovada
    etapas = agente.rodar_regua(hoje=date(2026, 11, 7), agora=AGORA)
    assert [e.dados.get("etapa") for e in etapas if e.nome == "regua"] == ["aviso_renovacao"]
    assert agente.rodar_regua(hoje=date(2026, 11, 7), agora=AGORA) == []

    etapas = agente.rodar_regua(hoje=date(2026, 12, 3), agora=datetime(2026, 12, 3, 8, 0))
    assert [e.dados.get("etapa") for e in etapas if e.nome == "regua"] == ["impedimento"]
    assert "card" in _nomes(etapas)
    card = next(e for e in etapas if e.nome == "card").dados
    assert card["urgencia"] == Urgencia.P0.value
    assert "trabalhar em altura" in agente.mensagens[-1]["texto"]
