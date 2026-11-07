"""Carregamento de configuração local (worker/.env), sem dependência extra.

Variáveis já definidas no ambiente têm prioridade sobre o arquivo. O .env fica
fora do git (.gitignore da raiz).
"""

from __future__ import annotations

import os
from pathlib import Path

ENV_PADRAO = Path(__file__).resolve().parents[1] / ".env"


def carregar_env(caminho: str | Path = ENV_PADRAO) -> dict[str, str]:
    """Lê CHAVE=valor do arquivo e define no ambiente o que ainda não existir. Devolve o que leu."""
    caminho = Path(caminho)
    if not caminho.is_file():
        return {}
    lidas: dict[str, str] = {}
    for linha in caminho.read_text(encoding="utf-8").splitlines():
        linha = linha.strip()
        if not linha or linha.startswith("#") or "=" not in linha:
            continue
        chave, valor = linha.split("=", 1)
        chave, valor = chave.strip(), valor.strip().strip('"').strip("'")
        lidas[chave] = valor
        os.environ.setdefault(chave, valor)
    return lidas
