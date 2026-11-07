"""Armazenamento de anexos: bucket para os arquivos, banco para metadados e resultado.

Bucket: arquivos originais imutáveis, endereçados pelo SHA-256 (o mesmo hash que
a leitura calcula). Chave: <tenant>/anexos/<sha256>, ou <tenant>/sensivel/<sha256>
para ASO, que é dado de saúde e deve ter política de acesso mais restrita.
`BucketLocal` serve para o hackathon; um bucket S3-compatível implementa a mesma
interface no deploy.

Banco: um registro por anexo recebido (SQLite no hackathon; PostgreSQL com
row-level security por tenant no piloto). A transcrição de ASO nunca é gravada.
"""

from __future__ import annotations

import hashlib
import json
import re
import sqlite3
import uuid
from datetime import date, datetime
from pathlib import Path
from typing import Protocol

from ia.documentos import ResultadoDocumento

_TENANT = re.compile(r"^[A-Za-z0-9_-]+$")
STATUS_ACEITO = ("aceitar_sozinho", "aprovado")


class Bucket(Protocol):
    def salvar(self, dados: bytes, *, tenant: str, sensivel: bool) -> str: ...
    def ler(self, chave: str) -> bytes: ...


class BucketLocal:
    """Bucket em diretório local, com a mesma semântica de chave de um bucket S3."""

    def __init__(self, raiz: str | Path):
        self.raiz = Path(raiz).resolve()
        self.raiz.mkdir(parents=True, exist_ok=True)

    def _caminho(self, chave: str) -> Path:
        caminho = (self.raiz / chave).resolve()
        if ".." in Path(chave).parts or not caminho.is_relative_to(self.raiz):
            raise ValueError(f"chave inválida: {chave}")
        return caminho

    def salvar(self, dados: bytes, *, tenant: str, sensivel: bool) -> str:
        if not _TENANT.match(tenant):
            raise ValueError(f"tenant inválido: {tenant}")
        chave = f"{tenant}/{'sensivel' if sensivel else 'anexos'}/{hashlib.sha256(dados).hexdigest()}"
        caminho = self._caminho(chave)
        if not caminho.exists():  # conteúdo endereçado por hash: nunca sobrescreve
            caminho.parent.mkdir(parents=True, exist_ok=True)
            temporario = caminho.with_suffix(".tmp")
            temporario.write_bytes(dados)
            temporario.replace(caminho)
        return chave

    def ler(self, chave: str) -> bytes:
        return self._caminho(chave).read_bytes()


ESQUEMA = """
CREATE TABLE IF NOT EXISTS anexos (
    id                    TEXT PRIMARY KEY,
    tenant                TEXT NOT NULL,
    funcionario_id        TEXT NOT NULL,
    tipo_esperado         TEXT NOT NULL,
    sha256                TEXT NOT NULL,
    mime                  TEXT NOT NULL,
    tamanho               INTEGER NOT NULL,
    chave                 TEXT NOT NULL,
    recebido_em           TEXT NOT NULL,
    status                TEXT NOT NULL DEFAULT 'recebido',
    tipo_lido             TEXT,
    transcricao           TEXT,
    extracao_json         TEXT,
    conferencia_json      TEXT,
    problemas_fidelidade  TEXT,
    decisao_mensagem      TEXT,
    validade_ate          TEXT,
    aprovado_por          TEXT,
    aprovado_em           TEXT,
    UNIQUE (tenant, funcionario_id, tipo_esperado, sha256)
);
CREATE INDEX IF NOT EXISTS anexos_por_pessoa ON anexos (tenant, funcionario_id, status);
CREATE TABLE IF NOT EXISTS lembretes (
    tenant          TEXT NOT NULL,
    funcionario_id  TEXT NOT NULL,
    tipo            TEXT NOT NULL,
    validade_ate    TEXT NOT NULL,
    etapa           TEXT NOT NULL,
    enviado_em      TEXT NOT NULL,
    PRIMARY KEY (tenant, funcionario_id, tipo, validade_ate, etapa)
);
"""


