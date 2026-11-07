"""Interpretação da resposta em texto livre do funcionário.

O LLM só classifica e extrai. O que fazer com a interpretação é decidido aqui,
em código: data errada ou horário incoerente viram pedido de esclarecimento,
discordância e tema sensível viram escalada.
"""

from __future__ import annotations

from datetime import date
from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field

from ia.conteudo import nao_confiavel
from ia.llm import LLM, estruturar

VERSAO_PROMPT = "interpretacao.v1"


class TipoResposta(str, Enum):
    informou_horario = "informou_horario"
    nao_trabalhou = "nao_trabalhou"
    discorda = "discorda"
    pergunta = "pergunta"
    fora_de_escopo = "fora_de_escopo"
    sensivel = "sensivel"


class InterpretacaoResposta(BaseModel):
    tipo: TipoResposta
    horario: str | None = Field(
        default=None, pattern=r"^([01]\d|2[0-3]):[0-5]\d$", description="HH:MM informado, se houver"
    )
    data_referida: date | None = Field(default=None, description="Data a que a resposta se refere, se citada")
    trecho_citado: str = Field(description="Trecho literal da mensagem que sustenta a interpretação")


class Encaminhamento(BaseModel):
    decisao: Literal["seguir", "pedir_esclarecimento", "escalar"]
    motivo: str
    interpretacao: InterpretacaoResposta | None = None
    guardar_texto_no_caso: bool = True
    guardar_no_contexto_geral: bool = True


SISTEMA = """Você interpreta respostas de funcionários sobre pendências de ponto.
Classifique a mensagem em um tipo:
- informou_horario: a pessoa diz um horário de entrada ou saída.
- nao_trabalhou: a pessoa diz que não trabalhou no período.
- discorda: a pessoa contesta a pendência ou diz que o registro está errado.
- pergunta: a pessoa pede esclarecimento sobre a pendência.
- fora_de_escopo: assunto sem relação com a pendência.
- sensivel: menciona saúde, atestado, acidente, assédio ou tema pessoal delicado.
Extraia o horário em HH:MM só se ele estiver escrito. Nunca invente horário ou data.
Em trecho_citado copie literalmente a parte da mensagem que justifica a classificação."""


def _normalizar(texto: str) -> str:
    return " ".join(texto.casefold().split())


def interpretar_resposta(
    llm: LLM,
    *,
    data_caso: date,
    marcacoes: list[str],
    texto: str,
    falta: Literal["entrada", "saida"] = "saida",
) -> Encaminhamento:
    usuario = (
        f"Pendência: falta a marcação de {falta} em {data_caso.strftime('%d/%m/%Y')}.\n"
        f"Marcações registradas nesse dia: {', '.join(marcacoes) or 'nenhuma'}.\n\n"
        f"{nao_confiavel(texto)}"
    )
    interpretacao = estruturar(
        llm,
        sistema=SISTEMA,
        usuario=usuario,
        modelo=InterpretacaoResposta,
        nome="registrar_interpretacao",
        descricao="Registra a interpretação estruturada da resposta do funcionário.",
    )
    if interpretacao is None:
        return Encaminhamento(decisao="escalar", motivo="interpretacao_indisponivel")
    return _avaliar(interpretacao, data_caso=data_caso, marcacoes=marcacoes, texto=texto, falta=falta)


def _avaliar(
    interp: InterpretacaoResposta, *, data_caso: date, marcacoes: list[str], texto: str, falta: str
) -> Encaminhamento:
    def enc(decisao, motivo, **extra):
        return Encaminhamento(decisao=decisao, motivo=motivo, interpretacao=interp, **extra)

    if interp.tipo is TipoResposta.sensivel:
        return enc("escalar", "tema_sensivel", guardar_texto_no_caso=False, guardar_no_contexto_geral=False)
    if _normalizar(interp.trecho_citado) not in _normalizar(texto):
        return enc("escalar", "interpretacao_sem_ancora_no_texto")
    if interp.tipo is TipoResposta.fora_de_escopo:
        return enc("pedir_esclarecimento", "fora_de_escopo", guardar_no_contexto_geral=False)
    if interp.tipo is TipoResposta.discorda:
        return enc("escalar", "participante_contesta_a_ocorrencia")
    if interp.tipo is TipoResposta.pergunta:
        return enc("pedir_esclarecimento", "participante_fez_pergunta")
    if interp.data_referida is not None and interp.data_referida != data_caso:
        return enc("pedir_esclarecimento", "data_diferente_do_caso")
    if interp.tipo is TipoResposta.nao_trabalhou:
        return enc("seguir", "nao_trabalhou")
    # informou_horario
    if interp.horario is None:
        return enc("pedir_esclarecimento", "horario_ausente")
    if marcacoes and falta == "saida" and interp.horario <= max(marcacoes):
        return enc("pedir_esclarecimento", "saida_antes_da_ultima_marcacao")
    if marcacoes and falta == "entrada" and interp.horario >= min(marcacoes):
        return enc("pedir_esclarecimento", "entrada_depois_da_primeira_marcacao")
    return enc("seguir", "horario_informado")
