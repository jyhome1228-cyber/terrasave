import { del, get, list } from '@vercel/blob';
import { timingSafeEqual } from 'node:crypto';
const same=(a,b)=>{const x=Buffer.from(String(a||'')),y=Buffer.from(String(b||''));return x.length===y.length&&timingSafeEqual(x,y);};
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
 const expected=process.env.CRON_SECRET;
 if(!expected||!same(req.headers.authorization,'Bearer '+expected))return res.status(401).json({error:'Unauthorized'});
 const days=Math.max(30,Math.min(3650,Number(process.env.RETENTION_DAYS||365)));
 const cutoff=Date.now()-days*24*60*60*1000;
 let cursor;let deleted=0;let scanned=0;
 try{
  do{
   const page=await list({prefix:'inquiries/',limit:1000,cursor});
   cursor=page.hasMore?page.cursor:undefined;
   for(const blob of page.blobs){
    scanned++;
    if(new Date(blob.uploadedAt).getTime()>=cutoff)continue;
    const file=await get(blob.pathname,{access:'private'});
    if(file?.statusCode!==200)continue;
    const body=await new Response(file.stream).json();
    await del(blob.pathname,{access:'private'});
    if(/^[a-f0-9-]{36}$/.test(body.id)){
     try{await del('states/'+body.id+'.json',{access:'private'});}catch{}
    }
    deleted++;
   }
  }while(cursor&&scanned<20000);
  return res.status(200).json({deleted,scanned,retentionDays:days});
 }catch{return res.status(500).json({error:'Retention cleanup failed',deleted,scanned});}
}
