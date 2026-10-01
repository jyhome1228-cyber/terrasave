import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
const source=fs.readFileSync('tools/layout-audit.mjs','utf8');
const path='tools/.webkit-audit-runtime.mjs';
const script=source.replace("import { chromium } from 'playwright';","import { webkit as chromium } from 'playwright';").replace("path.join(root,'qa-results')","path.join(root,'qa-results-webkit')");
if(script===source)throw new Error('Browser audit entry point changed.');
fs.writeFileSync(path,script);
try{
 const result=spawnSync(process.execPath,[path],{stdio:'inherit',env:{...process.env,QA_WIDTHS:'1440,390'}});
 process.exitCode=result.status??1;
}finally{fs.rmSync(path,{force:true});}
