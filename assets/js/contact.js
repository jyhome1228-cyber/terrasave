/* TerraSAVE secure inquiry form. Success is shown only after durable API write. */
(() => {
 'use strict';
 const form=document.getElementById('contactForm');
 const submit=document.getElementById('contactSubmit');
 const status=document.getElementById('formStatus');
 const consent=document.getElementById('privacyConsent');
 if(!form||!submit||!status||!consent)return;
 const endpoint='https://terrasave-inquiry-admin.vercel.app/api/inquiries';
 let startedAt=Date.now();
 form.addEventListener('submit',async event=>{
  event.preventDefault();
  if(!form.reportValidity())return;
  status.textContent='';
  submit.disabled=true;
  submit.textContent='접수 중…';
  const data=Object.fromEntries(new FormData(form).entries());
  const payload={
   inquiryType:String(data.inquiryType||''),name:String(data.name||''),
   company:String(data.company||''),email:String(data.email||''),
   phone:String(data.phone||''),message:String(data.message||''),
   privacyConsent:consent.checked,website:String(data.website||''),startedAt
  };
  try{
   const response=await fetch(endpoint,{
    method:'POST',
    mode:'cors',
    credentials:'omit',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(payload)
   });
   const result=await response.json().catch(()=>({}));
   if(!response.ok||result.accepted!==true)throw new Error(result.error||'접수에 실패했습니다.');
   status.textContent='상담 문의가 정상 접수되었습니다. 담당자가 확인 후 안내드리겠습니다.';
   status.dataset.state='success';
   form.reset();
   startedAt=Date.now();
  }catch(error){
   status.dataset.state='error';
   status.textContent=(error.message||'온라인 접수를 완료하지 못했습니다.')+' 이메일(info@terracle.im)로 직접 문의해 주세요. 입력한 내용은 유지됩니다.';
  }finally{
   submit.disabled=false;
   submit.textContent='상담 접수하기';
  }
 });
})();
