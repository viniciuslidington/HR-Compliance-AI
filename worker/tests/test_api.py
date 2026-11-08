from datetime import date

import pytest
from fastapi.testclient import TestClient

from api import criar_app
from ia.llm import ErroLLM
from tests.fakes import LLMRoteirizado
from tests.test_documentos import TRANSCRICAO_NR35, TranscritorFixo, _extracao_llm

HOJE = date(2026, 11, 7)
PNG = ("cert.png", b"\x89PNG certificado", "image/png")


class TranscritorQuebrado:
    def transcrever(self, imagem, mime):
        raise ErroLLM("visão fora do ar")


def _cliente(tmp_path, *, respostas=None, transcritor=None, token=None):
    app = criar_app(
        dados_dir=tmp_path,
        transcritor=transcritor or TranscritorFixo(TRANSCRICAO_NR35),
        llm=LLMRoteirizado(list(respostas or []) + [ErroLLM("card indisponível"), ErroLLM("card indisponível")]),
        hoje=lambda: HOJE,
        api_token=token,
    )
    return TestClient(app)


def _status(cliente, pessoa):
    return {i["tipo"]: i["status"] for i in cliente.get(f"/pessoas/{pessoa}/matriz").json()["itens"]}


def test_saude_responde_sem_expor_a_chave(tmp_path):
    corpo = _cliente(tmp_path).get("/saude").json()
    assert corpo["status"] == "ok"
    assert "FEATHERLESS_API_KEY" not in str(corpo)


def test_saude_diz_se_a_chave_do_featherless_esta_configurada(tmp_path, monkeypatch):
    monkeypatch.delenv("FEATHERLESS_API_KEY", raising=False)
    assert _cliente(tmp_path).get("/saude").json()["chave_featherless_configurada"] is False
    monkeypatch.setenv("FEATHERLESS_API_KEY", "sk-secreta")
    corpo = _cliente(tmp_path).get("/saude").json()
    assert corpo["chave_featherless_configurada"] is True
    assert "sk-secreta" not in str(corpo)


def test_falha_de_leitura_devolve_o_motivo_tecnico(tmp_path):
    cliente = _cliente(tmp_path, transcritor=TranscritorQuebrado())
    corpo = cliente.post("/pessoas/F-12/documentos", params={"tipo": "nr35"}, files={"arquivo": PNG}).json()
    assert corpo["erro_tecnico"] == "visão fora do ar"


def test_lista_as_pessoas_do_seed(tmp_path):
    ids = {p["id"] for p in _cliente(tmp_path).get("/pessoas").json()}
    assert {"F-12", "F-31", "F-40"} <= ids


def test_matriz_comeca_com_tudo_faltando(tmp_path):
    assert _status(_cliente(tmp_path), "F-12") == {"aso": "faltando", "nr10": "faltando", "nr35": "faltando"}


def test_pessoa_inexistente_da_404(tmp_path):
    assert _cliente(tmp_path).get("/pessoas/F-999/matriz").status_code == 404


def test_envio_de_certificado_le_confere_e_aguarda_aprovacao(tmp_path):
    cliente = _cliente(tmp_path, respostas=[_extracao_llm()])
    resposta = cliente.post("/pessoas/F-12/documentos", params={"tipo": "nr35"}, files={"arquivo": PNG})
    assert resposta.status_code == 200
    corpo = resposta.json()
    assert corpo["decisao"] == "pedir_aprovacao"
    assert corpo["validade_ate"] == "2026-12-03"
    assert _status(cliente, "F-12")["nr35"] == "faltando"  # ainda não aprovado


def test_aprovacao_atualiza_a_matriz(tmp_path):
    cliente = _cliente(tmp_path, respostas=[_extracao_llm()])
    anexo_id = cliente.post("/pessoas/F-12/documentos", params={"tipo": "nr35"}, files={"arquivo": PNG}).json()["anexo_id"]
    assert cliente.post(f"/anexos/{anexo_id}/aprovar", json={"aprovador": "dp-ana"}).status_code == 200
    assert _status(cliente, "F-12")["nr35"] == "a_vencer"


