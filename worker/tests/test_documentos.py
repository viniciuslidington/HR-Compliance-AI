from datetime import date
from pathlib import Path

import pytest

from ia.documentos import (
    ExtracaoDocumento,
    Funcionario,
    conferir_documento,
    cpf_valido,
    cnpj_valido,
    decidir_aceite,
    ler_documento,
    processar_documento,
)
from ia.llm import ErroLLM
from ia.matriz import carregar_matriz, situacao_matriz
from tests.fakes import LLMRoteirizado

MATRIZES = Path(__file__).resolve().parents[2] / "contracts" / "matrizes"
ELETRICISTA = carregar_matriz(MATRIZES / "eletricista_manutencao.v1.yaml")
NR35 = ELETRICISTA.exigencia("nr35")
ASO = ELETRICISTA.exigencia("aso")
HOJE = date(2026, 11, 7)
CARLOS = Funcionario(id="F-12", nome="Carlos Alberto Souza", cpf="123.456.789-09", cargo="eletricista_manutencao")

TRANSCRICAO_NR35 = (
    "CERTIFICADO DE TREINAMENTO NR-35 · Trabalho em Altura. Certificamos que CARLOS ALBERTO SOUZA, "
    "CPF 123.456.789-09, concluiu o treinamento periódico de Trabalho em Altura (NR-35), com carga horária "
    "de 8 horas, realizado em 03/12/2024. Instrutor: Marcos Lima · Responsável técnico: Eng. Paula Reis, "
    "CREA-SP 5061234567. Treinamentos Exemplo Ltda · CNPJ 12.345.678/0001-95"
)


def nr35(**mudancas):
    base = dict(
        tipo="nr35",
        nome="CARLOS ALBERTO SOUZA",
        cpf="123.456.789-09",
        data_realizacao=date(2024, 12, 3),
        carga_horaria_horas=8,
        emissor_nome="Treinamentos Exemplo Ltda",
        emissor_cnpj="12.345.678/0001-95",
        responsavel_tecnico="Eng. Paula Reis, CREA-SP 5061234567",
    )
    return ExtracaoDocumento(**(base | mudancas))


def aso(**mudancas):
    base = dict(
        tipo="aso",
        nome="Carlos Alberto Souza",
        cpf="123.456.789-09",
        data_realizacao=date(2026, 3, 10),
        aso_resultado="apto",
        aso_funcoes=["Trabalho com eletricidade", "Trabalho em altura"],
        medico_crm="CRM-SP 123456",
    )
    return ExtracaoDocumento(**(base | mudancas))


def _codigos(conferencia):
    return {m.codigo for m in conferencia.motivos}


# ---------- identificadores ----------


def test_cpf_e_cnpj_validos_e_invalidos():
    assert cpf_valido("123.456.789-09")
    assert not cpf_valido("123.456.789-00")
    assert not cpf_valido("111.111.111-11")
    assert cnpj_valido("12.345.678/0001-95")
    assert not cnpj_valido("12.345.678/0001-90")


# ---------- conferência ----------


def test_certificado_valido_e_aceitavel_com_validade_calculada_pelo_codigo():
    conf = conferir_documento(nr35(), CARLOS, NR35, HOJE)
    assert conf.aceitavel
    assert conf.validade_ate == date(2026, 12, 3)


def test_certificado_vencido_e_recusado_com_motivo_explicado():
    conf = conferir_documento(nr35(data_realizacao=date(2023, 8, 15)), CARLOS, NR35, HOJE)
    assert not conf.aceitavel
    assert "vencido" in _codigos(conf)
    assert "15/08/2023" in conf.motivos[0].texto and "15/08/2025" in conf.motivos[0].texto


def test_carga_horaria_abaixo_do_minimo_e_recusada():
    assert "carga_insuficiente" in _codigos(conferir_documento(nr35(carga_horaria_horas=4), CARLOS, NR35, HOJE))


def test_documento_de_outro_tipo_e_recusado():
    assert "tipo_errado" in _codigos(conferir_documento(nr35(tipo="nr10"), CARLOS, NR35, HOJE))


def test_data_no_futuro_e_recusada():
    assert "data_futura" in _codigos(conferir_documento(nr35(data_realizacao=date(2027, 1, 1)), CARLOS, NR35, HOJE))


