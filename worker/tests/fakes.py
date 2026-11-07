"""Utilitários de teste: um LLM roteirizado que devolve respostas pré-definidas."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class LLMRoteirizado:
    """Devolve, em ordem, cada item de `respostas`. Um item que é Exception é lançado."""

    respostas: list[Any]
    chamadas: list[dict] = field(default_factory=list)

    def chamar(self, *, sistema: str, usuario: str, ferramenta: dict) -> dict:
        self.chamadas.append({"sistema": sistema, "usuario": usuario, "ferramenta": ferramenta})
        if not self.respostas:
            raise AssertionError("LLMRoteirizado sem respostas restantes")
        resposta = self.respostas.pop(0)
        if isinstance(resposta, Exception):
            raise resposta
        return resposta
