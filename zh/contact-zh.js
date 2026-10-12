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
  submit.textContent='提交中…';
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
   if(!response.ok||result.accepted!==true)throw new Error(result.error||'提交失败，请稍后重试。');
   status.textContent='咨询已成功提交。我们的工作人员会审核内容并与您联系。';
   status.dataset.state='success';
   form.reset();
   startedAt=Date.now();
  }catch(error){
   status.dataset.state='error';
   status.textContent=(error.message||'暂时无法完成在线提交。')+' 请直接发送邮件至 info@terracle.im。表单内容已保留。';
  }finally{
   submit.disabled=false;
   submit.textContent='提交咨询';
  }
 });
})();
