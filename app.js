'use strict';

const TOPICS = [
  {id:'people', no:1, title:'사람의 생활', category:'사람', tone:'#a75a36', wash:'#fff0dd', image:'people-realistic.jpg', intro:'옷차림, 체육 시간, 꽃구경!\n우리의 하루를 살펴봐요.',
    facts:[
      '이 마을의 옷 가게는 더운 때 입는 얇은 옷과 추운 때 입는 두꺼운 옷을 준비해요.',
      '학교에서는 날씨와 기온을 살펴 운동장 체육 수업을 계획해요.',
      '마을 사람들은 봄에 벚꽃을 보러 갈 날짜를 정해 함께 나들이해요.'
    ], question:'계절이 달라지면, 누구의 어떤 생활 모습이 달라질까요?', source:'수업용 가상 생활 자료', sourceLinks:[]},
  {id:'mosquito', no:2, title:'모기의 생활', category:'동물', tone:'#3c7a87', wash:'#e7f3f3', image:'mosquito-realistic.jpg', intro:'작은 모기는 언제, 어디서\n살아갈까요?',
    facts:[
      '우리나라의 작은빨간집모기는 주로 4월부터 10월까지 활동하는 것으로 관찰돼요.',
      '어린 모기인 유충은 물웅덩이처럼 물이 고인 곳에서 자라요.',
      '사람들은 모기가 집에 들어오지 못하게 창문에 방충망을 설치하기도 해요.'
    ], question:'활동하는 기간과 모기의 수는 같은 뜻일까요? 무엇을 더 알아야 할까요?', source:'질병관리청 자료를 쉽게 풀어씀', sourceLinks:[
      {label:'모기 활동 시기·방충망 (2026.9.9.)',url:'https://www.kdca.go.kr/bbs/kdca/42/312572/artclView.do'},
      {label:'유충이 사는 곳 (2025.7.18.)',url:'https://www.kdca.go.kr/kdca/2848/subview.do?enc=Zm5jdDF8QEB8JTJGYmJzJTJGa2RjYSUyRjQyJTJGMjE1MzMyJTJGYXJ0Y2xWaWV3LmRvJTNG'}
    ]},
  {id:'frog', no:3, title:'개구리의 생활', category:'동물', tone:'#527833', wash:'#edf3dd', image:'frog-realistic.jpg', intro:'북방산개구리가 알을 낳는\n때를 살펴봐요.',
    facts:[
      '지리산의 북방산개구리는 겨울이 끝나 갈 무렵인 2~3월에 처음 알을 낳은 모습이 관찰돼요.',
      '북방산개구리가 알을 낳기 시작하는 때는 기온과 관련이 있어요.',
      '북방산개구리는 곤충 등을 먹어요. 먹이가 되는 생물이 나타나는 때도 살펴볼 필요가 있어요.'
    ], question:'겨울이 끝날 무렵 따뜻해지는 때도 빨라진다면, 어떤 일이 생길까요?', source:'환경부·국립공원관리공단 자료 (2017.2.13.)를 쉽게 풀어씀', sourceLinks:[
      {label:'북방산개구리 산란 관찰 자료',url:'https://www.me.go.kr/home/web/board/read.do?boardId=760940&boardMasterId=1&menuId=286'}
    ]},
  {id:'cherry', no:4, title:'벚나무의 생활', category:'식물', tone:'#a65372', wash:'#fcecf1', image:'cherry-realistic.jpg', intro:'봄을 알리는 벚꽃은\n언제 피어날까요?',
    facts:[
      '벚꽃이 피는 때는 봄철 기온의 영향을 받아요.',
      '같은 지역에서도 나무의 종류와 햇빛을 받는 정도 등에 따라 꽃 피는 때가 다를 수 있어요.',
      '사람들은 꽃이 피고 활짝 피는 때를 관찰하며 꽃구경할 시기를 생각해요.'
    ], question:'봄에 따뜻해지는 때도 달라진다면, 꽃과 사람의 생활은 어떻게 이어질까요?', source:'기상청 자료를 쉽게 풀어씀 · 3번은 수업용 생활 상황', sourceLinks:[
      {label:'벚꽃 개화와 기온 (2015.4.8.)',url:'https://www.kma.go.kr/daejeon/html/news/notice_view.jsp?articleno=6056&boardId=press2&pageNo=49'}
    ]}
];
const KEY='season-detectives-personal-v1';
const STEPS=['자료 고르기','혼자 예상하기','서로 이야기하기','생각 다듬기'];
const textFields=['first','reason','heard','connection','final','question'];
let storageOK=true;
let state={version:1,topic:null,step:0,name:'',drafts:{}};
let toastTimeout, saveTimeout, timerInterval, audioContext;
let timer={seconds:300,remaining:300,end:null,running:false,warned:false};
const main=document.querySelector('#main');
const dialog=document.querySelector('#dialog');
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const topicById=id=>TOPICS.find(t=>t.id===id);
const topic=()=>topicById(state.topic);
const theme=t=>`--tone:${t.tone};--wash:${t.wash}`;
const freshDraft=()=>({first:'',reason:'',heard:'',connection:'',final:'',question:'',revealed:false,evidence:[],connected:[],change:'',complete:false,maxStep:1,checks:[false,false,false]});
function draft(){if(!state.drafts[state.topic])state.drafts[state.topic]=freshDraft();return state.drafts[state.topic];}
function restore(){
  try{
    const raw=JSON.parse(localStorage.getItem(KEY)||'null');
    if(!raw||raw.version!==1)return;
    state.name=typeof raw.name==='string'?raw.name.slice(0,30):'';
    for(const t of TOPICS){
      const saved=raw.drafts?.[t.id];if(!saved||typeof saved!=='object')continue;
      const d=freshDraft();
      for(const f of textFields)if(typeof saved[f]==='string')d[f]=saved[f].slice(0,1200);
      d.evidence=Array.isArray(saved.evidence)?[...new Set(saved.evidence.filter(n=>Number.isInteger(n)&&n>=0&&n<3))]:[];
      d.connected=Array.isArray(saved.connected)?saved.connected.filter(id=>topicById(id)&&id!==t.id):[];
      d.revealed=saved.revealed===true;d.complete=saved.complete===true;
      d.maxStep=Number.isInteger(saved.maxStep)?Math.min(3,Math.max(1,saved.maxStep)):1;
      d.change=['보충했어요','바꾸었어요','근거가 더 분명해졌어요'].includes(saved.change)?saved.change:'';
      d.checks=Array.isArray(saved.checks)?[0,1,2].map(i=>saved.checks[i]===true):[false,false,false];
      state.drafts[t.id]=d;
    }
    if(topicById(raw.topic)){
      state.topic=raw.topic;
      state.step=Number.isInteger(raw.step)?Math.min(draft().maxStep,Math.max(0,raw.step)):0;
    }
  }catch(e){storageOK=false;}
}
function save(){
  try{localStorage.setItem(KEY,JSON.stringify(state));storageOK=true;}catch(e){storageOK=false;}
  const status=document.querySelector('#save-state');
  status.classList.toggle('error',!storageOK);
  status.textContent=storageOK?'이 기기에 저장했어요':'자동 저장 불가 · 기록을 내려받아 주세요';
  clearTimeout(saveTimeout);
  if(storageOK)saveTimeout=setTimeout(()=>{status.textContent='이 기기에 자동 저장';},1800);
}
function toast(message){const el=document.querySelector('#toast');el.textContent=message;el.classList.add('visible');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>el.classList.remove('visible'),3500);}
function navigate(step){
  if(step>0&&!topic())return;
  if(step>0&&step>draft().maxStep)return;
  state.step=step;save();render();main.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});
}
function renderProgress(){
  const max=topic()?draft().maxStep:0;
  document.querySelector('#progress').innerHTML=STEPS.map((label,i)=>`${i?'<span class="step-sep" aria-hidden="true">›</span>':''}<button type="button" class="step ${state.step===i?'current':i<state.step?'done':''}" data-action="step" data-step="${i}" ${i>max?'disabled':''} ${state.step===i?'aria-current="step"':''}><span class="num" aria-hidden="true">${i<state.step?'✓':i+1}</span>${label}</button>`).join('');
}
function sourceLine(t){return `<div class="source-line">${esc(t.source)}${t.sourceLinks.length?` · <button class="text-button" style="font-size:11px;padding:0" data-action="sources" type="button">출처 보기 ↗</button>`:''}</div>`;}
function field(label,key,value,placeholder='',rows=3,helper=''){
  return `<label class="field"><span>${label}</span><textarea data-field="${key}" rows="${rows}" maxlength="1200" placeholder="${esc(placeholder)}">${esc(value)}</textarea>${helper?`<small class="helper">${helper}</small>`:''}</label>`;
}
function title(heading,description){const t=topic();return `<div class="view-title"><div><h2>${heading}</h2><p>${description}</p></div><span class="topic-badge" style="${theme(t)}">자료 ${t.no} · ${t.title}</span></div>`;}
function renderHome(){
  const current=topic();
  return `${current?`<div class="resume-bar"><span><b>${current.title}</b> 자료의 기록이 남아 있어요.</span><button type="button" class="button secondary small" data-action="resume">이어서 활동하기 →</button></div>`:''}
  <section class="hero" aria-labelledby="home-title"><div><div class="eyebrow">SEASON DETECTIVES</div><h1 id="home-title"><span class="summer">여름은 길어지고,</span><br><span class="winter">겨울은 짧아진다면?</span></h1><p>서로 다른 자료 속 단서를 모아<br>우리 생활과 생물의 모습을 예상해 봐요.</p></div>
  <div class="season-note"><div class="note-title"><b>교과서 속 두 기간을 비교해요</b><span aria-hidden="true">☀ ❄</span></div><div class="season-pair"><div class="season-stat"><span>여름의 길이</span><b>+20일</b></div><div class="season-stat blue"><span>겨울의 길이</span><b>−22일</b></div></div><small>1912~1940년 → 1991~2020년 · 교과서 88쪽</small><button type="button" data-action="seasons">숫자 살펴보기 ↗</button></div></section>
  <section aria-labelledby="choose-title"><div class="section-line"><h2 id="choose-title">내가 살펴볼 자료를 골라요</h2><span>친구와 다른 자료를 하나씩!</span></div><div class="topics">${TOPICS.map(t=>`<article class="topic-card" style="${theme(t)}"><div class="topic-photo"><img class="topic-art" src="assets/${t.image}" alt="${artAlt(t.id)}" width="1536" height="1024"><span class="ai-image-tag">AI 생성 이미지</span></div><div class="topic-body"><div class="topic-meta"><span>자료 0${t.no}</span><span class="category">${t.category}</span></div><h3>${t.title}</h3><p>${esc(t.intro).replace('\n','<br>')}</p><button type="button" class="button" data-action="choose" data-id="${t.id}">${state.drafts[t.id]?'이 자료 이어 보기':'이 자료 고르기'} <span aria-hidden="true">→</span></button></div></article>`).join('')}</div></section>
  <div class="home-tip"><span class="tip-mark">함께하는 방법</span><span>네 사람이 자료를 나눠 읽고, 태블릿 화면을 서로 보여 주며 이야기해요.</span></div>
  <div class="mobile-data-link"><button type="button" class="text-button" data-action="seasons">교과서 속 계절의 길이 살펴보기</button></div>`;
}
function artAlt(id){return {people:'운동장에서 공놀이하는 어린이의 실사형 이미지 (AI 생성)',mosquito:'물가 풀잎에 앉은 모기의 실사형 접사 이미지 (AI 생성)',frog:'물가에 앉은 갈색 개구리의 실사형 이미지 (AI 생성)',cherry:'봄 공원에 벚꽃이 핀 나무의 실사형 이미지 (AI 생성)'}[id];}
function renderAlone(){
  const t=topic(),d=draft();
  return `${title('내 예상에 단서를 더해요','먼저 예상하고, 자료를 읽으며 근거가 되는 문장을 골라요.')}
  <div class="work-grid"><section class="panel"><figure class="material-figure"><img src="assets/${t.image}" alt="${artAlt(t.id)}" width="640" height="400"><figcaption>AI로 만든 실사형 이미지</figcaption></figure><span class="first-tag">자료를 읽기 전</span>${field('1. 처음에는 이렇게 예상했어요','first',d.first,'여름이 길어지거나 겨울이 짧아지면…',3,'자료를 이미 읽었다면, 처음 떠오른 생각을 적어도 좋아요.')}</section>
  <section class="panel ${d.revealed?'':'tint'}" id="clue-panel">${d.revealed?`<h3>2. 자료에서 근거를 찾아요</h3><p class="fact-help">내 예상과 관련 있는 문장을 눌러 골라요. 여러 개 골라도 좋아요.</p><div class="facts">${t.facts.map((f,i)=>`<button type="button" class="fact ${d.evidence.includes(i)?'selected':''}" aria-pressed="${d.evidence.includes(i)}" data-action="evidence" data-index="${i}"><span class="check" aria-hidden="true">✓</span><span>${f}</span></button>`).join('')}</div>${sourceLine(t)}${field('3. 이 문장이 내 예상의 근거인 까닭은?','reason',d.reason,'자료의 내용과 내 예상이 어떻게 이어지는지 적어요.',2)}<div class="question-chip"><b>한 걸음 더 생각하기</b>${t.question}</div>`:`<div class="material-closed"><div class="closed-art" aria-hidden="true">⌕</div><h3>자료 속 단서를 만나 볼까요?</h3><p>왼쪽에 내 예상을 먼저 적고<br>단서를 열어 살펴봐요.</p><button type="button" class="button" data-action="reveal">자료의 단서 열기 →</button><small>내 생각을 확인할 단서 3개가 있어요.</small></div>`}</section></div>
  <p class="validation" id="validation" role="alert"></p><div class="action-row"><button type="button" class="button secondary" data-action="home">← 자료 다시 고르기</button><span class="note">내 기록은 다른 자료를 골라도 남아 있어요.</span><button type="button" class="button" data-action="to-talk">친구들과 이야기하기 →</button></div>`;
}
function showCard(big=false){
  const t=topic(),d=draft();
  return `<article class="show-card" style="${theme(t)}"><div class="show-head"><img src="assets/${t.image}" alt="" width="640" height="400"><div><small>자료 ${t.no} · ${t.category}</small><${big?'h2':'h3'}>${t.title}</${big?'h2':'h3'}></div></div><div class="show-body"><div class="show-block"><div class="show-label">나의 예상</div><p class="show-text">${esc(d.first)||'<span class="empty">아직 적은 내용이 없어요.</span>'}</p></div><div class="show-block"><div class="show-label">자료에서 찾은 근거</div>${d.evidence.map(i=>`<p class="show-quote">${esc(t.facts[i])}</p>`).join('')||'<span class="empty">선택한 근거가 없어요.</span>'}</div><div class="show-block"><div class="show-label">그렇게 연결한 까닭</div><p class="show-text">${esc(d.reason)||'<span class="empty">아직 적은 내용이 없어요.</span>'}</p></div></div></article>`;
}
function renderTalk(){
  const t=topic(),d=draft();
  return `${title('태블릿을 보여 주며 이야기해요','한 사람씩 설명하고, 듣는 친구는 근거를 묻거나 다른 자료와 연결해 봐요.')}
  <div class="talk-grid"><div><div class="section-line"><h3>내가 친구들에게 알려줄 이야기</h3><button type="button" class="button secondary small" data-action="present">크게 보여 주기 ⛶</button></div>${showCard()}</div>
  <div class="talk-side"><section class="panel"><h3>네 사람이 모두 이야기해요</h3><ol class="talk-guide"><li>내 자료의 사실과 예상을 알려줘요.</li><li>친구는 “어느 내용을 보고 그렇게 생각했어?”라고 물어요.</li><li>네 자료 중 서로 이어지는 내용을 찾아요.</li></ol><div class="discussion-question">“이 변화가 다른 생물이나 사람에게도 이어질까?”<br>“아직 더 알아봐야 할 것은 없을까?”</div></section><section class="panel">${field('친구의 말에서 새로 알게 된 점 <small class="quiet-label">선택</small>','heard',d.heard,'친구의 자료나 설명에서 새롭게 생각한 점은?',2)}<div class="connect-title">내 자료와 이어 본 친구의 자료 <span class="quiet-label">선택</span></div><div class="connect-topics">${TOPICS.filter(x=>x.id!==t.id).map(x=>`<button class="topic-pill ${d.connected.includes(x.id)?'selected':''}" type="button" aria-pressed="${d.connected.includes(x.id)}" data-action="connect" data-id="${x.id}">${x.title}</button>`).join('')}</div>${field('어떻게 이어질까요? <small class="quiet-label">선택</small>','connection',d.connection,'두 자료가 이어진다고 생각한 까닭은?',2)}</section></div></div>
  <div class="action-row"><button type="button" class="button secondary" data-action="step" data-step="1">← 내 자료 다시 보기</button><span class="note">토의 메모는 원하는 만큼만 적어요.</span><button type="button" class="button" data-action="to-final">내 생각 다듬기 →</button></div>`;
}
const changes=['보충했어요','바꾸었어요','근거가 더 분명해졌어요'];
function summaryHTML(){
  const d=draft(),t=topic();
  const item=(label,value)=>`<div class="summary-item"><b>${label}</b><p>${esc(value)||'<span class="empty">아직 적은 내용이 없어요.</span>'}</p></div>`;
  return `<div class="summary-list">${item('내가 다듬은 예상',d.final)}${item('자료에서 찾은 근거',d.evidence.map(i=>t.facts[i]).join('\n'))}${item('그렇게 연결한 까닭',d.reason)}${d.connection?item('다른 자료와 이어 본 생각',d.connection):''}${item('앞으로 확인하고 싶은 질문',d.question)}</div>`;
}
function renderFinal(){
  const t=topic(),d=draft();
  return `${title('이야기 나눈 뒤, 내 생각은?','처음 생각을 고치거나 보충해요. 같은 생각이라면 근거를 더해도 좋아요.')}
  ${d.complete?'<div class="complete-banner"><span><b>나의 탐구 기록을 완성했어요!</b> 파일로 저장해 두거나, 친구들에게 보여 주세요.</span><span aria-hidden="true">✦</span></div>':''}
  <div class="work-grid"><section class="panel"><div class="record-header"><h3>내 생각을 다듬어요</h3><label class="field name-field"><input data-field="name" type="text" maxlength="30" placeholder="이름 (선택)" aria-label="기록에 넣을 이름 (선택)" value="${esc(state.name)}"></label></div><div class="compare-card"><small>나의 첫 예상</small><p>${esc(d.first)||'아직 적은 내용이 없어요.'}</p></div><div class="change-options" aria-label="내 생각의 변화">${changes.map((c,i)=>`<button type="button" class="choice ${d.change===c?'selected':''}" aria-pressed="${d.change===c}" data-action="change" data-index="${i}">${c}</button>`).join('')}</div>${field('토의 후, 나는 이렇게 예상해요','final',d.final,'근거를 더하거나, 조건을 넣거나, 생각을 고쳐 적어요.',4)}${field('단원을 배우며 확인하고 싶은 질문','question',d.question,'더 알아봐야 할 점을 질문으로 남겨요.',2)}<div class="check-list"><label><input type="checkbox" data-check="0" ${d.checks[0]?'checked':''}>자료의 근거와 내 예상을 연결했나요?</label><label><input type="checkbox" data-check="1" ${d.checks[1]?'checked':''}>친구의 설명을 듣고 생각을 나누었나요?</label><label><input type="checkbox" data-check="2" ${d.checks[2]?'checked':''}>아직 모르는 것을 질문으로 남겼나요?</label></div></section>
  <section class="panel tint"><div class="section-line"><h3>나의 탐구 기록</h3><span>${t.title}</span></div><div id="live-summary">${summaryHTML()}</div><div class="download-actions"><button type="button" class="button" data-action="image">기록 이미지 저장 ↓</button><button type="button" class="button secondary" data-action="text">글로 저장 ↓</button><button type="button" class="button ghost" data-action="print">인쇄</button></div><p class="source-line">자동 저장은 이 기기·이 브라우저에서만 이어져요.<br>새로 들어올 친구가 있다면, 먼저 파일로 저장하고 기록을 지워요.</p></section></div>
  <p class="validation" id="validation" role="alert"></p><div class="action-row"><button type="button" class="button secondary" data-action="step" data-step="2">← 친구들과 더 이야기하기</button><button type="button" class="button" data-action="complete">${d.complete?'기록 완성 확인 ✓':'나의 탐구 마치기 ✓'}</button></div>`;
}
function render(){renderProgress();main.innerHTML=[renderHome,renderAlone,renderTalk,renderFinal][state.step]();if(!storageOK){const el=document.querySelector('#save-state');el.classList.add('error');el.textContent='자동 저장 불가 · 기록을 내려받아 주세요';}}
function showValidation(message,fieldName){
  const el=document.querySelector('#validation');if(el)el.textContent=message;
  if(fieldName)document.querySelector(`[data-field="${fieldName}"]`)?.focus();else el?.scrollIntoView({block:'nearest'});
}
function openDialog(title,body,big=false){
  dialog.classList.toggle('big-dialog',big);
  document.querySelector('#dialog-content').innerHTML=`<div class="dialog-head"><h2 id="dialog-title">${title}</h2><button type="button" class="close" data-action="close" aria-label="닫기">×</button></div><div class="dialog-body">${body}</div>`;
  if(!dialog.open)dialog.showModal();
  dialog.scrollTop=0;
}
function showSources(){openDialog('자료는 어디에서 왔나요?',`<ul class="sources-list"><li><b>교과서의 계절 길이</b><p>제공된 4학년 과학 교과서 88쪽(원자료: 기상청). 1912~1940년과 1991~2020년의 여름·겨울 길이를 비교했습니다.</p></li>${TOPICS.map(t=>`<li><b>자료 ${t.no} · ${t.title}</b><p>${t.source}</p>${t.sourceLinks.map(l=>`<a href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">${l.label} ↗</a>`).join('<br>')}${t.id==='frog'?'<p>자료는 지리산의 북방산개구리 관찰에 관한 내용입니다. 모든 개구리가 같은 시기에 알을 낳는다는 뜻은 아닙니다.</p>':''}</li>`).join('')}</ul><p class="source-notice">생물 자료는 공식 기관의 글에서 평소 생활과 관련된 내용만 골라 4학년이 읽기 쉽게 풀어썼습니다. 자료 이미지는 AI로 만든 실사형 참고 이미지입니다. 특정 장소에서 촬영한 관찰 사진은 아닙니다. 원문의 변화 결과는 학생이 스스로 예상할 수 있도록 자료 카드에 넣지 않았습니다.</p>`);}
function showSeasons(){openDialog('계절의 길이, 얼마나 달라졌을까요?',`<p>교과서 88쪽에 제시된 <b>두 기간의 자료</b>를 비교해요.</p><table class="chart-table"><thead><tr><th scope="col">계절</th><th scope="col">1912~1940년</th><th scope="col">1991~2020년</th><th scope="col">길이의 차이</th></tr></thead><tbody><tr><th scope="row">여름</th><td>98일</td><td>118일</td><td style="color:#ae5938"><b>20일 길어짐</b></td></tr><tr><th scope="row">겨울</th><td>109일</td><td>87일</td><td style="color:#40778c"><b>22일 짧아짐</b></td></tr></tbody></table><p class="chart-note">자료: 제공된 과학 교과서 88쪽(원자료: 기상청). 올해의 여름·겨울 길이를 나타낸 수치가 아닙니다.</p><div class="question-chip"><b>오늘의 질문</b>이런 변화가 이어진다면, 사람과 생물에게 어떤 일이 일어날까요?</div>`);}
function showGuide(){
  openDialog('함께 수업하는 방법',`<p><b>오늘의 배움</b> · 여름이 길어지고 겨울이 짧아질 때의 모습을 자료를 근거로 예상해 봅시다.</p><div class="guide-flow"><div><b>① 자료 고르기</b>모둠에서 다른 자료를 하나씩 골라요.<br>약 3분</div><div><b>② 혼자 예상하기</b>첫 예상 → 단서 읽기 → 근거 고르기<br>약 9분</div><div><b>③ 서로 이야기하기</b>한 명씩 화면을 보여 주며 설명해요.<br>약 12분</div><div><b>④ 생각 다듬기</b>예상을 보충하고 질문을 남겨요.<br>약 6분</div></div><div class="teacher-note"><b>선생님께</b><br>도입 5분, 모둠별 핵심 예상 나누기 5분을 더하면 40분 수업으로 운영할 수 있습니다. 이번 시간은 계절 변화에 관심을 갖고, 자료로 예상하며 질문을 만드는 도입 활동입니다. 기후 변화 현상의 종류·원인·피해·대응 방법에 대한 정리는 다음 차시에 남겨 둡니다.<br>4인 모둠은 자료를 하나씩, 인원이 다르면 같은 자료를 함께 맡거나 한 사람이 자료 두 개를 맡아도 됩니다.</div><h3>태블릿에서는 이렇게 해요</h3><p>입장 절차 없이 각자 자료를 고릅니다. 토의 화면의 <b>‘크게 보여 주기’</b>를 눌러 서로의 화면을 봅니다. 작성한 기록은 같은 기기·브라우저에 자동 저장되며, 친구 기기와는 연결되지 않습니다. 이미지나 글 파일로 개인 기록을 내려받을 수 있습니다.</p><div class="timer"><h3 style="margin:0">활동 타이머</h3><div id="timer-display" class="timer-display" role="timer" aria-label="남은 시간">${formatTime(timer.remaining)}</div><div class="timer-presets">${[3,5,8,10,12].map(m=>`<button type="button" class="button secondary small" data-action="timer-preset" data-minutes="${m}">${m}분</button>`).join('')}</div><div class="timer-controls"><button type="button" class="button" data-action="timer-start" id="timer-toggle">${timer.running?'일시정지':'시작'}</button><button type="button" class="button secondary" data-action="timer-reset">다시 맞추기</button></div><div class="timer-status" id="timer-status">${timer.running?'타이머가 흐르고 있어요.':'시작하면 5초 전 알림음과 종료음이 나와요.'}</div></div>`);
}
function formatTime(n){return`${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;}
function initAudio(){try{audioContext??=new(window.AudioContext||window.webkitAudioContext)();if(audioContext.state==='suspended')audioContext.resume();}catch(e){}}
function beep(end=false){
  if(!audioContext)return;
  try{for(let i=0;i<(end?3:1);i++){const o=audioContext.createOscillator(),g=audioContext.createGain(),at=audioContext.currentTime+i*.38;o.type='sine';o.frequency.value=end?740:520;g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(.32,at+.02);g.gain.exponentialRampToValueAtTime(.001,at+.28);o.connect(g);g.connect(audioContext.destination);o.start(at);o.stop(at+.3);}}catch(e){}
}
function updateTimer(){
  if(timer.running){timer.remaining=Math.max(0,Math.ceil((timer.end-Date.now())/1000));if(timer.remaining<=5&&timer.remaining>0&&!timer.warned){timer.warned=true;beep();}if(timer.remaining===0){timer.running=false;clearInterval(timerInterval);beep(true);toast('활동 시간이 끝났어요. 생각을 마무리해요.');}}
  const el=document.querySelector('#timer-display');if(el){el.textContent=formatTime(timer.remaining);el.classList.toggle('ending',timer.remaining<=5);document.querySelector('#timer-toggle').textContent=timer.running?'일시정지':'시작';document.querySelector('#timer-status').textContent=timer.remaining===0?'시간이 끝났어요.':timer.running?'창을 닫아도 타이머는 계속 흘러요.':'5초 전 알림음 · 종료음';}
}
function stopTimer(){if(timer.running)updateTimer();timer.running=false;clearInterval(timerInterval);}
function dateString(){return new Date().toLocaleDateString('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'long',day:'numeric'});}
function recordSections(){
  const d=draft(),t=topic();
  return [
    ['처음 예상',d.first],['자료에서 찾은 근거',d.evidence.map(i=>t.facts[i]).join('\n')],['그렇게 연결한 까닭',d.reason],
    ['친구에게 듣고 새로 알게 된 점',d.heard],['이어 본 친구의 자료',d.connected.map(id=>topicById(id).title).join(', ')],['다른 자료와 이어 본 생각',d.connection],
    ['내 생각의 변화',d.change],['토의 후 다듬은 예상',d.final],['앞으로 확인하고 싶은 질문',d.question]
  ];
}
function downloadBlob(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
function safeName(){return (state.name.trim()||'나의').replace(/[\\/:*?"<>|\x00-\x1F]/g,'_').slice(0,30);}
function exportText(){
  const t=topic();const content=`계절 탐정단 · 나의 탐구 기록\n여름이 길어지고 겨울이 짧아진다면?\n자료 ${t.no} · ${t.title}\n이름: ${state.name.trim()||'(입력하지 않음)'}\n${dateString()}\n\n${recordSections().map(([label,value])=>`[${label}]\n${value.trim()||'(아직 적지 않음)'}`).join('\n\n')}\n\n[자료 출처]\n${t.source}\n${t.sourceLinks.map(l=>`${l.label}\n${l.url}`).join('\n')}\n이미지: AI로 만든 실사형 참고 이미지\n`;
  downloadBlob(new Blob(['\uFEFF'+content],{type:'text/plain;charset=utf-8'}),`${safeName()}_계절탐정단_${t.title}.txt`);toast('탐구 기록을 글 파일로 저장했어요.');
}
function wrapText(ctx,text,maxWidth){
  const lines=[];
  for(const paragraph of String(text).split('\n')){if(!paragraph){lines.push('');continue;}let line='';for(const ch of Array.from(paragraph)){if(ctx.measureText(line+ch).width>maxWidth&&line){lines.push(line);line=ch;}else line+=ch;}lines.push(line);}
  return lines;
}
function rounded(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();}
async function exportImage(){
  toast('탐구 기록 이미지를 만들고 있어요.');
  try{
    const t=topic(),c=document.createElement('canvas'),ctx=c.getContext('2d');c.width=1400;
    const sections=recordSections().filter(([label,value])=>value.trim()||['처음 예상','자료에서 찾은 근거','그렇게 연결한 까닭','토의 후 다듬은 예상','앞으로 확인하고 싶은 질문'].includes(label));
    ctx.font='29px "Malgun Gothic", "Noto Sans KR", sans-serif';
    const blocks=sections.map(([label,value])=>({label,lines:wrapText(ctx,value.trim()||'(아직 적지 않음)',1180)}));
    const height=380+blocks.reduce((total,b)=>total+102+b.lines.length*44,0)+100;
    // With each field capped at 1,200 characters this stays within tablet canvas limits.
    c.height=height;ctx.fillStyle='#fffcf5';ctx.fillRect(0,0,c.width,c.height);
    ctx.fillStyle='#176b58';ctx.fillRect(0,0,c.width,14);
    ctx.fillStyle='#587463';ctx.font='bold 21px "Malgun Gothic", sans-serif';ctx.fillText('계절 탐정단 · 나의 탐구 기록',80,76);
    ctx.fillStyle='#243b34';ctx.font='bold 43px "Malgun Gothic", sans-serif';ctx.fillText('여름이 길어지고 겨울이 짧아진다면?',80,142);
    ctx.fillStyle=t.tone;ctx.font='bold 30px "Malgun Gothic", sans-serif';ctx.fillText(`자료 ${t.no} · ${t.title}`,80,201);
    ctx.fillStyle='#66786d';ctx.font='23px "Malgun Gothic", sans-serif';ctx.fillText(`${state.name.trim()||'이름 없음'}  ·  ${dateString()}`,80,252);
    let y=290;
    for(const b of blocks){const h=76+b.lines.length*44;ctx.fillStyle='white';rounded(ctx,60,y,1280,h,18);ctx.fillStyle='#176b58';ctx.font='bold 23px "Malgun Gothic", sans-serif';ctx.fillText(b.label,90,y+37);ctx.fillStyle='#243b34';ctx.font='29px "Malgun Gothic", "Noto Sans KR", sans-serif';b.lines.forEach((line,i)=>ctx.fillText(line,90,y+81+i*44));y+=h+26;}
    ctx.fillStyle='#66786d';ctx.font='18px "Malgun Gothic", sans-serif';wrapText(ctx,t.source,1220).forEach((line,i)=>ctx.fillText(line,80,y+22+i*28));ctx.fillText('계절 탐정단 · 자료를 근거로 예상하고, 앞으로 확인할 질문을 남겨요.',80,y+83);
    const blob=await new Promise(resolve=>c.toBlob(resolve,'image/png'));if(!blob)throw new Error('Canvas export failed');
    const filename=`${safeName()}_계절탐정단_${t.title}.png`;downloadBlob(blob,filename);
    openDialog('나의 탐구 기록 이미지',`<p style="margin-bottom:15px">다운로드한 이미지에 모든 기록이 담겨 있어요. 태블릿에서 다운로드가 열리지 않으면 아래 이미지를 길게 눌러 저장할 수 있어요.</p><img class="dialog-preview-image" src="${c.toDataURL('image/png')}" alt="${esc(t.title)}에 대한 나의 탐구 기록 이미지">`);
  }catch(e){toast('이미지 저장이 어려워요. ‘글로 저장’을 이용해 주세요.');}
}
function resetAll(){openDialog('이 기기의 기록을 지울까요?',`<p>네 자료에 적은 내용과 이름이 모두 지워져요.<br>필요한 기록은 먼저 이미지나 글 파일로 저장해 주세요.</p><div class="confirm-actions"><button type="button" class="button secondary" data-action="close">돌아가기</button><button type="button" class="button" data-action="confirm-reset">모든 기록 지우기</button></div>`);}
function markEdited(){
  draft().complete=false;
  document.querySelector('.complete-banner')?.remove();
  const button=document.querySelector('[data-action="complete"]');if(button)button.textContent='나의 탐구 마치기 ✓';
}
document.addEventListener('input',event=>{
  const key=event.target.dataset.field;if(!key)return;
  if(key==='name')state.name=event.target.value;else if(textFields.includes(key)&&topic()){draft()[key]=event.target.value;markEdited();}else return;
  save();const summary=document.querySelector('#live-summary');if(summary)summary.innerHTML=summaryHTML();
});
document.addEventListener('change',event=>{if(event.target.dataset.check!==undefined&&topic()){draft().checks[Number(event.target.dataset.check)]=event.target.checked;save();}});
document.addEventListener('click',async event=>{
  const btn=event.target.closest('[data-action]');if(!btn||btn.disabled)return;
  switch(btn.dataset.action){
    case 'home':navigate(0);break;
    case 'step':navigate(Number(btn.dataset.step));break;
    case 'choose':{if(!topicById(btn.dataset.id))return;state.topic=btn.dataset.id;draft();navigate(1);break;}
    case 'resume':navigate(Math.max(1,draft().maxStep));break;
    case 'reveal':{draft().revealed=true;save();render();document.querySelector('#clue-panel h3')?.scrollIntoView({block:'nearest'});break;}
    case 'evidence':{const i=Number(btn.dataset.index),d=draft();d.evidence=d.evidence.includes(i)?d.evidence.filter(n=>n!==i):[...d.evidence,i].sort();d.complete=false;btn.classList.toggle('selected',d.evidence.includes(i));btn.setAttribute('aria-pressed',String(d.evidence.includes(i)));save();break;}
    case 'to-talk':{
      const d=draft();if(!d.first.trim()){showValidation('먼저 내 예상을 한 가지 적어 주세요.','first');return;}
      if(!d.revealed||!d.evidence.length){showValidation('자료의 단서를 열고, 내 예상의 근거가 되는 문장을 골라 주세요.');if(!d.revealed)document.querySelector('[data-action="reveal"]')?.focus();else document.querySelector('.fact')?.focus();return;}
      if(!d.reason.trim()){showValidation('자료의 내용이 내 예상과 어떻게 이어지는지 적어 주세요.','reason');return;}
      d.maxStep=Math.max(d.maxStep,2);navigate(2);break;
    }
    case 'to-final':draft().maxStep=3;navigate(3);break;
    case 'connect':{const d=draft(),id=btn.dataset.id;d.connected=d.connected.includes(id)?d.connected.filter(x=>x!==id):[...d.connected,id];btn.classList.toggle('selected',d.connected.includes(id));btn.setAttribute('aria-pressed',String(d.connected.includes(id)));save();break;}
    case 'change':{const d=draft();d.change=changes[Number(btn.dataset.index)];document.querySelectorAll('[data-action="change"]').forEach((b,i)=>{b.classList.toggle('selected',changes[i]===d.change);b.setAttribute('aria-pressed',String(changes[i]===d.change));});markEdited();save();break;}
    case 'complete':{const d=draft();if(!d.final.trim()){showValidation('토의 후 다듬은 예상을 적어 주세요.','final');return;}if(!d.question.trim()){showValidation('단원을 배우며 더 확인하고 싶은 질문을 남겨 주세요.','question');return;}d.complete=true;save();render();toast('나의 탐구 기록을 완성했어요!');main.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});break;}
    case 'present':openDialog('내 자료를 보여 줄게요',showCard(true),true);break;
    case 'sources':showSources();break;
    case 'seasons':showSeasons();break;
    case 'guide':showGuide();updateTimer();break;
    case 'close':dialog.close();break;
    case 'text':exportText();break;
    case 'image':await exportImage();break;
    case 'print':window.print();break;
    case 'reset':resetAll();break;
    case 'confirm-reset':{stopTimer();timer.remaining=timer.seconds;timer.warned=false;state={version:1,topic:null,step:0,name:'',drafts:{}};save();dialog.close();render();main.focus({preventScroll:true});toast('이 기기의 기록을 지웠어요. 새로 시작할 수 있어요.');break;}
    case 'timer-preset':{stopTimer();timer.seconds=Number(btn.dataset.minutes)*60;timer.remaining=timer.seconds;timer.warned=false;updateTimer();break;}
    case 'timer-start':{initAudio();if(timer.running){stopTimer();}else{if(timer.remaining<=0)timer.remaining=timer.seconds;timer.end=Date.now()+timer.remaining*1000;timer.running=true;timer.warned=timer.remaining<=5;clearInterval(timerInterval);timerInterval=setInterval(updateTimer,200);}updateTimer();break;}
    case 'timer-reset':stopTimer();timer.remaining=timer.seconds;timer.warned=false;updateTimer();break;
  }
});
dialog.addEventListener('click',e=>{if(e.target===dialog){const rect=dialog.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)dialog.close();}});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)updateTimer();});
restore();render();
