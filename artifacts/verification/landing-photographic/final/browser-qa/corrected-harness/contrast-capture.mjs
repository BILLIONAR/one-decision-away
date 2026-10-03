import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';

const sha=b=>createHash('sha256').update(b).digest('hex');
/** Diagnostic only: paired real browser renders expose the composed photo/scrim under HTML glyphs. */
export async function actualTextContrast(page,out,name,regions=[['nav','.oda-landing-nav'],['hero','.oda-landing-hero']]){
 const metadata={method:'Actual clean and temporarily text-transparent element PNGs; same image, scrim, controls and layout. No image recolor/redraw.',regions:[]};
 for(const [regionName,selector] of regions){
  const element=page.locator(selector);await element.scrollIntoViewIfNeeded();
  const geometry=await element.evaluate(root=>{
   const box=root.getBoundingClientRect(),runs=[],parents=new Set();
   const color=c=>{const n=c.match(/[\d.]+/g).map(Number);return[n[0],n[1],n[2],n[3]??1]};
   const style=e=>{const c=getComputedStyle(e);let opacity=1;for(let p=e;p;p=p.parentElement)opacity*=Number(getComputedStyle(p).opacity);return{color:color(c.color),opacity,fontSize:parseFloat(c.fontSize),fontWeight:parseInt(c.fontWeight)||400}};
   const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let text;
   while((text=walker.nextNode())){const parent=text.parentElement;if(!text.textContent.trim()||parent.namespaceURI!=='http://www.w3.org/1999/xhtml'||parent.closest('svg,[aria-hidden="true"],.sr-only,option'))continue;const c=getComputedStyle(parent);if(c.display==='none'||c.visibility!=='visible')continue;const rects=[];for(let i=0;i<text.length;i++){if(/\s/.test(text.textContent[i]))continue;const range=document.createRange();range.setStart(text,i);range.setEnd(text,i+1);for(const r of range.getClientRects())if(r.width>0&&r.height>0&&r.right>box.left&&r.left<box.right&&r.bottom>box.top&&r.top<box.bottom)rects.push({x:r.x-box.x,y:r.y-box.y,width:r.width,height:r.height})}if(!rects.length)continue;runs.push({selector:parent.tagName.toLowerCase()+'.'+parent.className,text:text.textContent.trim(),...style(parent),rects});parents.add(parent)}
   for(const select of root.querySelectorAll('select')){const r=select.getBoundingClientRect();if(!r.width||!r.height)continue;runs.push({selector:'select',text:select.selectedOptions[0]?.textContent||'',...style(select),rects:[{x:r.x-box.x,y:r.y-box.y,width:r.width,height:r.height}],nativeControl:true});parents.add(select);for(const option of select.options)parents.add(option)}
   window.__qaContrastParents=[...parents];return{runs,dpr:devicePixelRatio,cssSize:{width:box.width,height:box.height}};
  });
  const clean=name+'-'+regionName+'-clean.png',background=name+'-'+regionName+'-background.png';
  const documentClip=await element.evaluate(e=>{const r=e.getBoundingClientRect();return{x:r.x+scrollX,y:r.y+scrollY,width:r.width,height:r.height}});
  // Page full-document capture enables below-viewport painting even when the element
  // alone fits the viewport but its document position extends beyond it.
  await page.screenshot({path:out+'/'+clean,fullPage:true,clip:documentClip,animations:'disabled',scale:'device'});
  await page.evaluate(()=>{window.__qaContrastStyles=window.__qaContrastParents.map(e=>({element:e,style:e.getAttribute('style')}));for(const e of window.__qaContrastParents){e.style.setProperty('color','transparent','important');e.style.setProperty('-webkit-text-fill-color','transparent','important');e.style.setProperty('text-shadow','none','important')}});
  try{await page.screenshot({path:out+'/'+background,fullPage:true,clip:documentClip,animations:'disabled',scale:'device'})}finally{await page.evaluate(()=>{for(const x of window.__qaContrastStyles){if(x.style===null)x.element.removeAttribute('style');else x.element.setAttribute('style',x.style)}delete window.__qaContrastStyles;delete window.__qaContrastParents})}
  const after=await element.boundingBox();assert.ok(after);assert.equal(after.width,geometry.cssSize.width);assert.equal(after.height,geometry.cssSize.height,'Diagnostic did not change layout');
  metadata.regions.push({name:regionName,cleanPng:out+'/'+clean,backgroundPng:out+'/'+background,...geometry});
 }
 const input=out+'/'+name+'-contrast-input.json',output=out+'/'+name+'-contrast.json';fs.writeFileSync(input,JSON.stringify(metadata,null,2)+'\n');
 execFileSync('python',['/workspace/scratch/oda-landing-photographic/browser-qa/contrast_pixels.py',input,output],{stdio:'pipe'});
 const analysis=JSON.parse(fs.readFileSync(output));
 return{input:input.split('/').at(-1),output:output.split('/').at(-1),analysis,pngs:metadata.regions.flatMap(r=>[r.cleanPng,r.backgroundPng]).map(file=>{const b=fs.readFileSync(file);return{file:file.split('/').at(-1),bytes:b.length,sha256:sha(b),diagnostic:true}})};
}
