from ia.config import carregar_env


def test_carrega_variaveis_do_arquivo(tmp_path, monkeypatch):
    monkeypatch.delenv("FEATHERLESS_MODEL", raising=False)
    arquivo = tmp_path / ".env"
    arquivo.write_text("# comentário\nFEATHERLESS_MODEL=Qwen/Qwen3-32B\n\n", encoding="utf-8")
    carregar_env(arquivo)
    import os

    assert os.environ["FEATHERLESS_MODEL"] == "Qwen/Qwen3-32B"


def test_nao_sobrescreve_variavel_ja_definida(tmp_path, monkeypatch):
    monkeypatch.setenv("FEATHERLESS_MODEL", "modelo-do-ambiente")
    arquivo = tmp_path / ".env"
    arquivo.write_text('FEATHERLESS_MODEL="modelo-do-arquivo"\n', encoding="utf-8")
    carregar_env(arquivo)
    import os

    assert os.environ["FEATHERLESS_MODEL"] == "modelo-do-ambiente"


def test_remove_aspas_do_valor(tmp_path, monkeypatch):
    monkeypatch.delenv("FEATHERLESS_MODEL", raising=False)
    arquivo = tmp_path / ".env"
    arquivo.write_text('FEATHERLESS_MODEL="Qwen/Qwen3-32B"\n', encoding="utf-8")
    carregar_env(arquivo)
    import os

    assert os.environ["FEATHERLESS_MODEL"] == "Qwen/Qwen3-32B"


def test_arquivo_ausente_nao_quebra(tmp_path):
    assert carregar_env(tmp_path / "nao-existe.env") == {}
