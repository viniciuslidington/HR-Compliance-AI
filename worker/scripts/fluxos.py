"""Utilitário para ver os fluxos do agente rodando, etapa por etapa, com inferência real.

Uso (de dentro de worker/):
    uv run python scripts/fluxos.py admissao       # Pedro, eletricista: NR-35 vencida, depois matriz completa
    uv run python scripts/fluxos.py renovacao      # Carlos: aviso, lembretes, renova OU fica impedido (card P0)
    uv run python scripts/fluxos.py escalacao      # 3 recusas seguidas do mesmo documento viram card no DP
    uv run python scripts/fluxos.py todos
Opções:
    --detalhe      mostra a transcrição e os campos extraídos completos
    --dados DIR    guarda bucket e banco em DIR (padrão: pasta temporária nova a cada execução)

O relógio é simulado: cada passo declara o dia em que acontece.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import tempfile
import time
from datetime import date, datetime
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(RAIZ))

from ia.config import carregar_env  # noqa: E402
from ia.documentos import Funcionario  # noqa: E402
from ia.llm import FeatherlessLLM, FeatherlessTranscritor  # noqa: E402
from ia.matriz import carregar_matriz  # noqa: E402
from ia.orquestrador import AgenteDocumental, Etapa  # noqa: E402
from infra.anexos import BucketLocal, RepositorioAnexos  # noqa: E402

CONTRATOS = RAIZ.parent / "contracts"
FIXTURES = RAIZ / "tests" / "fixtures"
COR = sys.stdout.isatty()


def cor(texto: str, codigo: str) -> str:
    return f"\033[{codigo}m{texto}\033[0m" if COR else texto


ICONE = {
    "bucket": "📦", "recebimento": "📥", "transcricao": "👁 ", "extracao": "🧾", "fidelidade": "🔎",
    "conferencia": "📏", "decisao": "⚖️ ", "tentativas": "🔁", "registro": "💾", "mensagem": "💬",
    "fila": "📋", "card": "🚨", "matriz": "🗂 ", "aprovacao": "✅", "regua": "⏰",
}


class Execucao:
    def __init__(self, detalhe: bool, dados: Path):
        self.detalhe = detalhe
        self.dados = dados
        self.llm = FeatherlessLLM()
        self.transcritor = FeatherlessTranscritor()
        seed = json.loads((CONTRATOS / "seed" / "funcionarios.json").read_text(encoding="utf-8"))
        self.agente = AgenteDocumental(
            transcritor=self.transcritor,
            llm=self.llm,
            bucket=BucketLocal(dados / "bucket"),
            repo=RepositorioAnexos(dados / "anexos.db"),
            tenant=seed["tenant"],
            funcionarios={f["id"]: Funcionario(**f) for f in seed["funcionarios"]},
            matrizes={m.cargo: m for m in (carregar_matriz(p) for p in sorted((CONTRATOS / "matrizes").glob("*.yaml")))},
        )
        self.passo = 0

    def titulo(self, texto: str) -> None:
        print("\n" + cor(f"══ {texto} ", "1;36") + cor("═" * max(0, 78 - len(texto)), "36"))

    def mostrar(self, dia: datetime, descricao: str, etapas: list[Etapa]) -> list[Etapa]:
        self.passo += 1
        print(cor(f"\n▶ Passo {self.passo} · {dia.strftime('%d/%m/%Y %H:%M')} · {descricao}", "1"))
        if not etapas:
            print(cor("   (nada a fazer)", "2"))
        for e in etapas:
            tempo = cor(f" {e.duracao_ms} ms", "33") if e.duracao_ms is not None else ""
            resumo = e.resumo if (self.detalhe or len(e.resumo) <= 150) else e.resumo[:147] + "..."
            destaque = "1;31" if e.nome == "card" or "escalar" in e.resumo else "1;32" if "pronto para iniciar" in e.resumo else "0"
            print(f"   {ICONE.get(e.nome, '• ')} {cor(e.nome, '35')}{tempo}  {cor(resumo, destaque)}")
            if self.detalhe and e.nome == "transcricao" and "texto" in e.dados:
                print(cor("      " + e.dados["texto"].replace("\n", "\n      "), "2"))
        return etapas

    def enviar(self, dia: datetime, pessoa: str, tipo: str, arquivo: str, descricao: str) -> list[Etapa]:
        imagem = (FIXTURES / arquivo).read_bytes()
        return self.mostrar(dia, descricao, self.agente.receber_documento(pessoa, tipo, imagem, "image/png", agora=dia))

    def resumo(self, inicio: float) -> None:
        trace = self.transcritor.trace + self.llm.trace
        tokens = sum((r.tokens_entrada or 0) + (r.tokens_saida or 0) for r in trace)
        erros = [r for r in trace if r.erro]
        print(cor("\n── Resumo ", "1;36") + cor("─" * 68, "36"))
        print(f"   chamadas ao modelo: {len(trace)} ({len(self.transcritor.trace)} de visão), {tokens} tokens, {len(erros)} com erro")
        print(f"   mensagens ao colaborador: {len(self.agente.mensagens)} · tarefas na fila do DP: {len(self.agente.tarefas)}")
        print(f"   tempo total: {time.monotonic() - inicio:.1f}s · dados em {self.dados}")


def fluxo_admissao(x: Execucao) -> None:
    x.titulo("Admissão · Pedro Henrique Alves, eletricista de manutenção")
    d = datetime(2026, 11, 7, 9, 0)
    x.enviar(d, "F-31", "nr35", "nr35_pedro_2023.png", "Pedro envia a NR-35 antiga (2023)")
    r35 = x.enviar(d.replace(hour=9, minute=20), "F-31", "nr35", "nr35_pedro_2025.png", "Pedro envia a NR-35 do periódico (2025)")
    r10 = x.enviar(d.replace(hour=9, minute=25), "F-31", "nr10", "nr10_pedro_2025.png", "Pedro envia a NR-10")
    aso = x.enviar(d.replace(hour=9, minute=30), "F-31", "aso", "aso_pedro_2026.png", "Pedro envia o ASO admissional")
    for etapas, rotulo in ((r35, "NR-35"), (r10, "NR-10"), (aso, "ASO")):
        decisao = next(e for e in etapas if e.nome == "decisao").dados["decisao"]
        anexo_id = next(e for e in etapas if e.nome == "recebimento").dados["anexo_id"]
        if decisao == "pedir_aprovacao":
            x.mostrar(d.replace(hour=10), f"DP aprova o {rotulo}", x.agente.aprovar(anexo_id, aprovador="dp-ana", agora=d.replace(hour=10)))


def fluxo_renovacao(x: Execucao) -> None:
    x.titulo("Renovação · Carlos Alberto Souza, NR-35 vence em 03/12/2026")
    d = datetime(2026, 11, 7, 8, 0)
    etapas = x.enviar(d, "F-12", "nr35", "nr35_carlos_2024.png", "Base: NR-35 de 03/12/2024 entra no cadastro")
    anexo_id = next(e for e in etapas if e.nome == "recebimento").dados["anexo_id"]
    x.mostrar(d, "DP aprova a NR-35 atual", x.agente.aprovar(anexo_id, aprovador="dp-ana", agora=d))
    for dia, texto in ((date(2026, 11, 7), "agente roda a régua"), (date(2026, 11, 7), "régua de novo no mesmo dia (não repete)"), (date(2026, 11, 12), "régua")):
        agora = datetime.combine(dia, datetime.min.time()).replace(hour=8)
        x.mostrar(agora, texto, x.agente.rodar_regua(hoje=dia, agora=agora))

    print(cor("\n   ┌ Caminho A: Carlos renova a NR-35 em 20/11", "1;34"))
    dados_b = Path(tempfile.mkdtemp(prefix="fluxo-renovacao-b-"))
    agente_a_dados = x.dados
    novo = x.enviar(datetime(2026, 11, 21, 9, 0), "F-12", "nr35", "nr35_carlos_2026.png", "Carlos envia a NR-35 nova")
    novo_id = next(e for e in novo if e.nome == "recebimento").dados["anexo_id"]
    x.mostrar(datetime(2026, 11, 21, 10, 0), "DP aprova a NR-35 nova", x.agente.aprovar(novo_id, aprovador="dp-ana", agora=datetime(2026, 11, 21, 10, 0)))
    for dia in (date(2026, 12, 1), date(2026, 12, 3)):
        agora = datetime.combine(dia, datetime.min.time()).replace(hour=8)
        x.mostrar(agora, "régua (documento já renovado)", x.agente.rodar_regua(hoje=dia, agora=agora))

    print(cor("\n   └ Caminho B: Carlos não renova (mesmo ponto de partida, outro banco)", "1;34"))
    y = Execucao(x.detalhe, dados_b)
    y.passo = x.passo
    etapas = y.agente.receber_documento("F-12", "nr35", (FIXTURES / "nr35_carlos_2024.png").read_bytes(), "image/png", agora=d)
    anexo_b = next(e for e in etapas if e.nome == "recebimento").dados["anexo_id"]
    y.agente.aprovar(anexo_b, aprovador="dp-ana", agora=d)
    for dia in (date(2026, 11, 7), date(2026, 11, 12), date(2026, 12, 1), date(2026, 12, 3)):
        agora = datetime.combine(dia, datetime.min.time()).replace(hour=8)
        y.mostrar(agora, "régua (sem resposta do Carlos)", y.agente.rodar_regua(hoje=dia, agora=agora))
    x.passo = y.passo
    x.llm.trace += y.llm.trace
    x.transcritor.trace += y.transcritor.trace
    x.agente.mensagens += y.agente.mensagens
    x.agente.tarefas += y.agente.tarefas
    x.dados = agente_a_dados


def fluxo_escalacao(x: Execucao) -> None:
    x.titulo("Escalação · Pedro erra a NR-35 três vezes seguidas")
    d = datetime(2026, 11, 7, 14, 0)
    x.enviar(d, "F-31", "nr35", "nr35_pedro_2023.png", "1ª tentativa: certificado de 2023 (vencido)")
    x.enviar(d.replace(minute=10), "F-31", "nr35", "nr35_pedro_carga4h.png", "2ª tentativa: certificado com carga de 4h")
    x.enviar(d.replace(minute=20), "F-31", "nr35", "nr10_pedro_2025.png", "3ª tentativa: manda a NR-10 no lugar da NR-35")


FLUXOS = {"admissao": fluxo_admissao, "renovacao": fluxo_renovacao, "escalacao": fluxo_escalacao}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("fluxo", choices=[*FLUXOS, "todos"])
    parser.add_argument("--detalhe", action="store_true")
    parser.add_argument("--dados", type=Path)
    args = parser.parse_args()

    carregar_env()
    if not os.environ.get("FEATHERLESS_API_KEY"):
        print("FEATHERLESS_API_KEY não encontrada. Copie worker/.env.example para worker/.env e preencha a chave.")
        return 2
    inicio = time.monotonic()
    for nome in FLUXOS if args.fluxo == "todos" else [args.fluxo]:
        dados = args.dados or Path(tempfile.mkdtemp(prefix=f"fluxo-{nome}-"))
        execucao = Execucao(args.detalhe, dados)
        print(cor(f"modelo de texto: {execucao.llm.modelo} · visão: {execucao.transcritor.modelo}", "2"))
        FLUXOS[nome](execucao)
        execucao.resumo(inicio)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
