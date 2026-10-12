import{c as n}from"./atmosphere-xwXM16Sn.js";import{a as d}from"./profileEmail-Da6uhmu1.js";/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const s=[["path",{d:"M8 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h3",key:"1i73f7"}],["path",{d:"M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3",key:"saxlbk"}],["path",{d:"M12 20v2",key:"1lh1kg"}],["path",{d:"M12 14v2",key:"8jcxud"}],["path",{d:"M12 8v2",key:"1woqiv"}],["path",{d:"M12 2v2",key:"tus03m"}]],o=n("flip-horizontal",s);async function h(e){if(!e.isCurrent()||!await(e.explain??(()=>d("camera")))()||!e.isCurrent())return null;const r=await(e.getMedia??(a=>{var t,i;if(!((i=(t=globalThis.navigator)==null?void 0:t.mediaDevices)!=null&&i.getUserMedia))throw new Error("CAMERA_UNAVAILABLE");return navigator.mediaDevices.getUserMedia(a)}))({video:{facingMode:e.facing,width:{ideal:1280},height:{ideal:720}},audio:!1});return e.isCurrent()?r:(r.getTracks().forEach(a=>a.stop()),null)}export{o as F,h as r};
