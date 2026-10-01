/* One-time source migration refinements found by real-browser QA. */
import fs from 'node:fs';
const path='assets/css/site.css';
let css=fs.readFileSync(path,'utf8');
css=css.replace('--muted:#70777e','--muted:#667078');
const before='.ts-reference-list{list-style:none;margin:0;padding:0;display:grid;gap:12px}';
const after='.ts-reference-list{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:minmax(0,1fr);min-width:0;gap:12px}.ts-reference-list>li{min-width:0;overflow-wrap:anywhere}';
if(!css.includes(before)&&!css.includes(after))throw new Error('Reference-list source rule changed; inspect before applying migration.');
css=css.replace(before,after);
fs.writeFileSync(path,css);
console.log('Reference grid intrinsic sizing corrected; muted text contrast strengthened.');
