const $ = s => document.querySelector(s);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let people = [], selected = null, token = sessionStorage.getItem('converge_token') || '';
const labels = {aso:'ASO',nr10:'NR-10',nr35:'NR-35',valido:'Válido',a_vencer:'A vencer',vencido:'Vencido',faltando:'Pendente',pedir_aprovacao:'Aguardando aprovação',aceitar_sozinho:'Aceito',recusar:'Recusado',escalar:'Encaminhado ao DP',aprovado:'Aprovado'};
const nameOf = value => labels[value] || value;
const dateBR = d => d ? d.split('-').reverse().join('/') : '—';
async function api(path, options={}) {
  const headers = new Headers(options.headers || {}); if(token) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(path, {...options, headers});
  if (!res.ok) { let msg; try { const data = await res.json(); msg = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail); } catch { msg = res.statusText; } throw new Error(res.status === 401 ? 'Chave de acesso ausente ou inválida.' : msg); }
  return res.json();
}
function timeline(etapas) {
  $('#timeline').className = etapas.length ? '' : 'empty';
  $('#timeline').innerHTML = etapas.length ? `<ol class="timeline">${etapas.map(e=>`<li><strong>${esc(e.nome.replaceAll('_',' '))}${e.duracao_ms != null ? ` · ${esc(e.duracao_ms)} ms` : ''}</strong><p>${esc(e.resumo)}</p></li>`).join('')}</ol>` : 'Nenhuma ação necessária nesta data.';
}
function showError(el, error){ el.innerHTML = `<div class="notice">${esc(error.message)}</div>`; }
async function refreshPerson() {
  if (!selected) return;
  const id = selected;
  const [matrix, messages, commitments] = await Promise.all([api(`/pessoas/${encodeURIComponent(id)}/matriz`),api(`/pessoas/${encodeURIComponent(id)}/mensagens`),api(`/pessoas/${encodeURIComponent(id)}/compromissos`)]);
  if (selected !== id) return;
  $('#person-head').innerHTML = `<div><div class="eyebrow">VISÃO DO COLABORADOR</div><h2>${esc(matrix.nome)}</h2><p>${esc(matrix.cargo)} · ${esc(matrix.pessoa)}</p></div>`;
  $('#matrix').innerHTML = matrix.itens.map(i=>`<div class="matrix-item"><strong>${esc(nameOf(i.tipo))}</strong><span class="badge ${esc(i.status)}">${esc(nameOf(i.status))}</span><small>Validade: ${dateBR(i.validade_ate)}</small></div>`).join('');
  const current = $('#type').value;
  $('#type').innerHTML = matrix.itens.map(i=>`<option value="${esc(i.tipo)}">${esc(nameOf(i.tipo))}</option>`).join('');
  if(matrix.itens.some(i=>i.tipo===current)) $('#type').value = current;
  $('#messages').innerHTML = messages.length ? messages.slice().reverse().map(m=>`<div class="message">${esc(m.texto)}<small>${esc(m.em.replace('T',' ').slice(0,16))} · agente</small></div>`).join('') : '<div class="empty">Ainda não há mensagens para esta pessoa.</div>';
  $('#commitments').innerHTML = commitments.filter(c=>['pendente','cobrado','em_analise'].includes(c.status)).map(c=>`<small>${esc(nameOf(c.tipo))} · combinado para ${dateBR(c.dia)} · ${esc(({pendente:'aguardando envio',cobrado:'lembrete enviado',em_analise:'recebido; aguardando aprovação'})[c.status])}</small>`).join('');
  document.querySelectorAll('.person').forEach(el=>el.classList.toggle('active',el.dataset.id===id));
}
async function queue(){
  const data = await api('/fila');
  const approvals = data.aprovacoes.map(a=>`<div class="queue-item"><div><span class="badge a_vencer">Aprovação</span><strong> ${esc(people.find(p=>p.id===a.funcionario_id)?.nome || a.funcionario_id)} · ${esc(nameOf(a.tipo_esperado))}</strong><p>Válido até ${dateBR(a.validade_ate)} · ${esc(a.decisao_mensagem)}</p></div><button class="outline approve" data-id="${esc(a.id)}">Aprovar</button></div>`);
  const cards = data.cards.filter(c=>c.status!=='concluida').map(c=>`<div class="queue-item"><div><span class="badge vencido">${esc(c.urgencia)}</span><strong> ${esc(c.titulo)}</strong><p>${esc(c.decisao_necessaria)}</p><small>Responsável: ${esc(c.responsavel || 'A definir')} · ${esc(c.status || 'aberta')}</small></div><div>${c.acoes.includes('pedir_de_novo') ? `<button class="outline task-action" data-id="${esc(c.tarefa_id)}" data-action="pedir_de_novo">Pedir novamente</button>` : ''}<button class="outline task-action" data-id="${esc(c.tarefa_id)}" data-action="registrar_contato">Registrar contato</button><button class="outline task-action" data-id="${esc(c.tarefa_id)}" data-action="concluir">Concluir</button></div></div>`);
  const retries = data.reprocessaveis.map(a=>`<div class="queue-item"><div><strong>Falha técnica · ${esc(people.find(p=>p.id===a.funcionario_id)?.nome || a.funcionario_id)} · ${esc(nameOf(a.tipo))}</strong><p>A análise pode ser tentada novamente, até 3 vezes.</p></div><button class="outline retry" data-id="${esc(a.id)}">Reprocessar</button></div>`);
  $('#queue').innerHTML = approvals.concat(retries,cards).join('') || '<div class="empty">Nenhuma decisão na fila por enquanto.</div>';
}
async function autonomy(){
  const data = await api('/autonomia');
  $('#autonomy').innerHTML = data.length ? data.map(a=>`<div class="queue-item"><div><strong>${esc(a.emissor)} · ${esc(nameOf(a.tipo))}</strong><p>${a.aprovadas} aprovações em ${a.decisoes} decisões · ${a.ativa?'autonomia ativa':a.elegivel?'elegível para ativação':'histórico insuficiente'}</p></div>${a.elegivel&&!a.ativa?`<button class="outline activate" data-emissor="${esc(a.emissor)}" data-tipo="${esc(a.tipo)}">Ativar</button>`:''}</div>`).join('') : '<div class="empty">As decisões do DP formarão o histórico por emissor.</div>';
}
async function refresh(){ await Promise.all([refreshPerson(),queue(),autonomy()]); }
$('#token-button').onclick=()=>{ const value=prompt('Informe a chave de acesso para enviar documentos e executar ações.', token); if(value!==null){token=value.trim();sessionStorage.setItem('converge_token',token);} };
$('#upload-form').onsubmit=async e=>{e.preventDefault(); const b=$('#upload-button'), result=$('#result'); b.disabled=true; b.firstChild.textContent='Analisando... '; result.innerHTML='<div class="notice">O agente está lendo e conferindo o documento. Isso pode levar alguns instantes.</div>'; const data=new FormData();data.append('arquivo',$('#file').files[0]); try {const r=await api(`/pessoas/${encodeURIComponent(selected)}/documentos?tipo=${encodeURIComponent($('#type').value)}`,{method:'POST',body:data}); result.innerHTML=`<div class="notice"><strong>${esc(nameOf(r.decisao))}</strong> · ${esc(r.mensagem)}${r.duplicado?' · Arquivo já enviado anteriormente.':''}</div>`;timeline(r.etapas);await refresh();} catch(err){showError(result,err)} finally{b.disabled=false;b.firstChild.textContent='Analisar documento ';}};
$('#regua-form').onsubmit=async e=>{e.preventDefault();const b=e.currentTarget.querySelector('button');b.disabled=true;try{const r=await api(`/regua/rodar?dia=${encodeURIComponent($('#day').value)}`,{method:'POST'});timeline(r.etapas);await refresh()}catch(err){showError($('#timeline'),err)}finally{b.disabled=false}};
$('#queue').onclick=async e=>{const retry=e.target.closest('.retry');if(retry){retry.disabled=true;retry.textContent='Reprocessando...';try{const r=await api(`/anexos/${encodeURIComponent(retry.dataset.id)}/reprocessar`,{method:'POST'});timeline(r.etapas);await refresh()}catch(err){alert(err.message);retry.disabled=false;retry.textContent='Reprocessar'}return}const action=e.target.closest('.task-action');if(action){const responsavel=prompt('Responsável pela ação:','DP');if(!responsavel?.trim())return;action.disabled=true;try{const r=await api(`/fila/${encodeURIComponent(action.dataset.id)}/acao`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({acao:action.dataset.action,responsavel})});timeline(r.etapas);await refresh()}catch(err){alert(err.message);action.disabled=false}return}const b=e.target.closest('.approve');if(!b)return;const aprovador=prompt('Quem está aprovando este documento?','DP');if(!aprovador?.trim())return;b.disabled=true;try{const r=await api(`/anexos/${encodeURIComponent(b.dataset.id)}/aprovar`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({aprovador})});timeline(r.etapas);await refresh()}catch(err){alert(err.message);b.disabled=false}};
$('#refresh').onclick=()=>refresh().catch(e=>showError($('#queue'),e));
async function init(){try{const [health,list]=await Promise.all([api('/saude'),api('/pessoas')]);people=list;$('#health').textContent=health.chave_featherless_configurada?'Agente conectado':'Chave de IA não configurada';$('#day').value=health.hoje;$('#count').textContent=list.length;$('#people').innerHTML=list.map(p=>`<button class="person" data-id="${esc(p.id)}"><strong>${esc(p.nome)}</strong><small>${esc(p.cargo)}</small></button>`).join('');$('#people').onclick=e=>{const p=e.target.closest('.person');if(p){selected=p.dataset.id;$('#result').innerHTML='';refreshPerson().catch(err=>showError($('#matrix'),err));}};selected=list[0]?.id;await refresh()}catch(e){$('#health').textContent='Conexão indisponível';showError($('#people'),e)}}init();

$('#start-admission').onclick=async e=>{const button=e.currentTarget;button.disabled=true;try{const r=await api(`/pessoas/${encodeURIComponent(selected)}/admissao/iniciar`,{method:'POST'});timeline(r.etapas);if(!r.iniciada) alert('A admissão desta pessoa já foi iniciada.');await refresh()}catch(err){alert(err.message)}finally{button.disabled=false}};
$('#reply-form').onsubmit=async e=>{e.preventDefault();const b=e.currentTarget.querySelector('button');b.disabled=true;try{const r=await api(`/pessoas/${encodeURIComponent(selected)}/mensagens`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({texto:$('#reply').value})});$('#reply').value='';timeline(r.etapas);await refresh()}catch(err){alert(err.message)}finally{b.disabled=false}};
$('#autonomy').onclick=async e=>{const b=e.target.closest('.activate');if(!b)return;const aprovador=prompt('Quem autoriza esta autonomia?','DP');if(!aprovador?.trim())return;b.disabled=true;try{await api('/autonomia/ativar',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({emissor:b.dataset.emissor,tipo:b.dataset.tipo,aprovador})});await refresh()}catch(err){alert(err.message);b.disabled=false}};
