import hashlib
import json
from datetime import date, datetime

import pytest

from ia.documentos import (
    Conferencia,
    DecisaoAceite,
    ExtracaoDocumento,
    LeituraDocumento,
    ResultadoDocumento,
)
from infra.anexos import BucketLocal, RepositorioAnexos

PNG = b"\x89PNG certificado ficticio"
RECEBIDO = datetime(2026, 11, 7, 10, 0)


@pytest.fixture
def bucket(tmp_path):
    return BucketLocal(tmp_path / "bucket")


@pytest.fixture
def repo(tmp_path):
    return RepositorioAnexos(tmp_path / "anexos.db")


def _resultado(tipo="nr35", decisao="pedir_aprovacao", validade=date(2026, 12, 3), transcricao="texto"):
    extracao = ExtracaoDocumento(tipo=tipo, nome="Carlos", cpf="123.456.789-09", data_realizacao=date(2024, 12, 3))
    return ResultadoDocumento(
        leitura=LeituraDocumento(
            hash_arquivo=hashlib.sha256(PNG).hexdigest(), transcricao=transcricao, extracao=extracao, problemas_fidelidade=[]
        ),
        conferencia=Conferencia(tipo=tipo, aceitavel=True, motivos=[], validade_ate=validade, emissor_cnpj="12345678000195"),
        decisao=DecisaoAceite(decisao=decisao, mensagem="ok"),
    )


# ---------- bucket ----------


def test_bucket_guarda_pelo_hash_e_le_de_volta(bucket):
    chave = bucket.salvar(PNG, tenant="t1", sensivel=False)
    assert chave == f"t1/anexos/{hashlib.sha256(PNG).hexdigest()}"
    assert bucket.ler(chave) == PNG


def test_mesmo_arquivo_duas_vezes_gera_a_mesma_chave(bucket):
    assert bucket.salvar(PNG, tenant="t1", sensivel=False) == bucket.salvar(PNG, tenant="t1", sensivel=False)


def test_documento_sensivel_vai_para_prefixo_separado(bucket):
    assert bucket.salvar(PNG, tenant="t1", sensivel=True).startswith("t1/sensivel/")


def test_tenants_ficam_isolados_no_bucket(bucket):
    assert bucket.salvar(PNG, tenant="t1", sensivel=False) != bucket.salvar(PNG, tenant="t2", sensivel=False)


def test_chave_com_travessia_de_diretorio_e_recusada(bucket):
    with pytest.raises(ValueError):
        bucket.ler("t1/../../etc/passwd")


# ---------- banco ----------


def test_recebimento_registra_metadados(repo):
    anexo_id = repo.registrar_recebimento(
        tenant="t1", funcionario_id="F-12", tipo_esperado="nr35", sha256="abc", mime="image/png",
        tamanho=10, chave="t1/anexos/abc", recebido_em=RECEBIDO,
    )
    anexo = repo.obter(anexo_id)
    assert anexo["status"] == "recebido"
    assert anexo["chave"] == "t1/anexos/abc"


def test_reenvio_do_mesmo_arquivo_devolve_o_mesmo_anexo(repo):
    args = dict(tenant="t1", funcionario_id="F-12", tipo_esperado="nr35", sha256="abc", mime="image/png",
                tamanho=10, chave="t1/anexos/abc", recebido_em=RECEBIDO)
    assert repo.registrar_recebimento(**args) == repo.registrar_recebimento(**args)


def test_resultado_registra_decisao_validade_e_extracao(repo):
    anexo_id = repo.registrar_recebimento(
        tenant="t1", funcionario_id="F-12", tipo_esperado="nr35", sha256="abc", mime="image/png",
        tamanho=10, chave="t1/anexos/abc", recebido_em=RECEBIDO,
    )
    repo.registrar_resultado(anexo_id, _resultado())
    anexo = repo.obter(anexo_id)
    assert anexo["status"] == "pedir_aprovacao"
    assert anexo["validade_ate"] == "2026-12-03"
    assert json.loads(anexo["extracao_json"])["cpf"] == "123.456.789-09"


def test_transcricao_de_aso_nunca_e_gravada(repo):
    anexo_id = repo.registrar_recebimento(
        tenant="t1", funcionario_id="F-12", tipo_esperado="aso", sha256="aso1", mime="image/png",
        tamanho=10, chave="t1/sensivel/aso1", recebido_em=RECEBIDO,
    )
    repo.registrar_resultado(anexo_id, _resultado(tipo="aso", transcricao="texto com dado de saúde"))
    assert repo.obter(anexo_id)["transcricao"] is None


def test_validades_vigentes_usam_so_documentos_aceitos_e_o_mais_recente(repo):
    def enviar(sha, decisao, validade):
        anexo_id = repo.registrar_recebimento(
            tenant="t1", funcionario_id="F-12", tipo_esperado="nr35", sha256=sha, mime="image/png",
            tamanho=10, chave=f"t1/anexos/{sha}", recebido_em=RECEBIDO,
        )
        repo.registrar_resultado(anexo_id, _resultado(decisao=decisao, validade=validade))
        return anexo_id

    enviar("antigo", "aceitar_sozinho", date(2025, 12, 3))
    pendente = enviar("novo", "pedir_aprovacao", date(2026, 12, 3))
    enviar("ruim", "recusar", date(2027, 1, 1))
    assert repo.validades_vigentes("t1", "F-12") == {"nr35": date(2025, 12, 3)}

    repo.aprovar(pendente, aprovador="dp-ana", em=RECEBIDO)
    assert repo.validades_vigentes("t1", "F-12") == {"nr35": date(2026, 12, 3)}


def test_validades_nao_vazam_entre_tenants(repo):
    anexo_id = repo.registrar_recebimento(
        tenant="t1", funcionario_id="F-12", tipo_esperado="nr35", sha256="x", mime="image/png",
        tamanho=10, chave="t1/anexos/x", recebido_em=RECEBIDO,
    )
    repo.registrar_resultado(anexo_id, _resultado(decisao="aceitar_sozinho"))
    assert repo.validades_vigentes("t2", "F-12") == {}