def test_sem_responsavel_tecnico_e_recusado():
    assert "sem_responsavel_tecnico" in _codigos(conferir_documento(nr35(responsavel_tecnico=None), CARLOS, NR35, HOJE))


def test_cnpj_do_emissor_invalido_e_recusado():
    assert "cnpj_emissor_invalido" in _codigos(
        conferir_documento(nr35(emissor_cnpj="12.345.678/0001-90"), CARLOS, NR35, HOJE)
    )


def test_nome_de_outra_pessoa_e_divergencia_de_identidade():
    assert "identidade_divergente" in _codigos(conferir_documento(nr35(nome="JOSE DA SILVA"), CARLOS, NR35, HOJE))


def test_nome_sem_acento_ou_caixa_diferente_ainda_confere():
    funcionario = CARLOS.model_copy(update={"nome": "Carlos Alberto Souza"})
    assert conferir_documento(nr35(nome="CARLOS ALBERTO SOUZA"), funcionario, NR35, HOJE).aceitavel


def test_aso_apto_com_funcoes_exigidas_e_aceitavel():
    assert conferir_documento(aso(), CARLOS, ASO, HOJE).aceitavel


def test_aso_que_nao_libera_altura_e_recusado():
    conf = conferir_documento(aso(aso_funcoes=["Trabalho com eletricidade"]), CARLOS, ASO, HOJE)
    assert "aso_sem_funcao_exigida" in _codigos(conf)


def test_aso_inapto_vai_para_escalada():
    conf = conferir_documento(aso(aso_resultado="inapto"), CARLOS, ASO, HOJE)
    assert "aso_inapto" in _codigos(conf)
    assert decidir_aceite(conf, emissores_autonomos=set()).decisao == "escalar"


# ---------- decisão ----------


def test_documento_conferido_de_emissor_comum_vai_para_aprovacao():
    conf = conferir_documento(nr35(), CARLOS, NR35, HOJE)
    assert decidir_aceite(conf, emissores_autonomos=set()).decisao == "pedir_aprovacao"


def test_documento_conferido_de_emissor_com_autonomia_e_aceito_sozinho():
    conf = conferir_documento(nr35(), CARLOS, NR35, HOJE)
    assert decidir_aceite(conf, emissores_autonomos={"12345678000195"}).decisao == "aceitar_sozinho"


def test_documento_vencido_e_recusado_mesmo_com_emissor_autonomo():
    conf = conferir_documento(nr35(data_realizacao=date(2023, 8, 15)), CARLOS, NR35, HOJE)
    decisao = decidir_aceite(conf, emissores_autonomos={"12345678000195"})
    assert decisao.decisao == "recusar"
    assert "vencido" in decisao.mensagem


def test_identidade_divergente_escala_em_vez_de_recusar():
    conf = conferir_documento(nr35(nome="JOSE DA SILVA"), CARLOS, NR35, HOJE)
    assert decidir_aceite(conf, emissores_autonomos=set()).decisao == "escalar"


# ---------- leitura em dois passos ----------


class TranscritorFixo:
    def __init__(self, texto):
        self.texto = texto
        self.chamadas = 0

    def transcrever(self, imagem: bytes, mime: str) -> str:
        self.chamadas += 1
        return self.texto


def _extracao_llm(**mudancas):
    return nr35(**mudancas).model_dump(mode="json")


def test_leitura_fiel_devolve_extracao_e_transcricao():
    leitura = ler_documento(TranscritorFixo(TRANSCRICAO_NR35), LLMRoteirizado([_extracao_llm()]), b"png", "image/png")
    assert leitura.extracao.cpf == "123.456.789-09"
    assert leitura.problemas_fidelidade == []
    assert leitura.transcricao == TRANSCRICAO_NR35
    assert len(leitura.hash_arquivo) == 64


def test_campo_extraido_que_nao_esta_na_transcricao_e_apontado():
    leitura = ler_documento(
        TranscritorFixo(TRANSCRICAO_NR35), LLMRoteirizado([_extracao_llm(cpf="987.654.321-00")]), b"png", "image/png"
    )
    assert "cpf" in leitura.problemas_fidelidade