def test_aprovar_duas_vezes_da_conflito(tmp_path):
    cliente = _cliente(tmp_path, respostas=[_extracao_llm()])
    anexo_id = cliente.post("/pessoas/F-12/documentos", params={"tipo": "nr35"}, files={"arquivo": PNG}).json()["anexo_id"]
    cliente.post(f"/anexos/{anexo_id}/aprovar", json={"aprovador": "dp-ana"})
    assert cliente.post(f"/anexos/{anexo_id}/aprovar", json={"aprovador": "dp-ana"}).status_code == 409


def test_documento_que_o_cargo_nao_exige_da_400(tmp_path):
    resposta = _cliente(tmp_path).post("/pessoas/F-40/documentos", params={"tipo": "nr35"}, files={"arquivo": PNG})
    assert resposta.status_code == 400


def test_arquivo_que_nao_e_imagem_da_415(tmp_path):
    resposta = _cliente(tmp_path).post(
        "/pessoas/F-12/documentos", params={"tipo": "nr35"}, files={"arquivo": ("x.txt", b"oi", "text/plain")}
    )
    assert resposta.status_code == 415


def test_visao_fora_do_ar_escala_e_guarda_o_anexo(tmp_path):
    cliente = _cliente(tmp_path, transcritor=TranscritorQuebrado())
    corpo = cliente.post("/pessoas/F-12/documentos", params={"tipo": "nr35"}, files={"arquivo": PNG}).json()
    assert corpo["decisao"] == "escalar"
    assert cliente.get(f"/anexos/{corpo['anexo_id']}").json()["status"] == "escalar"


def test_aso_vai_para_o_prefixo_sensivel_e_sem_transcricao(tmp_path):
    extracao = {
        "tipo": "aso", "nome": "Carlos Alberto Souza", "cpf": "123.456.789-09", "data_realizacao": "2026-03-10",
        "aso_resultado": "apto", "aso_funcoes": [], "medico_crm": "CRM-SP 123456",
    }
    transcricao = "ASO. Carlos Alberto Souza, CPF 123.456.789-09. Apto. 10/03/2026. CRM-SP 123456"
    cliente = _cliente(tmp_path, transcritor=TranscritorFixo(transcricao), respostas=[extracao])
    anexo_id = cliente.post("/pessoas/F-12/documentos", params={"tipo": "aso"}, files={"arquivo": PNG}).json()["anexo_id"]
    anexo = cliente.get(f"/anexos/{anexo_id}").json()
    assert anexo["chave"].startswith("demo/sensivel/")
    assert anexo["transcricao"] is None


@pytest.mark.parametrize("cabecalho, esperado", [({}, 401), ({"Authorization": "Bearer errado"}, 401)])
def test_escrita_exige_token_quando_configurado(tmp_path, cabecalho, esperado):
    cliente = _cliente(tmp_path, token="segredo")
    resposta = cliente.post(
        "/pessoas/F-12/documentos", params={"tipo": "nr35"}, files={"arquivo": PNG}, headers=cabecalho
    )
    assert resposta.status_code == esperado


def test_escrita_com_token_certo_passa(tmp_path):
    cliente = _cliente(tmp_path, token="segredo", respostas=[_extracao_llm()])
    resposta = cliente.post(
        "/pessoas/F-12/documentos", params={"tipo": "nr35"}, files={"arquivo": PNG},
        headers={"Authorization": "Bearer segredo"},
    )
    assert resposta.status_code == 200


def test_leitura_nao_exige_token(tmp_path):
    assert _cliente(tmp_path, token="segredo").get("/pessoas/F-12/matriz").status_code == 200


