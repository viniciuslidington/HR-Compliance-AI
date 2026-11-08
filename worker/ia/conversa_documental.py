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


def compromisso_explicito(texto, hoje, tipos_pendentes):
    """Só agenda datas explícitas e um documento inequívoco; ambiguidades pedem esclarecimento."""
    import re
    from datetime import date, timedelta
    tipos = set(re.findall(r'\b(aso|nr\s*-?\s*10|nr\s*-?\s*35)\b', texto.casefold()))
    tipos = {re.sub(r'[\s-]', '', t) for t in tipos}
    candidatos = tipos or set(tipos_pendentes)
    if len(candidatos) != 1 or not candidatos <= set(tipos_pendentes):
        return None
    datas = []
    if re.search(r'\bamanhã\b', texto, re.I):
        datas.append(hoje + timedelta(days=1))
    if re.search(r'\bhoje\b', texto, re.I):
        datas.append(hoje)
    try:
        for valor in re.findall(r'\b\d{4}-\d{2}-\d{2}\b', texto):
            datas.append(date.fromisoformat(valor))
        for dia, mes, ano in re.findall(r'\b(\d{2})/(\d{2})/(\d{4})\b', texto):
            datas.append(date(int(ano), int(mes), int(dia)))
    except ValueError:
        return None
    if len(datas) != 1 or not hoje <= datas[0] <= hoje + timedelta(days=90):
        return None
    return {'tipo': candidatos.pop(), 'dia': datas[0].isoformat()}
