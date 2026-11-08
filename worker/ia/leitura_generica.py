"""Leitura dos documentos de admissão do painel (RG/CNH, CPF, comprovante, dados bancários, matrícula).

Mesmo desenho de `documentos.py`: o modelo de visão só transcreve; o de texto identifica qual dos
documentos pedidos é aquele e copia os campos. Todo campo devolvido precisa ter respaldo literal na
transcrição; o que não tiver é descartado e apontado em `problemas_fidelidade`. Quem aprova ou recusa
é o motor de regras do painel (`web/src/domain/validacao`), não o LLM.
"""

from __future__ import annotations

import re
from datetime import date
from typing import Literal, Optional

from pydantic import BaseModel, Field, create_model

from ia.conteudo import nao_confiavel
from ia.documentos import Transcritor, _datas_no_texto, _digitos, _normalizar, _texto_presente
from ia.llm import LLM, ErroLLM, estruturar


class ErroLeitura(Exception):
    """O documento não pôde ser lido agora (modelo fora do ar ou resposta inutilizável)."""


class Candidato(BaseModel):
    id: str
    nome: str
    campos: list[str]


class LeituraGenerica(BaseModel):
    tipo_documento_id: str | None
    qualidade: Literal["ok", "ilegivel", "tipo_errado"]
    detalhe_qualidade: str | None = None
    dados_extraidos: dict[str, str]
    problemas_fidelidade: list[str]


SISTEMA = """Você confere documentos enviados por um colaborador na admissão. Recebe o texto transcrito de uma foto
e a lista de documentos que ainda faltam. Diga qual deles é (ou "outro" se não for nenhum), se dá para ler
os dados e copie os campos exatamente como estão escritos. Se o texto estiver borrado ou ilegível,
marque legivel=false, mesmo sem saber qual documento é. Datas sempre no formato AAAA-MM-DD.
Se um campo não estiver no texto, deixe nulo. Nunca complete, corrija ou invente informação."""

_CAMPOS_NUMERICOS = {"numero", "agencia", "conta", "cpf", "carga_horaria"}


_ILEGIVEL = re.compile(r"\[ileg[ií]vel\]", re.IGNORECASE)


def _quase_tudo_ilegivel(transcricao: str) -> bool:
    """Foto borrada: o modelo de visão devolve quase só [ilegível]. Decidido em código, sem perguntar ao LLM."""
    marcas = len(_ILEGIVEL.findall(transcricao))
    resto = re.sub(r"[^0-9A-Za-zÀ-ÿ]", "", _ILEGIVEL.sub("", transcricao))
    # Todo documento pedido tem número ou data; com trechos ilegíveis e quase nenhum dígito, não há o que ler.
    sem_numeros = len(re.findall(r"\d", transcricao)) < 4
    return marcas >= 1 and (sem_numeros or (marcas >= 3 and len(resto) < 40 * marcas))


_MOTIVO_PADRAO = "a foto está borrada ou cortada"
_MOTIVO_TECNICO = re.compile(r"transcri|texto|repet|marca d|fict[ií]cio|campo", re.IGNORECASE)


def _motivo_para_colaborador(motivo: str | None) -> str:
    """O motivo vai para o colaborador: curto e sem falar da transcrição (o LLM às vezes descreve o texto lido)."""
    motivo = (motivo or "").strip().rstrip(".")
    if not motivo or len(motivo) > 80 or _MOTIVO_TECNICO.search(motivo):
        return _MOTIVO_PADRAO
    return motivo[0].lower() + motivo[1:]


def _eh_data(campo: str) -> bool:
    return campo.startswith("data") or campo.startswith("validade")


def _modelo_resposta(candidatos: list[Candidato]) -> type[BaseModel]:
    ids = tuple(c.id for c in candidatos) + ("outro",)
    campos: dict = {
        "tipo": (Literal[ids], Field(description="id do documento pedido que esta imagem é, ou 'outro'")),
        "legivel": (bool, Field(description="os dados do documento podem ser lidos com segurança")),
        "problema_legibilidade": (Optional[str], Field(None, description="se ilegível, o motivo para o colaborador em até 8 palavras, sem citar a transcrição, ex.: 'a foto está borrada' ou 'a foto cortou a data de nascimento'")),
    }
    for nome in dict.fromkeys(c for cand in candidatos for c in cand.campos):
        descricao = "data no formato AAAA-MM-DD" if _eh_data(nome) else "copiado exatamente como no documento"
        campos[nome] = (Optional[str], Field(None, description=descricao))
    return create_model("LeituraAdmissao", **campos)


def _tem_respaldo(campo: str, valor: str, transcricao: str, normalizada: str) -> bool:
    if _eh_data(campo):
        try:
            return date.fromisoformat(valor) in _datas_no_texto(transcricao)
        except ValueError:
            return False
    if campo in _CAMPOS_NUMERICOS:
        digitos = _digitos(valor)
        return bool(digitos) and digitos in _digitos(transcricao)
    return _texto_presente(valor, normalizada)


def ler_generico(transcritor: Transcritor, llm: LLM, imagem: bytes, mime: str,
                 candidatos: list[Candidato]) -> LeituraGenerica:
    if not candidatos:
        raise ValueError("informe ao menos um documento candidato")
    try:
        transcricao = transcritor.transcrever(imagem, mime)
    except ErroLLM as erro:
        raise ErroLeitura(f"leitura indisponível: {erro}") from erro

    if _quase_tudo_ilegivel(transcricao):
        return LeituraGenerica(tipo_documento_id=None, qualidade="ilegivel",
                               detalhe_qualidade="a imagem está borrada", dados_extraidos={},
                               problemas_fidelidade=[])

    lista = "\n".join(f"- {c.id}: {c.nome} (campos: {', '.join(c.campos)})" for c in candidatos)
    resposta = estruturar(
        llm,
        sistema=SISTEMA,
        usuario=f"Documentos que faltam:\n{lista}\n\nTexto transcrito da imagem:\n{nao_confiavel(transcricao)}",
        modelo=_modelo_resposta(candidatos),
        nome="registrar_leitura",
        descricao="Registra qual documento é, se está legível e os campos lidos.",
    )
    if resposta is None:
        raise ErroLeitura("extração indisponível")

    if not resposta.legivel:
        return LeituraGenerica(tipo_documento_id=None if resposta.tipo == "outro" else resposta.tipo, qualidade="ilegivel",
                               detalhe_qualidade=_motivo_para_colaborador(resposta.problema_legibilidade), dados_extraidos={},
                               problemas_fidelidade=[])
    if resposta.tipo == "outro":
        return LeituraGenerica(tipo_documento_id=None, qualidade="tipo_errado", dados_extraidos={},
                               problemas_fidelidade=[])

    escolhido = next(c for c in candidatos if c.id == resposta.tipo)
    normalizada = _normalizar(transcricao)
    dados: dict[str, str] = {}
    problemas: list[str] = []
    for campo in escolhido.campos:
        valor = getattr(resposta, campo, None)
        if not valor or not str(valor).strip():
            continue
        valor = re.sub(r"\s+", " ", str(valor)).strip()
        if _tem_respaldo(campo, valor, transcricao, normalizada):
            dados[campo] = valor
        else:
            problemas.append(campo)
    return LeituraGenerica(tipo_documento_id=escolhido.id, qualidade="ok", dados_extraidos=dados,
                           problemas_fidelidade=problemas)