def test_fluxo_persiste_mensagens_e_aprovacao_apos_reinicio(tmp_path):
    cliente = _cliente(tmp_path, respostas=[_extracao_llm()])
    resultado = cliente.post("/pessoas/F-12/documentos", params={"tipo": "nr35"}, files={"arquivo": PNG}).json()
    assert {"transcricao", "extracao", "conferencia", "decisao", "mensagem"} <= {e["nome"] for e in resultado["etapas"]}
    assert len(cliente.get("/fila").json()["aprovacoes"]) == 1
    reiniciado = _cliente(tmp_path)
    assert len(reiniciado.get("/pessoas/F-12/mensagens").json()) == 1
    assert reiniciado.post(f"/anexos/{resultado['anexo_id']}/aprovar", json={"aprovador": "DP"}).status_code == 200
    assert reiniciado.get("/fila").json()["aprovacoes"] == []
    duplicado = reiniciado.post("/pessoas/F-12/documentos", params={"tipo": "nr35"}, files={"arquivo": PNG}).json()
    assert duplicado["duplicado"] and duplicado["decisao"] == "aprovado"


def test_regua_persiste_card_e_nao_repete_impedimento(tmp_path):
    cliente = _cliente(tmp_path, respostas=[_extracao_llm()])
    anexo = cliente.post("/pessoas/F-12/documentos", params={"tipo": "nr35"}, files={"arquivo": PNG}).json()["anexo_id"]
    cliente.post(f"/anexos/{anexo}/aprovar", json={"aprovador": "DP"})
    reiniciado = _cliente(tmp_path)
    resposta = reiniciado.post("/regua/rodar?dia=2026-12-03").json()
    assert any(e["nome"] == "card" and e["dados"]["urgencia"] == "P0" for e in resposta["etapas"])
    outro = _cliente(tmp_path)
    assert len(outro.get("/fila").json()["cards"]) == 1
    assert outro.post("/regua/rodar?dia=2026-12-03").json()["etapas"] == []


def test_interface_e_acoes_exigem_token(tmp_path):
    cliente = _cliente(tmp_path, token="segredo")
    assert cliente.get("/").status_code == 200
    assert cliente.get("/static/app.js").status_code == 200
    assert cliente.post("/regua/rodar?dia=2026-12-03").status_code == 401


def test_iniciar_admissao_pede_documentos_uma_so_vez_e_conclui_no_destino_mock(tmp_path):
    cliente = _cliente(tmp_path)
    primeira = cliente.post('/pessoas/F-40/admissao/iniciar').json()
    assert primeira['iniciada']
    assert 'ASO' in cliente.get('/pessoas/F-40/mensagens').json()[0]['texto']
    assert not cliente.post('/pessoas/F-40/admissao/iniciar').json()['iniciada']
    # Simula um ASO aprovado antes de testar a conclusão idempotente.
    import sqlite3
    with sqlite3.connect(tmp_path / 'anexos.db') as db:
        db.execute("INSERT INTO anexos (id,tenant,funcionario_id,tipo_esperado,sha256,mime,tamanho,chave,recebido_em,status,validade_ate) VALUES ('aso1','demo','F-40','aso','abc','image/png',1,'demo/sensivel/abc','2026-11-07','pedir_aprovacao','2027-11-07')")
    assert cliente.post('/anexos/aso1/aprovar', json={'aprovador': 'DP'}).status_code == 200
    eventos = cliente.get('/destino/eventos').json()
    assert len(eventos) == 1 and eventos[0]['simulado'] is True
    assert 'concluída' in cliente.get('/pessoas/F-40/mensagens').json()[-1]['texto']
    assert len(_cliente(tmp_path).get('/destino/eventos').json()) == 1


