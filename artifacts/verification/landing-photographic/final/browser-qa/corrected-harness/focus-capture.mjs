import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const analyzer=fileURLToPath(new URL('./contrast_pixels.py',import.meta.url));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const kind='essential_nontext_focus_outline';
const focusState=({control,region})=>{const r=region.getBoundingClientRect(),c=control.getBoundingClientRect(),s=getComputedStyle(control);return{region:{x:r.x,y:r.y,width:r.width,height:r.height},control:{x:c.x-r.x,y:c.y-r.y,width:c.width,height:c.height},dpr:devicePixelRatio,focused:document.activeElement===control,focusVisible:control.matches(':focus-visible'),outlineColor:s.outlineColor,outlineStyle:s.outlineStyle,outlineWidth:parseFloat(s.outlineWidth),outlineOffset:parseFloat(s.outlineOffset),boxShadow:s.boxShadow,scroll:{x:scrollX,y:scrollY}}};

/** Draft diagnostic only. Caller owns focus-visible state and the main execution GO. */
export async function actualFocusContrast(page,out,name,selector,regionSelector='.oda-landing-hero'){
 assert.ok(typeof name==='string'&&name.length&&!/[\\/]/.test(name)&&name!=='.'&&name!=='..','Name must be a single filename component');
 out=path.resolve(out);fs.mkdirSync(out,{recursive:true});
 const control=await page.locator(selector).elementHandle(),region=await page.locator(regionSelector).elementHandle();
 assert.ok(control&&region,'Focus control and capture region must exist');
 let originalStyle;
 try{
  await region.scrollIntoViewIfNeeded();
  const geometry=await page.evaluate(({control,region})=>{
   const c=getComputedStyle(control),box=control.getBoundingClientRect(),root=region.getBoundingClientRect();
   const rgba=value=>{const match=value.match(/^rgba?\((.*)\)$/);if(!match)throw new Error('Unsupported outline color space: '+value);const parts=match[1].replace(/[,/]/g,' ').trim().split(/\s+/);if(parts.length!==3&&parts.length!==4)throw new Error('Invalid computed outline color: '+value);const numbers=parts.map((p,i)=>p.endsWith('%')?parseFloat(p)*(i===3?0.01:2.55):Number(p));if(numbers.some(n=>!Number.isFinite(n)))throw new Error('Invalid computed outline color: '+value);return[numbers[0],numbers[1],numbers[2],numbers[3]??1]};
   const width=parseFloat(c.outlineWidth),offset=parseFloat(c.outlineOffset),expansion=Math.max(0,width+offset);
   const outer={x:box.x-expansion,y:box.y-expansion,width:box.width+2*expansion,height:box.height+2*expansion};
   const rect={x:outer.x-root.x,y:outer.y-root.y,width:outer.width,height:outer.height};
   let opacity=1;const opacityChain=[],ancestorClipCandidates=[];
   for(let ancestor=control;ancestor;ancestor=ancestor.parentElement){const s=getComputedStyle(ancestor);opacity*=Number(s.opacity);if(Number(s.opacity)!==1)opacityChain.push({element:ancestor.tagName.toLowerCase(),opacity:Number(s.opacity)});if(ancestor===control)continue;const r=ancestor.getBoundingClientRect(),clipX=s.overflowX!=='visible',clipY=s.overflowY!=='visible';if(clipX||clipY||s.clipPath!=='none'||s.maskImage!=='none')ancestorClipCandidates.push({element:ancestor.tagName.toLowerCase(),overflowX:s.overflowX,overflowY:s.overflowY,clipPath:s.clipPath,maskImage:s.maskImage,bounds:{x:r.x,y:r.y,width:r.width,height:r.height},possiblyClipped:(clipX&&(outer.x<r.x||outer.x+outer.width>r.right))||(clipY&&(outer.y<r.y||outer.y+outer.height>r.bottom))||s.clipPath!=='none'||s.maskImage!=='none'})}
   return{focused:document.activeElement===control,focusVisible:control.matches(':focus-visible'),originalStyle:control.getAttribute('style'),outlineStyle:c.outlineStyle,outlineColor:c.outlineColor,color:rgba(c.outlineColor),width,offset,expansion,opacity,opacityChain,boxShadow:c.boxShadow,dpr:devicePixelRatio,scroll:{x:scrollX,y:scrollY},control:{x:box.x-root.x,y:box.y-root.y,width:box.width,height:box.height},region:{x:root.x,y:root.y,width:root.width,height:root.height},requestedOutlineRect:rect,regionClipped:rect.x<0||rect.y<0||rect.x+rect.width>root.width||rect.y+rect.height>root.height,controlClipped:box.x<root.x||box.y<root.y||box.right>root.right||box.bottom>root.bottom,ancestorClipCandidates};
  },{control,region});
  originalStyle=geometry.originalStyle;
  assert.equal(geometry.focused,true,'Caller must focus this control');
  assert.equal(geometry.focusVisible,true,'Caller must establish :focus-visible');
  assert.ok(!['none','hidden','auto'].includes(geometry.outlineStyle)&&geometry.width>0&&Number.isFinite(geometry.offset),'A resolved visible CSS outline is required');
  const stable=(state,restored=false)=>{assert.deepEqual(state.region,geometry.region,'Capture region must stay fixed');assert.deepEqual(state.control,geometry.control,'Control geometry must stay fixed');assert.equal(state.dpr,geometry.dpr);assert.equal(state.focused,true);assert.equal(state.focusVisible,true);assert.equal(state.boxShadow,geometry.boxShadow,'Shadow must stay intact');assert.deepEqual(state.scroll,geometry.scroll,'Capture scroll must stay stable');if(restored){assert.equal(state.outlineColor,geometry.outlineColor);assert.equal(state.outlineStyle,geometry.outlineStyle);assert.equal(state.outlineWidth,geometry.width);assert.equal(state.outlineOffset,geometry.offset)}else assert.equal(state.outlineStyle,'none')};
  const cleanPng=path.join(out,name+'-focus-clean.png'),backgroundPng=path.join(out,name+'-focus-background.png');
  const documentClip={x:geometry.region.x+geometry.scroll.x,y:geometry.region.y+geometry.scroll.y,width:geometry.region.width,height:geometry.region.height};geometry.documentClip=documentClip;
  // Preserve animation/caret settings; do not suppress shadow, border, text, or background paint.
  await page.screenshot({path:cleanPng,fullPage:true,clip:documentClip,scale:'device',caret:'initial'});
  stable(await page.evaluate(focusState,{control,region}),true);
  try{
   await control.evaluate(element=>element.style.setProperty('outline','none','important'));
   stable(await page.evaluate(focusState,{control,region}));
   await page.screenshot({path:backgroundPng,fullPage:true,clip:documentClip,scale:'device',caret:'initial'});
   stable(await page.evaluate(focusState,{control,region}));
  }finally{
   await control.evaluate((element,style)=>{element.style.cssText=style??'';if(style===null)element.removeAttribute('style');else element.setAttribute('style',style)},originalStyle);
  }
  const observedAttribute=await control.getAttribute('style');
  if(originalStyle===null&&observedAttribute==='')await control.evaluate(element=>element.removeAttribute('style'));
  stable(await page.evaluate(focusState,{control,region}),true);
  const restored=await control.evaluate(element=>({attribute:element.getAttribute('style'),declarations:element.style.length}));
  const equivalentEmptyAttribute=originalStyle===null&&(restored.attribute===null||restored.attribute==='')&&restored.declarations===0;
  assert.ok(restored.attribute===originalStyle||equivalentEmptyAttribute,'Original inline declarations must be restored');
  geometry.styleRestoration={originalAttribute:originalStyle,observedBeforeNormalization:observedAttribute,observedAfterNormalization:restored.attribute,declarationCount:restored.declarations,equivalentEmptyAttribute,computedOutlineShadowGeometryRestored:true};
  const metadata={measurementKind:kind,isTextMeasurement:false,thresholdBasis:'3:1 essential UI focus mark; fontSize24/fontWeight400 are analyzer-schema compatibility values, not text typography.',outlineGeometry:geometry,regions:[{name:'focus-outline',cleanPng,backgroundPng,dpr:geometry.dpr,runs:[{selector,text:'[focus outline; not text]',measurementKind:kind,color:geometry.color,opacity:geometry.opacity,fontSize:24,fontWeight:400,rects:[geometry.requestedOutlineRect]}]}]};
  const input=path.join(out,name+'-focus-input.json'),output=path.join(out,name+'-focus-contrast.json');fs.writeFileSync(input,JSON.stringify(metadata,null,2)+'\n');
  fs.rmSync(output,{force:true}); // Never accept a stale report after analyzer failure.
  let analyzerExitCode=0;
  try{execFileSync('python',[analyzer,input,output],{stdio:'pipe'})}catch(error){if(error.status!==2||!fs.existsSync(output))throw error;analyzerExitCode=error.status}
  const analysis=JSON.parse(fs.readFileSync(output,'utf8'));
  // Qualify the reused analyzer's text/glyph names in the saved report itself.
  analysis.measurement_kind=kind;analysis.is_text_measurement=false;analysis.focus_threshold_basis=metadata.thresholdBasis;analysis.outline_geometry=geometry;analysis.actualOutlineMinRatio=analysis.regions[0]?.runs[0]?.actualGlyphMinRatio??null;
  analysis.pass_basis='Supplied actual changed-outline pixel samples at 3:1, with no analyzer errors, capture clipping, possible ancestor clipping, or nonunit opacity chain. This measures draft outline color contrast only; it does not establish all focus accessibility requirements.';
  analysis.method.focus_sample_semantics='Only the existing control outline was removed. Actual changed-glyph fields therefore refer to changed-outline samples, not text; conservative boxes also include unchanged control interior.';
  for(const run of analysis.regions.flatMap(item=>item.runs)){run.measurementKind=kind;run.isTextMeasurement=false;run.typographyFieldsAreThresholdCompatibilityOnly=true;run.actualOutlineMinRatio=run.actualGlyphMinRatio;run.thresholdBasis='3:1 essential UI mark'}
  analysis.limitations=analysis.limitations.filter(item=>!item.startsWith('The report applies only')).concat(['The reused text/glyph and large_text fields are analyzer-schema compatibility fields; this capture measures the focus outline, not text.','This report covers supplied draft outline-color samples only. It does not establish focus area/thickness, all keyboard behavior, text contrast, other controls or states, human listening, publication, or broad accessibility/quality compliance.']);
  if(observedAttribute!==originalStyle){analysis.warnings.push({code:'equivalent_empty_style_attribute',message:'Original absent inline style was observed as an empty attribute; normalized in isolated DOM and verified zero declarations plus restored computed outline, shadow, focus and geometry. See outline_geometry.styleRestoration.'});analysis.summary.warning_count=analysis.warnings.length;if(!analysis.errors.length)analysis.analysis_status='completed_with_warnings'}
  const issues=[];
  if(geometry.regionClipped||geometry.controlClipped)issues.push({code:'focus_capture_clipped',message:'The requested outline or control extends outside the captured region'});
  if(geometry.ancestorClipCandidates.some(item=>item.possiblyClipped))issues.push({code:'possible_ancestor_focus_clipping',message:'Ancestor clipping may truncate the outline; axis-aligned border-box checks do not model rounded clips or clip margins'});
  if(geometry.opacityChain.length)issues.push({code:'unsupported_focus_group_opacity',message:'Nonunit opacity in the control/ancestor chain requires layer modeling for reliable composited outline contrast'});
  if(issues.length){analysis.errors.push(...issues);analysis.summary.error_count=analysis.errors.length;analysis.analysis_status='completed_with_errors';analysis.pass=false;for(const region of analysis.regions){region.errors.push(...issues);region.status='inconclusive';region.pass=false;for(const run of region.runs){run.errors.push(...issues);run.status='inconclusive';run.pass=false}}analysis.summary.measured_run_count=0;analysis.summary.partial_run_count=0;analysis.summary.inconclusive_run_count=analysis.summary.run_count}
  fs.writeFileSync(output,JSON.stringify(analysis,null,2)+'\n');
  const pngs=[cleanPng,backgroundPng].map(file=>{const bytes=fs.readFileSync(file);return{file:path.basename(file),path:file,bytes:bytes.length,sha256:sha(bytes),diagnostic:true,measurementKind:kind}});
  return{input:path.basename(input),output:path.basename(output),paths:{input,output,cleanPng,backgroundPng},pngs,analysis,analyzerExitCode,measurementKind:kind,outline:{geometry,width:geometry.width,offset:geometry.offset}};
 }finally{
  // The only style mutation has its own finally above; handles do not change focus.
  await Promise.allSettled([control.dispose(),region.dispose()]);
 }
}
