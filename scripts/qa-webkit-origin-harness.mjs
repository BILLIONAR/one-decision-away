/** Own a disposable HTTPS preview child for actual app-origin transport-loss checks. */
import {spawn,execFileSync} from 'node:child_process';
import {mkdtempSync,readlinkSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const tls=mkdtempSync(join(tmpdir(),'oda-webkit-https-'));
let preview,closed;
try {
  const key=join(tls,'key.pem'),cert=join(tls,'cert.pem');
  execFileSync('openssl',['req','-x509','-newkey','rsa:2048','-nodes','-keyout',key,'-out',cert,'-days','2','-subj','/CN=localhost','-addext','subjectAltName=DNS:localhost,IP:127.0.0.1'],{stdio:'ignore'});
  preview=spawn(process.execPath,[
    'node_modules/vite/bin/vite.js','preview','--config','scripts/qa-webkit-https.config.mjs',
    '--outDir','/tmp/oda-webkit-project-build','--host','127.0.0.1','--port','4175','--strictPort',
  ],{cwd:process.cwd(),env:{...process.env,ODA_WEBKIT_PREVIEW_KEY:key,ODA_WEBKIT_PREVIEW_CERT:cert},stdio:['ignore','pipe','pipe']});
  closed=new Promise(resolve=>preview.once('exit',resolve));
  let started=false;
  await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error('Owned HTTPS preview did not start')),10000);
    preview.stdout.on('data',data=>{
      const value=String(data);process.stdout.write(value);
      if(!started && value.includes('https://127.0.0.1:4175/')){started=true;clearTimeout(timer);resolve();}
    });
    preview.stderr.on('data',data=>process.stderr.write(data));
    preview.once('error',error=>{clearTimeout(timer);reject(error);});
    preview.once('exit',code=>{if(!started){clearTimeout(timer);reject(new Error(`Owned preview exited ${code}`));}});
  });
  console.log('Owned preview identity',JSON.stringify({pid:preview.pid,cwd:readlinkSync(`/proc/${preview.pid}/cwd`),exe:readlinkSync(`/proc/${preview.pid}/exe`)}));
  process.env.ODA_WEBKIT_ORIGIN_PID=String(preview.pid);
  process.env.ODA_QA_URL='https://127.0.0.1:4175/one-decision-away/';
  await import('./qa-webkit-mobile.mjs');
} finally {
  if(preview && preview.exitCode===null && preview.signalCode===null)preview.kill('SIGTERM');
  if(closed)await closed;
  rmSync(tls,{recursive:true,force:true});
}
