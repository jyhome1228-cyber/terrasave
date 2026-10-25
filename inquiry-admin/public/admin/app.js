(() => {
'use strict';
const $ = selector => document.querySelector(selector);
const loginSection=$('#loginSection'), dashboard=$('#dashboard'), loading=$('#loading'), logout=$('#logout');
const loginForm=$('#loginForm'), loginError=$('#loginError'), list=$('#inquiryList'), detail=$('#details');
const labels={new:'신규 접수',reviewing:'검토 중',replied:'답변 완료',closed:'종결'};
const fields=[['inquiryType','문의 유형'],['name','담당자'],['company','회사명'],['email','이메일'],['phone','연락처']];
let entries=[], selectedId=null;
const text=(tag,contents,className) => {const el=document.createElement(tag);el.textContent=contents??'';if(className)el.className=className;return el;};
const request=async(method,path,body)=>{
 const r=await fetch(path,{method,credentials:'same-origin',headers:{'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,cache:'no-store'});
 const data=await r.json().catch(()=>({error:'서버 응답을 확인하지 못했습니다.'}));
 if(!r.ok)throw new Error(data.error||'요청에 실패했습니다.');
 return data;
};
function visible(which){loading.hidden=which!=='loading';loginSection.hidden=which!=='login';dashboard.hidden=which!=='dashboard';logout.hidden=which!=='dashboard';}
const formatDate=value=>new Intl.DateTimeFormat('ko-KR',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Seoul'}).format(new Date(value));
const row=(title,value,link)=>{
 const div=document.createElement('div');const dt=text('dt',title);const dd=text('dd',value||'-');
 if(link&&value){const a=document.createElement('a');a.href=link+encodeURIComponent(value);a.textContent=value;dd.replaceChildren(a);}
 div.append(dt,dd);return div;
};
function selected(){return entries.find(entry=>entry.id===selectedId)||null;}
function stats(){
 const cards=[['전체 접수',entries.length],['신규 접수',entries.filter(x=>x.status==='new').length],['검토 중',entries.filter(x=>x.status==='reviewing').length],['답변 완료',entries.filter(x=>x.status==='replied').length]];
 $('#stats').replaceChildren(...cards.map(([label,value])=>{const c=document.createElement('div');c.className='stat';c.append(text('span',label),text('strong',value));return c;}));
}
function viewDetail(){
 const entry=selected();
 if(!entry){detail.replaceChildren(text('div','왼쪽 목록에서 문의를 선택하세요.','empty'));return;}
 const body=document.createElement('div');body.className='detail-inner';
 const head=document.createElement('div');head.className='detail-head';
 const title=document.createElement('div');title.append(text('h2',entry.company||entry.name),text('p',formatDate(entry.createdAt),'detail-time'));
 head.append(title,text('span',labels[entry.status]||'신규 접수','status status-'+entry.status));
 const dl=document.createElement('dl');dl.className='detail-grid';
 for(const [key,label] of fields)dl.append(row(label,entry[key],key==='email'?'mailto:':key==='phone'?'tel:':null));
 const msg=document.createElement('div');msg.className='message-block';msg.append(text('h3','문의 내용'),text('p',entry.message));
 const form=document.createElement('form');form.className='details-controls';
 const statusDiv=document.createElement('div');statusDiv.append(text('label','처리 상태'));
 const statusSelect=document.createElement('select');statusSelect.name='status';statusSelect.setAttribute('aria-label','처리 상태');
 for(const [value,label] of Object.entries(labels)){const option=document.createElement('option');option.value=value;option.textContent=label;option.selected=value===entry.status;statusSelect.append(option);}statusDiv.append(statusSelect);
 const memoDiv=document.createElement('div');memoDiv.append(text('label','관리 메모'));
 const memo=document.createElement('textarea');memo.name='memo';memo.maxLength=2000;memo.placeholder='담당자 확인 내용이나 후속 업무를 기록해 주세요.';memo.value=entry.memo||'';memoDiv.append(memo);
 const foot=document.createElement('div'),save=document.createElement('button');save.type='submit';save.className='primary';save.textContent='처리 상태 저장';const feedback=text('span','','save-status');foot.append(save,feedback);
 form.append(statusDiv,memoDiv,foot);
 form.addEventListener('submit',async e=>{e.preventDefault();save.disabled=true;feedback.textContent='저장 중…';try{const updated=await request('PATCH','/api/inquiries',{id:entry.id,status:statusSelect.value,memo:memo.value});Object.assign(entry,updated);stats();renderList();feedback.textContent='저장되었습니다.';}catch(error){feedback.textContent=error.message;}finally{save.disabled=false;}});
 body.append(head,dl,msg,form);detail.replaceChildren(body);
}
function renderList(){
 const search=$('#search').value.trim().toLowerCase(),status=$('#filterStatus').value,type=$('#filterType').value;
 const shown=entries.filter(x=>(status==='all'||x.status===status)&&(type==='all'||x.inquiryType===type)&&(!search||[x.name,x.company,x.email,x.message,x.inquiryType].some(v=>String(v||'').toLowerCase().includes(search))));
 $('#listCount').textContent=shown.length+'건';
 if(!shown.length){list.replaceChildren(text('div','조건에 맞는 문의가 없습니다.','empty'));return;}
 list.replaceChildren(...shown.map(item=>{
  const button=document.createElement('button');button.type='button';button.className='inquiry-row';button.setAttribute('aria-pressed',String(selectedId===item.id));
  const first=document.createElement('div');first.className='row-top';first.append(text('strong',item.company||item.name),text('span',labels[item.status]||'신규 접수','status status-'+item.status));
  button.append(first,text('p',item.inquiryType+' · '+formatDate(item.createdAt),'row-meta'),text('p',item.message,'row-body'));
  button.addEventListener('click',()=>{selectedId=item.id;renderList();viewDetail();});return button;
 }));
}

async function loadVisitors(){
 const stat=$('#visitorStats'), days=$('#visitorDays'), pages=$('#visitorPages');
 try {
  const d=await request('GET','/api/analytics');
  const items=[['오늘 페이지뷰',d.today],['최근 7일 페이지뷰',d.week],['최근 30일 페이지뷰',d.month]];
  stat.replaceChildren(...items.map(([name,value])=>{const el=document.createElement('div');el.className='stat';el.append(text('span',name),text('strong',Number(value||0).toLocaleString('ko-KR')));return el;}));
  const dayData=(d.daily||[]).slice(-7);
  days.replaceChildren(...dayData.map(x=>{const el=document.createElement('div');el.className='visitor-data-row';el.append(text('span',x.date),text('strong',x.count.toLocaleString('ko-KR')));return el;}));
  const pageData=(d.byPage||[]).slice(0,20);
  pages.replaceChildren(...(pageData.length?pageData.map(x=>{const el=document.createElement('div');el.className='visitor-data-row';el.append(text('span',x.path),text('strong',x.count.toLocaleString('ko-KR')));return el;}):[text('p','아직 집계된 방문 기록이 없습니다.','muted')]));
  if(d.truncated)pages.append(text('p','집계량이 많아 일부 조회수가 제한될 수 있습니다.','muted'));
 } catch(e){stat.replaceChildren(text('div',e.message,'empty'));days.replaceChildren();pages.replaceChildren();}
}

async function load(){
 try{
  const data=await request('GET','/api/inquiries');entries=data.inquiries||[];
  const select=$('#filterType'),current=select.value;select.replaceChildren(new Option('전체 유형','all'),...[...new Set(entries.map(e=>e.inquiryType))].map(v=>new Option(v,v)));select.value=[...select.options].some(o=>o.value===current)?current:'all';
  stats();renderList();viewDetail();await loadVisitors();
 }catch(error){list.replaceChildren(text('div',error.message,'empty'));}
}
loginForm.addEventListener('submit',async event=>{event.preventDefault();$('#loginButton').disabled=true;loginError.textContent='';
 try{await request('POST','/api/session',{username:$('#username').value.trim(),password:$('#password').value});$('#password').value='';visible('dashboard');await load();}
 catch(error){loginError.textContent=error.message;}
 finally{$('#loginButton').disabled=false;}
});
logout.addEventListener('click',async()=>{await request('DELETE','/api/session');entries=[];selectedId=null;visible('login');});
$('#refresh').addEventListener('click',load);
$('#refreshVisitors').addEventListener('click',loadVisitors);
for(const id of ['#search','#filterStatus','#filterType'])$(id).addEventListener(id==='#search'?'input':'change',renderList);
$('#export').addEventListener('click',()=>{
 if(!entries.length)return;
 const keys=['createdAt','status','inquiryType','name','company','email','phone','message','memo'];
 const safeCell=value=>{
  const raw=String(value??'');
  const sanitized=/^[=+@\-\t\r]/.test(raw)?"'"+raw:raw;
  return '"'+sanitized.replace(/"/g,'""')+'"';
 };
 const csv=[keys.join(','),...entries.map(row=>keys.map(k=>safeCell(row[k])).join(','))].join('\r\n');
 const url=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'}));
 const link=document.createElement('a');link.href=url;link.download='terrasave-inquiries-'+new Date().toISOString().slice(0,10)+'.csv';link.click();URL.revokeObjectURL(url);
});
(async()=>{try{const data=await request('GET','/api/session');visible(data.authenticated?'dashboard':'login');if(data.authenticated)await load();}catch{visible('login');}})();
})();