def test_data_e_carga_inventadas_sao_apontadas():
    leitura = ler_documento(
        TranscritorFixo(TRANSCRICAO_NR35),
        LLMRoteirizado([_extracao_llm(data_realizacao="2025-01-10", carga_horaria_horas=16)]),
        b"png",
        "image/png",
    )
    assert {"data_realizacao", "carga_horaria_horas"} <= set(leitura.problemas_fidelidade)


def test_transcricao_de_aso_nao_e_devolvida():
    transcricao = "ASO admissional. Carlos Alberto Souza, CPF 123.456.789-09. Apto. 10/03/2026. CRM-SP 123456"
    extracao = aso(aso_funcoes=[]).model_dump(mode="json")
    leitura = ler_documento(TranscritorFixo(transcricao), LLMRoteirizado([extracao]), b"png", "image/png")
    assert leitura.transcricao is None
    assert leitura.extracao.aso_resultado == "apto"


def test_extracao_indisponivel_marca_leitura_nao_confiavel():
    leitura = ler_documento(
        TranscritorFixo(TRANSCRICAO_NR35), LLMRoteirizado([ErroLLM("x"), ErroLLM("x")]), b"png", "image/png"
    )
    assert leitura.extracao is None
    assert leitura.problemas_fidelidade == ["extracao_indisponivel"]


# ---------- fluxo completo ----------


def test_fluxo_completo_de_certificado_fiel_vai_para_aprovacao():
    resultado = processar_documento(
        TranscritorFixo(TRANSCRICAO_NR35), LLMRoteirizado([_extracao_llm()]), b"png", "image/png",
        funcionario=CARLOS, exigencia=NR35, hoje=HOJE, emissores_autonomos=set(),
    )
    assert resultado.decisao.decisao == "pedir_aprovacao"
    assert resultado.conferencia.validade_ate == date(2026, 12, 3)


def test_leitura_com_campo_sem_respaldo_escala_mesmo_se_a_conferencia_passaria():
    resultado = processar_documento(
        TranscritorFixo(TRANSCRICAO_NR35.replace("8 horas", "oito horas")), LLMRoteirizado([_extracao_llm()]),
        b"png", "image/png", funcionario=CARLOS, exigencia=NR35, hoje=HOJE, emissores_autonomos={"12345678000195"},
    )
    assert resultado.decisao.decisao == "escalar"
    assert "carga_horaria_horas" in resultado.decisao.mensagem


def test_leitura_indisponivel_escala_sem_conferir():
    resultado = processar_documento(
        TranscritorFixo(TRANSCRICAO_NR35), LLMRoteirizado([ErroLLM("x"), ErroLLM("x")]), b"png", "image/png",
        funcionario=CARLOS, exigencia=NR35, hoje=HOJE, emissores_autonomos=set(),
    )
    assert resultado.decisao.decisao == "escalar"
    assert resultado.conferencia is None


# ---------- situação da matriz ----------


def test_situacao_da_matriz_marca_faltando_a_vencer_e_vencido_com_impedimento():
    validades = {"aso": date(2027, 3, 10), "nr35": date(2026, 12, 3), "nr10": date(2026, 10, 1)}
    itens = {i.tipo: i for i in situacao_matriz(ELETRICISTA, validades, HOJE)}
    assert itens["aso"].status == "valido"
    assert itens["nr35"].status == "a_vencer"
    assert itens["nr35"].impedido_desde == date(2026, 12, 3)
    assert itens["nr35"].renovar_a_partir_de == date(2026, 10, 19)
    assert itens["nr10"].status == "vencido"


def test_documento_que_nunca_foi_entregue_aparece_como_faltando():
    itens = {i.tipo: i for i in situacao_matriz(ELETRICISTA, {"aso": date(2027, 3, 10)}, HOJE)}
    assert itens["nr10"].status == "faltando"
    assert itens["nr35"].status == "faltando"


@pytest.mark.parametrize("arquivo", sorted(MATRIZES.glob("*.yaml")), ids=lambda p: p.stem)
def test_matrizes_do_contrato_carregam(arquivo):
    assert carregar_matriz(arquivo).exigencias