def test_resposta_documental_e_card_com_acoes(tmp_path):
    cliente = _cliente(tmp_path, respostas=[{'tipo': 'nao_tem', 'trecho': 'não tenho'}, ErroLLM('fora'), ErroLLM('fora')])
    resposta = cliente.post('/pessoas/F-12/mensagens', json={'texto': 'não tenho o certificado'}).json()
    assert resposta['classificacao'] == 'nao_tem'
    card = cliente.get('/fila').json()['cards'][0]
    assert 'não tenho o certificado' not in str(cliente.get('/fila').json())
    tarefa = card['tarefa_id']
    assert cliente.post(f'/fila/{tarefa}/acao', json={'acao':'registrar_contato','responsavel':'DP'}).json()['status'] == 'em_andamento'
    assert cliente.post(f'/fila/{tarefa}/acao', json={'acao':'concluir','responsavel':'DP'}).json()['status'] == 'concluida'
    assert _cliente(tmp_path).get('/fila').json()['cards'][0]['status'] == 'concluida'
    assert cliente.post(f'/fila/{tarefa}/acao', json={'acao':'concluir','responsavel':'DP'}).status_code == 409


def test_autonomia_exige_historico_e_ativacao_humana_por_tipo(tmp_path):
    import json
    import sqlite3
    cliente = _cliente(tmp_path)
    pedido = {'emissor':'12345678000195', 'tipo':'nr35', 'aprovador':'DP'}
    assert cliente.post('/autonomia/ativar', json=pedido).status_code == 409
    with sqlite3.connect(tmp_path / 'anexos.db') as db:
        for i in range(30):
            db.execute("INSERT INTO anexos (id,tenant,funcionario_id,tipo_esperado,sha256,mime,tamanho,chave,recebido_em,status,conferencia_json) VALUES (?,?,?,?,?,?,?,?,?,?,?)", (str(i), 'demo','F-12','nr35',str(i),'image/png',1,'x','2026-11-07','aprovado',json.dumps({'emissor_cnpj':'12345678000195'})))
    assert cliente.get('/autonomia').json()[0]['elegivel']
    assert cliente.post('/autonomia/ativar', json=pedido).json()['ativa']
    assert _cliente(tmp_path).get('/autonomia').json()[0]['ativa']
    assert cliente.post('/autonomia/ativar', json={**pedido, 'tipo':'nr10'}).status_code == 409
    com_leitura = _cliente(tmp_path, respostas=[_extracao_llm()])
    resultado = com_leitura.post('/pessoas/F-12/documentos', params={'tipo':'nr35'}, files={'arquivo':PNG}).json()
    assert resultado['decisao'] == 'aceitar_sozinho'


def test_resposta_sem_evidencia_e_escalada_sem_copiar_texto(tmp_path):
    cliente = _cliente(tmp_path, respostas=[{'tipo':'vai_enviar','trecho':'inventado'}, ErroLLM('fora'), ErroLLM('fora')])
    resposta = cliente.post('/pessoas/F-12/mensagens', json={'texto':'mensagem particular'}).json()
    assert resposta['classificacao'] == 'outra'
    assert len(cliente.get('/fila').json()['cards']) == 1
    assert 'mensagem particular' not in str(cliente.get('/pessoas/F-12/mensagens').json())


def test_agendamento_roda_no_inicio_e_e_idempotente(tmp_path):
    import sqlite3
    import time
    app = criar_app(dados_dir=tmp_path, transcritor=TranscritorFixo(TRANSCRICAO_NR35),
                    llm=LLMRoteirizado([]), hoje=lambda: HOJE, agendamento_automatico=True)
    with TestClient(app):
        limite = time.monotonic() + 2
        while time.monotonic() < limite:
            with sqlite3.connect(tmp_path / 'anexos.db') as db:
                if db.execute('SELECT COUNT(*) FROM execucoes_regua').fetchone()[0]:
                    break
            time.sleep(.01)
        else:
            pytest.fail('a régua automática não foi executada')
    with sqlite3.connect(tmp_path / 'anexos.db') as db:
        assert db.execute('SELECT dia FROM execucoes_regua').fetchall() == [('2026-11-07',)]


