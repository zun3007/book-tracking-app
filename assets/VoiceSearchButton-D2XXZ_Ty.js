import{c as o,r as p,j as n,m as u}from"./index-DpF_DXXf.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const d=o("MicOff",[["line",{x1:"2",x2:"22",y1:"2",y2:"22",key:"a6p6uj"}],["path",{d:"M18.89 13.23A7.12 7.12 0 0 0 19 12v-2",key:"80xlxr"}],["path",{d:"M5 10v2a7 7 0 0 0 12 5",key:"p2k8kg"}],["path",{d:"M15 9.34V5a3 3 0 0 0-5.68-1.33",key:"1gzdoj"}],["path",{d:"M9 9v3a3 3 0 0 0 5.12 2.12",key:"r2i35w"}],["line",{x1:"12",x2:"12",y1:"19",y2:"22",key:"x3vr5v"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x=o("Mic",[["path",{d:"M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z",key:"131961"}],["path",{d:"M19 10v2a7 7 0 0 1-14 0v-2",key:"1vc78b"}],["line",{x1:"12",x2:"12",y1:"19",y2:"22",key:"x3vr5v"}]]);function y({onSearch:a}){const[i,s]=p.useState(!1),r=()=>{if(!("webkitSpeechRecognition"in window)){alert("Your browser does not support voice recognition.");return}const c=window.webkitSpeechRecognition,e=new c;e.continuous=!1,e.interimResults=!1,e.lang="en-US",e.onstart=()=>s(!0),e.onend=()=>s(!1),e.onresult=l=>{let t=l.results[0][0].transcript;t.endsWith(".")&&(t=t.slice(0,-1)),a(t)},e.start()};return n.jsx(u.button,{whileHover:{scale:1.1},whileTap:{scale:.9},onClick:r,className:`p-2 rounded-full shadow-lg transition-colors ${i?"bg-red-500":"bg-blue-500"} text-white`,children:i?n.jsx(d,{size:24}):n.jsx(x,{size:24})})}export{y as V};
