"""Acesso ao LLM (Featherless, API compatível com OpenAI) com saída estruturada.

Todo uso do modelo passa por `estruturar`: o modelo é forçado a chamar uma única
ferramenta cujo schema vem de um modelo Pydantic, e a resposta só é aceita se
validar contra esse modelo. Saída de texto nunca é executada como comando.
"""

from __future__ import annotations

import json
import os
import re
import time
from dataclasses import dataclass, field
from typing import Protocol, TypeVar

from pydantic import BaseModel, ValidationError

M = TypeVar("M", bound=BaseModel)

FEATHERLESS_BASE_URL = "https://api.featherless.ai/v1"
MODELO_PADRAO = "Qwen/Qwen3-32B"


class ErroLLM(Exception):
    """Falha ao obter uma chamada de ferramenta utilizável do modelo."""


class LLM(Protocol):
    def chamar(self, *, sistema: str, usuario: str, ferramenta: dict) -> dict:
        """Devolve os argumentos da chamada da ferramenta pedida, ou lança ErroLLM."""
        ...


def ferramenta_de(modelo: type[BaseModel], nome: str, descricao: str) -> dict:
    """Converte um modelo Pydantic na definição de ferramenta do formato OpenAI."""
    return {
        "type": "function",
        "function": {"name": nome, "description": descricao, "parameters": modelo.model_json_schema()},
    }


_PENSAMENTO = re.compile(r"<think>.*?</think>", re.DOTALL)
_TOOL_CALL = re.compile(r"<tool_call>\s*(\{.*?\})\s*</tool_call>", re.DOTALL)
_BLOCO_JSON = re.compile(r"```(?:json)?\s*(\{.*?\})\s*```", re.DOTALL)


def remover_pensamento(texto: str) -> str:
    """Remove blocos <think> que modelos Qwen3 emitem por padrão."""
    return _PENSAMENTO.sub("", texto).strip()


def extrair_chamada_de_texto(texto: str, nome: str) -> dict | None:
    """Recupera os argumentos quando o provedor devolve a chamada como texto.

    Aceita o formato <tool_call> do Qwen e JSON solto ou cercado. Uma chamada
    para outra ferramenta é descartada.
    """
    texto = remover_pensamento(texto)
    candidatos = _TOOL_CALL.findall(texto) or _BLOCO_JSON.findall(texto) or [texto]
    for bruto in candidatos:
        try:
            dado = json.loads(bruto)
        except json.JSONDecodeError:
            continue
        if not isinstance(dado, dict):
            continue
        if "name" in dado and "arguments" in dado:
            if dado["name"] != nome:
                continue
            argumentos = dado["arguments"]
            if isinstance(argumentos, str):
                try:
                    argumentos = json.loads(argumentos)
                except json.JSONDecodeError:
                    continue
            return argumentos if isinstance(argumentos, dict) else None
        return dado
    return None


def estruturar(
    llm: LLM,
    *,
    sistema: str,
    usuario: str,
    modelo: type[M],
    nome: str,
    descricao: str,
    tentativas: int = 2,
) -> M | None:
    """Pede ao LLM uma saída que valide contra `modelo`. Devolve None se não conseguir."""
    ferramenta = ferramenta_de(modelo, nome, descricao)
    for _ in range(tentativas):
        try:
            argumentos = llm.chamar(sistema=sistema, usuario=usuario, ferramenta=ferramenta)
            return modelo.model_validate(argumentos)
        except (ErroLLM, ValidationError):
            continue
    return None


def novo_cliente_featherless(*, timeout_s: float):
    """Cliente OpenAI apontado para o Featherless, sem novas tentativas automáticas.

    O SDK repete chamadas por conta própria (2 vezes, por padrão), o que multiplica
    a espera em caso de lentidão. Quem decide repetir é `estruturar()`.
    """
    from openai import OpenAI

    chave = os.environ.get("FEATHERLESS_API_KEY")
    if not chave:
        raise ErroLLM("FEATHERLESS_API_KEY não definida")
    return OpenAI(base_url=FEATHERLESS_BASE_URL, api_key=chave, timeout=timeout_s, max_retries=0)


@dataclass
class RegistroChamada:
    """Trace de uma chamada ao modelo, para reproduzir e auditar o caso."""

    ferramenta: str
    modelo: str
    duracao_ms: int
    tokens_entrada: int | None
    tokens_saida: int | None
    via_texto: bool
    erro: str | None = None


