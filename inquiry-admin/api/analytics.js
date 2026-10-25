import { randomUUID } from 'node:crypto';
import { list, put, get } from '@vercel/blob';
import { cors, send } from '../lib/security.js';
const known=new Set(['/','/about.html','/product.html','/fruits.html','/fruit.html','/flower.html','/partnership.html','/why-terrasave.html','/technology.html','/terracle.html','/solutions.html','/problem.html','/what-we-do.html']);
function normalize(path){
 if(typeof path!=='string'||path.length>160)return null;
 let p=path.split('?')[0].replace(/\/+$/,'')||'/';
 let zh=p.startsWith('/zh/');
 if(zh)p=p.slice(3);
 if(p==='/index.html')p='/';
 return known.has(p)?(zh?'/zh':'')+p:null;
}
const dateKST=timestamp=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(timestamp));
export default async function handler(req,res){
 if(req.method==='OPTIONS'){const ok=cors(req,res);return res.status(ok?204:403).end();}
 if(!process.env.BLOB_READ_WRITE_TOKEN&&!process.env.VERCEL_OIDC_TOKEN)return send(res,503,{error:'통계 저장소 미연결'});
 if(req.method==='POST'){
  if(!cors(req,res))return send(res,403,{error:'허용되지 않은 사이트'});
  if(JSON.stringify(req.body||{}).length>300)return send(res,413,{error:'요청 크기 초과'});
  const path=normalize(req.body?.path);
  if(!path)return send(res,400,{error:'지원되지 않는 페이지'});
  try{
   await put('analytics/views/'+dateKST(Date.now())+'/'+randomUUID()+'.json',JSON.stringify({path}),{access:'private',contentType:'application/json',addRandomSuffix:false});
   return send(res,201,{ok:true});
  }catch{return send(res,503,{error:'방문 기록 저장 오류'});}
 }
 if(req.method!=='GET')return send(res,405,{error:'허용되지 않는 요청'});
 // Public aggregate-only endpoint. Never exposes inquiries, IPs or personal records.
 const origin=req.headers.origin;
 if(origin && !['https://terrasave.co.kr','https://www.terrasave.co.kr','https://terrasave-inquiry-admin.vercel.app'].includes(origin))
   return send(res,403,{error:'허용되지 않은 사이트'});
 if(origin){res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');}
 try{
  const dates=Array.from({length:30},(_,i)=>dateKST(Date.now()-(29-i)*86400000));
  const byPage=new Map();const daily=[];let truncated=false;
  for(const date of dates){
   let cursor,count=0;
   do {
    const result=await list({prefix:'analytics/views/'+date+'/',limit:1000,cursor});
    const files=result.blobs||[];
    count+=files.length;
    // Private blobs only. Never store personal identifiers.
    for(let i=0;i<files.length;i+=25){
     await Promise.all(files.slice(i,i+25).map(async b=>{
      try{const file=await get(b.pathname,{access:'private'});if(file?.statusCode!==200)return;
      const {path}=await new Response(file.stream).json();
      if(normalize(path))byPage.set(path,(byPage.get(path)||0)+1);}catch{}
     }));
    }
    cursor=result.hasMore?result.cursor:undefined;
    if(count>=10000){truncated=true;break;}
   }while(cursor);
   daily.push({date,count});
  }
  return send(res,200,{today:daily.at(-1)?.count||0,week:daily.slice(-7).reduce((s,x)=>s+x.count,0),month:daily.reduce((s,x)=>s+x.count,0),daily,byPage:[...byPage].sort((a,b)=>b[1]-a[1]).map(([path,count])=>({path,count})),scope:'pageviews',truncated});
 }catch{return send(res,503,{error:'통계 목록을 불러오지 못했습니다.'});}
}
