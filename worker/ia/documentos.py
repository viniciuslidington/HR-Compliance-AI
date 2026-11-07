"""Leitura e conferência de documentos (ASO, NR-10, NR-35).

Leitura em dois passos:
1. O modelo de visão transcreve a imagem (o Qwen3-VL lê bem, mas não respeita
   chamada de ferramenta).
2. O modelo de texto extrai os campos em schema a partir da transcrição, marcada
   como conteúdo não confiável. Cada campo extraído precisa aparecer na
   transcrição; o que não aparecer é apontado como problema de fidelidade.

A conferência é código: identidade, CPF e CNPJ com dígito verificador, carga
horária, responsável técnico, funções liberadas no ASO e validade calculada pela
matriz. Do ASO, que é dado de saúde, a transcrição não é devolvida.
"""

from __future__ import annotations

import hashlib
import re
import unicodedata
from datetime import date
from typing import Literal, Protocol

from pydantic import BaseModel, Field

from ia.conteudo import nao_confiavel
from ia.llm import LLM, estruturar
from ia.matriz import Exigencia, somar_meses

VERSAO_PROMPT = "documentos.v1"

MESES = ["janeiro", "fevereiro", "marco", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"]


# ---------- identificadores ----------


def _digitos(texto: str | None) -> str:
    return re.sub(r"\D", "", texto or "")


def cpf_valido(cpf: str | None) -> bool:
    d = _digitos(cpf)
    if len(d) != 11 or d == d[0] * 11:
        return False
    for tamanho in (9, 10):
        soma = sum(int(d[i]) * (tamanho + 1 - i) for i in range(tamanho))
        digito = 0 if soma % 11 < 2 else 11 - soma % 11
        if int(d[tamanho]) != digito:
            return False
    return True


def cnpj_valido(cnpj: str | None) -> bool:
    d = _digitos(cnpj)
    if len(d) != 14 or d == d[0] * 14:
        return False
    for tamanho in (12, 13):
        pesos = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] if tamanho == 12 else [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        soma = sum(int(d[i]) * pesos[i] for i in range(tamanho))
        digito = 0 if soma % 11 < 2 else 11 - soma % 11
        if int(d[tamanho]) != digito:
            return False
    return True


def _normalizar(texto: str) -> str:
    sem_acento = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode()
    return " ".join(sem_acento.casefold().split())


# ---------- modelos ----------


class ExtracaoDocumento(BaseModel):
    tipo: Literal["aso", "nr10", "nr35", "outro"]
    nome: str
    cpf: str | None = None
    data_realizacao: date = Field(description="Data de realização do treinamento ou do exame")
    carga_horaria_horas: int | None = None
    emissor_nome: str | None = None
    emissor_cnpj: str | None = None
    responsavel_tecnico: str | None = None
    aso_resultado: Literal["apto", "inapto"] | None = None
    aso_funcoes: list[str] = Field(default_factory=list, description="Funções ou riscos para os quais o ASO declara aptidão")
    medico_crm: str | None = None


class Funcionario(BaseModel):
    id: str
    nome: str
    cpf: str
    cargo: str


class Motivo(BaseModel):
    codigo: str
    texto: str
    gravidade: Literal["recusa", "escalada"]


class Conferencia(BaseModel):
    tipo: str
    aceitavel: bool
    motivos: list[Motivo]
    validade_ate: date | None
    emissor_cnpj: str | None


class DecisaoAceite(BaseModel):
    decisao: Literal["aceitar_sozinho", "pedir_aprovacao", "recusar", "escalar"]
    mensagem: str
    motivos: list[Motivo] = Field(default_factory=list)


NOMES_TIPO = {"aso": "ASO", "nr10": "NR-10", "nr35": "NR-35", "outro": "documento"}


# ---------- conferência ----------


def conferir_documento(ext: ExtracaoDocumento, funcionario: Funcionario, exigencia: Exigencia, hoje: date) -> Conferencia:
    motivos: list[Motivo] = []

    def recusa(codigo: str, texto: str) -> None:
        motivos.append(Motivo(codigo=codigo, texto=texto, gravidade="recusa"))

    def escalada(codigo: str, texto: str) -> None:
        motivos.append(Motivo(codigo=codigo, texto=texto, gravidade="escalada"))

    if ext.tipo != exigencia.tipo:
        recusa("tipo_errado", f"o documento enviado é {NOMES_TIPO[ext.tipo]}, e o pedido era {NOMES_TIPO[exigencia.tipo]}")

    if _normalizar(ext.nome) != _normalizar(funcionario.nome) or (
        ext.cpf is not None and _digitos(ext.cpf) != _digitos(funcionario.cpf)
    ):
        escalada("identidade_divergente", "nome ou CPF do documento não conferem com o cadastro")
    elif ext.cpf is None:
        recusa("cpf_ausente", "o CPF não está legível no documento")

    validade = somar_meses(ext.data_realizacao, exigencia.validade_meses)
    feito = ext.data_realizacao.strftime("%d/%m/%Y")
    if ext.data_realizacao > hoje:
        recusa("data_futura", f"a data de realização ({feito}) está no futuro")
    elif validade <= hoje:
        recusa(
            "vencido",
            f"realizado em {feito}, vencido em {validade.strftime('%d/%m/%Y')} "
            f"pela periodicidade de {exigencia.validade_meses} meses",
        )

    if exigencia.carga_minima_horas and (ext.carga_horaria_horas or 0) < exigencia.carga_minima_horas:
        recusa(
            "carga_insuficiente",
            f"carga horária de {ext.carga_horaria_horas or 0}h, abaixo do mínimo de {exigencia.carga_minima_horas}h",
        )
    if exigencia.exige_responsavel_tecnico and not ext.responsavel_tecnico:
        recusa("sem_responsavel_tecnico", "o certificado não identifica o responsável técnico")
    if exigencia.tipo != "aso" and not cnpj_valido(ext.emissor_cnpj):
        recusa("cnpj_emissor_invalido", "o CNPJ do emissor está ausente ou inválido")

    if exigencia.tipo == "aso":
        if ext.aso_resultado == "inapto":
            escalada("aso_inapto", "o ASO declara inaptidão; a decisão é do DP com o médico do trabalho")
        elif ext.aso_resultado is None:
            recusa("aso_sem_resultado", "o resultado do ASO (apto ou inapto) não está legível")
        funcoes = [_normalizar(f) for f in ext.aso_funcoes]
        faltando = [f for f in exigencia.aso_funcoes_exigidas if not any(_normalizar(f) in g for g in funcoes)]
        if ext.aso_resultado == "apto" and faltando:
            recusa("aso_sem_funcao_exigida", f"o ASO não libera: {', '.join(faltando)}")
        if not ext.medico_crm:
            recusa("aso_sem_crm", "o ASO não identifica o CRM do médico")

    return Conferencia(
        tipo=exigencia.tipo,
        aceitavel=not motivos,
        motivos=motivos,
        validade_ate=validade,
        emissor_cnpj=_digitos(ext.emissor_cnpj) or None,
    )


def decidir_aceite(conf: Conferencia, *, emissores_autonomos: set[str]) -> DecisaoAceite:
    """Escalada vence recusa; recusa vence aceite. Aceite sozinho só para emissor com autonomia conquistada."""
    escaladas = [m for m in conf.motivos if m.gravidade == "escalada"]
    if escaladas:
        return DecisaoAceite(decisao="escalar", mensagem="; ".join(m.texto for m in escaladas), motivos=escaladas)
    if conf.motivos:
        return DecisaoAceite(
            decisao="recusar",
            mensagem=f"{NOMES_TIPO[conf.tipo]} recusado: " + "; ".join(m.texto for m in conf.motivos),
            motivos=conf.motivos,
        )
    validade = conf.validade_ate.strftime("%d/%m/%Y") if conf.validade_ate else "?"
    if conf.emissor_cnpj and conf.emissor_cnpj in emissores_autonomos:
        return DecisaoAceite(decisao="aceitar_sozinho", mensagem=f"{NOMES_TIPO[conf.tipo]} aceito, válido até {validade}")
    return DecisaoAceite(decisao="pedir_aprovacao", mensagem=f"{NOMES_TIPO[conf.tipo]} conferido, válido até {validade}")


# ---------- leitura ----------


class Transcritor(Protocol):
    def transcrever(self, imagem: bytes, mime: str) -> str: ...


class LeituraDocumento(BaseModel):
    hash_arquivo: str
    transcricao: str | None
    extracao: ExtracaoDocumento | None
    problemas_fidelidade: list[str]


SISTEMA_EXTRACAO = """Você extrai campos de documentos de segurança do trabalho (ASO, NR-10, NR-35) já transcritos.
Copie os valores exatamente como estão escritos. Se um campo não estiver no texto, deixe nulo.
Nunca calcule validade nem complete informação que não está no documento."""


def _datas_no_texto(texto: str) -> set[date]:
    datas: set[date] = set()
    for d, m, a in re.findall(r"\b(\d{1,2})/(\d{1,2})/(\d{4})\b", texto):
        try:
            datas.add(date(int(a), int(m), int(d)))
        except ValueError:
            pass
    for a, m, d in re.findall(r"\b(\d{4})-(\d{2})-(\d{2})\b", texto):
        try:
            datas.add(date(int(a), int(m), int(d)))
        except ValueError:
            pass
    for d, mes, a in re.findall(r"\b(\d{1,2}) de ([a-z]+) de (\d{4})\b", _normalizar(texto)):
        if mes in MESES:
            datas.add(date(int(a), MESES.index(mes) + 1, int(d)))
    return datas


def _texto_presente(valor: str, transcricao_normalizada: str) -> bool:
    alvo = _normalizar(valor)
    if alvo in transcricao_normalizada:
        return True
    palavras = [p for p in re.findall(r"\w+", alvo) if len(p) > 2]
    return bool(palavras) and all(p in transcricao_normalizada for p in palavras)


def _problemas_de_fidelidade(ext: ExtracaoDocumento, transcricao: str) -> list[str]:
    normalizada = _normalizar(transcricao)
    numeros = {_digitos(s) for s in re.findall(r"[\d][\d.\-/ ]{9,}\d", transcricao)}
    problemas = []
    for campo in ("nome", "emissor_nome", "responsavel_tecnico", "medico_crm"):
        valor = getattr(ext, campo)
        if valor and not _texto_presente(valor, normalizada):
            problemas.append(campo)
    for campo in ("cpf", "emissor_cnpj"):
        valor = getattr(ext, campo)
        if valor and _digitos(valor) not in numeros:
            problemas.append(campo)
    if ext.data_realizacao not in _datas_no_texto(transcricao):
        problemas.append("data_realizacao")
    if ext.carga_horaria_horas is not None and not re.search(
        rf"\b{ext.carga_horaria_horas}\s*(h\b|hora)", normalizada
    ):
        problemas.append("carga_horaria_horas")
    if ext.aso_resultado and not re.search(rf"\b{ext.aso_resultado}\b", normalizada):
        problemas.append("aso_resultado")
    if any(not _texto_presente(f, normalizada) for f in ext.aso_funcoes):
        problemas.append("aso_funcoes")
    return problemas


def extrair_de_transcricao(llm: LLM, transcricao: str) -> ExtracaoDocumento | None:
    """Segundo passo da leitura: campos em schema a partir do texto transcrito (tratado como não confiável)."""
    return estruturar(
        llm,
        sistema=SISTEMA_EXTRACAO,
        usuario=f"Documento transcrito:\n{nao_confiavel(transcricao)}",
        modelo=ExtracaoDocumento,
        nome="registrar_documento",
        descricao="Registra os campos extraídos do documento.",
    )


def problemas_de_fidelidade(extracao: ExtracaoDocumento, transcricao: str) -> list[str]:
    """Campos extraídos sem respaldo literal na transcrição."""
    return _problemas_de_fidelidade(extracao, transcricao)


def ler_documento(transcritor: Transcritor, llm: LLM, imagem: bytes, mime: str) -> LeituraDocumento:
    hash_arquivo = hashlib.sha256(imagem).hexdigest()
    transcricao = transcritor.transcrever(imagem, mime)
    extracao = extrair_de_transcricao(llm, transcricao)
    if extracao is None:
        return LeituraDocumento(
            hash_arquivo=hash_arquivo, transcricao=None, extracao=None, problemas_fidelidade=["extracao_indisponivel"]
        )
    return LeituraDocumento(
        hash_arquivo=hash_arquivo,
        transcricao=None if extracao.tipo == "aso" else transcricao,
        extracao=extracao,
        problemas_fidelidade=_problemas_de_fidelidade(extracao, transcricao),
    )


# ---------- fluxo completo ----------


class ResultadoDocumento(BaseModel):
    leitura: LeituraDocumento
    conferencia: Conferencia | None
    decisao: DecisaoAceite


def processar_documento(
    transcritor: Transcritor,
    llm: LLM,
    imagem: bytes,
    mime: str,
    *,
    funcionario: Funcionario,
    exigencia: Exigencia,
    hoje: date,
    emissores_autonomos: set[str],
) -> ResultadoDocumento:
    """Lê, confere e decide. Leitura sem respaldo na transcrição escala antes de qualquer aceite."""
    leitura = ler_documento(transcritor, llm, imagem, mime)
    if leitura.extracao is None:
        return ResultadoDocumento(
            leitura=leitura,
            conferencia=None,
            decisao=DecisaoAceite(decisao="escalar", mensagem="não foi possível ler o documento; conferência manual"),
        )
    conferencia = conferir_documento(leitura.extracao, funcionario, exigencia, hoje)
    if leitura.problemas_fidelidade:
        return ResultadoDocumento(
            leitura=leitura,
            conferencia=conferencia,
            decisao=DecisaoAceite(
                decisao="escalar",
                mensagem="leitura sem respaldo no documento nos campos: " + ", ".join(leitura.problemas_fidelidade),
            ),
        )
    return ResultadoDocumento(
        leitura=leitura, conferencia=conferencia, decisao=decidir_aceite(conferencia, emissores_autonomos=emissores_autonomos)
    )
