"""Compilação de playbook escrito em português e simulação contra o histórico.

O LLM transforma o texto do DP em um rascunho no schema C4. Quem decide se o
rascunho pode ser ativado é `validar_playbook`. Versão e identificador são
definidos pelo código, nunca pelo modelo.
"""

from __future__ import annotations

from pydantic import BaseModel, Field

from ia.autonomia import pode_autoaplicar
from ia.llm import LLM, estruturar
from ia.playbook import CATALOGO_ACOES, ErroValidacao, Playbook, TetoPolitica, validar_playbook

VERSAO_PROMPT = "compilador.v1"


class ResultadoCompilacao(BaseModel):
    rascunho: Playbook | None
    erros: list[ErroValidacao]

    @property
    def pode_ativar(self) -> bool:
        return self.rascunho is not None and not self.erros


SISTEMA = """Você converte procedimentos de DP escritos em português em playbooks estruturados.
Use somente ações do catálogo fornecido. Não invente ações, aprovadores ou permissões.
Se o texto pedir algo fora do catálogo, mantenha a ação pedida como escrita para que a validação a recuse."""


def compilar_playbook(
    llm: LLM,
    texto: str,
    *,
    base: Playbook | None,
    teto: TetoPolitica,
    ativos: list[Playbook],
) -> ResultadoCompilacao:
    contexto_base = f"Versão atual do playbook:\n{base.model_dump_json(indent=2)}\n\n" if base else ""
    usuario = (
        f"{contexto_base}"
        f"Catálogo de ações: {', '.join(sorted(CATALOGO_ACOES))}.\n"
        f"Teto da política: até {teto.diferenca_max_minutos} min por marcação, "
        f"{teto.variacao_diaria_max_minutos} min por dia, autoaplicação sem hora extra.\n\n"
        f"Procedimento escrito pelo DP:\n{texto}"
    )
    saida = estruturar(
        llm,
        sistema=SISTEMA,
        usuario=usuario,
        modelo=Playbook,
        nome="registrar_playbook",
        descricao="Registra o rascunho do playbook no schema C4.",
    )
    if saida is None:
        return ResultadoCompilacao(
            rascunho=None,
            erros=[ErroValidacao(codigo="compilacao_indisponivel", detalhe="o modelo não devolveu um playbook válido")],
        )
    rascunho = saida.model_copy(
        update={
            "playbook": base.playbook if base else saida.playbook,
            "versao": base.versao + 1 if base else 1,
        }
    )
    return ResultadoCompilacao(rascunho=rascunho, erros=validar_playbook(rascunho, teto, ativos))


class CasoHistorico(BaseModel):
    escala: list[str]
    marcacoes: list[str]
    horario_informado: str
    informado_por: str


class ResumoSimulacao(BaseModel):
    total: int
    autoaplicaria: int
    iria_para_aprovacao: int
    motivos: dict[str, int] = Field(default_factory=dict)


def simular_playbook(pb: Playbook, teto: TetoPolitica, historico: list[CasoHistorico]) -> ResumoSimulacao:
    """Quantos casos do histórico esta versão teria fechado sozinha."""
    motivos: dict[str, int] = {}
    autoaplicaria = 0
    for caso in historico:
        decisao = pode_autoaplicar(
            pb,
            teto,
            escala=caso.escala,
            marcacoes=caso.marcacoes,
            horario_proposto=caso.horario_informado,
            informado_por=caso.informado_por,
        )
        motivos[decisao.motivo] = motivos.get(decisao.motivo, 0) + 1
        autoaplicaria += decisao.permitido
    return ResumoSimulacao(
        total=len(historico),
        autoaplicaria=autoaplicaria,
        iria_para_aprovacao=len(historico) - autoaplicaria,
        motivos=motivos,
    )
