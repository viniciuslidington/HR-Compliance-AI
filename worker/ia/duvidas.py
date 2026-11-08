"""Dúvidas do colaborador sobre a própria pendência: "o que falta?", "por que recusou?", "quando vence?".

Intenções poucas e bem definidas, reconhecidas por código (sem LLM): o texto do colaborador é dado
não confiável e só passa por expressões regulares. A resposta sai de modelos fixos preenchidos com a
matriz do cargo e com os motivos já registrados na conferência, então datas e motivos nunca são
inventados. Mensagem que não é uma dessas dúvidas devolve None, e o chamador segue o fluxo de
sempre (compromisso, encaminhamento ao DP).

Motivo de escalada não é exposto: pode envolver saúde (ASO inapto) ou identidade. O colaborador
só fica sabendo que o documento está com o DP.
"""

from __future__ import annotations

import json
import re
import unicodedata
from datetime import date
from typing import Any, Literal

from pydantic import BaseModel, Field

from ia.documentos import Funcionario
from ia.matriz import Matriz, situacao_matriz

Intencao = Literal["por_que_recusou", "quando_vence", "o_que_falta"]

NOME = {"aso": "ASO", "nr10": "certificado de NR-10", "nr35": "certificado de NR-35"}
ATIVIDADE = {"aso": "exercer a função", "nr10": "trabalhar com eletricidade", "nr35": "trabalhar em altura"}
ACEITOS = ("aceitar_sozinho", "aprovado")
NO_DP = ("pedir_aprovacao", "escalar")

# Ordem fixa: a resposta segue sempre esta sequência, do mais específico ao mais geral.
PADROES: list[tuple[Intencao, re.Pattern[str]]] = [
    (
        "por_que_recusou",
        re.compile(r"\b(por ?que|porque|pq|motivo)\b.*\b(recus|nao (foi |foram )?aceit|rejeit|reprov|negad)"),
    ),
    (
        "quando_vence",
        re.compile(r"quando (ele |ela )?vence|vencimento|validade|ate quando|vale ate|quando expira|quando .*renovar"),
    ),
    (
        "o_que_falta",
        re.compile(r"\bo que (ainda )?falta|\bfalta (algum|alguma|algo|mais|o que)|pendencia|pendente|"
                   r"o que (eu )?(preciso|tenho que|devo) (enviar|mandar)"),
    ),
]
TIPOS = re.compile(r"\b(aso|nr\s*-?\s*10|nr\s*-?\s*35)\b")


class Duvida(BaseModel):
    intencoes: list[Intencao] = Field(default_factory=list)
    tipo: str | None = None


class RespostaDuvida(BaseModel):
    intencoes: list[Intencao]
    tipo: str | None
    texto: str
    dados: dict[str, Any] = Field(default_factory=dict)


def _normalizar(texto: str) -> str:
    sem_acento = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode()
    return re.sub(r"\s+", " ", sem_acento.casefold())


def _dmy(dia: date) -> str:
    return dia.strftime("%d/%m/%Y")


def classificar_duvida(texto: str) -> Duvida:
    normal = _normalizar(texto)
    intencoes = [intencao for intencao, padrao in PADROES if padrao.search(normal)]
    tipos = {re.sub(r"[\s-]", "", t) for t in TIPOS.findall(normal)}
    return Duvida(intencoes=intencoes, tipo=tipos.pop() if len(tipos) == 1 else None)


def estado_recente(repo, tenant: str, funcionario_id: str) -> dict[str, dict[str, Any]]:
    """Último envio de cada documento: decisão e motivos de recusa registrados na conferência."""
    with repo._conectar() as conexao:  # leitura simples; mesmo banco do RepositorioAnexos
        linhas = conexao.execute(
            "SELECT tipo_esperado, status, conferencia_json FROM anexos"
            " WHERE tenant=? AND funcionario_id=? ORDER BY rowid DESC",
            (tenant, funcionario_id),
        ).fetchall()
    estado: dict[str, dict[str, Any]] = {}
    for linha in linhas:
        if linha["tipo_esperado"] in estado:
            continue
        conferencia = json.loads(linha["conferencia_json"]) if linha["conferencia_json"] else {}
        motivos = [m["texto"] for m in conferencia.get("motivos", []) if m.get("gravidade") == "recusa"]
        estado[linha["tipo_esperado"]] = {"status": linha["status"], "motivos": motivos}
    return estado


# ---------- respostas ----------


