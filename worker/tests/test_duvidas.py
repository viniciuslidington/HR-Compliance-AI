import hashlib
from datetime import date, datetime

import pytest

from ia.documentos import (
    Conferencia,
    DecisaoAceite,
    ExtracaoDocumento,
    Funcionario,
    LeituraDocumento,
    Motivo,
    ResultadoDocumento,
)
from ia.duvidas import classificar_duvida, estado_recente, responder_duvida
from ia.matriz import Exigencia, Matriz
from infra.anexos import RepositorioAnexos

HOJE = date(2026, 11, 8)
AGORA = datetime(2026, 11, 8, 9, 0)
PESSOA = Funcionario(id="carlos", nome="Carlos Souza", cpf="123.456.789-09", cargo="montador_andaime")
MATRIZ = Matriz(
    cargo="montador_andaime",
    versao=1,
    exigencias=[
        Exigencia(tipo="aso", validade_meses=12, antecedencia_dias=30),
        Exigencia(tipo="nr35", validade_meses=24, antecedencia_dias=45),
    ],
)


@pytest.fixture
def repo(tmp_path):
    return RepositorioAnexos(tmp_path / "anexos.db")


def _enviar(repo, tipo, decisao, *, motivos=(), validade=None, conteudo=b"x"):
    sha = hashlib.sha256(conteudo).hexdigest()
    anexo = repo.registrar_recebimento(
        tenant="t1", funcionario_id="carlos", tipo_esperado=tipo, sha256=sha, mime="image/png",
        tamanho=len(conteudo), chave=f"t1/anexos/{sha}", recebido_em=AGORA,
    )
    motivos = [Motivo(codigo=c, texto=t, gravidade=g) for c, t, g in motivos]
    resultado = ResultadoDocumento(
        leitura=LeituraDocumento(
            hash_arquivo=sha, transcricao="texto",
            extracao=ExtracaoDocumento(tipo=tipo, nome="Carlos Souza", cpf="123.456.789-09", data_realizacao=date(2025, 1, 1)),
            problemas_fidelidade=[],
        ),
        conferencia=Conferencia(tipo=tipo, aceitavel=not motivos, motivos=motivos, validade_ate=validade, emissor_cnpj=None),
        decisao=DecisaoAceite(decisao="pedir_aprovacao" if decisao == "aprovado" else decisao, mensagem="m", motivos=motivos),
    )
    repo.registrar_resultado(anexo, resultado)
    if decisao == "aprovado":
        repo.aprovar(anexo, aprovador="ana", em=AGORA)
    return anexo


# ---------- classificação (código, sem LLM) ----------


@pytest.mark.parametrize(
    "texto, esperado",
    [
        ("O que falta?", ["o_que_falta"]),
        ("oi, falta algum documento pra eu mandar?", ["o_que_falta"]),
        ("tenho alguma pendência?", ["o_que_falta"]),
        ("Por que recusou minha NR-35?", ["por_que_recusou"]),
        ("pq nao aceitaram o certificado", ["por_que_recusou"]),
        ("qual o motivo da recusa?", ["por_que_recusou"]),
        ("Quando vence?", ["quando_vence"]),
        ("até quando vale meu ASO", ["quando_vence"]),
        ("qual a validade da nr 35?", ["quando_vence"]),
        ("Por que recusou e o que falta agora?", ["por_que_recusou", "o_que_falta"]),
        ("vou enviar amanhã", []),
        ("bom dia", []),
    ],
)
def test_classifica_poucas_intencoes_bem_definidas(texto, esperado):
    assert classificar_duvida(texto).intencoes == esperado


@pytest.mark.parametrize(
    "texto, tipo",
    [("por que recusou a NR-35?", "nr35"), ("quando vence meu aso", "aso"), ("validade da nr 10", "nr10"), ("o que falta?", None)],
)
def test_identifica_o_documento_citado(texto, tipo):
    assert classificar_duvida(texto).tipo == tipo


# ---------- estado recente vindo do banco ----------


def test_estado_recente_traz_ultima_decisao_e_motivos_por_tipo(repo):
    _enviar(repo, "nr35", "recusar", motivos=[("vencido", "vencido em 03/12/2025", "recusa")], conteudo=b"a")
    _enviar(repo, "nr35", "recusar", motivos=[("carga_insuficiente", "carga de 4h, abaixo de 8h", "recusa")], conteudo=b"b")
    estado = estado_recente(repo, "t1", "carlos")
    assert estado["nr35"]["status"] == "recusar"
    assert estado["nr35"]["motivos"] == ["carga de 4h, abaixo de 8h"]
    assert "aso" not in estado


def test_estado_recente_isola_tenant(repo):
    _enviar(repo, "nr35", "recusar", motivos=[("vencido", "vencido", "recusa")])
    assert estado_recente(repo, "outro", "carlos") == {}


# ---------- respostas a partir da matriz e dos motivos registrados ----------


