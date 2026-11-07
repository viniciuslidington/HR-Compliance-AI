"""Roda os agentes com inferência real (Featherless) nas histórias da demo.

Uso:  cd worker && uv run python scripts/rodar_agentes.py
Precisa de FEATHERLESS_API_KEY no ambiente ou em worker/.env.

Cada etapa mostra o resultado e confere a decisão esperada. No fim, imprime o
trace: chamadas, latência, tokens e quantas chamadas vieram como texto.
Sai com código 1 se alguma expectativa falhar.
"""

from __future__ import annotations

import os
import sys
from datetime import date, datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from ia.autonomia import pode_autoaplicar  # noqa: E402
from ia.card import montar_card  # noqa: E402
from ia.fila import Analista, Tarefa, atribuir  # noqa: E402
from ia.compilador import compilar_playbook  # noqa: E402
from ia.config import carregar_env  # noqa: E402
from ia.estrategico import AchadoAutonomia, redigir_sugestao  # noqa: E402
from ia.interpretacao import interpretar_resposta  # noqa: E402
from ia.llm import FeatherlessLLM  # noqa: E402
from ia.playbook import TetoPolitica, carregar_playbook  # noqa: E402
from ia.proximo_passo import propor_proxima_acao  # noqa: E402
from ia.redacao import redigir_mensagem  # noqa: E402
from ia.relatorio import ResumoCaso, redigir_relatorio_excecao  # noqa: E402

CONTRATOS = Path(__file__).resolve().parents[2] / "contracts" / "playbooks"
ESCALA = ["08:00", "12:00", "13:00", "17:00"]
TETO = TetoPolitica()

falhas: list[str] = []


def titulo(texto: str) -> None:
    print(f"\n=== {texto} ===")


def conferir(descricao: str, obtido, esperado) -> None:
    ok = obtido == esperado
    print(f"  [{'ok' if ok else 'FALHOU'}] {descricao}: {obtido!r}" + ("" if ok else f" (esperado {esperado!r})"))
    if not ok:
        falhas.append(descricao)