def _o_que_falta(itens, estado, hoje) -> tuple[str, dict[str, Any]]:
    pendentes, em_analise, partes, perto = [], [], [], []
    for item in itens:
        ultimo = estado.get(item.tipo, {})
        status_envio = ultimo.get("status")
        if item.status in ("faltando", "vencido"):
            if status_envio in NO_DP:
                em_analise.append(item.tipo)
                partes.append(f"{NOME[item.tipo]} recebido e em análise no DP")
                continue
            pendentes.append(item.tipo)
            if item.status == "vencido":
                linha = f"{NOME[item.tipo]} (venceu em {_dmy(item.validade_ate)})"
            elif status_envio == "recusar":
                linha = f"{NOME[item.tipo]} (o último envio foi recusado; mande um novo)"
            else:
                linha = f"{NOME[item.tipo]} (ainda não recebi)"
            partes.append(linha)
        elif item.status == "a_vencer":
            perto.append(f"seu {NOME[item.tipo]} vence em {_dmy(item.validade_ate)}; já pode mandar o novo")
    if pendentes or em_analise:
        frases = []
        if pendentes:
            frases.append("Falta: " + "; ".join(p for p in partes if not p.endswith("em análise no DP")) + ".")
        if em_analise:
            frases.append(" ".join(p[0].upper() + p[1:] + "." for p in partes if p.endswith("em análise no DP")))
        texto = " ".join(frases)
    else:
        texto = "Está tudo em dia: nenhum documento pendente."
    if perto:
        texto += " Atenção: " + "; ".join(perto) + "."
    return texto, {"pendentes": pendentes, "em_analise": em_analise}


def _por_que_recusou(itens, estado, tipo) -> tuple[str, dict[str, Any]]:
    tipos = [tipo] if tipo else [item.tipo for item in itens]
    recusados = [t for t in tipos if estado.get(t, {}).get("status") == "recusar"]
    escalados = [t for t in tipos if estado.get(t, {}).get("status") == "escalar"]
    frases = []
    for t in recusados:
        motivos = estado[t]["motivos"] or ["a conferência não foi concluída"]
        frases.append(f"Seu {NOME[t]} foi recusado: " + "; ".join(motivos) + ". Mande um novo que corrija isso.")
    for t in escalados:
        frases.append(f"Seu {NOME[t]} está com o DP para conferência; a resposta chega por aqui.")
    if not frases:
        frases.append("Não há nenhum documento recusado no momento.")
    return " ".join(frases), {"recusados": recusados, "no_dp": escalados}


def _quando_vence(itens, estado, tipo, hoje) -> tuple[str, dict[str, Any]]:
    selecionados = [item for item in itens if tipo is None or item.tipo == tipo]
    frases, validades = [], {}
    for item in selecionados:
        nome = NOME[item.tipo]
        if item.validade_ate is None:
            if estado.get(item.tipo, {}).get("status") in NO_DP:
                frases.append(f"Seu {nome} está em análise; a validade sai quando o DP aprovar.")
            else:
                frases.append(f"Ainda não recebi seu {nome}.")
            continue
        validades[item.tipo] = item.validade_ate.isoformat()
        if item.status == "vencido":
            frases.append(
                f"Seu {nome} venceu em {_dmy(item.validade_ate)}. Até mandar um novo, "
                f"você não pode {ATIVIDADE[item.tipo]}."
            )
            continue
        dias = (item.validade_ate - hoje).days
        frase = f"Seu {nome} vale até {_dmy(item.validade_ate)} (faltam {dias} dias)."
        if item.renovar_a_partir_de and item.renovar_a_partir_de > hoje:
            frase += f" A renovação começa em {_dmy(item.renovar_a_partir_de)}."
        else:
            frase += " Já pode mandar o novo."
        frases.append(frase)
    return " ".join(frases), {"validades": validades}


def responder_duvida(
    texto: str,
    *,
    pessoa: Funcionario,
    matriz: Matriz,
    validades: dict[str, date],
    estado: dict[str, dict[str, Any]],
    hoje: date,
) -> RespostaDuvida | None:
    """Responde só com o que a matriz e os registros sustentam; None se a mensagem não for dúvida."""
    duvida = classificar_duvida(texto)
    if not duvida.intencoes:
        return None
    primeiro_nome = pessoa.nome.split()[0]
    exigidos = {e.tipo for e in matriz.exigencias}
    if duvida.tipo and duvida.tipo not in exigidos:
        return RespostaDuvida(
            intencoes=duvida.intencoes, tipo=duvida.tipo,
            texto=f"{primeiro_nome}, seu cargo não exige {NOME[duvida.tipo]}.", dados={"nao_exigido": duvida.tipo},
        )
    itens = situacao_matriz(matriz, validades, hoje)
    frases, dados = [], {}
    for intencao in duvida.intencoes:
        if intencao == "o_que_falta":
            frase, extra = _o_que_falta(itens, estado, hoje)
        elif intencao == "por_que_recusou":
            frase, extra = _por_que_recusou(itens, estado, duvida.tipo)
        else:
            frase, extra = _quando_vence(itens, estado, duvida.tipo, hoje)
        frases.append(frase)
        dados.update(extra)
    corpo = " ".join(frases)
    return RespostaDuvida(
        intencoes=duvida.intencoes, tipo=duvida.tipo, texto=f"{primeiro_nome}, {corpo[0].lower()}{corpo[1:]}", dados=dados
    )