def test_reprocessa_falha_sem_duplicar_anexo_e_fecha_card_so_apos_aprovacao(tmp_path):
    falhou = _cliente(tmp_path, transcritor=TranscritorQuebrado())
    anexo = falhou.post('/pessoas/F-12/documentos?tipo=nr35', files={'arquivo': PNG}).json()['anexo_id']
    assert len(falhou.get('/fila').json()['cards']) == 1
    cliente = _cliente(tmp_path, respostas=[_extracao_llm()])
    resultado = cliente.post(f'/anexos/{anexo}/reprocessar').json()
    assert resultado['anexo_id'] == anexo
    assert resultado['decisao'] == 'pedir_aprovacao'
    assert cliente.get('/fila').json()['cards'][0].get('status') != 'concluida'
    cliente.post(f'/anexos/{anexo}/aprovar', json={'aprovador': 'DP'})
    card = cliente.get('/fila').json()['cards'][0]
    assert card['status'] == 'concluida'
    assert card['historico'][-1]['anexo_id'] == anexo
    assert cliente.post(f'/anexos/{anexo}/reprocessar').status_code == 409
    assert len(cliente.get(f'/anexos/{anexo}/tentativas').json()) == 1
    assert _cliente(tmp_path).get('/fila').json()['cards'][0]['status'] == 'concluida'


def test_limita_reprocessamento_sem_duplicar_card_apos_reinicio(tmp_path):
    cliente = _cliente(tmp_path, transcritor=TranscritorQuebrado())
    anexo = cliente.post('/pessoas/F-12/documentos?tipo=nr35', files={'arquivo': PNG}).json()['anexo_id']
    for _ in range(3):
        cliente = _cliente(tmp_path, transcritor=TranscritorQuebrado())
        assert cliente.post(f'/anexos/{anexo}/reprocessar').json()['decisao'] == 'escalar'
    assert cliente.post(f'/anexos/{anexo}/reprocessar').status_code == 409
    assert len(cliente.get('/fila').json()['cards']) == 1
    assert cliente.get('/fila').json()['reprocessaveis'] == []
    assert len(cliente.get(f'/anexos/{anexo}/tentativas').json()) == 3
    assert _cliente(tmp_path, token='segredo').post(f'/anexos/{anexo}/reprocessar').status_code == 401


def test_compromisso_persistido_cobra_uma_vez_e_pausa_ao_receber(tmp_path):
    cliente = _cliente(tmp_path, respostas=[{'tipo':'vai_enviar', 'trecho':'vou enviar'}])
    r = cliente.post('/pessoas/F-12/mensagens', json={'texto':'vou enviar NR-35 amanhã'}).json()
    assert r['compromisso'] == {'tipo':'nr35', 'dia':'2026-11-08'}
    cliente = _cliente(tmp_path, respostas=[_extracao_llm()])
    assert cliente.post('/regua/rodar?dia=2026-11-07').json()['etapas'] == []
    assert len(cliente.post('/regua/rodar?dia=2026-11-08').json()['etapas']) == 1
    assert cliente.post('/regua/rodar?dia=2026-11-08').json()['etapas'] == []
    anexo = cliente.post('/pessoas/F-12/documentos?tipo=nr35', files={'arquivo':PNG}).json()['anexo_id']
    assert cliente.get('/pessoas/F-12/compromissos').json()[0]['status'] == 'em_analise'
    cliente.post(f'/anexos/{anexo}/aprovar', json={'aprovador':'DP'})
    assert cliente.get('/pessoas/F-12/compromissos').json()[0]['status'] == 'concluido'


def test_compromisso_recebido_antes_do_prazo_nao_cobra(tmp_path):
    cliente = _cliente(tmp_path, respostas=[{'tipo':'vai_enviar','trecho':'vou enviar'}, _extracao_llm()])
    cliente.post('/pessoas/F-12/mensagens', json={'texto':'vou enviar NR-35 amanhã'})
    cliente.post('/pessoas/F-12/documentos?tipo=nr35', files={'arquivo':PNG})
    assert _cliente(tmp_path).post('/regua/rodar?dia=2026-11-08').json()['etapas'] == []


