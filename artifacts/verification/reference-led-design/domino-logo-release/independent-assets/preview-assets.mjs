import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { chromium } from '/workspace/oda-reference-redesign/node_modules/playwright/index.mjs';

const root = '/workspace/oda-reference-redesign';
const out = '/workspace/scratch/oda-reference-redesign/domino-logo/independent-assets';
const source = '84ecbf8776146b766a30964bf8e6487234dd1dd4';
const asset = relative => `data:image/png;base64,${fs.readFileSync(path.join(root,relative)).toString('base64')}`;
const normal = asset('public/brand/domino8/oda-app-domino8-v1-192.png');
const mask = asset('public/brand/domino8/oda-app-domino8-v1-maskable-192.png');
const mask512 = asset('public/brand/domino8/oda-app-domino8-v1-maskable-512.png');
const favicon = asset('public/brand/domino8/oda-favicon-domino8-v1-32.png');
const native = asset('ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png');
const splash = asset('ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732.png');
const screenshots = [];
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium' });
try {
  const page = await browser.newPage({deviceScaleFactor:1,serviceWorkers:'block',reducedMotion:'reduce'});
  const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',route=>route.abort());
  const baseStyle='<style>*{box-sizing:border-box}body{margin:0;background:#f7f2ea;color:#2d1717;font-family:Arial,sans-serif}h1{font-size:22px;margin:0 0 10px}p{font-size:13px;line-height:1.5;margin:8px 0 22px}section{margin:0 0 28px}.row{display:flex;gap:28px;align-items:flex-start;flex-wrap:wrap}.cell{display:flex;flex-direction:column;align-items:center;gap:8px;font-size:12px}.square{width:128px;height:128px}.circle{clip-path:circle(50% at 50% 50%)}.rounded{border-radius:22%}.safe{clip-path:circle(40% at 50% 50%)}.tiny{display:flex;gap:35px;align-items:flex-end;padding:16px;background:white}.dark{background:#142242;color:#fff;padding:18px}.canvas{background:#ddd;width:156px;height:156px;display:flex;align-items:center;justify-content:center}</style>';
  async function capture(file,html,width,height){
    await page.setViewportSize({width,height});
    await page.setContent(baseStyle+html);
    await page.evaluate(async()=>{await Promise.all([...document.images].map(i=>i.decode()))});
    const invalid=await page.evaluate(()=>[...document.images].filter(i=>!i.complete||i.naturalWidth===0).length);
    if(invalid)throw new Error('Image decode failed');
    const bytes=await page.screenshot({path:path.join(out,file),fullPage:true});
    screenshots.push({file,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),viewport:{width,height},synthetic:true});
  }
  const img=(src,cls='square')=>`<img src="${src}" class="${cls}" alt="Selected gold and ruby domino">`;
  const cell=(src,cls,label)=>`<div class="cell">${img(src,cls)}<span>${label}</span></div>`;
  await capture('web-pwa-mask-preview.png',`<main style="padding:30px"><h1>ODA selected domino — web/PWA asset QA</h1><p>Synthetic asset previews from committed PNGs. Platform masks below are approximations; safe circle uses the specified 40% radius.<br>Source ${source}</p><section><div class="row">${cell(normal,'square','192 PNG / square')}${cell(normal,'square rounded','Rounded display')}${cell(mask,'square circle','Maskable / circle')}${cell(mask,'square rounded','Maskable / rounded')}${cell(mask,'square safe','Only 40% safe circle')}</div></section><section class="row"><div class="cell">${img(mask512,'square')}<span>512 maskable at 128px</span></div><div class="cell"><img src="${mask512}" style="width:256px;height:256px" class="safe" alt="Maskable 512 safe circle"><span>512 maskable safe circle at 256px</span></div></section><p>The complete domino remains within the circular safe zone. Opaque square exports contain no baked outer rounded frame.</p></main>`,940,620);
  await capture('favicon-small-size-preview.png',`<main style="padding:30px"><h1>ODA favicon — actual CSS sizes</h1><p>Synthetic browser rendering of the committed 32×32 PNG at 16/24/32/48/64 pixels. No redraw or sharpened substitute.</p><section class="tiny">${[16,24,32,48,64].map(size=>`<div class="cell"><img src="${favicon}" style="width:${size}px;height:${size}px" alt="ODA domino favicon"><span>${size}px</span></div>`).join('')}</section><section class="tiny dark">${[16,24,32,48,64].map(size=>`<div class="cell"><img src="${favicon}" style="width:${size}px;height:${size}px" alt="ODA domino favicon"><span>${size}px</span></div>`).join('')}</section><p>At 16px the gold foreground is distinctive; fine metallic detail is naturally reduced.</p></main>`,700,420);
  await capture('native-icon-mask-preview.png',`<main style="padding:30px"><h1>ODA iOS icon — configured 1024 PNG</h1><p>Synthetic preview; rounded-square and circular masks approximate platform display.<br>This is asset configuration, not a physically installed or published app.</p><div class="row">${cell(native,'square','Full square')}${cell(native,'square rounded','Rounded-square approximation')}${cell(native,'square circle','Circle comparison')}</div><section style="margin-top:25px" class="row"><div class="cell"><img src="${native}" style="width:256px;height:256px" class="rounded" alt="ODA icon"><span>256px preview</span></div><div class="cell"><img src="${native}" style="width:60px;height:60px" class="rounded" alt="ODA icon"><span>60px preview</span></div></section></main>`,800,600);
  for(const [width,height] of [[390,844],[320,844]]){
    await capture(`native-splash-${width}.png`,`<img src="${splash}" style="display:block;width:100vw;height:100vh;object-fit:cover" alt="Configured ODA native splash preview">`,width,height);
  }
  if(errors.length)throw new Error(errors.join('\n'));
  fs.writeFileSync(path.join(out,'preview-receipt.json'),JSON.stringify({sourceCommit:source,workflow:'Normal installed Chromium, data-URL copies of committed PNGs and CSS mask/size previews; no asset editing; no network; no bypass flags.',deviceScaleFactor:1,synthetic:true,physicalInstallation:false,pageErrors:errors,screenshots},null,2)+'\n');
  console.log(JSON.stringify({sourceCommit:source,previews:screenshots.length,pageErrors:errors}));
}finally{await browser.close();}