def _responder(repo, texto):
    return responder_duvida(
        texto, pessoa=PESSOA, matriz=MATRIZ, validades=repo.validades_vigentes("t1", "carlos"),
        estado=estado_recente(repo, "t1", "carlos"), hoje=HOJE,
    )


def test_o_que_falta_lista_documentos_faltando_e_vencidos(repo):
    _enviar(repo, "aso", "aprovado", validade=date(2026, 3, 1))
    resposta = _responder(repo, "o que falta?")
    assert resposta is not None
    assert "ASO" in resposta.texto and "venceu em 01/03/2026" in resposta.texto
    assert "NR-35" in resposta.texto and "ainda não recebi" in resposta.texto
    assert resposta.intencoes == ["o_que_falta"]
    assert resposta.dados["pendentes"] == ["aso", "nr35"]


def test_o_que_falta_avisa_documento_em_analise_no_dp(repo):
    _enviar(repo, "aso", "aprovado", validade=date(2027, 6, 1))
    _enviar(repo, "nr35", "pedir_aprovacao", validade=date(2027, 12, 1), conteudo=b"n")
    resposta = _responder(repo, "o que falta?")
    assert "em análise" in resposta.texto
    assert "ainda não recebi" not in resposta.texto


def test_o_que_falta_com_tudo_em_dia(repo):
    _enviar(repo, "aso", "aprovado", validade=date(2027, 6, 1), conteudo=b"a")
    _enviar(repo, "nr35", "aprovado", validade=date(2028, 1, 1), conteudo=b"n")
    resposta = _responder(repo, "falta algo?")
    assert "tudo em dia" in resposta.texto
    assert resposta.dados["pendentes"] == []


def test_o_que_falta_lembra_documento_perto_de_vencer(repo):
    _enviar(repo, "aso", "aprovado", validade=date(2026, 11, 20), conteudo=b"a")
    _enviar(repo, "nr35", "aprovado", validade=date(2028, 1, 1), conteudo=b"n")
    resposta = _responder(repo, "o que falta?")
    assert "ASO vence em 20/11/2026" in resposta.texto


def test_por_que_recusou_usa_os_motivos_registrados(repo):
    _enviar(repo, "nr35", "recusar", motivos=[
        ("carga_insuficiente", "carga horária de 4h, abaixo do mínimo de 8h", "recusa"),
        ("sem_responsavel_tecnico", "o certificado não identifica o responsável técnico", "recusa"),
    ])
    resposta = _responder(repo, "por que recusou a nr35?")
    assert "carga horária de 4h, abaixo do mínimo de 8h" in resposta.texto
    assert "responsável técnico" in resposta.texto
    assert resposta.dados["recusados"] == ["nr35"]


def test_por_que_recusou_sem_recusa_vigente(repo):
    _enviar(repo, "nr35", "recusar", motivos=[("vencido", "vencido", "recusa")], conteudo=b"a")
    _enviar(repo, "nr35", "aprovado", validade=date(2028, 1, 1), conteudo=b"b")
    resposta = _responder(repo, "por que recusou?")
    assert "nenhum documento recusado" in resposta.texto.casefold()


def test_por_que_recusou_nao_expoe_motivo_de_escalada(repo):
    """Escalada pode envolver saúde (ASO inapto) ou identidade: o colaborador só sabe que está com o DP."""
    _enviar(repo, "aso", "escalar", motivos=[("aso_inapto", "o ASO declara inaptidão", "escalada")])
    resposta = _responder(repo, "por que recusou o aso?")
    assert "inaptidão" not in resposta.texto
    assert "DP" in resposta.texto


def test_quando_vence_por_documento(repo):
    _enviar(repo, "nr35", "aprovado", validade=date(2027, 1, 10))
    resposta = _responder(repo, "quando vence minha nr-35?")
    assert "NR-35 vale até 10/01/2027" in resposta.texto
    assert "63 dias" in resposta.texto
    assert "ASO" not in resposta.texto


def test_quando_vence_vencido_explica_impedimento(repo):
    _enviar(repo, "nr35", "aprovado", validade=date(2026, 11, 1))
    resposta = _responder(repo, "quando vence a nr35")
    assert "venceu em 01/11/2026" in resposta.texto
    assert "trabalhar em altura" in resposta.texto


def test_quando_vence_documento_que_nao_temos(repo):
    resposta = _responder(repo, "validade do aso?")
    assert "ainda não recebi" in resposta.texto


def test_documento_que_o_cargo_nao_exige(repo):
    resposta = _responder(repo, "quando vence a nr10?")
    assert "não exige" in resposta.texto


def test_duas_intencoes_na_mesma_mensagem(repo):
    _enviar(repo, "nr35", "recusar", motivos=[("vencido", "vencido em 03/12/2025", "recusa")])
    resposta = _responder(repo, "por que recusou e o que falta?")
    assert resposta.intencoes == ["por_que_recusou", "o_que_falta"]
    assert "vencido em 03/12/2025" in resposta.texto and "ASO" in resposta.texto


def test_mensagem_que_nao_e_duvida_devolve_none(repo):
    assert _responder(repo, "vou enviar amanhã") is None
