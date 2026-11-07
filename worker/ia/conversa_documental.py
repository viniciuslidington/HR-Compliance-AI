"""Classificação limitada de respostas; o texto do colaborador é dado não confiável."""
from typing import Literal
from pydantic import BaseModel, Field
from ia.conteudo import nao_confiavel
from ia.llm import LLM, estruturar


class RespostaDocumental(BaseModel):
    tipo: Literal['vai_enviar', 'nao_tem', 'sensivel', 'outra']
    trecho: str = Field(min_length=1, max_length=300)


def interpretar(llm: LLM, texto: str) -> str:
    resultado = estruturar(llm, sistema=(
        'Classifique resposta sobre documentos. Use vai_enviar apenas para intenção explícita de enviar; '
        'nao_tem apenas para ausência explícita do documento; sensivel para qualquer assunto de saúde '
        'ou pessoal delicado; outra para tudo mais. Copie um trecho literal que sustente a classificação.'),
        usuario=nao_confiavel(texto), modelo=RespostaDocumental, nome='classificar_resposta_documental',
        descricao='Classifica a resposta documental e cita a evidência.')
    if resultado is None or resultado.trecho.casefold() not in texto.casefold():
        return 'outra'
    return resultado.tipo