def main() -> int:
    carregar_env()
    if not os.environ.get("FEATHERLESS_API_KEY"):
        print("FEATHERLESS_API_KEY não encontrada. Copie worker/.env.example para worker/.env e preencha a chave.")
        return 2
    llm = FeatherlessLLM()
    print(f"Modelo: {llm.modelo}")
    v1 = carregar_playbook(CONTRATOS / "marcacao_impar.v1.yaml")
    v2 = carregar_playbook(CONTRATOS / "marcacao_impar.v2.yaml")

    titulo("Ato 1 · Marina: mensagem iniciada pelo agente")
    msg = redigir_mensagem(
        llm,
        "pendencia_marcacao",
        {"nome": "Marina", "data": "17/11", "dia_semana": "terça-feira", "marcacoes_registradas": "08:03, 12:00 e 13:01"},
    )
    print(f"  ({msg.origem}) {msg.texto}")

    titulo("Ato 1 · Marina responde")
    enc = interpretar_resposta(
        llm, data_caso=date(2026, 11, 17), marcacoes=["08:03", "12:00", "13:01"], texto="Oi! Esqueci de bater, saí 17:04."
    )
    conferir("decisão", enc.decisao, "seguir")
    conferir("horário", enc.interpretacao.horario if enc.interpretacao else None, "17:04")
    conferir(
        "v1 autoaplica?",
        pode_autoaplicar(v1, TETO, escala=ESCALA, marcacoes=["08:03", "12:00", "13:01"], horario_proposto="17:04", informado_por="funcionario").permitido,
        False,
    )

    titulo("Ato 2 · Estratégico sugere a v2")
    achado = AchadoAutonomia(
        categoria="saida_esquecida_ate_5_min",
        aprovador_nome="Gestora G2",
        janela_dias=90,
        decisoes=49,
        aprovadas_na_primeira=48,
        reaberturas=0,
        playbook="marcacao_impar",
        versao_atual=1,
    )
    sugestao = redigir_sugestao(llm, achado, TETO, base=v1)
    print(f"  ({sugestao.origem}) {sugestao.titulo}\n  {sugestao.texto}")
    conferir("rascunho válido", sugestao.erros_validacao, [])

    titulo("Ato 3 · Rafael responde e a v2 aplica sozinha")
    enc = interpretar_resposta(
        llm, data_caso=date(2026, 11, 23), marcacoes=["08:00", "12:00", "13:00"], texto="saí 17h03, foi mal"
    )
    conferir("decisão", enc.decisao, "seguir")
    horario = enc.interpretacao.horario if enc.interpretacao else None
    conferir("horário", horario, "17:03")
    if horario:
        decisao = pode_autoaplicar(
            v2, TETO, escala=ESCALA, marcacoes=["08:00", "12:00", "13:00"], horario_proposto=horario, informado_por="funcionario"
        )
        conferir("v2 autoaplica?", decisao.permitido, True)

    titulo("Ato 4 · Joana: fora da tolerância e conflito")
    enc = interpretar_resposta(
        llm,
        data_caso=date(2026, 11, 19),
        marcacoes=["07:58", "12:02", "13:00"],
        texto="Saí 18:30 nesse dia, fiquei fechando a expedição",
    )
    conferir("decisão", enc.decisao, "seguir")
    conferir("horário", enc.interpretacao.horario if enc.interpretacao else None, "18:30")
    conferir(
        "v2 autoaplica?",
        pode_autoaplicar(v2, TETO, escala=ESCALA, marcacoes=["07:58", "12:02", "13:00"], horario_proposto="18:30", informado_por="funcionario").permitido,
        False,
    )
    resumo_joana = ResumoCaso(
            caso_id="C-15",
            funcionario="Joana Pereira",
            data=date(2026, 11, 19),
            ocorrencia="saída não registrada",
            tentativas=["pedido à funcionária em 24/11 09:10", "aprovação pedida à gestora em 24/11 09:40"],
            respostas=["funcionária informou 18:30", "gestora informou 17:00"],
            motivo_nao_resolucao="versões conflitantes entre funcionária e gestora",
            informacao_ausente="horário efetivo de saída",
            proxima_acao="DP confere a saída antes do fechamento",
            responsavel="DP",
            prazo=date(2026, 11, 25),
            evidencias=["espelho:V15:2026-11-19:v1", "msg:M-881", "aprovacao:A-112"],
    )
    relatorio = redigir_relatorio_excecao(llm, resumo_joana)
    print(f"  ({relatorio.origem_resumo}) {relatorio.resumo}")

    titulo("Ato 4 · Joana vira card na fila do DP")
    agora = datetime(2026, 11, 24, 15, 0)
    analistas = [Analista(id="ana", nome="Ana"), Analista(id="bia", nome="Bia")]
    aberta_da_ana = Tarefa(
        id="T-09", caso_id="C-09", empresa_id="E1", criada_em=agora, prazo=datetime(2026, 11, 25, 9, 0),
        atribuida_a="ana", atribuida_em=agora,
    )
    tarefa = Tarefa(id="T-15", caso_id="C-15", empresa_id="E1", criada_em=agora, prazo=datetime(2026, 11, 25, 9, 0))
    atribuicao = atribuir(tarefa, analistas, [aberta_da_ana], agora, ponteiro="ana")
    conferir("atribuída a", atribuicao.analista_id, "bia")
    tarefa = tarefa.model_copy(update={"atribuida_a": atribuicao.analista_id, "atribuida_em": agora})
    card = montar_card(llm, resumo_joana, tarefa, agora, acoes=["confirmar_18_30", "confirmar_17_00", "pedir_esclarecimento"])
    print(f"  ({card.origem_texto}) [{card.urgencia.value} · {card.motivo_urgencia}] {card.titulo}")
    print(f"  Decisão: {card.decisao_necessaria}\n  {card.resumo}")
    conferir("urgência", card.urgencia.value, "P0")

    titulo("Carlos · alerta antigo com ajuste já aplicado")
    proposta = propor_proxima_acao(
        llm,
        v1,
        "em_investigacao",
        {
            "ocorrencia": "R1 emitida em 07/11 sobre 06/11, versão do espelho 1",
            "espelho_atual": {"versao": 2, "situacao": "completo"},
            "ajustes_existentes": [{"id": "T-0012", "tipo": "inclusao_marcacao", "horario": "17:00", "status": "aplicado"}],
        },
    )
    print(f"  ({proposta.origem}) {proposta.justificativa}")
    conferir("ação", proposta.acao, "descartar_com_fundamento")

    titulo("DP escreve um playbook em português")
    compilado = compilar_playbook(
        llm,
        "Quando faltar a saída, pergunta pro funcionário. Se ele informar um horário até 5 minutos da escala, "
        "sem gerar hora extra, pode lançar sozinho e avisar o gestor, que tem 24h para contestar. Senão, o gestor aprova.",
        base=v1,
        teto=TETO,
        ativos=[v1],
    )
    print(f"  erros: {[e.codigo for e in compilado.erros]}")
    conferir("pode ativar", compilado.pode_ativar, True)

    titulo("Trace")
    for r in llm.trace:
        tokens = f"{r.tokens_entrada}/{r.tokens_saida}" if r.tokens_entrada is not None else "?"
        extra = f" erro={r.erro}" if r.erro else ""
        print(f"  {r.ferramenta:<26} {r.duracao_ms:>6} ms  tokens {tokens:<10} {'texto' if r.via_texto else 'nativo'}{extra}")
    total_ms = sum(r.duracao_ms for r in llm.trace)
    print(f"  {len(llm.trace)} chamadas, {total_ms} ms no total, {sum(r.via_texto for r in llm.trace)} via texto")

    print("\nTUDO OK" if not falhas else f"\nFALHAS: {falhas}")
    return 1 if falhas else 0


if __name__ == "__main__":
    raise SystemExit(main())