def test_compromissos_ambiguos_nao_sao_agendados():
    from ia.conversa_documental import compromisso_explicito
    for texto in ('envio amanhã', 'envio NR-35 em breve', 'NR-35 em 31/02/2026',
                  'NR-35 hoje ou amanhã', 'NR-35 em 01/01/2026', 'NR-35 e NR-10 amanhã'):
        assert compromisso_explicito(texto, HOJE, ['nr35','nr10']) is None
    assert compromisso_explicito('NR-35 em 09/11/2026', HOJE, ['nr35','nr10']) == {'tipo':'nr35', 'dia':'2026-11-09'}


def test_documento_novo_fecha_apenas_pendencia_da_mesma_pessoa(tmp_path):
    cliente = _cliente(tmp_path, transcritor=TranscritorQuebrado(), respostas=[ErroLLM('fora'), ErroLLM('fora')])
    cliente.post('/pessoas/F-12/documentos?tipo=nr35', files={'arquivo': PNG})
    outra = cliente.post('/pessoas/F-31/documentos?tipo=nr35', files={'arquivo': PNG}).json()['anexo_id']
    cliente = _cliente(tmp_path, respostas=[_extracao_llm()])
    novo = cliente.post('/pessoas/F-12/documentos?tipo=nr35', files={'arquivo': ('novo.png', b'novo', 'image/png')}).json()['anexo_id']
    cliente.post(f'/anexos/{novo}/aprovar', json={'aprovador':'DP'})
    cards = cliente.get('/fila').json()['cards']
    assert sum(c.get('status') == 'concluida' for c in cards) == 1
    assert next(c for c in cards if c['caso_id'] == outra).get('status') != 'concluida'


def test_documento_antigo_nao_resolve_impedimento_em_data_simulada_futura(tmp_path):
    cliente = _cliente(tmp_path, respostas=[_extracao_llm()])
    anexo = cliente.post('/pessoas/F-12/documentos?tipo=nr35', files={'arquivo':PNG}).json()['anexo_id']
    cliente.post(f'/anexos/{anexo}/aprovar', json={'aprovador':'DP'})
    cliente.post('/regua/rodar?dia=2026-12-03')
    cliente = _cliente(tmp_path, respostas=[_extracao_llm()])
    novo = cliente.post('/pessoas/F-12/documentos?tipo=nr35', files={'arquivo':('outro.png',b'outro','image/png')}).json()['anexo_id']
    cliente.post(f'/anexos/{novo}/aprovar', json={'aprovador':'DP'})
    assert cliente.get('/fila').json()['cards'][0].get('status') != 'concluida'


def test_duvida_sobre_a_pendencia_e_respondida_sem_llm_e_sem_card(tmp_path):
    cliente = _cliente(tmp_path)  # o LLM roteirizado só tem erros: a dúvida não pode depender dele
    resposta = cliente.post('/pessoas/F-12/mensagens', json={'texto': 'O que falta?'}).json()
    assert resposta['classificacao'] == 'duvida'
    assert resposta['duvida']['intencoes'] == ['o_que_falta']
    assert set(resposta['duvida']['dados']['pendentes']) == {'aso', 'nr10', 'nr35'}
    texto = cliente.get('/pessoas/F-12/mensagens').json()[-1]['texto']
    assert texto.startswith('Carlos, falta:') and 'NR-35' in texto
    assert cliente.get('/fila').json()['cards'] == []


def test_duvida_de_documento_que_o_cargo_nao_exige(tmp_path):
    resposta = _cliente(tmp_path).post('/pessoas/F-40/mensagens', json={'texto': 'quando vence a nr35?'}).json()
    assert resposta['classificacao'] == 'duvida'
    assert 'não exige' in resposta['etapas'][0]['dados']['texto']
