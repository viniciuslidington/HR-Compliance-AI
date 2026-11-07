"""Agente estratégico, recorte do hackathon: autonomia conquistada.

O detector (SQL sobre os eventos C5) produz um AchadoAutonomia. Aqui o código
decide se o achado é elegível e monta a nova versão do playbook dentro do teto;
o LLM só redige a sugestão, e todo número citado precisa vir do achado.
A sugestão é sempre um rascunho: um humano ativa.
"""

from __future__ import annotations

import re
from typing import Literal

from pydantic import BaseModel, Field

from ia.llm import LLM, estruturar
from ia.playbook import AposAutoaplicar, Autonomia, AutoaplicarQuando, ErroValidacao, Playbook, TetoPolitica, validar_playbook

VERSAO_PROMPT = "estrategico.v1"
JANELA_CONTESTACAO = "24h"


class AchadoAutonomia(BaseModel):
    categoria: str
    aprovador_nome: str
    janela_dias: int
    decisoes: int
    aprovadas_na_primeira: int
    reaberturas: int
    playbook: str
    versao_atual: int


class LimitesAutonomia(BaseModel):
    minimo_decisoes: int = 30
    taxa_minima: float = 0.95
    max_reaberturas: int = 0


def elegivel(achado: AchadoAutonomia, limites: LimitesAutonomia | None = None) -> bool:
    limites = limites or LimitesAutonomia()
    if achado.decisoes < limites.minimo_decisoes or achado.reaberturas > limites.max_reaberturas:
        return False
    return achado.aprovadas_na_primeira / achado.decisoes >= limites.taxa_minima


def propor_versao_autonoma(base: Playbook, teto: TetoPolitica) -> Playbook:
    """Nova versão do playbook com autoaplicação exatamente no teto da política."""
    return base.model_copy(
        deep=True,
        update={
            "versao": base.versao + 1,
            "autonomia": Autonomia(
                autoaplicar_quando=AutoaplicarQuando(
                    informado_pelo_proprio_funcionario=True,
                    diferenca_max_minutos_vs_escala=teto.diferenca_max_minutos,
                    gera_hora_extra=False,
                ),
                apos_autoaplicar=AposAutoaplicar(notificar="gestor_direto", janela_contestacao=JANELA_CONTESTACAO),
            ),
        },
    )


class TextoSugestao(BaseModel):
    titulo: str = Field(min_length=1, max_length=120)
    texto: str = Field(min_length=1, max_length=800)


class SugestaoEstrategica(BaseModel):
    titulo: str
    texto: str
    origem: Literal["llm", "modelo"]
    achado: AchadoAutonomia
    rascunho: Playbook
    erros_validacao: list[ErroValidacao]


_NUMERO = re.compile(r"(?<![\w])\d+(?:[.,]\d+)?")


def _texto_fixo(achado: AchadoAutonomia, rascunho: Playbook, teto: TetoPolitica) -> str:
    categoria = achado.categoria.replace("_", " ")
    return (
        f"{achado.aprovador_nome} aprovou {achado.aprovadas_na_primeira} de {achado.decisoes} ajustes da categoria "
        f"'{categoria}' nos últimos {achado.janela_dias} dias na primeira proposta, com "
        f"{achado.reaberturas} reaberturas. Sugestão: ativar a versão {rascunho.versao} do playbook "
        f"{rascunho.playbook}, que aplica sozinha os ajustes informados pelo próprio funcionário até "
        f"{teto.diferenca_max_minutos} minutos da escala, sem hora extra, com {JANELA_CONTESTACAO} para o gestor contestar."
    )


def _numeros_permitidos(achado: AchadoAutonomia, texto_fixo: str) -> set[str]:
    taxa = achado.aprovadas_na_primeira / achado.decisoes * 100
    extras = {f"{taxa:.0f}", f"{taxa:.1f}", f"{taxa:.1f}".replace(".", ",")}
    return set(_NUMERO.findall(texto_fixo)) | set(_NUMERO.findall(achado.model_dump_json())) | extras


def redigir_sugestao(llm: LLM, achado: AchadoAutonomia, teto: TetoPolitica, *, base: Playbook) -> SugestaoEstrategica:
    rascunho = propor_versao_autonoma(base, teto)
    erros = validar_playbook(rascunho, teto, ativos=[base])
    fixo = _texto_fixo(achado, rascunho, teto)
    saida = estruturar(
        llm,
        sistema=(
            "Você escreve sugestões curtas para a liderança de DP, em linguagem de negócio. "
            "Use só os números do achado. Não estime economia, horas ou valores."
        ),
        usuario=f"Achado:\n{achado.model_dump_json(indent=2)}\n\nTexto-base:\n{fixo}",
        modelo=TextoSugestao,
        nome="registrar_sugestao",
        descricao="Registra o título e o texto da sugestão.",
    )

    def montar(titulo: str, texto: str, origem: str) -> SugestaoEstrategica:
        return SugestaoEstrategica(
            titulo=titulo, texto=texto, origem=origem, achado=achado, rascunho=rascunho, erros_validacao=erros
        )

    if saida is not None:
        numeros = set(_NUMERO.findall(f"{saida.titulo} {saida.texto}"))
        if numeros <= _numeros_permitidos(achado, fixo) and "R$" not in saida.texto:
            return montar(saida.titulo, saida.texto, "llm")
    return montar(f"Autonomia para '{achado.categoria.replace('_', ' ')}'", fixo, "modelo")