@dataclass
class FeatherlessLLM:
    """Cliente real. Chave em FEATHERLESS_API_KEY; modelo em FEATHERLESS_MODEL."""

    modelo: str = field(default_factory=lambda: os.environ.get("FEATHERLESS_MODEL", MODELO_PADRAO))
    timeout_s: float = 30.0
    trace: list[RegistroChamada] = field(default_factory=list)
    _cliente: object | None = None

    def _obter_cliente(self):
        if self._cliente is None:
            self._cliente = novo_cliente_featherless(timeout_s=self.timeout_s)
        return self._cliente

    def chamar(self, *, sistema: str, usuario: str, ferramenta: dict) -> dict:
        nome = ferramenta["function"]["name"]
        inicio = time.monotonic()
        registro = RegistroChamada(nome, self.modelo, 0, None, None, via_texto=False)
        try:
            resposta = self._obter_cliente().chat.completions.create(
                model=self.modelo,
                temperature=0,
                messages=[
                    # "/no_think" desliga o raciocínio longo do Qwen3; o parser remove <think> se vier mesmo assim.
                    {"role": "system", "content": f"{sistema}\n/no_think"},
                    {"role": "user", "content": usuario},
                ],
                tools=[ferramenta],
                tool_choice={"type": "function", "function": {"name": nome}},
            )
            uso = getattr(resposta, "usage", None)
            registro.tokens_entrada = getattr(uso, "prompt_tokens", None)
            registro.tokens_saida = getattr(uso, "completion_tokens", None)
            mensagem = resposta.choices[0].message
            for chamada in mensagem.tool_calls or []:
                if chamada.function.name == nome:
                    return json.loads(chamada.function.arguments)
            registro.via_texto = True
            argumentos = extrair_chamada_de_texto(mensagem.content or "", nome)
            if argumentos is None:
                raise ErroLLM("modelo não devolveu a chamada de ferramenta")
            return argumentos
        except ErroLLM as erro:
            registro.erro = str(erro)
            raise
        except Exception as erro:  # rede, timeout, JSON inválido: erro nunca vira sucesso
            registro.erro = repr(erro)
            raise ErroLLM(str(erro)) from erro
        finally:
            registro.duracao_ms = int((time.monotonic() - inicio) * 1000)
            self.trace.append(registro)


# Medido em 07/11/2026 no Featherless: Qwen3-VL-32B descartava a imagem (59 tokens de entrada) e
# devolvia lixo; DeepSeek-V4.1-Flash, Qwen3-VL-8B e Qwen2.5-VL-72B leram certo em todas as tentativas.
MODELO_VISAO_PADRAO = "Qwen/Qwen3-VL-8B-Instruct"
INSTRUCAO_TRANSCRICAO = "Transcreva este documento."

SISTEMA_TRANSCRICAO = (
    "Transcreva todo o texto visível no documento, na ordem em que aparece, sem resumir, corrigir ou completar. "
    "Se algo estiver ilegível, escreva [ilegível]."
)


@dataclass
class FeatherlessTranscritor:
    """Transcrição de imagem por modelo de visão. Modelo em FEATHERLESS_VISION_MODEL.

    Só devolve texto: modelos de visão testados não respeitam chamada de ferramenta,
    então a extração estruturada fica com o modelo de texto (ver ia/documentos.py).
    """

    modelo: str = field(default_factory=lambda: os.environ.get("FEATHERLESS_VISION_MODEL", MODELO_VISAO_PADRAO))
    timeout_s: float = 60.0
    trace: list[RegistroChamada] = field(default_factory=list)
    _cliente: object | None = None

    def transcrever(self, imagem: bytes, mime: str) -> str:
        import base64

        inicio = time.monotonic()
        registro = RegistroChamada("transcrever", self.modelo, 0, None, None, via_texto=True)
        try:
            if self._cliente is None:
                self._cliente = novo_cliente_featherless(timeout_s=self.timeout_s)
            url = f"data:{mime};base64,{base64.b64encode(imagem).decode()}"
            resposta = self._cliente.chat.completions.create(
                model=self.modelo,
                temperature=0,
                messages=[
                    {"role": "system", "content": SISTEMA_TRANSCRICAO},
                    # Só a imagem, sem instrução em texto, fez modelos de visão degenerarem nos testes.
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": INSTRUCAO_TRANSCRICAO},
                            {"type": "image_url", "image_url": {"url": url}},
                        ],
                    },
                ],
            )
            uso = getattr(resposta, "usage", None)
            registro.tokens_entrada = getattr(uso, "prompt_tokens", None)
            registro.tokens_saida = getattr(uso, "completion_tokens", None)
            texto = remover_pensamento(resposta.choices[0].message.content or "")
            if not texto:
                raise ErroLLM("transcrição vazia")
            return texto
        except ErroLLM as erro:
            registro.erro = str(erro)
            raise
        except Exception as erro:
            registro.erro = repr(erro)
            raise ErroLLM(str(erro)) from erro
        finally:
            registro.duracao_ms = int((time.monotonic() - inicio) * 1000)
            self.trace.append(registro)