class RepositorioAnexos:
    def __init__(self, caminho: str | Path):
        self.caminho = str(caminho)
        with self._conectar() as conexao:
            conexao.executescript(ESQUEMA)

    def _conectar(self) -> sqlite3.Connection:
        conexao = sqlite3.connect(self.caminho)
        conexao.row_factory = sqlite3.Row
        return conexao

    def registrar_recebimento(
        self,
        *,
        tenant: str,
        funcionario_id: str,
        tipo_esperado: str,
        sha256: str,
        mime: str,
        tamanho: int,
        chave: str,
        recebido_em: datetime,
    ) -> str:
        """Idempotente: o mesmo arquivo reenviado para a mesma exigência devolve o mesmo anexo."""
        with self._conectar() as conexao:
            existente = conexao.execute(
                "SELECT id FROM anexos WHERE tenant=? AND funcionario_id=? AND tipo_esperado=? AND sha256=?",
                (tenant, funcionario_id, tipo_esperado, sha256),
            ).fetchone()
            if existente:
                return existente["id"]
            anexo_id = uuid.uuid4().hex
            conexao.execute(
                "INSERT INTO anexos (id, tenant, funcionario_id, tipo_esperado, sha256, mime, tamanho, chave, recebido_em)"
                " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (anexo_id, tenant, funcionario_id, tipo_esperado, sha256, mime, tamanho, chave, recebido_em.isoformat()),
            )
            return anexo_id

    def registrar_resultado(self, anexo_id: str, resultado: ResultadoDocumento) -> None:
        anexo = self.obter(anexo_id)
        extracao = resultado.leitura.extracao
        sensivel = anexo["tipo_esperado"] == "aso" or (extracao is not None and extracao.tipo == "aso")
        with self._conectar() as conexao:
            conexao.execute(
                "UPDATE anexos SET status=?, tipo_lido=?, transcricao=?, extracao_json=?, conferencia_json=?,"
                " problemas_fidelidade=?, decisao_mensagem=?, validade_ate=? WHERE id=?",
                (
                    resultado.decisao.decisao,
                    extracao.tipo if extracao else None,
                    None if sensivel else resultado.leitura.transcricao,
                    extracao.model_dump_json() if extracao else None,
                    resultado.conferencia.model_dump_json() if resultado.conferencia else None,
                    json.dumps(resultado.leitura.problemas_fidelidade, ensure_ascii=False),
                    resultado.decisao.mensagem,
                    resultado.conferencia.validade_ate.isoformat()
                    if resultado.conferencia and resultado.conferencia.validade_ate
                    else None,
                    anexo_id,
                ),
            )

    def aprovar(self, anexo_id: str, *, aprovador: str, em: datetime) -> None:
        with self._conectar() as conexao:
            alterados = conexao.execute(
                "UPDATE anexos SET status='aprovado', aprovado_por=?, aprovado_em=? WHERE id=? AND status='pedir_aprovacao'",
                (aprovador, em.isoformat(), anexo_id),
            ).rowcount
        if alterados != 1:
            raise ValueError(f"anexo {anexo_id} não está aguardando aprovação")

    def obter(self, anexo_id: str) -> dict:
        with self._conectar() as conexao:
            linha = conexao.execute("SELECT * FROM anexos WHERE id=?", (anexo_id,)).fetchone()
        if linha is None:
            raise KeyError(anexo_id)
        return dict(linha)

    def validades_vigentes(self, tenant: str, funcionario_id: str) -> dict[str, date]:
        """Maior validade entre os documentos aceitos de cada tipo; entrada para situacao_matriz()."""
        with self._conectar() as conexao:
            linhas = conexao.execute(
                f"SELECT tipo_esperado, MAX(validade_ate) AS validade FROM anexos"
                f" WHERE tenant=? AND funcionario_id=? AND status IN ({','.join('?' * len(STATUS_ACEITO))})"
                f" AND validade_ate IS NOT NULL GROUP BY tipo_esperado",
                (tenant, funcionario_id, *STATUS_ACEITO),
            ).fetchall()
        return {linha["tipo_esperado"]: date.fromisoformat(linha["validade"]) for linha in linhas}

    # ---------- renovação e tentativas ----------

    def registrar_lembrete(
        self, *, tenant: str, funcionario_id: str, tipo: str, validade_ate: date, etapa: str, enviado_em: datetime
    ) -> bool:
        """Idempotente: devolve False se essa etapa já foi enviada para essa validade."""
        with self._conectar() as conexao:
            cursor = conexao.execute(
                "INSERT OR IGNORE INTO lembretes (tenant, funcionario_id, tipo, validade_ate, etapa, enviado_em)"
                " VALUES (?, ?, ?, ?, ?, ?)",
                (tenant, funcionario_id, tipo, validade_ate.isoformat(), etapa, enviado_em.isoformat()),
            )
            return cursor.rowcount == 1

    def lembretes_enviados(self, tenant: str, funcionario_id: str, tipo: str, validade_ate: date) -> set[str]:
        with self._conectar() as conexao:
            linhas = conexao.execute(
                "SELECT etapa FROM lembretes WHERE tenant=? AND funcionario_id=? AND tipo=? AND validade_ate=?",
                (tenant, funcionario_id, tipo, validade_ate.isoformat()),
            ).fetchall()
        return {linha["etapa"] for linha in linhas}

    def falhas_seguidas(self, tenant: str, funcionario_id: str, tipo: str) -> int:
        """Recusas consecutivas do mesmo documento desde o último aceite (base da escalada após 3 falhas)."""
        with self._conectar() as conexao:
            status = [
                linha["status"]
                for linha in conexao.execute(
                    "SELECT status FROM anexos WHERE tenant=? AND funcionario_id=? AND tipo_esperado=? ORDER BY rowid DESC",
                    (tenant, funcionario_id, tipo),
                )
            ]
        falhas = 0
        for s in status:
            if s in STATUS_ACEITO:
                break
            falhas += s == "recusar"
        return falhas
