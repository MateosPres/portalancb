var rb=Object.defineProperty,ib=Object.defineProperties;var sb=Object.getOwnPropertyDescriptors;var Rc=Object.getOwnPropertySymbols,ob=Object.getPrototypeOf,Hm=Object.prototype.hasOwnProperty,Qm=Object.prototype.propertyIsEnumerable,ab=Reflect.get;var Wm=(n,e,t)=>e in n?rb(n,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):n[e]=t,G=(n,e)=>{for(var t in e||(e={}))Hm.call(e,t)&&Wm(n,t,e[t]);if(Rc)for(var t of Rc(e))Qm.call(e,t)&&Wm(n,t,e[t]);return n},ce=(n,e)=>ib(n,sb(e));var vo=(n,e)=>{var t={};for(var r in n)Hm.call(n,r)&&e.indexOf(r)<0&&(t[r]=n[r]);if(n!=null&&Rc)for(var r of Rc(n))e.indexOf(r)<0&&Qm.call(n,r)&&(t[r]=n[r]);return t};var Sn=(n,e,t)=>ab(ob(n),t,e);var p=(n,e,t)=>new Promise((r,i)=>{var s=u=>{try{a(t.next(u))}catch(l){i(l)}},o=u=>{try{a(t.throw(u))}catch(l){i(l)}},a=u=>u.done?r(u.value):Promise.resolve(u.value).then(s,o);a((t=t.apply(n,e)).next())});import{o as Ms,R as Ed,d as gr}from"./vendor-R-QS5V7O.js";/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const cb=()=>{};var Jm={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $y=function(n){const e=[];let t=0;for(let r=0;r<n.length;r++){let i=n.charCodeAt(r);i<128?e[t++]=i:i<2048?(e[t++]=i>>6|192,e[t++]=i&63|128):(i&64512)===55296&&r+1<n.length&&(n.charCodeAt(r+1)&64512)===56320?(i=65536+((i&1023)<<10)+(n.charCodeAt(++r)&1023),e[t++]=i>>18|240,e[t++]=i>>12&63|128,e[t++]=i>>6&63|128,e[t++]=i&63|128):(e[t++]=i>>12|224,e[t++]=i>>6&63|128,e[t++]=i&63|128)}return e},ub=function(n){const e=[];let t=0,r=0;for(;t<n.length;){const i=n[t++];if(i<128)e[r++]=String.fromCharCode(i);else if(i>191&&i<224){const s=n[t++];e[r++]=String.fromCharCode((i&31)<<6|s&63)}else if(i>239&&i<365){const s=n[t++],o=n[t++],a=n[t++],u=((i&7)<<18|(s&63)<<12|(o&63)<<6|a&63)-65536;e[r++]=String.fromCharCode(55296+(u>>10)),e[r++]=String.fromCharCode(56320+(u&1023))}else{const s=n[t++],o=n[t++];e[r++]=String.fromCharCode((i&15)<<12|(s&63)<<6|o&63)}}return e.join("")},jy={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let i=0;i<n.length;i+=3){const s=n[i],o=i+1<n.length,a=o?n[i+1]:0,u=i+2<n.length,l=u?n[i+2]:0,h=s>>2,f=(s&3)<<4|a>>4;let g=(a&15)<<2|l>>6,w=l&63;u||(w=64,o||(g=64)),r.push(t[h],t[f],t[g],t[w])}return r.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray($y(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):ub(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let i=0;i<n.length;){const s=t[n.charAt(i++)],a=i<n.length?t[n.charAt(i)]:0;++i;const l=i<n.length?t[n.charAt(i)]:64;++i;const f=i<n.length?t[n.charAt(i)]:64;if(++i,s==null||a==null||l==null||f==null)throw new lb;const g=s<<2|a>>4;if(r.push(g),l!==64){const w=a<<4&240|l>>2;if(r.push(w),f!==64){const S=l<<6&192|f;r.push(S)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};class lb extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const hb=function(n){const e=$y(n);return jy.encodeByteArray(e,!0)},tu=function(n){return hb(n).replace(/\./g,"")},vd=function(n){try{return jy.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};function nu(n,e){if(!(e instanceof Object))return e;switch(e.constructor){case Date:const t=e;return new Date(t.getTime());case Object:n===void 0&&(n={});break;case Array:n=[];break;default:return e}for(const t in e)!e.hasOwnProperty(t)||!db(t)||(n[t]=nu(n[t],e[t]));return n}function db(n){return n!=="__proto__"}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ad(){if(typeof self!="undefined")return self;if(typeof window!="undefined")return window;if(typeof global!="undefined")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fb=()=>Ad().__FIREBASE_DEFAULTS__,pb=()=>{if(typeof process=="undefined"||typeof Jm=="undefined")return;const n=Jm.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},mb=()=>{if(typeof document=="undefined")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch(t){return}const e=n&&vd(n[1]);return e&&JSON.parse(e)},bd=()=>{try{return cb()||fb()||pb()||mb()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},Rd=()=>{var n;return(n=bd())==null?void 0:n.config},gb=n=>{var e;return(e=bd())==null?void 0:e[`_${n}`]};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zy{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,r)=>{t?this.reject(t):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,r))}}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ky(n,e){if(n.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},r=e||"demo-project",i=n.iat||0,s=n.sub||n.user_id;if(!s)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const o=G({iss:`https://securetoken.google.com/${r}`,aud:r,iat:i,exp:i+3600,auth_time:i,sub:s,user_id:s,firebase:{sign_in_provider:"custom",identities:{}}},n);return[tu(JSON.stringify(t)),tu(JSON.stringify(o)),""].join(".")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ve(){return typeof navigator!="undefined"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function _b(){return typeof window!="undefined"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(ve())}function Lu(){var e;const n=(e=bd())==null?void 0:e.forceEnvironment;if(n==="node")return!0;if(n==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch(t){return!1}}function yb(){return typeof window!="undefined"||Gy()}function Gy(){return typeof WorkerGlobalScope!="undefined"&&typeof self!="undefined"&&self instanceof WorkerGlobalScope}function wb(){return typeof navigator!="undefined"&&navigator.userAgent==="Cloudflare-Workers"}function Wy(){const n=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof n=="object"&&n.id!==void 0}function Sd(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function Hy(){const n=ve();return n.indexOf("MSIE ")>=0||n.indexOf("Trident/")>=0}function Qy(){return!Lu()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function Jy(){return!Lu()&&!!navigator.userAgent&&(navigator.userAgent.includes("Safari")||navigator.userAgent.includes("WebKit"))&&!navigator.userAgent.includes("Chrome")}function mi(){try{return typeof indexedDB=="object"}catch(n){return!1}}function Ib(){return new Promise((n,e)=>{try{let t=!0;const r="validate-browser-context-for-indexeddb-analytics-module",i=self.indexedDB.open(r);i.onsuccess=()=>{i.result.close(),t||self.indexedDB.deleteDatabase(r),n(!0)},i.onupgradeneeded=()=>{t=!1},i.onerror=()=>{var s;e(((s=i.error)==null?void 0:s.message)||"")}}catch(t){e(t)}})}function Tb(){return!(typeof navigator=="undefined"||!navigator.cookieEnabled)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Eb="FirebaseError";class Fe extends Error{constructor(e,t,r){super(t),this.code=e,this.customData=r,this.name=Eb,Object.setPrototypeOf(this,Fe.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,bn.prototype.create)}}class bn{constructor(e,t,r){this.service=e,this.serviceName=t,this.errors=r}create(e,...t){const r=t[0]||{},i=`${this.service}/${e}`,s=this.errors[e],o=s?vb(s,r):"Error",a=`${this.serviceName}: ${o} (${i}).`;return new Fe(i,a,r)}}function vb(n,e){try{let t=0,r="";for(;t<n.length;){const i=n.indexOf("{$",t);if(i===-1){r+=n.substring(t);break}const s=n.indexOf("}",i+2);if(s===-1){r+=n.substring(t);break}const o=n.substring(i+2,s),a=e[o];r+=n.substring(t,i)+(a!=null?String(a):`<${o}?>`),t=s+1}return r}catch(t){return n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ym(n,e){return Object.prototype.hasOwnProperty.call(n,e)}function Ab(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}function Tr(n,e){if(n===e)return!0;const t=Object.keys(n),r=Object.keys(e);for(const i of t){if(!r.includes(i))return!1;const s=n[i],o=e[i];if(Xm(s)&&Xm(o)){if(!Tr(s,o))return!1}else if(s!==o)return!1}for(const i of r)if(!t.includes(i))return!1;return!0}function Xm(n){return n!==null&&typeof n=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Fs(n){const e=[];for(const[t,r]of Object.entries(n))Array.isArray(r)?r.forEach(i=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(i))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function ts(n){const e={};return n.replace(/^\?/,"").split("&").forEach(r=>{if(r){const[i,s]=r.split("=");e[decodeURIComponent(i)]=decodeURIComponent(s)}}),e}function Oo(n){const e=n.indexOf("?");if(!e)return"";const t=n.indexOf("#",e);return n.substring(e,t>0?t:void 0)}function Yy(n,e){const t=new bb(n,e);return t.subscribe.bind(t)}class bb{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,r){let i;if(e===void 0&&t===void 0&&r===void 0)throw new Error("Missing Observer.");Rb(e,["next","error","complete"])?i=e:i={next:e,error:t,complete:r},i.next===void 0&&(i.next=ih),i.error===void 0&&(i.error=ih),i.complete===void 0&&(i.complete=ih);const s=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?i.error(this.finalError):i.complete()}catch(o){}}),this.observers.push(i),s}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{t(this.observers[e])}catch(r){typeof console!="undefined"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function Rb(n,e){if(typeof n!="object"||n===null)return!1;for(const t of e)if(t in n&&typeof n[t]=="function")return!0;return!1}function ih(){}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function z(n){return n&&n._delegate?n._delegate:n}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Kn(n){try{return(n.startsWith("http://")||n.startsWith("https://")?new URL(n).hostname:n).endsWith(".cloudworkstations.dev")}catch(e){return!1}}function Mu(n){return p(this,null,function*(){return(yield fetch(n,{credentials:"include"})).ok})}class Be{constructor(e,t,r){this.name=e,this.instanceFactory=t,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Hr="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Sb{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const r=new zy;if(this.instancesDeferred.set(t,r),this.isInitialized(t)||this.shouldAutoInitialize())try{const i=this.getOrInitializeService({instanceIdentifier:t});i&&r.resolve(i)}catch(i){}}return this.instancesDeferred.get(t).promise}getImmediate(e){var i;const t=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),r=(i=e==null?void 0:e.optional)!=null?i:!1;if(this.isInitialized(t)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:t})}catch(s){if(r)return null;throw s}else{if(r)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(Cb(e))try{this.getOrInitializeService({instanceIdentifier:Hr})}catch(t){}for(const[t,r]of this.instancesDeferred.entries()){const i=this.normalizeInstanceIdentifier(t);try{const s=this.getOrInitializeService({instanceIdentifier:i});r.resolve(s)}catch(s){}}}}clearInstance(e=Hr){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}delete(){return p(this,null,function*(){const e=Array.from(this.instances.values());yield Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])})}isComponentSet(){return this.component!=null}isInitialized(e=Hr){return this.instances.has(e)}getOptions(e=Hr){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const i=this.getOrInitializeService({instanceIdentifier:r,options:t});for(const[s,o]of this.instancesDeferred.entries()){const a=this.normalizeInstanceIdentifier(s);r===a&&o.resolve(i)}return i}onInit(e,t){var o;const r=this.normalizeInstanceIdentifier(t),i=(o=this.onInitCallbacks.get(r))!=null?o:new Set;i.add(e),this.onInitCallbacks.set(r,i);const s=this.instances.get(r);return s&&e(s,r),()=>{i.delete(e)}}invokeOnInitCallbacks(e,t){const r=this.onInitCallbacks.get(t);if(r)for(const i of r)try{i(e,t)}catch(s){}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:Pb(e),options:t}),this.instances.set(e,r),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch(i){}return r||null}normalizeInstanceIdentifier(e=Hr){return this.component?this.component.multipleInstances?e:Hr:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function Pb(n){return n===Hr?void 0:n}function Cb(n){return n.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xy{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new Sb(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Pd=[];var ie;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(ie||(ie={}));const Zy={debug:ie.DEBUG,verbose:ie.VERBOSE,info:ie.INFO,warn:ie.WARN,error:ie.ERROR,silent:ie.SILENT},kb=ie.INFO,Nb={[ie.DEBUG]:"log",[ie.VERBOSE]:"log",[ie.INFO]:"info",[ie.WARN]:"warn",[ie.ERROR]:"error"},Vb=(n,e,...t)=>{if(e<n.logLevel)return;const r=new Date().toISOString(),i=Nb[e];if(i)console[i](`[${r}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class Fu{constructor(e){this.name=e,this._logLevel=kb,this._logHandler=Vb,this._userLogHandler=null,Pd.push(this)}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in ie))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?Zy[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,ie.DEBUG,...e),this._logHandler(this,ie.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,ie.VERBOSE,...e),this._logHandler(this,ie.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,ie.INFO,...e),this._logHandler(this,ie.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,ie.WARN,...e),this._logHandler(this,ie.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,ie.ERROR,...e),this._logHandler(this,ie.ERROR,...e)}}function Db(n){Pd.forEach(e=>{e.setLogLevel(n)})}function xb(n,e){for(const t of Pd){let r=null;e&&e.level&&(r=Zy[e.level]),n===null?t.userLogHandler=null:t.userLogHandler=(i,s,...o)=>{const a=o.map(u=>{if(u==null)return null;if(typeof u=="string")return u;if(typeof u=="number"||typeof u=="boolean")return u.toString();if(u instanceof Error)return u.message;try{return JSON.stringify(u)}catch(l){return null}}).filter(u=>u).join(" ");s>=(r!=null?r:i.logLevel)&&n({level:ie[s].toLowerCase(),message:a,args:o,type:i.name})}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ob{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(Lb(t)){const r=t.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(t=>t).join(" ")}}function Lb(n){const e=n.getComponent();return(e==null?void 0:e.type)==="VERSION"}const ru="@firebase/app",Nh="0.16.1";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ln=new Fu("@firebase/app"),Mb="@firebase/app-compat",Fb="@firebase/analytics-compat",Ub="@firebase/analytics",Bb="@firebase/app-check-compat",qb="@firebase/app-check",$b="@firebase/auth",jb="@firebase/auth-compat",zb="@firebase/database",Kb="@firebase/data-connect",Gb="@firebase/database-compat",Wb="@firebase/functions",Hb="@firebase/functions-compat",Qb="@firebase/installations",Jb="@firebase/installations-compat",Yb="@firebase/messaging",Xb="@firebase/messaging-compat",Zb="@firebase/performance",eR="@firebase/performance-compat",tR="@firebase/remote-config",nR="@firebase/remote-config-compat",rR="@firebase/storage",iR="@firebase/storage-compat",sR="@firebase/firestore",oR="@firebase/ai",aR="@firebase/firestore-compat",cR="firebase",uR="12.18.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Er="[DEFAULT]",lR={[ru]:"fire-core",[Mb]:"fire-core-compat",[Ub]:"fire-analytics",[Fb]:"fire-analytics-compat",[qb]:"fire-app-check",[Bb]:"fire-app-check-compat",[$b]:"fire-auth",[jb]:"fire-auth-compat",[zb]:"fire-rtdb",[Kb]:"fire-data-connect",[Gb]:"fire-rtdb-compat",[Wb]:"fire-fn",[Hb]:"fire-fn-compat",[Qb]:"fire-iid",[Jb]:"fire-iid-compat",[Yb]:"fire-fcm",[Xb]:"fire-fcm-compat",[Zb]:"fire-perf",[eR]:"fire-perf-compat",[tR]:"fire-rc",[nR]:"fire-rc-compat",[rR]:"fire-gcs",[iR]:"fire-gcs-compat",[sR]:"fire-fst",[aR]:"fire-fst-compat",[oR]:"fire-vertex","fire-js":"fire-js",[cR]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vr=new Map,ls=new Map,hs=new Map;function ua(n,e){try{n.container.addComponent(e)}catch(t){Ln.debug(`Component ${e.name} failed to register with FirebaseApp ${n.name}`,t)}}function ew(n,e){n.container.addOrOverwriteComponent(e)}function It(n){const e=n.name;if(hs.has(e))return Ln.debug(`There were multiple attempts to register component ${e}.`),!1;hs.set(e,n);for(const t of vr.values())ua(t,n);for(const t of ls.values())ua(t,n);return!0}function Uu(n,e){const t=n.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),n.container.getProvider(e)}function hR(n,e,t=Er){Uu(n,e).clearInstance(t)}function Cd(n){return n.options!==void 0}function tw(n){return Cd(n)?!1:"authIdToken"in n||"appCheckToken"in n||"releaseOnDeref"in n||"automaticDataCollectionEnabled"in n}function _e(n){return n==null?!1:n.settings!==void 0}function dR(){hs.clear()}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fR={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different {$mismatchedParam}. Existing: '{$oldValue}'. New: '{$newValue}'.","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},At=new bn("app","Firebase",fR);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let nw=class{constructor(e,t,r){this._isDeleted=!1,this._options=G({},e),this._config=G({},t),this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new Be("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw At.create("app-deleted",{appName:this._name})}};/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Zm(n,e){const t=vd(n.split(".")[1]);if(t===null){console.error(`FirebaseServerApp ${e} is invalid: second part could not be parsed.`);return}if(JSON.parse(t).exp===void 0){console.error(`FirebaseServerApp ${e} is invalid: expiration claim could not be parsed`);return}const i=JSON.parse(t).exp*1e3,s=new Date().getTime();i-s<=0&&console.error(`FirebaseServerApp ${e} is invalid: the token has expired.`)}class pR extends nw{constructor(e,t,r,i){const s=t.automaticDataCollectionEnabled!==void 0?t.automaticDataCollectionEnabled:!0,o={name:r,automaticDataCollectionEnabled:s};if(e.apiKey!==void 0)super(e,o,i);else{const a=e;super(a.options,o,i)}this._serverConfig=G({automaticDataCollectionEnabled:s},t),this._serverConfig.authIdToken&&Zm(this._serverConfig.authIdToken,"authIdToken"),this._serverConfig.appCheckToken&&Zm(this._serverConfig.appCheckToken,"appCheckToken"),this._finalizationRegistry=null,typeof FinalizationRegistry!="undefined"&&(this._finalizationRegistry=new FinalizationRegistry(()=>{this.automaticCleanup()})),this._refCount=0,this.incRefCount(this._serverConfig.releaseOnDeref),this._serverConfig.releaseOnDeref=void 0,t.releaseOnDeref=void 0,je(ru,Nh,"serverapp")}toJSON(){}get refCount(){return this._refCount}incRefCount(e){this.isDeleted||(this._refCount++,e!==void 0&&this._finalizationRegistry!==null&&this._finalizationRegistry.register(e,this))}decRefCount(){return this.isDeleted?0:--this._refCount}automaticCleanup(){Nd(this)}get settings(){return this.checkDestroyed(),this._serverConfig}checkDestroyed(){if(this.isDeleted)throw At.create("server-app-deleted")}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Gn=uR;function kd(n,e={}){let t=n;typeof e!="object"&&(e={name:e});const r=G({name:Er,automaticDataCollectionEnabled:!0},e),i=r.name;if(typeof i!="string"||!i)throw At.create("bad-app-name",{appName:String(i)});if(t||(t=Rd()),!t)throw At.create("no-options");const s=vr.get(i);if(s)if(Tr(t,s.options)){if(Tr(r,s.config))return s;throw At.create("duplicate-app",{appName:i,mismatchedParam:"config",oldValue:JSON.stringify(s.config),newValue:JSON.stringify(r)})}else throw At.create("duplicate-app",{appName:i,mismatchedParam:"options",oldValue:JSON.stringify(s.options),newValue:JSON.stringify(t)});const o=new Xy(i);for(const u of hs.values())o.addComponent(u);const a=new nw(t,r,o);return vr.set(i,a),a}function mR(n,e={}){if(yb()&&!Gy())throw At.create("invalid-server-app-environment");let t,r=e||{};if(n&&(Cd(n)?t=n.options:tw(n)?r=n:t=n),r.automaticDataCollectionEnabled===void 0&&(r.automaticDataCollectionEnabled=!0),t||(t=Rd()),!t)throw At.create("no-options");const i=G(G({},r),t);i.releaseOnDeref!==void 0&&delete i.releaseOnDeref;const s=h=>[...h].reduce((f,g)=>Math.imul(31,f)+g.charCodeAt(0)|0,0);if(r.releaseOnDeref!==void 0&&typeof FinalizationRegistry=="undefined")throw At.create("finalization-registry-not-supported",{});const o=""+s(JSON.stringify(i)),a=ls.get(o);if(a)return a.incRefCount(r.releaseOnDeref),a;const u=new Xy(o);for(const h of hs.values())u.addComponent(h);const l=new pR(t,r,o,u);return ls.set(o,l),l}function gR(n=Er){const e=vr.get(n);if(!e&&n===Er&&Rd())return kd();if(!e)throw At.create("no-app",{appName:n});return e}function _R(){return Array.from(vr.values())}function Nd(n){return p(this,null,function*(){let e=!1;const t=n.name;vr.has(t)?(e=!0,vr.delete(t)):ls.has(t)&&n.decRefCount()<=0&&(ls.delete(t),e=!0),e&&(yield Promise.all(n.container.getProviders().map(r=>r.delete())),n.isDeleted=!0)})}function je(n,e,t){var o;let r=(o=lR[n])!=null?o:n;t&&(r+=`-${t}`);const i=r.match(/\s|\//),s=e.match(/\s|\//);if(i||s){const a=[`Unable to register library "${r}" with version "${e}":`];i&&a.push(`library name "${r}" contains illegal characters (whitespace or "/")`),i&&s&&a.push("and"),s&&a.push(`version name "${e}" contains illegal characters (whitespace or "/")`),Ln.warn(a.join(" "));return}It(new Be(`${r}-version`,()=>({library:r,version:e}),"VERSION"))}function rw(n,e){if(n!==null&&typeof n!="function")throw At.create("invalid-log-argument");xb(n,e)}function iw(n){Db(n)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const yR="firebase-heartbeat-database",wR=1,la="firebase-heartbeat-store";let sh=null;function sw(){return sh||(sh=Ms(yR,wR,{upgrade:(n,e)=>{switch(e){case 0:try{n.createObjectStore(la)}catch(t){console.warn(t)}}}}).catch(n=>{throw At.create("idb-open",{originalErrorMessage:n.message})})),sh}function IR(n){return p(this,null,function*(){try{const t=(yield sw()).transaction(la),r=yield t.objectStore(la).get(ow(n));return yield t.done,r}catch(e){if(e instanceof Fe)Ln.warn(e.message);else{const t=At.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});Ln.warn(t.message)}}})}function eg(n,e){return p(this,null,function*(){try{const r=(yield sw()).transaction(la,"readwrite");yield r.objectStore(la).put(e,ow(n)),yield r.done}catch(t){if(t instanceof Fe)Ln.warn(t.message);else{const r=At.create("idb-set",{originalErrorMessage:t==null?void 0:t.message});Ln.warn(r.message)}}})}function ow(n){return`${n.name}!${n.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const TR=1024,ER=30;class vR{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new bR(t),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}triggerHeartbeat(){return p(this,null,function*(){var e,t;try{const i=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),s=tg();if(((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null&&(this._heartbeatsCache=yield this._heartbeatsCachePromise,((t=this._heartbeatsCache)==null?void 0:t.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===s||this._heartbeatsCache.heartbeats.some(o=>o.date===s))return;if(this._heartbeatsCache.heartbeats.push({date:s,agent:i}),this._heartbeatsCache.heartbeats.length>ER){const o=RR(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(o,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(r){Ln.warn(r)}})}getHeartbeatsHeader(){return p(this,null,function*(){var e;try{if(this._heartbeatsCache===null&&(yield this._heartbeatsCachePromise),((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const t=tg(),{heartbeatsToSend:r,unsentEntries:i}=AR(this._heartbeatsCache.heartbeats),s=tu(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=t,i.length>0?(this._heartbeatsCache.heartbeats=i,yield this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),s}catch(t){return Ln.warn(t),""}})}}function tg(){return new Date().toISOString().substring(0,10)}function AR(n,e=TR){const t=[];let r=n.slice();for(const i of n){const s=t.find(o=>o.agent===i.agent);if(s){if(s.dates.push(i.date),ng(t)>e){s.dates.pop();break}}else if(t.push({agent:i.agent,dates:[i.date]}),ng(t)>e){t.pop();break}r=r.slice(1)}return{heartbeatsToSend:t,unsentEntries:r}}class bR{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}runIndexedDBEnvironmentCheck(){return p(this,null,function*(){return mi()?Ib().then(()=>!0).catch(()=>!1):!1})}read(){return p(this,null,function*(){if(yield this._canUseIndexedDBPromise){const t=yield IR(this.app);return t!=null&&t.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}})}overwrite(e){return p(this,null,function*(){var r;if(yield this._canUseIndexedDBPromise){const i=yield this.read();return eg(this.app,{lastSentHeartbeatDate:(r=e.lastSentHeartbeatDate)!=null?r:i.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return})}add(e){return p(this,null,function*(){var r;if(yield this._canUseIndexedDBPromise){const i=yield this.read();return eg(this.app,{lastSentHeartbeatDate:(r=e.lastSentHeartbeatDate)!=null?r:i.lastSentHeartbeatDate,heartbeats:[...i.heartbeats,...e.heartbeats]})}else return})}}function ng(n){return tu(JSON.stringify({version:2,heartbeats:n})).length}function RR(n){if(n.length===0)return-1;let e=0,t=n[0].date;for(let r=1;r<n.length;r++)n[r].date<t&&(t=n[r].date,e=r);return e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function SR(n){It(new Be("platform-logger",e=>new Ob(e),"PRIVATE")),It(new Be("heartbeat",e=>new vR(e),"PRIVATE")),je(ru,Nh,n),je(ru,Nh,"esm2020"),je("fire-js","")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */SR("");const PR=Object.freeze(Object.defineProperty({__proto__:null,FirebaseError:Fe,SDK_VERSION:Gn,_DEFAULT_ENTRY_NAME:Er,_addComponent:ua,_addOrOverwriteComponent:ew,_apps:vr,_clearComponents:dR,_components:hs,_getProvider:Uu,_isFirebaseApp:Cd,_isFirebaseServerApp:_e,_isFirebaseServerAppSettings:tw,_registerComponent:It,_removeServiceInstance:hR,_serverApps:ls,deleteApp:Nd,getApp:gR,getApps:_R,initializeApp:kd,initializeServerApp:mR,onLog:rw,registerVersion:je,setLogLevel:iw},Symbol.toStringTag,{value:"Module"}));/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class CR{constructor(e,t){this._delegate=e,this.firebase=t,ua(e,new Be("app-compat",()=>this,"PUBLIC")),this.container=e.container}get automaticDataCollectionEnabled(){return this._delegate.automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this._delegate.automaticDataCollectionEnabled=e}get name(){return this._delegate.name}get options(){return this._delegate.options}delete(){return new Promise(e=>{this._delegate.checkDestroyed(),e()}).then(()=>(this.firebase.INTERNAL.removeApp(this.name),Nd(this._delegate)))}_getService(e,t=Er){var i;this._delegate.checkDestroyed();const r=this._delegate.container.getProvider(e);return!r.isInitialized()&&((i=r.getComponent())==null?void 0:i.instantiationMode)==="EXPLICIT"&&r.initialize(),r.getImmediate({identifier:t})}_removeServiceInstance(e,t=Er){this._delegate.container.getProvider(e).clearInstance(t)}_addComponent(e){ua(this._delegate,e)}_addOrOverwriteComponent(e){ew(this._delegate,e)}toJSON(){return{name:this.name,automaticDataCollectionEnabled:this.automaticDataCollectionEnabled,options:this.options}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const kR={"no-app":"No Firebase App '{$appName}' has been created - call Firebase App.initializeApp()","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance."},rg=new bn("app-compat","Firebase",kR);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function NR(n){const e={},t={__esModule:!0,initializeApp:s,app:i,registerVersion:je,setLogLevel:iw,onLog:rw,apps:null,SDK_VERSION:Gn,INTERNAL:{registerComponent:a,removeApp:r,useAsService:u,modularAPIs:PR}};t.default=t,Object.defineProperty(t,"apps",{get:o});function r(l){delete e[l]}function i(l){if(l=l||Er,!Ym(e,l))throw rg.create("no-app",{appName:l});return e[l]}i.App=n;function s(l,h={}){const f=kd(l,h);if(Ym(e,f.name))return e[f.name];const g=new n(f,t);return e[f.name]=g,g}function o(){return Object.keys(e).map(l=>e[l])}function a(l){const h=l.name,f=h.replace("-compat","");if(It(l)&&l.type==="PUBLIC"){const g=(w=i())=>{if(typeof w[f]!="function")throw rg.create("invalid-app-argument",{appName:h});return w[f]()};l.serviceProps!==void 0&&nu(g,l.serviceProps),t[f]=g,n.prototype[f]=function(...w){return this._getService.bind(this,h).apply(this,l.multipleInstances?w:[])}}return l.type==="PUBLIC"?t[f]:null}function u(l,h){return h==="serverAuth"?null:h}return t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function aw(){const n=NR(CR);n.INTERNAL=ce(G({},n.INTERNAL),{createFirebaseNamespace:aw,extendNamespace:e,createSubscribe:Yy,ErrorFactory:bn,deepExtend:nu});function e(t){nu(n,t)}return n}const VR=aw();/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ig=new Fu("@firebase/app-compat"),DR="@firebase/app-compat",xR="0.5.17";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function OR(n){je(DR,xR,n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */try{const n=Ad();if(n.firebase!==void 0){ig.warn(`
      Warning: Firebase is already defined in the global scope. Please make sure
      Firebase library is only loaded once.
    `);const e=n.firebase.SDK_VERSION;e&&e.indexOf("LITE")>=0&&ig.warn(`
        Warning: You are trying to load Firebase while using Firebase Performance standalone script.
        You should load Firebase Performance with this instance of Firebase to avoid loading duplicate code.
        `)}}catch(n){}const Rn=VR;OR();var LR="firebase",MR="12.18.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Rn.registerVersion(LR,MR,"app-compat");const Ao={FACEBOOK:"facebook.com",GITHUB:"github.com",GOOGLE:"google.com",PASSWORD:"password",TWITTER:"twitter.com"},qi={EMAIL_SIGNIN:"EMAIL_SIGNIN",PASSWORD_RESET:"PASSWORD_RESET",RECOVER_EMAIL:"RECOVER_EMAIL",REVERT_SECOND_FACTOR_ADDITION:"REVERT_SECOND_FACTOR_ADDITION",VERIFY_AND_CHANGE_EMAIL:"VERIFY_AND_CHANGE_EMAIL",VERIFY_EMAIL:"VERIFY_EMAIL"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function FR(){return{"admin-restricted-operation":"This operation is restricted to administrators only.","argument-error":"","app-not-authorized":"This app, identified by the domain where it's hosted, is not authorized to use Firebase Authentication with the provided API key. Review your key configuration in the Google API console.","app-not-installed":"The requested mobile application corresponding to the identifier (Android package name or iOS bundle ID) provided is not installed on this device.","captcha-check-failed":"The reCAPTCHA response token provided is either invalid, expired, already used or the domain associated with it does not match the list of whitelisted domains.","code-expired":"The SMS code has expired. Please re-send the verification code to try again.","cordova-not-ready":"Cordova framework is not ready.","cors-unsupported":"This browser is not supported.","credential-already-in-use":"This credential is already associated with a different user account.","custom-token-mismatch":"The custom token corresponds to a different audience.","requires-recent-login":"This operation is sensitive and requires recent authentication. Log in again before retrying this request.","dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK.","dynamic-link-not-activated":"Please activate Dynamic Links in the Firebase Console and agree to the terms and conditions.","email-change-needs-verification":"Multi-factor users must always have a verified email.","email-already-in-use":"The email address is already in use by another account.","emulator-config-failed":'Auth instance has already been used to make a network call. Auth can no longer be configured to use the emulator. Try calling "connectAuthEmulator()" sooner.',"expired-action-code":"The action code has expired.","cancelled-popup-request":"This operation has been cancelled due to another conflicting popup being opened.","internal-error":"An internal AuthError has occurred.","invalid-app-credential":"The phone verification request contains an invalid application verifier. The reCAPTCHA token response is either invalid or expired.","invalid-app-id":"The mobile app identifier is not registered for the current project.","invalid-user-token":"This user's credential isn't valid for this project. This can happen if the user's token has been tampered with, or if the user isn't for the project associated with this API key.","invalid-auth-event":"An internal AuthError has occurred.","invalid-verification-code":"The SMS verification code used to create the phone auth credential is invalid. Please resend the verification code sms and be sure to use the verification code provided by the user.","invalid-continue-uri":"The continue URL provided in the request is invalid.","invalid-cordova-configuration":"The following Cordova plugins must be installed to enable OAuth sign-in: cordova-plugin-buildinfo, cordova-universal-links-plugin, cordova-plugin-browsertab, cordova-plugin-inappbrowser and cordova-plugin-customurlscheme.","invalid-custom-token":"The custom token format is incorrect. Please check the documentation.","invalid-dynamic-link-domain":"The provided dynamic link domain is not configured or authorized for the current project.","invalid-email":"The email address is badly formatted.","invalid-emulator-scheme":"Emulator URL must start with a valid scheme (http:// or https://).","invalid-api-key":"Your API key is invalid, please check you have copied it correctly.","invalid-cert-hash":"The SHA-1 certificate hash provided is invalid.","invalid-credential":"The supplied auth credential is incorrect, malformed or has expired.","invalid-message-payload":"The email template corresponding to this action contains invalid characters in its message. Please fix by going to the Auth email templates section in the Firebase Console.","invalid-multi-factor-session":"The request does not contain a valid proof of first factor successful sign-in.","invalid-oauth-provider":"EmailAuthProvider is not supported for this operation. This operation only supports OAuth providers.","invalid-oauth-client-id":"The OAuth client ID provided is either invalid or does not match the specified API key.","unauthorized-domain":"This domain is not authorized for OAuth operations for your Firebase project. Edit the list of authorized domains from the Firebase console.","invalid-action-code":"The action code is invalid. This can happen if the code is malformed, expired, or has already been used.","wrong-password":"The password is invalid or the user does not have a password.","invalid-persistence-type":"The specified persistence type is invalid. It can only be local, session or none.","invalid-phone-number":"The format of the phone number provided is incorrect. Please enter the phone number in a format that can be parsed into E.164 format. E.164 phone numbers are written in the format [+][country code][subscriber number including area code].","invalid-provider-id":"The specified provider ID is invalid.","invalid-recipient-email":"The email corresponding to this action failed to send as the provided recipient email address is invalid.","invalid-sender":"The email template corresponding to this action contains an invalid sender email or name. Please fix by going to the Auth email templates section in the Firebase Console.","invalid-verification-id":"The verification ID used to create the phone auth credential is invalid.","invalid-tenant-id":"The Auth instance's tenant ID is invalid.","login-blocked":"Login blocked by user-provided method: {$originalMessage}","missing-android-pkg-name":"An Android Package Name must be provided if the Android App is required to be installed.","auth-domain-config-required":"Be sure to include authDomain when calling firebase.initializeApp(), by following the instructions in the Firebase console.","missing-app-credential":"The phone verification request is missing an application verifier assertion. A reCAPTCHA response token needs to be provided.","missing-verification-code":"The phone auth credential was created with an empty SMS verification code.","missing-continue-uri":"A continue URL must be provided in the request.","missing-iframe-start":"An internal AuthError has occurred.","missing-ios-bundle-id":"An iOS Bundle ID must be provided if an App Store ID is provided.","missing-or-invalid-nonce":"The request does not contain a valid nonce. This can occur if the SHA-256 hash of the provided raw nonce does not match the hashed nonce in the ID token payload.","missing-password":"A non-empty password must be provided","missing-multi-factor-info":"No second factor identifier is provided.","missing-multi-factor-session":"The request is missing proof of first factor successful sign-in.","missing-phone-number":"To send verification codes, provide a phone number for the recipient.","missing-verification-id":"The phone auth credential was created with an empty verification ID.","app-deleted":"This instance of FirebaseApp has been deleted.","multi-factor-info-not-found":"The user does not have a second factor matching the identifier provided.","multi-factor-auth-required":"Proof of ownership of a second factor is required to complete sign-in.","account-exists-with-different-credential":"An account already exists with the same email address but different sign-in credentials. Sign in using a provider associated with this email address.","network-request-failed":"A network AuthError (such as timeout, interrupted connection or unreachable host) has occurred.","no-auth-event":"An internal AuthError has occurred.","no-such-provider":"User was not linked to an account with the given provider.","null-user":"A null user object was provided as the argument for an operation which requires a non-null user object.","operation-not-allowed":"The given sign-in provider is disabled for this Firebase project. Enable it in the Firebase console, under the sign-in method tab of the Auth section.","operation-not-supported-in-this-environment":'This operation is not supported in the environment this application is running on. "location.protocol" must be http, https or chrome-extension and web storage must be enabled.',"popup-blocked":"Unable to establish a connection with the popup. It may have been blocked by the browser.","popup-closed-by-user":"The popup has been closed by the user before finalizing the operation.","provider-already-linked":"User can only be linked to one identity for the given provider.","quota-exceeded":"The project's quota for this operation has been exceeded.","redirect-cancelled-by-user":"The redirect operation has been cancelled by the user before finalizing.","redirect-operation-pending":"A redirect sign-in operation is already pending.","rejected-credential":"The request contains malformed or mismatching credentials.","second-factor-already-in-use":"The second factor is already enrolled on this account.","maximum-second-factor-count-exceeded":"The maximum allowed number of second factors on a user has been exceeded.","tenant-id-mismatch":"The provided tenant ID does not match the Auth instance's tenant ID",timeout:"The operation has timed out.","user-token-expired":"The user's credential is no longer valid. The user must sign in again.","too-many-requests":"We have blocked all requests from this device due to unusual activity. Try again later.","unauthorized-continue-uri":"The domain of the continue URL is not whitelisted.  Please whitelist the domain in the Firebase console.","unsupported-first-factor":"Enrolling a second factor or signing in with a multi-factor account requires sign-in with a supported first factor.","unsupported-persistence-type":"The current environment does not support the specified persistence type.","unsupported-tenant-operation":"This operation is not supported in a multi-tenant context.","unverified-email":"The operation requires a verified email.","user-cancelled":"The user did not grant your application the permissions it requested.","user-not-found":"There is no user record corresponding to this identifier. The user may have been deleted.","user-disabled":"The user account has been disabled by an administrator.","user-mismatch":"The supplied credentials do not correspond to the previously signed in user.","user-signed-out":"","weak-password":"The password must be 6 characters long or more.","web-storage-unsupported":"This browser is not supported or 3rd party cookies and data may be disabled.","already-initialized":"initializeAuth() has already been called with different options. To avoid this error, call initializeAuth() with the same options as when it was originally called, or call getAuth() to return the already initialized instance.","missing-recaptcha-token":"The reCAPTCHA token is missing when sending request to the backend.","invalid-recaptcha-token":"The reCAPTCHA token is invalid when sending request to the backend.","invalid-recaptcha-action":"The reCAPTCHA action is invalid when sending request to the backend.","recaptcha-not-enabled":"reCAPTCHA Enterprise integration is not enabled for this project.","missing-client-type":"The reCAPTCHA client type is missing when sending request to the backend.","missing-recaptcha-version":"The reCAPTCHA version is missing when sending request to the backend.","invalid-req-type":"Invalid request parameters.","invalid-recaptcha-version":"The reCAPTCHA version is invalid when sending request to the backend.","unsupported-password-policy-schema-version":"The password policy received from the backend uses a schema version that is not supported by this version of the Firebase SDK.","password-does-not-meet-requirements":"The password does not meet the requirements.","invalid-hosting-link-domain":"The provided Hosting link domain is not configured in Firebase Hosting or is not owned by the current project. This cannot be a default Hosting domain (`web.app` or `firebaseapp.com`)."}}function cw(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const UR=FR,BR=cw,uw=new bn("auth","Firebase",cw());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const iu=new Fu("@firebase/auth");function lw(n,...e){iu.logLevel<=ie.WARN&&iu.warn(`Auth (${Gn}): ${n}`,...e)}function Bc(n,...e){iu.logLevel<=ie.ERROR&&iu.error(`Auth (${Gn}): ${n}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function et(n,...e){throw Dd(n,...e)}function ze(n,...e){return Dd(n,...e)}function Vd(n,e,t){const r=ce(G({},BR()),{[e]:t});return new bn("auth","Firebase",r).create(e,{appName:n.name})}function Ye(n){return Vd(n,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function Us(n,e,t){const r=t;if(!(e instanceof r))throw r.name!==e.constructor.name&&et(n,"argument-error"),Vd(n,"argument-error",`Type of ${e.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`)}function Dd(n,...e){if(typeof n!="string"){const t=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=n.name),n._errorFactory.create(t,...r)}return uw.create(n,...e)}function M(n,e,...t){if(!n)throw Dd(e,...t)}function ln(n){const e="INTERNAL ASSERTION FAILED: "+n;throw Bc(e),new Error(e)}function Zt(n,e){n||ln(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ha(){var n;return typeof self!="undefined"&&((n=self.location)==null?void 0:n.href)||""}function xd(){return sg()==="http:"||sg()==="https:"}function sg(){var n;return typeof self!="undefined"&&((n=self.location)==null?void 0:n.protocol)||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qR(){return typeof navigator!="undefined"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(xd()||Wy()||"connection"in navigator)?navigator.onLine:!0}function $R(){if(typeof navigator=="undefined")return null;const n=navigator;return n.languages&&n.languages[0]||n.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class La{constructor(e,t){this.shortDelay=e,this.longDelay=t,Zt(t>e,"Short delay should be less than long delay!"),this.isMobile=_b()||Sd()}get(){return qR()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Od(n,e){Zt(n.emulator,"Emulator should always be set here");const{url:t}=n.emulator;return e?`${t}${e.startsWith("/")?e.slice(1):e}`:t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hw{static initialize(e,t,r){this.fetchImpl=e,t&&(this.headersImpl=t),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self!="undefined"&&"fetch"in self)return self.fetch;if(typeof globalThis!="undefined"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch!="undefined")return fetch;ln("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self!="undefined"&&"Headers"in self)return self.Headers;if(typeof globalThis!="undefined"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers!="undefined")return Headers;ln("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self!="undefined"&&"Response"in self)return self.Response;if(typeof globalThis!="undefined"&&globalThis.Response)return globalThis.Response;if(typeof Response!="undefined")return Response;ln("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const jR={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zR=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],KR=new La(3e4,6e4);function Ce(n,e){return n.tenantId&&!e.tenantId?ce(G({},e),{tenantId:n.tenantId}):e}function ke(s,o,a,u){return p(this,arguments,function*(n,e,t,r,i={}){return dw(n,i,()=>p(this,null,function*(){let l={},h={};r&&(e==="GET"?h=r:l={body:JSON.stringify(r)});const f=Fs(ce(G({},h),{key:n.config.apiKey})).slice(1),g=yield n._getAdditionalHeaders();g["Content-Type"]="application/json",n.languageCode&&(g["X-Firebase-Locale"]=n.languageCode);const w=G({method:e,headers:g},l);return wb()||(w.referrerPolicy="strict-origin-when-cross-origin"),n.emulatorConfig&&Kn(n.emulatorConfig.host)&&(w.credentials="include"),hw.fetch()(yield fw(n,n.config.apiHost,t,f),w)}))})}function dw(n,e,t){return p(this,null,function*(){n._canInitEmulator=!1;const r=G(G({},jR),e);try{const i=new WR(n),s=yield Promise.race([t(),i.promise]);i.clearNetworkTimeout();const o=yield s.json();if("needConfirmation"in o)throw Lo(n,"account-exists-with-different-credential",o);if(s.ok&&!("errorMessage"in o))return o;{const a=s.ok?o.errorMessage:o.error.message,[u,l]=a.split(" : ");if(u==="FEDERATED_USER_ID_ALREADY_LINKED")throw Lo(n,"credential-already-in-use",o);if(u==="EMAIL_EXISTS")throw Lo(n,"email-already-in-use",o);if(u==="USER_DISABLED")throw Lo(n,"user-disabled",o);const h=r[u]||u.toLowerCase().replace(/[_\s]+/g,"-");if(l)throw Vd(n,h,l);et(n,h)}}catch(i){if(i instanceof Fe)throw i;et(n,"network-request-failed",{message:String(i)})}})}function Wn(s,o,a,u){return p(this,arguments,function*(n,e,t,r,i={}){const l=yield ke(n,e,t,r,i);return"mfaPendingCredential"in l&&et(n,"multi-factor-auth-required",{_serverResponse:l}),l})}function fw(n,e,t,r){return p(this,null,function*(){const i=`${e}${t}?${r}`,s=n,o=s.config.emulator?Od(n.config,i):`${n.config.apiScheme}://${i}`;return zR.includes(t)&&(yield s._persistenceManagerAvailable,s._getPersistenceType()==="COOKIE")?s._getPersistence()._getFinalTarget(o).toString():o})}function GR(n){switch(n){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}class WR{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((t,r)=>{this.timer=setTimeout(()=>r(ze(this.auth,"network-request-failed")),KR.get())})}}function Lo(n,e,t){const r={appName:n.name};t.email&&(r.email=t.email),t.phoneNumber&&(r.phoneNumber=t.phoneNumber);const i=ze(n,e,r);return i.customData._tokenResponse=t,i}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function og(n){return n!==void 0&&n.getResponse!==void 0}function ag(n){return n!==void 0&&n.enterprise!==void 0}class pw{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(const t of this.recaptchaEnforcementState)if(t.provider&&t.provider===e)return GR(t.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}isAnyProviderEnabled(){return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")||this.isProviderEnabled("PHONE_PROVIDER")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function HR(n){return p(this,null,function*(){return(yield ke(n,"GET","/v1/recaptchaParams")).recaptchaSiteKey||""})}function mw(n,e){return p(this,null,function*(){return ke(n,"GET","/v2/recaptchaConfig",Ce(n,e))})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function QR(n,e){return p(this,null,function*(){return ke(n,"POST","/v1/accounts:delete",e)})}function JR(n,e){return p(this,null,function*(){return ke(n,"POST","/v1/accounts:update",e)})}function su(n,e){return p(this,null,function*(){return ke(n,"POST","/v1/accounts:lookup",e)})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $o(n){if(n)try{const e=new Date(Number(n));if(!isNaN(e.getTime()))return e.toUTCString()}catch(e){}}function YR(n,e=!1){return p(this,null,function*(){const t=z(n),r=yield t.getIdToken(e),i=Bu(r);M(i&&i.exp&&i.auth_time&&i.iat,t.auth,"internal-error");const s=typeof i.firebase=="object"?i.firebase:void 0,o=s==null?void 0:s.sign_in_provider;return{claims:i,token:r,authTime:$o(oh(i.auth_time)),issuedAtTime:$o(oh(i.iat)),expirationTime:$o(oh(i.exp)),signInProvider:o||null,signInSecondFactor:(s==null?void 0:s.sign_in_second_factor)||null}})}function oh(n){return Number(n)*1e3}function Bu(n){const[e,t,r]=n.split(".");if(e===void 0||t===void 0||r===void 0)return Bc("JWT malformed, contained fewer than 3 sections"),null;try{const i=vd(t);return i?JSON.parse(i):(Bc("Failed to decode base64 JWT payload"),null)}catch(i){return Bc("Caught error parsing JWT payload as JSON",i==null?void 0:i.toString()),null}}function cg(n){const e=Bu(n);return M(e,"internal-error"),M(typeof e.exp!="undefined","internal-error"),M(typeof e.iat!="undefined","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Mn(n,e,t=!1){return p(this,null,function*(){if(t)return e;try{return yield e}catch(r){throw r instanceof Fe&&XR(r)&&n.auth.currentUser===n&&(yield n.auth.signOut()),r}})}function XR({code:n}){return n==="auth/user-disabled"||n==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ZR{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){var t;if(e){const r=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),r}else{this.errorBackoff=3e4;const i=((t=this.user.stsTokenManager.expirationTime)!=null?t:0)-Date.now()-3e5;return Math.max(0,i)}}schedule(e=!1){if(!this.isRunning)return;const t=this.getInterval(e);this.timerId=setTimeout(()=>p(this,null,function*(){yield this.iteration()}),t)}iteration(){return p(this,null,function*(){try{yield this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vh{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=$o(this.lastLoginAt),this.creationTime=$o(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function da(n){return p(this,null,function*(){var f;const e=n.auth,t=yield n.getIdToken(),r=yield Mn(n,su(e,{idToken:t}));M(r==null?void 0:r.users.length,e,"internal-error");const i=r.users[0];n._notifyReloadListener(i);const s=(f=i.providerUserInfo)!=null&&f.length?gw(i.providerUserInfo):[],o=tS(n.providerData,s),a=n.isAnonymous,u=!(n.email&&i.passwordHash)&&!(o!=null&&o.length),l=a?u:!1,h={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:o,metadata:new Vh(i.createdAt,i.lastLoginAt),isAnonymous:l};Object.assign(n,h)})}function eS(n){return p(this,null,function*(){const e=z(n);yield da(e),yield e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)})}function tS(n,e){return[...n.filter(r=>!e.some(i=>i.providerId===r.providerId)),...e]}function gw(n){return n.map(r=>{var i=r,{providerId:e}=i,t=vo(i,["providerId"]);return{providerId:e,uid:t.rawId||"",displayName:t.displayName||null,email:t.email||null,phoneNumber:t.phoneNumber||null,photoURL:t.photoUrl||null}})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function nS(n,e){return p(this,null,function*(){const t=yield dw(n,{},()=>p(this,null,function*(){const r=Fs({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:i,apiKey:s}=n.config,o=yield fw(n,i,"/v1/token",`key=${s}`),a=yield n._getAdditionalHeaders();a["Content-Type"]="application/x-www-form-urlencoded";const u={method:"POST",headers:a,body:r};return n.emulatorConfig&&Kn(n.emulatorConfig.host)&&(u.credentials="include"),hw.fetch()(o,u)}));return{accessToken:t.access_token,expiresIn:t.expires_in,refreshToken:t.refresh_token}})}function rS(n,e){return p(this,null,function*(){return ke(n,"POST","/v2/accounts:revokeToken",Ce(n,e))})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ns{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){M(e.idToken,"internal-error"),M(typeof e.idToken!="undefined","internal-error"),M(typeof e.refreshToken!="undefined","internal-error");const t="expiresIn"in e&&typeof e.expiresIn!="undefined"?Number(e.expiresIn):cg(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){M(e.length!==0,"internal-error");const t=cg(e);this.updateTokensAndExpiration(e,null,t)}getToken(e,t=!1){return p(this,null,function*(){return!t&&this.accessToken&&!this.isExpired?this.accessToken:(M(this.refreshToken,e,"user-token-expired"),this.refreshToken?(yield this.refresh(e,this.refreshToken),this.accessToken):null)})}clearRefreshToken(){this.refreshToken=null}refresh(e,t){return p(this,null,function*(){const{accessToken:r,refreshToken:i,expiresIn:s}=yield nS(e,t);this.updateTokensAndExpiration(r,i,Number(s))})}updateTokensAndExpiration(e,t,r){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,t){const{refreshToken:r,accessToken:i,expirationTime:s}=t,o=new ns;return r&&(M(typeof r=="string","internal-error",{appName:e}),o.refreshToken=r),i&&(M(typeof i=="string","internal-error",{appName:e}),o.accessToken=i),s&&(M(typeof s=="number","internal-error",{appName:e}),o.expirationTime=s),o}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new ns,this.toJSON())}_performRefresh(){return ln("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function or(n,e){M(typeof n=="string"||typeof n=="undefined","internal-error",{appName:e})}class Ht{constructor(s){var o=s,{uid:e,auth:t,stsTokenManager:r}=o,i=vo(o,["uid","auth","stsTokenManager"]);this.providerId="firebase",this.proactiveRefresh=new ZR(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=t,this.stsTokenManager=r,this.accessToken=r.accessToken,this.displayName=i.displayName||null,this.email=i.email||null,this.emailVerified=i.emailVerified||!1,this.phoneNumber=i.phoneNumber||null,this.photoURL=i.photoURL||null,this.isAnonymous=i.isAnonymous||!1,this.tenantId=i.tenantId||null,this.providerData=i.providerData?[...i.providerData]:[],this.metadata=new Vh(i.createdAt||void 0,i.lastLoginAt||void 0)}getIdToken(e){return p(this,null,function*(){const t=yield Mn(this,this.stsTokenManager.getToken(this.auth,e));return M(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,yield this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t})}getIdTokenResult(e){return YR(this,e)}reload(){return eS(this)}_assign(e){this!==e&&(M(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(t=>G({},t)),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new Ht(ce(G({},this),{auth:e,stsTokenManager:this.stsTokenManager._clone()}));return t.metadata._copy(this.metadata),t}_onReload(e){M(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}_updateTokensIfNecessary(e,t=!1){return p(this,null,function*(){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),t&&(yield da(this)),yield this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)})}delete(){return p(this,null,function*(){if(_e(this.auth.app))return Promise.reject(Ye(this.auth));const e=yield this.getIdToken();return yield Mn(this,QR(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()})}toJSON(){return ce(G({uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>G({},e)),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId},this.metadata.toJSON()),{apiKey:this.auth.config.apiKey,appName:this.auth.name})}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){var Q,K,X,ee,ne,E,y,T;const r=(Q=t.displayName)!=null?Q:void 0,i=(K=t.email)!=null?K:void 0,s=(X=t.phoneNumber)!=null?X:void 0,o=(ee=t.photoURL)!=null?ee:void 0,a=(ne=t.tenantId)!=null?ne:void 0,u=(E=t._redirectEventId)!=null?E:void 0,l=(y=t.createdAt)!=null?y:void 0,h=(T=t.lastLoginAt)!=null?T:void 0,{uid:f,emailVerified:g,isAnonymous:w,providerData:S,stsTokenManager:D}=t;M(f&&D,e,"internal-error");const x=ns.fromJSON(this.name,D);M(typeof f=="string",e,"internal-error"),or(r,e.name),or(i,e.name),M(typeof g=="boolean",e,"internal-error"),M(typeof w=="boolean",e,"internal-error"),or(s,e.name),or(o,e.name),or(a,e.name),or(u,e.name),or(l,e.name),or(h,e.name);const W=new Ht({uid:f,auth:e,email:i,emailVerified:g,displayName:r,isAnonymous:w,photoURL:o,phoneNumber:s,tenantId:a,stsTokenManager:x,createdAt:l,lastLoginAt:h});return S&&Array.isArray(S)&&(W.providerData=S.map(b=>G({},b))),u&&(W._redirectEventId=u),W}static _fromIdTokenResponse(e,t,r=!1){return p(this,null,function*(){const i=new ns;i.updateFromServerResponse(t);const s=new Ht({uid:t.localId,auth:e,stsTokenManager:i,isAnonymous:r});return yield da(s),s})}static _fromGetAccountInfoResponse(e,t,r){return p(this,null,function*(){const i=t.users[0];M(i.localId!==void 0,"internal-error");const s=i.providerUserInfo!==void 0?gw(i.providerUserInfo):[],o=!(i.email&&i.passwordHash)&&!(s!=null&&s.length),a=new ns;a.updateFromIdToken(r);const u=new Ht({uid:i.localId,auth:e,stsTokenManager:a,isAnonymous:o}),l={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:s,metadata:new Vh(i.createdAt,i.lastLoginAt),isAnonymous:!(i.email&&i.passwordHash)&&!(s!=null&&s.length)};return Object.assign(u,l),u})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ug=new Map;function Ot(n){Zt(n instanceof Function,"Expected a class definition");let e=ug.get(n);return e?(Zt(e instanceof n,"Instance stored in cache mismatched with class"),e):(e=new n,ug.set(n,e),e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _w{constructor(){this.type="NONE",this.storage={}}_isAvailable(){return p(this,null,function*(){return!0})}_set(e,t){return p(this,null,function*(){this.storage[e]=t})}_get(e){return p(this,null,function*(){const t=this.storage[e];return t===void 0?null:t})}_remove(e){return p(this,null,function*(){delete this.storage[e]})}_addListener(e,t){}_removeListener(e,t){}}_w.type="NONE";const ds=_w;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ui(n,e,t){return`firebase:${n}:${e}:${t}`}class rs{constructor(e,t,r){this.persistence=e,this.auth=t,this.userKey=r;const{config:i,name:s}=this.auth;this.fullUserKey=ui(this.userKey,i.apiKey,s),this.fullPersistenceKey=ui("persistence",i.apiKey,s),this.boundEventHandler=t._onStorageEvent.bind(t),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}getCurrentUser(){return p(this,null,function*(){const e=yield this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const t=yield su(this.auth,{idToken:e}).catch(()=>{});return t?Ht._fromGetAccountInfoResponse(this.auth,t,e):null}return Ht._fromJSON(this.auth,e)})}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}setPersistence(e){return p(this,null,function*(){if(this.persistence===e)return;const t=yield this.getCurrentUser();if(yield this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)})}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static create(e,t,r="authUser"){return p(this,null,function*(){if(!t.length)return new rs(Ot(ds),e,r);const i=(yield Promise.all(t.map(l=>p(this,null,function*(){if(yield l._isAvailable())return l})))).filter(l=>l);let s=i[0]||Ot(ds);const o=ui(r,e.config.apiKey,e.name);let a=null;for(const l of t)try{const h=yield l._get(o);if(h){let f;if(typeof h=="string"){const g=yield su(e,{idToken:h}).catch(()=>{});if(!g)break;f=yield Ht._fromGetAccountInfoResponse(e,g,h)}else f=Ht._fromJSON(e,h);l!==s&&(a=f),s=l;break}}catch(h){}const u=i.filter(l=>l._shouldAllowMigration);return!s._shouldAllowMigration||!u.length?new rs(s,e,r):(s=u[0],a&&(yield s._set(o,a.toJSON())),yield Promise.all(t.map(l=>p(this,null,function*(){if(l!==s)try{yield l._remove(o)}catch(h){}}))),new rs(s,e,r))})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function lg(n){const e=n.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(Tw(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(yw(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(Ew(e))return"Blackberry";if(vw(e))return"Webos";if(ww(e))return"Safari";if((e.includes("chrome/")||Iw(e))&&!e.includes("edge/"))return"Chrome";if(Ma(e))return"Android";{const t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=n.match(t);if((r==null?void 0:r.length)===2)return r[1]}return"Other"}function yw(n=ve()){return/firefox\//i.test(n)}function ww(n=ve()){const e=n.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function Iw(n=ve()){return/crios\//i.test(n)}function Tw(n=ve()){return/iemobile/i.test(n)}function Ma(n=ve()){return/android/i.test(n)}function Ew(n=ve()){return/blackberry/i.test(n)}function vw(n=ve()){return/webos/i.test(n)}function Fa(n=ve()){return/iphone|ipad|ipod/i.test(n)||/macintosh/i.test(n)&&/mobile/i.test(n)}function iS(n=ve()){return/(iPad|iPhone|iPod).*OS 7_\d/i.test(n)||/(iPad|iPhone|iPod).*OS 8_\d/i.test(n)}function sS(n=ve()){var e;return Fa(n)&&!!((e=window.navigator)!=null&&e.standalone)}function oS(){return Hy()&&document.documentMode===10}function Aw(n=ve()){return Fa(n)||Ma(n)||vw(n)||Ew(n)||/windows phone/i.test(n)||Tw(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function bw(n,e=[]){let t;switch(n){case"Browser":t=lg(ve());break;case"Worker":t=`${lg(ve())}-${n}`;break;default:t=n}const r=e.length?e.join(","):"FirebaseCore-web";return`${t}/JsCore/${Gn}/${r}`}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class aS{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){const r=s=>new Promise((o,a)=>{try{const u=e(s);o(u)}catch(u){a(u)}});r.onAbort=t,this.queue.push(r);const i=this.queue.length-1;return()=>{this.queue[i]=()=>Promise.resolve()}}runMiddleware(e){return p(this,null,function*(){if(this.auth.currentUser===e)return;const t=[];try{for(const r of this.queue)yield r(e),r.onAbort&&t.push(r.onAbort)}catch(r){t.reverse();for(const i of t)try{i()}catch(s){}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r==null?void 0:r.message})}})}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function cS(t){return p(this,arguments,function*(n,e={}){return ke(n,"GET","/v2/passwordPolicy",Ce(n,e))})}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const uS=6;class lS{constructor(e){var r,i,s,o;const t=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=(r=t.minPasswordLength)!=null?r:uS,t.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=t.maxPasswordLength),t.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=t.containsLowercaseCharacter),t.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=t.containsUppercaseCharacter),t.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=t.containsNumericCharacter),t.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=t.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=(s=(i=e.allowedNonAlphanumericCharacters)==null?void 0:i.join(""))!=null?s:"",this.forceUpgradeOnSignin=(o=e.forceUpgradeOnSignin)!=null?o:!1,this.schemaVersion=e.schemaVersion}validatePassword(e){var r,i,s,o,a,u;const t={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,t),this.validatePasswordCharacterOptions(e,t),t.isValid&&(t.isValid=(r=t.meetsMinPasswordLength)!=null?r:!0),t.isValid&&(t.isValid=(i=t.meetsMaxPasswordLength)!=null?i:!0),t.isValid&&(t.isValid=(s=t.containsLowercaseLetter)!=null?s:!0),t.isValid&&(t.isValid=(o=t.containsUppercaseLetter)!=null?o:!0),t.isValid&&(t.isValid=(a=t.containsNumericCharacter)!=null?a:!0),t.isValid&&(t.isValid=(u=t.containsNonAlphanumericCharacter)!=null?u:!0),t}validatePasswordLengthOptions(e,t){const r=this.customStrengthOptions.minPasswordLength,i=this.customStrengthOptions.maxPasswordLength;r&&(t.meetsMinPasswordLength=e.length>=r),i&&(t.meetsMaxPasswordLength=e.length<=i)}validatePasswordCharacterOptions(e,t){this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);let r;for(let i=0;i<e.length;i++)r=e.charAt(i),this.updatePasswordCharacterOptionsStatuses(t,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,t,r,i,s){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=i)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=s))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hS{constructor(e,t,r,i){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=r,this.config=i,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new hg(this),this.idTokenSubscription=new hg(this),this.beforeStateQueue=new aS(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=uw,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=i.sdkClientVersion,this._persistenceManagerAvailable=new Promise(s=>this._resolvePersistenceManagerAvailable=s)}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=Ot(t)),this._initializationPromise=this.queue(()=>p(this,null,function*(){var r,i,s;if(!this._deleted&&(this.persistenceManager=yield rs.create(this,e),(r=this._resolvePersistenceManagerAvailable)==null||r.call(this),!this._deleted)){if((i=this._popupRedirectResolver)!=null&&i._shouldInitProactively)try{yield this._popupRedirectResolver._initialize(this)}catch(o){}yield this.initializeCurrentUser(t),this.lastNotifiedUid=((s=this.currentUser)==null?void 0:s.uid)||null,!this._deleted&&(this._isInitialized=!0)}})),this._initializationPromise}_onStorageEvent(){return p(this,null,function*(){if(this._deleted)return;const e=yield this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),yield this.currentUser.getIdToken();return}yield this._updateCurrentUser(e,!0)}})}initializeCurrentUserFromIdToken(e){return p(this,null,function*(){try{const t=yield su(this,{idToken:e}),r=yield Ht._fromGetAccountInfoResponse(this,t,e);yield this.directlySetCurrentUser(r)}catch(t){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",t),yield this.directlySetCurrentUser(null)}})}initializeCurrentUser(e){return p(this,null,function*(){var s;if(_e(this.app)){const o=this.app.settings.authIdToken;return o?new Promise(a=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(o).then(a,a))}):this.directlySetCurrentUser(null)}const t=yield this.assertedPersistence.getCurrentUser();let r=t,i=!1;if(e&&this.config.authDomain){yield this.getOrInitRedirectPersistenceManager();const o=(s=this.redirectUser)==null?void 0:s._redirectEventId,a=r==null?void 0:r._redirectEventId,u=yield this.tryRedirectSignIn(e);(!o||o===a)&&(u!=null&&u.user)&&(r=u.user,i=!0)}if(!r)return this.directlySetCurrentUser(null);if(!r._redirectEventId){if(i)try{yield this.beforeStateQueue.runMiddleware(r)}catch(o){r=t,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(o))}return r?this.reloadAndSetCurrentUserOrClear(r):this.directlySetCurrentUser(null)}return M(this._popupRedirectResolver,this,"argument-error"),yield this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===r._redirectEventId?this.directlySetCurrentUser(r):this.reloadAndSetCurrentUserOrClear(r)})}tryRedirectSignIn(e){return p(this,null,function*(){let t=null;try{t=yield this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch(r){yield this._setRedirectUser(null)}return t})}reloadAndSetCurrentUserOrClear(e){return p(this,null,function*(){try{yield da(e)}catch(t){if((t==null?void 0:t.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)})}useDeviceLanguage(){this.languageCode=$R()}_delete(){return p(this,null,function*(){this._deleted=!0})}updateCurrentUser(e){return p(this,null,function*(){if(_e(this.app))return Promise.reject(Ye(this));const t=e?z(e):null;return t&&M(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))})}_updateCurrentUser(e,t=!1){return p(this,null,function*(){if(!this._deleted)return e&&M(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||(yield this.beforeStateQueue.runMiddleware(e)),this.queue(()=>p(this,null,function*(){yield this.directlySetCurrentUser(e),this.notifyAuthListeners()}))})}signOut(){return p(this,null,function*(){return _e(this.app)?Promise.reject(Ye(this)):(yield this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&(yield this._setRedirectUser(null)),this._updateCurrentUser(null,!0))})}setPersistence(e){return _e(this.app)?Promise.reject(Ye(this)):this.queue(()=>p(this,null,function*(){yield this.assertedPersistence.setPersistence(Ot(e))}))}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}validatePassword(e){return p(this,null,function*(){this._getPasswordPolicyInternal()||(yield this._updatePasswordPolicy());const t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)})}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}_updatePasswordPolicy(){return p(this,null,function*(){const e=yield cS(this),t=new lS(e);this.tenantId===null?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t})}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new bn("auth","Firebase",e())}onAuthStateChanged(e,t,r){return this.registerStateListener(this.authStateSubscription,e,t,r)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,r){return this.registerStateListener(this.idTokenSubscription,e,t,r)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},t)}})}revokeAccessToken(e){return p(this,null,function*(){if(this.currentUser){const t=yield this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:t};this.tenantId!=null&&(r.tenantId=this.tenantId),yield rS(this,r)}})}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)==null?void 0:e.toJSON()}}_setRedirectUser(e,t){return p(this,null,function*(){const r=yield this.getOrInitRedirectPersistenceManager(t);return e===null?r.removeCurrentUser():r.setCurrentUser(e)})}getOrInitRedirectPersistenceManager(e){return p(this,null,function*(){if(!this.redirectPersistenceManager){const t=e&&Ot(e)||this._popupRedirectResolver;M(t,this,"argument-error"),this.redirectPersistenceManager=yield rs.create(this,[Ot(t._redirectPersistence)],"redirectUser"),this.redirectUser=yield this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager})}_redirectUserForId(e){return p(this,null,function*(){var t,r;return this._isInitialized&&(yield this.queue(()=>p(this,null,function*(){}))),((t=this._currentUser)==null?void 0:t._redirectEventId)===e?this._currentUser:((r=this.redirectUser)==null?void 0:r._redirectEventId)===e?this.redirectUser:null})}_persistUserIfCurrent(e){return p(this,null,function*(){if(e===this.currentUser)return this.queue(()=>p(this,null,function*(){return this.directlySetCurrentUser(e)}))})}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var t,r;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const e=(r=(t=this.currentUser)==null?void 0:t.uid)!=null?r:null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,r,i){if(this._deleted)return()=>{};const s=typeof t=="function"?t:t.next.bind(t);let o=!1;const a=this._isInitialized?Promise.resolve():this._initializationPromise;if(M(a,this,"internal-error"),a.then(()=>{o||s(this.currentUser)}),typeof t=="function"){const u=e.addObserver(t,r,i);return()=>{o=!0,u()}}else{const u=e.addObserver(t);return()=>{o=!0,u()}}}directlySetCurrentUser(e){return p(this,null,function*(){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?yield this.assertedPersistence.setCurrentUser(e):yield this.assertedPersistence.removeCurrentUser()})}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return M(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=bw(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}_getAdditionalHeaders(){return p(this,null,function*(){var i;const e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);const t=yield(i=this.heartbeatServiceProvider.getImmediate({optional:!0}))==null?void 0:i.getHeartbeatsHeader();t&&(e["X-Firebase-Client"]=t);const r=yield this._getAppCheckToken();return r&&(e["X-Firebase-AppCheck"]=r),e})}_getAppCheckToken(){return p(this,null,function*(){var t;if(_e(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=yield(t=this.appCheckServiceProvider.getImmediate({optional:!0}))==null?void 0:t.getToken();return e!=null&&e.error&&lw(`Error while retrieving App Check token: ${e.error}`),e==null?void 0:e.token})}}function Ae(n){return z(n)}class hg{constructor(e){this.auth=e,this.observer=null,this.addObserver=Yy(t=>this.observer=t)}get next(){return M(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Ua={loadJS(){return p(this,null,function*(){throw new Error("Unable to load external scripts")})},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function dS(n){Ua=n}function Ld(n){return Ua.loadJS(n)}function fS(){return Ua.recaptchaV2Script}function pS(){return Ua.recaptchaEnterpriseScript}function mS(){return Ua.gapiScript}function Rw(n){return`__${n}${Math.floor(Math.random()*1e6)}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const gS=500,_S=6e4,Sc=1e12;class yS{constructor(e){this.auth=e,this.counter=Sc,this._widgets=new Map}render(e,t){const r=this.counter;return this._widgets.set(r,new TS(e,this.auth.name,t||{})),this.counter++,r}reset(e){var r;const t=e||Sc;(r=this._widgets.get(t))==null||r.delete(),this._widgets.delete(t)}getResponse(e){var r;const t=e||Sc;return((r=this._widgets.get(t))==null?void 0:r.getResponse())||""}execute(e){return p(this,null,function*(){var r;const t=e||Sc;return(r=this._widgets.get(t))==null||r.execute(),""})}}class wS{constructor(){this.enterprise=new IS}ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}class IS{ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}class TS{constructor(e,t,r){this.params=r,this.timerId=null,this.deleted=!1,this.responseToken=null,this.clickHandler=()=>{this.execute()};const i=typeof e=="string"?document.getElementById(e):e;M(i,"argument-error",{appName:t}),this.container=i,this.isVisible=this.params.size!=="invisible",this.isVisible?this.execute():this.container.addEventListener("click",this.clickHandler)}getResponse(){return this.checkIfDeleted(),this.responseToken}delete(){this.checkIfDeleted(),this.deleted=!0,this.timerId&&(clearTimeout(this.timerId),this.timerId=null),this.container.removeEventListener("click",this.clickHandler)}execute(){this.checkIfDeleted(),!this.timerId&&(this.timerId=window.setTimeout(()=>{this.responseToken=ES(50);const{callback:e,"expired-callback":t}=this.params;if(e)try{e(this.responseToken)}catch(r){}this.timerId=window.setTimeout(()=>{if(this.timerId=null,this.responseToken=null,t)try{t()}catch(r){}this.isVisible&&this.execute()},_S)},gS))}checkIfDeleted(){if(this.deleted)throw new Error("reCAPTCHA mock was already deleted!")}}function ES(n){const e=[],t="1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";for(let r=0;r<n;r++)e.push(t.charAt(Math.floor(Math.random()*t.length)));return e.join("")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vS="recaptcha-enterprise",jo="NO_RECAPTCHA",dg="onFirebaseAuthREInstanceReady";class Pn{constructor(e){this.type=vS,this.auth=Ae(e)}verify(e="verify",t=!1){return p(this,null,function*(){function r(s){return p(this,null,function*(){if(!t){if(s.tenantId==null&&s._agentRecaptchaConfig!=null)return s._agentRecaptchaConfig.siteKey;if(s.tenantId!=null&&s._tenantRecaptchaConfigs[s.tenantId]!==void 0)return s._tenantRecaptchaConfigs[s.tenantId].siteKey}return new Promise((o,a)=>p(this,null,function*(){mw(s,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(u=>{if(u.recaptchaKey===void 0)a(new Error("recaptcha Enterprise site key undefined"));else{const l=new pw(u);return s.tenantId==null?s._agentRecaptchaConfig=l:s._tenantRecaptchaConfigs[s.tenantId]=l,o(l.siteKey)}}).catch(u=>{a(u)})}))})}function i(s,o,a){const u=window.grecaptcha;ag(u)?u.enterprise.ready(()=>{u.enterprise.execute(s,{action:e}).then(l=>{o(l)}).catch(()=>{o(jo)})}):a(Error("No reCAPTCHA enterprise script loaded."))}return this.auth.settings.appVerificationDisabledForTesting?new wS().execute("siteKey",{action:"verify"}):new Promise((s,o)=>{r(this.auth).then(a=>p(this,null,function*(){if(!t&&ag(window.grecaptcha)&&Pn.scriptInjectionDeferred)yield Pn.scriptInjectionDeferred.promise,i(a,s,o);else{if(typeof window=="undefined"){o(new Error("RecaptchaVerifier is only supported in browser"));return}let u=pS();u.length!==0&&(u+=a+`&onload=${dg}`),Pn.scriptInjectionDeferred=new zy,window[dg]=()=>{var l;(l=Pn.scriptInjectionDeferred)==null||l.resolve()},Ld(u).then(()=>{var l;return(l=Pn.scriptInjectionDeferred)==null?void 0:l.promise}).then(()=>{i(a,s,o)}).catch(l=>{o(l)})}})).catch(a=>{o(a)})})})}}Pn.scriptInjectionDeferred=null;function bo(n,e,t,r=!1,i=!1){return p(this,null,function*(){const s=new Pn(n);let o;if(i)o=jo;else try{o=yield s.verify(t)}catch(u){o=yield s.verify(t,!0)}const a=G({},e);if(t==="mfaSmsEnrollment"||t==="mfaSmsSignIn"){if("phoneEnrollmentInfo"in a){const u=a.phoneEnrollmentInfo.phoneNumber,l=a.phoneEnrollmentInfo.recaptchaToken;Object.assign(a,{phoneEnrollmentInfo:{phoneNumber:u,recaptchaToken:l,captchaResponse:o,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}else if("phoneSignInInfo"in a){const u=a.phoneSignInInfo.recaptchaToken;Object.assign(a,{phoneSignInInfo:{recaptchaToken:u,captchaResponse:o,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}return a}return r?Object.assign(a,{captchaResp:o}):Object.assign(a,{captchaResponse:o}),Object.assign(a,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(a,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),a})}function _r(n,e,t,r,i){return p(this,null,function*(){var s,o;if(i==="EMAIL_PASSWORD_PROVIDER")if((s=n._getRecaptchaConfig())!=null&&s.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){const a=yield bo(n,e,t,t==="getOobCode");return r(n,a)}else return r(n,e).catch(a=>p(this,null,function*(){if(a.code==="auth/missing-recaptcha-token"){console.log(`${t} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);const u=yield bo(n,e,t,t==="getOobCode");return r(n,u)}else return Promise.reject(a)}));else if(i==="PHONE_PROVIDER")if((o=n._getRecaptchaConfig())!=null&&o.isProviderEnabled("PHONE_PROVIDER")){const a=yield bo(n,e,t);return r(n,a).catch(u=>p(this,null,function*(){var l;if(((l=n._getRecaptchaConfig())==null?void 0:l.getProviderEnforcementState("PHONE_PROVIDER"))==="AUDIT"&&(u.code==="auth/missing-recaptcha-token"||u.code==="auth/invalid-app-credential")){console.log(`Failed to verify with reCAPTCHA Enterprise. Automatically triggering the reCAPTCHA v2 flow to complete the ${t} flow.`);const h=yield bo(n,e,t,!1,!0);return r(n,h)}return Promise.reject(u)}))}else{const a=yield bo(n,e,t,!1,!0);return r(n,a)}else return Promise.reject(i+" provider is not supported.")})}function AS(n){return p(this,null,function*(){const e=Ae(n),t=yield mw(e,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}),r=new pw(t);e.tenantId==null?e._agentRecaptchaConfig=r:e._tenantRecaptchaConfigs[e.tenantId]=r,r.isAnyProviderEnabled()&&new Pn(e).verify()})}function bS(n,e){const t=(e==null?void 0:e.persistence)||[],r=(Array.isArray(t)?t:[t]).map(Ot);e!=null&&e.errorMap&&n._updateErrorMap(e.errorMap),n._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}function RS(n,e,t){const r=Ae(n);M(/^https?:\/\//.test(e),r,"invalid-emulator-scheme");const i=!!(t!=null&&t.disableWarnings),s=Sw(e),{host:o,port:a}=SS(e),u=a===null?"":`:${a}`,l={url:`${s}//${o}${u}/`},h=Object.freeze({host:o,port:a,protocol:s.replace(":",""),options:Object.freeze({disableWarnings:i})});if(!r._canInitEmulator){M(r.config.emulator&&r.emulatorConfig,r,"emulator-config-failed"),M(Tr(l,r.config.emulator)&&Tr(h,r.emulatorConfig),r,"emulator-config-failed");return}r.config.emulator=l,r.emulatorConfig=h,r.settings.appVerificationDisabledForTesting=!0,Kn(o)?Mu(`${s}//${o}${u}`):i||PS()}function Sw(n){const e=n.indexOf(":");return e<0?"":n.substr(0,e+1)}function SS(n){const e=Sw(n),t=/(\/\/)?([^?#/]+)/.exec(n.substr(e.length));if(!t)return{host:"",port:null};const r=t[2].split("@").pop()||"",i=/^(\[[^\]]+\])(:|$)/.exec(r);if(i){const s=i[1];return{host:s,port:fg(r.substr(s.length+1))}}else{const[s,o]=r.split(":");return{host:s,port:fg(o)}}}function fg(n){if(!n)return null;const e=Number(n);return isNaN(e)?null:e}function PS(){function n(){const e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console!="undefined"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window!="undefined"&&typeof document!="undefined"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",n):n())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bs{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return ln("not implemented")}_getIdTokenResponse(e){return ln("not implemented")}_linkToIdToken(e,t){return ln("not implemented")}_getReauthenticationResolver(e){return ln("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Pw(n,e){return p(this,null,function*(){return ke(n,"POST","/v1/accounts:resetPassword",Ce(n,e))})}function CS(n,e){return p(this,null,function*(){return ke(n,"POST","/v1/accounts:update",e)})}function kS(n,e){return p(this,null,function*(){return ke(n,"POST","/v1/accounts:signUp",e)})}function NS(n,e){return p(this,null,function*(){return ke(n,"POST","/v1/accounts:update",Ce(n,e))})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function VS(n,e){return p(this,null,function*(){return Wn(n,"POST","/v1/accounts:signInWithPassword",Ce(n,e))})}function qu(n,e){return p(this,null,function*(){return ke(n,"POST","/v1/accounts:sendOobCode",Ce(n,e))})}function DS(n,e){return p(this,null,function*(){return qu(n,e)})}function xS(n,e){return p(this,null,function*(){return qu(n,e)})}function OS(n,e){return p(this,null,function*(){return qu(n,e)})}function LS(n,e){return p(this,null,function*(){return qu(n,e)})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function MS(n,e){return p(this,null,function*(){return Wn(n,"POST","/v1/accounts:signInWithEmailLink",Ce(n,e))})}function FS(n,e){return p(this,null,function*(){return Wn(n,"POST","/v1/accounts:signInWithEmailLink",Ce(n,e))})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fa extends Bs{constructor(e,t,r,i=null){super("password",r),this._email=e,this._password=t,this._tenantId=i}static _fromEmailAndPassword(e,t){return new fa(e,t,"password")}static _fromEmailAndCode(e,t,r=null){return new fa(e,t,"emailLink",r)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e;if(t!=null&&t.email&&(t!=null&&t.password)){if(t.signInMethod==="password")return this._fromEmailAndPassword(t.email,t.password);if(t.signInMethod==="emailLink")return this._fromEmailAndCode(t.email,t.password,t.tenantId)}return null}_getIdTokenResponse(e){return p(this,null,function*(){switch(this.signInMethod){case"password":const t={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return _r(e,t,"signInWithPassword",VS,"EMAIL_PASSWORD_PROVIDER");case"emailLink":return MS(e,{email:this._email,oobCode:this._password});default:et(e,"internal-error")}})}_linkToIdToken(e,t){return p(this,null,function*(){switch(this.signInMethod){case"password":const r={idToken:t,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return _r(e,r,"signUpPassword",kS,"EMAIL_PASSWORD_PROVIDER");case"emailLink":return FS(e,{idToken:t,email:this._email,oobCode:this._password});default:et(e,"internal-error")}})}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Vn(n,e){return p(this,null,function*(){return Wn(n,"POST","/v1/accounts:signInWithIdp",Ce(n,e))})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const US="http://localhost";class Tn extends Bs{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const t=new Tn(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):et("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const a=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:i}=a,s=vo(a,["providerId","signInMethod"]);if(!r||!i)return null;const o=new Tn(r,i);return o.idToken=s.idToken||void 0,o.accessToken=s.accessToken||void 0,o.secret=s.secret,o.nonce=s.nonce,o.pendingToken=s.pendingToken||null,o}_getIdTokenResponse(e){const t=this.buildRequest();return Vn(e,t)}_linkToIdToken(e,t){const r=this.buildRequest();return r.idToken=t,Vn(e,r)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,Vn(e,t)}buildRequest(){const e={requestUri:US,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=Fs(t)}return e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function pg(n,e){return p(this,null,function*(){return ke(n,"POST","/v1/accounts:sendVerificationCode",Ce(n,e))})}function BS(n,e){return p(this,null,function*(){return Wn(n,"POST","/v1/accounts:signInWithPhoneNumber",Ce(n,e))})}function qS(n,e){return p(this,null,function*(){const t=yield Wn(n,"POST","/v1/accounts:signInWithPhoneNumber",Ce(n,e));if(t.temporaryProof)throw Lo(n,"account-exists-with-different-credential",t);return t})}const $S={USER_NOT_FOUND:"user-not-found"};function jS(n,e){return p(this,null,function*(){const t=ce(G({},e),{operation:"REAUTH"});return Wn(n,"POST","/v1/accounts:signInWithPhoneNumber",Ce(n,t),$S)})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class li extends Bs{constructor(e){super("phone","phone"),this.params=e}static _fromVerification(e,t){return new li({verificationId:e,verificationCode:t})}static _fromTokenResponse(e,t){return new li({phoneNumber:e,temporaryProof:t})}_getIdTokenResponse(e){return BS(e,this._makeVerificationRequest())}_linkToIdToken(e,t){return qS(e,G({idToken:t},this._makeVerificationRequest()))}_getReauthenticationResolver(e){return jS(e,this._makeVerificationRequest())}_makeVerificationRequest(){const{temporaryProof:e,phoneNumber:t,verificationId:r,verificationCode:i}=this.params;return e&&t?{temporaryProof:e,phoneNumber:t}:{sessionInfo:r,code:i}}toJSON(){const e={providerId:this.providerId};return this.params.phoneNumber&&(e.phoneNumber=this.params.phoneNumber),this.params.temporaryProof&&(e.temporaryProof=this.params.temporaryProof),this.params.verificationCode&&(e.verificationCode=this.params.verificationCode),this.params.verificationId&&(e.verificationId=this.params.verificationId),e}static fromJSON(e){typeof e=="string"&&(e=JSON.parse(e));const{verificationId:t,verificationCode:r,phoneNumber:i,temporaryProof:s}=e;return!r&&!t&&!i&&!s?null:new li({verificationId:t,verificationCode:r,phoneNumber:i,temporaryProof:s})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function zS(n){switch(n){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function KS(n){const e=ts(Oo(n)).link,t=e?ts(Oo(e)).deep_link_id:null,r=ts(Oo(n)).deep_link_id;return(r?ts(Oo(r)).link:null)||r||t||e||n}class $u{constructor(e){var o,a,u,l,h,f;const t=ts(Oo(e)),r=(o=t.apiKey)!=null?o:null,i=(a=t.oobCode)!=null?a:null,s=zS((u=t.mode)!=null?u:null);M(r&&i&&s,"argument-error"),this.apiKey=r,this.operation=s,this.code=i,this.continueUrl=(l=t.continueUrl)!=null?l:null,this.languageCode=(h=t.lang)!=null?h:null,this.tenantId=(f=t.tenantId)!=null?f:null}static parseLink(e){const t=KS(e);try{return new $u(t)}catch(r){return null}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Or{constructor(){this.providerId=Or.PROVIDER_ID}static credential(e,t){return fa._fromEmailAndPassword(e,t)}static credentialWithLink(e,t){const r=$u.parseLink(t);return M(r,"argument-error"),fa._fromEmailAndCode(e,r.code,r.tenantId)}}Or.PROVIDER_ID="password";Or.EMAIL_PASSWORD_SIGN_IN_METHOD="password";Or.EMAIL_LINK_SIGN_IN_METHOD="emailLink";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hn{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qs extends Hn{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}class is extends qs{static credentialFromJSON(e){const t=typeof e=="string"?JSON.parse(e):e;return M("providerId"in t&&"signInMethod"in t,"argument-error"),Tn._fromParams(t)}credential(e){return this._credential(ce(G({},e),{nonce:e.rawNonce}))}_credential(e){return M(e.idToken||e.accessToken,"argument-error"),Tn._fromParams(ce(G({},e),{providerId:this.providerId,signInMethod:this.providerId}))}static credentialFromResult(e){return is.oauthCredentialFromTaggedObject(e)}static credentialFromError(e){return is.oauthCredentialFromTaggedObject(e.customData||{})}static oauthCredentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:r,oauthTokenSecret:i,pendingToken:s,nonce:o,providerId:a}=e;if(!r&&!i&&!t&&!s||!a)return null;try{return new is(a)._credential({idToken:t,accessToken:r,nonce:o,pendingToken:s})}catch(u){return null}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sn extends qs{constructor(){super("facebook.com")}static credential(e){return Tn._fromParams({providerId:sn.PROVIDER_ID,signInMethod:sn.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return sn.credentialFromTaggedObject(e)}static credentialFromError(e){return sn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return sn.credential(e.oauthAccessToken)}catch(t){return null}}}sn.FACEBOOK_SIGN_IN_METHOD="facebook.com";sn.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class on extends qs{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return Tn._fromParams({providerId:on.PROVIDER_ID,signInMethod:on.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return on.credentialFromTaggedObject(e)}static credentialFromError(e){return on.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:r}=e;if(!t&&!r)return null;try{return on.credential(t,r)}catch(i){return null}}}on.GOOGLE_SIGN_IN_METHOD="google.com";on.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class an extends qs{constructor(){super("github.com")}static credential(e){return Tn._fromParams({providerId:an.PROVIDER_ID,signInMethod:an.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return an.credentialFromTaggedObject(e)}static credentialFromError(e){return an.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return an.credential(e.oauthAccessToken)}catch(t){return null}}}an.GITHUB_SIGN_IN_METHOD="github.com";an.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const GS="http://localhost";class fs extends Bs{constructor(e,t){super(e,e),this.pendingToken=t}_getIdTokenResponse(e){const t=this.buildRequest();return Vn(e,t)}_linkToIdToken(e,t){const r=this.buildRequest();return r.idToken=t,Vn(e,r)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,Vn(e,t)}toJSON(){return{signInMethod:this.signInMethod,providerId:this.providerId,pendingToken:this.pendingToken}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:i,pendingToken:s}=t;return!r||!i||!s||r!==i?null:new fs(r,s)}static _create(e,t){return new fs(e,t)}buildRequest(){return{requestUri:GS,returnSecureToken:!0,pendingToken:this.pendingToken}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const WS="saml.";class ou extends Hn{constructor(e){M(e.startsWith(WS),"argument-error"),super(e)}static credentialFromResult(e){return ou.samlCredentialFromTaggedObject(e)}static credentialFromError(e){return ou.samlCredentialFromTaggedObject(e.customData||{})}static credentialFromJSON(e){const t=fs.fromJSON(e);return M(t,"argument-error"),t}static samlCredentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{pendingToken:t,providerId:r}=e;if(!t||!r)return null;try{return fs._create(r,t)}catch(i){return null}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cn extends qs{constructor(){super("twitter.com")}static credential(e,t){return Tn._fromParams({providerId:cn.PROVIDER_ID,signInMethod:cn.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return cn.credentialFromTaggedObject(e)}static credentialFromError(e){return cn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:t,oauthTokenSecret:r}=e;if(!t||!r)return null;try{return cn.credential(t,r)}catch(i){return null}}}cn.TWITTER_SIGN_IN_METHOD="twitter.com";cn.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Cw(n,e){return p(this,null,function*(){return Wn(n,"POST","/v1/accounts:signUp",Ce(n,e))})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jt{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static _fromIdTokenResponse(e,t,r,i=!1){return p(this,null,function*(){const s=yield Ht._fromIdTokenResponse(e,r,i),o=mg(r);return new jt({user:s,providerId:o,_tokenResponse:r,operationType:t})})}static _forOperation(e,t,r){return p(this,null,function*(){yield e._updateTokensIfNecessary(r,!0);const i=mg(r);return new jt({user:e,providerId:i,_tokenResponse:r,operationType:t})})}}function mg(n){return n.providerId?n.providerId:"phoneNumber"in n?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function HS(n){return p(this,null,function*(){var i;if(_e(n.app))return Promise.reject(Ye(n));const e=Ae(n);if(yield e._initializationPromise,(i=e.currentUser)!=null&&i.isAnonymous)return new jt({user:e.currentUser,providerId:null,operationType:"signIn"});const t=yield Cw(e,{returnSecureToken:!0}),r=yield jt._fromIdTokenResponse(e,"signIn",t,!0);return yield e._updateCurrentUser(r.user),r})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class au extends Fe{constructor(e,t,r,i){var s;super(t.code,t.message),this.operationType=r,this.user=i,Object.setPrototypeOf(this,au.prototype),this.customData={appName:e.name,tenantId:(s=e.tenantId)!=null?s:void 0,_serverResponse:t.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,t,r,i){return new au(e,t,r,i)}}function kw(n,e,t,r){return(e==="reauthenticate"?t._getReauthenticationResolver(n):t._getIdTokenResponse(n)).catch(s=>{throw s.code==="auth/multi-factor-auth-required"?au._fromErrorAndOperation(n,s,e,r):s})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Nw(n){return new Set(n.map(({providerId:e})=>e).filter(e=>!!e))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function QS(n,e){return p(this,null,function*(){const t=z(n);yield ju(!0,t,e);const{providerUserInfo:r}=yield JR(t.auth,{idToken:yield t.getIdToken(),deleteProvider:[e]}),i=Nw(r||[]);return t.providerData=t.providerData.filter(s=>i.has(s.providerId)),i.has("phone")||(t.phoneNumber=null),yield t.auth._persistUserIfCurrent(t),t})}function Md(n,e,t=!1){return p(this,null,function*(){const r=yield Mn(n,e._linkToIdToken(n.auth,yield n.getIdToken()),t);return jt._forOperation(n,"link",r)})}function ju(n,e,t){return p(this,null,function*(){yield da(e);const r=Nw(e.providerData),i=n===!1?"provider-already-linked":"no-such-provider";M(r.has(t)===n,e.auth,i)})}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Vw(n,e,t=!1){return p(this,null,function*(){const{auth:r}=n;if(_e(r.app))return Promise.reject(Ye(r));const i="reauthenticate";try{const s=yield Mn(n,kw(r,i,e,n),t);M(s.idToken,r,"internal-error");const o=Bu(s.idToken);M(o,r,"internal-error");const{sub:a}=o;return M(n.uid===a,r,"user-mismatch"),jt._forOperation(n,i,s)}catch(s){throw(s==null?void 0:s.code)==="auth/user-not-found"&&et(r,"user-mismatch"),s}})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Dw(n,e,t=!1){return p(this,null,function*(){if(_e(n.app))return Promise.reject(Ye(n));const r="signIn",i=yield kw(n,r,e),s=yield jt._fromIdTokenResponse(n,r,i);return t||(yield n._updateCurrentUser(s.user)),s})}function zu(n,e){return p(this,null,function*(){return Dw(Ae(n),e)})}function xw(n,e){return p(this,null,function*(){const t=z(n);return yield ju(!1,t,e.providerId),Md(t,e)})}function Ow(n,e){return p(this,null,function*(){return Vw(z(n),e)})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function JS(n,e){return p(this,null,function*(){return Wn(n,"POST","/v1/accounts:signInWithCustomToken",Ce(n,e))})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function YS(n,e){return p(this,null,function*(){if(_e(n.app))return Promise.reject(Ye(n));const t=Ae(n),r=yield JS(t,{token:e,returnSecureToken:!0}),i=yield jt._fromIdTokenResponse(t,"signIn",r);return yield t._updateCurrentUser(i.user),i})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ba{constructor(e,t){this.factorId=e,this.uid=t.mfaEnrollmentId,this.enrollmentTime=new Date(t.enrolledAt).toUTCString(),this.displayName=t.displayName}static _fromServerResponse(e,t){return"phoneInfo"in t?Fd._fromServerResponse(e,t):"totpInfo"in t?Ud._fromServerResponse(e,t):et(e,"internal-error")}}class Fd extends Ba{constructor(e){super("phone",e),this.phoneNumber=e.phoneInfo}static _fromServerResponse(e,t){return new Fd(t)}}class Ud extends Ba{constructor(e){super("totp",e)}static _fromServerResponse(e,t){return new Ud(t)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ku(n,e,t){var r;M(((r=t.url)==null?void 0:r.length)>0,n,"invalid-continue-uri"),M(typeof t.dynamicLinkDomain=="undefined"||t.dynamicLinkDomain.length>0,n,"invalid-dynamic-link-domain"),M(typeof t.linkDomain=="undefined"||t.linkDomain.length>0,n,"invalid-hosting-link-domain"),e.continueUrl=t.url,e.dynamicLinkDomain=t.dynamicLinkDomain,e.linkDomain=t.linkDomain,e.canHandleCodeInApp=t.handleCodeInApp,t.iOS&&(M(t.iOS.bundleId.length>0,n,"missing-ios-bundle-id"),e.iOSBundleId=t.iOS.bundleId),t.android&&(M(t.android.packageName.length>0,n,"missing-android-pkg-name"),e.androidInstallApp=t.android.installApp,e.androidMinimumVersionCode=t.android.minimumVersion,e.androidPackageName=t.android.packageName)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Bd(n){return p(this,null,function*(){const e=Ae(n);e._getPasswordPolicyInternal()&&(yield e._updatePasswordPolicy())})}function XS(n,e,t){return p(this,null,function*(){const r=Ae(n),i={requestType:"PASSWORD_RESET",email:e,clientType:"CLIENT_TYPE_WEB"};t&&Ku(r,i,t),yield _r(r,i,"getOobCode",xS,"EMAIL_PASSWORD_PROVIDER")})}function ZS(n,e,t){return p(this,null,function*(){yield Pw(z(n),{oobCode:e,newPassword:t}).catch(r=>p(this,null,function*(){throw r.code==="auth/password-does-not-meet-requirements"&&Bd(n),r}))})}function eP(n,e){return p(this,null,function*(){yield NS(z(n),{oobCode:e})})}function Lw(n,e){return p(this,null,function*(){const t=z(n),r=yield Pw(t,{oobCode:e}),i=r.requestType;switch(M(i,t,"internal-error"),i){case"EMAIL_SIGNIN":break;case"VERIFY_AND_CHANGE_EMAIL":M(r.newEmail,t,"internal-error");break;case"REVERT_SECOND_FACTOR_ADDITION":M(r.mfaInfo,t,"internal-error");default:M(r.email,t,"internal-error")}let s=null;return r.mfaInfo&&(s=Ba._fromServerResponse(Ae(t),r.mfaInfo)),{data:{email:(r.requestType==="VERIFY_AND_CHANGE_EMAIL"?r.newEmail:r.email)||null,previousEmail:(r.requestType==="VERIFY_AND_CHANGE_EMAIL"?r.email:r.newEmail)||null,multiFactorInfo:s},operation:i}})}function tP(n,e){return p(this,null,function*(){const{data:t}=yield Lw(z(n),e);return t.email})}function nP(n,e,t){return p(this,null,function*(){if(_e(n.app))return Promise.reject(Ye(n));const r=Ae(n),o=yield _r(r,{returnSecureToken:!0,email:e,password:t,clientType:"CLIENT_TYPE_WEB"},"signUpPassword",Cw,"EMAIL_PASSWORD_PROVIDER").catch(u=>{throw u.code==="auth/password-does-not-meet-requirements"&&Bd(n),u}),a=yield jt._fromIdTokenResponse(r,"signIn",o);return yield r._updateCurrentUser(a.user),a})}function rP(n,e,t){return _e(n.app)?Promise.reject(Ye(n)):zu(z(n),Or.credential(e,t)).catch(r=>p(this,null,function*(){throw r.code==="auth/password-does-not-meet-requirements"&&Bd(n),r}))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function iP(n,e,t){return p(this,null,function*(){const r=Ae(n),i={requestType:"EMAIL_SIGNIN",email:e,clientType:"CLIENT_TYPE_WEB"};function s(o,a){M(a.handleCodeInApp,r,"argument-error"),a&&Ku(r,o,a)}s(i,t),yield _r(r,i,"getOobCode",OS,"EMAIL_PASSWORD_PROVIDER")})}function sP(n,e){const t=$u.parseLink(e);return(t==null?void 0:t.operation)==="EMAIL_SIGNIN"}function oP(n,e,t){return p(this,null,function*(){if(_e(n.app))return Promise.reject(Ye(n));const r=z(n),i=Or.credentialWithLink(e,t||ha());return M(i._tenantId===(r.tenantId||null),r,"tenant-id-mismatch"),zu(r,i)})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function aP(n,e){return p(this,null,function*(){return ke(n,"POST","/v1/accounts:createAuthUri",Ce(n,e))})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function cP(n,e){return p(this,null,function*(){const t=xd()?ha():"http://localhost",r={identifier:e,continueUri:t},{signinMethods:i}=yield aP(z(n),r);return i||[]})}function uP(n,e){return p(this,null,function*(){const t=z(n),i={requestType:"VERIFY_EMAIL",idToken:yield n.getIdToken()};e&&Ku(t.auth,i,e);const{email:s}=yield DS(t.auth,i);s!==n.email&&(yield n.reload())})}function lP(n,e,t){return p(this,null,function*(){const r=z(n),s={requestType:"VERIFY_AND_CHANGE_EMAIL",idToken:yield n.getIdToken(),newEmail:e};t&&Ku(r.auth,s,t);const{email:o}=yield LS(r.auth,s);o!==n.email&&(yield n.reload())})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function hP(n,e){return p(this,null,function*(){return ke(n,"POST","/v1/accounts:update",e)})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function dP(r,i){return p(this,arguments,function*(n,{displayName:e,photoURL:t}){if(e===void 0&&t===void 0)return;const s=z(n),a={idToken:yield s.getIdToken(),displayName:e,photoUrl:t,returnSecureToken:!0},u=yield Mn(s,hP(s.auth,a));s.displayName=u.displayName||null,s.photoURL=u.photoUrl||null;const l=s.providerData.find(({providerId:h})=>h==="password");l&&(l.displayName=s.displayName,l.photoURL=s.photoURL),yield s._updateTokensIfNecessary(u)})}function fP(n,e){const t=z(n);return _e(t.auth.app)?Promise.reject(Ye(t.auth)):Mw(t,e,null)}function pP(n,e){return Mw(z(n),null,e)}function Mw(n,e,t){return p(this,null,function*(){const{auth:r}=n,s={idToken:yield n.getIdToken(),returnSecureToken:!0};e&&(s.email=e),t&&(s.password=t);const o=yield Mn(n,CS(r,s));yield n._updateTokensIfNecessary(o,!0)})}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function mP(n){var i,s;if(!n)return null;const{providerId:e}=n,t=n.rawUserInfo?JSON.parse(n.rawUserInfo):{},r=n.isNewUser||n.kind==="identitytoolkit#SignupNewUserResponse";if(!e&&(n!=null&&n.idToken)){const o=(s=(i=Bu(n.idToken))==null?void 0:i.firebase)==null?void 0:s.sign_in_provider;if(o){const a=o!=="anonymous"&&o!=="custom"?o:null;return new ss(r,a)}}if(!e)return null;switch(e){case"facebook.com":return new gP(r,t);case"github.com":return new _P(r,t);case"google.com":return new yP(r,t);case"twitter.com":return new wP(r,t,n.screenName||null);case"custom":case"anonymous":return new ss(r,null);default:return new ss(r,e,t)}}class ss{constructor(e,t,r={}){this.isNewUser=e,this.providerId=t,this.profile=r}}class Fw extends ss{constructor(e,t,r,i){super(e,t,r),this.username=i}}class gP extends ss{constructor(e,t){super(e,"facebook.com",t)}}class _P extends Fw{constructor(e,t){super(e,"github.com",t,typeof(t==null?void 0:t.login)=="string"?t==null?void 0:t.login:null)}}class yP extends ss{constructor(e,t){super(e,"google.com",t)}}class wP extends Fw{constructor(e,t,r){super(e,"twitter.com",t,r)}}function IP(n){const{user:e,_tokenResponse:t}=n;return e.isAnonymous&&!t?{providerId:null,isNewUser:!1,profile:null}:mP(t)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ri{constructor(e,t,r){this.type=e,this.credential=t,this.user=r}static _fromIdtoken(e,t){return new ri("enroll",e,t)}static _fromMfaPendingCredential(e){return new ri("signin",e)}toJSON(){return{multiFactorSession:{[this.type==="enroll"?"idToken":"pendingCredential"]:this.credential}}}static fromJSON(e){var t,r;if(e!=null&&e.multiFactorSession){if((t=e.multiFactorSession)!=null&&t.pendingCredential)return ri._fromMfaPendingCredential(e.multiFactorSession.pendingCredential);if((r=e.multiFactorSession)!=null&&r.idToken)return ri._fromIdtoken(e.multiFactorSession.idToken)}return null}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qd{constructor(e,t,r){this.session=e,this.hints=t,this.signInResolver=r}static _fromError(e,t){const r=Ae(e),i=t.customData._serverResponse,s=(i.mfaInfo||[]).map(a=>Ba._fromServerResponse(r,a));M(i.mfaPendingCredential,r,"internal-error");const o=ri._fromMfaPendingCredential(i.mfaPendingCredential);return new qd(o,s,a=>p(this,null,function*(){const u=yield a._process(r,o);delete i.mfaInfo,delete i.mfaPendingCredential;const l=ce(G({},i),{idToken:u.idToken,refreshToken:u.refreshToken});switch(t.operationType){case"signIn":const h=yield jt._fromIdTokenResponse(r,t.operationType,l);return yield r._updateCurrentUser(h.user),h;case"reauthenticate":return M(t.user,r,"internal-error"),jt._forOperation(t.user,t.operationType,l);default:et(r,"internal-error")}}))}resolveSignIn(e){return p(this,null,function*(){const t=e;return this.signInResolver(t)})}}function TP(n,e){var i;const t=z(n),r=e;return M(e.customData.operationType,t,"argument-error"),M((i=r.customData._serverResponse)==null?void 0:i.mfaPendingCredential,t,"argument-error"),qd._fromError(t,r)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function gg(n,e){return ke(n,"POST","/v2/accounts/mfaEnrollment:start",Ce(n,e))}function EP(n,e){return ke(n,"POST","/v2/accounts/mfaEnrollment:finalize",Ce(n,e))}function vP(n,e){return ke(n,"POST","/v2/accounts/mfaEnrollment:withdraw",Ce(n,e))}class $d{constructor(e){this.user=e,this.enrolledFactors=[],e._onReload(t=>{t.mfaInfo&&(this.enrolledFactors=t.mfaInfo.map(r=>Ba._fromServerResponse(e.auth,r)))})}static _fromUser(e){return new $d(e)}getSession(){return p(this,null,function*(){return ri._fromIdtoken(yield this.user.getIdToken(),this.user)})}enroll(e,t){return p(this,null,function*(){const r=e,i=yield this.getSession(),s=yield Mn(this.user,r._process(this.user.auth,i,t));return yield this.user._updateTokensIfNecessary(s),this.user.reload()})}unenroll(e){return p(this,null,function*(){const t=typeof e=="string"?e:e.uid,r=yield this.user.getIdToken();try{const i=yield Mn(this.user,vP(this.user.auth,{idToken:r,mfaEnrollmentId:t}));this.enrolledFactors=this.enrolledFactors.filter(({uid:s})=>s!==t),yield this.user._updateTokensIfNecessary(i),yield this.user.reload()}catch(i){throw i}})}}const ah=new WeakMap;function AP(n){const e=z(n);return ah.has(e)||ah.set(e,$d._fromUser(e)),ah.get(e)}const cu="__sak";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Uw{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem(cu,"1"),this.storage.removeItem(cu),Promise.resolve(!0)):Promise.resolve(!1)}catch(e){return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){const t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bP=1e3,RP=10;class os extends Uw{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=Aw(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const t of Object.keys(this.listeners)){const r=this.storage.getItem(t),i=this.localCache[t];r!==i&&e(t,i,r)}}onStorageEvent(e,t=!1){if(!e.key){this.forAllChangedKeys((o,a,u)=>{this.notifyListeners(o,u)});return}const r=e.key;t?this.detachListener():this.stopPolling();const i=()=>{const o=this.storage.getItem(r);!t&&this.localCache[r]===o||this.notifyListeners(r,o)},s=this.storage.getItem(r);oS()&&s!==e.newValue&&e.newValue!==e.oldValue?setTimeout(i,RP):i()}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const i of Array.from(r))i(t&&JSON.parse(t))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:r}),!0)})},bP)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}_set(e,t){return p(this,null,function*(){yield Sn(os.prototype,this,"_set").call(this,e,t),this.localCache[e]=JSON.stringify(t)})}_get(e){return p(this,null,function*(){const t=yield Sn(os.prototype,this,"_get").call(this,e);return this.localCache[e]=JSON.stringify(t),t})}_remove(e){return p(this,null,function*(){yield Sn(os.prototype,this,"_remove").call(this,e),delete this.localCache[e]})}}os.type="LOCAL";const jd=os;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bw extends Uw{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}}Bw.type="SESSION";const gi=Bw;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function SP(n){return Promise.all(n.map(e=>p(this,null,function*(){try{return{fulfilled:!0,value:yield e}}catch(t){return{fulfilled:!1,reason:t}}})))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gu{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const t=this.receivers.find(i=>i.isListeningto(e));if(t)return t;const r=new Gu(e);return this.receivers.push(r),r}isListeningto(e){return this.eventTarget===e}handleEvent(e){return p(this,null,function*(){const t=e,{eventId:r,eventType:i,data:s}=t.data,o=this.handlersMap[i];if(!(o!=null&&o.size))return;t.ports[0].postMessage({status:"ack",eventId:r,eventType:i});const a=Array.from(o).map(l=>p(this,null,function*(){return l(t.origin,s)})),u=yield SP(a);t.ports[0].postMessage({status:"done",eventId:r,eventType:i,response:u})})}_subscribe(e,t){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),(!t||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}Gu.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qa(n="",e=10){let t="";for(let r=0;r<e;r++)t+=Math.floor(Math.random()*10);return n+t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class PP{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}_send(e,t,r=50){return p(this,null,function*(){const i=typeof MessageChannel!="undefined"?new MessageChannel:null;if(!i)throw new Error("connection_unavailable");let s,o;return new Promise((a,u)=>{const l=qa("",20);i.port1.start();const h=setTimeout(()=>{u(new Error("unsupported_event"))},r);o={messageChannel:i,onMessage(f){const g=f;if(g.data.eventId===l)switch(g.data.status){case"ack":clearTimeout(h),s=setTimeout(()=>{u(new Error("timeout"))},3e3);break;case"done":clearTimeout(s),a(g.data.response);break;default:clearTimeout(h),clearTimeout(s),u(new Error("invalid_response"));break}}},this.handlers.add(o),i.port1.addEventListener("message",o.onMessage),this.target.postMessage({eventType:e,eventId:l,data:t},[i.port2])}).finally(()=>{o&&this.removeMessageHandler(o)})})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Oe(){return window}function CP(n){Oe().location.href=n}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function zd(){return typeof Oe().WorkerGlobalScope!="undefined"&&typeof Oe().importScripts=="function"}function kP(){return p(this,null,function*(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(yield navigator.serviceWorker.ready).active}catch(n){return null}})}function NP(){var n;return((n=navigator==null?void 0:navigator.serviceWorker)==null?void 0:n.controller)||null}function VP(){return zd()?self:null}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qw="firebaseLocalStorageDb",DP=1,uu="firebaseLocalStorage",$w="fbase_key";class $a{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}}function Wu(n,e){return n.transaction([uu],e?"readwrite":"readonly").objectStore(uu)}function xP(){const n=indexedDB.deleteDatabase(qw);return new $a(n).toPromise()}function jw(){const n=indexedDB.open(qw,DP);return new Promise((e,t)=>{n.addEventListener("error",()=>{t(n.error)}),n.addEventListener("upgradeneeded",()=>{const r=n.result;try{r.createObjectStore(uu,{keyPath:$w})}catch(i){t(i)}}),n.addEventListener("success",()=>p(this,null,function*(){const r=n.result;r.objectStoreNames.contains(uu)?e(r):(r.close(),yield xP(),e(yield jw()))}))})}function _g(n,e,t){return p(this,null,function*(){const r=Wu(n,!0).put({[$w]:e,value:t});return new $a(r).toPromise()})}function OP(n,e){return p(this,null,function*(){const t=Wu(n,!1).get(e),r=yield new $a(t).toPromise();return r===void 0?null:r.value})}function yg(n,e){const t=Wu(n,!0).delete(e);return new $a(t).toPromise()}const LP=800,MP=3;class zw{registerLifecycleListeners(){typeof window!="undefined"&&typeof window.addEventListener=="function"&&(window.addEventListener("pagehide",this.onPageHide),window.addEventListener("pageshow",this.onPageShow))}unregisterLifecycleListeners(){typeof window!="undefined"&&typeof window.removeEventListener=="function"&&(window.removeEventListener("pagehide",this.onPageHide),window.removeEventListener("pageshow",this.onPageShow))}constructor(){this.type="LOCAL",this.dbPromise=null,this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.isClosing=!1,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this.onPageHide=()=>{this.isClosing=!0,this.stopPolling(),this.dbPromise&&(this.dbPromise.then(e=>e.close()).catch(()=>{}),this.dbPromise=null)},this.onPageShow=()=>{this.isClosing&&(this.isClosing=!1,Object.keys(this.listeners).length>0&&this.startPolling())},this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}_openDb(){return p(this,null,function*(){if(this.isClosing)throw new Error("Database is closing");return this.dbPromise?this.dbPromise:(this.dbPromise=jw(),this.dbPromise.catch(()=>{this.dbPromise=null}),this.dbPromise)})}_withRetries(e){return p(this,null,function*(){let t=0;for(;;)try{const r=yield this._openDb();return yield e(r)}catch(r){if(this.isClosing||t++>MP)throw r;this.dbPromise&&((yield this.dbPromise).close(),this.dbPromise=null)}})}initializeServiceWorkerMessaging(){return p(this,null,function*(){return zd()?this.initializeReceiver():this.initializeSender()})}initializeReceiver(){return p(this,null,function*(){this.receiver=Gu._getInstance(VP()),this.receiver._subscribe("keyChanged",(e,t)=>p(this,null,function*(){return{keyProcessed:(yield this._poll()).includes(t.key)}})),this.receiver._subscribe("ping",(e,t)=>p(this,null,function*(){return["keyChanged"]}))})}initializeSender(){return p(this,null,function*(){var t,r;if(this.activeServiceWorker=yield kP(),!this.activeServiceWorker)return;this.sender=new PP(this.activeServiceWorker);const e=yield this.sender._send("ping",{},800);e&&(t=e[0])!=null&&t.fulfilled&&(r=e[0])!=null&&r.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)})}notifyServiceWorker(e){return p(this,null,function*(){if(!(!this.sender||!this.activeServiceWorker||NP()!==this.activeServiceWorker))try{yield this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch(t){}})}_isAvailable(){return p(this,null,function*(){try{return indexedDB?(yield this._withRetries(e=>p(this,null,function*(){yield _g(e,cu,"1"),yield yg(e,cu)})),!0):!1}catch(e){}return!1})}_withPendingWrite(e){return p(this,null,function*(){this.pendingWrites++;try{yield e()}finally{this.pendingWrites--}})}_set(e,t){return p(this,null,function*(){return this._withPendingWrite(()=>p(this,null,function*(){return yield this._withRetries(r=>_g(r,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)}))})}_get(e){return p(this,null,function*(){const t=yield this._withRetries(r=>OP(r,e));return this.localCache[e]=t,t})}_remove(e){return p(this,null,function*(){return this._withPendingWrite(()=>p(this,null,function*(){return yield this._withRetries(t=>yg(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)}))})}_poll(){return p(this,null,function*(){if(this.isClosing)return[];try{const e=yield this._withRetries(i=>{const s=Wu(i,!1).getAll();return new $a(s).toPromise()});if(this.isClosing)return[];if(!e)return[];if(this.pendingWrites!==0)return[];const t=[],r=new Set;if(e.length!==0)for(const{fbase_key:i,value:s}of e)r.add(i),JSON.stringify(this.localCache[i])!==JSON.stringify(s)&&(this.notifyListeners(i,s),t.push(i));for(const i of Object.keys(this.localCache))this.localCache[i]&&!r.has(i)&&(this.notifyListeners(i,null),t.push(i));return t}catch(e){return this.isClosing||lw(`Firebase Auth cross-tab polling failed with error: ${e}`),[]}})}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const i of Array.from(r))i(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>p(this,null,function*(){return this._poll()}),LP)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.startPolling(),this.registerLifecycleListeners()),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.stopPolling(),this.unregisterLifecycleListeners())}}zw.type="LOCAL";const pa=zw;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function wg(n,e){return ke(n,"POST","/v2/accounts/mfaSignIn:start",Ce(n,e))}function FP(n,e){return ke(n,"POST","/v2/accounts/mfaSignIn:finalize",Ce(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ch=Rw("rcb"),UP=new La(3e4,6e4);class BP{constructor(){var e;this.hostLanguage="",this.counter=0,this.librarySeparatelyLoaded=!!((e=Oe().grecaptcha)!=null&&e.render)}load(e,t=""){return M(qP(t),e,"argument-error"),this.shouldResolveImmediately(t)&&og(Oe().grecaptcha)?Promise.resolve(Oe().grecaptcha):new Promise((r,i)=>{const s=Oe().setTimeout(()=>{i(ze(e,"network-request-failed"))},UP.get());Oe()[ch]=()=>{Oe().clearTimeout(s),delete Oe()[ch];const a=Oe().grecaptcha;if(!a||!og(a)){i(ze(e,"internal-error"));return}const u=a.render;a.render=(l,h)=>{const f=u(l,h);return this.counter++,f},this.hostLanguage=t,r(a)};const o=`${fS()}?${Fs({onload:ch,render:"explicit",hl:t})}`;Ld(o).catch(()=>{clearTimeout(s),i(ze(e,"internal-error"))})})}clearedOneInstance(){this.counter--}shouldResolveImmediately(e){var t;return!!((t=Oe().grecaptcha)!=null&&t.render)&&(e===this.hostLanguage||this.counter>0||this.librarySeparatelyLoaded)}}function qP(n){return n.length<=6&&/^\s*[a-zA-Z0-9\-]*\s*$/.test(n)}class $P{load(e){return p(this,null,function*(){return new yS(e)})}clearedOneInstance(){}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zo="recaptcha",jP={theme:"light",type:"image"};let zP=class{constructor(e,t,r=G({},jP)){this.parameters=r,this.type=zo,this.destroyed=!1,this.widgetId=null,this.tokenChangeListeners=new Set,this.renderPromise=null,this.recaptcha=null,this.auth=Ae(e),this.isInvisible=this.parameters.size==="invisible",M(typeof document!="undefined",this.auth,"operation-not-supported-in-this-environment");const i=typeof t=="string"?document.getElementById(t):t;M(i,this.auth,"argument-error"),this.container=i,this.parameters.callback=this.makeTokenCallback(this.parameters.callback),this._recaptchaLoader=this.auth.settings.appVerificationDisabledForTesting?new $P:new BP,this.validateStartingState()}verify(){return p(this,null,function*(){this.assertNotDestroyed();const e=yield this.render(),t=this.getAssertedRecaptcha(),r=t.getResponse(e);return r||new Promise(i=>{const s=o=>{o&&(this.tokenChangeListeners.delete(s),i(o))};this.tokenChangeListeners.add(s),this.isInvisible&&t.execute(e)})})}render(){try{this.assertNotDestroyed()}catch(e){return Promise.reject(e)}return this.renderPromise?this.renderPromise:(this.renderPromise=this.makeRenderPromise().catch(e=>{throw this.renderPromise=null,e}),this.renderPromise)}_reset(){this.assertNotDestroyed(),this.widgetId!==null&&this.getAssertedRecaptcha().reset(this.widgetId)}clear(){this.assertNotDestroyed(),this.destroyed=!0,this._recaptchaLoader.clearedOneInstance(),this.isInvisible||this.container.childNodes.forEach(e=>{this.container.removeChild(e)})}validateStartingState(){M(!this.parameters.sitekey,this.auth,"argument-error"),M(this.isInvisible||!this.container.hasChildNodes(),this.auth,"argument-error"),M(typeof document!="undefined",this.auth,"operation-not-supported-in-this-environment")}makeTokenCallback(e){return t=>{if(this.tokenChangeListeners.forEach(r=>r(t)),typeof e=="function")e(t);else if(typeof e=="string"){const r=Oe()[e];typeof r=="function"&&r(t)}}}assertNotDestroyed(){M(!this.destroyed,this.auth,"internal-error")}makeRenderPromise(){return p(this,null,function*(){if(yield this.init(),!this.widgetId){let e=this.container;if(!this.isInvisible){const t=document.createElement("div");e.appendChild(t),e=t}this.widgetId=this.getAssertedRecaptcha().render(e,this.parameters)}return this.widgetId})}init(){return p(this,null,function*(){M(xd()&&!zd(),this.auth,"internal-error"),yield KP(),this.recaptcha=yield this._recaptchaLoader.load(this.auth,this.auth.languageCode||void 0);const e=yield HR(this.auth);M(e,this.auth,"internal-error"),this.parameters.sitekey=e})}getAssertedRecaptcha(){return M(this.recaptcha,this.auth,"internal-error"),this.recaptcha}};function KP(){let n=null;return new Promise(e=>{if(document.readyState==="complete"){e();return}n=()=>e(),window.addEventListener("load",n)}).catch(e=>{throw n&&window.removeEventListener("load",n),e})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Kd{constructor(e,t){this.verificationId=e,this.onConfirmation=t}confirm(e){const t=li._fromVerification(this.verificationId,e);return this.onConfirmation(t)}}function GP(n,e,t){return p(this,null,function*(){if(_e(n.app))return Promise.reject(Ye(n));const r=Ae(n),i=yield Hu(r,e,z(t));return new Kd(i,s=>zu(r,s))})}function WP(n,e,t){return p(this,null,function*(){const r=z(n);yield ju(!1,r,"phone");const i=yield Hu(r.auth,e,z(t));return new Kd(i,s=>xw(r,s))})}function HP(n,e,t){return p(this,null,function*(){const r=z(n);if(_e(r.auth.app))return Promise.reject(Ye(r.auth));const i=yield Hu(r.auth,e,z(t));return new Kd(i,s=>Ow(r,s))})}function Hu(n,e,t){return p(this,null,function*(){var r;if(!n._getRecaptchaConfig())try{yield AS(n)}catch(i){console.log("Failed to initialize reCAPTCHA Enterprise config. Triggering the reCAPTCHA v2 verification.")}try{let i;if(typeof e=="string"?i={phoneNumber:e}:i=e,"session"in i){const s=i.session;if("phoneNumber"in i){M(s.type==="enroll",n,"internal-error");const o={idToken:s.credential,phoneEnrollmentInfo:{phoneNumber:i.phoneNumber,clientType:"CLIENT_TYPE_WEB"}};return(yield _r(n,o,"mfaSmsEnrollment",(h,f)=>p(this,null,function*(){if(f.phoneEnrollmentInfo.captchaResponse===jo){M((t==null?void 0:t.type)===zo,h,"argument-error");const g=yield uh(h,f,t);return gg(h,g)}return gg(h,f)}),"PHONE_PROVIDER").catch(h=>Promise.reject(h))).phoneSessionInfo.sessionInfo}else{M(s.type==="signin",n,"internal-error");const o=((r=i.multiFactorHint)==null?void 0:r.uid)||i.multiFactorUid;M(o,n,"missing-multi-factor-info");const a={mfaPendingCredential:s.credential,mfaEnrollmentId:o,phoneSignInInfo:{clientType:"CLIENT_TYPE_WEB"}};return(yield _r(n,a,"mfaSmsSignIn",(f,g)=>p(this,null,function*(){if(g.phoneSignInInfo.captchaResponse===jo){M((t==null?void 0:t.type)===zo,f,"argument-error");const w=yield uh(f,g,t);return wg(f,w)}return wg(f,g)}),"PHONE_PROVIDER").catch(f=>Promise.reject(f))).phoneResponseInfo.sessionInfo}}else{const s={phoneNumber:i.phoneNumber,clientType:"CLIENT_TYPE_WEB"};return(yield _r(n,s,"sendVerificationCode",(l,h)=>p(this,null,function*(){if(h.captchaResponse===jo){M((t==null?void 0:t.type)===zo,l,"argument-error");const f=yield uh(l,h,t);return pg(l,f)}return pg(l,h)}),"PHONE_PROVIDER").catch(l=>Promise.reject(l))).sessionInfo}}finally{t==null||t._reset()}})}function QP(n,e){return p(this,null,function*(){const t=z(n);if(_e(t.auth.app))return Promise.reject(Ye(t.auth));yield Md(t,e)})}function uh(n,e,t){return p(this,null,function*(){M(t.type===zo,n,"argument-error");const r=yield t.verify();M(typeof r=="string",n,"argument-error");const i=G({},e);if("phoneEnrollmentInfo"in i){const s=i.phoneEnrollmentInfo.phoneNumber,o=i.phoneEnrollmentInfo.captchaResponse,a=i.phoneEnrollmentInfo.clientType,u=i.phoneEnrollmentInfo.recaptchaVersion;return Object.assign(i,{phoneEnrollmentInfo:{phoneNumber:s,recaptchaToken:r,captchaResponse:o,clientType:a,recaptchaVersion:u}}),i}else if("phoneSignInInfo"in i){const s=i.phoneSignInInfo.captchaResponse,o=i.phoneSignInInfo.clientType,a=i.phoneSignInInfo.recaptchaVersion;return Object.assign(i,{phoneSignInInfo:{recaptchaToken:r,captchaResponse:s,clientType:o,recaptchaVersion:a}}),i}else return Object.assign(i,{recaptchaToken:r}),i})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let _i=class qc{constructor(e){this.providerId=qc.PROVIDER_ID,this.auth=Ae(e)}verifyPhoneNumber(e,t){return Hu(this.auth,e,z(t))}static credential(e,t){return li._fromVerification(e,t)}static credentialFromResult(e){const t=e;return qc.credentialFromTaggedObject(t)}static credentialFromError(e){return qc.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{phoneNumber:t,temporaryProof:r}=e;return t&&r?li._fromTokenResponse(t,r):null}};_i.PROVIDER_ID="phone";_i.PHONE_SIGN_IN_METHOD="phone";/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ni(n,e){return e?Ot(e):(M(n._popupRedirectResolver,n,"argument-error"),n._popupRedirectResolver)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gd extends Bs{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return Vn(e,this._buildIdpRequest())}_linkToIdToken(e,t){return Vn(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return Vn(e,this._buildIdpRequest())}_buildIdpRequest(e){const t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function JP(n){return Dw(n.auth,new Gd(n),n.bypassAuthState)}function YP(n){const{auth:e,user:t}=n;return M(t,e,"internal-error"),Vw(t,new Gd(n),n.bypassAuthState)}function XP(n){return p(this,null,function*(){const{auth:e,user:t}=n;return M(t,e,"internal-error"),Md(t,new Gd(n),n.bypassAuthState)})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Kw{constructor(e,t,r,i,s=!1){this.auth=e,this.resolver=r,this.user=i,this.bypassAuthState=s,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise((e,t)=>p(this,null,function*(){this.pendingPromise={resolve:e,reject:t};try{this.eventManager=yield this.resolver._initialize(this.auth),yield this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}}))}onAuthEvent(e){return p(this,null,function*(){const{urlResponse:t,sessionId:r,postBody:i,tenantId:s,error:o,type:a}=e;if(o){this.reject(o);return}const u={auth:this.auth,requestUri:t,sessionId:r,tenantId:s||void 0,postBody:i||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(yield this.getIdpTask(a)(u))}catch(l){this.reject(l)}})}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return JP;case"linkViaPopup":case"linkViaRedirect":return XP;case"reauthViaPopup":case"reauthViaRedirect":return YP;default:et(this.auth,"internal-error")}}resolve(e){Zt(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){Zt(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ZP=new La(2e3,1e4);function eC(n,e,t){return p(this,null,function*(){if(_e(n.app))return Promise.reject(ze(n,"operation-not-supported-in-this-environment"));const r=Ae(n);Us(n,e,Hn);const i=Ni(r,t);return new Nn(r,"signInViaPopup",e,i).executeNotNull()})}function tC(n,e,t){return p(this,null,function*(){const r=z(n);if(_e(r.auth.app))return Promise.reject(ze(r.auth,"operation-not-supported-in-this-environment"));Us(r.auth,e,Hn);const i=Ni(r.auth,t);return new Nn(r.auth,"reauthViaPopup",e,i,r).executeNotNull()})}function nC(n,e,t){return p(this,null,function*(){const r=z(n);Us(r.auth,e,Hn);const i=Ni(r.auth,t);return new Nn(r.auth,"linkViaPopup",e,i,r).executeNotNull()})}class Nn extends Kw{constructor(e,t,r,i,s){super(e,t,i,s),this.provider=r,this.authWindow=null,this.pollId=null,Nn.currentPopupAction&&Nn.currentPopupAction.cancel(),Nn.currentPopupAction=this}executeNotNull(){return p(this,null,function*(){const e=yield this.execute();return M(e,this.auth,"internal-error"),e})}onExecution(){return p(this,null,function*(){Zt(this.filter.length===1,"Popup operations only handle one event");const e=qa();this.authWindow=yield this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(t=>{this.reject(t)}),this.resolver._isIframeWebStorageSupported(this.auth,t=>{t||this.reject(ze(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()})}get eventId(){var e;return((e=this.authWindow)==null?void 0:e.associatedEvent)||null}cancel(){this.reject(ze(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,Nn.currentPopupAction=null}pollUserCancellation(){const e=()=>{var t,r;if((r=(t=this.authWindow)==null?void 0:t.window)!=null&&r.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(ze(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,ZP.get())};e()}}Nn.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const rC="pendingRedirect",Ko=new Map;class Go extends Kw{constructor(e,t,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,r),this.eventId=null}execute(){return p(this,null,function*(){let e=Ko.get(this.auth._key());if(!e){try{const r=(yield iC(this.resolver,this.auth))?yield Sn(Go.prototype,this,"execute").call(this):null;e=()=>Promise.resolve(r)}catch(t){e=()=>Promise.reject(t)}Ko.set(this.auth._key(),e)}return this.bypassAuthState||Ko.set(this.auth._key(),()=>Promise.resolve(null)),e()})}onAuthEvent(e){return p(this,null,function*(){if(e.type==="signInViaRedirect")return Sn(Go.prototype,this,"onAuthEvent").call(this,e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const t=yield this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,Sn(Go.prototype,this,"onAuthEvent").call(this,e);this.resolve(null)}})}onExecution(){return p(this,null,function*(){})}cleanUp(){}}function iC(n,e){return p(this,null,function*(){const t=Ww(e),r=Gw(n);if(!(yield r._isAvailable()))return!1;const i=(yield r._get(t))==="true";return yield r._remove(t),i})}function Wd(n,e){return p(this,null,function*(){return Gw(n)._set(Ww(e),"true")})}function sC(){Ko.clear()}function Hd(n,e){Ko.set(n._key(),e)}function Gw(n){return Ot(n._redirectPersistence)}function Ww(n){return ui(rC,n.config.apiKey,n.name)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function oC(n,e,t){return aC(n,e,t)}function aC(n,e,t){return p(this,null,function*(){if(_e(n.app))return Promise.reject(Ye(n));const r=Ae(n);Us(n,e,Hn),yield r._initializationPromise;const i=Ni(r,t);return yield Wd(i,r),i._openRedirect(r,e,"signInViaRedirect")})}function cC(n,e,t){return uC(n,e,t)}function uC(n,e,t){return p(this,null,function*(){const r=z(n);if(Us(r.auth,e,Hn),_e(r.auth.app))return Promise.reject(Ye(r.auth));yield r.auth._initializationPromise;const i=Ni(r.auth,t);yield Wd(i,r.auth);const s=yield Hw(r);return i._openRedirect(r.auth,e,"reauthViaRedirect",s)})}function lC(n,e,t){return hC(n,e,t)}function hC(n,e,t){return p(this,null,function*(){const r=z(n);Us(r.auth,e,Hn),yield r.auth._initializationPromise;const i=Ni(r.auth,t);yield ju(!1,r,e.providerId),yield Wd(i,r.auth);const s=yield Hw(r);return i._openRedirect(r.auth,e,"linkViaRedirect",s)})}function dC(n,e){return p(this,null,function*(){return yield Ae(n)._initializationPromise,Qu(n,e,!1)})}function Qu(n,e,t=!1){return p(this,null,function*(){if(_e(n.app))return Promise.reject(Ye(n));const r=Ae(n),i=Ni(r,e),o=yield new Go(r,i,t).execute();return o&&!t&&(delete o.user._redirectEventId,yield r._persistUserIfCurrent(o.user),yield r._setRedirectUser(null,e)),o})}function Hw(n){return p(this,null,function*(){const e=qa(`${n.uid}:::`);return n._redirectEventId=e,yield n.auth._setRedirectUser(n),yield n.auth._persistUserIfCurrent(n),e})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fC=10*60*1e3;class Qw{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(t=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!pC(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){var r;if(e.error&&!Jw(e)){const i=((r=e.error.code)==null?void 0:r.split("auth/")[1])||"internal-error";t.onError(ze(this.auth,i))}else t.onAuthEvent(e)}isEventForConsumer(e,t){const r=t.eventId===null||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=fC&&this.cachedEventUids.clear(),this.cachedEventUids.has(Ig(e))}saveEventToCache(e){this.cachedEventUids.add(Ig(e)),this.lastProcessedEventTime=Date.now()}}function Ig(n){return[n.type,n.eventId,n.sessionId,n.tenantId].filter(e=>e).join("-")}function Jw({type:n,error:e}){return n==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function pC(n){switch(n.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return Jw(n);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Yw(t){return p(this,arguments,function*(n,e={}){return ke(n,"GET","/v1/projects",e)})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const mC=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,gC=/^https?/;function _C(n){return p(this,null,function*(){if(n.config.emulator)return;const{authorizedDomains:e}=yield Yw(n);for(const t of e)try{if(yC(t))return}catch(r){}et(n,"unauthorized-domain")})}function yC(n){const e=ha(),{protocol:t,hostname:r}=new URL(e);if(n.startsWith("chrome-extension://")){const o=new URL(n);return o.hostname===""&&r===""?t==="chrome-extension:"&&n.replace("chrome-extension://","")===e.replace("chrome-extension://",""):t==="chrome-extension:"&&o.hostname===r}if(!gC.test(t))return!1;if(mC.test(n))return r===n;const i=n.replace(/\./g,"\\.");return new RegExp("^(.+\\."+i+"|"+i+")$","i").test(r)}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wC=new La(3e4,6e4);function Tg(){const n=Oe().___jsl;if(n!=null&&n.H){for(const e of Object.keys(n.H))if(n.H[e].r=n.H[e].r||[],n.H[e].L=n.H[e].L||[],n.H[e].r=[...n.H[e].L],n.CP)for(let t=0;t<n.CP.length;t++)n.CP[t]=null}}function IC(n){return new Promise((e,t)=>{var i,s,o;function r(){Tg(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{Tg(),t(ze(n,"network-request-failed"))},timeout:wC.get()})}if((s=(i=Oe().gapi)==null?void 0:i.iframes)!=null&&s.Iframe)e(gapi.iframes.getContext());else if((o=Oe().gapi)!=null&&o.load)r();else{const a=Rw("iframefcb");return Oe()[a]=()=>{gapi.load?r():t(ze(n,"network-request-failed"))},Ld(`${mS()}?onload=${a}`).catch(u=>t(u))}}).catch(e=>{throw $c=null,e})}let $c=null;function TC(n){return $c=$c||IC(n),$c}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const EC=new La(5e3,15e3),vC="__/auth/iframe",AC="emulator/auth/iframe",bC={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},RC=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function SC(n){const e=n.config;M(e.authDomain,n,"auth-domain-config-required");const t=e.emulator?Od(e,AC):`https://${n.config.authDomain}/${vC}`,r={apiKey:e.apiKey,appName:n.name,v:Gn},i=RC.get(n.config.apiHost);i&&(r.eid=i);const s=n._getFrameworks();return s.length&&(r.fw=s.join(",")),`${t}?${Fs(r).slice(1)}`}function PC(n){return p(this,null,function*(){const e=yield TC(n),t=Oe().gapi;return M(t,n,"internal-error"),e.open({where:document.body,url:SC(n),messageHandlersFilter:t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:bC,dontclear:!0},r=>new Promise((i,s)=>p(this,null,function*(){yield r.restyle({setHideOnLeave:!1});const o=ze(n,"network-request-failed"),a=Oe().setTimeout(()=>{s(o)},EC.get());function u(){Oe().clearTimeout(a),i(r)}r.ping(u).then(u,()=>{s(o)})})))})}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const CC={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},kC=500,NC=600,VC="_blank",DC="http://localhost";class Eg{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch(e){}}}function xC(n,e,t,r=kC,i=NC){const s=Math.max((window.screen.availHeight-i)/2,0).toString(),o=Math.max((window.screen.availWidth-r)/2,0).toString();let a="";const u=ce(G({},CC),{width:r.toString(),height:i.toString(),top:s,left:o}),l=ve().toLowerCase();t&&(a=Iw(l)?VC:t),yw(l)&&(e=e||DC,u.scrollbars="yes");const h=Object.entries(u).reduce((g,[w,S])=>`${g}${w}=${S},`,"");if(sS(l)&&a!=="_self")return OC(e||"",a),new Eg(null);const f=window.open(e||"",a,h);M(f,n,"popup-blocked");try{f.focus()}catch(g){}return new Eg(f)}function OC(n,e){const t=document.createElement("a");t.href=n,t.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),t.dispatchEvent(r)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const LC="__/auth/handler",MC="emulator/auth/handler",FC=encodeURIComponent("fac");function Dh(n,e,t,r,i,s){return p(this,null,function*(){M(n.config.authDomain,n,"auth-domain-config-required"),M(n.config.apiKey,n,"invalid-api-key");const o={apiKey:n.config.apiKey,appName:n.name,authType:t,redirectUrl:r,v:Gn,eventId:i};if(e instanceof Hn){e.setDefaultLanguage(n.languageCode),o.providerId=e.providerId||"",Ab(e.getCustomParameters())||(o.customParameters=JSON.stringify(e.getCustomParameters()));for(const[h,f]of Object.entries(s||{}))o[h]=f}if(e instanceof qs){const h=e.getScopes().filter(f=>f!=="");h.length>0&&(o.scopes=h.join(","))}n.tenantId&&(o.tid=n.tenantId);const a=o;for(const h of Object.keys(a))a[h]===void 0&&delete a[h];const u=yield n._getAppCheckToken(),l=u?`#${FC}=${encodeURIComponent(u)}`:"";return`${UC(n)}?${Fs(a).slice(1)}${l}`})}function UC({config:n}){return n.emulator?Od(n,MC):`https://${n.authDomain}/${LC}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const lh="webStorageSupport";class BC{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=gi,this._completeRedirectFn=Qu,this._overrideRedirectResult=Hd}_openPopup(e,t,r,i){return p(this,null,function*(){var o;Zt((o=this.eventManagers[e._key()])==null?void 0:o.manager,"_initialize() not called before _openPopup()");const s=yield Dh(e,t,r,ha(),i);return xC(e,s,qa())})}_openRedirect(e,t,r,i){return p(this,null,function*(){yield this._originValidation(e);const s=yield Dh(e,t,r,ha(),i);return CP(s),new Promise(()=>{})})}_initialize(e){const t=e._key();if(this.eventManagers[t]){const{manager:i,promise:s}=this.eventManagers[t];return i?Promise.resolve(i):(Zt(s,"If manager is not set, promise should be"),s)}const r=this.initAndGetManager(e);return this.eventManagers[t]={promise:r},r.catch(()=>{delete this.eventManagers[t]}),r}initAndGetManager(e){return p(this,null,function*(){const t=yield PC(e),r=new Qw(e);return t.register("authEvent",i=>(M(i==null?void 0:i.authEvent,e,"invalid-auth-event"),{status:r.onEvent(i.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=t,r})}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(lh,{type:lh},i=>{var o;const s=(o=i==null?void 0:i[0])==null?void 0:o[lh];s!==void 0&&t(!!s),et(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=_C(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return Aw()||ww()||Fa()}}const qC=BC;class $C{constructor(e){this.factorId=e}_process(e,t,r){switch(t.type){case"enroll":return this._finalizeEnroll(e,t.credential,r);case"signin":return this._finalizeSignIn(e,t.credential);default:return ln("unexpected MultiFactorSessionType")}}}class Qd extends $C{constructor(e){super("phone"),this.credential=e}static _fromCredential(e){return new Qd(e)}_finalizeEnroll(e,t,r){return EP(e,{idToken:t,displayName:r,phoneVerificationInfo:this.credential._makeVerificationRequest()})}_finalizeSignIn(e,t){return FP(e,{mfaPendingCredential:t,phoneVerificationInfo:this.credential._makeVerificationRequest()})}}class Xw{constructor(){}static assertion(e){return Qd._fromCredential(e)}}Xw.FACTOR_ID="phone";var vg="@firebase/auth",Ag="1.13.5";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jC{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)==null?void 0:e.uid)||null}getToken(e){return p(this,null,function*(){return this.assertAuthConfigured(),yield this.auth._initializationPromise,this.auth.currentUser?{accessToken:yield this.auth.currentUser.getIdToken(e)}:null})}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){M(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function zC(n){switch(n){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function KC(n){It(new Be("auth",(e,{options:t})=>{const r=e.getProvider("app").getImmediate(),i=e.getProvider("heartbeat"),s=e.getProvider("app-check-internal"),{apiKey:o,authDomain:a}=r.options;M(o&&!o.includes(":"),"invalid-api-key",{appName:r.name});const u={apiKey:o,authDomain:a,clientPlatform:n,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:bw(n)},l=new hS(r,i,s,u);return bS(l,t),l},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,r)=>{e.getProvider("auth-internal").initialize()})),It(new Be("auth-internal",e=>{const t=Ae(e.getProvider("auth").getImmediate());return(r=>new jC(r))(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),je(vg,Ag,zC(n)),je(vg,Ag,"esm2020")}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const GC=5*60;gb("authIdTokenMaxAge");function WC(){var n,e;return(e=(n=document.getElementsByTagName("head"))==null?void 0:n[0])!=null?e:document}dS({loadJS(n){return new Promise((e,t)=>{const r=document.createElement("script");r.setAttribute("src",n),r.onload=e,r.onerror=i=>{const s=ze("internal-error");s.customData=i,t(s)},r.type="text/javascript",r.charset="UTF-8",WC().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});KC("Browser");/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function yi(){return window}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const HC=2e3;function QC(n,e,t){return p(this,null,function*(){var o;const{BuildInfo:r}=yi();Zt(e.sessionId,"AuthEvent did not contain a session ID");const i=yield ek(e.sessionId),s={};return Fa()?s.ibi=r.packageName:Ma()?s.apn=r.packageName:et(n,"operation-not-supported-in-this-environment"),r.displayName&&(s.appDisplayName=r.displayName),s.sessionId=i,Dh(n,t,e.type,void 0,(o=e.eventId)!=null?o:void 0,s)})}function JC(n){return p(this,null,function*(){const{BuildInfo:e}=yi(),t={};Fa()?t.iosBundleId=e.packageName:Ma()?t.androidPackageName=e.packageName:et(n,"operation-not-supported-in-this-environment"),yield Yw(n,t)})}function YC(n){const{cordova:e}=yi();return new Promise(t=>{e.plugins.browsertab.isAvailable(r=>{let i=null;r?e.plugins.browsertab.openUrl(n):i=e.InAppBrowser.open(n,iS()?"_blank":"_system","location=yes"),t(i)})})}function XC(n,e,t){return p(this,null,function*(){const{cordova:r}=yi();let i=()=>{};try{yield new Promise((s,o)=>{let a=null;function u(){var g;s();const f=(g=r.plugins.browsertab)==null?void 0:g.close;typeof f=="function"&&f(),typeof(t==null?void 0:t.close)=="function"&&t.close()}function l(){a||(a=window.setTimeout(()=>{o(ze(n,"redirect-cancelled-by-user"))},HC))}function h(){(document==null?void 0:document.visibilityState)==="visible"&&l()}e.addPassiveListener(u),document.addEventListener("resume",l,!1),Ma()&&document.addEventListener("visibilitychange",h,!1),i=()=>{e.removePassiveListener(u),document.removeEventListener("resume",l,!1),document.removeEventListener("visibilitychange",h,!1),a&&window.clearTimeout(a)}})}finally{i()}})}function ZC(n){var t,r,i,s,o,a,u,l,h,f;const e=yi();M(typeof((t=e==null?void 0:e.universalLinks)==null?void 0:t.subscribe)=="function",n,"invalid-cordova-configuration",{missingPlugin:"cordova-universal-links-plugin-fix"}),M(typeof((r=e==null?void 0:e.BuildInfo)==null?void 0:r.packageName)!="undefined",n,"invalid-cordova-configuration",{missingPlugin:"cordova-plugin-buildInfo"}),M(typeof((o=(s=(i=e==null?void 0:e.cordova)==null?void 0:i.plugins)==null?void 0:s.browsertab)==null?void 0:o.openUrl)=="function",n,"invalid-cordova-configuration",{missingPlugin:"cordova-plugin-browsertab"}),M(typeof((l=(u=(a=e==null?void 0:e.cordova)==null?void 0:a.plugins)==null?void 0:u.browsertab)==null?void 0:l.isAvailable)=="function",n,"invalid-cordova-configuration",{missingPlugin:"cordova-plugin-browsertab"}),M(typeof((f=(h=e==null?void 0:e.cordova)==null?void 0:h.InAppBrowser)==null?void 0:f.open)=="function",n,"invalid-cordova-configuration",{missingPlugin:"cordova-plugin-inappbrowser"})}function ek(n){return p(this,null,function*(){const e=tk(n),t=yield crypto.subtle.digest("SHA-256",e);return Array.from(new Uint8Array(t)).map(i=>i.toString(16).padStart(2,"0")).join("")})}function tk(n){if(Zt(/[0-9a-zA-Z]+/.test(n),"Can only convert alpha-numeric strings"),typeof TextEncoder!="undefined")return new TextEncoder().encode(n);const e=new ArrayBuffer(n.length),t=new Uint8Array(e);for(let r=0;r<n.length;r++)t[r]=n.charCodeAt(r);return t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const nk=20;class rk extends Qw{constructor(){super(...arguments),this.passiveListeners=new Set,this.initPromise=new Promise(e=>{this.resolveInitialized=e})}addPassiveListener(e){this.passiveListeners.add(e)}removePassiveListener(e){this.passiveListeners.delete(e)}resetRedirect(){this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1}onEvent(e){return this.resolveInitialized(),this.passiveListeners.forEach(t=>t(e)),super.onEvent(e)}initialized(){return p(this,null,function*(){yield this.initPromise})}}function ik(n,e,t=null){return{type:e,eventId:t,urlResponse:null,sessionId:ak(),postBody:null,tenantId:n.tenantId,error:ze(n,"no-auth-event")}}function sk(n,e){return xh()._set(Oh(n),e)}function bg(n){return p(this,null,function*(){const e=yield xh()._get(Oh(n));return e&&(yield xh()._remove(Oh(n))),e})}function ok(n,e){var r,i;const t=uk(e);if(t.includes("/__/auth/callback")){const s=jc(t),o=s.firebaseError?ck(decodeURIComponent(s.firebaseError)):null,a=(i=(r=o==null?void 0:o.code)==null?void 0:r.split("auth/"))==null?void 0:i[1],u=a?ze(a):null;return u?{type:n.type,eventId:n.eventId,tenantId:n.tenantId,error:u,urlResponse:null,sessionId:null,postBody:null}:{type:n.type,eventId:n.eventId,tenantId:n.tenantId,sessionId:n.sessionId,urlResponse:t,postBody:null}}return null}function ak(){const n=[],e="1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";for(let t=0;t<nk;t++){const r=Math.floor(Math.random()*e.length);n.push(e.charAt(r))}return n.join("")}function xh(){return Ot(jd)}function Oh(n){return ui("authEvent",n.config.apiKey,n.name)}function ck(n){try{return JSON.parse(n)}catch(e){return null}}function uk(n){const e=jc(n),t=e.link?decodeURIComponent(e.link):void 0,r=jc(t).link,i=e.deep_link_id?decodeURIComponent(e.deep_link_id):void 0;return jc(i).link||i||r||t||n}function jc(n){if(!(n!=null&&n.includes("?")))return{};const[e,...t]=n.split("?");return ts(t.join("?"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const lk=500;class hk{constructor(){this._redirectPersistence=gi,this._shouldInitProactively=!0,this.eventManagers=new Map,this.originValidationPromises={},this._completeRedirectFn=Qu,this._overrideRedirectResult=Hd}_initialize(e){return p(this,null,function*(){const t=e._key();let r=this.eventManagers.get(t);return r||(r=new rk(e),this.eventManagers.set(t,r),this.attachCallbackListeners(e,r)),r})}_openPopup(e){et(e,"operation-not-supported-in-this-environment")}_openRedirect(e,t,r,i){return p(this,null,function*(){ZC(e);const s=yield this._initialize(e);yield s.initialized(),s.resetRedirect(),sC(),yield this._originValidation(e);const o=ik(e,r,i);yield sk(e,o);const a=yield QC(e,o,t),u=yield YC(a);return XC(e,s,u)})}_isIframeWebStorageSupported(e,t){throw new Error("Method not implemented.")}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=JC(e)),this.originValidationPromises[t]}attachCallbackListeners(e,t){const{universalLinks:r,handleOpenURL:i,BuildInfo:s}=yi(),o=setTimeout(()=>p(this,null,function*(){yield bg(e),t.onEvent(Rg())}),lk),a=h=>p(this,null,function*(){clearTimeout(o);const f=yield bg(e);let g=null;f&&(h!=null&&h.url)&&(g=ok(f,h.url)),t.onEvent(g||Rg())});typeof r!="undefined"&&typeof r.subscribe=="function"&&r.subscribe(null,a);const u=i,l=`${s.packageName.toLowerCase()}://`;yi().handleOpenURL=h=>p(this,null,function*(){if(h.toLowerCase().startsWith(l)&&a({url:h}),typeof u=="function")try{u(h)}catch(f){console.error(f)}})}}const dk=hk;function Rg(){return{type:"unknown",eventId:null,sessionId:null,urlResponse:null,postBody:null,tenantId:null,error:ze("no-auth-event")}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function fk(n,e){Ae(n)._logFramework(e)}var pk="@firebase/auth-compat",mk="0.6.10";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const gk=1e3;function Wo(){var n;return((n=self==null?void 0:self.location)==null?void 0:n.protocol)||null}function _k(){return Wo()==="http:"||Wo()==="https:"}function Zw(n=ve()){return!!((Wo()==="file:"||Wo()==="ionic:"||Wo()==="capacitor:")&&n.toLowerCase().match(/iphone|ipad|ipod|android/))}function yk(){return Sd()||Lu()}function wk(){return Hy()&&(document==null?void 0:document.documentMode)===11}function Ik(n=ve()){return/Edge\/\d+/.test(n)}function Tk(n=ve()){return wk()||Ik(n)}function eI(){try{const n=self.localStorage,e=qa();if(n)return n.setItem(e,"1"),n.removeItem(e),Tk()?mi():!0}catch(n){return Jd()&&mi()}return!1}function Jd(){return typeof global!="undefined"&&"WorkerGlobalScope"in global&&"importScripts"in global}function hh(){return(_k()||Wy()||Zw())&&!yk()&&eI()&&!Jd()}function tI(){return Zw()&&typeof document!="undefined"}function Ek(){return p(this,null,function*(){return tI()?new Promise(n=>{const e=setTimeout(()=>{n(!1)},gk);document.addEventListener("deviceready",()=>{clearTimeout(e),n(!0)})}):!1})}function vk(){return typeof window!="undefined"?window:null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xt={LOCAL:"local",NONE:"none",SESSION:"session"},Ro=M,nI="persistence";function Ak(n,e){if(Ro(Object.values(xt).includes(e),n,"invalid-persistence-type"),Sd()){Ro(e!==xt.SESSION,n,"unsupported-persistence-type");return}if(Lu()){Ro(e===xt.NONE,n,"unsupported-persistence-type");return}if(Jd()){Ro(e===xt.NONE||e===xt.LOCAL&&mi(),n,"unsupported-persistence-type");return}Ro(e===xt.NONE||eI(),n,"unsupported-persistence-type")}function Lh(n){return p(this,null,function*(){yield n._initializationPromise;const e=rI(),t=ui(nI,n.config.apiKey,n.name);e&&e.setItem(t,n._getPersistenceType())})}function bk(n,e){const t=rI();if(!t)return[];const r=ui(nI,n,e);switch(t.getItem(r)){case xt.NONE:return[ds];case xt.LOCAL:return[pa,gi];case xt.SESSION:return[gi];default:return[]}}function rI(){var n;try{return((n=vk())==null?void 0:n.sessionStorage)||null}catch(e){return null}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Rk=M;class fr{constructor(){this.browserResolver=Ot(qC),this.cordovaResolver=Ot(dk),this.underlyingResolver=null,this._redirectPersistence=gi,this._completeRedirectFn=Qu,this._overrideRedirectResult=Hd}_initialize(e){return p(this,null,function*(){return yield this.selectUnderlyingResolver(),this.assertedUnderlyingResolver._initialize(e)})}_openPopup(e,t,r,i){return p(this,null,function*(){return yield this.selectUnderlyingResolver(),this.assertedUnderlyingResolver._openPopup(e,t,r,i)})}_openRedirect(e,t,r,i){return p(this,null,function*(){return yield this.selectUnderlyingResolver(),this.assertedUnderlyingResolver._openRedirect(e,t,r,i)})}_isIframeWebStorageSupported(e,t){this.assertedUnderlyingResolver._isIframeWebStorageSupported(e,t)}_originValidation(e){return this.assertedUnderlyingResolver._originValidation(e)}get _shouldInitProactively(){return tI()||this.browserResolver._shouldInitProactively}get assertedUnderlyingResolver(){return Rk(this.underlyingResolver,"internal-error"),this.underlyingResolver}selectUnderlyingResolver(){return p(this,null,function*(){if(this.underlyingResolver)return;const e=yield Ek();this.underlyingResolver=e?this.cordovaResolver:this.browserResolver})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function iI(n){return n.unwrap()}function Sk(n){return n.wrapped()}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Pk(n){return sI(n)}function Ck(n,e){var r;const t=(r=e.customData)==null?void 0:r._tokenResponse;if((e==null?void 0:e.code)==="auth/multi-factor-auth-required"){const i=e;i.resolver=new kk(n,TP(n,e))}else if(t){const i=sI(e),s=e;i&&(s.credential=i,s.tenantId=t.tenantId||void 0,s.email=t.email||void 0,s.phoneNumber=t.phoneNumber||void 0)}}function sI(n){const{_tokenResponse:e}=n instanceof Fe?n.customData:n;if(!e)return null;if(!(n instanceof Fe)&&"temporaryProof"in e&&"phoneNumber"in e)return _i.credentialFromResult(n);const t=e.providerId;if(!t||t===Ao.PASSWORD)return null;let r;switch(t){case Ao.GOOGLE:r=on;break;case Ao.FACEBOOK:r=sn;break;case Ao.GITHUB:r=an;break;case Ao.TWITTER:r=cn;break;default:const{oauthIdToken:i,oauthAccessToken:s,oauthTokenSecret:o,pendingToken:a,nonce:u}=e;return!s&&!o&&!i&&!a?null:a?t.startsWith("saml.")?fs._create(t,a):Tn._fromParams({providerId:t,signInMethod:t,pendingToken:a,idToken:i,accessToken:s}):new is(t).credential({idToken:i,accessToken:s,rawNonce:u})}return n instanceof Fe?r.credentialFromError(n):r.credentialFromResult(n)}function vt(n,e){return e.catch(t=>{throw t instanceof Fe&&Ck(n,t),t}).then(t=>{const r=t.operationType,i=t.user;return{operationType:r,credential:Pk(t),additionalUserInfo:IP(t),user:Ju.getOrCreate(i)}})}function Mh(n,e){return p(this,null,function*(){const t=yield e;return{verificationId:t.verificationId,confirm:r=>vt(n,t.confirm(r))}})}class kk{constructor(e,t){this.resolver=t,this.auth=Sk(e)}get session(){return this.resolver.session}get hints(){return this.resolver.hints}resolveSignIn(e){return vt(iI(this.auth),this.resolver.resolveSignIn(e))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Ju=class Mo{constructor(e){this._delegate=e,this.multiFactor=AP(e)}static getOrCreate(e){return Mo.USER_MAP.has(e)||Mo.USER_MAP.set(e,new Mo(e)),Mo.USER_MAP.get(e)}delete(){return this._delegate.delete()}reload(){return this._delegate.reload()}toJSON(){return this._delegate.toJSON()}getIdTokenResult(e){return this._delegate.getIdTokenResult(e)}getIdToken(e){return this._delegate.getIdToken(e)}linkAndRetrieveDataWithCredential(e){return this.linkWithCredential(e)}linkWithCredential(e){return p(this,null,function*(){return vt(this.auth,xw(this._delegate,e))})}linkWithPhoneNumber(e,t){return p(this,null,function*(){return Mh(this.auth,WP(this._delegate,e,t))})}linkWithPopup(e){return p(this,null,function*(){return vt(this.auth,nC(this._delegate,e,fr))})}linkWithRedirect(e){return p(this,null,function*(){return yield Lh(Ae(this.auth)),lC(this._delegate,e,fr)})}reauthenticateAndRetrieveDataWithCredential(e){return this.reauthenticateWithCredential(e)}reauthenticateWithCredential(e){return p(this,null,function*(){return vt(this.auth,Ow(this._delegate,e))})}reauthenticateWithPhoneNumber(e,t){return Mh(this.auth,HP(this._delegate,e,t))}reauthenticateWithPopup(e){return vt(this.auth,tC(this._delegate,e,fr))}reauthenticateWithRedirect(e){return p(this,null,function*(){return yield Lh(Ae(this.auth)),cC(this._delegate,e,fr)})}sendEmailVerification(e){return uP(this._delegate,e)}unlink(e){return p(this,null,function*(){return yield QS(this._delegate,e),this})}updateEmail(e){return fP(this._delegate,e)}updatePassword(e){return pP(this._delegate,e)}updatePhoneNumber(e){return QP(this._delegate,e)}updateProfile(e){return dP(this._delegate,e)}verifyBeforeUpdateEmail(e,t){return lP(this._delegate,e,t)}get emailVerified(){return this._delegate.emailVerified}get isAnonymous(){return this._delegate.isAnonymous}get metadata(){return this._delegate.metadata}get phoneNumber(){return this._delegate.phoneNumber}get providerData(){return this._delegate.providerData}get refreshToken(){return this._delegate.refreshToken}get tenantId(){return this._delegate.tenantId}get displayName(){return this._delegate.displayName}get email(){return this._delegate.email}get photoURL(){return this._delegate.photoURL}get providerId(){return this._delegate.providerId}get uid(){return this._delegate.uid}get auth(){return this._delegate.auth}};Ju.USER_MAP=new WeakMap;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const So=M;class Fh{constructor(e,t){if(this.app=e,t.isInitialized()){this._delegate=t.getImmediate(),this.linkUnderlyingAuth();return}const{apiKey:r}=e.options;So(r,"invalid-api-key",{appName:e.name}),So(r,"invalid-api-key",{appName:e.name});const i=typeof window!="undefined"?fr:void 0;this._delegate=t.initialize({options:{persistence:Nk(r,e.name),popupRedirectResolver:i}}),this._delegate._updateErrorMap(UR),this.linkUnderlyingAuth()}get emulatorConfig(){return this._delegate.emulatorConfig}get currentUser(){return this._delegate.currentUser?Ju.getOrCreate(this._delegate.currentUser):null}get languageCode(){return this._delegate.languageCode}set languageCode(e){this._delegate.languageCode=e}get settings(){return this._delegate.settings}get tenantId(){return this._delegate.tenantId}set tenantId(e){this._delegate.tenantId=e}useDeviceLanguage(){this._delegate.useDeviceLanguage()}signOut(){return this._delegate.signOut()}useEmulator(e,t){RS(this._delegate,e,t)}applyActionCode(e){return eP(this._delegate,e)}checkActionCode(e){return Lw(this._delegate,e)}confirmPasswordReset(e,t){return ZS(this._delegate,e,t)}createUserWithEmailAndPassword(e,t){return p(this,null,function*(){return vt(this._delegate,nP(this._delegate,e,t))})}fetchProvidersForEmail(e){return this.fetchSignInMethodsForEmail(e)}fetchSignInMethodsForEmail(e){return cP(this._delegate,e)}isSignInWithEmailLink(e){return sP(this._delegate,e)}getRedirectResult(){return p(this,null,function*(){So(hh(),this._delegate,"operation-not-supported-in-this-environment");const e=yield dC(this._delegate,fr);return e?vt(this._delegate,Promise.resolve(e)):{credential:null,user:null}})}addFrameworkForLogging(e){fk(this._delegate,e)}onAuthStateChanged(e,t,r){const{next:i,error:s,complete:o}=Sg(e,t,r);return this._delegate.onAuthStateChanged(i,s,o)}onIdTokenChanged(e,t,r){const{next:i,error:s,complete:o}=Sg(e,t,r);return this._delegate.onIdTokenChanged(i,s,o)}sendSignInLinkToEmail(e,t){return iP(this._delegate,e,t)}sendPasswordResetEmail(e,t){return XS(this._delegate,e,t||void 0)}setPersistence(e){return p(this,null,function*(){Ak(this._delegate,e);let t;switch(e){case xt.SESSION:t=gi;break;case xt.LOCAL:t=(yield Ot(pa)._isAvailable())?pa:jd;break;case xt.NONE:t=ds;break;default:return et("argument-error",{appName:this._delegate.name})}return this._delegate.setPersistence(t)})}signInAndRetrieveDataWithCredential(e){return this.signInWithCredential(e)}signInAnonymously(){return vt(this._delegate,HS(this._delegate))}signInWithCredential(e){return vt(this._delegate,zu(this._delegate,e))}signInWithCustomToken(e){return vt(this._delegate,YS(this._delegate,e))}signInWithEmailAndPassword(e,t){return vt(this._delegate,rP(this._delegate,e,t))}signInWithEmailLink(e,t){return vt(this._delegate,oP(this._delegate,e,t))}signInWithPhoneNumber(e,t){return Mh(this._delegate,GP(this._delegate,e,t))}signInWithPopup(e){return p(this,null,function*(){return So(hh(),this._delegate,"operation-not-supported-in-this-environment"),vt(this._delegate,eC(this._delegate,e,fr))})}signInWithRedirect(e){return p(this,null,function*(){return So(hh(),this._delegate,"operation-not-supported-in-this-environment"),yield Lh(this._delegate),oC(this._delegate,e,fr)})}updateCurrentUser(e){return this._delegate.updateCurrentUser(e)}verifyPasswordResetCode(e){return tP(this._delegate,e)}unwrap(){return this._delegate}_delete(){return this._delegate._delete()}linkUnderlyingAuth(){this._delegate.wrapped=()=>this}}Fh.Persistence=xt;function Sg(n,e,t){let r=n;typeof n!="function"&&({next:r,error:e,complete:t}=n);const i=r;return{next:o=>i(o&&Ju.getOrCreate(o)),error:e,complete:t}}function Nk(n,e){const t=bk(n,e);if(typeof self!="undefined"&&!t.includes(pa)&&t.push(pa),typeof window!="undefined")for(const r of[jd,gi])t.includes(r)||t.push(r);return t.includes(ds)||t.push(ds),t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yd{static credential(e,t){return _i.credential(e,t)}constructor(){this.providerId="phone",this._delegate=new _i(iI(Rn.auth()))}verifyPhoneNumber(e,t){return this._delegate.verifyPhoneNumber(e,t)}unwrap(){return this._delegate}}Yd.PHONE_SIGN_IN_METHOD=_i.PHONE_SIGN_IN_METHOD;Yd.PROVIDER_ID=_i.PROVIDER_ID;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Vk=M;class Dk{constructor(e,t,r=Rn.app()){var i;Vk((i=r.options)==null?void 0:i.apiKey,"invalid-api-key",{appName:r.name}),this._delegate=new zP(r.auth(),e,t),this.type=this._delegate.type}clear(){this._delegate.clear()}render(){return this._delegate.render()}verify(){return this._delegate.verify()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xk="auth-compat";function Ok(n){n.INTERNAL.registerComponent(new Be(xk,e=>{const t=e.getProvider("app-compat").getImmediate(),r=e.getProvider("auth");return new Fh(t,r)},"PUBLIC").setServiceProps({ActionCodeInfo:{Operation:{EMAIL_SIGNIN:qi.EMAIL_SIGNIN,PASSWORD_RESET:qi.PASSWORD_RESET,RECOVER_EMAIL:qi.RECOVER_EMAIL,REVERT_SECOND_FACTOR_ADDITION:qi.REVERT_SECOND_FACTOR_ADDITION,VERIFY_AND_CHANGE_EMAIL:qi.VERIFY_AND_CHANGE_EMAIL,VERIFY_EMAIL:qi.VERIFY_EMAIL}},EmailAuthProvider:Or,FacebookAuthProvider:sn,GithubAuthProvider:an,GoogleAuthProvider:on,OAuthProvider:is,SAMLAuthProvider:ou,PhoneAuthProvider:Yd,PhoneMultiFactorGenerator:Xw,RecaptchaVerifier:Dk,TwitterAuthProvider:cn,Auth:Fh,AuthCredential:Bs,Error:Fe}).setInstantiationMode("LAZY").setMultipleInstances(!1)),n.registerVersion(pk,mk)}Ok(Rn);var Pg=typeof globalThis!="undefined"?globalThis:typeof window!="undefined"?window:typeof global!="undefined"?global:typeof self!="undefined"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var yr,oI;(function(){var n;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(E,y){function T(){}T.prototype=y.prototype,E.F=y.prototype,E.prototype=new T,E.prototype.constructor=E,E.D=function(b,A,C){for(var I=Array(arguments.length-2),Et=2;Et<arguments.length;Et++)I[Et-2]=arguments[Et];return y.prototype[A].apply(b,I)}}function t(){this.blockSize=-1}function r(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.C=Array(this.blockSize),this.o=this.h=0,this.u()}e(r,t),r.prototype.u=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function i(E,y,T){T||(T=0);const b=Array(16);if(typeof y=="string")for(var A=0;A<16;++A)b[A]=y.charCodeAt(T++)|y.charCodeAt(T++)<<8|y.charCodeAt(T++)<<16|y.charCodeAt(T++)<<24;else for(A=0;A<16;++A)b[A]=y[T++]|y[T++]<<8|y[T++]<<16|y[T++]<<24;y=E.g[0],T=E.g[1],A=E.g[2];let C=E.g[3],I;I=y+(C^T&(A^C))+b[0]+3614090360&4294967295,y=T+(I<<7&4294967295|I>>>25),I=C+(A^y&(T^A))+b[1]+3905402710&4294967295,C=y+(I<<12&4294967295|I>>>20),I=A+(T^C&(y^T))+b[2]+606105819&4294967295,A=C+(I<<17&4294967295|I>>>15),I=T+(y^A&(C^y))+b[3]+3250441966&4294967295,T=A+(I<<22&4294967295|I>>>10),I=y+(C^T&(A^C))+b[4]+4118548399&4294967295,y=T+(I<<7&4294967295|I>>>25),I=C+(A^y&(T^A))+b[5]+1200080426&4294967295,C=y+(I<<12&4294967295|I>>>20),I=A+(T^C&(y^T))+b[6]+2821735955&4294967295,A=C+(I<<17&4294967295|I>>>15),I=T+(y^A&(C^y))+b[7]+4249261313&4294967295,T=A+(I<<22&4294967295|I>>>10),I=y+(C^T&(A^C))+b[8]+1770035416&4294967295,y=T+(I<<7&4294967295|I>>>25),I=C+(A^y&(T^A))+b[9]+2336552879&4294967295,C=y+(I<<12&4294967295|I>>>20),I=A+(T^C&(y^T))+b[10]+4294925233&4294967295,A=C+(I<<17&4294967295|I>>>15),I=T+(y^A&(C^y))+b[11]+2304563134&4294967295,T=A+(I<<22&4294967295|I>>>10),I=y+(C^T&(A^C))+b[12]+1804603682&4294967295,y=T+(I<<7&4294967295|I>>>25),I=C+(A^y&(T^A))+b[13]+4254626195&4294967295,C=y+(I<<12&4294967295|I>>>20),I=A+(T^C&(y^T))+b[14]+2792965006&4294967295,A=C+(I<<17&4294967295|I>>>15),I=T+(y^A&(C^y))+b[15]+1236535329&4294967295,T=A+(I<<22&4294967295|I>>>10),I=y+(A^C&(T^A))+b[1]+4129170786&4294967295,y=T+(I<<5&4294967295|I>>>27),I=C+(T^A&(y^T))+b[6]+3225465664&4294967295,C=y+(I<<9&4294967295|I>>>23),I=A+(y^T&(C^y))+b[11]+643717713&4294967295,A=C+(I<<14&4294967295|I>>>18),I=T+(C^y&(A^C))+b[0]+3921069994&4294967295,T=A+(I<<20&4294967295|I>>>12),I=y+(A^C&(T^A))+b[5]+3593408605&4294967295,y=T+(I<<5&4294967295|I>>>27),I=C+(T^A&(y^T))+b[10]+38016083&4294967295,C=y+(I<<9&4294967295|I>>>23),I=A+(y^T&(C^y))+b[15]+3634488961&4294967295,A=C+(I<<14&4294967295|I>>>18),I=T+(C^y&(A^C))+b[4]+3889429448&4294967295,T=A+(I<<20&4294967295|I>>>12),I=y+(A^C&(T^A))+b[9]+568446438&4294967295,y=T+(I<<5&4294967295|I>>>27),I=C+(T^A&(y^T))+b[14]+3275163606&4294967295,C=y+(I<<9&4294967295|I>>>23),I=A+(y^T&(C^y))+b[3]+4107603335&4294967295,A=C+(I<<14&4294967295|I>>>18),I=T+(C^y&(A^C))+b[8]+1163531501&4294967295,T=A+(I<<20&4294967295|I>>>12),I=y+(A^C&(T^A))+b[13]+2850285829&4294967295,y=T+(I<<5&4294967295|I>>>27),I=C+(T^A&(y^T))+b[2]+4243563512&4294967295,C=y+(I<<9&4294967295|I>>>23),I=A+(y^T&(C^y))+b[7]+1735328473&4294967295,A=C+(I<<14&4294967295|I>>>18),I=T+(C^y&(A^C))+b[12]+2368359562&4294967295,T=A+(I<<20&4294967295|I>>>12),I=y+(T^A^C)+b[5]+4294588738&4294967295,y=T+(I<<4&4294967295|I>>>28),I=C+(y^T^A)+b[8]+2272392833&4294967295,C=y+(I<<11&4294967295|I>>>21),I=A+(C^y^T)+b[11]+1839030562&4294967295,A=C+(I<<16&4294967295|I>>>16),I=T+(A^C^y)+b[14]+4259657740&4294967295,T=A+(I<<23&4294967295|I>>>9),I=y+(T^A^C)+b[1]+2763975236&4294967295,y=T+(I<<4&4294967295|I>>>28),I=C+(y^T^A)+b[4]+1272893353&4294967295,C=y+(I<<11&4294967295|I>>>21),I=A+(C^y^T)+b[7]+4139469664&4294967295,A=C+(I<<16&4294967295|I>>>16),I=T+(A^C^y)+b[10]+3200236656&4294967295,T=A+(I<<23&4294967295|I>>>9),I=y+(T^A^C)+b[13]+681279174&4294967295,y=T+(I<<4&4294967295|I>>>28),I=C+(y^T^A)+b[0]+3936430074&4294967295,C=y+(I<<11&4294967295|I>>>21),I=A+(C^y^T)+b[3]+3572445317&4294967295,A=C+(I<<16&4294967295|I>>>16),I=T+(A^C^y)+b[6]+76029189&4294967295,T=A+(I<<23&4294967295|I>>>9),I=y+(T^A^C)+b[9]+3654602809&4294967295,y=T+(I<<4&4294967295|I>>>28),I=C+(y^T^A)+b[12]+3873151461&4294967295,C=y+(I<<11&4294967295|I>>>21),I=A+(C^y^T)+b[15]+530742520&4294967295,A=C+(I<<16&4294967295|I>>>16),I=T+(A^C^y)+b[2]+3299628645&4294967295,T=A+(I<<23&4294967295|I>>>9),I=y+(A^(T|~C))+b[0]+4096336452&4294967295,y=T+(I<<6&4294967295|I>>>26),I=C+(T^(y|~A))+b[7]+1126891415&4294967295,C=y+(I<<10&4294967295|I>>>22),I=A+(y^(C|~T))+b[14]+2878612391&4294967295,A=C+(I<<15&4294967295|I>>>17),I=T+(C^(A|~y))+b[5]+4237533241&4294967295,T=A+(I<<21&4294967295|I>>>11),I=y+(A^(T|~C))+b[12]+1700485571&4294967295,y=T+(I<<6&4294967295|I>>>26),I=C+(T^(y|~A))+b[3]+2399980690&4294967295,C=y+(I<<10&4294967295|I>>>22),I=A+(y^(C|~T))+b[10]+4293915773&4294967295,A=C+(I<<15&4294967295|I>>>17),I=T+(C^(A|~y))+b[1]+2240044497&4294967295,T=A+(I<<21&4294967295|I>>>11),I=y+(A^(T|~C))+b[8]+1873313359&4294967295,y=T+(I<<6&4294967295|I>>>26),I=C+(T^(y|~A))+b[15]+4264355552&4294967295,C=y+(I<<10&4294967295|I>>>22),I=A+(y^(C|~T))+b[6]+2734768916&4294967295,A=C+(I<<15&4294967295|I>>>17),I=T+(C^(A|~y))+b[13]+1309151649&4294967295,T=A+(I<<21&4294967295|I>>>11),I=y+(A^(T|~C))+b[4]+4149444226&4294967295,y=T+(I<<6&4294967295|I>>>26),I=C+(T^(y|~A))+b[11]+3174756917&4294967295,C=y+(I<<10&4294967295|I>>>22),I=A+(y^(C|~T))+b[2]+718787259&4294967295,A=C+(I<<15&4294967295|I>>>17),I=T+(C^(A|~y))+b[9]+3951481745&4294967295,E.g[0]=E.g[0]+y&4294967295,E.g[1]=E.g[1]+(A+(I<<21&4294967295|I>>>11))&4294967295,E.g[2]=E.g[2]+A&4294967295,E.g[3]=E.g[3]+C&4294967295}r.prototype.v=function(E,y){y===void 0&&(y=E.length);const T=y-this.blockSize,b=this.C;let A=this.h,C=0;for(;C<y;){if(A==0)for(;C<=T;)i(this,E,C),C+=this.blockSize;if(typeof E=="string"){for(;C<y;)if(b[A++]=E.charCodeAt(C++),A==this.blockSize){i(this,b),A=0;break}}else for(;C<y;)if(b[A++]=E[C++],A==this.blockSize){i(this,b),A=0;break}}this.h=A,this.o+=y},r.prototype.A=function(){var E=Array((this.h<56?this.blockSize:this.blockSize*2)-this.h);E[0]=128;for(var y=1;y<E.length-8;++y)E[y]=0;y=this.o*8;for(var T=E.length-8;T<E.length;++T)E[T]=y&255,y/=256;for(this.v(E),E=Array(16),y=0,T=0;T<4;++T)for(let b=0;b<32;b+=8)E[y++]=this.g[T]>>>b&255;return E};function s(E,y){var T=a;return Object.prototype.hasOwnProperty.call(T,E)?T[E]:T[E]=y(E)}function o(E,y){this.h=y;const T=[];let b=!0;for(let A=E.length-1;A>=0;A--){const C=E[A]|0;b&&C==y||(T[A]=C,b=!1)}this.g=T}var a={};function u(E){return-128<=E&&E<128?s(E,function(y){return new o([y|0],y<0?-1:0)}):new o([E|0],E<0?-1:0)}function l(E){if(isNaN(E)||!isFinite(E))return f;if(E<0)return x(l(-E));const y=[];let T=1;for(let b=0;E>=T;b++)y[b]=E/T|0,T*=4294967296;return new o(y,0)}function h(E,y){if(E.length==0)throw Error("number format error: empty string");if(y=y||10,y<2||36<y)throw Error("radix out of range: "+y);if(E.charAt(0)=="-")return x(h(E.substring(1),y));if(E.indexOf("-")>=0)throw Error('number format error: interior "-" character');const T=l(Math.pow(y,8));let b=f;for(let C=0;C<E.length;C+=8){var A=Math.min(8,E.length-C);const I=parseInt(E.substring(C,C+A),y);A<8?(A=l(Math.pow(y,A)),b=b.j(A).add(l(I))):(b=b.j(T),b=b.add(l(I)))}return b}var f=u(0),g=u(1),w=u(16777216);n=o.prototype,n.m=function(){if(D(this))return-x(this).m();let E=0,y=1;for(let T=0;T<this.g.length;T++){const b=this.i(T);E+=(b>=0?b:4294967296+b)*y,y*=4294967296}return E},n.toString=function(E){if(E=E||10,E<2||36<E)throw Error("radix out of range: "+E);if(S(this))return"0";if(D(this))return"-"+x(this).toString(E);const y=l(Math.pow(E,6));var T=this;let b="";for(;;){const A=X(T,y).g;T=W(T,A.j(y));let C=((T.g.length>0?T.g[0]:T.h)>>>0).toString(E);if(T=A,S(T))return C+b;for(;C.length<6;)C="0"+C;b=C+b}},n.i=function(E){return E<0?0:E<this.g.length?this.g[E]:this.h};function S(E){if(E.h!=0)return!1;for(let y=0;y<E.g.length;y++)if(E.g[y]!=0)return!1;return!0}function D(E){return E.h==-1}n.l=function(E){return E=W(this,E),D(E)?-1:S(E)?0:1};function x(E){const y=E.g.length,T=[];for(let b=0;b<y;b++)T[b]=~E.g[b];return new o(T,~E.h).add(g)}n.abs=function(){return D(this)?x(this):this},n.add=function(E){const y=Math.max(this.g.length,E.g.length),T=[];let b=0;for(let A=0;A<=y;A++){let C=b+(this.i(A)&65535)+(E.i(A)&65535),I=(C>>>16)+(this.i(A)>>>16)+(E.i(A)>>>16);b=I>>>16,C&=65535,I&=65535,T[A]=I<<16|C}return new o(T,T[T.length-1]&-2147483648?-1:0)};function W(E,y){return E.add(x(y))}n.j=function(E){if(S(this)||S(E))return f;if(D(this))return D(E)?x(this).j(x(E)):x(x(this).j(E));if(D(E))return x(this.j(x(E)));if(this.l(w)<0&&E.l(w)<0)return l(this.m()*E.m());const y=this.g.length+E.g.length,T=[];for(var b=0;b<2*y;b++)T[b]=0;for(b=0;b<this.g.length;b++)for(let A=0;A<E.g.length;A++){const C=this.i(b)>>>16,I=this.i(b)&65535,Et=E.i(A)>>>16,$r=E.i(A)&65535;T[2*b+2*A]+=I*$r,Q(T,2*b+2*A),T[2*b+2*A+1]+=C*$r,Q(T,2*b+2*A+1),T[2*b+2*A+1]+=I*Et,Q(T,2*b+2*A+1),T[2*b+2*A+2]+=C*Et,Q(T,2*b+2*A+2)}for(E=0;E<y;E++)T[E]=T[2*E+1]<<16|T[2*E];for(E=y;E<2*y;E++)T[E]=0;return new o(T,0)};function Q(E,y){for(;(E[y]&65535)!=E[y];)E[y+1]+=E[y]>>>16,E[y]&=65535,y++}function K(E,y){this.g=E,this.h=y}function X(E,y){if(S(y))throw Error("division by zero");if(S(E))return new K(f,f);if(D(E))return y=X(x(E),y),new K(x(y.g),x(y.h));if(D(y))return y=X(E,x(y)),new K(x(y.g),y.h);if(E.g.length>30){if(D(E)||D(y))throw Error("slowDivide_ only works with positive integers.");for(var T=g,b=y;b.l(E)<=0;)T=ee(T),b=ee(b);var A=ne(T,1),C=ne(b,1);for(b=ne(b,2),T=ne(T,2);!S(b);){var I=C.add(b);I.l(E)<=0&&(A=A.add(T),C=I),b=ne(b,1),T=ne(T,1)}return y=W(E,A.j(y)),new K(A,y)}for(A=f;E.l(y)>=0;){for(T=Math.max(1,Math.floor(E.m()/y.m())),b=Math.ceil(Math.log(T)/Math.LN2),b=b<=48?1:Math.pow(2,b-48),C=l(T),I=C.j(y);D(I)||I.l(E)>0;)T-=b,C=l(T),I=C.j(y);S(C)&&(C=g),A=A.add(C),E=W(E,I)}return new K(A,E)}n.B=function(E){return X(this,E).h},n.and=function(E){const y=Math.max(this.g.length,E.g.length),T=[];for(let b=0;b<y;b++)T[b]=this.i(b)&E.i(b);return new o(T,this.h&E.h)},n.or=function(E){const y=Math.max(this.g.length,E.g.length),T=[];for(let b=0;b<y;b++)T[b]=this.i(b)|E.i(b);return new o(T,this.h|E.h)},n.xor=function(E){const y=Math.max(this.g.length,E.g.length),T=[];for(let b=0;b<y;b++)T[b]=this.i(b)^E.i(b);return new o(T,this.h^E.h)};function ee(E){const y=E.g.length+1,T=[];for(let b=0;b<y;b++)T[b]=E.i(b)<<1|E.i(b-1)>>>31;return new o(T,E.h)}function ne(E,y){const T=y>>5;y%=32;const b=E.g.length-T,A=[];for(let C=0;C<b;C++)A[C]=y>0?E.i(C+T)>>>y|E.i(C+T+1)<<32-y:E.i(C+T);return new o(A,E.h)}r.prototype.digest=r.prototype.A,r.prototype.reset=r.prototype.u,r.prototype.update=r.prototype.v,oI=r,o.prototype.add=o.prototype.add,o.prototype.multiply=o.prototype.j,o.prototype.modulo=o.prototype.B,o.prototype.compare=o.prototype.l,o.prototype.toNumber=o.prototype.m,o.prototype.toString=o.prototype.toString,o.prototype.getBits=o.prototype.i,o.fromNumber=l,o.fromString=h,yr=o}).apply(typeof Pg!="undefined"?Pg:typeof self!="undefined"?self:typeof window!="undefined"?window:{});var Pc=typeof globalThis!="undefined"?globalThis:typeof window!="undefined"?window:typeof global!="undefined"?global:typeof self!="undefined"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var aI,Fo,cI,zc,Uh,uI,lI,hI;(function(){var n,e=Object.defineProperty;function t(c){c=[typeof globalThis=="object"&&globalThis,c,typeof window=="object"&&window,typeof self=="object"&&self,typeof Pc=="object"&&Pc];for(var d=0;d<c.length;++d){var m=c[d];if(m&&m.Math==Math)return m}throw Error("Cannot find global object")}var r=t(this);function i(c,d){if(d)e:{var m=r;c=c.split(".");for(var _=0;_<c.length-1;_++){var P=c[_];if(!(P in m))break e;m=m[P]}c=c[c.length-1],_=m[c],d=d(_),d!=_&&d!=null&&e(m,c,{configurable:!0,writable:!0,value:d})}}i("Symbol.dispose",function(c){return c||Symbol("Symbol.dispose")}),i("Array.prototype.values",function(c){return c||function(){return this[Symbol.iterator]()}}),i("Object.entries",function(c){return c||function(d){var m=[],_;for(_ in d)Object.prototype.hasOwnProperty.call(d,_)&&m.push([_,d[_]]);return m}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var s=s||{},o=this||self;function a(c){var d=typeof c;return d=="object"&&c!=null||d=="function"}function u(c,d,m){return c.call.apply(c.bind,arguments)}function l(c,d,m){return l=u,l.apply(null,arguments)}function h(c,d){var m=Array.prototype.slice.call(arguments,1);return function(){var _=m.slice();return _.push.apply(_,arguments),c.apply(this,_)}}function f(c,d){function m(){}m.prototype=d.prototype,c.Z=d.prototype,c.prototype=new m,c.prototype.constructor=c,c.Ob=function(_,P,N){for(var q=Array(arguments.length-2),re=2;re<arguments.length;re++)q[re-2]=arguments[re];return d.prototype[P].apply(_,q)}}var g=typeof AsyncContext!="undefined"&&typeof AsyncContext.Snapshot=="function"?c=>c&&AsyncContext.Snapshot.wrap(c):c=>c;function w(c){const d=c.length;if(d>0){const m=Array(d);for(let _=0;_<d;_++)m[_]=c[_];return m}return[]}function S(c,d){for(let _=1;_<arguments.length;_++){const P=arguments[_];var m=typeof P;if(m=m!="object"?m:P?Array.isArray(P)?"array":m:"null",m=="array"||m=="object"&&typeof P.length=="number"){m=c.length||0;const N=P.length||0;c.length=m+N;for(let q=0;q<N;q++)c[m+q]=P[q]}else c.push(P)}}class D{constructor(d,m){this.i=d,this.j=m,this.h=0,this.g=null}get(){let d;return this.h>0?(this.h--,d=this.g,this.g=d.next,d.next=null):d=this.i(),d}}function x(c){o.setTimeout(()=>{throw c},0)}function W(){var c=E;let d=null;return c.g&&(d=c.g,c.g=c.g.next,c.g||(c.h=null),d.next=null),d}class Q{constructor(){this.h=this.g=null}add(d,m){const _=K.get();_.set(d,m),this.h?this.h.next=_:this.g=_,this.h=_}}var K=new D(()=>new X,c=>c.reset());class X{constructor(){this.next=this.g=this.h=null}set(d,m){this.h=d,this.g=m,this.next=null}reset(){this.next=this.g=this.h=null}}let ee,ne=!1,E=new Q,y=()=>{const c=Promise.resolve(void 0);ee=()=>{c.then(T)}};function T(){for(var c;c=W();){try{c.h.call(c.g)}catch(m){x(m)}var d=K;d.j(c),d.h<100&&(d.h++,c.next=d.g,d.g=c)}ne=!1}function b(){this.u=this.u,this.C=this.C}b.prototype.u=!1,b.prototype.dispose=function(){this.u||(this.u=!0,this.N())},b.prototype[Symbol.dispose]=function(){this.dispose()},b.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function A(c,d){this.type=c,this.g=this.target=d,this.defaultPrevented=!1}A.prototype.h=function(){this.defaultPrevented=!0};var C=function(){if(!o.addEventListener||!Object.defineProperty)return!1;var c=!1,d=Object.defineProperty({},"passive",{get:function(){c=!0}});try{const m=()=>{};o.addEventListener("test",m,d),o.removeEventListener("test",m,d)}catch(m){}return c}();function I(c){return/^[\s\xa0]*$/.test(c)}function Et(c,d){A.call(this,c?c.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,c&&this.init(c,d)}f(Et,A),Et.prototype.init=function(c,d){const m=this.type=c.type,_=c.changedTouches&&c.changedTouches.length?c.changedTouches[0]:null;this.target=c.target||c.srcElement,this.g=d,d=c.relatedTarget,d||(m=="mouseover"?d=c.fromElement:m=="mouseout"&&(d=c.toElement)),this.relatedTarget=d,_?(this.clientX=_.clientX!==void 0?_.clientX:_.pageX,this.clientY=_.clientY!==void 0?_.clientY:_.pageY,this.screenX=_.screenX||0,this.screenY=_.screenY||0):(this.clientX=c.clientX!==void 0?c.clientX:c.pageX,this.clientY=c.clientY!==void 0?c.clientY:c.pageY,this.screenX=c.screenX||0,this.screenY=c.screenY||0),this.button=c.button,this.key=c.key||"",this.ctrlKey=c.ctrlKey,this.altKey=c.altKey,this.shiftKey=c.shiftKey,this.metaKey=c.metaKey,this.pointerId=c.pointerId||0,this.pointerType=c.pointerType,this.state=c.state,this.i=c,c.defaultPrevented&&Et.Z.h.call(this)},Et.prototype.h=function(){Et.Z.h.call(this);const c=this.i;c.preventDefault?c.preventDefault():c.returnValue=!1};var $r="closure_listenable_"+(Math.random()*1e6|0),bA=0;function RA(c,d,m,_,P){this.listener=c,this.proxy=null,this.src=d,this.type=m,this.capture=!!_,this.ha=P,this.key=++bA,this.da=this.fa=!1}function hc(c){c.da=!0,c.listener=null,c.proxy=null,c.src=null,c.ha=null}function dc(c,d,m){for(const _ in c)d.call(m,c[_],_,c)}function SA(c,d){for(const m in c)d.call(void 0,c[m],m,c)}function Gp(c){const d={};for(const m in c)d[m]=c[m];return d}const Wp="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function Hp(c,d){let m,_;for(let P=1;P<arguments.length;P++){_=arguments[P];for(m in _)c[m]=_[m];for(let N=0;N<Wp.length;N++)m=Wp[N],Object.prototype.hasOwnProperty.call(_,m)&&(c[m]=_[m])}}function fc(c){this.src=c,this.g={},this.h=0}fc.prototype.add=function(c,d,m,_,P){const N=c.toString();c=this.g[N],c||(c=this.g[N]=[],this.h++);const q=Ol(c,d,_,P);return q>-1?(d=c[q],m||(d.fa=!1)):(d=new RA(d,this.src,N,!!_,P),d.fa=m,c.push(d)),d};function xl(c,d){const m=d.type;if(m in c.g){var _=c.g[m],P=Array.prototype.indexOf.call(_,d,void 0),N;(N=P>=0)&&Array.prototype.splice.call(_,P,1),N&&(hc(d),c.g[m].length==0&&(delete c.g[m],c.h--))}}function Ol(c,d,m,_){for(let P=0;P<c.length;++P){const N=c[P];if(!N.da&&N.listener==d&&N.capture==!!m&&N.ha==_)return P}return-1}var Ll="closure_lm_"+(Math.random()*1e6|0),Ml={};function Qp(c,d,m,_,P){if(Array.isArray(d)){for(let N=0;N<d.length;N++)Qp(c,d[N],m,_,P);return null}return m=Xp(m),c&&c[$r]?c.J(d,m,a(_)?!!_.capture:!1,P):PA(c,d,m,!1,_,P)}function PA(c,d,m,_,P,N){if(!d)throw Error("Invalid event type");const q=a(P)?!!P.capture:!!P;let re=Ul(c);if(re||(c[Ll]=re=new fc(c)),m=re.add(d,m,_,q,N),m.proxy)return m;if(_=CA(),m.proxy=_,_.src=c,_.listener=m,c.addEventListener)C||(P=q),P===void 0&&(P=!1),c.addEventListener(d.toString(),_,P);else if(c.attachEvent)c.attachEvent(Yp(d.toString()),_);else if(c.addListener&&c.removeListener)c.addListener(_);else throw Error("addEventListener and attachEvent are unavailable.");return m}function CA(){function c(m){return d.call(c.src,c.listener,m)}const d=kA;return c}function Jp(c,d,m,_,P){if(Array.isArray(d))for(var N=0;N<d.length;N++)Jp(c,d[N],m,_,P);else _=a(_)?!!_.capture:!!_,m=Xp(m),c&&c[$r]?(c=c.i,N=String(d).toString(),N in c.g&&(d=c.g[N],m=Ol(d,m,_,P),m>-1&&(hc(d[m]),Array.prototype.splice.call(d,m,1),d.length==0&&(delete c.g[N],c.h--)))):c&&(c=Ul(c))&&(d=c.g[d.toString()],c=-1,d&&(c=Ol(d,m,_,P)),(m=c>-1?d[c]:null)&&Fl(m))}function Fl(c){if(typeof c!="number"&&c&&!c.da){var d=c.src;if(d&&d[$r])xl(d.i,c);else{var m=c.type,_=c.proxy;d.removeEventListener?d.removeEventListener(m,_,c.capture):d.detachEvent?d.detachEvent(Yp(m),_):d.addListener&&d.removeListener&&d.removeListener(_),(m=Ul(d))?(xl(m,c),m.h==0&&(m.src=null,d[Ll]=null)):hc(c)}}}function Yp(c){return c in Ml?Ml[c]:Ml[c]="on"+c}function kA(c,d){if(c.da)c=!0;else{d=new Et(d,this);const m=c.listener,_=c.ha||c.src;c.fa&&Fl(c),c=m.call(_,d)}return c}function Ul(c){return c=c[Ll],c instanceof fc?c:null}var Bl="__closure_events_fn_"+(Math.random()*1e9>>>0);function Xp(c){return typeof c=="function"?c:(c[Bl]||(c[Bl]=function(d){return c.handleEvent(d)}),c[Bl])}function rt(){b.call(this),this.i=new fc(this),this.M=this,this.G=null}f(rt,b),rt.prototype[$r]=!0,rt.prototype.removeEventListener=function(c,d,m,_){Jp(this,c,d,m,_)};function ft(c,d){var m,_=c.G;if(_)for(m=[];_;_=_.G)m.push(_);if(c=c.M,_=d.type||d,typeof d=="string")d=new A(d,c);else if(d instanceof A)d.target=d.target||c;else{var P=d;d=new A(_,c),Hp(d,P)}P=!0;let N,q;if(m)for(q=m.length-1;q>=0;q--)N=d.g=m[q],P=pc(N,_,!0,d)&&P;if(N=d.g=c,P=pc(N,_,!0,d)&&P,P=pc(N,_,!1,d)&&P,m)for(q=0;q<m.length;q++)N=d.g=m[q],P=pc(N,_,!1,d)&&P}rt.prototype.N=function(){if(rt.Z.N.call(this),this.i){var c=this.i;for(const d in c.g){const m=c.g[d];for(let _=0;_<m.length;_++)hc(m[_]);delete c.g[d],c.h--}}this.G=null},rt.prototype.J=function(c,d,m,_){return this.i.add(String(c),d,!1,m,_)},rt.prototype.K=function(c,d,m,_){return this.i.add(String(c),d,!0,m,_)};function pc(c,d,m,_){if(d=c.i.g[String(d)],!d)return!0;d=d.concat();let P=!0;for(let N=0;N<d.length;++N){const q=d[N];if(q&&!q.da&&q.capture==m){const re=q.listener,$e=q.ha||q.src;q.fa&&xl(c.i,q),P=re.call($e,_)!==!1&&P}}return P&&!_.defaultPrevented}function NA(c,d){if(typeof c!="function")if(c&&typeof c.handleEvent=="function")c=l(c.handleEvent,c);else throw Error("Invalid listener argument");return Number(d)>2147483647?-1:o.setTimeout(c,d||0)}function Zp(c){c.g=NA(()=>{c.g=null,c.i&&(c.i=!1,Zp(c))},c.l);const d=c.h;c.h=null,c.m.apply(null,d)}class VA extends b{constructor(d,m){super(),this.m=d,this.l=m,this.h=null,this.i=!1,this.g=null}j(d){this.h=arguments,this.g?this.i=!0:Zp(this)}N(){super.N(),this.g&&(o.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function oo(c){b.call(this),this.h=c,this.g={}}f(oo,b);var em=[];function tm(c){dc(c.g,function(d,m){this.g.hasOwnProperty(m)&&Fl(d)},c),c.g={}}oo.prototype.N=function(){oo.Z.N.call(this),tm(this)},oo.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var ql=o.JSON.stringify,DA=o.JSON.parse,xA=class{stringify(c){return o.JSON.stringify(c,void 0)}parse(c){return o.JSON.parse(c,void 0)}};function nm(){}function rm(){}var ao={OPEN:"a",hb:"b",ERROR:"c",tb:"d"};function $l(){A.call(this,"d")}f($l,A);function jl(){A.call(this,"c")}f(jl,A);var jr={},im=null;function mc(){return im=im||new rt}jr.Ia="serverreachability";function sm(c){A.call(this,jr.Ia,c)}f(sm,A);function co(c){const d=mc();ft(d,new sm(d))}jr.STAT_EVENT="statevent";function om(c,d){A.call(this,jr.STAT_EVENT,c),this.stat=d}f(om,A);function pt(c){const d=mc();ft(d,new om(d,c))}jr.Ja="timingevent";function am(c,d){A.call(this,jr.Ja,c),this.size=d}f(am,A);function uo(c,d){if(typeof c!="function")throw Error("Fn must not be null and must be a function");return o.setTimeout(function(){c()},d)}function lo(){this.g=!0}lo.prototype.ua=function(){this.g=!1};function OA(c,d,m,_,P,N){c.info(function(){if(c.g)if(N){var q="",re=N.split("&");for(let pe=0;pe<re.length;pe++){var $e=re[pe].split("=");if($e.length>1){const Ge=$e[0];$e=$e[1];const tn=Ge.split("_");q=tn.length>=2&&tn[1]=="type"?q+(Ge+"="+$e+"&"):q+(Ge+"=redacted&")}}}else q=null;else q=N;return"XMLHTTP REQ ("+_+") [attempt "+P+"]: "+d+`
`+m+`
`+q})}function LA(c,d,m,_,P,N,q){c.info(function(){return"XMLHTTP RESP ("+_+") [ attempt "+P+"]: "+d+`
`+m+`
`+N+" "+q})}function Fi(c,d,m,_){c.info(function(){return"XMLHTTP TEXT ("+d+"): "+FA(c,m)+(_?" "+_:"")})}function MA(c,d){c.info(function(){return"TIMEOUT: "+d})}lo.prototype.info=function(){};function FA(c,d){if(!c.g)return d;if(!d)return null;try{const N=JSON.parse(d);if(N){for(c=0;c<N.length;c++)if(Array.isArray(N[c])){var m=N[c];if(!(m.length<2)){var _=m[1];if(Array.isArray(_)&&!(_.length<1)){var P=_[0];if(P!="noop"&&P!="stop"&&P!="close")for(let q=1;q<_.length;q++)_[q]=""}}}}return ql(N)}catch(N){return d}}var gc={NO_ERROR:0,cb:1,qb:2,pb:3,kb:4,ob:5,rb:6,Ga:7,TIMEOUT:8,ub:9},cm={ib:"complete",Fb:"success",ERROR:"error",Ga:"abort",xb:"ready",yb:"readystatechange",TIMEOUT:"timeout",sb:"incrementaldata",wb:"progress",lb:"downloadprogress",Nb:"uploadprogress"},um;function zl(){}f(zl,nm),zl.prototype.g=function(){return new XMLHttpRequest},um=new zl;function ho(c){return encodeURIComponent(String(c))}function UA(c){var d=1;c=c.split(":");const m=[];for(;d>0&&c.length;)m.push(c.shift()),d--;return c.length&&m.push(c.join(":")),m}function er(c,d,m,_){this.j=c,this.i=d,this.l=m,this.S=_||1,this.V=new oo(this),this.H=45e3,this.J=null,this.o=!1,this.u=this.B=this.A=this.M=this.F=this.T=this.D=null,this.G=[],this.g=null,this.C=0,this.m=this.v=null,this.X=-1,this.K=!1,this.P=0,this.O=null,this.W=this.L=this.U=this.R=!1,this.h=new lm}function lm(){this.i=null,this.g="",this.h=!1}var hm={},Kl={};function Gl(c,d,m){c.M=1,c.A=yc(en(d)),c.u=m,c.R=!0,dm(c,null)}function dm(c,d){c.F=Date.now(),_c(c),c.B=en(c.A);var m=c.B,_=c.S;Array.isArray(_)||(_=[String(_)]),bm(m.i,"t",_),c.C=0,m=c.j.L,c.h=new lm,c.g=jm(c.j,m?d:null,!c.u),c.P>0&&(c.O=new VA(l(c.Y,c,c.g),c.P)),d=c.V,m=c.g,_=c.ba;var P="readystatechange";Array.isArray(P)||(P&&(em[0]=P.toString()),P=em);for(let N=0;N<P.length;N++){const q=Qp(m,P[N],_||d.handleEvent,!1,d.h||d);if(!q)break;d.g[q.key]=q}d=c.J?Gp(c.J):{},c.u?(c.v||(c.v="POST"),d["Content-Type"]="application/x-www-form-urlencoded",c.g.ea(c.B,c.v,c.u,d)):(c.v="GET",c.g.ea(c.B,c.v,null,d)),co(),OA(c.i,c.v,c.B,c.l,c.S,c.u)}er.prototype.ba=function(c){c=c.target;const d=this.O;d&&rr(c)==3?d.j():this.Y(c)},er.prototype.Y=function(c){try{if(c==this.g)e:{const re=rr(this.g),$e=this.g.ya(),pe=this.g.ca();if(!(re<3)&&(re!=3||this.g&&(this.h.h||this.g.la()||Vm(this.g)))){this.K||re!=4||$e==7||($e==8||pe<=0?co(3):co(2)),Wl(this);var d=this.g.ca();this.X=d;var m=BA(this);if(this.o=d==200,LA(this.i,this.v,this.B,this.l,this.S,re,d),this.o){if(this.U&&!this.L){t:{if(this.g){var _,P=this.g;if((_=P.g?P.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!I(_)){var N=_;break t}}N=null}if(c=N)Fi(this.i,this.l,c,"Initial handshake response via X-HTTP-Initial-Response"),this.L=!0,Hl(this,c);else{this.o=!1,this.m=3,pt(12),zr(this),fo(this);break e}}if(this.R){c=!0;let Ge;for(;!this.K&&this.C<m.length;)if(Ge=qA(this,m),Ge==Kl){re==4&&(this.m=4,pt(14),c=!1),Fi(this.i,this.l,null,"[Incomplete Response]");break}else if(Ge==hm){this.m=4,pt(15),Fi(this.i,this.l,m,"[Invalid Chunk]"),c=!1;break}else Fi(this.i,this.l,Ge,null),Hl(this,Ge);if(fm(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),re!=4||m.length!=0||this.h.h||(this.m=1,pt(16),c=!1),this.o=this.o&&c,!c)Fi(this.i,this.l,m,"[Invalid Chunked Response]"),zr(this),fo(this);else if(m.length>0&&!this.W){this.W=!0;var q=this.j;q.g==this&&q.aa&&!q.P&&(q.j.info("Great, no buffering proxy detected. Bytes received: "+m.length),nh(q),q.P=!0,pt(11))}}else Fi(this.i,this.l,m,null),Hl(this,m);re==4&&zr(this),this.o&&!this.K&&(re==4?Um(this.j,this):(this.o=!1,_c(this)))}else tb(this.g),d==400&&m.indexOf("Unknown SID")>0?(this.m=3,pt(12)):(this.m=0,pt(13)),zr(this),fo(this)}}}catch(re){}finally{}};function BA(c){if(!fm(c))return c.g.la();const d=Vm(c.g);if(d==="")return"";let m="";const _=d.length,P=rr(c.g)==4;if(!c.h.i){if(typeof TextDecoder=="undefined")return zr(c),fo(c),"";c.h.i=new o.TextDecoder}for(let N=0;N<_;N++)c.h.h=!0,m+=c.h.i.decode(d[N],{stream:!(P&&N==_-1)});return d.length=0,c.h.g+=m,c.C=0,c.h.g}function fm(c){return c.g?c.v=="GET"&&c.M!=2&&c.j.Aa:!1}function qA(c,d){var m=c.C,_=d.indexOf(`
`,m);return _==-1?Kl:(m=Number(d.substring(m,_)),isNaN(m)?hm:(_+=1,_+m>d.length?Kl:(d=d.slice(_,_+m),c.C=_+m,d)))}er.prototype.cancel=function(){this.K=!0,zr(this)};function _c(c){c.T=Date.now()+c.H,pm(c,c.H)}function pm(c,d){if(c.D!=null)throw Error("WatchDog timer not null");c.D=uo(l(c.aa,c),d)}function Wl(c){c.D&&(o.clearTimeout(c.D),c.D=null)}er.prototype.aa=function(){this.D=null;const c=Date.now();c-this.T>=0?(MA(this.i,this.B),this.M!=2&&(co(),pt(17)),zr(this),this.m=2,fo(this)):pm(this,this.T-c)};function fo(c){c.j.I==0||c.K||Um(c.j,c)}function zr(c){Wl(c);var d=c.O;d&&typeof d.dispose=="function"&&d.dispose(),c.O=null,tm(c.V),c.g&&(d=c.g,c.g=null,d.abort(),d.dispose())}function Hl(c,d){try{var m=c.j;if(m.I!=0&&(m.g==c||Ql(m.h,c))){if(!c.L&&Ql(m.h,c)&&m.I==3){try{var _=m.Ba.g.parse(d)}catch(pe){_=null}if(Array.isArray(_)&&_.length==3){var P=_;if(P[0]==0){e:if(!m.v){if(m.g)if(m.g.F+3e3<c.F)vc(m),Tc(m);else break e;th(m),pt(18)}}else m.xa=P[1],0<m.xa-m.K&&P[2]<37500&&m.F&&m.A==0&&!m.C&&(m.C=uo(l(m.Va,m),6e3));_m(m.h)<=1&&m.ta&&(m.ta=void 0)}else Gr(m,11)}else if((c.L||m.g==c)&&vc(m),!I(d))for(P=m.Ba.g.parse(d),d=0;d<P.length;d++){let pe=P[d];const Ge=pe[0];if(!(Ge<=m.K))if(m.K=Ge,pe=pe[1],m.I==2)if(pe[0]=="c"){m.M=pe[1],m.ba=pe[2];const tn=pe[3];tn!=null&&(m.ka=tn,m.j.info("VER="+m.ka));const Wr=pe[4];Wr!=null&&(m.za=Wr,m.j.info("SVER="+m.za));const ir=pe[5];ir!=null&&typeof ir=="number"&&ir>0&&(_=1.5*ir,m.O=_,m.j.info("backChannelRequestTimeoutMs_="+_)),_=m;const sr=c.g;if(sr){const bc=sr.g?sr.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(bc){var N=_.h;N.g||bc.indexOf("spdy")==-1&&bc.indexOf("quic")==-1&&bc.indexOf("h2")==-1||(N.j=N.l,N.g=new Set,N.h&&(Jl(N,N.h),N.h=null))}if(_.G){const rh=sr.g?sr.g.getResponseHeader("X-HTTP-Session-Id"):null;rh&&(_.wa=rh,ye(_.J,_.G,rh))}}m.I=3,m.l&&m.l.ra(),m.aa&&(m.T=Date.now()-c.F,m.j.info("Handshake RTT: "+m.T+"ms")),_=m;var q=c;if(_.na=$m(_,_.L?_.ba:null,_.W),q.L){ym(_.h,q);var re=q,$e=_.O;$e&&(re.H=$e),re.D&&(Wl(re),_c(re)),_.g=q}else Mm(_);m.i.length>0&&Ec(m)}else pe[0]!="stop"&&pe[0]!="close"||Gr(m,7);else m.I==3&&(pe[0]=="stop"||pe[0]=="close"?pe[0]=="stop"?Gr(m,7):eh(m):pe[0]!="noop"&&m.l&&m.l.qa(pe),m.A=0)}}co(4)}catch(pe){}}var $A=class{constructor(c,d){this.g=c,this.map=d}};function mm(c){this.l=c||10,o.PerformanceNavigationTiming?(c=o.performance.getEntriesByType("navigation"),c=c.length>0&&(c[0].nextHopProtocol=="hq"||c[0].nextHopProtocol=="h2")):c=!!(o.chrome&&o.chrome.loadTimes&&o.chrome.loadTimes()&&o.chrome.loadTimes().wasFetchedViaSpdy),this.j=c?this.l:1,this.g=null,this.j>1&&(this.g=new Set),this.h=null,this.i=[]}function gm(c){return c.h?!0:c.g?c.g.size>=c.j:!1}function _m(c){return c.h?1:c.g?c.g.size:0}function Ql(c,d){return c.h?c.h==d:c.g?c.g.has(d):!1}function Jl(c,d){c.g?c.g.add(d):c.h=d}function ym(c,d){c.h&&c.h==d?c.h=null:c.g&&c.g.has(d)&&c.g.delete(d)}mm.prototype.cancel=function(){if(this.i=wm(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const c of this.g.values())c.cancel();this.g.clear()}};function wm(c){if(c.h!=null)return c.i.concat(c.h.G);if(c.g!=null&&c.g.size!==0){let d=c.i;for(const m of c.g.values())d=d.concat(m.G);return d}return w(c.i)}var Im=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function jA(c,d){if(c){c=c.split("&");for(let m=0;m<c.length;m++){const _=c[m].indexOf("=");let P,N=null;_>=0?(P=c[m].substring(0,_),N=c[m].substring(_+1)):P=c[m],d(P,N?decodeURIComponent(N.replace(/\+/g," ")):"")}}}function tr(c){this.g=this.o=this.j="",this.u=null,this.m=this.h="",this.l=!1;let d;c instanceof tr?(this.l=c.l,po(this,c.j),this.o=c.o,this.g=c.g,mo(this,c.u),this.h=c.h,Yl(this,Rm(c.i)),this.m=c.m):c&&(d=String(c).match(Im))?(this.l=!1,po(this,d[1]||"",!0),this.o=go(d[2]||""),this.g=go(d[3]||"",!0),mo(this,d[4]),this.h=go(d[5]||"",!0),Yl(this,d[6]||"",!0),this.m=go(d[7]||"")):(this.l=!1,this.i=new yo(null,this.l))}tr.prototype.toString=function(){const c=[];var d=this.j;d&&c.push(_o(d,Tm,!0),":");var m=this.g;return(m||d=="file")&&(c.push("//"),(d=this.o)&&c.push(_o(d,Tm,!0),"@"),c.push(ho(m).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),m=this.u,m!=null&&c.push(":",String(m))),(m=this.h)&&(this.g&&m.charAt(0)!="/"&&c.push("/"),c.push(_o(m,m.charAt(0)=="/"?GA:KA,!0))),(m=this.i.toString())&&c.push("?",m),(m=this.m)&&c.push("#",_o(m,HA)),c.join("")},tr.prototype.resolve=function(c){const d=en(this);let m=!!c.j;m?po(d,c.j):m=!!c.o,m?d.o=c.o:m=!!c.g,m?d.g=c.g:m=c.u!=null;var _=c.h;if(m)mo(d,c.u);else if(m=!!c.h){if(_.charAt(0)!="/")if(this.g&&!this.h)_="/"+_;else{var P=d.h.lastIndexOf("/");P!=-1&&(_=d.h.slice(0,P+1)+_)}if(P=_,P==".."||P==".")_="";else if(P.indexOf("./")!=-1||P.indexOf("/.")!=-1){_=P.lastIndexOf("/",0)==0,P=P.split("/");const N=[];for(let q=0;q<P.length;){const re=P[q++];re=="."?_&&q==P.length&&N.push(""):re==".."?((N.length>1||N.length==1&&N[0]!="")&&N.pop(),_&&q==P.length&&N.push("")):(N.push(re),_=!0)}_=N.join("/")}else _=P}return m?d.h=_:m=c.i.toString()!=="",m?Yl(d,Rm(c.i)):m=!!c.m,m&&(d.m=c.m),d};function en(c){return new tr(c)}function po(c,d,m){c.j=m?go(d,!0):d,c.j&&(c.j=c.j.replace(/:$/,""))}function mo(c,d){if(d){if(d=Number(d),isNaN(d)||d<0)throw Error("Bad port number "+d);c.u=d}else c.u=null}function Yl(c,d,m){d instanceof yo?(c.i=d,QA(c.i,c.l)):(m||(d=_o(d,WA)),c.i=new yo(d,c.l))}function ye(c,d,m){c.i.set(d,m)}function yc(c){return ye(c,"zx",Math.floor(Math.random()*2147483648).toString(36)+Math.abs(Math.floor(Math.random()*2147483648)^Date.now()).toString(36)),c}function go(c,d){return c?d?decodeURI(c.replace(/%25/g,"%2525")):decodeURIComponent(c):""}function _o(c,d,m){return typeof c=="string"?(c=encodeURI(c).replace(d,zA),m&&(c=c.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),c):null}function zA(c){return c=c.charCodeAt(0),"%"+(c>>4&15).toString(16)+(c&15).toString(16)}var Tm=/[#\/\?@]/g,KA=/[#\?:]/g,GA=/[#\?]/g,WA=/[#\?@]/g,HA=/#/g;function yo(c,d){this.h=this.g=null,this.i=c||null,this.j=!!d}function Kr(c){c.g||(c.g=new Map,c.h=0,c.i&&jA(c.i,function(d,m){c.add(decodeURIComponent(d.replace(/\+/g," ")),m)}))}n=yo.prototype,n.add=function(c,d){Kr(this),this.i=null,c=Ui(this,c);let m=this.g.get(c);return m||this.g.set(c,m=[]),m.push(d),this.h+=1,this};function Em(c,d){Kr(c),d=Ui(c,d),c.g.has(d)&&(c.i=null,c.h-=c.g.get(d).length,c.g.delete(d))}function vm(c,d){return Kr(c),d=Ui(c,d),c.g.has(d)}n.forEach=function(c,d){Kr(this),this.g.forEach(function(m,_){m.forEach(function(P){c.call(d,P,_,this)},this)},this)};function Am(c,d){Kr(c);let m=[];if(typeof d=="string")vm(c,d)&&(m=m.concat(c.g.get(Ui(c,d))));else for(c=Array.from(c.g.values()),d=0;d<c.length;d++)m=m.concat(c[d]);return m}n.set=function(c,d){return Kr(this),this.i=null,c=Ui(this,c),vm(this,c)&&(this.h-=this.g.get(c).length),this.g.set(c,[d]),this.h+=1,this},n.get=function(c,d){return c?(c=Am(this,c),c.length>0?String(c[0]):d):d};function bm(c,d,m){Em(c,d),m.length>0&&(c.i=null,c.g.set(Ui(c,d),w(m)),c.h+=m.length)}n.toString=function(){if(this.i)return this.i;if(!this.g)return"";const c=[],d=Array.from(this.g.keys());for(let _=0;_<d.length;_++){var m=d[_];const P=ho(m);m=Am(this,m);for(let N=0;N<m.length;N++){let q=P;m[N]!==""&&(q+="="+ho(m[N])),c.push(q)}}return this.i=c.join("&")};function Rm(c){const d=new yo;return d.i=c.i,c.g&&(d.g=new Map(c.g),d.h=c.h),d}function Ui(c,d){return d=String(d),c.j&&(d=d.toLowerCase()),d}function QA(c,d){d&&!c.j&&(Kr(c),c.i=null,c.g.forEach(function(m,_){const P=_.toLowerCase();_!=P&&(Em(this,_),bm(this,P,m))},c)),c.j=d}function JA(c,d){const m=new lo;if(o.Image){const _=new Image;_.onload=h(nr,m,"TestLoadImage: loaded",!0,d,_),_.onerror=h(nr,m,"TestLoadImage: error",!1,d,_),_.onabort=h(nr,m,"TestLoadImage: abort",!1,d,_),_.ontimeout=h(nr,m,"TestLoadImage: timeout",!1,d,_),o.setTimeout(function(){_.ontimeout&&_.ontimeout()},1e4),_.src=c}else d(!1)}function YA(c,d){const m=new lo,_=new AbortController,P=setTimeout(()=>{_.abort(),nr(m,"TestPingServer: timeout",!1,d)},1e4);fetch(c,{signal:_.signal}).then(N=>{clearTimeout(P),N.ok?nr(m,"TestPingServer: ok",!0,d):nr(m,"TestPingServer: server error",!1,d)}).catch(()=>{clearTimeout(P),nr(m,"TestPingServer: error",!1,d)})}function nr(c,d,m,_,P){try{P&&(P.onload=null,P.onerror=null,P.onabort=null,P.ontimeout=null),_(m)}catch(N){}}function XA(){this.g=new xA}function Xl(c){this.i=c.Sb||null,this.h=c.ab||!1}f(Xl,nm),Xl.prototype.g=function(){return new wc(this.i,this.h)};function wc(c,d){rt.call(this),this.H=c,this.o=d,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.A=new Headers,this.h=null,this.F="GET",this.D="",this.g=!1,this.B=this.j=this.l=null,this.v=new AbortController}f(wc,rt),n=wc.prototype,n.open=function(c,d){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.F=c,this.D=d,this.readyState=1,Io(this)},n.send=function(c){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");if(this.v.signal.aborted)throw this.abort(),Error("Request was aborted.");this.g=!0;const d={headers:this.A,method:this.F,credentials:this.m,cache:void 0,signal:this.v.signal};c&&(d.body=c),(this.H||o).fetch(new Request(this.D,d)).then(this.Pa.bind(this),this.ga.bind(this))},n.abort=function(){this.response=this.responseText="",this.A=new Headers,this.status=0,this.v.abort(),this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),this.readyState>=1&&this.g&&this.readyState!=4&&(this.g=!1,wo(this)),this.readyState=0},n.Pa=function(c){if(this.g&&(this.l=c,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=c.headers,this.readyState=2,Io(this)),this.g&&(this.readyState=3,Io(this),this.g)))if(this.responseType==="arraybuffer")c.arrayBuffer().then(this.Na.bind(this),this.ga.bind(this));else if(typeof o.ReadableStream!="undefined"&&"body"in c){if(this.j=c.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.B=new TextDecoder;Sm(this)}else c.text().then(this.Oa.bind(this),this.ga.bind(this))};function Sm(c){c.j.read().then(c.Ma.bind(c)).catch(c.ga.bind(c))}n.Ma=function(c){if(this.g){if(this.o&&c.value)this.response.push(c.value);else if(!this.o){var d=c.value?c.value:new Uint8Array(0);(d=this.B.decode(d,{stream:!c.done}))&&(this.response=this.responseText+=d)}c.done?wo(this):Io(this),this.readyState==3&&Sm(this)}},n.Oa=function(c){this.g&&(this.response=this.responseText=c,wo(this))},n.Na=function(c){this.g&&(this.response=c,wo(this))},n.ga=function(){this.g&&wo(this)};function wo(c){c.readyState=4,c.l=null,c.j=null,c.B=null,Io(c)}n.setRequestHeader=function(c,d){this.A.append(c,d)},n.getResponseHeader=function(c){return this.h&&this.h.get(c.toLowerCase())||""},n.getAllResponseHeaders=function(){if(!this.h)return"";const c=[],d=this.h.entries();for(var m=d.next();!m.done;)m=m.value,c.push(m[0]+": "+m[1]),m=d.next();return c.join(`\r
`)};function Io(c){c.onreadystatechange&&c.onreadystatechange.call(c)}Object.defineProperty(wc.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(c){this.m=c?"include":"same-origin"}});function Pm(c){let d="";return dc(c,function(m,_){d+=_,d+=":",d+=m,d+=`\r
`}),d}function Zl(c,d,m){e:{for(_ in m){var _=!1;break e}_=!0}_||(m=Pm(m),typeof c=="string"?m!=null&&ho(m):ye(c,d,m))}function Re(c){rt.call(this),this.headers=new Map,this.L=c||null,this.h=!1,this.g=null,this.D="",this.o=0,this.l="",this.j=this.B=this.v=this.A=!1,this.m=null,this.F="",this.H=!1}f(Re,rt);var ZA=/^https?$/i,eb=["POST","PUT"];n=Re.prototype,n.Fa=function(c){this.H=c},n.ea=function(c,d,m,_){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+c);d=d?d.toUpperCase():"GET",this.D=c,this.l="",this.o=0,this.A=!1,this.h=!0,this.g=this.L?this.L.g():um.g(),this.g.onreadystatechange=g(l(this.Ca,this));try{this.B=!0,this.g.open(d,String(c),!0),this.B=!1}catch(N){Cm(this,N);return}if(c=m||"",m=new Map(this.headers),_)if(Object.getPrototypeOf(_)===Object.prototype)for(var P in _)m.set(P,_[P]);else if(typeof _.keys=="function"&&typeof _.get=="function")for(const N of _.keys())m.set(N,_.get(N));else throw Error("Unknown input type for opt_headers: "+String(_));_=Array.from(m.keys()).find(N=>N.toLowerCase()=="content-type"),P=o.FormData&&c instanceof o.FormData,!(Array.prototype.indexOf.call(eb,d,void 0)>=0)||_||P||m.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[N,q]of m)this.g.setRequestHeader(N,q);this.F&&(this.g.responseType=this.F),"withCredentials"in this.g&&this.g.withCredentials!==this.H&&(this.g.withCredentials=this.H);try{this.m&&(clearTimeout(this.m),this.m=null),this.v=!0,this.g.send(c),this.v=!1}catch(N){Cm(this,N)}};function Cm(c,d){c.h=!1,c.g&&(c.j=!0,c.g.abort(),c.j=!1),c.l=d,c.o=5,km(c),Ic(c)}function km(c){c.A||(c.A=!0,ft(c,"complete"),ft(c,"error"))}n.abort=function(c){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.o=c||7,ft(this,"complete"),ft(this,"abort"),Ic(this))},n.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),Ic(this,!0)),Re.Z.N.call(this)},n.Ca=function(){this.u||(this.B||this.v||this.j?Nm(this):this.Xa())},n.Xa=function(){Nm(this)};function Nm(c){if(c.h&&typeof s!="undefined"){if(c.v&&rr(c)==4)setTimeout(c.Ca.bind(c),0);else if(ft(c,"readystatechange"),rr(c)==4){c.h=!1;try{const N=c.ca();e:switch(N){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var d=!0;break e;default:d=!1}var m;if(!(m=d)){var _;if(_=N===0){let q=String(c.D).match(Im)[1]||null;!q&&o.self&&o.self.location&&(q=o.self.location.protocol.slice(0,-1)),_=!ZA.test(q?q.toLowerCase():"")}m=_}if(m)ft(c,"complete"),ft(c,"success");else{c.o=6;try{var P=rr(c)>2?c.g.statusText:""}catch(q){P=""}c.l=P+" ["+c.ca()+"]",km(c)}}finally{Ic(c)}}}}function Ic(c,d){if(c.g){c.m&&(clearTimeout(c.m),c.m=null);const m=c.g;c.g=null,d||ft(c,"ready");try{m.onreadystatechange=null}catch(_){}}}n.isActive=function(){return!!this.g};function rr(c){return c.g?c.g.readyState:0}n.ca=function(){try{return rr(this)>2?this.g.status:-1}catch(c){return-1}},n.la=function(){try{return this.g?this.g.responseText:""}catch(c){return""}},n.La=function(c){if(this.g){var d=this.g.responseText;return c&&d.indexOf(c)==0&&(d=d.substring(c.length)),DA(d)}};function Vm(c){try{if(!c.g)return null;if("response"in c.g)return c.g.response;switch(c.F){case"":case"text":return c.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in c.g)return c.g.mozResponseArrayBuffer}return null}catch(d){return null}}function tb(c){const d={};c=(c.g&&rr(c)>=2&&c.g.getAllResponseHeaders()||"").split(`\r
`);for(let _=0;_<c.length;_++){if(I(c[_]))continue;var m=UA(c[_]);const P=m[0];if(m=m[1],typeof m!="string")continue;m=m.trim();const N=d[P]||[];d[P]=N,N.push(m)}SA(d,function(_){return _.join(", ")})}n.ya=function(){return this.o},n.Ha=function(){return typeof this.l=="string"?this.l:String(this.l)};function To(c,d,m){return m&&m.internalChannelParams&&m.internalChannelParams[c]||d}function Dm(c){this.za=0,this.i=[],this.j=new lo,this.ba=this.na=this.J=this.W=this.g=this.wa=this.G=this.H=this.u=this.U=this.o=null,this.Ya=this.V=0,this.Sa=To("failFast",!1,c),this.F=this.C=this.v=this.m=this.l=null,this.X=!0,this.xa=this.K=-1,this.Y=this.A=this.D=0,this.Qa=To("baseRetryDelayMs",5e3,c),this.Za=To("retryDelaySeedMs",1e4,c),this.Ta=To("forwardChannelMaxRetries",2,c),this.va=To("forwardChannelRequestTimeoutMs",2e4,c),this.ma=c&&c.xmlHttpFactory||void 0,this.Ua=c&&c.Rb||void 0,this.Aa=c&&c.useFetchStreams||!1,this.O=void 0,this.L=c&&c.supportsCrossDomainXhr||!1,this.M="",this.h=new mm(c&&c.concurrentRequestLimit),this.Ba=new XA,this.S=c&&c.fastHandshake||!1,this.R=c&&c.encodeInitMessageHeaders||!1,this.S&&this.R&&(this.R=!1),this.Ra=c&&c.Pb||!1,c&&c.ua&&this.j.ua(),c&&c.forceLongPolling&&(this.X=!1),this.aa=!this.S&&this.X&&c&&c.detectBufferingProxy||!1,this.ia=void 0,c&&c.longPollingTimeout&&c.longPollingTimeout>0&&(this.ia=c.longPollingTimeout),this.ta=void 0,this.T=0,this.P=!1,this.ja=this.B=null}n=Dm.prototype,n.ka=8,n.I=1,n.connect=function(c,d,m,_){pt(0),this.W=c,this.H=d||{},m&&_!==void 0&&(this.H.OSID=m,this.H.OAID=_),this.F=this.X,this.J=$m(this,null,this.W),Ec(this)};function eh(c){if(xm(c),c.I==3){var d=c.V++,m=en(c.J);if(ye(m,"SID",c.M),ye(m,"RID",d),ye(m,"TYPE","terminate"),Eo(c,m),d=new er(c,c.j,d),d.M=2,d.A=yc(en(m)),m=!1,o.navigator&&o.navigator.sendBeacon)try{m=o.navigator.sendBeacon(d.A.toString(),"")}catch(_){}!m&&o.Image&&(new Image().src=d.A,m=!0),m||(d.g=jm(d.j,null),d.g.ea(d.A)),d.F=Date.now(),_c(d)}qm(c)}function Tc(c){c.g&&(nh(c),c.g.cancel(),c.g=null)}function xm(c){Tc(c),c.v&&(o.clearTimeout(c.v),c.v=null),vc(c),c.h.cancel(),c.m&&(typeof c.m=="number"&&o.clearTimeout(c.m),c.m=null)}function Ec(c){if(!gm(c.h)&&!c.m){c.m=!0;var d=c.Ea;ee||y(),ne||(ee(),ne=!0),E.add(d,c),c.D=0}}function nb(c,d){return _m(c.h)>=c.h.j-(c.m?1:0)?!1:c.m?(c.i=d.G.concat(c.i),!0):c.I==1||c.I==2||c.D>=(c.Sa?0:c.Ta)?!1:(c.m=uo(l(c.Ea,c,d),Bm(c,c.D)),c.D++,!0)}n.Ea=function(c){if(this.m)if(this.m=null,this.I==1){if(!c){this.V=Math.floor(Math.random()*1e5),c=this.V++;const P=new er(this,this.j,c);let N=this.o;if(this.U&&(N?(N=Gp(N),Hp(N,this.U)):N=this.U),this.u!==null||this.R||(P.J=N,N=null),this.S)e:{for(var d=0,m=0;m<this.i.length;m++){t:{var _=this.i[m];if("__data__"in _.map&&(_=_.map.__data__,typeof _=="string")){_=_.length;break t}_=void 0}if(_===void 0)break;if(d+=_,d>4096){d=m;break e}if(d===4096||m===this.i.length-1){d=m+1;break e}}d=1e3}else d=1e3;d=Lm(this,P,d),m=en(this.J),ye(m,"RID",c),ye(m,"CVER",22),this.G&&ye(m,"X-HTTP-Session-Id",this.G),Eo(this,m),N&&(this.R?d="headers="+ho(Pm(N))+"&"+d:this.u&&Zl(m,this.u,N)),Jl(this.h,P),this.Ra&&ye(m,"TYPE","init"),this.S?(ye(m,"$req",d),ye(m,"SID","null"),P.U=!0,Gl(P,m,null)):Gl(P,m,d),this.I=2}}else this.I==3&&(c?Om(this,c):this.i.length==0||gm(this.h)||Om(this))};function Om(c,d){var m;d?m=d.l:m=c.V++;const _=en(c.J);ye(_,"SID",c.M),ye(_,"RID",m),ye(_,"AID",c.K),Eo(c,_),c.u&&c.o&&Zl(_,c.u,c.o),m=new er(c,c.j,m,c.D+1),c.u===null&&(m.J=c.o),d&&(c.i=d.G.concat(c.i)),d=Lm(c,m,1e3),m.H=Math.round(c.va*.5)+Math.round(c.va*.5*Math.random()),Jl(c.h,m),Gl(m,_,d)}function Eo(c,d){c.H&&dc(c.H,function(m,_){ye(d,_,m)}),c.l&&dc({},function(m,_){ye(d,_,m)})}function Lm(c,d,m){m=Math.min(c.i.length,m);const _=c.l?l(c.l.Ka,c.l,c):null;e:{var P=c.i;let re=-1;for(;;){const $e=["count="+m];re==-1?m>0?(re=P[0].g,$e.push("ofs="+re)):re=0:$e.push("ofs="+re);let pe=!0;for(let Ge=0;Ge<m;Ge++){var N=P[Ge].g;const tn=P[Ge].map;if(N-=re,N<0)re=Math.max(0,P[Ge].g-100),pe=!1;else try{N="req"+N+"_"||"";try{var q=tn instanceof Map?tn:Object.entries(tn);for(const[Wr,ir]of q){let sr=ir;a(ir)&&(sr=ql(ir)),$e.push(N+Wr+"="+encodeURIComponent(sr))}}catch(Wr){throw $e.push(N+"type="+encodeURIComponent("_badmap")),Wr}}catch(Wr){_&&_(tn)}}if(pe){q=$e.join("&");break e}}q=void 0}return c=c.i.splice(0,m),d.G=c,q}function Mm(c){if(!c.g&&!c.v){c.Y=1;var d=c.Da;ee||y(),ne||(ee(),ne=!0),E.add(d,c),c.A=0}}function th(c){return c.g||c.v||c.A>=3?!1:(c.Y++,c.v=uo(l(c.Da,c),Bm(c,c.A)),c.A++,!0)}n.Da=function(){if(this.v=null,Fm(this),this.aa&&!(this.P||this.g==null||this.T<=0)){var c=4*this.T;this.j.info("BP detection timer enabled: "+c),this.B=uo(l(this.Wa,this),c)}},n.Wa=function(){this.B&&(this.B=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.P=!0,pt(10),Tc(this),Fm(this))};function nh(c){c.B!=null&&(o.clearTimeout(c.B),c.B=null)}function Fm(c){c.g=new er(c,c.j,"rpc",c.Y),c.u===null&&(c.g.J=c.o),c.g.P=0;var d=en(c.na);ye(d,"RID","rpc"),ye(d,"SID",c.M),ye(d,"AID",c.K),ye(d,"CI",c.F?"0":"1"),!c.F&&c.ia&&ye(d,"TO",c.ia),ye(d,"TYPE","xmlhttp"),Eo(c,d),c.u&&c.o&&Zl(d,c.u,c.o),c.O&&(c.g.H=c.O);var m=c.g;c=c.ba,m.M=1,m.A=yc(en(d)),m.u=null,m.R=!0,dm(m,c)}n.Va=function(){this.C!=null&&(this.C=null,Tc(this),th(this),pt(19))};function vc(c){c.C!=null&&(o.clearTimeout(c.C),c.C=null)}function Um(c,d){var m=null;if(c.g==d){vc(c),nh(c),c.g=null;var _=2}else if(Ql(c.h,d))m=d.G,ym(c.h,d),_=1;else return;if(c.I!=0){if(d.o)if(_==1){m=d.u?d.u.length:0,d=Date.now()-d.F;var P=c.D;_=mc(),ft(_,new am(_,m)),Ec(c)}else Mm(c);else if(P=d.m,P==3||P==0&&d.X>0||!(_==1&&nb(c,d)||_==2&&th(c)))switch(m&&m.length>0&&(d=c.h,d.i=d.i.concat(m)),P){case 1:Gr(c,5);break;case 4:Gr(c,10);break;case 3:Gr(c,6);break;default:Gr(c,2)}}}function Bm(c,d){let m=c.Qa+Math.floor(Math.random()*c.Za);return c.isActive()||(m*=2),m*d}function Gr(c,d){if(c.j.info("Error code "+d),d==2){var m=l(c.bb,c),_=c.Ua;const P=!_;_=new tr(_||"//www.google.com/images/cleardot.gif"),o.location&&o.location.protocol=="http"||po(_,"https"),yc(_),P?JA(_.toString(),m):YA(_.toString(),m)}else pt(2);c.I=0,c.l&&c.l.pa(d),qm(c),xm(c)}n.bb=function(c){c?(this.j.info("Successfully pinged google.com"),pt(2)):(this.j.info("Failed to ping google.com"),pt(1))};function qm(c){if(c.I=0,c.ja=[],c.l){const d=wm(c.h);(d.length!=0||c.i.length!=0)&&(S(c.ja,d),S(c.ja,c.i),c.h.i.length=0,w(c.i),c.i.length=0),c.l.oa()}}function $m(c,d,m){var _=m instanceof tr?en(m):new tr(m);if(_.g!="")d&&(_.g=d+"."+_.g),mo(_,_.u);else{var P=o.location;_=P.protocol,d=d?d+"."+P.hostname:P.hostname,P=+P.port;const N=new tr(null);_&&po(N,_),d&&(N.g=d),P&&mo(N,P),m&&(N.h=m),_=N}return m=c.G,d=c.wa,m&&d&&ye(_,m,d),ye(_,"VER",c.ka),Eo(c,_),_}function jm(c,d,m){if(d&&!c.L)throw Error("Can't create secondary domain capable XhrIo object.");return d=c.Aa&&!c.ma?new Re(new Xl({ab:m})):new Re(c.ma),d.Fa(c.L),d}n.isActive=function(){return!!this.l&&this.l.isActive(this)};function zm(){}n=zm.prototype,n.ra=function(){},n.qa=function(){},n.pa=function(){},n.oa=function(){},n.isActive=function(){return!0},n.Ka=function(){};function Ac(){}Ac.prototype.g=function(c,d){return new Nt(c,d)};function Nt(c,d){rt.call(this),this.g=new Dm(d),this.l=c,this.h=d&&d.messageUrlParams||null,c=d&&d.messageHeaders||null,d&&d.clientProtocolHeaderRequired&&(c?c["X-Client-Protocol"]="webchannel":c={"X-Client-Protocol":"webchannel"}),this.g.o=c,c=d&&d.initMessageHeaders||null,d&&d.messageContentType&&(c?c["X-WebChannel-Content-Type"]=d.messageContentType:c={"X-WebChannel-Content-Type":d.messageContentType}),d&&d.sa&&(c?c["X-WebChannel-Client-Profile"]=d.sa:c={"X-WebChannel-Client-Profile":d.sa}),this.g.U=c,(c=d&&d.Qb)&&!I(c)&&(this.g.u=c),this.A=d&&d.supportsCrossDomainXhr||!1,this.v=d&&d.sendRawJson||!1,(d=d&&d.httpSessionIdParam)&&!I(d)&&(this.g.G=d,c=this.h,c!==null&&d in c&&(c=this.h,d in c&&delete c[d])),this.j=new Bi(this)}f(Nt,rt),Nt.prototype.m=function(){this.g.l=this.j,this.A&&(this.g.L=!0),this.g.connect(this.l,this.h||void 0)},Nt.prototype.close=function(){eh(this.g)},Nt.prototype.o=function(c){var d=this.g;if(typeof c=="string"){var m={};m.__data__=c,c=m}else this.v&&(m={},m.__data__=ql(c),c=m);d.i.push(new $A(d.Ya++,c)),d.I==3&&Ec(d)},Nt.prototype.N=function(){this.g.l=null,delete this.j,eh(this.g),delete this.g,Nt.Z.N.call(this)};function Km(c){$l.call(this),c.__headers__&&(this.headers=c.__headers__,this.statusCode=c.__status__,delete c.__headers__,delete c.__status__);var d=c.__sm__;if(d){e:{for(const m in d){c=m;break e}c=void 0}(this.i=c)&&(c=this.i,d=d!==null&&c in d?d[c]:void 0),this.data=d}else this.data=c}f(Km,$l);function Gm(){jl.call(this),this.status=1}f(Gm,jl);function Bi(c){this.g=c}f(Bi,zm),Bi.prototype.ra=function(){ft(this.g,"a")},Bi.prototype.qa=function(c){ft(this.g,new Km(c))},Bi.prototype.pa=function(c){ft(this.g,new Gm)},Bi.prototype.oa=function(){ft(this.g,"b")},Ac.prototype.createWebChannel=Ac.prototype.g,Nt.prototype.send=Nt.prototype.o,Nt.prototype.open=Nt.prototype.m,Nt.prototype.close=Nt.prototype.close,hI=function(){return new Ac},lI=function(){return mc()},uI=jr,Uh={jb:0,mb:1,nb:2,Hb:3,Mb:4,Jb:5,Kb:6,Ib:7,Gb:8,Lb:9,PROXY:10,NOPROXY:11,Eb:12,Ab:13,Bb:14,zb:15,Cb:16,Db:17,fb:18,eb:19,gb:20},gc.NO_ERROR=0,gc.TIMEOUT=8,gc.HTTP_ERROR=6,zc=gc,cm.COMPLETE="complete",cI=cm,rm.EventType=ao,ao.OPEN="a",ao.CLOSE="b",ao.ERROR="c",ao.MESSAGE="d",rt.prototype.listen=rt.prototype.J,Fo=rm,Re.prototype.listenOnce=Re.prototype.K,Re.prototype.getLastError=Re.prototype.Ha,Re.prototype.getLastErrorCode=Re.prototype.ya,Re.prototype.getStatus=Re.prototype.ca,Re.prototype.getResponseJson=Re.prototype.La,Re.prototype.getResponseText=Re.prototype.la,Re.prototype.send=Re.prototype.ea,Re.prototype.setWithCredentials=Re.prototype.Fa,aI=Re}).apply(typeof Pc!="undefined"?Pc:typeof self!="undefined"?self:typeof window!="undefined"?window:{});/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let $s="12.18.0";function Lk(n){$s=n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ar=new Fu("@firebase/firestore");function Ji(){return Ar.logLevel}function Mk(n){Ar.setLogLevel(n)}function L(n,...e){if(Ar.logLevel<=ie.DEBUG){const t=e.map(Xd);Ar.debug(`Firestore (${$s}): ${n}`,...t)}}function Ne(n,...e){if(Ar.logLevel<=ie.ERROR){const t=e.map(Xd);Ar.error(`Firestore (${$s}): ${n}`,...t)}}function lt(n,...e){if(Ar.logLevel<=ie.WARN){const t=e.map(Xd);Ar.warn(`Firestore (${$s}): ${n}`,...t)}}function Xd(n){if(typeof n=="string")return n;try{return function(t){return JSON.stringify(t)}(n)}catch(e){return n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function j(n,e,t){let r="Unexpected state";typeof e=="string"?r=e:t=e,dI(n,r,t)}function dI(n,e,t){let r=`FIRESTORE (${$s}) INTERNAL ASSERTION FAILED: ${e} (ID: ${n.toString(16)})`;if(t!==void 0)try{r+=" CONTEXT: "+JSON.stringify(t)}catch(i){r+=" CONTEXT: "+t}throw Ne(r),new Error(r)}function F(n,e,t,r){let i="Unexpected state";typeof t=="string"?i=t:r=t,n||dI(e,i,r)}function Fk(n,e){n||j(57014,e)}function $(n,e){return n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Uk(n){const e=typeof self!="undefined"&&(self.crypto||self.msCrypto),t=new Uint8Array(n);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(t);else for(let r=0;r<n;r++)t[r]=Math.floor(256*Math.random());return t}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zd{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=62*Math.floor(4.129032258064516);let r="";for(;r.length<20;){const i=Uk(40);for(let s=0;s<i.length;++s)r.length<20&&i[s]<t&&(r+=e.charAt(i[s]%62))}return r}}function Y(n,e){return n<e?-1:n>e?1:0}function Bh(n,e){const t=Math.min(n.length,e.length);for(let r=0;r<t;r++){const i=n.charAt(r),s=e.charAt(r);if(i!==s)return dh(i)===dh(s)?Y(i,s):dh(i)?1:-1}return Y(n.length,e.length)}const Bk=55296,qk=57343;function dh(n){const e=n.charCodeAt(0);return e>=Bk&&e<=qk}function ps(n,e,t){return n.length===e.length&&n.every((r,i)=>t(r,e[i]))}function fI(n){return n+"\0"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class me{constructor(e,t){this.comparator=e,this.root=t||Xe.EMPTY}insert(e,t){return new me(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,Xe.BLACK,null,null))}remove(e){return new me(this.comparator,this.root.remove(e,this.comparator).copy(null,null,Xe.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const r=this.comparator(e,t.key);if(r===0)return t.value;r<0?t=t.left:r>0&&(t=t.right)}return null}indexOf(e){let t=0,r=this.root;for(;!r.isEmpty();){const i=this.comparator(e,r.key);if(i===0)return t+r.left.size;i<0?r=r.left:(t+=r.left.size+1,r=r.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((t,r)=>(e(t,r),!1))}toString(){const e=[];return this.inorderTraversal((t,r)=>(e.push(`${t}:${r}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new Cc(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new Cc(this.root,e,this.comparator,!1)}getReverseIterator(){return new Cc(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new Cc(this.root,e,this.comparator,!0)}}class Cc{constructor(e,t,r,i){this.isReverse=i,this.nodeStack=[];let s=1;for(;!e.isEmpty();)if(s=t?r(e.key,t):1,t&&i&&(s*=-1),s<0)e=this.isReverse?e.left:e.right;else{if(s===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class Xe{constructor(e,t,r,i,s){this.key=e,this.value=t,this.color=r!=null?r:Xe.RED,this.left=i!=null?i:Xe.EMPTY,this.right=s!=null?s:Xe.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,r,i,s){return new Xe(e!=null?e:this.key,t!=null?t:this.value,r!=null?r:this.color,i!=null?i:this.left,s!=null?s:this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,r){let i=this;const s=r(e,i.key);return i=s<0?i.copy(null,null,null,i.left.insert(e,t,r),null):s===0?i.copy(null,t,null,null,null):i.copy(null,null,null,null,i.right.insert(e,t,r)),i.fixUp()}removeMin(){if(this.left.isEmpty())return Xe.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let r,i=this;if(t(e,i.key)<0)i.left.isEmpty()||i.left.isRed()||i.left.left.isRed()||(i=i.moveRedLeft()),i=i.copy(null,null,null,i.left.remove(e,t),null);else{if(i.left.isRed()&&(i=i.rotateRight()),i.right.isEmpty()||i.right.isRed()||i.right.left.isRed()||(i=i.moveRedRight()),t(e,i.key)===0){if(i.right.isEmpty())return Xe.EMPTY;r=i.right.min(),i=i.copy(r.key,r.value,null,null,i.right.removeMin())}i=i.copy(null,null,null,null,i.right.remove(e,t))}return i.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,Xe.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,Xe.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw j(43730,{key:this.key,value:this.value});if(this.right.isRed())throw j(14113,{key:this.key,value:this.value});const e=this.left.check();if(e!==this.right.check())throw j(27949);return e+(this.isRed()?0:1)}}Xe.EMPTY=null,Xe.RED=!0,Xe.BLACK=!1;Xe.EMPTY=new class{constructor(){this.size=0}get key(){throw j(57766)}get value(){throw j(16141)}get color(){throw j(16727)}get left(){throw j(29726)}get right(){throw j(36894)}copy(e,t,r,i,s){return this}insert(e,t,r){return new Xe(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class de{constructor(e){this.comparator=e,this.data=new me(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((t,r)=>(e(t),!1))}forEachInRange(e,t){const r=this.data.getIteratorFrom(e[0]);for(;r.hasNext();){const i=r.getNext();if(this.comparator(i.key,e[1])>=0)return;t(i.key)}}forEachWhile(e,t){let r;for(r=t!==void 0?this.data.getIteratorFrom(t):this.data.getIterator();r.hasNext();)if(!e(r.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new Cg(this.data.getIterator())}getIteratorFrom(e){return new Cg(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach(r=>{t=t.add(r)}),t}isEqual(e){if(!(e instanceof de)||this.size!==e.size)return!1;const t=this.data.getIterator(),r=e.data.getIterator();for(;t.hasNext();){const i=t.getNext().key,s=r.getNext().key;if(this.comparator(i,s)!==0)return!1}return!0}toArray(){const e=[];return this.forEach(t=>{e.push(t)}),e}toString(){const e=[];return this.forEach(t=>e.push(t)),"SortedSet("+e.toString()+")"}copy(e){const t=new de(this.comparator);return t.data=e,t}}class Cg{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}function $i(n){return n.hasNext()?n.getNext():void 0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const k={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class O extends Fe{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const hn="__name__";class nn{constructor(e,t,r){t===void 0?t=0:t>e.length&&j(637,{offset:t,range:e.length}),r===void 0?r=e.length-t:r>e.length-t&&j(1746,{length:r,range:e.length-t}),this.segments=e,this.offset=t,this.len=r}get length(){return this.len}isEqual(e){return nn.comparator(this,e)===0}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof nn?e.forEach(r=>{t.push(r)}):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,r=this.limit();t<r;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const r=Math.min(e.length,t.length);for(let i=0;i<r;i++){const s=nn.compareSegments(e.get(i),t.get(i));if(s!==0)return s}return Y(e.length,t.length)}static compareSegments(e,t){const r=nn.isNumericId(e),i=nn.isNumericId(t);return r&&!i?-1:!r&&i?1:r&&i?nn.extractNumericId(e).compare(nn.extractNumericId(t)):Bh(e,t)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return yr.fromString(e.substring(4,e.length-2))}}class te extends nn{construct(e,t,r){return new te(e,t,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toStringWithLeadingSlash(){return`/${this.canonicalString()}`}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const r of e){if(r.indexOf("//")>=0)throw new O(k.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);t.push(...r.split("/").filter(i=>i.length>0))}return new te(t)}static emptyPath(){return new te([])}}const $k=/^[_a-zA-Z][_a-zA-Z0-9]*$/;let Ue=class Yi extends nn{construct(e,t,r){return new Yi(e,t,r)}static isValidIdentifier(e){return $k.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),Yi.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===hn}static keyField(){return new Yi([hn])}static fromServerFormat(e){const t=[];let r="",i=0;const s=()=>{if(r.length===0)throw new O(k.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(r),r=""};let o=!1;for(;i<e.length;){const a=e[i];if(a==="\\"){if(i+1===e.length)throw new O(k.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const u=e[i+1];if(u!=="\\"&&u!=="."&&u!=="`")throw new O(k.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);r+=u,i+=2}else a==="`"?(o=!o,i++):a!=="."||o?(r+=a,i++):(s(),i++)}if(s(),o)throw new O(k.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new Yi(t)}static emptyPath(){return new Yi([])}};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bt{constructor(e){this.fields=e,e.sort(Ue.comparator)}static empty(){return new bt([])}unionWith(e){let t=new de(Ue.comparator);for(const r of this.fields)t=t.add(r);for(const r of e)t=t.add(r);return new bt(t.toArray())}covers(e){for(const t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return ps(this.fields,e.fields,(t,r)=>t.isEqual(r))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function lu(n){let e=0;for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e++;return e}function Lr(n,e){for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e(t,n[t])}function jk(n,e){const t=[];for(const r in n)Object.prototype.hasOwnProperty.call(n,r)&&t.push(e(n[r],r,n));return t}function pI(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class B{constructor(e){this.path=e}static fromPath(e){return new B(te.fromString(e))}static fromName(e){return new B(te.fromString(e).popFirst(5))}static empty(){return new B(te.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&te.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,t){return te.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new B(new te(e.slice()))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ef(n,e,t){if(!t)throw new O(k.INVALID_ARGUMENT,`Function ${n}() cannot be called with an empty ${e}.`)}function mI(n,e,t,r){if(e===!0&&r===!0)throw new O(k.INVALID_ARGUMENT,`${n} and ${t} cannot be used together.`)}function kg(n){if(!B.isDocumentKey(n))throw new O(k.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${n} has ${n.length}.`)}function Ng(n){if(B.isDocumentKey(n))throw new O(k.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${n} has ${n.length}.`)}function ja(n){return typeof n=="object"&&n!==null&&(Object.getPrototypeOf(n)===Object.prototype||Object.getPrototypeOf(n)===null)}function Yu(n){if(n===void 0)return"undefined";if(n===null)return"null";if(typeof n=="string")return n.length>20&&(n=`${n.substring(0,20)}...`),JSON.stringify(n);if(typeof n=="number"||typeof n=="boolean")return""+n;if(typeof n=="object"){if(n instanceof Array)return"an array";{const e=function(r){return r.constructor?r.constructor.name:null}(n);return e?`a custom ${e} object`:"an object"}}return typeof n=="function"?"a function":j(12329,{type:typeof n})}function ae(n,e){if("_delegate"in n&&(n=n._delegate),!(n instanceof e)){if(e.name===n.constructor.name)throw new O(k.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=Yu(n);throw new O(k.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return n}function gI(n,e){if(e<=0)throw new O(k.INVALID_ARGUMENT,`Function ${n}() requires a positive number, but it was: ${e}.`)}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Me(n,e){const t={typeString:n};return e&&(t.value=e),t}function za(n,e){if(!ja(n))throw new O(k.INVALID_ARGUMENT,"JSON must be an object");let t;for(const r in e)if(e[r]){const i=e[r].typeString,s="value"in e[r]?{value:e[r].value}:void 0;if(!(r in n)){t=`JSON missing required field: '${r}'`;break}const o=n[r];if(i&&typeof o!==i){t=`JSON field '${r}' must be a ${i}.`;break}if(s!==void 0&&o!==s.value){t=`Expected '${r}' field to equal '${s.value}'`;break}}if(t)throw new O(k.INVALID_ARGUMENT,t);return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Vg=-62135596800,Dg=1e6;class le{static now(){return le.fromMillis(Date.now())}static fromDate(e){return le.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),r=Math.floor((e-1e3*t)*Dg);return new le(t,r)}constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new O(k.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new O(k.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<Vg)throw new O(k.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new O(k.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/Dg}_compareTo(e){return this.seconds===e.seconds?Y(this.nanoseconds,e.nanoseconds):Y(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:le._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(za(e,le._jsonSchema))return new le(e.seconds,e.nanoseconds)}valueOf(){const e=this.seconds-Vg;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}le._jsonSchemaVersion="firestore/timestamp/1.0",le._jsonSchema={type:Me("string",le._jsonSchemaVersion),seconds:Me("number"),nanoseconds:Me("number")};/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _I extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function zk(){return typeof atob!="undefined"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ie{constructor(e){this.binaryString=e}static fromBase64String(e){const t=function(i){try{return atob(i)}catch(s){throw typeof DOMException!="undefined"&&s instanceof DOMException?new _I("Invalid base64 string: "+s):s}}(e);return new Ie(t)}static fromUint8Array(e){const t=function(i){let s="";for(let o=0;o<i.length;++o)s+=String.fromCharCode(i[o]);return s}(e);return new Ie(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(t){return btoa(t)}(this.binaryString)}toUint8Array(){return function(t){const r=new Uint8Array(t.length);for(let i=0;i<t.length;i++)r[i]=t.charCodeAt(i);return r}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return Y(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}Ie.EMPTY_BYTE_STRING=new Ie("");const Kk=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function Fn(n){if(F(!!n,39018),typeof n=="string"){let e=0;const t=Kk.exec(n);if(F(!!t,46558,{timestamp:n}),t[1]){let i=t[1];i=(i+"000000000").substr(0,9),e=Number(i)}const r=new Date(n);return{seconds:Math.floor(r.getTime()/1e3),nanos:e}}return{seconds:ge(n.seconds),nanos:ge(n.nanos)}}function ge(n){return typeof n=="number"?n:typeof n=="string"?Number(n):0}function Un(n){return typeof n=="string"?Ie.fromBase64String(n):Ie.fromUint8Array(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const yI="server_timestamp",wI="__type__",II="__previous_value__",TI="__local_write_time__";function Ka(n){var t,r;return((r=(((t=n==null?void 0:n.mapValue)==null?void 0:t.fields)||{})[wI])==null?void 0:r.stringValue)===yI}function Ga(n){const e=n.mapValue.fields[II];return Ka(e)?Ga(e):e}function ms(n){const e=Fn(n.mapValue.fields[TI].timestampValue);return new le(e.seconds,e.nanos)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gk{constructor(e,t,r,i,s,o,a,u,l,h,f,g,w){this.databaseId=e,this.appId=t,this.persistenceKey=r,this.host=i,this.ssl=s,this.forceLongPolling=o,this.autoDetectLongPolling=a,this.longPollingOptions=u,this.useFetchStreams=l,this.isUsingEmulator=h,this.apiKey=f,this._customHeaders=g,this.grpcFlowControlWindow=w}}const qh="(default)";class br{constructor(e,t){this.projectId=e,this.database=t||qh}static empty(){return new br("","")}get isDefaultDatabase(){return this.database===qh}isEqual(e){return e instanceof br&&e.projectId===this.projectId&&e.database===this.database}}function Wk(n,e){if(!Object.prototype.hasOwnProperty.apply(n.options,["projectId"]))throw new O(k.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new br(n.options.projectId,e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wr=-1;function Wa(n){return n==null}function gs(n){return n===0&&1/n==-1/0}function EI(n){return typeof n=="number"&&Number.isInteger(n)&&!gs(n)&&n<=Number.MAX_SAFE_INTEGER&&n>=Number.MIN_SAFE_INTEGER}function Hk(n){return typeof n=="string"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const tf="__type__",vI="__max__",pr={mapValue:{fields:{__type__:{stringValue:vI}}}},nf="__vector__",wi="value",gn={nullValue:"NULL_VALUE"},Ct={booleanValue:!0},Je={booleanValue:!1};function qe(n){return"nullValue"in n?0:"booleanValue"in n?1:"integerValue"in n||"doubleValue"in n?2:"timestampValue"in n?3:"stringValue"in n?5:"bytesValue"in n?6:"referenceValue"in n?7:"geoPointValue"in n?8:"arrayValue"in n?9:"mapValue"in n?Ka(n)?4:AI(n)?9007199254740991:Ti(n)?10:11:j(28295,{value:n})}function zt(n,e,t){if(n===e)return!0;const r=qe(n);if(r!==qe(e))return!1;switch(r){case 0:case 9007199254740991:return!0;case 1:return n.booleanValue===e.booleanValue;case 4:return ms(n).isEqual(ms(e));case 3:return function(s,o){if(typeof s.timestampValue=="string"&&typeof o.timestampValue=="string"&&s.timestampValue.length===o.timestampValue.length)return s.timestampValue===o.timestampValue;const a=Fn(s.timestampValue),u=Fn(o.timestampValue);return a.seconds===u.seconds&&a.nanos===u.nanos}(n,e);case 5:return n.stringValue===e.stringValue;case 6:return function(s,o){return Un(s.bytesValue).isEqual(Un(o.bytesValue))}(n,e);case 7:return n.referenceValue===e.referenceValue;case 8:return function(s,o){return ge(s.geoPointValue.latitude)===ge(o.geoPointValue.latitude)&&ge(s.geoPointValue.longitude)===ge(o.geoPointValue.longitude)}(n,e);case 2:return function(s,o,a){var h,f;if("integerValue"in s&&"integerValue"in o)return ge(s.integerValue)===ge(o.integerValue);let u,l;if("doubleValue"in s&&"doubleValue"in o)u=ge(s.doubleValue),l=ge(o.doubleValue);else{if(!(a!=null&&a.t))return!1;u=ge((h=s.integerValue)!=null?h:s.doubleValue),l=ge((f=o.integerValue)!=null?f:o.doubleValue)}return u===l?!!(a!=null&&a.i)||gs(u)===gs(l):!!(a===void 0||a.o)&&isNaN(u)&&isNaN(l)}(n,e,t);case 9:return ps(n.arrayValue.values||[],e.arrayValue.values||[],(i,s)=>zt(i,s,t));case 10:case 11:return function(s,o,a){const u=s.mapValue.fields||{},l=o.mapValue.fields||{};if(lu(u)!==lu(l))return!1;for(const h in u)if(u.hasOwnProperty(h)&&(l[h]===void 0||!zt(u[h],l[h],a)))return!1;return!0}(n,e,t);default:return j(52216,{left:n})}}function ma(n,e){return(n.values||[]).find(t=>zt(t,e))!==void 0}function ht(n,e){if(n===e)return 0;const t=qe(n),r=qe(e);if(t!==r)return Y(t,r);switch(t){case 0:case 9007199254740991:return 0;case 1:return Y(n.booleanValue,e.booleanValue);case 2:return function(s,o){const a=ge(s.integerValue||s.doubleValue),u=ge(o.integerValue||o.doubleValue);return a<u?-1:a>u?1:a===u?0:isNaN(a)?isNaN(u)?0:-1:1}(n,e);case 3:return xg(n.timestampValue,e.timestampValue);case 4:return xg(ms(n),ms(e));case 5:return Bh(n.stringValue,e.stringValue);case 6:return function(s,o){const a=Un(s),u=Un(o);return a.compareTo(u)}(n.bytesValue,e.bytesValue);case 7:return function(s,o){const a=s.split("/"),u=o.split("/");for(let l=0;l<a.length&&l<u.length;l++){const h=Y(a[l],u[l]);if(h!==0)return h}return Y(a.length,u.length)}(n.referenceValue,e.referenceValue);case 8:return function(s,o){const a=Y(ge(s.latitude),ge(o.latitude));return a!==0?a:Y(ge(s.longitude),ge(o.longitude))}(n.geoPointValue,e.geoPointValue);case 9:return Og(n.arrayValue,e.arrayValue);case 10:return function(s,o){var g,w,S,D;const a=s.fields||{},u=o.fields||{},l=(g=a[wi])==null?void 0:g.arrayValue,h=(w=u[wi])==null?void 0:w.arrayValue,f=Y(((S=l==null?void 0:l.values)==null?void 0:S.length)||0,((D=h==null?void 0:h.values)==null?void 0:D.length)||0);return f!==0?f:Og(l,h)}(n.mapValue,e.mapValue);case 11:return function(s,o){if(s===pr.mapValue&&o===pr.mapValue)return 0;if(s===pr.mapValue)return 1;if(o===pr.mapValue)return-1;const a=s.fields||{},u=Object.keys(a),l=o.fields||{},h=Object.keys(l);u.sort(),h.sort();for(let f=0;f<u.length&&f<h.length;++f){const g=Bh(u[f],h[f]);if(g!==0)return g;const w=ht(a[u[f]],l[h[f]]);if(w!==0)return w}return Y(u.length,h.length)}(n.mapValue,e.mapValue);default:throw j(23264,{u:t})}}function xg(n,e){if(typeof n=="string"&&typeof e=="string"&&n.length===e.length)return Y(n,e);const t=Fn(n),r=Fn(e),i=Y(t.seconds,r.seconds);return i!==0?i:Y(t.nanos,r.nanos)}function Og(n,e){const t=n.values||[],r=e.values||[];for(let i=0;i<t.length&&i<r.length;++i){const s=ht(t[i],r[i]);if(s!==void 0&&s!==0)return s}return Y(t.length,r.length)}function _s(n){return $h(n)}function $h(n){return"nullValue"in n?"null":"booleanValue"in n?""+n.booleanValue:"integerValue"in n?""+n.integerValue:"doubleValue"in n?""+n.doubleValue:"timestampValue"in n?function(t){const r=Fn(t);return`time(${r.seconds},${r.nanos})`}(n.timestampValue):"stringValue"in n?n.stringValue:"bytesValue"in n?function(t){return Un(t).toBase64()}(n.bytesValue):"referenceValue"in n?function(t){return B.fromName(t).toString()}(n.referenceValue):"geoPointValue"in n?function(t){return`geo(${t.latitude},${t.longitude})`}(n.geoPointValue):"arrayValue"in n?function(t){let r="[",i=!0;for(const s of t.values||[])i?i=!1:r+=",",r+=$h(s);return r+"]"}(n.arrayValue):"mapValue"in n?function(t){const r=Object.keys(t.fields||{}).sort();let i="{",s=!0;for(const o of r)s?s=!1:i+=",",i+=`${o}:${$h(t.fields[o])}`;return i+"}"}(n.mapValue):j(61005,{value:n})}function Kc(n){switch(qe(n)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:const e=Ga(n);return e?16+Kc(e):16;case 5:return 2*n.stringValue.length;case 6:return Un(n.bytesValue).approximateByteSize();case 7:return n.referenceValue.length;case 9:return function(r){return(r.values||[]).reduce((i,s)=>i+Kc(s),0)}(n.arrayValue);case 10:case 11:return function(r){let i=0;return Lr(r.fields,(s,o)=>{i+=s.length+Kc(o)}),i}(n.mapValue);default:throw j(13486,{value:n})}}function Ii(n,e){return{referenceValue:`projects/${n.projectId}/databases/${n.database}/documents/${e.path.canonicalString()}`}}function dn(n){return!!n&&"integerValue"in n}function ii(n){return!!n&&"doubleValue"in n}function Rr(n){return dn(n)||ii(n)}function Sr(n){return!!n&&"arrayValue"in n}function Lt(n){return!!n&&"nullValue"in n}function kt(n){return!!n&&"doubleValue"in n&&isNaN(Number(n.doubleValue))}function hi(n){return!!n&&"mapValue"in n}function Ti(n){var t,r;return((r=(((t=n==null?void 0:n.mapValue)==null?void 0:t.fields)||{})[tf])==null?void 0:r.stringValue)===nf}function jh(n){var e,t;return(t=(((e=n==null?void 0:n.mapValue)==null?void 0:e.fields)||{})[wi])==null?void 0:t.arrayValue}function Ho(n){if(n.geoPointValue)return{geoPointValue:G({},n.geoPointValue)};if(n.timestampValue&&typeof n.timestampValue=="object")return{timestampValue:G({},n.timestampValue)};if(n.mapValue){const e={mapValue:{fields:{}}};return Lr(n.mapValue.fields,(t,r)=>e.mapValue.fields[t]=Ho(r)),e}if(n.arrayValue){const e={arrayValue:{values:[]}};for(let t=0;t<(n.arrayValue.values||[]).length;++t)e.arrayValue.values[t]=Ho(n.arrayValue.values[t]);return e}return G({},n)}function AI(n){return(((n.mapValue||{}).fields||{}).__type__||{}).stringValue===vI}const bI={mapValue:{fields:{[tf]:{stringValue:nf},[wi]:{arrayValue:{}}}}};function Qk(n){return"nullValue"in n?gn:"booleanValue"in n?{booleanValue:!1}:"integerValue"in n||"doubleValue"in n?{doubleValue:NaN}:"timestampValue"in n?{timestampValue:{seconds:Number.MIN_SAFE_INTEGER}}:"stringValue"in n?{stringValue:""}:"bytesValue"in n?{bytesValue:""}:"referenceValue"in n?Ii(br.empty(),B.empty()):"geoPointValue"in n?{geoPointValue:{latitude:-90,longitude:-180}}:"arrayValue"in n?{arrayValue:{}}:"mapValue"in n?Ti(n)?bI:{mapValue:{}}:j(35942,{value:n})}function Jk(n){return"nullValue"in n?{booleanValue:!1}:"booleanValue"in n?{doubleValue:NaN}:"integerValue"in n||"doubleValue"in n?{timestampValue:{seconds:Number.MIN_SAFE_INTEGER}}:"timestampValue"in n?{stringValue:""}:"stringValue"in n?{bytesValue:""}:"bytesValue"in n?Ii(br.empty(),B.empty()):"referenceValue"in n?{geoPointValue:{latitude:-90,longitude:-180}}:"geoPointValue"in n?{arrayValue:{}}:"arrayValue"in n?bI:"mapValue"in n?Ti(n)?{mapValue:{}}:pr:j(61959,{value:n})}function Lg(n,e){const t=ht(n.value,e.value);return t!==0?t:n.inclusive&&!e.inclusive?-1:!n.inclusive&&e.inclusive?1:0}function Mg(n,e){const t=ht(n.value,e.value);return t!==0?t:n.inclusive&&!e.inclusive?1:!n.inclusive&&e.inclusive?-1:0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qe{constructor(e){this.value=e}static empty(){return new Qe({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let r=0;r<e.length-1;++r)if(t=(t.mapValue.fields||{})[e.get(r)],!hi(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=Ho(t)}setAll(e){let t=Ue.emptyPath(),r={},i=[];e.forEach((o,a)=>{if(!t.isImmediateParentOf(a)){const u=this.getFieldsMap(t);this.applyChanges(u,r,i),r={},i=[],t=a.popLast()}o?r[a.lastSegment()]=Ho(o):i.push(a.lastSegment())});const s=this.getFieldsMap(t);this.applyChanges(s,r,i)}delete(e){const t=this.field(e.popLast());hi(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return zt(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let r=0;r<e.length;++r){let i=t.mapValue.fields[e.get(r)];hi(i)&&i.mapValue.fields||(i={mapValue:{fields:{}}},t.mapValue.fields[e.get(r)]=i),t=i}return t.mapValue.fields}applyChanges(e,t,r){Lr(t,(i,s)=>e[i]=s);for(const i of r)delete e[i]}clone(){return new Qe(Ho(this.value))}}function RI(n){const e=[];return Lr(n.fields,(t,r)=>{const i=new Ue([t]);if(hi(r)){const s=RI(r.mapValue).fields;if(s.length===0)e.push(i);else for(const o of s)e.push(i.child(o))}else e.push(i)}),new bt(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Xu(n,e){if(n.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:gs(e)?"-0":e}}function rf(n){return{integerValue:""+n}}function Zu(n,e,t){return EI(e)?rf(e):Xu(n,e)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class el{constructor(){this._=void 0}}function Yk(n,e,t){return n instanceof ys?function(i,s){const o={fields:{[wI]:{stringValue:yI},[TI]:{timestampValue:{seconds:i.seconds,nanos:i.nanoseconds}}}};return s&&Ka(s)&&(s=Ga(s)),s&&(o.fields[II]=s),{mapValue:o}}(t,e):n instanceof Ei?PI(n,e):n instanceof vi?CI(n,e):n instanceof Ai?function(i,s){const o=SI(i,s),a=hu(o)+hu(i.l);return dn(o)&&dn(i.l)?rf(a):Xu(i.serializer,a)}(n,e):n instanceof ga?function(i,s){return Fg(i,s,Math.min)}(n,e):n instanceof _a?function(i,s){return Fg(i,s,Math.max)}(n,e):void 0}function Xk(n,e,t){return n instanceof Ei?PI(n,e):n instanceof vi?CI(n,e):t}function SI(n,e){return n instanceof Ai?Rr(e)?e:{integerValue:0}:null}class ys extends el{}class Ei extends el{constructor(e){super(),this.elements=e}}function PI(n,e){const t=kI(e);for(const r of n.elements)t.some(i=>zt(i,r))||t.push(r);return{arrayValue:{values:t}}}class vi extends el{constructor(e){super(),this.elements=e}}function CI(n,e){let t=kI(e);for(const r of n.elements)t=t.filter(i=>!zt(i,r));return{arrayValue:{values:t}}}class sf extends el{constructor(e,t){super(),this.serializer=e,this.l=t}}class Ai extends sf{}class ga extends sf{}class _a extends sf{}function Fg(n,e,t){if(!Rr(e))return n.l;const r=t(hu(e),hu(n.l));return dn(e)&&dn(n.l)?rf(r):Xu(n.serializer,r)}function hu(n){return ge(n.integerValue||n.doubleValue)}function kI(n){return Sr(n)&&n.arrayValue.values?n.arrayValue.values.slice():[]}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ha{constructor(e,t){this.field=e,this.transform=t}}function Zk(n,e){return n.field.isEqual(e.field)&&function(r,i){return r instanceof Ei&&i instanceof Ei||r instanceof vi&&i instanceof vi?ps(r.elements,i.elements,zt):r instanceof Ai&&i instanceof Ai||r instanceof ga&&i instanceof ga||r instanceof _a&&i instanceof _a?zt(r.l,i.l):r instanceof ys&&i instanceof ys}(n.transform,e.transform)}class eN{constructor(e,t){this.version=e,this.transformResults=t}}class Ee{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new Ee}static exists(e){return new Ee(void 0,e)}static updateTime(e){return new Ee(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function Gc(n,e){return n.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(n.updateTime):n.exists===void 0||n.exists===e.isFoundDocument()}class tl{}function NI(n,e){if(!n.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return n.isNoDocument()?new zs(n.key,Ee.none()):new js(n.key,n.data,Ee.none());{const t=n.data,r=Qe.empty();let i=new de(Ue.comparator);for(let s of e.fields)if(!i.has(s)){let o=t.field(s);o===null&&s.length>1&&(s=s.popLast(),o=t.field(s)),o===null?r.delete(s):r.set(s,o),i=i.add(s)}return new Qn(n.key,r,new bt(i.toArray()),Ee.none())}}function tN(n,e,t){n instanceof js?function(i,s,o){const a=i.value.clone(),u=Bg(i.fieldTransforms,s,o.transformResults);a.setAll(u),s.convertToFoundDocument(o.version,a).setHasCommittedMutations()}(n,e,t):n instanceof Qn?function(i,s,o){if(!Gc(i.precondition,s))return void s.convertToUnknownDocument(o.version);const a=Bg(i.fieldTransforms,s,o.transformResults),u=s.data;u.setAll(VI(i)),u.setAll(a),s.convertToFoundDocument(o.version,u).setHasCommittedMutations()}(n,e,t):function(i,s,o){s.convertToNoDocument(o.version).setHasCommittedMutations()}(0,e,t)}function Qo(n,e,t,r){return n instanceof js?function(s,o,a,u){if(!Gc(s.precondition,o))return a;const l=s.value.clone(),h=qg(s.fieldTransforms,u,o);return l.setAll(h),o.convertToFoundDocument(o.version,l).setHasLocalMutations(),null}(n,e,t,r):n instanceof Qn?function(s,o,a,u){if(!Gc(s.precondition,o))return a;const l=qg(s.fieldTransforms,u,o),h=o.data;return h.setAll(VI(s)),h.setAll(l),o.convertToFoundDocument(o.version,h).setHasLocalMutations(),a===null?null:a.unionWith(s.fieldMask.fields).unionWith(s.fieldTransforms.map(f=>f.field))}(n,e,t,r):function(s,o,a){return Gc(s.precondition,o)?(o.convertToNoDocument(o.version).setHasLocalMutations(),null):a}(n,e,t)}function nN(n,e){let t=null;for(const r of n.fieldTransforms){const i=e.data.field(r.field),s=SI(r.transform,i||null);s!=null&&(t===null&&(t=Qe.empty()),t.set(r.field,s))}return t||null}function Ug(n,e){return n.type===e.type&&!!n.key.isEqual(e.key)&&!!n.precondition.isEqual(e.precondition)&&!!function(r,i){return r===void 0&&i===void 0||!(!r||!i)&&ps(r,i,(s,o)=>Zk(s,o))}(n.fieldTransforms,e.fieldTransforms)&&(n.type===0?n.value.isEqual(e.value):n.type!==1||n.data.isEqual(e.data)&&n.fieldMask.isEqual(e.fieldMask))}class js extends tl{constructor(e,t,r,i=[]){super(),this.key=e,this.value=t,this.precondition=r,this.fieldTransforms=i,this.type=0}getFieldMask(){return null}}class Qn extends tl{constructor(e,t,r,i,s=[]){super(),this.key=e,this.data=t,this.fieldMask=r,this.precondition=i,this.fieldTransforms=s,this.type=1}getFieldMask(){return this.fieldMask}}function VI(n){const e=new Map;return n.fieldMask.fields.forEach(t=>{if(!t.isEmpty()){const r=n.data.field(t);e.set(t,r)}}),e}function Bg(n,e,t){const r=new Map;F(n.length===t.length,32656,{h:t.length,T:n.length});for(let i=0;i<t.length;i++){const s=n[i],o=s.transform,a=e.data.field(s.field);r.set(s.field,Xk(o,a,t[i]))}return r}function qg(n,e,t){const r=new Map;for(const i of n){const s=i.transform,o=t.data.field(i.field);r.set(i.field,Yk(s,o,e))}return r}class zs extends tl{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class of extends tl{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pr{constructor(e,t){this.position=e,this.inclusive=t}}function $g(n,e,t){let r=0;for(let i=0;i<n.position.length;i++){const s=e[i],o=n.position[i];if(s.field.isKeyField()?r=B.comparator(B.fromName(o.referenceValue),t.key):r=ht(o,t.data.field(s.field)),s.dir==="desc"&&(r*=-1),r!==0)break}return r}function jg(n,e){if(n===null)return e===null;if(e===null||n.inclusive!==e.inclusive||n.position.length!==e.position.length)return!1;for(let t=0;t<n.position.length;t++)if(!zt(n.position[t],e.position[t]))return!1;return!0}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class DI{}class se extends DI{constructor(e,t,r){super(),this.field=e,this.op=t,this.value=r}static create(e,t,r){return e.isKeyField()?t==="in"||t==="not-in"?this.createKeyFieldInFilter(e,t,r):new rN(e,t,r):t==="array-contains"?new oN(e,r):t==="in"?new UI(e,r):t==="not-in"?new aN(e,r):t==="array-contains-any"?new cN(e,r):new se(e,t,r)}static createKeyFieldInFilter(e,t,r){return t==="in"?new iN(e,r):new sN(e,r)}matches(e){const t=e.data.field(this.field);return this.op==="!="?t!==null&&t.nullValue===void 0&&this.matchesComparison(ht(t,this.value)):t!==null&&qe(this.value)===qe(t)&&this.matchesComparison(ht(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return j(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class fe extends DI{constructor(e,t){super(),this.filters=e,this.op=t,this.P=null}static create(e,t){return new fe(e,t)}matches(e){return ws(this)?this.filters.find(t=>!t.matches(e))===void 0:this.filters.find(t=>t.matches(e))!==void 0}getFlattenedFilters(){return this.P!==null||(this.P=this.filters.reduce((e,t)=>e.concat(t.getFlattenedFilters()),[])),this.P}getFilters(){return Object.assign([],this.filters)}}function ws(n){return n.op==="and"}function zh(n){return n.op==="or"}function af(n){return xI(n)&&ws(n)}function xI(n){for(const e of n.filters)if(e instanceof fe)return!1;return!0}function Kh(n){if(n instanceof se)return n.field.canonicalString()+n.op.toString()+_s(n.value);if(af(n))return n.filters.map(e=>Kh(e)).join(",");{const e=n.filters.map(t=>Kh(t)).join(",");return`${n.op}(${e})`}}function OI(n,e){return n instanceof se?function(r,i){return i instanceof se&&r.op===i.op&&r.field.isEqual(i.field)&&zt(r.value,i.value)}(n,e):n instanceof fe?function(r,i){return i instanceof fe&&r.op===i.op&&r.filters.length===i.filters.length?r.filters.reduce((s,o,a)=>s&&OI(o,i.filters[a]),!0):!1}(n,e):void j(19439)}function LI(n,e){const t=n.filters.concat(e);return fe.create(t,n.op)}function MI(n){return n instanceof se?function(t){return`${t.field.canonicalString()} ${t.op} ${_s(t.value)}`}(n):n instanceof fe?function(t){return t.op.toString()+" {"+t.getFilters().map(MI).join(" ,")+"}"}(n):"Filter"}class rN extends se{constructor(e,t,r){super(e,t,r),this.key=B.fromName(r.referenceValue)}matches(e){const t=B.comparator(e.key,this.key);return this.matchesComparison(t)}}class iN extends se{constructor(e,t){super(e,"in",t),this.keys=FI("in",t)}matches(e){return this.keys.some(t=>t.isEqual(e.key))}}class sN extends se{constructor(e,t){super(e,"not-in",t),this.keys=FI("not-in",t)}matches(e){return!this.keys.some(t=>t.isEqual(e.key))}}function FI(n,e){var t;return(((t=e.arrayValue)==null?void 0:t.values)||[]).map(r=>B.fromName(r.referenceValue))}class oN extends se{constructor(e,t){super(e,"array-contains",t)}matches(e){const t=e.data.field(this.field);return Sr(t)&&ma(t.arrayValue,this.value)}}class UI extends se{constructor(e,t){super(e,"in",t)}matches(e){const t=e.data.field(this.field);return t!==null&&ma(this.value.arrayValue,t)}}class aN extends se{constructor(e,t){super(e,"not-in",t)}matches(e){if(ma(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const t=e.data.field(this.field);return t!==null&&t.nullValue===void 0&&!ma(this.value.arrayValue,t)}}class cN extends se{constructor(e,t){super(e,"array-contains-any",t)}matches(e){const t=e.data.field(this.field);return!(!Sr(t)||!t.arrayValue.values)&&t.arrayValue.values.some(r=>ma(this.value.arrayValue,r))}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ya{constructor(e,t="asc"){this.field=e,this.dir=t}}function uN(n,e){return n.dir===e.dir&&n.field.isEqual(e.field)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class H{static fromTimestamp(e){return new H(e)}static min(){return new H(new le(0,0))}static max(){return new H(new le(253402300799,999999999))}constructor(e){this.timestamp=e}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class we{constructor(e,t,r,i,s,o,a){this.key=e,this.documentType=t,this.version=r,this.readTime=i,this.createTime=s,this.data=o,this.documentState=a}static newInvalidDocument(e){return new we(e,0,H.min(),H.min(),H.min(),Qe.empty(),0)}static newFoundDocument(e,t,r,i){return new we(e,1,t,H.min(),r,i,0)}static newNoDocument(e,t){return new we(e,2,t,H.min(),H.min(),Qe.empty(),0)}static newUnknownDocument(e,t){return new we(e,3,t,H.min(),H.min(),Qe.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual(H.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=Qe.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=Qe.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=H.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof we&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new we(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Is=-1;class du{constructor(e,t,r,i){this.indexId=e,this.collectionGroup=t,this.fields=r,this.indexState=i}}function Gh(n){return n.fields.find(e=>e.kind===2)}function Qr(n){return n.fields.filter(e=>e.kind!==2)}du.UNKNOWN_ID=-1;class Wc{constructor(e,t){this.fieldPath=e,this.kind=t}}class wa{constructor(e,t){this.sequenceNumber=e,this.offset=t}static empty(){return new wa(0,Mt.min())}}function BI(n,e){const t=n.toTimestamp().seconds,r=n.toTimestamp().nanoseconds+1,i=H.fromTimestamp(r===1e9?new le(t+1,0):new le(t,r));return new Mt(i,B.empty(),e)}function qI(n){return new Mt(n.readTime,n.key,Is)}class Mt{constructor(e,t,r){this.readTime=e,this.documentKey=t,this.largestBatchId=r}static min(){return new Mt(H.min(),B.empty(),Is)}static max(){return new Mt(H.max(),B.empty(),Is)}}function cf(n,e){let t=n.readTime.compareTo(e.readTime);return t!==0?t:(t=B.comparator(n.documentKey,e.documentKey),t!==0?t:Y(n.largestBatchId,e.largestBatchId))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lN{constructor(e,t=null,r=[],i=[],s=null,o=null,a=null){this.path=e,this.collectionGroup=t,this.orderBy=r,this.filters=i,this.limit=s,this.startAt=o,this.endAt=a,this.R=null}}function Wh(n,e=null,t=[],r=[],i=null,s=null,o=null){return new lN(n,e,t,r,i,s,o)}function fu(n){const e=$(n);if(e.R===null){let t=e.path.canonicalString();e.collectionGroup!==null&&(t+="|cg:"+e.collectionGroup),t+="|f:",t+=e.filters.map(r=>Kh(r)).join(","),t+="|ob:",t+=e.orderBy.map(r=>function(s){return s.field.canonicalString()+s.dir}(r)).join(","),Wa(e.limit)||(t+="|l:",t+=e.limit),e.startAt&&(t+="|lb:",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map(r=>_s(r)).join(",")),e.endAt&&(t+="|ub:",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map(r=>_s(r)).join(",")),e.R=t}return e.R}function uf(n,e){if(n.limit!==e.limit||n.orderBy.length!==e.orderBy.length)return!1;for(let t=0;t<n.orderBy.length;t++)if(!uN(n.orderBy[t],e.orderBy[t]))return!1;if(n.filters.length!==e.filters.length)return!1;for(let t=0;t<n.filters.length;t++)if(!OI(n.filters[t],e.filters[t]))return!1;return n.collectionGroup===e.collectionGroup&&!!n.path.isEqual(e.path)&&!!jg(n.startAt,e.startAt)&&jg(n.endAt,e.endAt)}function Cn(n){return!!n.isCorePipeline}function lf(n){return!!n.path&&B.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}function pu(n,e){return n.filters.filter(t=>t instanceof se&&t.field.isEqual(e))}function zg(n,e,t){let r=gn,i=!0;for(const s of pu(n,e)){let o=gn,a=!0;switch(s.op){case"<":case"<=":o=Qk(s.value);break;case"==":case"in":case">=":o=s.value;break;case">":o=s.value,a=!1;break;case"!=":case"not-in":o=gn}Lg({value:r,inclusive:i},{value:o,inclusive:a})<0&&(r=o,i=a)}if(t!==null){for(let s=0;s<n.orderBy.length;++s)if(n.orderBy[s].field.isEqual(e)){const o=t.position[s];Lg({value:r,inclusive:i},{value:o,inclusive:t.inclusive})<0&&(r=o,i=t.inclusive);break}}return{value:r,inclusive:i}}function Kg(n,e,t){let r=pr,i=!0;for(const s of pu(n,e)){let o=pr,a=!0;switch(s.op){case">=":case">":o=Jk(s.value),a=!1;break;case"==":case"in":case"<=":o=s.value;break;case"<":o=s.value,a=!1;break;case"!=":case"not-in":o=pr}Mg({value:r,inclusive:i},{value:o,inclusive:a})>0&&(r=o,i=a)}if(t!==null){for(let s=0;s<n.orderBy.length;++s)if(n.orderBy[s].field.isEqual(e)){const o=t.position[s];Mg({value:r,inclusive:i},{value:o,inclusive:t.inclusive})>0&&(r=o,i=t.inclusive);break}}return{value:r,inclusive:i}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jn{constructor(e,t=null,r=[],i=[],s=null,o="F",a=null,u=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=r,this.filters=i,this.limit=s,this.limitType=o,this.startAt=a,this.endAt=u,this.I=null,this.A=null,this.V=null,this.startAt,this.endAt}}function $I(n,e,t,r,i,s,o,a){return new Jn(n,e,t,r,i,s,o,a)}function Ks(n){return new Jn(n)}function Gg(n){return n.filters.length===0&&n.limit===null&&n.startAt==null&&n.endAt==null&&(n.explicitOrderBy.length===0||n.explicitOrderBy.length===1&&n.explicitOrderBy[0].field.isKeyField())}function hN(n){return B.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}function hf(n){return n.collectionGroup!==null}function as(n){const e=$(n);if(e.I===null){e.I=[];const t=new Set;for(const s of e.explicitOrderBy)e.I.push(s),t.add(s.field.canonicalString());const r=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(o){let a=new de(Ue.comparator);return o.filters.forEach(u=>{u.getFlattenedFilters().forEach(l=>{l.isInequality()&&(a=a.add(l.field))})}),a})(e).forEach(s=>{t.has(s.canonicalString())||s.isKeyField()||e.I.push(new ya(s,r))}),t.has(Ue.keyField().canonicalString())||e.I.push(new ya(Ue.keyField(),r))}return e.I}function wt(n){const e=$(n);return e.A||(e.A=dN(e,as(n))),e.A}function dN(n,e){if(n.limitType==="F")return Wh(n.path,n.collectionGroup,e,n.filters,n.limit,n.startAt,n.endAt);{e=e.map(i=>{const s=i.dir==="desc"?"asc":"desc";return new ya(i.field,s)});const t=n.endAt?new Pr(n.endAt.position,n.endAt.inclusive):null,r=n.startAt?new Pr(n.startAt.position,n.startAt.inclusive):null;return Wh(n.path,n.collectionGroup,e,n.filters,n.limit,t,r)}}function Hh(n,e){const t=n.filters.concat([e]);return new Jn(n.path,n.collectionGroup,n.explicitOrderBy.slice(),t,n.limit,n.limitType,n.startAt,n.endAt)}function fN(n,e){const t=n.explicitOrderBy.concat([e]);return new Jn(n.path,n.collectionGroup,t,n.filters.slice(),n.limit,n.limitType,n.startAt,n.endAt)}function mu(n,e,t){return new Jn(n.path,n.collectionGroup,n.explicitOrderBy.slice(),n.filters.slice(),e,t,n.startAt,n.endAt)}function pN(n,e){return new Jn(n.path,n.collectionGroup,n.explicitOrderBy.slice(),n.filters.slice(),n.limit,n.limitType,e,n.endAt)}function mN(n,e){return new Jn(n.path,n.collectionGroup,n.explicitOrderBy.slice(),n.filters.slice(),n.limit,n.limitType,n.startAt,e)}function jI(n,e){return uf(wt(n),wt(e))&&n.limitType===e.limitType}function Jo(n){return`Query(target=${function(t){let r=t.path.canonicalString();return t.collectionGroup!==null&&(r+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(r+=`, filters: [${t.filters.map(i=>MI(i)).join(", ")}]`),Wa(t.limit)||(r+=", limit: "+t.limit),t.orderBy.length>0&&(r+=`, orderBy: [${t.orderBy.map(i=>function(o){return`${o.field.canonicalString()} (${o.dir})`}(i)).join(", ")}]`),t.startAt&&(r+=", startAt: ",r+=t.startAt.inclusive?"b:":"a:",r+=t.startAt.position.map(i=>_s(i)).join(",")),t.endAt&&(r+=", endAt: ",r+=t.endAt.inclusive?"a:":"b:",r+=t.endAt.position.map(i=>_s(i)).join(",")),`Target(${r})`}(wt(n))}; limitType=${n.limitType})`}function nl(n,e){return e.isFoundDocument()&&function(r,i){const s=i.key.path;return r.collectionGroup!==null?i.key.hasCollectionId(r.collectionGroup)&&r.path.isPrefixOf(s):B.isDocumentKey(r.path)?r.path.isEqual(s):r.path.isImmediateParentOf(s)}(n,e)&&function(r,i){for(const s of as(r))if(!s.field.isKeyField()&&i.data.field(s.field)===null)return!1;return!0}(n,e)&&function(r,i){for(const s of r.filters)if(!s.matches(i))return!1;return!0}(n,e)&&function(r,i){return!(r.startAt&&!function(o,a,u){const l=$g(o,a,u);return o.inclusive?l<=0:l<0}(r.startAt,as(r),i)||r.endAt&&!function(o,a,u){const l=$g(o,a,u);return o.inclusive?l>=0:l>0}(r.endAt,as(r),i))}(n,e)}function df(n){return(e,t)=>{let r=!1;for(const i of as(n)){const s=gN(i,e,t);if(s!==0)return s;r=r||i.field.isKeyField()}return 0}}function gN(n,e,t){const r=n.field.isKeyField()?B.comparator(e.key,t.key):function(s,o,a){const u=o.data.field(s),l=a.data.field(s);return u!==null&&l!==null?ht(u,l):j(42886)}(n.field,e,t);switch(n.dir){case"asc":return r;case"desc":return-1*r;default:return j(19790,{direction:n.dir})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _N{constructor(e,t){this.count=e,this.unchangedNames=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var xe,oe;function zI(n){switch(n){case k.OK:return j(64938);case k.CANCELLED:case k.UNKNOWN:case k.DEADLINE_EXCEEDED:case k.RESOURCE_EXHAUSTED:case k.INTERNAL:case k.UNAVAILABLE:case k.UNAUTHENTICATED:return!1;case k.INVALID_ARGUMENT:case k.NOT_FOUND:case k.ALREADY_EXISTS:case k.PERMISSION_DENIED:case k.FAILED_PRECONDITION:case k.ABORTED:case k.OUT_OF_RANGE:case k.UNIMPLEMENTED:case k.DATA_LOSS:return!0;default:return j(15467,{code:n})}}function KI(n){if(n===void 0)return Ne("GRPC error has no .code"),k.UNKNOWN;switch(n){case xe.OK:return k.OK;case xe.CANCELLED:return k.CANCELLED;case xe.UNKNOWN:return k.UNKNOWN;case xe.DEADLINE_EXCEEDED:return k.DEADLINE_EXCEEDED;case xe.RESOURCE_EXHAUSTED:return k.RESOURCE_EXHAUSTED;case xe.INTERNAL:return k.INTERNAL;case xe.UNAVAILABLE:return k.UNAVAILABLE;case xe.UNAUTHENTICATED:return k.UNAUTHENTICATED;case xe.INVALID_ARGUMENT:return k.INVALID_ARGUMENT;case xe.NOT_FOUND:return k.NOT_FOUND;case xe.ALREADY_EXISTS:return k.ALREADY_EXISTS;case xe.PERMISSION_DENIED:return k.PERMISSION_DENIED;case xe.FAILED_PRECONDITION:return k.FAILED_PRECONDITION;case xe.ABORTED:return k.ABORTED;case xe.OUT_OF_RANGE:return k.OUT_OF_RANGE;case xe.UNIMPLEMENTED:return k.UNIMPLEMENTED;case xe.DATA_LOSS:return k.DATA_LOSS;default:return j(39323,{code:n})}}(oe=xe||(xe={}))[oe.OK=0]="OK",oe[oe.CANCELLED=1]="CANCELLED",oe[oe.UNKNOWN=2]="UNKNOWN",oe[oe.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",oe[oe.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",oe[oe.NOT_FOUND=5]="NOT_FOUND",oe[oe.ALREADY_EXISTS=6]="ALREADY_EXISTS",oe[oe.PERMISSION_DENIED=7]="PERMISSION_DENIED",oe[oe.UNAUTHENTICATED=16]="UNAUTHENTICATED",oe[oe.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",oe[oe.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",oe[oe.ABORTED=10]="ABORTED",oe[oe.OUT_OF_RANGE=11]="OUT_OF_RANGE",oe[oe.UNIMPLEMENTED=12]="UNIMPLEMENTED",oe[oe.INTERNAL=13]="INTERNAL",oe[oe.UNAVAILABLE=14]="UNAVAILABLE",oe[oe.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yn{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r!==void 0){for(const[i,s]of r)if(this.equalsFn(i,e))return s}}has(e){return this.get(e)!==void 0}set(e,t){const r=this.mapKeyFn(e),i=this.inner[r];if(i===void 0)return this.inner[r]=[[e,t]],void this.innerSize++;for(let s=0;s<i.length;s++)if(this.equalsFn(i[s][0],e))return void(i[s]=[e,t]);i.push([e,t]),this.innerSize++}delete(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r===void 0)return!1;for(let i=0;i<r.length;i++)if(this.equalsFn(r[i][0],e))return r.length===1?delete this.inner[t]:r.splice(i,1),this.innerSize--,!0;return!1}forEach(e){Lr(this.inner,(t,r)=>{for(const[i,s]of r)e(i,s)})}isEmpty(){return pI(this.inner)}size(){return this.innerSize}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const yN=new me(B.comparator);function Le(){return yN}const GI=new me(B.comparator);function Yr(...n){let e=GI;for(const t of n)e=e.insert(t.key,t);return e}function WI(n){let e=GI;return n.forEach((t,r)=>e=e.insert(t,r.overlayedDocument)),e}function Ut(){return Yo()}function HI(){return Yo()}function Yo(){return new Yn(n=>n.toString(),(n,e)=>n.isEqual(e))}const wN=new me(B.comparator),IN=new de(B.comparator);function Z(...n){let e=IN;for(const t of n)e=e.add(t);return e}const TN=new de(Y);function ff(){return TN}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function QI(){return new TextEncoder}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const EN=new yr([4294967295,4294967295],0);function Wg(n){const e=QI().encode(n),t=new oI;return t.update(e),new Uint8Array(t.digest())}function Hg(n){const e=new DataView(n.buffer),t=e.getUint32(0,!0),r=e.getUint32(4,!0),i=e.getUint32(8,!0),s=e.getUint32(12,!0);return[new yr([t,r],0),new yr([i,s],0)]}class pf{constructor(e,t,r){if(this.bitmap=e,this.padding=t,this.hashCount=r,t<0||t>=8)throw new Uo(`Invalid padding: ${t}`);if(r<0)throw new Uo(`Invalid hash count: ${r}`);if(e.length>0&&this.hashCount===0)throw new Uo(`Invalid hash count: ${r}`);if(e.length===0&&t!==0)throw new Uo(`Invalid padding when bitmap length is 0: ${t}`);this.m=8*e.length-t,this.p=yr.fromNumber(this.m)}S(e,t,r){let i=e.add(t.multiply(yr.fromNumber(r)));return i.compare(EN)===1&&(i=new yr([i.getBits(0),i.getBits(1)],0)),i.modulo(this.p).toNumber()}v(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(this.m===0)return!1;const t=Wg(e),[r,i]=Hg(t);for(let s=0;s<this.hashCount;s++){const o=this.S(r,i,s);if(!this.v(o))return!1}return!0}static create(e,t,r){const i=e%8==0?0:8-e%8,s=new Uint8Array(Math.ceil(e/8)),o=new pf(s,i,t);return r.forEach(a=>o.insert(a)),o}insert(e){if(this.m===0)return;const t=Wg(e),[r,i]=Hg(t);for(let s=0;s<this.hashCount;s++){const o=this.S(r,i,s);this.D(o)}}D(e){const t=Math.floor(e/8),r=e%8;this.bitmap[t]|=1<<r}}class Uo extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gs{constructor(e,t,r,i,s,o){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=r,this.documentUpdates=i,this.augmentedDocumentUpdates=s,this.resolvedLimboDocuments=o}static createSynthesizedRemoteEventForCurrentChange(e,t,r){const i=new Map;return i.set(e,Qa.createSynthesizedTargetChangeForCurrentChange(e,t,r)),new Gs(H.min(),i,new me(Y),Le(),Le(),Z())}}class Qa{constructor(e,t,r,i,s){this.resumeToken=e,this.current=t,this.addedDocuments=r,this.modifiedDocuments=i,this.removedDocuments=s}static createSynthesizedTargetChangeForCurrentChange(e,t,r){return new Qa(r,t,Z(),Z(),Z())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hc{constructor(e,t,r,i){this.C=e,this.removedTargetIds=t,this.key=r,this.F=i}}class JI{constructor(e,t){this.targetId=e,this.O=t}}class YI{constructor(e,t,r=Ie.EMPTY_BYTE_STRING,i=null){this.state=e,this.targetIds=t,this.resumeToken=r,this.cause=i}}class Qg{constructor(e){this.targetId=e,this.M=0,this.N=Jg(),this.L=Ie.EMPTY_BYTE_STRING,this.B=!1,this.U=!0}get current(){return this.B}get resumeToken(){return this.L}get k(){return this.M!==0}get q(){return this.U}$(e){e.approximateByteSize()>0&&(this.U=!0,this.L=e)}K(){let e=Z(),t=Z(),r=Z();return this.N.forEach((i,s)=>{switch(s){case 0:e=e.add(i);break;case 2:t=t.add(i);break;case 1:r=r.add(i);break;default:j(38017,{changeType:s})}}),new Qa(this.L,this.B,e,t,r)}W(){this.U=!1,this.N=Jg()}G(e,t){this.U=!0,this.N=this.N.insert(e,t)}j(e){this.U=!0,this.N=this.N.remove(e)}H(){this.M+=1}J(){this.M-=1,F(this.M>=0,3241,{M:this.M,targetId:this.targetId})}Y(){this.U=!0,this.B=!0}}const Po="WatchChangeAggregator";class vN{constructor(e){this.Z=e,this.X=new Map,this.ee=Le(),this.te=kc(),this.ne=Le(),this.re=kc(),this.ie=new me(Y)}se(e){for(const t of e.C)e.F&&e.F.isFoundDocument()?this._e(t,e.F):this.oe(t,e.key,e.F);for(const t of e.removedTargetIds)this.oe(t,e.key,e.F)}ae(e){this.forEachTarget(e,t=>{const r=this.X.get(t);if(r)switch(e.state){case 0:this.ue(t)&&r.$(e.resumeToken);break;case 1:r.J(),r.k||r.W(),r.$(e.resumeToken);break;case 2:r.J(),r.k||this.removeTarget(t);break;case 3:this.ue(t)&&(r.Y(),r.$(e.resumeToken));break;case 4:this.ue(t)&&(this.ce(t),r.$(e.resumeToken));break;default:j(56790,{state:e.state})}else L(Po,`handleTargetChange received targetChange for untracked target ID (${t}) with state (${e.state})`)})}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.X.forEach((r,i)=>{this.ue(i)&&t(i)})}le(e){var t;return Cn(e)?e.getPipelineSourceType()==="documents"&&((t=e.getPipelineDocuments())==null?void 0:t.length)===1:lf(e)}Ee(e){const t=e.targetId,r=e.O.count,i=this.he(t);if(i){const s=i.target;if(this.le(s))if(r===0){const o=new B(Cn(s)?te.fromString(s.getPipelineDocuments()[0]):s.path);this.oe(t,o,we.newNoDocument(o,H.min()))}else F(r===1,20013,"Single document existence filter with count: "+r);else{const o=this.Te(t);if(o!==r){const a=this.Pe(e),u=a?this.Re(a,e,o):1;if(u!==0){this.ce(t);const l=u===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.ie=this.ie.insert(t,l)}}}}}Pe(e){const t=e.O.unchangedNames;if(!t||!t.bits)return null;const{bits:{bitmap:r="",padding:i=0},hashCount:s=0}=t;let o,a;try{o=Un(r).toUint8Array()}catch(u){if(u instanceof _I)return lt("Decoding the base64 bloom filter in existence filter failed ("+u.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw u}try{a=new pf(o,i,s)}catch(u){return lt(u instanceof Uo?"BloomFilter error: ":"Applying bloom filter failed: ",u),null}return a.m===0?null:a}Re(e,t,r){return t.O.count===r-this.Ve(e,t.targetId)?0:2}Ve(e,t){const r=this.Z.getRemoteKeysForTarget(t);let i=0;return r.forEach(s=>{const o=this.Z.Ae(),a=`projects/${o.projectId}/databases/${o.database}/documents/${s.path.canonicalString()}`;e.mightContain(a)||(this.oe(t,s,null),i++)}),i}de(e){const t=new Map;this.X.forEach((s,o)=>{const a=this.he(o);if(a){if(s.current&&this.le(a.target)){const u=Cn(a.target)?te.fromString(a.target.getPipelineDocuments()[0]):a.target.path,l=new B(u);this.fe(l).has(o)||this.me(o,l)||this.oe(o,l,we.newNoDocument(l,e))}s.q&&(t.set(o,s.K()),s.W())}});let r=Z();this.re.forEach((s,o)=>{let a=!0;o.forEachWhile(u=>{const l=this.he(u);return!l||l.purpose==="TargetPurposeLimboResolution"||(a=!1,!1)}),a&&(r=r.add(s))}),this.ee.forEach((s,o)=>o.setReadTime(e)),this.ne.forEach((s,o)=>o.setReadTime(e));const i=new Gs(e,t,this.ie,this.ee,this.ne,r);return this.ee=Le(),this.te=kc(),this.ne=Le(),this.re=kc(),this.ie=new me(Y),i}_e(e,t){const r=this.X.get(e);if(!r||!this.ue(e))return void L(Po,`addDocumentToTarget received document for unknown inactive target (${e})`);const i=this.me(e,t.key)?2:0;r.G(t.key,i),Cn(this.he(e).target)&&this.he(e).target.getPipelineFlavor()!=="exact"?this.ne=this.ne.insert(t.key,t):this.ee=this.ee.insert(t.key,t),this.te=this.te.insert(t.key,this.fe(t.key).add(e)),this.re=this.re.insert(t.key,this.pe(t.key).add(e))}oe(e,t,r){const i=this.X.get(e);i&&this.ue(e)?(this.me(e,t)?i.G(t,1):i.j(t),this.re=this.re.insert(t,this.pe(t).delete(e)),this.re=this.re.insert(t,this.pe(t).add(e)),r&&(Cn(this.he(e).target)&&this.he(e).target.getPipelineFlavor()!=="exact"?this.ne=this.ne.insert(t,r):this.ee=this.ee.insert(t,r))):L(Po,`removeDocumentFromTarget received document for unknown or inactive target (${e})`)}removeTarget(e){this.X.delete(e)}Te(e){const t=this.X.get(e);if(!t)return 0;const r=t.K();return this.Z.getRemoteKeysForTarget(e).size+r.addedDocuments.size-r.removedDocuments.size}H(e){let t=this.X.get(e);t||(L(Po,`recordPendingTargetRequest set up tracking for target ID ${e}`),t=new Qg(e),this.X.set(e,t)),t.H()}pe(e){let t=this.re.get(e);return t||(t=new de(Y),this.re=this.re.insert(e,t)),t}fe(e){let t=this.te.get(e);return t||(t=new de(Y),this.te=this.te.insert(e,t)),t}ue(e){const t=this.he(e)!==null;return t||L(Po,"Detected inactive target",e),t}he(e){const t=this.X.get(e);return t===void 0||t.k?null:this.Z.ge(e)}ce(e){this.X.set(e,new Qg(e)),this.Z.getRemoteKeysForTarget(e).forEach(t=>{this.oe(e,t,null)})}me(e,t){return this.Z.getRemoteKeysForTarget(e).has(t)}}function kc(){return new me(B.comparator)}function Jg(){return new me(B.comparator)}const AN={asc:"ASCENDING",desc:"DESCENDING"},bN={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},RN={and:"AND",or:"OR"};class SN{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function Qh(n,e){return n.useProto3Json||Wa(e)?e:{value:e}}function Ts(n,e){return n.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function mf(n){const e=Fn(n);return new le(e.seconds,e.nanos)}function XI(n,e){return n.useProto3Json?e.toBase64():e.toUint8Array()}function Qc(n,e){return Ts(n,e.toTimestamp())}function Ve(n){return F(!!n,49232),H.fromTimestamp(mf(n))}function gf(n,e){return Jh(n,e).canonicalString()}function Jh(n,e){const t=function(i){return new te(["projects",i.projectId,"databases",i.database])}(n).child("documents");return e===void 0?t:t.child(e)}function ZI(n){const e=te.fromString(n);return F(lT(e),10190,{key:e.toString()}),e}function Es(n,e){return gf(n.databaseId,e.path)}function _n(n,e){const t=ZI(e);if(t.get(1)!==n.databaseId.projectId)throw new O(k.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+t.get(1)+" vs "+n.databaseId.projectId);if(t.get(3)!==n.databaseId.database)throw new O(k.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+t.get(3)+" vs "+n.databaseId.database);return new B(nT(t))}function eT(n,e){return gf(n.databaseId,e)}function tT(n){const e=ZI(n);return e.length===4?te.emptyPath():nT(e)}function Yh(n){return new te(["projects",n.databaseId.projectId,"databases",n.databaseId.database]).canonicalString()}function nT(n){return F(n.length>4&&n.get(4)==="documents",29091,{key:n.toString()}),n.popFirst(5)}function Yg(n,e,t){return{name:Es(n,e),fields:t.value.mapValue.fields}}function rT(n,e,t){const r=_n(n,e.name),i=Ve(e.updateTime),s=e.createTime?Ve(e.createTime):H.min(),o=new Qe({mapValue:{fields:e.fields}}),a=we.newFoundDocument(r,i,s,o);return t&&a.setHasCommittedMutations(),t?a.setHasCommittedMutations():a}function PN(n,e){return"found"in e?function(r,i){F(!!i.found,43571),i.found.name,i.found.updateTime;const s=_n(r,i.found.name),o=Ve(i.found.updateTime),a=i.found.createTime?Ve(i.found.createTime):H.min(),u=new Qe({mapValue:{fields:i.found.fields}});return we.newFoundDocument(s,o,a,u)}(n,e):"missing"in e?function(r,i){F(!!i.missing,3894),F(!!i.readTime,22933);const s=_n(r,i.missing),o=Ve(i.readTime);return we.newNoDocument(s,o)}(n,e):j(7234,{result:e})}function CN(n,e){let t;if("targetChange"in e){e.targetChange;const r=function(l){return l==="NO_CHANGE"?0:l==="ADD"?1:l==="REMOVE"?2:l==="CURRENT"?3:l==="RESET"?4:j(39313,{state:l})}(e.targetChange.targetChangeType||"NO_CHANGE"),i=e.targetChange.targetIds||[],s=function(l,h){return l.useProto3Json?(F(h===void 0||typeof h=="string",58123),Ie.fromBase64String(h||"")):(F(h===void 0||h instanceof Buffer||h instanceof Uint8Array,16193),Ie.fromUint8Array(h||new Uint8Array))}(n,e.targetChange.resumeToken),o=e.targetChange.cause,a=o&&function(l){const h=l.code===void 0?k.UNKNOWN:KI(l.code);return new O(h,l.message||"")}(o);t=new YI(r,i,s,a||null)}else if("documentChange"in e){e.documentChange;const r=e.documentChange;r.document,r.document.name,r.document.updateTime;const i=_n(n,r.document.name),s=Ve(r.document.updateTime),o=r.document.createTime?Ve(r.document.createTime):H.min(),a=new Qe({mapValue:{fields:r.document.fields}}),u=we.newFoundDocument(i,s,o,a),l=r.targetIds||[],h=r.removedTargetIds||[];t=new Hc(l,h,u.key,u)}else if("documentDelete"in e){e.documentDelete;const r=e.documentDelete;r.document;const i=_n(n,r.document),s=r.readTime?Ve(r.readTime):H.min(),o=we.newNoDocument(i,s),a=r.removedTargetIds||[];t=new Hc([],a,o.key,o)}else if("documentRemove"in e){e.documentRemove;const r=e.documentRemove;r.document;const i=_n(n,r.document),s=r.removedTargetIds||[];t=new Hc([],s,i,null)}else{if(!("filter"in e))return j(11601,{ye:e});{e.filter;const r=e.filter;r.targetId;const{count:i=0,unchangedNames:s}=r,o=new _N(i,s),a=r.targetId;t=new JI(a,o)}}return t}function Ia(n,e){let t;if(e instanceof js)t={update:Yg(n,e.key,e.value)};else if(e instanceof zs)t={delete:Es(n,e.key)};else if(e instanceof Qn)t={update:Yg(n,e.key,e.data),updateMask:ON(e.fieldMask)};else{if(!(e instanceof of))return j(16599,{we:e.type});t={verify:Es(n,e.key)}}return e.fieldTransforms.length>0&&(t.updateTransforms=e.fieldTransforms.map(r=>function(s,o){const a=o.transform;if(a instanceof ys)return{fieldPath:o.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(a instanceof Ei)return{fieldPath:o.field.canonicalString(),appendMissingElements:{values:a.elements}};if(a instanceof vi)return{fieldPath:o.field.canonicalString(),removeAllFromArray:{values:a.elements}};if(a instanceof Ai)return{fieldPath:o.field.canonicalString(),increment:a.l};if(a instanceof ga)return{fieldPath:o.field.canonicalString(),minimum:a.l};if(a instanceof _a)return{fieldPath:o.field.canonicalString(),maximum:a.l};throw j(20930,{transform:o.transform})}(0,r))),e.precondition.isNone||(t.currentDocument=function(i,s){return s.updateTime!==void 0?{updateTime:Qc(i,s.updateTime)}:s.exists!==void 0?{exists:s.exists}:j(27497)}(n,e.precondition)),t}function Xh(n,e){const t=e.currentDocument?function(s){return s.updateTime!==void 0?Ee.updateTime(Ve(s.updateTime)):s.exists!==void 0?Ee.exists(s.exists):Ee.none()}(e.currentDocument):Ee.none(),r=e.updateTransforms?e.updateTransforms.map(i=>function(o,a){let u=null;if("setToServerValue"in a)F(a.setToServerValue==="REQUEST_TIME",16630,{proto:a}),u=new ys;else if("appendMissingElements"in a){const h=a.appendMissingElements.values||[];u=new Ei(h)}else if("removeAllFromArray"in a){const h=a.removeAllFromArray.values||[];u=new vi(h)}else"increment"in a?u=new Ai(o,a.increment):"minimum"in a?u=new ga(o,a.minimum):"maximum"in a?u=new _a(o,a.maximum):j(16584,{proto:a});const l=Ue.fromServerFormat(a.fieldPath);return new Ha(l,u)}(n,i)):[];if(e.update){e.update.name;const i=_n(n,e.update.name),s=new Qe({mapValue:{fields:e.update.fields}});if(e.updateMask){const o=function(u){const l=u.fieldPaths||[];return new bt(l.map(h=>Ue.fromServerFormat(h)))}(e.updateMask);return new Qn(i,s,o,t,r)}return new js(i,s,t,r)}if(e.delete){const i=_n(n,e.delete);return new zs(i,t)}if(e.verify){const i=_n(n,e.verify);return new of(i,t)}return j(1463,{proto:e})}function kN(n,e){return n&&n.length>0?(F(e!==void 0,14353),n.map(t=>function(i,s){let o=i.updateTime?Ve(i.updateTime):Ve(s);return o.isEqual(H.min())&&(o=Ve(s)),new eN(o,i.transformResults||[])}(t,e))):[]}function iT(n,e){return{documents:[eT(n,e.path)]}}function sT(n,e){const t={structuredQuery:{}},r=e.path;let i;e.collectionGroup!==null?(i=r,t.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(i=r.popLast(),t.structuredQuery.from=[{collectionId:r.lastSegment()}]),t.parent=eT(n,i);const s=function(l){if(l.length!==0)return uT(fe.create(l,"and"))}(e.filters);s&&(t.structuredQuery.where=s);const o=function(l){if(l.length!==0)return l.map(h=>function(g){return{field:Xi(g.field),direction:VN(g.dir)}}(h))}(e.orderBy);o&&(t.structuredQuery.orderBy=o);const a=Qh(n,e.limit);return a!==null&&(t.structuredQuery.limit=a),e.startAt&&(t.structuredQuery.startAt=function(l){return{before:l.inclusive,values:l.position}}(e.startAt)),e.endAt&&(t.structuredQuery.endAt=function(l){return{before:!l.inclusive,values:l.position}}(e.endAt)),{be:t,parent:i}}function oT(n){let e=tT(n.parent);const t=n.structuredQuery,r=t.from?t.from.length:0;let i=null;if(r>0){F(r===1,65062);const h=t.from[0];h.allDescendants?i=h.collectionId:e=e.child(h.collectionId)}let s=[];t.where&&(s=function(f){const g=cT(f);return g instanceof fe&&af(g)?g.getFilters():[g]}(t.where));let o=[];t.orderBy&&(o=function(f){return f.map(g=>function(S){return new ya(Zi(S.field),function(x){switch(x){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(S.direction))}(g))}(t.orderBy));let a=null;t.limit&&(a=function(f){let g;return g=typeof f=="object"?f.value:f,Wa(g)?null:g}(t.limit));let u=null;t.startAt&&(u=function(f){const g=!!f.before,w=f.values||[];return new Pr(w,g)}(t.startAt));let l=null;return t.endAt&&(l=function(f){const g=!f.before,w=f.values||[];return new Pr(w,g)}(t.endAt)),$I(e,i,o,s,a,"F",u,l)}function NN(n,e){const t=function(i){switch(i){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return j(28987,{purpose:i})}}(e.purpose);return t==null?null:{"goog-listen-tags":t}}function aT(n,e){return{structuredPipeline:{pipeline:{stages:e.stages.map(t=>t._toProto(n))}}}}function cT(n){return n.unaryFilter!==void 0?function(t){switch(t.unaryFilter.op){case"IS_NAN":const r=Zi(t.unaryFilter.field);return se.create(r,"==",{doubleValue:NaN});case"IS_NULL":const i=Zi(t.unaryFilter.field);return se.create(i,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const s=Zi(t.unaryFilter.field);return se.create(s,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const o=Zi(t.unaryFilter.field);return se.create(o,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return j(61313);default:return j(60726)}}(n):n.fieldFilter!==void 0?function(t){return se.create(Zi(t.fieldFilter.field),function(i){switch(i){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return j(58110);default:return j(50506)}}(t.fieldFilter.op),t.fieldFilter.value)}(n):n.compositeFilter!==void 0?function(t){return fe.create(t.compositeFilter.filters.map(r=>cT(r)),function(i){switch(i){case"AND":return"and";case"OR":return"or";default:return j(1026)}}(t.compositeFilter.op))}(n):j(30097,{filter:n})}function VN(n){return AN[n]}function DN(n){return bN[n]}function xN(n){return RN[n]}function Xi(n){return{fieldPath:n.canonicalString()}}function Zi(n){return Ue.fromServerFormat(n.fieldPath)}function uT(n){return n instanceof se?function(t){if(t.op==="=="){if(kt(t.value))return{unaryFilter:{field:Xi(t.field),op:"IS_NAN"}};if(Lt(t.value))return{unaryFilter:{field:Xi(t.field),op:"IS_NULL"}}}else if(t.op==="!="){if(kt(t.value))return{unaryFilter:{field:Xi(t.field),op:"IS_NOT_NAN"}};if(Lt(t.value))return{unaryFilter:{field:Xi(t.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:Xi(t.field),op:DN(t.op),value:t.value}}}(n):n instanceof fe?function(t){const r=t.getFilters().map(i=>uT(i));return r.length===1?r[0]:{compositeFilter:{op:xN(t.op),filters:r}}}(n):j(54877,{filter:n})}function ON(n){const e=[];return n.fields.forEach(t=>e.push(t.canonicalString())),{fieldPaths:e}}function lT(n){return n.length>=4&&n.get(0)==="projects"&&n.get(2)==="databases"}function hT(n){return!!n&&typeof n._toProto=="function"&&n._protoValueType==="ProtoValue"}function Ta(n,e){const t={fields:{}};return e.forEach((r,i)=>{if(typeof i!="string")throw new Error(`Cannot encode map with non-string key: ${i}`);t.fields[i]=r._toProto(n)}),{mapValue:t}}function dT(n){return{stringValue:n}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ja(n){return new SN(n,!0)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class at{constructor(e){this._byteString=e}static fromBase64String(e){try{return new at(Ie.fromBase64String(e))}catch(t){throw new O(k.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new at(Ie.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:at._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(za(e,at._jsonSchema))return at.fromBase64String(e.bytes)}}at._jsonSchemaVersion="firestore/bytes/1.0",at._jsonSchema={type:Me("string",at._jsonSchemaVersion),bytes:Me("string")};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Cr=class{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new O(k.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new Ue(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}};function LN(){return new Cr(hn)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Vi=class{constructor(e){this._methodName=e}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qt{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new O(k.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new O(k.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return Y(this._lat,e._lat)||Y(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:Qt._jsonSchemaVersion}}static fromJSON(e){if(za(e,Qt._jsonSchema))return new Qt(e.latitude,e.longitude)}}Qt._jsonSchemaVersion="firestore/geoPoint/1.0",Qt._jsonSchema={type:Me("string",Qt._jsonSchemaVersion),latitude:Me("number"),longitude:Me("number")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class He{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}He.UNAUTHENTICATED=new He(null),He.GOOGLE_CREDENTIALS=new He("google-credentials-uid"),He.FIRST_PARTY=new He("first-party-uid"),He.MOCK_USER=new He("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ze{constructor(){this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fT{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class MN{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable(()=>t(He.UNAUTHENTICATED))}shutdown(){}}class FN{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable(()=>t(this.token.user))}shutdown(){this.changeListener=null}}class UN{constructor(e){this.ve=e,this.currentUser=He.UNAUTHENTICATED,this.De=0,this.forceRefresh=!1,this.auth=null}start(e,t){F(this.xe===void 0,42304);let r=this.De;const i=u=>this.De!==r?(r=this.De,t(u)):Promise.resolve();let s=new Ze;this.xe=()=>{this.De++,this.currentUser=this.Ce(),s.resolve(),s=new Ze,e.enqueueRetryable(()=>i(this.currentUser))};const o=()=>{const u=s;e.enqueueRetryable(()=>p(this,null,function*(){yield u.promise,yield i(this.currentUser)}))},a=u=>{L("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=u,this.xe&&(this.auth.addAuthTokenListener(this.xe),o())};this.ve.onInit(u=>a(u)),setTimeout(()=>{if(!this.auth){const u=this.ve.getImmediate({optional:!0});u?a(u):(L("FirebaseAuthCredentialsProvider","Auth not yet detected"),s.resolve(),s=new Ze)}},0),o()}getToken(){const e=this.De,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then(r=>this.De!==e?(L("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):r?(F(typeof r.accessToken=="string",31837,{Fe:r}),new fT(r.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.xe&&this.auth.removeAuthTokenListener(this.xe),this.xe=void 0}Ce(){const e=this.auth&&this.auth.getUid();return F(e===null||typeof e=="string",2055,{Oe:e}),new He(e)}}class BN{constructor(e,t,r){this.Me=e,this.Ne=t,this.Le=r,this.type="FirstParty",this.user=He.FIRST_PARTY,this.Be=new Map}Ue(){return this.Le?this.Le():null}get headers(){this.Be.set("X-Goog-AuthUser",this.Me);const e=this.Ue();return e&&this.Be.set("Authorization",e),this.Ne&&this.Be.set("X-Goog-Iam-Authorization-Token",this.Ne),this.Be}}class qN{constructor(e,t,r){this.Me=e,this.Ne=t,this.Le=r}getToken(){return Promise.resolve(new BN(this.Me,this.Ne,this.Le))}start(e,t){e.enqueueRetryable(()=>t(He.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class Xg{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class $N{constructor(e,t){this.ke=t,this.forceRefresh=!1,this.appCheck=null,this.qe=null,this.$e=null,_e(e)&&e.settings.appCheckToken&&(this.$e=e.settings.appCheckToken)}start(e,t){F(this.xe===void 0,3512);const r=s=>{s.error!=null&&L("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${s.error.message}`);const o=s.token!==this.qe;return this.qe=s.token,L("FirebaseAppCheckTokenProvider",`Received ${o?"new":"existing"} token.`),o?t(s.token):Promise.resolve()};this.xe=s=>{e.enqueueRetryable(()=>r(s))};const i=s=>{L("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=s,this.xe&&this.appCheck.addTokenListener(this.xe)};this.ke.onInit(s=>i(s)),setTimeout(()=>{if(!this.appCheck){const s=this.ke.getImmediate({optional:!0});s?i(s):L("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){if(this.$e)return Promise.resolve(new Xg(this.$e));const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(t=>t?(F(typeof t.token=="string",44558,{tokenResult:t}),this.qe=t.token,new Xg(t.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.xe&&this.appCheck.removeTokenListener(this.xe),this.xe=void 0}}function pT(n){const e={};return n.timeoutSeconds!==void 0&&(e.timeoutSeconds=n.timeoutSeconds),e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jN{Ke(e){}shutdown(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Zg="ConnectivityMonitor";class e_{constructor(){this.Qe=()=>this.We(),this.Ge=()=>this.ze(),this.je=[],this.He()}Ke(e){this.je.push(e)}shutdown(){window.removeEventListener("online",this.Qe),window.removeEventListener("offline",this.Ge)}He(){window.addEventListener("online",this.Qe),window.addEventListener("offline",this.Ge)}We(){L(Zg,"Network connectivity changed: AVAILABLE");for(const e of this.je)e(0)}ze(){L(Zg,"Network connectivity changed: UNAVAILABLE");for(const e of this.je)e(1)}static Je(){return typeof window!="undefined"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Nc=null;function Zh(){return Nc===null?Nc=function(){return 268435456+Math.round(2147483648*Math.random())}():Nc++,"0x"+Nc.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fh="RestConnection",zN={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery",ExecutePipeline:"executePipeline"};class KN{get Ye(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;const t=e.ssl?"https":"http",r=encodeURIComponent(this.databaseId.projectId),i=encodeURIComponent(this.databaseId.database);this.Ze=t+"://"+e.host,this.Xe=`projects/${r}/databases/${i}`,this.et=this.databaseId.database===qh?`project_id=${r}`:`project_id=${r}&database_id=${i}`}tt(e,t,r,i,s){const o=Zh(),a=this.nt(e,t.toUriEncodedString());L(fh,`Sending RPC '${e}' ${o}:`,a,r);const u={"google-cloud-resource-prefix":this.Xe,"x-goog-request-params":this.et};this.rt(u,i,s);const{host:l}=new URL(a),h=Kn(l);return this.it(e,a,u,r,h).then(f=>(L(fh,`Received RPC '${e}' ${o}: `,f),f),f=>{throw lt(fh,`RPC '${e}' ${o} failed with error: `,f,"url: ",a,"request:",r),f})}st(e,t,r,i,s,o){return this.tt(e,t,r,i,s)}rt(e,t,r){if(e["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+$s}(),e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),t&&t.headers.forEach((i,s)=>e[s]=i),r&&r.headers.forEach((i,s)=>e[s]=i),this.databaseInfo._customHeaders)for(const i of Object.keys(this.databaseInfo._customHeaders))e[i]=this.databaseInfo._customHeaders[i]}nt(e,t){const r=zN[e];let i=`${this.Ze}/v1/${t}:${r}`;return this.databaseInfo.apiKey&&(i=`${i}?key=${encodeURIComponent(this.databaseInfo.apiKey)}`),i}terminate(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class GN{constructor(e){this._t=e._t,this.ot=e.ot}ut(e){this.ct=e}lt(e){this.Et=e}ht(e){this.Tt=e}onMessage(e){this.Pt=e}close(){this.ot()}send(e){this._t(e)}Rt(){this.ct()}It(){this.Et()}At(e){this.Tt(e)}Vt(e){this.Pt(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const it="WebChannelConnection",Co=(n,e,t)=>{n.listen(e,r=>{try{t(r)}catch(i){setTimeout(()=>{throw i},0)}})};class cs extends KN{constructor(e){super(e),this.dt=[],this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}static ft(){if(!cs.gt){const e=lI();Co(e,uI.STAT_EVENT,t=>{t.stat===Uh.PROXY?L(it,"STAT_EVENT: detected buffering proxy"):t.stat===Uh.NOPROXY&&L(it,"STAT_EVENT: detected no buffering proxy")}),cs.gt=!0}}it(e,t,r,i,s){const o=Zh();return new Promise((a,u)=>{const l=new aI;l.setWithCredentials(!0),l.listenOnce(cI.COMPLETE,()=>{try{switch(l.getLastErrorCode()){case zc.NO_ERROR:const f=l.getResponseJson();L(it,`XHR for RPC '${e}' ${o} received:`,JSON.stringify(f)),a(f);break;case zc.TIMEOUT:L(it,`RPC '${e}' ${o} timed out`),u(new O(k.DEADLINE_EXCEEDED,"Request time out"));break;case zc.HTTP_ERROR:const g=l.getStatus();if(L(it,`RPC '${e}' ${o} failed with status:`,g,"response text:",l.getResponseText()),g>0){let w=l.getResponseJson();Array.isArray(w)&&(w=w[0]);const S=w==null?void 0:w.error;if(S&&S.status&&S.message){const D=function(W){const Q=W.toLowerCase().replace(/_/g,"-");return Object.values(k).indexOf(Q)>=0?Q:k.UNKNOWN}(S.status);u(new O(D,S.message))}else u(new O(k.UNKNOWN,"Server responded with status "+l.getStatus()))}else u(new O(k.UNAVAILABLE,"Connection failed."));break;default:j(9055,{yt:e,streamId:o,wt:l.getLastErrorCode(),bt:l.getLastError()})}}finally{L(it,`RPC '${e}' ${o} completed.`)}});const h=JSON.stringify(i);L(it,`RPC '${e}' ${o} sending request:`,i),l.send(t,"POST",h,r,15)})}St(e,t,r){const i=Zh(),s=[this.Ze,"/","google.firestore.v1.Firestore","/",e,"/channel"],o=this.createWebChannelTransport(),a={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},u=this.longPollingOptions.timeoutSeconds;u!==void 0&&(a.longPollingTimeout=Math.round(1e3*u)),this.useFetchStreams&&(a.useFetchStreams=!0),this.rt(a.initMessageHeaders,t,r),a.encodeInitMessageHeaders=!0;const l=s.join("");L(it,`Creating RPC '${e}' stream ${i}: ${l}`,a);const h=o.createWebChannel(l,a);this.vt(h);let f=!1,g=!1;const w=new GN({_t:S=>{g?L(it,`Not sending because RPC '${e}' stream ${i} is closed:`,S):(f||(L(it,`Opening RPC '${e}' stream ${i} transport.`),h.open(),f=!0),L(it,`RPC '${e}' stream ${i} sending:`,S),h.send(S))},ot:()=>h.close()});return Co(h,Fo.EventType.OPEN,()=>{g||(L(it,`RPC '${e}' stream ${i} transport opened.`),w.Rt())}),Co(h,Fo.EventType.CLOSE,()=>{g||(g=!0,L(it,`RPC '${e}' stream ${i} transport closed`),w.At(),this.Dt(h))}),Co(h,Fo.EventType.ERROR,S=>{g||(g=!0,lt(it,`RPC '${e}' stream ${i} transport errored. Name:`,S.name,"Message:",S.message),w.At(new O(k.UNAVAILABLE,"The operation could not be completed")))}),Co(h,Fo.EventType.MESSAGE,S=>{var D;if(!g){const x=S.data[0];F(!!x,16349);const W=x,Q=(W==null?void 0:W.error)||((D=W[0])==null?void 0:D.error);if(Q){L(it,`RPC '${e}' stream ${i} received error:`,Q);const K=Q.status;let X=function(E){const y=xe[E];if(y!==void 0)return KI(y)}(K),ee=Q.message;K==="NOT_FOUND"&&ee.includes("database")&&ee.includes("does not exist")&&ee.includes(this.databaseId.database)&&lt(`Database '${this.databaseId.database}' not found. Please check your project configuration.`),X===void 0&&(X=k.INTERNAL,ee="Unknown error status: "+K+" with message "+Q.message),g=!0,w.At(new O(X,ee)),h.close()}else L(it,`RPC '${e}' stream ${i} received:`,x),w.Vt(x)}}),cs.ft(),setTimeout(()=>{w.It()},0),w}terminate(){this.dt.forEach(e=>e.close()),this.dt=[]}vt(e){this.dt.push(e)}Dt(e){this.dt=this.dt.filter(t=>t===e)}rt(e,t,r){super.rt(e,t,r),this.databaseInfo.apiKey&&(e["x-goog-api-key"]=this.databaseInfo.apiKey)}createWebChannelTransport(){return hI()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function WN(n){return new cs(n)}cs.gt=!1;class _f{constructor(e,t,r=1e3,i=1.5,s=6e4){this.xt=e,this.timerId=t,this.Ct=r,this.Ft=i,this.Ot=s,this.Mt=0,this.Nt=null,this.Lt=Date.now(),this.reset()}reset(){this.Mt=0}Bt(){this.Mt=this.Ot}Ut(e){this.cancel();const t=Math.floor(this.Mt+this.kt()),r=Math.max(0,Date.now()-this.Lt),i=Math.max(0,t-r);i>0&&L("ExponentialBackoff",`Backing off for ${i} ms (base delay: ${this.Mt} ms, delay with jitter: ${t} ms, last attempt: ${r} ms ago)`),this.Nt=this.xt.enqueueAfterDelay(this.timerId,i,()=>(this.Lt=Date.now(),e())),this.Mt*=this.Ft,this.Mt<this.Ct&&(this.Mt=this.Ct),this.Mt>this.Ot&&(this.Mt=this.Ot)}qt(){this.Nt!==null&&(this.Nt.skipDelay(),this.Nt=null)}cancel(){this.Nt!==null&&(this.Nt.cancel(),this.Nt=null)}kt(){return(Math.random()-.5)*this.Mt}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const t_="PersistentStream";class mT{constructor(e,t,r,i,s,o,a,u){this.xt=e,this.$t=r,this.Kt=i,this.connection=s,this.authCredentialsProvider=o,this.appCheckCredentialsProvider=a,this.listener=u,this.state=0,this.Qt=0,this.Wt=null,this.Gt=null,this.stream=null,this.zt=0,this.jt=new _f(e,t)}Ht(){return this.state===1||this.state===5||this.Jt()}Jt(){return this.state===2||this.state===3}start(){this.zt=0,this.state!==4?this.auth():this.Yt()}stop(){return p(this,null,function*(){this.Ht()&&(yield this.close(0))})}Zt(){this.state=0,this.jt.reset()}Xt(){this.Jt()&&this.Wt===null&&(this.Wt=this.xt.enqueueAfterDelay(this.$t,6e4,()=>this.en()))}tn(e){this.nn(),this.stream.send(e)}en(){return p(this,null,function*(){if(this.Jt())return this.close(0)})}nn(){this.Wt&&(this.Wt.cancel(),this.Wt=null)}rn(){this.Gt&&(this.Gt.cancel(),this.Gt=null)}close(e,t){return p(this,null,function*(){this.nn(),this.rn(),this.jt.cancel(),this.Qt++,e!==4?this.jt.reset():t&&t.code===k.RESOURCE_EXHAUSTED?(Ne(t.toString()),Ne("Using maximum backoff delay to prevent overloading the backend."),this.jt.Bt()):t&&t.code===k.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.sn(),this.stream.close(),this.stream=null),this.state=e,yield this.listener.ht(t)})}sn(){}auth(){this.state=1;const e=this._n(this.Qt),t=this.Qt;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([r,i])=>{this.Qt===t&&this.an(r,i)},r=>{e(()=>{const i=new O(k.UNKNOWN,"Fetching auth token failed: "+r.message);return this.un(i)})})}an(e,t){const r=this._n(this.Qt);this.stream=this.cn(e,t),this.stream.ut(()=>{r(()=>this.listener.ut())}),this.stream.lt(()=>{r(()=>(this.state=2,this.Gt=this.xt.enqueueAfterDelay(this.Kt,1e4,()=>(this.Jt()&&(this.state=3),Promise.resolve())),this.listener.lt()))}),this.stream.ht(i=>{r(()=>this.un(i))}),this.stream.onMessage(i=>{r(()=>++this.zt==1?this.En(i):this.onNext(i))})}Yt(){this.state=5,this.jt.Ut(()=>p(this,null,function*(){this.state=0,this.start()}))}un(e){return L(t_,`close with error: ${e}`),this.stream=null,this.close(4,e)}_n(e){return t=>{this.xt.enqueueAndForget(()=>this.Qt===e?t():(L(t_,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class HN extends mT{constructor(e,t,r,i,s,o){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,r,i,o),this.serializer=s}cn(e,t){return this.connection.St("Listen",e,t)}En(e){return this.onNext(e)}onNext(e){this.jt.reset();const t=CN(this.serializer,e),r=function(s){if(!("targetChange"in s))return H.min();const o=s.targetChange;return o.targetIds&&o.targetIds.length?H.min():o.readTime?Ve(o.readTime):H.min()}(e);return this.listener.hn(t,r)}Tn(e){const t={};t.database=Yh(this.serializer),t.addTarget=function(s,o){let a;const u=o.target;if(a=Cn(u)?{pipelineQuery:aT(s,u)}:lf(u)?{documents:iT(s,u)}:{query:sT(s,u).be},a.targetId=o.targetId,o.resumeToken.approximateByteSize()>0){a.resumeToken=XI(s,o.resumeToken);const l=Qh(s,o.expectedCount);l!==null&&(a.expectedCount=l)}else if(o.snapshotVersion.compareTo(H.min())>0){a.readTime=Ts(s,o.snapshotVersion.toTimestamp());const l=Qh(s,o.expectedCount);l!==null&&(a.expectedCount=l)}return a}(this.serializer,e);const r=NN(this.serializer,e);r&&(t.labels=r),this.tn(t)}Pn(e){const t={};t.database=Yh(this.serializer),t.removeTarget=e,this.tn(t)}}class QN extends mT{constructor(e,t,r,i,s,o){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",t,r,i,o),this.serializer=s}get Rn(){return this.zt>0}start(){this.lastStreamToken=void 0,super.start()}sn(){this.Rn&&this.In([])}cn(e,t){return this.connection.St("Write",e,t)}En(e){return F(!!e.streamToken,31322),this.lastStreamToken=e.streamToken,F(!e.writeResults||e.writeResults.length===0,55816),this.listener.An()}onNext(e){F(!!e.streamToken,12678),this.lastStreamToken=e.streamToken,this.jt.reset();const t=kN(e.writeResults,e.commitTime),r=Ve(e.commitTime);return this.listener.Vn(r,t)}dn(){const e={};e.database=Yh(this.serializer),this.tn(e)}In(e){const t={streamToken:this.lastStreamToken,writes:e.map(r=>Ia(this.serializer,r))};this.tn(t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class JN{}class YN extends JN{constructor(e,t,r,i){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=r,this.serializer=i,this.fn=!1}mn(){if(this.fn)throw new O(k.FAILED_PRECONDITION,"The client has already been terminated.")}tt(e,t,r,i){return this.mn(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([s,o])=>this.connection.tt(e,Jh(t,r),i,s,o)).catch(s=>{throw s.name==="FirebaseError"?(s.code===k.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),s):new O(k.UNKNOWN,s.toString())})}st(e,t,r,i,s){return this.mn(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([o,a])=>this.connection.st(e,Jh(t,r),i,o,a,s)).catch(o=>{throw o.name==="FirebaseError"?(o.code===k.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),o):new O(k.UNKNOWN,o.toString())})}terminate(){this.fn=!0,this.connection.terminate()}}function XN(n,e,t,r){return new YN(n,e,t,r)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ZN="ComponentProvider",n_=new Map;function eV(n,e,t,r,i){return new Gk(n,e,t,i.host,i.ssl,i.experimentalForceLongPolling,i.experimentalAutoDetectLongPolling,pT(i.experimentalLongPollingOptions),i.useFetchStreams,i.isUsingEmulator,r,i._customHeaders,i.grpcFlowControlWindow)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const r_={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},gT=41943040;class st{static withCacheSize(e){return new st(e,st.DEFAULT_COLLECTION_PERCENTILE,st.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,t,r){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=t,this.maximumSequenceNumbersToCollect=r}}st.DEFAULT_COLLECTION_PERCENTILE=10,st.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,st.DEFAULT=new st(gT,st.DEFAULT_COLLECTION_PERCENTILE,st.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),st.DISABLED=new st(-1,0,0);/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rt{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=r=>this.pn(r),this.gn=r=>t.writeSequenceNumber(r))}pn(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.gn&&this.gn(e),e}}Rt.yn=-1;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _T="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class yT{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Mr(n){return p(this,null,function*(){if(n.code!==k.FAILED_PRECONDITION||n.message!==_T)throw n;L("LocalStore","Unexpectedly lost primary lease")})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class R{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(t=>{this.isDone=!0,this.result=t,this.nextCallback&&this.nextCallback(t)},t=>{this.isDone=!0,this.error=t,this.catchCallback&&this.catchCallback(t)})}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&j(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new R((r,i)=>{this.nextCallback=s=>{this.wrapSuccess(e,s).next(r,i)},this.catchCallback=s=>{this.wrapFailure(t,s).next(r,i)}})}toPromise(){return new Promise((e,t)=>{this.next(e,t)})}wrapUserFunction(e){try{const t=e();return t instanceof R?t:R.resolve(t)}catch(t){return R.reject(t)}}wrapSuccess(e,t){return e?this.wrapUserFunction(()=>e(t)):R.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction(()=>e(t)):R.reject(t)}static resolve(e){return new R((t,r)=>{t(e)})}static reject(e){return new R((t,r)=>{r(e)})}static waitFor(e){return new R((t,r)=>{let i=0,s=0,o=!1;e.forEach(a=>{++i,a.next(()=>{++s,o&&s===i&&t()},u=>r(u))}),o=!0,s===i&&t()})}static or(e){let t=R.resolve(!1);for(const r of e)t=t.next(i=>i?R.resolve(i):r());return t}static forEach(e,t){const r=[];return e.forEach((i,s)=>{r.push(t.call(this,i,s))}),this.waitFor(r)}static mapArray(e,t){return new R((r,i)=>{const s=e.length,o=new Array(s);let a=0;for(let u=0;u<s;u++){const l=u;t(e[l]).next(h=>{o[l]=h,++a,a===s&&r(o)},h=>i(h))}})}static doWhile(e,t){return new R((r,i)=>{const s=()=>{e()===!0?t().next(()=>{s()},i):r()};s()})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Dt="SimpleDb";class rl{static open(e,t,r,i){try{return new rl(t,e.transaction(i,r))}catch(s){throw new Xo(t,s)}}constructor(e,t){this.action=e,this.transaction=t,this.aborted=!1,this.wn=new Ze,this.transaction.oncomplete=()=>{this.wn.resolve()},this.transaction.onabort=()=>{t.error?this.wn.reject(new Xo(e,t.error)):this.wn.resolve()},this.transaction.onerror=r=>{const i=yf(r.target.error);this.wn.reject(new Xo(e,i))}}get bn(){return this.wn.promise}abort(e){e&&this.wn.reject(e),this.aborted||(L(Dt,"Aborting transaction:",e?e.message:"Client-initiated abort"),this.aborted=!0,this.transaction.abort())}Sn(){const e=this.transaction;this.aborted||typeof e.commit!="function"||e.commit()}store(e){const t=this.transaction.objectStore(e);return new nV(t)}}class yn{static delete(e){return L(Dt,"Removing database:",e),Xr(Ad().indexedDB.deleteDatabase(e)).toPromise()}static Je(){if(!mi())return!1;if(yn.vn())return!0;const e=ve(),t=yn.Dn(e),r=0<t&&t<10,i=wT(e),s=0<i&&i<4.5;return!(e.indexOf("MSIE ")>0||e.indexOf("Trident/")>0||e.indexOf("Edge/")>0||r||s)}static vn(){var e;return typeof process!="undefined"&&((e=process.__PRIVATE_env)==null?void 0:e.__PRIVATE_USE_MOCK_PERSISTENCE)==="YES"}static xn(e,t){return e.store(t)}static Dn(e){const t=e.match(/i(?:phone|pad|pod) os ([\d_]+)/i),r=t?t[1].split("_").slice(0,2).join("."):"-1";return Number(r)}constructor(e,t,r){this.name=e,this.version=t,this.Cn=r,this.Fn=null,yn.Dn(ve())===12.2&&Ne("Firestore persistence suffers from a bug in iOS 12.2 Safari that may cause your app to stop working. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.")}On(e){return p(this,null,function*(){return this.db||(L(Dt,"Opening database:",this.name),this.db=yield new Promise((t,r)=>{const i=indexedDB.open(this.name,this.version);i.onsuccess=s=>{const o=s.target.result;t(o)},i.onblocked=()=>{r(new Xo(e,"Cannot upgrade IndexedDB schema while another tab is open. Close all tabs that access Firestore and reload this page to proceed."))},i.onerror=s=>{const o=s.target.error;o.name==="VersionError"?r(new O(k.FAILED_PRECONDITION,"A newer version of the Firestore SDK was previously used and so the persisted data is not compatible with the version of the SDK you are now using. The SDK will operate with persistence disabled. If you need persistence, please re-upgrade to a newer version of the SDK or else clear the persisted IndexedDB data for your app to start fresh.")):o.name==="InvalidStateError"?r(new O(k.FAILED_PRECONDITION,"Unable to open an IndexedDB connection. This could be due to running in a private browsing session on a browser whose private browsing sessions do not support IndexedDB: "+o)):r(new Xo(e,o))},i.onupgradeneeded=s=>{L(Dt,'Database "'+this.name+'" requires upgrade from version:',s.oldVersion);const o=s.target.result;this.Cn.Mn(o,i.transaction,s.oldVersion,this.version).next(()=>{L(Dt,"Database upgrade to version "+this.version+" complete")})}})),this.Nn&&(this.db.onversionchange=t=>this.Nn(t)),this.db})}Ln(e){this.Nn=e,this.db&&(this.db.onversionchange=t=>e(t))}runTransaction(e,t,r,i){return p(this,null,function*(){const s=t==="readonly";let o=0;for(;;){++o;try{this.db=yield this.On(e);const a=rl.open(this.db,e,s?"readonly":"readwrite",r),u=i(a).next(l=>(a.Sn(),l)).catch(l=>(a.abort(l),R.reject(l))).toPromise();return u.catch(()=>{}),yield a.bn,u}catch(a){const u=a,l=u.name!=="FirebaseError"&&o<3;if(L(Dt,"Transaction failed with error:",u.message,"Retrying:",l),this.close(),!l)return Promise.reject(u)}}})}close(){this.db&&this.db.close(),this.db=void 0}}function wT(n){const e=n.match(/Android ([\d.]+)/i),t=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(t)}class tV{constructor(e){this.Bn=e,this.Un=!1,this.kn=null}get isDone(){return this.Un}get qn(){return this.kn}set cursor(e){this.Bn=e}done(){this.Un=!0}$n(e){this.kn=e}delete(){return Xr(this.Bn.delete())}}class Xo extends O{constructor(e,t){super(k.UNAVAILABLE,`IndexedDB transaction '${e}' failed: ${t}`),this.name="IndexedDbTransactionError"}}function Fr(n){return n.name==="IndexedDbTransactionError"}class nV{constructor(e){this.store=e}put(e,t){let r;return t!==void 0?(L(Dt,"PUT",this.store.name,e,t),r=this.store.put(t,e)):(L(Dt,"PUT",this.store.name,"<auto-key>",e),r=this.store.put(e)),Xr(r)}add(e){return L(Dt,"ADD",this.store.name,e,e),Xr(this.store.add(e))}get(e){return Xr(this.store.get(e)).next(t=>(t===void 0&&(t=null),L(Dt,"GET",this.store.name,e,t),t))}delete(e){return L(Dt,"DELETE",this.store.name,e),Xr(this.store.delete(e))}count(){return L(Dt,"COUNT",this.store.name),Xr(this.store.count())}Kn(e,t){const r=this.options(e,t),i=r.index?this.store.index(r.index):this.store;if(typeof i.getAll=="function"){const s=i.getAll(r.range);return new R((o,a)=>{s.onerror=u=>{a(u.target.error)},s.onsuccess=u=>{o(u.target.result)}})}{const s=this.cursor(r),o=[];return this.Qn(s,(a,u)=>{o.push(u)}).next(()=>o)}}Wn(e,t){const r=this.store.getAll(e,t===null?void 0:t);return new R((i,s)=>{r.onerror=o=>{s(o.target.error)},r.onsuccess=o=>{i(o.target.result)}})}Gn(e,t){L(Dt,"DELETE ALL",this.store.name);const r=this.options(e,t);r.zn=!1;const i=this.cursor(r);return this.Qn(i,(s,o,a)=>a.delete())}jn(e,t){let r;t?r=e:(r={},t=e);const i=this.cursor(r);return this.Qn(i,t)}Hn(e){const t=this.cursor({});return new R((r,i)=>{t.onerror=s=>{const o=yf(s.target.error);i(o)},t.onsuccess=s=>{const o=s.target.result;o?e(o.primaryKey,o.value).next(a=>{a?o.continue():r()}):r()}})}Qn(e,t){const r=[];return new R((i,s)=>{e.onerror=o=>{s(o.target.error)},e.onsuccess=o=>{const a=o.target.result;if(!a)return void i();const u=new tV(a),l=t(a.primaryKey,a.value,u);if(l instanceof R){const h=l.catch(f=>(u.done(),R.reject(f)));r.push(h)}u.isDone?i():u.qn===null?a.continue():a.continue(u.qn)}}).next(()=>R.waitFor(r))}options(e,t){let r;return e!==void 0&&(typeof e=="string"?r=e:t=e),{index:r,range:t}}cursor(e){let t="next";if(e.reverse&&(t="prev"),e.index){const r=this.store.index(e.index);return e.zn?r.openKeyCursor(e.range,t):r.openCursor(e.range,t)}return this.store.openCursor(e.range,t)}}function Xr(n){return new R((e,t)=>{n.onsuccess=r=>{const i=r.target.result;e(i)},n.onerror=r=>{const i=yf(r.target.error);t(i)}})}let i_=!1;function yf(n){const e=yn.Dn(ve());if(e>=12.2&&e<13){const t="An internal error was encountered in the Indexed Database server";if(n.message.indexOf(t)>=0){const r=new O("internal",`IOS_INDEXEDDB_BUG1: IndexedDb has thrown '${t}'. This is likely due to an unavoidable bug in iOS. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.`);return i_||(i_=!0,setTimeout(()=>{throw r},0)),r}}return n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const s_="LruGarbageCollector",rV=1048576;function o_([n,e],[t,r]){const i=Y(n,t);return i===0?Y(e,r):i}class iV{constructor(e){this.Jn=e,this.buffer=new de(o_),this.Yn=0}Zn(){return++this.Yn}Xn(e){const t=[e,this.Zn()];if(this.buffer.size<this.Jn)this.buffer=this.buffer.add(t);else{const r=this.buffer.last();o_(t,r)<0&&(this.buffer=this.buffer.delete(r).add(t))}}get maxValue(){return this.buffer.last()[0]}}class IT{constructor(e,t,r){this.garbageCollector=e,this.asyncQueue=t,this.localStore=r,this.er=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.tr(6e4)}stop(){this.er&&(this.er.cancel(),this.er=null)}get started(){return this.er!==null}tr(e){L(s_,`Garbage collection scheduled in ${e}ms`),this.er=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,()=>p(this,null,function*(){this.er=null;try{yield this.localStore.collectGarbage(this.garbageCollector)}catch(t){Fr(t)?L(s_,"Ignoring IndexedDB error during garbage collection: ",t):yield Mr(t)}yield this.tr(3e5)}))}}class sV{constructor(e,t){this.nr=e,this.params=t}calculateTargetCount(e,t){return this.nr.rr(e).next(r=>Math.floor(t/100*r))}nthSequenceNumber(e,t){if(t===0)return R.resolve(Rt.yn);const r=new iV(t);return this.nr.forEachTarget(e,i=>r.Xn(i.sequenceNumber)).next(()=>this.nr.ir(e,i=>r.Xn(i))).next(()=>r.maxValue)}removeTargets(e,t,r){return this.nr.removeTargets(e,t,r)}removeOrphanedDocuments(e,t){return this.nr.removeOrphanedDocuments(e,t)}collect(e,t){return this.params.cacheSizeCollectionThreshold===-1?(L("LruGarbageCollector","Garbage collection skipped; disabled"),R.resolve(r_)):this.getCacheSize(e).next(r=>r<this.params.cacheSizeCollectionThreshold?(L("LruGarbageCollector",`Garbage collection skipped; Cache size ${r} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),r_):this.sr(e,t))}getCacheSize(e){return this.nr.getCacheSize(e)}sr(e,t){let r,i,s,o,a,u,l;const h=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next(f=>(f>this.params.maximumSequenceNumbersToCollect?(L("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${f}`),i=this.params.maximumSequenceNumbersToCollect):i=f,o=Date.now(),this.nthSequenceNumber(e,i))).next(f=>(r=f,a=Date.now(),this.removeTargets(e,r,t))).next(f=>(s=f,u=Date.now(),this.removeOrphanedDocuments(e,r))).next(f=>(l=Date.now(),Ji()<=ie.DEBUG&&L("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${o-h}ms
	Determined least recently used ${i} in `+(a-o)+`ms
	Removed ${s} targets in `+(u-a)+`ms
	Removed ${f} documents in `+(l-u)+`ms
Total Duration: ${l-h}ms`),R.resolve({didRun:!0,sequenceNumbersCollected:i,targetsRemoved:s,documentsRemoved:f})))}}function TT(n,e){return new sV(n,e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ET="firestore.googleapis.com",a_=!0;class c_{constructor(e){var t,r;if(e.host===void 0){if(e.ssl!==void 0)throw new O(k.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=ET,this.ssl=a_}else this.host=e.host,this.ssl=(t=e.ssl)!=null?t:a_;if(this.isUsingEmulator=e.emulatorOptions!==void 0,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e._customHeaders&&(this._customHeaders=G({},e._customHeaders)),e.cacheSizeBytes===void 0)this.cacheSizeBytes=gT;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<rV)throw new O(k.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}if(mI("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=pT((r=e.experimentalLongPollingOptions)!=null?r:{}),function(s){if(s.timeoutSeconds!==void 0){if(isNaN(s.timeoutSeconds))throw new O(k.INVALID_ARGUMENT,`invalid long polling timeout: ${s.timeoutSeconds} (must not be NaN)`);if(s.timeoutSeconds<5)throw new O(k.INVALID_ARGUMENT,`invalid long polling timeout: ${s.timeoutSeconds} (minimum allowed value is 5)`);if(s.timeoutSeconds>30)throw new O(k.INVALID_ARGUMENT,`invalid long polling timeout: ${s.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams,e.grpcFlowControlWindow!==void 0){if(typeof e.grpcFlowControlWindow!="number"||e.grpcFlowControlWindow<=0||e.grpcFlowControlWindow>2147483647||!Number.isInteger(e.grpcFlowControlWindow))throw new O(k.INVALID_ARGUMENT,"grpcFlowControlWindow must be a positive integer and cannot exceed 2147483647");this.grpcFlowControlWindow=e.grpcFlowControlWindow}}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(r,i){return r.timeoutSeconds===i.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams&&this.grpcFlowControlWindow===e.grpcFlowControlWindow&&function(r,i){if(r===i)return!0;if(!r||!i)return!1;const s=Object.keys(r),o=Object.keys(i);if(s.length!==o.length)return!1;for(const a of s)if(r[a]!==i[a])return!1;return!0}(this._customHeaders,e._customHeaders)}}let Ya=class{constructor(e,t,r,i){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=r,this._app=i,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new c_({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new O(k.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new O(k.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new c_(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=function(r){if(!r)return new MN;switch(r.type){case"firstParty":return new qN(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new O(k.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}_restart(){return p(this,null,function*(){this._terminateTask==="notTerminated"?yield this._terminate():this._terminateTask="notTerminated"})}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(t){const r=n_.get(t);r&&(L(ZN,"Removing Datastore"),n_.delete(t),r.terminate())}(this),Promise.resolve()}};function oV(n,e,t,r={}){var l;n=ae(n,Ya);const i=Kn(e),s=n._getSettings(),o=ce(G({},s),{emulatorOptions:n._getEmulatorOptions()}),a=`${e}:${t}`;i&&Mu(`https://${a}`),s.host!==ET&&s.host!==a&&lt("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const u=ce(G({},s),{host:a,ssl:i,emulatorOptions:r});if(!Tr(u,o)&&(n._setSettings(u),r.mockUserToken)){let h,f;if(typeof r.mockUserToken=="string")h=r.mockUserToken,f=He.MOCK_USER;else{h=Ky(r.mockUserToken,(l=n._app)==null?void 0:l.options.projectId);const g=r.mockUserToken.sub||r.mockUserToken.user_id;if(!g)throw new O(k.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");f=new He(g)}n._authCredentials=new FN(new fT(h,f))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Tt=class vT{constructor(e,t,r){this.converter=t,this._query=r,this.type="query",this.firestore=e}withConverter(e){return new vT(this.firestore,e,this._query)}};class ue{constructor(e,t,r){this.converter=t,this._key=r,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new wn(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new ue(this.firestore,e,this._key)}toJSON(){return{type:ue._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,t,r){if(za(t,ue._jsonSchema))return new ue(e,r||null,new B(te.fromString(t.referencePath)))}}ue._jsonSchemaVersion="firestore/documentReference/1.0",ue._jsonSchema={type:Me("string",ue._jsonSchemaVersion),referencePath:Me("string")};class wn extends Tt{constructor(e,t,r){super(e,t,Ks(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new ue(this.firestore,null,new B(e))}withConverter(e){return new wn(this.firestore,e,this._path)}}function AT(n,e,...t){if(n=z(n),ef("collection","path",e),n instanceof Ya){const r=te.fromString(e,...t);return Ng(r),new wn(n,null,r)}{if(!(n instanceof ue||n instanceof wn))throw new O(k.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(te.fromString(e,...t));return Ng(r),new wn(n.firestore,null,r)}}function aV(n,e){if(n=ae(n,Ya),ef("collectionGroup","collection id",e),e.indexOf("/")>=0)throw new O(k.INVALID_ARGUMENT,`Invalid collection ID '${e}' passed to function collectionGroup(). Collection IDs must not contain '/'.`);return new Tt(n,null,function(r){return new Jn(te.emptyPath(),r)}(e))}function gu(n,e,...t){if(n=z(n),arguments.length===1&&(e=Zd.newId()),ef("doc","path",e),n instanceof Ya){const r=te.fromString(e,...t);return kg(r),new ue(n,null,new B(r))}{if(!(n instanceof ue||n instanceof wn))throw new O(k.INVALID_ARGUMENT,"Expected first argument to doc() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(te.fromString(e,...t));return kg(r),new ue(n.firestore,n instanceof wn?n.converter:null,new B(r))}}function bT(n,e){return n=z(n),e=z(e),(n instanceof ue||n instanceof wn)&&(e instanceof ue||e instanceof wn)&&n.firestore===e.firestore&&n.path===e.path&&n.converter===e.converter}function RT(n,e){return n=z(n),e=z(e),n instanceof Tt&&e instanceof Tt&&n.firestore===e.firestore&&jI(n._query,e._query)&&n.converter===e.converter}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pt{constructor(e){this._values=(e||[]).map(t=>t)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(r,i){if(r.length!==i.length)return!1;for(let s=0;s<r.length;++s)if(r[s]!==i[s])return!1;return!0}(this._values,e._values)}toJSON(){return{type:Pt._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(za(e,Pt._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every(t=>typeof t=="number"))return new Pt(e.vectorValues);throw new O(k.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}Pt._jsonSchemaVersion="firestore/vectorValue/1.0",Pt._jsonSchema={type:Me("string",Pt._jsonSchemaVersion),vectorValues:Me("object")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const cV=/^__.*__$/;class uV{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return this.fieldMask!==null?new Qn(e,this.data,this.fieldMask,t,this.fieldTransforms):new js(e,this.data,t,this.fieldTransforms)}}class ST{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return new Qn(e,this.data,this.fieldMask,t,this.fieldTransforms)}}function PT(n){switch(n){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw j(40011,{dataSource:n})}}class il{constructor(e,t,r,i,s,o){this.settings=e,this.databaseId=t,this.serializer=r,this.ignoreUndefinedProperties=i,s===void 0&&this.validatePath(),this.fieldTransforms=s||[],this.fieldMask=o||[]}get path(){return this.settings.path}get dataSource(){return this.settings.dataSource}contextWith(e){return new il(G(G({},this.settings),e),this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}childContextForField(e){var i;const t=(i=this.path)==null?void 0:i.child(e),r=this.contextWith({path:t,arrayElement:!1});return r.validatePathSegment(e),r}childContextForFieldPath(e){var i;const t=(i=this.path)==null?void 0:i.child(e),r=this.contextWith({path:t,arrayElement:!1});return r.validatePath(),r}childContextForArray(e){return this.contextWith({path:void 0,arrayElement:!0})}createError(e){return _u(e,this.settings.methodName,this.settings.hasConverter||!1,this.path,this.settings.targetDoc)}contains(e){return this.fieldMask.find(t=>e.isPrefixOf(t))!==void 0||this.fieldTransforms.find(t=>e.isPrefixOf(t.field))!==void 0}validatePath(){if(this.path)for(let e=0;e<this.path.length;e++)this.validatePathSegment(this.path.get(e))}validatePathSegment(e){if(e.length===0)throw this.createError("Document fields must not be empty");if(PT(this.dataSource)&&cV.test(e))throw this.createError('Document fields cannot begin and end with "__"')}}class lV{constructor(e,t,r){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=r||Ja(e)}createContext(e,t,r,i=!1){return new il({dataSource:e,methodName:t,targetDoc:r,path:Ue.emptyPath(),arrayElement:!1,hasConverter:i},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function Di(n){const e=n._freezeSettings(),t=Ja(n._databaseId);return new lV(n._databaseId,!!e.ignoreUndefinedProperties,t)}function sl(n,e,t,r,i,s={}){const o=n.createContext(s.merge||s.mergeFields?2:0,e,t,i);bf("Data must be an object, but it was:",o,r);const a=NT(r,o);let u,l;if(s.merge)u=new bt(o.fieldMask),l=o.fieldTransforms;else if(s.mergeFields){const h=[];for(const f of s.mergeFields){const g=Bn(e,f,t);if(!o.contains(g))throw new O(k.INVALID_ARGUMENT,`Field '${g}' is specified in your field mask but missing from your input data.`);xT(h,g)||h.push(g)}u=new bt(h),l=o.fieldTransforms.filter(f=>u.covers(f.field))}else u=null,l=o.fieldTransforms;return new uV(new Qe(a),u,l)}class Xa extends Vi{_toFieldTransform(e){if(e.dataSource!==2)throw e.dataSource===1?e.createError(`${this._methodName}() can only appear at the top level of your update data`):e.createError(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof Xa}}function CT(n,e,t){return new il({dataSource:3,targetDoc:e.settings.targetDoc,methodName:n._methodName,arrayElement:t},e.databaseId,e.serializer,e.ignoreUndefinedProperties)}class wf extends Vi{_toFieldTransform(e){return new Ha(e.path,new ys)}isEqual(e){return e instanceof wf}}class If extends Vi{constructor(e,t){super(e),this._r=t}_toFieldTransform(e){const t=CT(this,e,!0),r=this._r.map(s=>En(s,t)),i=new Ei(r);return new Ha(e.path,i)}isEqual(e){return e instanceof If&&Tr(this._r,e._r)}}class Tf extends Vi{constructor(e,t){super(e),this._r=t}_toFieldTransform(e){const t=CT(this,e,!0),r=this._r.map(s=>En(s,t)),i=new vi(r);return new Ha(e.path,i)}isEqual(e){return e instanceof Tf&&Tr(this._r,e._r)}}class Ef extends Vi{constructor(e,t){super(e),this.ar=t}_toFieldTransform(e){const t=new Ai(e.serializer,Zu(e.serializer,this.ar));return new Ha(e.path,t)}isEqual(e){return e instanceof Ef&&(this.ar===e.ar||Number.isNaN(this.ar)&&Number.isNaN(e.ar))}}function vf(n,e,t,r){const i=n.createContext(1,e,t);bf("Data must be an object, but it was:",i,r);const s=[],o=Qe.empty();Lr(r,(u,l)=>{const h=DT(e,u,t);l=z(l);const f=i.childContextForFieldPath(h);if(l instanceof Xa)s.push(h);else{const g=En(l,f);g!=null&&(s.push(h),o.set(h,g))}});const a=new bt(s);return new ST(o,a,i.fieldTransforms)}function Af(n,e,t,r,i,s){const o=n.createContext(1,e,t),a=[Bn(e,r,t)],u=[i];if(s.length%2!=0)throw new O(k.INVALID_ARGUMENT,`Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let g=0;g<s.length;g+=2)a.push(Bn(e,s[g])),u.push(s[g+1]);const l=[],h=Qe.empty();for(let g=a.length-1;g>=0;--g)if(!xT(l,a[g])){const w=a[g];let S=u[g];S=z(S);const D=o.childContextForFieldPath(w);if(S instanceof Xa)l.push(w);else{const x=En(S,D);x!=null&&(l.push(w),h.set(w,x))}}const f=new bt(l);return new ST(h,f,o.fieldTransforms)}function kT(n,e,t,r=!1){return En(t,n.createContext(r?4:3,e))}function En(n,e,t){if(VT(n=z(n)))return bf("Unsupported field value:",e,n),NT(n,e);if(n instanceof Vi)return function(i,s){if(!PT(s.dataSource))throw s.createError(`${i._methodName}() can only be used with update() and set()`);if(!s.path)throw s.createError(`${i._methodName}() is not currently supported inside arrays`);const o=i._toFieldTransform(s);o&&s.fieldTransforms.push(o)}(n,e),null;if(n===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),n instanceof Array){if(e.settings.arrayElement&&e.dataSource!==4)throw e.createError("Nested arrays are not supported");return function(i,s){const o=[];let a=0;for(const u of i){let l=En(u,s.childContextForArray(a));l==null&&(l={nullValue:"NULL_VALUE"}),o.push(l),a++}return{arrayValue:{values:o}}}(n,e)}return function(i,s,o){if((i=z(i))===null)return{nullValue:"NULL_VALUE"};if(typeof i=="number")return Zu(s.serializer,i);if(typeof i=="boolean")return{booleanValue:i};if(typeof i=="string")return{stringValue:i};if(i instanceof Date){const a=le.fromDate(i);return{timestampValue:Ts(s.serializer,a)}}if(i instanceof le){const a=new le(i.seconds,1e3*Math.floor(i.nanoseconds/1e3));return{timestampValue:Ts(s.serializer,a)}}if(i instanceof Qt)return{geoPointValue:{latitude:i.latitude,longitude:i.longitude}};if(i instanceof at)return{bytesValue:XI(s.serializer,i._byteString)};if(i instanceof ue){const a=s.databaseId,u=i.firestore._databaseId;if(!u.isEqual(a))throw s.createError(`Document reference is for database ${u.projectId}/${u.database} but should be for database ${a.projectId}/${a.database}`);return{referenceValue:gf(i.firestore._databaseId||s.databaseId,i._key.path)}}if(i instanceof Pt)return function(u,l){const h=u instanceof Pt?u.toArray():u;return{mapValue:{fields:{[tf]:{stringValue:nf},[wi]:{arrayValue:{values:h.map(g=>{if(typeof g!="number")throw l.createError("VectorValues must only contain numeric values.");return Xu(l.serializer,g)})}}}}}}(i,s);if(hT(i))return i._toProto(s.serializer);throw s.createError(`Unsupported field value: ${Yu(i)}`)}(n,e)}function NT(n,e){const t={};return pI(n)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):Lr(n,(r,i)=>{const s=En(i,e.childContextForField(r));s!=null&&(t[r]=s)}),{mapValue:{fields:t}}}function VT(n){return!(typeof n!="object"||n===null||n instanceof Array||n instanceof Date||n instanceof le||n instanceof Qt||n instanceof at||n instanceof ue||n instanceof Vi||n instanceof Pt||hT(n))}function bf(n,e,t){if(!VT(t)||!ja(t)){const r=Yu(t);throw r==="an object"?e.createError(n+" a custom object"):e.createError(n+" "+r)}}function Bn(n,e,t){if((e=z(e))instanceof Cr)return e._internalPath;if(typeof e=="string")return DT(n,e);throw _u("Field path arguments must be of type string or ",n,!1,void 0,t)}const hV=new RegExp("[~\\*/\\[\\]]");function DT(n,e,t){if(e.search(hV)>=0)throw _u(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,n,!1,void 0,t);try{return new Cr(...e.split("."))._internalPath}catch(r){throw _u(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,n,!1,void 0,t)}}function _u(n,e,t,r,i){const s=r&&!r.isEmpty(),o=i!==void 0;let a=`Function ${e}() called with invalid data`;t&&(a+=" (via `toFirestore()`)"),a+=". ";let u="";return(s||o)&&(u+=" (found",s&&(u+=` in field ${r}`),o&&(u+=` in document ${i}`),u+=")"),new O(k.INVALID_ARGUMENT,a+n+u)}function xT(n,e){return n.some(t=>t.isEqual(e))}function OT(n){return typeof n._readUserData=="function"}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dt{constructor(e){this.optionDefinitions=e}_getKnownOptions(e,t){var i;const r=Qe.empty();for(const s in this.optionDefinitions)if(this.optionDefinitions.hasOwnProperty(s)){const o=this.optionDefinitions[s];if(s in e){const a=e[s];let u;o.nestedOptions&&ja(a)?u={mapValue:{fields:new dt(o.nestedOptions).getOptionsProto(t,a)}}:a&&(u=(i=En(a,t))!=null?i:void 0),u&&r.set(Ue.fromServerFormat(o.serverName),u)}}return r}getOptionsProto(e,t,r){var s;const i=this._getKnownOptions(t,e);if(r){const o=new Map(jk(r,(a,u)=>[Ue.fromServerFormat(u),a!==void 0?En(a,e):null]));i.setAll(o)}return(s=i.value.mapValue.fields)!=null?s:{}}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function dV(n){return typeof n=="object"&&n!==null&&!!("nullValue"in n&&(n.nullValue===null||n.nullValue==="NULL_VALUE")||"booleanValue"in n&&(n.booleanValue===null||typeof n.booleanValue=="boolean")||"integerValue"in n&&(n.integerValue===null||typeof n.integerValue=="number"||typeof n.integerValue=="string")||"doubleValue"in n&&(n.doubleValue===null||typeof n.doubleValue=="number")||"timestampValue"in n&&(n.timestampValue===null||function(t){return typeof t=="object"&&t!==null&&"seconds"in t&&(t.seconds===null||typeof t.seconds=="number"||typeof t.seconds=="string")&&"nanos"in t&&(t.nanos===null||typeof t.nanos=="number")}(n.timestampValue))||"stringValue"in n&&(n.stringValue===null||typeof n.stringValue=="string")||"bytesValue"in n&&(n.bytesValue===null||n.bytesValue instanceof Uint8Array)||"referenceValue"in n&&(n.referenceValue===null||typeof n.referenceValue=="string")||"geoPointValue"in n&&(n.geoPointValue===null||function(t){return typeof t=="object"&&t!==null&&"latitude"in t&&(t.latitude===null||typeof t.latitude=="number")&&"longitude"in t&&(t.longitude===null||typeof t.longitude=="number")}(n.geoPointValue))||"arrayValue"in n&&(n.arrayValue===null||function(t){return typeof t=="object"&&t!==null&&!(!("values"in t)||t.values!==null&&!Array.isArray(t.values))}(n.arrayValue))||"mapValue"in n&&(n.mapValue===null||function(t){return typeof t=="object"&&t!==null&&!(!("fields"in t)||t.fields!==null&&!ja(t.fields))}(n.mapValue))||"fieldReferenceValue"in n&&(n.fieldReferenceValue===null||typeof n.fieldReferenceValue=="string")||"functionValue"in n&&(n.functionValue===null||function(t){return typeof t=="object"&&t!==null&&!(!("name"in t)||t.name!==null&&typeof t.name!="string"||!("args"in t)||t.args!==null&&!Array.isArray(t.args))}(n.functionValue))||"pipelineValue"in n&&(n.pipelineValue===null||function(t){return typeof t=="object"&&t!==null&&!(!("stages"in t)||t.stages!==null&&!Array.isArray(t.stages))}(n.pipelineValue)))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function fV(){return new Xa("deleteField")}function pV(){return new wf("serverTimestamp")}function mV(...n){return new If("arrayUnion",n)}function gV(...n){return new Tf("arrayRemove",n)}function _V(n){return new Ef("increment",n)}function yV(n){return new Pt(n)}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function U(n){let e;return n instanceof xi?n:(e=ja(n)?vV(n):n instanceof Array?AV(n):LT(n,void 0),e)}function ph(n){if(n instanceof xi)return n;if(n instanceof Pt)return Ea(n);if(Array.isArray(n))return Ea(yV(n));throw new Error("Unsupported value: "+typeof n)}function Rf(n){return Hk(n)?Jc(n):U(n)}class xi{constructor(){this._protoValueType="ProtoValue"}add(e){return new V("add",[this,U(e)],"add")}asBoolean(){if(this instanceof kr)return this;if(this instanceof Li)return new FT(this);if(this instanceof Oi)return new EV(this);if(this instanceof V)return new MT(this);throw new O("invalid-argument",`Conversion of type ${typeof this} to BooleanExpression not supported.`)}subtract(e){return new V("subtract",[this,U(e)],"subtract")}multiply(e){return new V("multiply",[this,U(e)],"multiply")}divide(e){return new V("divide",[this,U(e)],"divide")}mod(e){return new V("mod",[this,U(e)],"mod")}equal(e){return new V("equal",[this,U(e)],"equal").asBoolean()}notEqual(e){return new V("not_equal",[this,U(e)],"notEqual").asBoolean()}lessThan(e){return new V("less_than",[this,U(e)],"lessThan").asBoolean()}lessThanOrEqual(e){return new V("less_than_or_equal",[this,U(e)],"lessThanOrEqual").asBoolean()}greaterThan(e){return new V("greater_than",[this,U(e)],"greaterThan").asBoolean()}greaterThanOrEqual(e){return new V("greater_than_or_equal",[this,U(e)],"greaterThanOrEqual").asBoolean()}arrayConcat(e,...t){const r=[e,...t].map(i=>U(i));return new V("array_concat",[this,...r],"arrayConcat")}arrayContains(e){return new V("array_contains",[this,U(e)],"arrayContains").asBoolean()}arrayContainsAll(e){const t=Array.isArray(e)?new Bo(e.map(U),"arrayContainsAll"):e;return new V("array_contains_all",[this,t],"arrayContainsAll").asBoolean()}arrayContainsAny(e){const t=Array.isArray(e)?new Bo(e.map(U),"arrayContainsAny"):e;return new V("array_contains_any",[this,t],"arrayContainsAny").asBoolean()}arrayReverse(){return new V("array_reverse",[this])}arrayLength(){return new V("array_length",[this],"arrayLength")}equalAny(e){const t=Array.isArray(e)?new Bo(e.map(U),"equalAny"):e;return new V("equal_any",[this,t],"equalAny").asBoolean()}notEqualAny(e){const t=Array.isArray(e)?new Bo(e.map(U),"notEqualAny"):e;return new V("not_equal_any",[this,t],"notEqualAny").asBoolean()}exists(){return new V("exists",[this],"exists").asBoolean()}charLength(){return new V("char_length",[this],"charLength")}like(e){return new V("like",[this,U(e)],"like").asBoolean()}regexContains(e){return new V("regex_contains",[this,U(e)],"regexContains").asBoolean()}regexFind(e){return new V("regex_find",[this,U(e)],"regexFind")}regexFindAll(e){return new V("regex_find_all",[this,U(e)],"regexFindAll")}regexMatch(e){return new V("regex_match",[this,U(e)],"regexMatch").asBoolean()}stringContains(e){return new V("string_contains",[this,U(e)],"stringContains").asBoolean()}startsWith(e){return new V("starts_with",[this,U(e)],"startsWith").asBoolean()}endsWith(e){return new V("ends_with",[this,U(e)],"endsWith").asBoolean()}toLower(){return new V("to_lower",[this],"toLower")}toUpper(){return new V("to_upper",[this],"toUpper")}trim(e){const t=[this];return e&&t.push(U(e)),new V("trim",t,"trim")}ltrim(e){const t=[this];return e&&t.push(U(e)),new V("ltrim",t,"ltrim")}rtrim(e){const t=[this];return e&&t.push(U(e)),new V("rtrim",t,"rtrim")}type(){return new V("type",[this])}isType(e){return new V("is_type",[this,Ea(e)],"isType").asBoolean()}stringConcat(e,...t){const r=[e,...t].map(U);return new V("string_concat",[this,...r],"stringConcat")}stringIndexOf(e){return new V("string_index_of",[this,U(e)],"stringIndexOf")}stringRepeat(e){return new V("string_repeat",[this,U(e)],"stringRepeat")}stringReplaceAll(e,t){return new V("string_replace_all",[this,U(e),U(t)],"stringReplaceAll")}stringReplaceOne(e,t){return new V("string_replace_one",[this,U(e),U(t)],"stringReplaceOne")}concat(e,...t){const r=[e,...t].map(U);return new V("concat",[this,...r],"concat")}reverse(){return new V("reverse",[this],"reverse")}arrayFilter(e,t){return new V("array_filter",[this,U(e),t],"arrayFilter")}arrayTransform(e,t){return new V("array_transform",[this,U(e),t],"arrayTransform")}arrayTransformWithIndex(e,t,r){return new V("array_transform",[this,U(e),U(t),r],"arrayTransformWithIndex")}arraySlice(e,t){const r=[this,U(e)];return t!==void 0&&r.push(U(t)),new V("array_slice",r,"arraySlice")}arrayFirst(){return new V("array_first",[this],"arrayFirst")}arrayFirstN(e){return new V("array_first_n",[this,U(e)],"arrayFirstN")}arrayLast(){return new V("array_last",[this],"arrayLast")}arrayLastN(e){return new V("array_last_n",[this,U(e)],"arrayLastN")}arrayMaximum(){return new V("maximum",[this],"arrayMaximum")}arrayMaximumN(e){return new V("maximum_n",[this,U(e)],"arrayMaximumN")}arrayMinimum(){return new V("minimum",[this],"arrayMinimum")}arrayMinimumN(e){return new V("minimum_n",[this,U(e)],"arrayMinimumN")}arrayIndexOf(e){return new V("array_index_of",[this,U(e),U("first")],"arrayIndexOf")}arrayLastIndexOf(e){return new V("array_index_of",[this,U(e),U("last")],"arrayLastIndexOf")}arrayIndexOfAll(e){return new V("array_index_of_all",[this,U(e)],"arrayIndexOfAll")}byteLength(){return new V("byte_length",[this],"byteLength")}ceil(){return new V("ceil",[this])}floor(){return new V("floor",[this])}abs(){return new V("abs",[this])}exp(){return new V("exp",[this])}mapGet(e){return new V("map_get",[this,Ea(e)],"mapGet")}mapSet(e,t,...r){const i=[this,U(e),U(t),...r.map(U)];return new V("map_set",i,"mapSet")}mapKeys(){return new V("map_keys",[this],"mapKeys")}mapValues(){return new V("map_values",[this],"mapValues")}mapEntries(){return new V("map_entries",[this],"mapEntries")}getField(e){return new V("get_field",[this,U(e)],"get_field")}count(){return Vt._create("count",[this],"count")}sum(){return Vt._create("sum",[this],"sum")}average(){return Vt._create("average",[this],"average")}minimum(){return Vt._create("minimum",[this],"minimum")}maximum(){return Vt._create("maximum",[this],"maximum")}first(){return Vt._create("first",[this],"first")}last(){return Vt._create("last",[this],"last")}arrayAgg(){return Vt._create("array_agg",[this],"arrayAgg")}arrayAggDistinct(){return Vt._create("array_agg_distinct",[this],"arrayAggDistinct")}countDistinct(){return Vt._create("count_distinct",[this],"countDistinct")}logicalMaximum(e,...t){const r=[e,...t];return new V("maximum",[this,...r.map(U)],"logicalMaximum")}logicalMinimum(e,...t){const r=[e,...t];return new V("minimum",[this,...r.map(U)],"minimum")}vectorLength(){return new V("vector_length",[this],"vectorLength")}cosineDistance(e){return new V("cosine_distance",[this,ph(e)],"cosineDistance")}dotProduct(e){return new V("dot_product",[this,ph(e)],"dotProduct")}euclideanDistance(e){return new V("euclidean_distance",[this,ph(e)],"euclideanDistance")}unixMicrosToTimestamp(){return new V("unix_micros_to_timestamp",[this],"unixMicrosToTimestamp")}timestampToUnixMicros(){return new V("timestamp_to_unix_micros",[this],"timestampToUnixMicros")}unixMillisToTimestamp(){return new V("unix_millis_to_timestamp",[this],"unixMillisToTimestamp")}timestampToUnixMillis(){return new V("timestamp_to_unix_millis",[this],"timestampToUnixMillis")}unixSecondsToTimestamp(){return new V("unix_seconds_to_timestamp",[this],"unixSecondsToTimestamp")}timestampToUnixSeconds(){return new V("timestamp_to_unix_seconds",[this],"timestampToUnixSeconds")}timestampAdd(e,t){return new V("timestamp_add",[this,U(e),U(t)],"timestampAdd")}timestampSubtract(e,t){return new V("timestamp_subtract",[this,U(e),U(t)],"timestampSubtract")}timestampDiff(e,t){return new V("timestamp_diff",[this,Rf(e),U(t)],"timestampDiff")}timestampExtract(e,t){const r=[this,U(e)];return t&&r.push(U(t)),new V("timestamp_extract",r,"timestampExtract")}documentId(){return new V("document_id",[this],"documentId")}parent(){return new V("parent",[this],"parent")}substring(e,t){const r=U(e);return new V("substring",t===void 0?[this,r]:[this,r,U(t)],"substring")}arrayGet(e){return new V("array_get",[this,U(e)],"arrayGet")}isError(){return new V("is_error",[this],"isError").asBoolean()}ifError(e){const t=new V("if_error",[this,U(e)],"ifError");return e instanceof kr?t.asBoolean():t}isAbsent(){return new V("is_absent",[this],"isAbsent").asBoolean()}mapRemove(e){return new V("map_remove",[this,U(e)],"mapRemove")}mapMerge(e,...t){const r=U(e),i=t.map(U);return new V("map_merge",[this,r,...i],"mapMerge")}pow(e){return new V("pow",[this,U(e)])}trunc(e){return e===void 0?new V("trunc",[this]):new V("trunc",[this,U(e)],"trunc")}round(e){return e===void 0?new V("round",[this]):new V("round",[this,U(e)],"round")}collectionId(){return new V("collection_id",[this])}length(){return new V("length",[this])}ln(){return new V("ln",[this])}sqrt(){return new V("sqrt",[this])}stringReverse(){return new V("string_reverse",[this])}ifAbsent(e){return new V("if_absent",[this,U(e)],"ifAbsent")}ifNull(e){return new V("if_null",[this,U(e)],"ifNull")}coalesce(e,...t){return new V("coalesce",[this,U(e),...t.map(U)],"coalesce")}join(e){return new V("join",[this,U(e)],"join")}log10(){return new V("log10",[this])}arraySum(){return new V("sum",[this])}split(e){return new V("split",[this,U(e)])}timestampTruncate(e,t){const r=[this,U(e)];return t&&r.push(U(t)),new V("timestamp_trunc",r)}ascending(){return bV(this)}descending(){return RV(this)}as(e){return new IV(this,e,"as")}}class Vt{constructor(e,t){this.name=e,this.params=t,this.exprType="AggregateFunction",this._protoValueType="ProtoValue"}static _create(e,t,r){const i=new Vt(e,t);return i._methodName=r,i}as(e){return new wV(this,e,"as")}_toProto(e){return{functionValue:{name:this.name,args:this.params.map(t=>t._toProto(e))}}}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,this.params.forEach(t=>t._readUserData(e))}}class wV{constructor(e,t,r){this.aggregate=e,this.alias=t,this._methodName=r}_readUserData(e){this.aggregate._readUserData(e)}}class IV{constructor(e,t,r){this.expr=e,this.alias=t,this._methodName=r,this.exprType="AliasedExpression",this.selectable=!0}_readUserData(e){this.expr._readUserData(e)}}class Bo extends xi{constructor(e,t){super(),this.ur=e,this._methodName=t,this.expressionType="ListOfExpressions"}_toProto(e){return{arrayValue:{values:this.ur.map(t=>t._toProto(e))}}}_readUserData(e){this.ur.forEach(t=>t._readUserData(e))}}class Oi extends xi{constructor(e,t){super(),this.fieldPath=e,this._methodName=t,this.expressionType="Field",this.selectable=!0}get _fieldPath(){return this.fieldPath}get fieldName(){return this.fieldPath.canonicalString()}get alias(){return this.fieldName}get expr(){return this}geoDistance(e){return new V("geo_distance",[this,U(e)],"geoDistance")}_toProto(e){return{fieldReferenceValue:this.fieldPath.canonicalString()}}_readUserData(e){}}function Jc(n){return TV(n,"field")}function TV(n,e){return new Oi(typeof n=="string"?hn===n?LN()._internalPath:Bn("field",n):n._internalPath,e)}class Li extends xi{constructor(e,t){super(),this.value=e,this._methodName=t,this.expressionType="Constant"}static _fromProto(e){const t=new Li(e,void 0);return t._protoValue=e,t}_toProto(e){return F(this._protoValue!==void 0,237),this._protoValue}_getValue(){return this._protoValue}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,dV(this._protoValue)||(this._protoValue=En(this.value,e))}}function Ea(n,e){return LT(n,"constant")}function LT(n,e){const t=new Li(n,e);return typeof n=="boolean"?new FT(t):t}class V extends xi{constructor(e,t,r,i){super(),this.name=e,this.params=t,this.expressionType="Function",this._optionsProto=void 0,r!==void 0&&(this._methodName=r),i!==void 0&&(this._options=i)}get _optionsUtil(){return new dt({})}_toProto(e){const t={functionValue:{name:this.name,args:this.params.map(r=>r._toProto(e))}};return this._optionsProto&&(t.functionValue.options=this._optionsProto),t}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,this.params.forEach(t=>t._readUserData(e)),this._options&&(this._optionsProto=this._optionsUtil.getOptionsProto(e,this._options))}}class kr extends xi{get _methodName(){return this._expr._methodName}countIf(){return Vt._create("count_if",[this],"countIf")}not(){return new V("not",[this],"not").asBoolean()}conditional(e,t){return new V("conditional",[this,e,t],"conditional")}ifError(e){const t=U(e),r=new V("if_error",[this,t],"ifError");return t instanceof kr?r.asBoolean():r}_toProto(e){return this._expr._toProto(e)}_readUserData(e){this._expr._readUserData(e)}}class MT extends kr{constructor(e){super(),this._expr=e,this.expressionType="Function"}}class FT extends kr{constructor(e){super(),this._expr=e,this.expressionType="Constant"}_getValue(){return this._expr._getValue()}}class EV extends kr{constructor(e){super(),this._expr=e,this.expressionType="Field"}}function vV(n,e){const t=[];for(const r in n)if(Object.prototype.hasOwnProperty.call(n,r)){const i=n[r];t.push(Ea(r)),t.push(U(i))}return new V("map",t,"map")}function AV(n){return function(t,r){return new V("array",t.map(i=>U(i)),r)}(n,"array")}function bV(n){return new Sf(Rf(n),"ascending","ascending")}function RV(n){return new Sf(Rf(n),"descending","descending")}class Sf{constructor(e,t,r){this.expr=e,this.direction=t,this._methodName=r,this._protoValueType="ProtoValue"}_toProto(e){return{mapValue:{fields:{direction:dT(this.direction),expression:this.expr._toProto(e)}}}}_readUserData(e){this.expr._readUserData(e)}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ft{constructor(e){var t,r;this.optionsProto=void 0,r=t=e,{rawOptions:this.rawOptions}=r,this.knownOptions=vo(r,["rawOptions"])}_readUserData(e){this.optionsProto=this._optionsUtil.getOptionsProto(e,this.knownOptions,this.rawOptions)}_toProto(e){return{name:this._name,options:this.optionsProto}}}class UT extends Ft{get _name(){return"add_fields"}get _optionsUtil(){return new dt({})}constructor(e,t){super(t),this.fields=e}_toProto(e){return ce(G({},super._toProto(e)),{args:[Ta(e,this.fields)]})}_readUserData(e){super._readUserData(e),Vr(this.fields,e)}}class BT extends Ft{get _name(){return"aggregate"}get _optionsUtil(){return new dt({})}constructor(e,t,r){super(r),this.groups=e,this.accumulators=t}_toProto(e){return ce(G({},super._toProto(e)),{args:[Ta(e,this.accumulators),Ta(e,this.groups)]})}_readUserData(e){super._readUserData(e),Vr(this.groups,e),Vr(this.accumulators,e)}}class qT extends Ft{get _name(){return"distinct"}get _optionsUtil(){return new dt({})}constructor(e,t){super(t),this.groups=e}_toProto(e){return ce(G({},super._toProto(e)),{args:[Ta(e,this.groups)]})}_readUserData(e){super._readUserData(e),Vr(this.groups,e)}}class Za extends Ft{get _name(){return"collection"}get _optionsUtil(){return new dt({forceIndex:{serverName:"force_index"}})}constructor(e,t){super(t),this.Er=e.startsWith("/")?e:"/"+e}_toProto(e){return ce(G({},super._toProto(e)),{args:[{referenceValue:this.Er}]})}_readUserData(e){super._readUserData(e)}}class ec extends Ft{get _name(){return"collection_group"}get _optionsUtil(){return new dt({forceIndex:{serverName:"force_index"}})}constructor(e,t){super(t),this.collectionId=e}_toProto(e){return ce(G({},super._toProto(e)),{args:[{referenceValue:""},{stringValue:this.collectionId}]})}_readUserData(e){super._readUserData(e)}}class ol extends Ft{get _name(){return"database"}get _optionsUtil(){return new dt({})}_toProto(e){return G({},super._toProto(e))}_readUserData(e){super._readUserData(e)}}class al extends Ft{get _name(){return"documents"}get _optionsUtil(){return new dt({})}constructor(e,t){if(super(t),!e||e.length===0)throw new O(k.INVALID_ARGUMENT,"Empty document paths are not allowed in DocumentsSource");const r=e.map(s=>s.startsWith("/")?s:"/"+s),i=new Set(r);if(i.size!==r.length)throw new O(k.INVALID_ARGUMENT,"Duplicate document paths are not allowed in DocumentsSource");this.hr=r,this.Tr=i}_toProto(e){return ce(G({},super._toProto(e)),{args:this.hr.map(t=>({referenceValue:t}))})}_readUserData(e){super._readUserData(e)}}class tc extends Ft{get _name(){return"where"}get _optionsUtil(){return new dt({})}constructor(e,t){super(t),this.condition=e}_toProto(e){return ce(G({},super._toProto(e)),{args:[this.condition._toProto(e)]})}_readUserData(e){super._readUserData(e),Vr(this.condition,e)}}class Nr extends Ft{get _name(){return"limit"}get _optionsUtil(){return new dt({})}constructor(e,t){F(!isNaN(e)&&e!==1/0&&e!==-1/0,34860),super(t),this.limit=e}_toProto(e){return ce(G({},super._toProto(e)),{args:[Zu(e,this.limit)]})}}class u_ extends Ft{get _name(){return"offset"}get _optionsUtil(){return new dt({})}constructor(e,t){super(t),this.offset=e}_toProto(e){return ce(G({},super._toProto(e)),{args:[Zu(e,this.offset)]})}}class SV extends Ft{get _name(){return"select"}get _optionsUtil(){return new dt({})}constructor(e,t){super(t),this.selections=e}_toProto(e){return ce(G({},super._toProto(e)),{args:[Ta(e,this.selections)]})}_readUserData(e){super._readUserData(e),Vr(this.selections,e)}}class fn extends Ft{get _name(){return"sort"}get _optionsUtil(){return new dt({})}constructor(e,t){super(t),this.orderings=e}_toProto(e){return ce(G({},super._toProto(e)),{args:this.orderings.map(t=>t._toProto(e))})}_readUserData(e){super._readUserData(e),Vr(this.orderings,e)}}class Pf extends Ft{get _name(){return"replace_with"}get _optionsUtil(){return new dt({})}constructor(e,t){super(t),this.map=e}_toProto(e){return ce(G({},super._toProto(e)),{args:[this.map._toProto(e),dT(Pf.Pr)]})}_readUserData(e){super._readUserData(e),Vr(this.map,e)}}Pf.Pr="full_replace";function Vr(n,e){return OT(n)?n._readUserData(e):Array.isArray(n)?n.forEach(t=>t._readUserData(e)):n instanceof Map?n.forEach(t=>t._readUserData(e)):Object.values(n).forEach(t=>t._readUserData(e)),n}/**
 * @license
 * Copyright 2026 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zo{constructor(e,t,r,i){this._db=e,this.userDataReader=t,this._userDataWriter=r,this.stages=i}Ar(e,t){const r=this.userDataReader.createContext(3,e);return OT(t)?t._readUserData(r):Array.isArray(t)?t.forEach(i=>i._readUserData(r)):t.forEach(i=>i._readUserData(r)),t}where(e){const t=this.stages.map(r=>r);return this.Ar("where",e),t.push(new tc(e,{})),new Zo(this._db,this.userDataReader,this._userDataWriter,t)}limit(e){const t=this.stages.map(r=>r);return t.push(new Nr(e,{})),new Zo(this._db,this.userDataReader,this._userDataWriter,t)}sort(e,...t){const r=this.stages.map(i=>i);return"orderings"in e?r.push(new fn(this.Ar("sort",e.orderings),{})):r.push(new fn(this.Ar("sort",[e,...t]),{})),new Zo(this._db,this.userDataReader,this._userDataWriter,r)}Vr(e){return{pipeline:{stages:this.stages.map(t=>t._toProto(e))}}}}// Copyright 2024 Google LLC* @license
class ot{constructor(e,t,r){this.serializer=e,this.stages=t,this.listenOptions=r,this.isCorePipeline=!0}getPipelineCollection(){return nc(this)}getPipelineCollectionGroup(){return Cf(this)}getPipelineCollectionId(){return $T(this)}getPipelineDocuments(){return yu(this)}getPipelineFlavor(){return function(t){let r="exact";return t.stages.forEach((i,s)=>{i._name!==qT.name&&i._name!==BT.name||(r="keyless"),i._name===SV.name&&r==="exact"&&(r="augmented"),i._name===UT.name&&s<t.stages.length-1&&r==="exact"&&(r="augmented")}),r}(this)}getPipelineSourceType(){return Dn(this)}}function Dn(n){const e=n.stages[0];return e instanceof Za||e instanceof ec||e instanceof ol||e instanceof al?e._name:"unknown"}function nc(n){if(Dn(n)==="collection")return n.stages[0].Er}function Cf(n){if(Dn(n)==="collection_group")return n.stages[0].collectionId}function $T(n){switch(Dn(n)){case"collection":return te.fromString(nc(n)).lastSegment();case"collection_group":return Cf(n);default:return}}function yu(n){if(Dn(n)==="documents")return n.stages[0].hr}class v{constructor(e,t){this.type=e,this.value=t}static dr(){return new v("ERROR",void 0)}static mr(){return new v("UNSET",void 0)}static pr(){return new v("NULL",gn)}static newValue(e){return Lt(e)?new v("NULL",gn):function(r){return!!r&&"booleanValue"in r}(e)?new v("BOOLEAN",e):dn(e)?new v("INT",e):ii(e)?new v("DOUBLE",e):function(r){return!!r&&"timestampValue"in r&&!!r.timestampValue}(e)?new v("TIMESTAMP",e):function(r){return!!r&&"stringValue"in r}(e)?new v("STRING",e):function(r){return!!r&&"bytesValue"in r}(e)?new v("BYTES",e):e.referenceValue?new v("REFERENCE",e):e.geoPointValue?new v("GEO_POINT",e):Sr(e)?new v("ARRAY",e):Ti(e)?new v("VECTOR",e):hi(e)?new v("MAP",e):new v("ERROR",void 0)}gr(){return this.type==="ERROR"||this.type==="UNSET"}yr(){return this.type==="NULL"}}function ea(n){if(!n.gr())return n.value}function jT(n){return n instanceof kr?n._expr:n}function J(n){if((n=jT(n))instanceof Oi)return new PV(n);if(n instanceof Li)return new CV(n);if(n instanceof Bo)return new kV(n);if(n instanceof V){if(n.name==="add")return new DV(n);if(n.name==="subtract")return new xV(n);if(n.name==="multiply")return new OV(n);if(n.name==="divide")return new LV(n);if(n.name==="mod")return new MV(n);if(n.name==="and")return new FV(n);if(n.name==="equal")return new JV(n);if(n.name==="not_equal")return new YV(n);if(n.name==="less_than")return new XV(n);if(n.name==="less_than_or_equal")return new ZV(n);if(n.name==="greater_than")return new eD(n);if(n.name==="greater_than_or_equal")return new tD(n);if(n.name==="array_concat")return new nD(n);if(n.name==="array_reverse")return new rD(n);if(n.name==="array_contains")return new iD(n);if(n.name==="array_contains_all")return new sD(n);if(n.name==="array_contains_any")return new oD(n);if(n.name==="array_length")return new aD(n);if(n.name==="array_element")return new cD(n);if(n.name==="equal_any")return new zT(n);if(n.name==="not_equal_any")return new BV(n);if(n.name==="is_nan")return new qV(n);if(n.name==="is_not_nan")return new $V(n);if(n.name==="is_null")return new jV(n);if(n.name==="is_not_null")return new zV(n);if(n.name==="is_error")return new KV(n);if(n.name==="exists")return new GV(n);if(n.name==="not")return new cl(n);if(n.name==="or")return new UV(n);if(n.name==="xor")return new kf(n);if(n.name==="conditional")return new WV(n);if(n.name==="maximum")return new HV(n);if(n.name==="minimum")return new QV(n);if(n.name==="reverse")return new uD(n);if(n.name==="replace_first")return new lD(n);if(n.name==="replace_all")return new hD(n);if(n.name==="char_length")return new dD(n);if(n.name==="byte_length")return new fD(n);if(n.name==="like")return new pD(n);if(n.name==="regex_contains")return new mD(n);if(n.name==="regex_match")return new gD(n);if(n.name==="string_contains")return new _D(n);if(n.name==="starts_with")return new yD(n);if(n.name==="ends_with")return new wD(n);if(n.name==="to_lower")return new ID(n);if(n.name==="to_upper")return new TD(n);if(n.name==="trim")return new ED(n);if(n.name==="string_concat")return new vD(n);if(n.name==="map_get")return new AD(n);if(n.name==="cosine_distance")return new bD(n);if(n.name==="dot_product")return new RD(n);if(n.name==="euclidean_distance")return new SD(n);if(n.name==="vector_length")return new PD(n);if(n.name==="unix_micros_to_timestamp")return new DD(n);if(n.name==="timestamp_to_unix_micros")return new LD(n);if(n.name==="unix_millis_to_timestamp")return new xD(n);if(n.name==="timestamp_to_unix_millis")return new MD(n);if(n.name==="unix_seconds_to_timestamp")return new OD(n);if(n.name==="timestamp_to_unix_seconds")return new FD(n);if(n.name==="timestamp_add")return new UD(n);if(n.name==="timestamp_subtract")return new BD(n)}throw new Error(`Unknown Expr : ${n}`)}class PV{constructor(e){this.expr=e}evaluate(e,t){if(this.expr.fieldName===hn)return v.newValue({referenceValue:Es(e.serializer,t.key)});if(this.expr.fieldName==="__update_time__")return v.newValue({timestampValue:Qc(e.serializer,t.version)});if(this.expr.fieldName==="__create_time__")return v.newValue({timestampValue:Qc(e.serializer,t.createTime)});const r=t.data.field(this.expr._fieldPath);return r?Ka(r)?v.newValue(function(s,o){if(s.serverTimestampBehavior==="estimate")return{timestampValue:Qc(s.serializer,H.fromTimestamp(ms(o)))};if(s.serverTimestampBehavior==="previous"){const a=Ga(o);if(a)return a}return{nullValue:"NULL_VALUE"}}(e,r)):v.newValue(r):v.mr()}}class CV{constructor(e){this.expr=e}evaluate(e,t){return v.newValue(this.expr._getValue())}}class kV{constructor(e){this.expr=e}evaluate(e,t){const r=this.expr.ur.map(i=>J(i).evaluate(e,t));return r.some(i=>i.gr())?v.dr():v.newValue({arrayValue:{values:r.map(i=>i.value)}})}}function tt(n){return ii(n)?Number(n.doubleValue):Number(n.integerValue)}function vn(n){return BigInt(n.integerValue)}const NV=BigInt("0x7fffffffffffffff"),VV=-BigInt("0x8000000000000000");class rc{constructor(e){this.expr=e}evaluate(e,t){F(this.expr.params.length>=2,24778);const r=J(this.expr.params[0]).evaluate(e,t),i=J(this.expr.params[1]).evaluate(e,t);let s=this.wr(r,i);for(const o of this.expr.params.slice(2)){const a=J(o).evaluate(e,t);s=this.wr(s,a)}return s}wr(e,t){if(e.gr()||t.gr())return v.dr();if(e.yr()||t.yr())return v.pr();const r=e.value,i=t.value;if(!ii(r)&&!dn(r)||!ii(i)&&!dn(i))return v.dr();if(ii(r)||ii(i)){const s=this.br(r,i);return s?v.newValue(s):v.dr()}if(dn(r)&&dn(i)){const s=this.Sr(r,i);return s===void 0?v.dr():typeof s=="number"?v.newValue({doubleValue:s}):s<VV||s>NV?v.dr():v.newValue({integerValue:`${s}`})}return v.dr()}}function qn(n,e){return qe(n)!==qe(e)?"TYPE_MISMATCH":kt(n)||kt(e)?"NOT_EQ":Lt(n)&&Lt(e)?"EQ":Lt(n)||Lt(e)?"NULL":Sr(n)&&Sr(e)?function(r,i){var o,a,u,l;if(((o=r.values)==null?void 0:o.length)!==((a=i.values)==null?void 0:a.length))return"NOT_EQ";let s=!1;for(let h=0;h<((l=(u=r.values)==null?void 0:u.length)!=null?l:0);h++){const f=r.values[h],g=i.values[h];switch(qn(f,g)){case"EQ":break;case"NOT_EQ":case"TYPE_MISMATCH":return"NOT_EQ";case"NULL":s=!0;break;default:j(44609,{vr:f,Dr:g})}}return s?"NULL":"EQ"}(n.arrayValue,e.arrayValue):Ti(n)&&Ti(e)||hi(n)&&hi(e)?function(r,i){const s=r.fields||{},o=i.fields||{};if(lu(s)!==lu(o))return"NOT_EQ";let a=!1;for(const u in s)if(s.hasOwnProperty(u)){if(o[u]===void 0)return"NOT_EQ";switch(qn(s[u],o[u])){case"NOT_EQ":case"TYPE_MISMATCH":return"NOT_EQ";case"NULL":a=!0}}return a?"NULL":"EQ"}(n.mapValue,e.mapValue):function(r,i){return zt(r,i,{o:!1,t:!0,i:!0})}(n,e)?"EQ":"NOT_EQ"}class DV extends rc{Sr(e,t){return vn(e)+vn(t)}br(e,t){return{doubleValue:tt(e)+tt(t)}}}class xV extends rc{constructor(e){super(e),this.expr=e}Sr(e,t){return vn(e)-vn(t)}br(e,t){return{doubleValue:tt(e)-tt(t)}}}class OV extends rc{constructor(e){super(e),this.expr=e}Sr(e,t){return vn(e)*vn(t)}br(e,t){return{doubleValue:tt(e)*tt(t)}}}class LV extends rc{constructor(e){super(e),this.expr=e}Sr(e,t){const r=vn(t);if(r!==BigInt(0))return vn(e)/r}br(e,t){const r=tt(t);return r===0?{doubleValue:gs(r)?Number.NEGATIVE_INFINITY:Number.POSITIVE_INFINITY}:{doubleValue:tt(e)/r}}}class MV extends rc{constructor(e){super(e),this.expr=e}Sr(e,t){const r=vn(t);if(r!==BigInt(0))return vn(e)%r}br(e,t){const r=tt(t);if(r!==0)return{doubleValue:tt(e)%r}}}class FV{constructor(e){this.expr=e}evaluate(e,t){var s;let r=!1,i=!1;for(const o of this.expr.params){const a=J(o).evaluate(e,t);switch(a.type){case"BOOLEAN":if(!((s=a.value)!=null&&s.booleanValue))return v.newValue(Je);break;case"NULL":i=!0;break;default:r=!0}}return r?v.dr():i?v.pr():v.newValue(Ct)}}class cl{constructor(e){this.expr=e}evaluate(e,t){var i;F(this.expr.params.length===1,9634);const r=J(this.expr.params[0]).evaluate(e,t);switch(r.type){case"BOOLEAN":return v.newValue({booleanValue:!((i=r.value)!=null&&i.booleanValue)});case"NULL":return v.pr();default:return v.dr()}}}class UV{constructor(e){this.expr=e}evaluate(e,t){var s;let r=!1,i=!1;for(const o of this.expr.params){const a=J(o).evaluate(e,t);switch(a.type){case"BOOLEAN":if((s=a.value)!=null&&s.booleanValue)return v.newValue(Ct);break;case"NULL":i=!0;break;default:r=!0}}return r?v.dr():i?v.pr():v.newValue(Je)}}class kf{constructor(e){this.expr=e}evaluate(e,t){var s;let r=!1,i=!1;for(const o of this.expr.params){const a=J(o).evaluate(e,t);switch(a.type){case"BOOLEAN":r=kf.xor(r,!!((s=a.value)!=null&&s.booleanValue));break;case"NULL":i=!0;break;default:return v.dr()}}return i?v.pr():v.newValue({booleanValue:r})}static xor(e,t){return(e||t)&&!(e&&t)}}class zT{constructor(e){this.expr=e}evaluate(e,t){var o,a,u;F(this.expr.params.length===2,55094);let r=!1;const i=J(this.expr.params[0]).evaluate(e,t);switch(i.type){case"NULL":r=!0;break;case"ERROR":case"UNSET":return v.dr()}const s=J(this.expr.params[1]).evaluate(e,t);switch(s.type){case"ARRAY":break;case"NULL":r=!0;break;default:return v.dr()}if(r)return v.pr();for(const l of(u=(a=(o=s.value)==null?void 0:o.arrayValue)==null?void 0:a.values)!=null?u:[])switch(Lt(i.value)&&Lt(l)?"EQ":qn(i.value,l)){case"EQ":return v.newValue(Ct);case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":r=!0;break;default:j(44608,{value:i.value,candidate:l})}return r?v.pr():v.newValue(Je)}}class BV{constructor(e){this.expr=e}evaluate(e,t){return new cl(new V("not",[new V("equal_any",this.expr.params)])).evaluate(e,t)}}class qV{constructor(e){this.expr=e}evaluate(e,t){F(this.expr.params.length===1,23322);const r=J(this.expr.params[0]).evaluate(e,t);switch(r.type){case"INT":return v.newValue(Je);case"DOUBLE":return v.newValue({booleanValue:isNaN(tt(r.value))});case"NULL":return v.pr();default:return v.dr()}}}class $V{constructor(e){this.expr=e}evaluate(e,t){return F(this.expr.params.length===1,50406),new cl(new V("not",[new V("is_nan",this.expr.params)])).evaluate(e,t)}}class jV{constructor(e){this.expr=e}evaluate(e,t){switch(F(this.expr.params.length===1,23123),J(this.expr.params[0]).evaluate(e,t).type){case"NULL":return v.newValue(Ct);case"UNSET":case"ERROR":return v.dr();default:return v.newValue(Je)}}}class zV{constructor(e){this.expr=e}evaluate(e,t){return F(this.expr.params.length===1,23167),new cl(new V("not",[new V("is_null",this.expr.params)])).evaluate(e,t)}}class KV{constructor(e){this.expr=e}evaluate(e,t){return F(this.expr.params.length===1,5228),J(this.expr.params[0]).evaluate(e,t).type==="ERROR"?v.newValue(Ct):v.newValue(Je)}}class GV{constructor(e){this.expr=e}evaluate(e,t){switch(F(this.expr.params.length===1,6877),J(this.expr.params[0]).evaluate(e,t).type){case"ERROR":return v.dr();case"UNSET":return v.newValue(Je);default:return v.newValue(Ct)}}}class WV{constructor(e){this.expr=e}evaluate(e,t){var i;F(this.expr.params.length===3,11706);const r=J(this.expr.params[0]).evaluate(e,t);switch(r.type){case"BOOLEAN":return(i=r.value)!=null&&i.booleanValue?J(this.expr.params[1]).evaluate(e,t):J(this.expr.params[2]).evaluate(e,t);case"NULL":return J(this.expr.params[2]).evaluate(e,t);default:return v.dr()}}}class HV{constructor(e){this.expr=e}evaluate(e,t){const r=this.expr.params.map(s=>J(s).evaluate(e,t));let i;for(const s of r)switch(s.type){case"ERROR":case"UNSET":case"NULL":continue;default:i=i===void 0||ht(s.value,i.value)>0?s:i}return i===void 0?v.pr():i}}class QV{constructor(e){this.expr=e}evaluate(e,t){const r=this.expr.params.map(s=>J(s).evaluate(e,t));let i;for(const s of r)switch(s.type){case"ERROR":case"UNSET":case"NULL":continue;default:i=i===void 0||ht(s.value,i.value)<0?s:i}return i===void 0?v.pr():i}}class Ws{constructor(e){this.expr=e}evaluate(e,t){F(this.expr.params.length===2,31033,`${this.expr.name}() function should have exactly 2 params`);const r=J(this.expr.params[0]).evaluate(e,t);switch(r.type){case"ERROR":case"UNSET":return v.dr()}const i=J(this.expr.params[1]).evaluate(e,t);switch(i.type){case"ERROR":case"UNSET":return v.dr()}return this.Cr(r,i)}}class JV extends Ws{constructor(e){super(e),this.expr=e}Cr(e,t){if(e.yr()&&t.yr())return v.newValue(Ct);if(e.yr()||t.yr()||kt(e.value)||kt(t.value)||qe(e.value)!==qe(t.value))return v.newValue(Je);switch(qn(e.value,t.value)){case"EQ":return v.newValue(Ct);case"NOT_EQ":return v.newValue(Je);case"NULL":return v.pr();default:j(44615,{left:e,right:t})}}}class YV extends Ws{constructor(e){super(e),this.expr=e}Cr(e,t){switch(qn(e.value,t.value)){case"EQ":return v.newValue(Je);case"NOT_EQ":case"TYPE_MISMATCH":return v.newValue(Ct);case"NULL":return v.pr();default:j(44614,{left:e,right:t})}}}class XV extends Ws{constructor(e){super(e),this.expr=e}Cr(e,t){return qe(e.value)!==qe(t.value)||kt(e.value)||kt(t.value)?v.newValue(Je):v.newValue({booleanValue:ht(e.value,t.value)<0})}}class ZV extends Ws{constructor(e){super(e),this.expr=e}Cr(e,t){return qe(e.value)!==qe(t.value)||kt(e.value)||kt(t.value)?v.newValue(Je):qn(e.value,t.value)==="EQ"?v.newValue(Ct):v.newValue({booleanValue:ht(e.value,t.value)<0})}}class eD extends Ws{constructor(e){super(e),this.expr=e}Cr(e,t){return qe(e.value)!==qe(t.value)||kt(e.value)||kt(t.value)?v.newValue(Je):v.newValue({booleanValue:ht(e.value,t.value)>0})}}class tD extends Ws{constructor(e){super(e),this.expr=e}Cr(e,t){return qe(e.value)!==qe(t.value)||kt(e.value)||kt(t.value)?v.newValue(Je):qn(e.value,t.value)==="EQ"?v.newValue(Ct):v.newValue({booleanValue:ht(e.value,t.value)>0})}}class nD{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class rD{constructor(e){this.expr=e}evaluate(e,t){var i,s;F(this.expr.params.length===1,216);const r=J(this.expr.params[0]).evaluate(e,t);switch(r.type){case"NULL":return v.pr();case"ARRAY":{const o=(s=(i=r.value.arrayValue)==null?void 0:i.values)!=null?s:[];return v.newValue({arrayValue:{values:[...o].reverse()}})}default:return v.dr()}}}class iD{constructor(e){this.expr=e}evaluate(e,t){return F(this.expr.params.length===2,52884),new zT(new V("eq_any",[this.expr.params[1],this.expr.params[0]])).evaluate(e,t)}}class sD{constructor(e){this.expr=e}evaluate(e,t){var u,l,h,f,g,w;F(this.expr.params.length===2,1392);let r=!1;const i=J(this.expr.params[0]).evaluate(e,t);switch(i.type){case"ARRAY":break;case"NULL":r=!0;break;default:return v.dr()}const s=J(this.expr.params[1]).evaluate(e,t);switch(s.type){case"ARRAY":break;case"NULL":r=!0;break;default:return v.dr()}if(r)return v.pr();const o=(h=(l=(u=s.value)==null?void 0:u.arrayValue)==null?void 0:l.values)!=null?h:[],a=(w=(g=(f=i.value)==null?void 0:f.arrayValue)==null?void 0:g.values)!=null?w:[];for(const S of o){let D=!1;r=!1;for(const x of a){switch(Lt(S)&&Lt(x)?"EQ":qn(S,x)){case"EQ":D=!0;break;case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":r=!0;break;default:j(44613,{value:x,search:S})}if(D)break}if(!D)return v.newValue(Je)}return v.newValue(Ct)}}class oD{constructor(e){this.expr=e}evaluate(e,t){var u,l,h,f,g,w;F(this.expr.params.length===2,2680);let r=!1;const i=J(this.expr.params[0]).evaluate(e,t);switch(i.type){case"ARRAY":break;case"NULL":r=!0;break;default:return v.dr()}const s=J(this.expr.params[1]).evaluate(e,t);switch(s.type){case"ARRAY":break;case"NULL":r=!0;break;default:return v.dr()}if(r)return v.pr();const o=(h=(l=(u=s.value)==null?void 0:u.arrayValue)==null?void 0:l.values)!=null?h:[],a=(w=(g=(f=i.value)==null?void 0:f.arrayValue)==null?void 0:g.values)!=null?w:[];for(const S of a)for(const D of o)switch(Lt(S)&&Lt(D)?"EQ":qn(S,D)){case"EQ":return v.newValue(Ct);case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":r=!0;break;default:j(60403,{value:S,search:D})}return r?v.pr():v.newValue(Je)}}class aD{constructor(e){this.expr=e}evaluate(e,t){var i,s,o,a;F(this.expr.params.length===1,38605);const r=J(this.expr.params[0]).evaluate(e,t);switch(r.type){case"NULL":return v.pr();case"ARRAY":return v.newValue({integerValue:`${(a=(o=(s=(i=r.value)==null?void 0:i.arrayValue)==null?void 0:s.values)==null?void 0:o.length)!=null?a:0}`});default:return v.dr()}}}class cD{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class uD{constructor(e){this.expr=e}evaluate(e,t){var i,s;F(this.expr.params.length===1,1508);const r=J(this.expr.params[0]).evaluate(e,t);switch(r.type){case"NULL":return v.pr();case"BYTES":{const o=(i=r.value)==null?void 0:i.bytesValue;if(typeof o=="string"){const a=Ie.fromBase64String(o).toUint8Array();return a.reverse(),v.newValue({bytesValue:Ie.fromUint8Array(a).toBase64()})}return v.newValue({bytesValue:new Uint8Array(o).reverse()})}case"STRING":{const o=(s=r.value)==null?void 0:s.stringValue,a=new Intl.__PRIVATE_Segmenter(void 0,{granularity:"grapheme"}).segment(o),u=Array.from(a,l=>l.segment).reverse();return v.newValue({stringValue:u.join("")})}default:return v.dr()}}}class lD{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class hD{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class dD{constructor(e){this.expr=e}evaluate(e,t){F(this.expr.params.length===1,19400);const r=J(this.expr.params[0]).evaluate(e,t);switch(r.type){case"NULL":return v.pr();case"STRING":{const i=function(o){let a=0;for(let u=0;u<o.length;u++){const l=o.codePointAt(u);if(l===void 0)return;if(l<=65535)if(l>=55296&&l<=57343)if(l<=56319){const h=o.codePointAt(u+1);h!==void 0&&h>=56320&&h<=57343?(a+=1,u++):a+=1}else a+=1;else a+=1;else{if(!(l<=1114111))return;a+=1,u++}}return a}(r.value.stringValue);return i===void 0?v.dr():v.newValue({integerValue:i})}default:return v.dr()}}}class fD{constructor(e){this.expr=e}evaluate(e,t){var i,s;F(this.expr.params.length===1,8486);const r=J(this.expr.params[0]).evaluate(e,t);switch(r.type){case"BYTES":{const o=(i=r.value)==null?void 0:i.bytesValue;return typeof o=="string"?v.newValue({integerValue:Ie.fromBase64String(o).toUint8Array().length}):v.newValue({integerValue:new Uint8Array(o).length})}case"STRING":{const o=function(u){let l=0;for(let h=0;h<u.length;h++){const f=u.codePointAt(h);if(f===void 0)return;if(f>=55296&&f<=57343){if(!(f<=56319))return;{const g=u.codePointAt(h+1);if(g===void 0||!(g>=56320&&g<=57343))return;l+=4,h++}}else if(f<=127)l+=1;else if(f<=2047)l+=2;else if(f<=65535)l+=3;else{if(!(f<=1114111))return;l+=4,h++}}return l}((s=r.value)==null?void 0:s.stringValue);return o===void 0?v.dr():v.newValue({integerValue:o})}case"NULL":return v.pr();default:return v.dr()}}}class Hs{constructor(e){this.expr=e}evaluate(e,t){var o,a;F(this.expr.params.length===2,39773,`${this.expr.name}() function should have exactly two parameters`);let r=!1;const i=J(this.expr.params[0]).evaluate(e,t);switch(i.type){case"STRING":break;case"NULL":r=!0;break;default:return v.dr()}const s=J(this.expr.params[1]).evaluate(e,t);switch(s.type){case"STRING":break;case"NULL":r=!0;break;default:return v.dr()}return r?v.pr():this.Fr((o=i.value)==null?void 0:o.stringValue,(a=s.value)==null?void 0:a.stringValue)}}class pD extends Hs{Fr(e,t){try{const r=function(o){let a="";for(let u=0;u<o.length;u++){const l=o.charAt(u);switch(l){case"_":a+=".";break;case"%":a+=".*";break;case"\\":case".":case"*":case"?":case"+":case"^":case"$":case"|":case"(":case")":case"[":case"]":case"{":case"}":a+="\\"+l;break;default:a+=l}}return"^"+a+"$"}(t),i=Ed.compile(r);return v.newValue({booleanValue:i.matches(e)})}catch(r){return lt(`Invalid LIKE pattern converted to regex: ${t}, returning error. Error: ${r}`),v.dr()}}}class mD extends Hs{Fr(e,t){try{const r=Ed.compile(t);return v.newValue({booleanValue:r.test(e)})}catch(r){return lt(`Invalid regex pattern found in regex_contains: ${t}, returning error`),v.dr()}}}class gD extends Hs{Fr(e,t){try{return v.newValue({booleanValue:Ed.compile(t).matches(e)})}catch(r){return lt(`Invalid regex pattern found in regex_match: ${t}, returning error`),v.dr()}}}class _D extends Hs{Fr(e,t){return v.newValue({booleanValue:e.includes(t)})}}class yD extends Hs{Fr(e,t){return v.newValue({booleanValue:e.startsWith(t)})}}class wD extends Hs{Fr(e,t){return v.newValue({booleanValue:e.endsWith(t)})}}class ID{constructor(e){this.expr=e}evaluate(e,t){var i,s;F(this.expr.params.length===1,29079);const r=J(this.expr.params[0]).evaluate(e,t);switch(r.type){case"STRING":return v.newValue({stringValue:(s=(i=r.value)==null?void 0:i.stringValue)==null?void 0:s.toLowerCase()});case"NULL":return v.pr();default:return v.dr()}}}class TD{constructor(e){this.expr=e}evaluate(e,t){var i,s;F(this.expr.params.length===1,60487);const r=J(this.expr.params[0]).evaluate(e,t);switch(r.type){case"STRING":return v.newValue({stringValue:(s=(i=r.value)==null?void 0:i.stringValue)==null?void 0:s.toUpperCase()});case"NULL":return v.pr();default:return v.dr()}}}class ED{constructor(e){this.expr=e}evaluate(e,t){var i,s;F(this.expr.params.length===1,28544);const r=J(this.expr.params[0]).evaluate(e,t);switch(r.type){case"STRING":return v.newValue({stringValue:(s=(i=r.value)==null?void 0:i.stringValue)==null?void 0:s.trim()});case"NULL":return v.pr();default:return v.dr()}}}class vD{constructor(e){this.expr=e}evaluate(e,t){const r=this.expr.params.map(o=>J(o).evaluate(e,t));let i="",s=!1;for(const o of r)switch(o.type){case"STRING":i+=o.value.stringValue;break;case"NULL":s=!0;break;default:return v.dr()}return s?v.pr():v.newValue({stringValue:i})}}class AD{constructor(e){this.expr=e}evaluate(e,t){var o,a,u,l;F(this.expr.params.length===2,4483);const r=J(this.expr.params[0]).evaluate(e,t);switch(r.type){case"UNSET":return v.mr();case"MAP":break;default:return v.dr()}const i=J(this.expr.params[1]).evaluate(e,t);if(i.type!=="STRING")return v.dr();const s=(l=(a=(o=r.value)==null?void 0:o.mapValue)==null?void 0:a.fields)==null?void 0:l[(u=i.value)==null?void 0:u.stringValue];return s===void 0?v.mr():v.newValue(s)}}class Nf{constructor(e){this.expr=e}evaluate(e,t){var l,h;F(this.expr.params.length===2,25231,`${this.expr.name}() function should have exactly 2 params`);let r=!1;const i=J(this.expr.params[0]).evaluate(e,t);switch(i.type){case"VECTOR":break;case"NULL":r=!0;break;default:return v.dr()}const s=J(this.expr.params[1]).evaluate(e,t);switch(s.type){case"VECTOR":break;case"NULL":r=!0;break;default:return v.dr()}if(r)return v.pr();const o=jh(i.value),a=jh(s.value);if(o===void 0||a===void 0||((l=o.values)==null?void 0:l.length)!==((h=a.values)==null?void 0:h.length))return v.dr();const u=this.Or(o,a);return u===void 0||isNaN(u)?v.dr():v.newValue({doubleValue:u})}}class bD extends Nf{Or(e,t){var l,h;const r=(l=e==null?void 0:e.values)!=null?l:[],i=(h=t==null?void 0:t.values)!=null?h:[];if(r.length===0)return;let s=0,o=0,a=0;for(let f=0;f<r.length;f++){if(!Rr(r[f])||!Rr(i[f]))return;const g=tt(r[f]),w=tt(i[f]);s+=g*w,o+=g*g,a+=w*w}const u=Math.sqrt(o)*Math.sqrt(a);if(u!==0)return 1-Math.max(-1,Math.min(1,s/u))}}class RD extends Nf{Or(e,t){var o,a;const r=(o=e==null?void 0:e.values)!=null?o:[],i=(a=t==null?void 0:t.values)!=null?a:[];if(r.length===0)return 0;let s=0;for(let u=0;u<r.length;u++){if(!Rr(r[u])||!Rr(i[u]))return;s+=tt(r[u])*tt(i[u])}return s}}class SD extends Nf{Or(e,t){var o,a;const r=(o=e==null?void 0:e.values)!=null?o:[],i=(a=t==null?void 0:t.values)!=null?a:[];if(r.length===0)return 0;let s=0;for(let u=0;u<r.length;u++){if(!Rr(r[u])||!Rr(i[u]))return;const l=tt(r[u]),h=tt(i[u]);s+=Math.pow(l-h,2)}return Math.sqrt(s)}}class PD{constructor(e){this.expr=e}evaluate(e,t){var i,s;F(this.expr.params.length===1,39044);const r=J(this.expr.params[0]).evaluate(e,t);switch(r.type){case"VECTOR":{const o=jh(r.value);return v.newValue({integerValue:(s=(i=o==null?void 0:o.values)==null?void 0:i.length)!=null?s:0})}case"NULL":return v.pr();default:return v.dr()}}}const va=BigInt(-62135596800),Aa=BigInt(253402300799),wu=BigInt(1e3),Ir=BigInt(1e6),CD=va*wu,kD=Aa*wu+BigInt(999),ND=va*Ir,VD=Aa*Ir+BigInt(999999);function Vf(n){return n>=ND&&n<=VD}function KT(n){return n>=va&&n<=Aa}function ba(n,e){const t=BigInt(n);return!(t<va||t>Aa)&&!(e<0||e>=1e9)&&(t!==va||e===0)&&!(t===Aa&&e>999999999)}function GT(n,e){return e<0?{seconds:n-1,nanos:e+1e9}:{seconds:n,nanos:e}}function Df(n){return BigInt(n.seconds)*Ir+BigInt(Math.trunc(n.nanoseconds/1e3))}class xf{constructor(e){this.expr=e}evaluate(e,t){F(this.expr.params.length===1,49262,`${this.expr.name}() function should have exactly one parameter`);const r=J(this.expr.params[0]).evaluate(e,t);switch(r.type){case"INT":return this.toTimestamp(BigInt(r.value.integerValue));case"NULL":return v.pr();default:return v.dr()}}}class DD extends xf{toTimestamp(e){if(!Vf(e))return v.dr();let t=Number(e/Ir),r=Number(e%Ir*BigInt(1e3));const i=GT(t,r);return t=i.seconds,r=i.nanos,ba(t,r)?v.newValue({timestampValue:{seconds:t,nanos:r}}):v.dr()}}class xD extends xf{toTimestamp(e){if(!function(o){return o>=CD&&o<=kD}(e))return v.dr();let t=Number(e/wu),r=Number(e%wu*BigInt(1e6));const i=GT(t,r);return t=i.seconds,r=i.nanos,ba(t,r)?v.newValue({timestampValue:{seconds:t,nanos:r}}):v.dr()}}class OD extends xf{toTimestamp(e){if(!KT(e))return v.dr();const t=Number(e);return v.newValue({timestampValue:{seconds:t,nanos:0}})}}class Of{constructor(e){this.expr=e}evaluate(e,t){F(this.expr.params.length===1,1265,`${this.expr.name}() function should have exactly one parameter`);const r=J(this.expr.params[0]).evaluate(e,t);switch(r.type){case"TIMESTAMP":break;case"NULL":return v.pr();default:return v.dr()}const i=mf(r.value.timestampValue);return ba(i.seconds,i.nanoseconds)?this.Mr(i):v.dr()}}class LD extends Of{Mr(e){const t=Df(e);return Vf(t)?v.newValue({integerValue:`${t.toString()}`}):v.dr()}}class MD extends Of{Mr(e){const t=Df(e),r=t/BigInt(1e3),i=t%BigInt(1e3);return r>BigInt(0)||i===BigInt(0)?v.newValue({integerValue:r.toString()}):v.newValue({integerValue:(r-BigInt(1)).toString()})}}class FD extends Of{Mr(e){const t=BigInt(e.seconds);return KT(t)?v.newValue({integerValue:t.toString()}):v.dr()}}class WT{constructor(e){this.expr=e}evaluate(e,t){F(this.expr.params.length===3,2775,`${this.expr.name}() function should have exactly 3 parameters`);let r=!1;const i=J(this.expr.params[0]).evaluate(e,t);switch(i.type){case"TIMESTAMP":break;case"NULL":r=!0;break;default:return v.dr()}const s=J(this.expr.params[1]).evaluate(e,t);let o;switch(s.type){case"STRING":if(o=function(Q){switch(Q){case"microsecond":return"microsecond";case"millisecond":return"millisecond";case"second":return"second";case"minute":return"minute";case"hour":return"hour";case"day":return"day";default:return}}(s.value.stringValue),o===void 0)return v.dr();break;case"NULL":r=!0;break;default:return v.dr()}const a=J(this.expr.params[2]).evaluate(e,t);switch(a.type){case"INT":break;case"NULL":r=!0;break;default:return v.dr()}if(r)return v.pr();const u=BigInt(a.value.integerValue);let l;try{switch(o){case"microsecond":l=u;break;case"millisecond":l=u*BigInt(1e3);break;case"second":l=u*BigInt(1e6);break;case"minute":l=u*BigInt(6e7);break;case"hour":l=u*BigInt(36e8);break;case"day":l=u*BigInt(864e8);break;default:return v.dr()}if(o!=="microsecond"&&u!==BigInt(0)&&l/u!==BigInt(this.Nr(o)))return v.dr()}catch(W){return lt(`Error during timestamp arithmetic: ${W}`),v.dr()}const h=mf(i.value.timestampValue);if(!ba(h.seconds,h.nanoseconds))return v.dr();const f=Df(h),g=this.Lr(f,l);if(!Vf(g))return v.dr();const w=Number(g/Ir),S=g%Ir,D=Number((S<0?S+Ir:S)*BigInt(1e3)),x=S<0?w-1:w;return ba(x,D)?v.newValue({timestampValue:{seconds:x,nanos:D}}):v.dr()}Nr(e){switch(e){case"millisecond":return 1e3;case"second":return 1e6;case"minute":return 6e7;case"hour":return 36e8;case"day":return 864e8;default:return 1}}}class UD extends WT{Lr(e,t){return e+t}}class BD extends WT{Lr(e,t){return e-t}}function Ra(n){if((n=jT(n))instanceof Oi)return`fld(${n.fieldName})`;if(n instanceof Li)return`cst(${function(t){return t===null?"null":typeof t=="number"?t.toString():typeof t=="string"?`"${t}"`:t instanceof ue?`ref(${t.path})`:t instanceof Pt?`vec(${JSON.stringify(t)})`:JSON.stringify(t)}(n.value)})`;if(n instanceof V)return`fn(${n.name},[${n.params.map(Ra).join(",")}])`;if(n.expressionType==="ListOfExpressions")return`list([${n.ur.map(Ra).join(",")}])`;throw new Error(`Unrecognized expr ${JSON.stringify(n,null,2)}`)}function qD(n){if(n instanceof UT)return`${n._name}(${Vc(n.fields)})`;if(n instanceof BT){let e=`${n._name}(${Vc(n.accumulators)})`;return n.groups.size>0&&(e+=`grouping(${Vc(n.groups)})`),e}if(n instanceof qT)return`${n._name}(${Vc(n.groups)})`;if(n instanceof Za)return`${n._name}(${n.Er})`;if(n instanceof ec)return`${n._name}(${n.collectionId})`;if(n instanceof ol)return`${n._name}()`;if(n instanceof al)return`${n._name}(${n.hr.sort()})`;if(n instanceof tc)return`${n._name}(${Ra(n.condition)})`;if(n instanceof Nr)return`${n._name}(${n.limit})`;if(n instanceof fn)return`${n._name}(${function(t){return t.map(r=>`${Ra(r.expr)}${r.direction}`).join(",")}(n.orderings)})`;throw new Error(`Unrecognized stage ${n._name}`)}function Vc(n){return`${Array.from(n.entries()).sort().map(([e,t])=>`${e}=${Ra(t)}`).join(",")}`}function xn(n){return n.stages.map(e=>qD(e)).join("|")}function HT(n,e){return xn(n)===xn(e)}function Se(n){return n instanceof ot}function l_(n){return Se(n)?xn(n):Jo(n)}function QT(n){return Se(n)?xn(n):function(t){return`${fu(wt(t))}|lt:${t.limitType}`}(n)}function ul(n,e){return n instanceof ot&&e instanceof ot?HT(n,e):!(n instanceof ot&&!(e instanceof ot)||!(n instanceof ot)&&e instanceof ot)&&jI(n,e)}function ll(n){return Cn(n)?xn(n):fu(n)}function Lf(n,e){return n instanceof ot&&e instanceof ot?HT(n,e):!(n instanceof ot&&!(e instanceof ot)||!(n instanceof ot)&&e instanceof ot)&&uf(n,e)}function $D(n,e){const t=function(i){let s=!1;const o=[];for(const a of i)if(a instanceof fn)if(s=!0,a.orderings.some(u=>u.expr instanceof Oi&&u.expr.fieldName===hn))o.push(a);else{const u=a.orderings.map(l=>l);u.push(Jc(hn).ascending()),o.push(new fn(u,{}))}else a instanceof Nr&&(s||(o.push(new fn([Jc(hn).ascending()],{})),s=!0)),o.push(a);return s||o.push(new fn([Jc(hn).ascending()],{})),o}(n.stages);if(n.userDataReader){const r=n.userDataReader.createContext(3,"toCorePipeline");t.forEach(i=>i._readUserData(r))}return new ot(n.userDataReader.serializer,t,e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mf{constructor(e,t,r,i){this.batchId=e,this.localWriteTime=t,this.baseMutations=r,this.mutations=i}applyToRemoteDocument(e,t){const r=t.mutationResults;for(let i=0;i<this.mutations.length;i++){const s=this.mutations[i];s.key.isEqual(e.key)&&tN(s,e,r[i])}}applyToLocalView(e,t){for(const r of this.baseMutations)r.key.isEqual(e.key)&&(t=Qo(r,e,t,this.localWriteTime));for(const r of this.mutations)r.key.isEqual(e.key)&&(t=Qo(r,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){const r=HI();return this.mutations.forEach(i=>{const s=e.get(i.key),o=s.overlayedDocument;let a=this.applyToLocalView(o,s.mutatedFields);a=t.has(i.key)?null:a;const u=NI(o,a);u!==null&&r.set(i.key,u),o.isValidDocument()||o.convertToNoDocument(H.min())}),r}keys(){return this.mutations.reduce((e,t)=>e.add(t.key),Z())}isEqual(e){return this.batchId===e.batchId&&ps(this.mutations,e.mutations,(t,r)=>Ug(t,r))&&ps(this.baseMutations,e.baseMutations,(t,r)=>Ug(t,r))}}class Ff{constructor(e,t,r,i){this.batch=e,this.commitVersion=t,this.mutationResults=r,this.docVersions=i}static from(e,t,r){F(e.mutations.length===r.length,58842,{Br:e.mutations.length,Ur:r.length});let i=function(){return wN}();const s=e.mutations;for(let o=0;o<s.length;o++)i=i.insert(s[o].key,r[o].version);return new Ff(e,t,r,i)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Iu="";function ut(n){let e="";for(let t=0;t<n.length;t++)e.length>0&&(e=h_(e)),e=jD(n.get(t),e);return h_(e)}function jD(n,e){let t=e;const r=n.length;for(let i=0;i<r;i++){const s=n.charAt(i);switch(s){case"\0":t+="";break;case Iu:t+="";break;default:t+=s}}return t}function h_(n){return n+Iu+""}function pn(n){const e=n.length;if(F(e>=2,64408,{path:n}),e===2)return F(n.charAt(0)===Iu&&n.charAt(1)==="",56145,{path:n}),te.emptyPath();const t=e-2,r=[];let i="";for(let s=0;s<e;){const o=n.indexOf(Iu,s);switch((o<0||o>t)&&j(50515,{path:n}),n.charAt(o+1)){case"":const a=n.substring(s,o);let u;i.length===0?u=a:(i+=a,u=i,i=""),r.push(u);break;case"":i+=n.substring(s,o),i+="\0";break;case"":i+=n.substring(s,o+1);break;default:j(61167,{path:n})}s=o+2}return new te(r)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Jr="remoteDocuments",ic="owner",ji="owner",Sa="mutationQueues",zD="userId",Kt="mutations",d_="batchId",si="userMutationsIndex",f_=["userId","batchId"];/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Yc(n,e){return[n,ut(e)]}function JT(n,e,t){return[n,ut(e),t]}const KD={},vs="documentMutations",Tu="remoteDocumentsV14",GD=["prefixPath","collectionGroup","readTime","documentId"],Xc="documentKeyIndex",WD=["prefixPath","collectionGroup","documentId"],YT="collectionGroupIndex",HD=["collectionGroup","readTime","prefixPath","documentId"],Pa="remoteDocumentGlobal",ed="remoteDocumentGlobalKey",As="targets",XT="queryTargetsIndex",QD=["canonicalId","targetId"],bs="targetDocuments",JD=["targetId","path"],Uf="documentTargetsIndex",YD=["path","targetId"],Eu="targetGlobalKey",di="targetGlobal",Ca="collectionParents",XD=["collectionId","parent"],Rs="clientMetadata",ZD="clientId",hl="bundles",ex="bundleId",dl="namedQueries",tx="name",Bf="indexConfiguration",nx="indexId",td="collectionGroupIndex",rx="collectionGroup",ta="indexState",ix=["indexId","uid"],ZT="sequenceNumberIndex",sx=["uid","sequenceNumber"],na="indexEntries",ox=["indexId","uid","arrayValue","directionalValue","orderedDocumentKey","documentKey"],eE="documentKeyIndex",ax=["indexId","uid","orderedDocumentKey"],fl="documentOverlays",cx=["userId","collectionPath","documentId"],nd="collectionPathOverlayIndex",ux=["userId","collectionPath","largestBatchId"],tE="collectionGroupOverlayIndex",lx=["userId","collectionGroup","largestBatchId"],qf="globals",hx="name",nE=[Sa,Kt,vs,Jr,As,ic,di,bs,Rs,Pa,Ca,hl,dl],dx=[...nE,fl],rE=[Sa,Kt,vs,Tu,As,ic,di,bs,Rs,Pa,Ca,hl,dl,fl],iE=rE,$f=[...iE,Bf,ta,na],fx=$f,sE=[...$f,qf],px=sE;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function oE(n,e,t){const r=n.store(Kt),i=n.store(vs),s=[],o=IDBKeyRange.only(t.batchId);let a=0;const u=r.jn({range:o},(h,f,g)=>(a++,g.delete()));s.push(u.next(()=>{F(a===1,47070,{batchId:t.batchId})}));const l=[];for(const h of t.mutations){const f=JT(e,h.key.path,t.batchId);s.push(i.delete(f)),l.push(h.key)}return R.waitFor(s).next(()=>l)}function vu(n){if(!n)return 0;let e;if(n.document)e=n.document;else if(n.unknownDocument)e=n.unknownDocument;else{if(!n.noDocument)throw j(14731);e=n.noDocument}return JSON.stringify(e).length}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rd extends yT{constructor(e,t){super(),this.kr=e,this.currentSequenceNumber=t}}function Ke(n,e){const t=$(n);return yn.xn(t.kr,e)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jf{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mn{constructor(e,t,r,i,s=H.min(),o=H.min(),a=Ie.EMPTY_BYTE_STRING,u=null){this.target=e,this.targetId=t,this.purpose=r,this.sequenceNumber=i,this.snapshotVersion=s,this.lastLimboFreeSnapshotVersion=o,this.resumeToken=a,this.expectedCount=u}withSequenceNumber(e){return new mn(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new mn(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new mn(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new mn(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class aE{constructor(e){this.qr=e}}function mx(n,e){let t;if(e.document)t=rT(n.qr,e.document,!!e.hasCommittedMutations);else if(e.noDocument){const r=B.fromSegments(e.noDocument.path),i=Ri(e.noDocument.readTime);t=we.newNoDocument(r,i),e.hasCommittedMutations&&t.setHasCommittedMutations()}else{if(!e.unknownDocument)return j(56709);{const r=B.fromSegments(e.unknownDocument.path),i=Ri(e.unknownDocument.version);t=we.newUnknownDocument(r,i)}}return e.readTime&&t.setReadTime(function(i){const s=new le(i[0],i[1]);return H.fromTimestamp(s)}(e.readTime)),t}function p_(n,e){const t=e.key,r={prefixPath:t.getCollectionPath().popLast().toArray(),collectionGroup:t.collectionGroup,documentId:t.path.lastSegment(),readTime:Au(e.readTime),hasCommittedMutations:e.hasCommittedMutations};if(e.isFoundDocument())r.document=function(s,o){return{name:Es(s,o.key),fields:o.data.value.mapValue.fields,updateTime:Ts(s,o.version.toTimestamp()),createTime:Ts(s,o.createTime.toTimestamp())}}(n.qr,e);else if(e.isNoDocument())r.noDocument={path:t.path.toArray(),readTime:bi(e.version)};else{if(!e.isUnknownDocument())return j(57904,{document:e});r.unknownDocument={path:t.path.toArray(),version:bi(e.version)}}return r}function Au(n){const e=n.toTimestamp();return[e.seconds,e.nanoseconds]}function bi(n){const e=n.toTimestamp();return{seconds:e.seconds,nanoseconds:e.nanoseconds}}function Ri(n){const e=new le(n.seconds,n.nanoseconds);return H.fromTimestamp(e)}function Zr(n,e){const t=(e.baseMutations||[]).map(s=>Xh(n.qr,s));for(let s=0;s<e.mutations.length-1;++s){const o=e.mutations[s];if(s+1<e.mutations.length&&e.mutations[s+1].transform!==void 0){const a=e.mutations[s+1];o.updateTransforms=a.transform.fieldTransforms,e.mutations.splice(s+1,1),++s}}const r=e.mutations.map(s=>Xh(n.qr,s)),i=le.fromMillis(e.localWriteTimeMs);return new Mf(e.batchId,i,t,r)}function qo(n,e){const t=Ri(e.readTime),r=e.lastLimboFreeSnapshotVersion!==void 0?Ri(e.lastLimboFreeSnapshotVersion):H.min();let i;return i=function(o){return o.structuredPipeline!==void 0}(e.query)?function(o,a){var h,f,g;const u=o.structuredPipeline;F(((f=(h=u==null?void 0:u.pipeline)==null?void 0:h.stages)!=null?f:[]).length>0,1845);const l=(g=u==null?void 0:u.pipeline)==null?void 0:g.stages.map(gx);return new ot(a,l)}(e.query,n.qr):function(o){return o.documents!==void 0}(e.query)?function(o){const a=o.documents.length;return F(a===1,1966,{count:a}),wt(Ks(tT(o.documents[0])))}(e.query):function(o){return wt(oT(o))}(e.query),new mn(i,e.targetId,"TargetPurposeListen",e.lastListenSequenceNumber,t,r,Ie.fromBase64String(e.resumeToken))}function cE(n,e){const t=bi(e.snapshotVersion),r=bi(e.lastLimboFreeSnapshotVersion);let i;i=Cn(e.target)?aT(n.qr,e.target):lf(e.target)?iT(n.qr,e.target):sT(n.qr,e.target).be;const s=e.resumeToken.toBase64();return{targetId:e.targetId,canonicalId:ll(e.target),readTime:t,resumeToken:s,lastListenSequenceNumber:e.sequenceNumber,lastLimboFreeSnapshotVersion:r,query:i}}function zf(n){const e=oT({parent:n.parent,structuredQuery:n.structuredQuery});return n.limitType==="LAST"?mu(e,e.limit,"L"):e}function Dc(n,e){return new jf(e.largestBatchId,Xh(n.qr,e.overlayMutation))}function m_(n,e){const t=e.path.lastSegment();return[n,ut(e.path.popLast()),t]}function g_(n,e,t,r){return{indexId:n,uid:e,sequenceNumber:t,readTime:bi(r.readTime),documentKey:ut(r.documentKey.path),largestBatchId:r.largestBatchId}}function gx(n){var e;switch(n.name){case"collection":return new Za(n.args[0].referenceValue,{});case"collection_group":return new ec(n.args[1].stringValue,{});case"database":return new ol({});case"documents":return new al(n.args.map(t=>t.referenceValue),{});case"where":return new tc(id(n.args[0]),{});case"limit":{const t=(e=n.args[0].integerValue)!=null?e:n.args[0].doubleValue;return new Nr(typeof t=="number"?t:Number(t),{})}case"sort":return new fn(n.args.map(t=>function(i){var o,a;const s=(o=i.mapValue)==null?void 0:o.fields;return new Sf(id(s.expression),(a=s.direction)==null?void 0:a.stringValue,"orderingFromProto")}(t)),{});default:throw new Error(`Stage type: ${n.name} not supported.`)}}function id(n){return n.fieldReferenceValue?new Oi(Bn("_exprFromProto",n.fieldReferenceValue),"_exprFromProto"):n.functionValue?function(t){var r;return new V(t.functionValue.name,((r=t.functionValue.args)==null?void 0:r.map(id))||[])}(n):Li._fromProto(n)}class pl{constructor(e,t,r,i){this.userId=e,this.serializer=t,this.indexManager=r,this.referenceDelegate=i,this.$r={}}static Kr(e,t,r,i){F(e.uid!=="",64387);const s=e.isAuthenticated()?e.uid:"";return new pl(s,t,r,i)}checkEmpty(e){let t=!0;const r=IDBKeyRange.bound([this.userId,Number.NEGATIVE_INFINITY],[this.userId,Number.POSITIVE_INFINITY]);return ar(e).jn({index:si,range:r},(i,s,o)=>{t=!1,o.done()}).next(()=>t)}addMutationBatch(e,t,r,i){const s=es(e),o=ar(e);return o.add({}).next(a=>{F(typeof a=="number",49019);const u=new Mf(a,t,r,i),l=function(w,S,D){const x=D.baseMutations.map(Q=>Ia(w.qr,Q)),W=D.mutations.map(Q=>Ia(w.qr,Q));return{userId:S,batchId:D.batchId,localWriteTimeMs:D.localWriteTime.toMillis(),baseMutations:x,mutations:W}}(this.serializer,this.userId,u),h=[];let f=new de((g,w)=>Y(g.canonicalString(),w.canonicalString()));for(const g of i){const w=JT(this.userId,g.key.path,a);f=f.add(g.key.path.popLast()),h.push(o.put(l)),h.push(s.put(w,KD))}return f.forEach(g=>{h.push(this.indexManager.addToCollectionParentIndex(e,g))}),e.addOnCommittedListener(()=>{this.$r[a]=u.keys()}),R.waitFor(h).next(()=>u)})}lookupMutationBatch(e,t){return ar(e).get(t).next(r=>r?(F(r.userId===this.userId,48,"Unexpected user for mutation batch",{userId:r.userId,batchId:t}),Zr(this.serializer,r)):null)}Qr(e,t){return this.$r[t]?R.resolve(this.$r[t]):this.lookupMutationBatch(e,t).next(r=>{if(r){const i=r.keys();return this.$r[t]=i,i}return null})}getNextMutationBatchAfterBatchId(e,t){const r=t+1,i=IDBKeyRange.lowerBound([this.userId,r]);let s=null;return ar(e).jn({index:si,range:i},(o,a,u)=>{a.userId===this.userId&&(F(a.batchId>=r,47524,{Wr:r}),s=Zr(this.serializer,a)),u.done()}).next(()=>s)}getHighestUnacknowledgedBatchId(e){const t=IDBKeyRange.upperBound([this.userId,Number.POSITIVE_INFINITY]);let r=wr;return ar(e).jn({index:si,range:t,reverse:!0},(i,s,o)=>{r=s.batchId,o.done()}).next(()=>r)}getAllMutationBatches(e){const t=IDBKeyRange.bound([this.userId,wr],[this.userId,Number.POSITIVE_INFINITY]);return ar(e).Kn(si,t).next(r=>r.map(i=>Zr(this.serializer,i)))}getAllMutationBatchesAffectingDocumentKey(e,t){const r=Yc(this.userId,t.path),i=IDBKeyRange.lowerBound(r),s=[];return es(e).jn({range:i},(o,a,u)=>{const[l,h,f]=o,g=pn(h);if(l===this.userId&&t.path.isEqual(g))return ar(e).get(f).next(w=>{if(!w)throw j(61480,{Gr:o,batchId:f});F(w.userId===this.userId,10503,"Unexpected user for mutation batch",{userId:w.userId,batchId:f}),s.push(Zr(this.serializer,w))});u.done()}).next(()=>s)}getAllMutationBatchesAffectingDocumentKeys(e,t){let r=new de(Y);const i=[];return t.forEach(s=>{const o=Yc(this.userId,s.path),a=IDBKeyRange.lowerBound(o),u=es(e).jn({range:a},(l,h,f)=>{const[g,w,S]=l,D=pn(w);g===this.userId&&s.path.isEqual(D)?r=r.add(S):f.done()});i.push(u)}),R.waitFor(i).next(()=>this.zr(e,r))}getAllMutationBatchesAffectingQuery(e,t){const r=t.path,i=r.length+1,s=Yc(this.userId,r),o=IDBKeyRange.lowerBound(s);let a=new de(Y);return es(e).jn({range:o},(u,l,h)=>{const[f,g,w]=u,S=pn(g);f===this.userId&&r.isPrefixOf(S)?S.length===i&&(a=a.add(w)):h.done()}).next(()=>this.zr(e,a))}zr(e,t){const r=[],i=[];return t.forEach(s=>{i.push(ar(e).get(s).next(o=>{if(o===null)throw j(35274,{batchId:s});F(o.userId===this.userId,9748,"Unexpected user for mutation batch",{userId:o.userId,batchId:s}),r.push(Zr(this.serializer,o))}))}),R.waitFor(i).next(()=>r)}removeMutationBatch(e,t){return oE(e.kr,this.userId,t).next(r=>(e.addOnCommittedListener(()=>{this.jr(t.batchId)}),R.forEach(r,i=>this.referenceDelegate.markPotentiallyOrphaned(e,i))))}jr(e){delete this.$r[e]}performConsistencyCheck(e){return this.checkEmpty(e).next(t=>{if(!t)return R.resolve();const r=IDBKeyRange.lowerBound(function(o){return[o]}(this.userId)),i=[];return es(e).jn({range:r},(s,o,a)=>{if(s[0]===this.userId){const u=pn(s[1]);i.push(u)}else a.done()}).next(()=>{F(i.length===0,56720,{Hr:i.map(s=>s.canonicalString())})})})}containsKey(e,t){return uE(e,this.userId,t)}Jr(e){return lE(e).get(this.userId).next(t=>t||{userId:this.userId,lastAcknowledgedBatchId:wr,lastStreamToken:""})}}function uE(n,e,t){const r=Yc(e,t.path),i=r[1],s=IDBKeyRange.lowerBound(r);let o=!1;return es(n).jn({range:s,zn:!0},(a,u,l)=>{const[h,f,g]=a;h===e&&f===i&&(o=!0),l.done()}).next(()=>o)}function ar(n){return Ke(n,Kt)}function es(n){return Ke(n,vs)}function lE(n){return Ke(n,Sa)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _x{getBundleMetadata(e,t){return __(e).get(t).next(r=>{if(r)return function(s){return{id:s.bundleId,createTime:Ri(s.createTime),version:s.version}}(r)})}saveBundleMetadata(e,t){return __(e).put(function(i){return{bundleId:i.id,createTime:bi(Ve(i.createTime)),version:i.version}}(t))}getNamedQuery(e,t){return y_(e).get(t).next(r=>{if(r)return function(s){return{name:s.name,query:zf(s.bundledQuery),readTime:Ri(s.readTime)}}(r)})}saveNamedQuery(e,t){return y_(e).put(function(i){return{name:i.name,readTime:bi(Ve(i.readTime)),bundledQuery:i.bundledQuery}}(t))}}function __(n){return Ke(n,hl)}function y_(n){return Ke(n,dl)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ml{constructor(e,t){this.serializer=e,this.userId=t}static Kr(e,t){const r=t.uid||"";return new ml(e,r)}getOverlay(e,t){return zi(e).get(m_(this.userId,t)).next(r=>r?Dc(this.serializer,r):null)}getOverlays(e,t){const r=Ut();return R.forEach(t,i=>this.getOverlay(e,i).next(s=>{s!==null&&r.set(i,s)})).next(()=>r)}getAllOverlays(e,t){const r=Ut();return zi(e).jn((i,s)=>{const o=Dc(this.serializer,s);o.largestBatchId>t&&r.set(o.getKey(),o)}).next(()=>r)}saveOverlays(e,t,r){const i=[];return r.forEach((s,o)=>{const a=new jf(t,o);i.push(this.Yr(e,a))}),R.waitFor(i)}removeOverlaysForBatchId(e,t,r){const i=new Set;t.forEach(o=>i.add(ut(o.getCollectionPath())));const s=[];return i.forEach(o=>{const a=IDBKeyRange.bound([this.userId,o,r],[this.userId,o,r+1],!1,!0);s.push(zi(e).Gn(nd,a))}),R.waitFor(s)}getOverlaysForCollection(e,t,r){const i=Ut(),s=ut(t),o=IDBKeyRange.bound([this.userId,s,r],[this.userId,s,Number.POSITIVE_INFINITY],!0);return zi(e).Kn(nd,o).next(a=>{for(const u of a){const l=Dc(this.serializer,u);i.set(l.getKey(),l)}return i})}getOverlaysForCollectionGroup(e,t,r,i){const s=Ut();let o;const a=IDBKeyRange.bound([this.userId,t,r],[this.userId,t,Number.POSITIVE_INFINITY],!0);return zi(e).jn({index:tE,range:a},(u,l,h)=>{const f=Dc(this.serializer,l);s.size()<i||f.largestBatchId===o?(s.set(f.getKey(),f),o=f.largestBatchId):h.done()}).next(()=>s)}Yr(e,t){return zi(e).put(function(i,s,o){const[a,u,l]=m_(s,o.mutation.key);return{userId:s,collectionPath:u,documentId:l,collectionGroup:o.mutation.key.getCollectionGroup(),largestBatchId:o.largestBatchId,overlayMutation:Ia(i.qr,o.mutation)}}(this.serializer,this.userId,t))}}function zi(n){return Ke(n,fl)}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yx{Zr(e){return Ke(e,qf)}getSessionToken(e){return this.Zr(e).get("sessionToken").next(t=>{const r=t==null?void 0:t.value;return r?Ie.fromUint8Array(r):Ie.EMPTY_BYTE_STRING})}setSessionToken(e,t){return this.Zr(e).put({name:"sessionToken",value:t.toUint8Array()})}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ei{constructor(){}Xr(e,t){this.ei(e,t),t.ti()}ei(e,t){if("nullValue"in e)this.ni(t,5);else if("booleanValue"in e)this.ni(t,10),t.ri(e.booleanValue?1:0);else if("integerValue"in e)this.ni(t,15),t.ri(ge(e.integerValue));else if("doubleValue"in e){const r=ge(e.doubleValue);isNaN(r)?this.ni(t,13):(this.ni(t,15),gs(r)?t.ri(0):t.ri(r))}else if("timestampValue"in e){let r=e.timestampValue;this.ni(t,20),typeof r=="string"&&(r=Fn(r)),t.ii(`${r.seconds||""}`),t.ri(r.nanos||0)}else if("stringValue"in e)this.si(e.stringValue,t),this._i(t);else if("bytesValue"in e)this.ni(t,30),t.oi(Un(e.bytesValue)),this._i(t);else if("referenceValue"in e)this.ai(e.referenceValue,t);else if("geoPointValue"in e){const r=e.geoPointValue;this.ni(t,45),t.ri(r.latitude||0),t.ri(r.longitude||0)}else"mapValue"in e?AI(e)?this.ni(t,Number.MAX_SAFE_INTEGER):Ti(e)?this.ui(e.mapValue,t):(this.ci(e.mapValue,t),this._i(t)):"arrayValue"in e?(this.li(e.arrayValue,t),this._i(t)):j(19022,{Ei:e})}si(e,t){this.ni(t,25),this.hi(e,t)}hi(e,t){t.ii(e)}ci(e,t){const r=e.fields||{};this.ni(t,55);for(const i of Object.keys(r))this.si(i,t),this.ei(r[i],t)}ui(e,t){var o,a;const r=e.fields||{};this.ni(t,53);const i=wi,s=((a=(o=r[i].arrayValue)==null?void 0:o.values)==null?void 0:a.length)||0;this.ni(t,15),t.ri(ge(s)),this.si(i,t),this.ei(r[i],t)}li(e,t){const r=e.values||[];this.ni(t,50);for(const i of r)this.ei(i,t)}ai(e,t){this.ni(t,37),B.fromName(e).path.forEach(r=>{this.ni(t,60),this.hi(r,t)})}ni(e,t){e.ri(t)}_i(e){e.ri(2)}}ei.Ti=new ei;/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law | agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES | CONDITIONS OF ANY KIND, either express | implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ki=255;function wx(n){if(n===0)return 8;let e=0;return n>>4||(e+=4,n<<=4),n>>6||(e+=2,n<<=2),n>>7||(e+=1),e}function w_(n){const e=64-function(r){let i=0;for(let s=0;s<8;++s){const o=wx(255&r[s]);if(i+=o,o!==8)break}return i}(n);return Math.ceil(e/8)}class Ix{constructor(){this.buffer=new Uint8Array(1024),this.position=0}Pi(e){const t=e[Symbol.iterator]();let r=t.next();for(;!r.done;)this.Ri(r.value),r=t.next();this.Ii()}Ai(e){const t=e[Symbol.iterator]();let r=t.next();for(;!r.done;)this.Vi(r.value),r=t.next();this.di()}fi(e){for(const t of e){const r=t.charCodeAt(0);if(r<128)this.Ri(r);else if(r<2048)this.Ri(960|r>>>6),this.Ri(128|63&r);else if(t<"\uD800"||"\uDBFF"<t)this.Ri(480|r>>>12),this.Ri(128|63&r>>>6),this.Ri(128|63&r);else{const i=t.codePointAt(0);this.Ri(240|i>>>18),this.Ri(128|63&i>>>12),this.Ri(128|63&i>>>6),this.Ri(128|63&i)}}this.Ii()}mi(e){for(const t of e){const r=t.charCodeAt(0);if(r<128)this.Vi(r);else if(r<2048)this.Vi(960|r>>>6),this.Vi(128|63&r);else if(t<"\uD800"||"\uDBFF"<t)this.Vi(480|r>>>12),this.Vi(128|63&r>>>6),this.Vi(128|63&r);else{const i=t.codePointAt(0);this.Vi(240|i>>>18),this.Vi(128|63&i>>>12),this.Vi(128|63&i>>>6),this.Vi(128|63&i)}}this.di()}pi(e){const t=this.gi(e),r=w_(t);this.yi(1+r),this.buffer[this.position++]=255&r;for(let i=t.length-r;i<t.length;++i)this.buffer[this.position++]=255&t[i]}wi(e){const t=this.gi(e),r=w_(t);this.yi(1+r),this.buffer[this.position++]=~(255&r);for(let i=t.length-r;i<t.length;++i)this.buffer[this.position++]=~(255&t[i])}bi(){this.Si(Ki),this.Si(255)}Di(){this.xi(Ki),this.xi(255)}reset(){this.position=0}seed(e){this.yi(e.length),this.buffer.set(e,this.position),this.position+=e.length}Ci(){return this.buffer.slice(0,this.position)}gi(e){const t=function(s){const o=new DataView(new ArrayBuffer(8));return o.setFloat64(0,s,!1),new Uint8Array(o.buffer)}(e),r=!!(128&t[0]);t[0]^=r?255:128;for(let i=1;i<t.length;++i)t[i]^=r?255:0;return t}Ri(e){const t=255&e;t===0?(this.Si(0),this.Si(255)):t===Ki?(this.Si(Ki),this.Si(0)):this.Si(t)}Vi(e){const t=255&e;t===0?(this.xi(0),this.xi(255)):t===Ki?(this.xi(Ki),this.xi(0)):this.xi(e)}Ii(){this.Si(0),this.Si(1)}di(){this.xi(0),this.xi(1)}Si(e){this.yi(1),this.buffer[this.position++]=e}xi(e){this.yi(1),this.buffer[this.position++]=~e}yi(e){const t=e+this.position;if(t<=this.buffer.length)return;let r=2*this.buffer.length;r<t&&(r=t);const i=new Uint8Array(r);i.set(this.buffer),this.buffer=i}}class Tx{constructor(e){this.Fi=e}oi(e){this.Fi.Pi(e)}ii(e){this.Fi.fi(e)}ri(e){this.Fi.pi(e)}ti(){this.Fi.bi()}}class Ex{constructor(e){this.Fi=e}oi(e){this.Fi.Ai(e)}ii(e){this.Fi.mi(e)}ri(e){this.Fi.wi(e)}ti(){this.Fi.Di()}}class ko{constructor(){this.Fi=new Ix,this.ascending=new Tx(this.Fi),this.descending=new Ex(this.Fi)}seed(e){this.Fi.seed(e)}Oi(e){return e===0?this.ascending:this.descending}Ci(){return this.Fi.Ci()}reset(){this.Fi.reset()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ti{constructor(e,t,r,i){this.Mi=e,this.Ni=t,this.Li=r,this.Bi=i}Ui(){const e=this.Bi.length,t=e===0||this.Bi[e-1]===255?e+1:e,r=new Uint8Array(t);return r.set(this.Bi,0),t!==e?r.set([0],this.Bi.length):++r[r.length-1],new ti(this.Mi,this.Ni,this.Li,r)}ki(e,t,r){return{indexId:this.Mi,uid:e,arrayValue:Zc(this.Li),directionalValue:Zc(this.Bi),orderedDocumentKey:Zc(t),documentKey:r.path.toArray()}}qi(e,t,r){const i=this.ki(e,t,r);return[i.indexId,i.uid,i.arrayValue,i.directionalValue,i.orderedDocumentKey,i.documentKey]}}function cr(n,e){let t=n.Mi-e.Mi;return t!==0?t:(t=I_(n.Li,e.Li),t!==0?t:(t=I_(n.Bi,e.Bi),t!==0?t:B.comparator(n.Ni,e.Ni)))}function I_(n,e){for(let t=0;t<n.length&&t<e.length;++t){const r=n[t]-e[t];if(r!==0)return r}return n.length-e.length}function Zc(n){return Jy()?function(t){let r="";for(let i=0;i<t.length;i++)r+=String.fromCharCode(t[i]);return r}(n):n}function T_(n){return typeof n!="string"?n:function(t){const r=new Uint8Array(t.length);for(let i=0;i<t.length;i++)r[i]=t.charCodeAt(i);return r}(n)}class E_{constructor(e){this.$i=new de((t,r)=>Ue.comparator(t.field,r.field)),this.collectionId=e.collectionGroup!=null?e.collectionGroup:e.path.lastSegment(),this.Ki=e.orderBy,this.Qi=[];for(const t of e.filters){const r=t;r.isInequality()?this.$i=this.$i.add(r):this.Qi.push(r)}}get Wi(){return this.$i.size>1}Gi(e){if(F(e.collectionGroup===this.collectionId,49279),this.Wi)return!1;const t=Gh(e);if(t!==void 0&&!this.zi(t))return!1;const r=Qr(e);let i=new Set,s=0,o=0;for(;s<r.length&&this.zi(r[s]);++s)i=i.add(r[s].fieldPath.canonicalString());if(s===r.length)return!0;if(this.$i.size>0){const a=this.$i.getIterator().getNext();if(!i.has(a.field.canonicalString())){const u=r[s];if(!this.ji(a,u)||!this.Hi(this.Ki[o++],u))return!1}++s}for(;s<r.length;++s){const a=r[s];if(o>=this.Ki.length||!this.Hi(this.Ki[o++],a))return!1}return!0}Ji(){if(this.Wi)return null;let e=new de(Ue.comparator);const t=[];for(const r of this.Qi)if(!r.field.isKeyField())if(r.op==="array-contains"||r.op==="array-contains-any")t.push(new Wc(r.field,2));else{if(e.has(r.field))continue;e=e.add(r.field),t.push(new Wc(r.field,0))}for(const r of this.Ki)r.field.isKeyField()||e.has(r.field)||(e=e.add(r.field),t.push(new Wc(r.field,r.dir==="asc"?0:1)));return new du(du.UNKNOWN_ID,this.collectionId,t,wa.empty())}zi(e){for(const t of this.Qi)if(this.ji(t,e))return!0;return!1}ji(e,t){if(e===void 0||!e.field.isEqual(t.fieldPath))return!1;const r=e.op==="array-contains"||e.op==="array-contains-any";return t.kind===2===r}Hi(e,t){return!!e.field.isEqual(t.fieldPath)&&(t.kind===0&&e.dir==="asc"||t.kind===1&&e.dir==="desc")}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function hE(n){var t,r;if(F(n instanceof se||n instanceof fe,20012),n instanceof se){if(n instanceof UI){const i=((r=(t=n.value.arrayValue)==null?void 0:t.values)==null?void 0:r.map(s=>se.create(n.field,"==",s)))||[];return fe.create(i,"or")}return n}const e=n.filters.map(i=>hE(i));return fe.create(e,n.op)}function vx(n){if(n.getFilters().length===0)return[];const e=ad(hE(n));return F(dE(e),7391),sd(e)||od(e)?[e]:e.getFilters()}function sd(n){return n instanceof se}function od(n){return n instanceof fe&&af(n)}function dE(n){return sd(n)||od(n)||function(t){if(t instanceof fe&&zh(t)){for(const r of t.getFilters())if(!sd(r)&&!od(r))return!1;return!0}return!1}(n)}function ad(n){if(F(n instanceof se||n instanceof fe,34018),n instanceof se)return n;if(n.filters.length===1)return ad(n.filters[0]);const e=n.filters.map(r=>ad(r));let t=fe.create(e,n.op);return t=bu(t),dE(t)?t:(F(t instanceof fe,64498),F(ws(t),40251),F(t.filters.length>1,57927),t.filters.reduce((r,i)=>Kf(r,i)))}function Kf(n,e){let t;return F(n instanceof se||n instanceof fe,38388),F(e instanceof se||e instanceof fe,25473),t=n instanceof se?e instanceof se?function(i,s){return fe.create([i,s],"and")}(n,e):v_(n,e):e instanceof se?v_(e,n):function(i,s){if(F(i.filters.length>0&&s.filters.length>0,48005),ws(i)&&ws(s))return LI(i,s.getFilters());const o=zh(i)?i:s,a=zh(i)?s:i,u=o.filters.map(l=>Kf(l,a));return fe.create(u,"or")}(n,e),bu(t)}function v_(n,e){if(ws(e))return LI(e,n.getFilters());{const t=e.filters.map(r=>Kf(n,r));return fe.create(t,"or")}}function bu(n){if(F(n instanceof se||n instanceof fe,11850),n instanceof se)return n;const e=n.getFilters();if(e.length===1)return bu(e[0]);if(xI(n))return n;const t=e.map(i=>bu(i)),r=[];return t.forEach(i=>{i instanceof se?r.push(i):i instanceof fe&&(i.op===n.op?r.push(...i.filters):r.push(i))}),r.length===1?r[0]:fe.create(r,n.op)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ax{constructor(){this.Yi=new Gf}addToCollectionParentIndex(e,t){return this.Yi.add(t),R.resolve()}getCollectionParents(e,t){return R.resolve(this.Yi.getEntries(t))}addFieldIndex(e,t){return R.resolve()}deleteFieldIndex(e,t){return R.resolve()}deleteAllFieldIndexes(e){return R.resolve()}createTargetIndexes(e,t){return R.resolve()}getDocumentsMatchingTarget(e,t){return R.resolve(null)}getIndexType(e,t){return R.resolve(0)}getFieldIndexes(e,t){return R.resolve([])}getNextCollectionGroupToUpdate(e){return R.resolve(null)}getMinOffset(e,t){return R.resolve(Mt.min())}getMinOffsetFromCollectionGroup(e,t){return R.resolve(Mt.min())}updateCollectionGroup(e,t,r){return R.resolve()}updateIndexEntries(e,t){return R.resolve()}}class Gf{constructor(){this.index={}}add(e){const t=e.lastSegment(),r=e.popLast(),i=this.index[t]||new de(te.comparator),s=!i.has(r);return this.index[t]=i.add(r),s}has(e){const t=e.lastSegment(),r=e.popLast(),i=this.index[t];return i&&i.has(r)}getEntries(e){return(this.index[e]||new de(te.comparator)).toArray()}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const A_="IndexedDbIndexManager",xc=new Uint8Array(0);class bx{constructor(e,t){this.databaseId=t,this.Zi=new Gf,this.Xi=new Yn(r=>fu(r),(r,i)=>uf(r,i)),this.uid=e.uid||""}addToCollectionParentIndex(e,t){if(!this.Zi.has(t)){const r=t.lastSegment(),i=t.popLast();e.addOnCommittedListener(()=>{this.Zi.add(t)});const s={collectionId:r,parent:ut(i)};return b_(e).put(s)}return R.resolve()}getCollectionParents(e,t){const r=[],i=IDBKeyRange.bound([t,""],[fI(t),""],!1,!0);return b_(e).Kn(i).next(s=>{for(const o of s){if(o.collectionId!==t)break;r.push(pn(o.parent))}return r})}addFieldIndex(e,t){const r=No(e),i=function(a){return{indexId:a.indexId,collectionGroup:a.collectionGroup,fields:a.fields.map(u=>[u.fieldPath.canonicalString(),u.kind])}}(t);delete i.indexId;const s=r.add(i);if(t.indexState){const o=Wi(e);return s.next(a=>{o.put(g_(a,this.uid,t.indexState.sequenceNumber,t.indexState.offset))})}return s.next()}deleteFieldIndex(e,t){const r=No(e),i=Wi(e),s=Gi(e);return r.delete(t.indexId).next(()=>i.delete(IDBKeyRange.bound([t.indexId],[t.indexId+1],!1,!0))).next(()=>s.delete(IDBKeyRange.bound([t.indexId],[t.indexId+1],!1,!0)))}deleteAllFieldIndexes(e){const t=No(e),r=Gi(e),i=Wi(e);return t.Gn().next(()=>r.Gn()).next(()=>i.Gn())}createTargetIndexes(e,t){return R.forEach(this.es(t),r=>this.getIndexType(e,r).next(i=>{if(i===0||i===1){const s=new E_(r).Ji();if(s!=null)return this.addFieldIndex(e,s)}}))}getDocumentsMatchingTarget(e,t){const r=Gi(e);let i=!0;const s=new Map;return R.forEach(this.es(t),o=>this.ts(e,o).next(a=>{i&&(i=!!a),s.set(o,a)})).next(()=>{if(i){let o=Z();const a=[];return R.forEach(s,(u,l)=>{L(A_,`Using index ${function(K){return`id=${K.indexId}|cg=${K.collectionGroup}|f=${K.fields.map(X=>`${X.fieldPath}:${X.kind}`).join(",")}`}(u)} to execute ${fu(t)}`);const h=function(K,X){const ee=Gh(X);if(ee===void 0)return null;for(const ne of pu(K,ee.fieldPath))switch(ne.op){case"array-contains-any":return ne.value.arrayValue.values||[];case"array-contains":return[ne.value]}return null}(l,u),f=function(K,X){const ee=new Map;for(const ne of Qr(X))for(const E of pu(K,ne.fieldPath))switch(E.op){case"==":case"in":ee.set(ne.fieldPath.canonicalString(),E.value);break;case"not-in":case"!=":return ee.set(ne.fieldPath.canonicalString(),E.value),Array.from(ee.values())}return null}(l,u),g=function(K,X){const ee=[];let ne=!0;for(const E of Qr(X)){const y=E.kind===0?zg(K,E.fieldPath,K.startAt):Kg(K,E.fieldPath,K.startAt);ee.push(y.value),ne&&(ne=y.inclusive)}return new Pr(ee,ne)}(l,u),w=function(K,X){const ee=[];let ne=!0;for(const E of Qr(X)){const y=E.kind===0?Kg(K,E.fieldPath,K.endAt):zg(K,E.fieldPath,K.endAt);ee.push(y.value),ne&&(ne=y.inclusive)}return new Pr(ee,ne)}(l,u),S=this.ns(u,l,g),D=this.ns(u,l,w),x=this.rs(u,l,f),W=this.ss(u.indexId,h,S,g.inclusive,D,w.inclusive,x);return R.forEach(W,Q=>r.Wn(Q,t.limit).next(K=>{K.forEach(X=>{const ee=B.fromSegments(X.documentKey);o.has(ee)||(o=o.add(ee),a.push(ee))})}))}).next(()=>a)}return R.resolve(null)})}es(e){let t=this.Xi.get(e);return t||(e.filters.length===0?t=[e]:t=vx(fe.create(e.filters,"and")).map(r=>Wh(e.path,e.collectionGroup,e.orderBy,r.getFilters(),e.limit,e.startAt,e.endAt)),this.Xi.set(e,t),t)}ss(e,t,r,i,s,o,a){const u=(t!=null?t.length:1)*Math.max(r.length,s.length),l=u/(t!=null?t.length:1),h=[];for(let f=0;f<u;++f){const g=t?this._s(t[f/l]):xc,w=this.us(e,g,r[f%l],i),S=this.cs(e,g,s[f%l],o),D=a.map(x=>this.us(e,g,x,!0));h.push(...this.createRange(w,S,D))}return h}us(e,t,r,i){const s=new ti(e,B.empty(),t,r);return i?s:s.Ui()}cs(e,t,r,i){const s=new ti(e,B.empty(),t,r);return i?s.Ui():s}ts(e,t){const r=new E_(t),i=t.collectionGroup!=null?t.collectionGroup:t.path.lastSegment();return this.getFieldIndexes(e,i).next(s=>{let o=null;for(const a of s)r.Gi(a)&&(!o||a.fields.length>o.fields.length)&&(o=a);return o})}getIndexType(e,t){let r=2;const i=this.es(t);return R.forEach(i,s=>this.ts(e,s).next(o=>{o?r!==0&&o.fields.length<function(u){let l=new de(Ue.comparator),h=!1;for(const f of u.filters)for(const g of f.getFlattenedFilters())g.field.isKeyField()||(g.op==="array-contains"||g.op==="array-contains-any"?h=!0:l=l.add(g.field));for(const f of u.orderBy)f.field.isKeyField()||(l=l.add(f.field));return l.size+(h?1:0)}(s)&&(r=1):r=0})).next(()=>function(o){return o.limit!==null}(t)&&i.length>1&&r===2?1:r)}ls(e,t){const r=new ko;for(const i of Qr(e)){const s=t.data.field(i.fieldPath);if(s==null)return null;const o=r.Oi(i.kind);ei.Ti.Xr(s,o)}return r.Ci()}_s(e){const t=new ko;return ei.Ti.Xr(e,t.Oi(0)),t.Ci()}Es(e,t){const r=new ko;return ei.Ti.Xr(Ii(this.databaseId,t),r.Oi(function(s){const o=Qr(s);return o.length===0?0:o[o.length-1].kind}(e))),r.Ci()}rs(e,t,r){if(r===null)return[];let i=[];i.push(new ko);let s=0;for(const o of Qr(e)){const a=r[s++];for(const u of i)if(this.hs(t,o.fieldPath)&&Sr(a))i=this.Ts(i,o,a);else{const l=u.Oi(o.kind);ei.Ti.Xr(a,l)}}return this.Ps(i)}ns(e,t,r){return this.rs(e,t,r.position)}Ps(e){const t=[];for(let r=0;r<e.length;++r)t[r]=e[r].Ci();return t}Ts(e,t,r){const i=[...e],s=[];for(const o of r.arrayValue.values||[])for(const a of i){const u=new ko;u.seed(a.Ci()),ei.Ti.Xr(o,u.Oi(t.kind)),s.push(u)}return s}hs(e,t){return!!e.filters.find(r=>r instanceof se&&r.field.isEqual(t)&&(r.op==="in"||r.op==="not-in"))}getFieldIndexes(e,t){const r=No(e),i=Wi(e);return(t?r.Kn(td,IDBKeyRange.bound(t,t)):r.Kn()).next(s=>{const o=[];return R.forEach(s,a=>i.get([a.indexId,this.uid]).next(u=>{o.push(function(h,f){const g=f?new wa(f.sequenceNumber,new Mt(Ri(f.readTime),new B(pn(f.documentKey)),f.largestBatchId)):wa.empty(),w=h.fields.map(([S,D])=>new Wc(Ue.fromServerFormat(S),D));return new du(h.indexId,h.collectionGroup,w,g)}(a,u))})).next(()=>o)})}getNextCollectionGroupToUpdate(e){return this.getFieldIndexes(e).next(t=>t.length===0?null:(t.sort((r,i)=>{const s=r.indexState.sequenceNumber-i.indexState.sequenceNumber;return s!==0?s:Y(r.collectionGroup,i.collectionGroup)}),t[0].collectionGroup))}updateCollectionGroup(e,t,r){const i=No(e),s=Wi(e);return this.Rs(e).next(o=>i.Kn(td,IDBKeyRange.bound(t,t)).next(a=>R.forEach(a,u=>s.put(g_(u.indexId,this.uid,o,r)))))}updateIndexEntries(e,t){const r=new Map;return R.forEach(t,(i,s)=>{const o=r.get(i.collectionGroup);return(o?R.resolve(o):this.getFieldIndexes(e,i.collectionGroup)).next(a=>(r.set(i.collectionGroup,a),R.forEach(a,u=>this.Is(e,i,u).next(l=>{const h=this.As(s,u);return l.isEqual(h)?R.resolve():this.Vs(e,s,u,l,h)}))))})}ds(e,t,r,i){return Gi(e).put(i.ki(this.uid,this.Es(r,t.key),t.key))}fs(e,t,r,i){return Gi(e).delete(i.qi(this.uid,this.Es(r,t.key),t.key))}Is(e,t,r){const i=Gi(e);let s=new de(cr);return i.jn({index:eE,range:IDBKeyRange.only([r.indexId,this.uid,Zc(this.Es(r,t))])},(o,a)=>{s=s.add(new ti(r.indexId,t,T_(a.arrayValue),T_(a.directionalValue)))}).next(()=>s)}As(e,t){let r=new de(cr);const i=this.ls(t,e);if(i==null)return r;const s=Gh(t);if(s!=null){const o=e.data.field(s.fieldPath);if(Sr(o))for(const a of o.arrayValue.values||[])r=r.add(new ti(t.indexId,e.key,this._s(a),i))}else r=r.add(new ti(t.indexId,e.key,xc,i));return r}Vs(e,t,r,i,s){L(A_,"Updating index entries for document '%s'",t.key);const o=[];return function(u,l,h,f,g){const w=u.getIterator(),S=l.getIterator();let D=$i(w),x=$i(S);for(;D||x;){let W=!1,Q=!1;if(D&&x){const K=h(D,x);K<0?Q=!0:K>0&&(W=!0)}else D!=null?Q=!0:W=!0;W?(f(x),x=$i(S)):Q?(g(D),D=$i(w)):(D=$i(w),x=$i(S))}}(i,s,cr,a=>{o.push(this.ds(e,t,r,a))},a=>{o.push(this.fs(e,t,r,a))}),R.waitFor(o)}Rs(e){let t=1;return Wi(e).jn({index:ZT,reverse:!0,range:IDBKeyRange.upperBound([this.uid,Number.MAX_SAFE_INTEGER])},(r,i,s)=>{s.done(),t=i.sequenceNumber+1}).next(()=>t)}createRange(e,t,r){r=r.sort((o,a)=>cr(o,a)).filter((o,a,u)=>!a||cr(o,u[a-1])!==0);const i=[];i.push(e);for(const o of r){const a=cr(o,e),u=cr(o,t);if(a===0)i[0]=e.Ui();else if(a>0&&u<0)i.push(o),i.push(o.Ui());else if(u>0)break}i.push(t);const s=[];for(let o=0;o<i.length;o+=2){if(this.ps(i[o],i[o+1]))return[];const a=i[o].qi(this.uid,xc,B.empty()),u=i[o+1].qi(this.uid,xc,B.empty());s.push(IDBKeyRange.bound(a,u))}return s}ps(e,t){return cr(e,t)>0}getMinOffsetFromCollectionGroup(e,t){return this.getFieldIndexes(e,t).next(R_)}getMinOffset(e,t){return R.mapArray(this.es(t),r=>this.ts(e,r).next(i=>i||j(44426))).next(R_)}}function b_(n){return Ke(n,Ca)}function Gi(n){return Ke(n,na)}function No(n){return Ke(n,Bf)}function Wi(n){return Ke(n,ta)}function R_(n){F(n.length!==0,28825);let e=n[0].indexState.offset,t=e.largestBatchId;for(let r=1;r<n.length;r++){const i=n[r].indexState.offset;cf(i,e)<0&&(e=i),t<i.largestBatchId&&(t=i.largestBatchId)}return new Mt(e.readTime,e.documentKey,t)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $n{constructor(e){this.gs=e}next(){return this.gs+=2,this.gs}static ys(){return new $n(0)}static ws(){return new $n(-1)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rx{constructor(e,t){this.referenceDelegate=e,this.serializer=t}allocateTargetId(e){return this.bs(e).next(t=>{const r=new $n(t.highestTargetId);return t.highestTargetId=r.next(),this.Ss(e,t).next(()=>t.highestTargetId)})}getLastRemoteSnapshotVersion(e){return this.bs(e).next(t=>H.fromTimestamp(new le(t.lastRemoteSnapshotVersion.seconds,t.lastRemoteSnapshotVersion.nanoseconds)))}getHighestSequenceNumber(e){return this.bs(e).next(t=>t.highestListenSequenceNumber)}setTargetsMetadata(e,t,r){return this.bs(e).next(i=>(i.highestListenSequenceNumber=t,r&&(i.lastRemoteSnapshotVersion=r.toTimestamp()),t>i.highestListenSequenceNumber&&(i.highestListenSequenceNumber=t),this.Ss(e,i)))}addTargetData(e,t){return this.vs(e,t).next(()=>this.bs(e).next(r=>(r.targetCount+=1,this.Ds(t,r),this.Ss(e,r))))}updateTargetData(e,t){return this.vs(e,t)}removeTargetData(e,t){return this.removeMatchingKeysForTargetId(e,t.targetId).next(()=>Hi(e).delete(t.targetId)).next(()=>this.bs(e)).next(r=>(F(r.targetCount>0,8065),r.targetCount-=1,this.Ss(e,r)))}removeTargets(e,t,r){let i=0;const s=[];return Hi(e).jn((o,a)=>{const u=qo(this.serializer,a);u.sequenceNumber<=t&&r.get(u.targetId)===null&&(i++,s.push(this.removeTargetData(e,u)))}).next(()=>R.waitFor(s)).next(()=>i)}forEachTarget(e,t){return Hi(e).jn((r,i)=>{const s=qo(this.serializer,i);t(s)})}bs(e){return S_(e).get(Eu).next(t=>(F(t!==null,2888),t))}Ss(e,t){return S_(e).put(Eu,t)}vs(e,t){return Hi(e).put(cE(this.serializer,t))}Ds(e,t){let r=!1;return e.targetId>t.highestTargetId&&(t.highestTargetId=e.targetId,r=!0),e.sequenceNumber>t.highestListenSequenceNumber&&(t.highestListenSequenceNumber=e.sequenceNumber,r=!0),r}getTargetCount(e){return this.bs(e).next(t=>t.targetCount)}getTargetData(e,t){const r=ll(t),i=IDBKeyRange.bound([r,Number.NEGATIVE_INFINITY],[r,Number.POSITIVE_INFINITY]);let s=null;return Hi(e).jn({range:i,index:XT},(o,a,u)=>{const l=qo(this.serializer,a);Lf(t,l.target)&&(s=l,u.done())}).next(()=>s)}addMatchingKeys(e,t,r){const i=[],s=dr(e);return t.forEach(o=>{const a=ut(o.path);i.push(s.put({targetId:r,path:a})),i.push(this.referenceDelegate.addReference(e,r,o))}),R.waitFor(i)}removeMatchingKeys(e,t,r){const i=dr(e);return R.forEach(t,s=>{const o=ut(s.path);return R.waitFor([i.delete([r,o]),this.referenceDelegate.removeReference(e,r,s)])})}removeMatchingKeysForTargetId(e,t){const r=dr(e),i=IDBKeyRange.bound([t],[t+1],!1,!0);return r.delete(i)}getMatchingKeysForTargetId(e,t){const r=IDBKeyRange.bound([t],[t+1],!1,!0),i=dr(e);let s=Z();return i.jn({range:r,zn:!0},(o,a,u)=>{const l=pn(o[1]),h=new B(l);s=s.add(h)}).next(()=>s)}containsKey(e,t){const r=ut(t.path),i=IDBKeyRange.bound([r],[fI(r)],!1,!0);let s=0;return dr(e).jn({index:Uf,zn:!0,range:i},([o,a],u,l)=>{o!==0&&(s++,l.done())}).next(()=>s>0)}ge(e,t){return Hi(e).get(t).next(r=>r?qo(this.serializer,r):null)}}function Hi(n){return Ke(n,As)}function S_(n){return Ke(n,di)}function dr(n){return Ke(n,bs)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Sx{constructor(e,t){this.db=e,this.garbageCollector=TT(this,t)}rr(e){const t=this.xs(e);return this.db.getTargetCache().getTargetCount(e).next(r=>t.next(i=>r+i))}xs(e){let t=0;return this.ir(e,r=>{t++}).next(()=>t)}forEachTarget(e,t){return this.db.getTargetCache().forEachTarget(e,t)}ir(e,t){return this.Cs(e,(r,i)=>t(i))}addReference(e,t,r){return Oc(e,r)}removeReference(e,t,r){return Oc(e,r)}removeTargets(e,t,r){return this.db.getTargetCache().removeTargets(e,t,r)}markPotentiallyOrphaned(e,t){return Oc(e,t)}Fs(e,t){return function(i,s){let o=!1;return lE(i).Hn(a=>uE(i,a,s).next(u=>(u&&(o=!0),R.resolve(!u)))).next(()=>o)}(e,t)}removeOrphanedDocuments(e,t){const r=this.db.getRemoteDocumentCache().newChangeBuffer(),i=[];let s=0;return this.Cs(e,(o,a)=>{if(a<=t){const u=this.Fs(e,o).next(l=>{if(!l)return s++,r.getEntry(e,o).next(()=>(r.removeEntry(o,H.min()),dr(e).delete(function(f){return[0,ut(f.path)]}(o))))});i.push(u)}}).next(()=>R.waitFor(i)).next(()=>r.apply(e)).next(()=>s)}removeTarget(e,t){const r=t.withSequenceNumber(e.currentSequenceNumber);return this.db.getTargetCache().updateTargetData(e,r)}updateLimboDocument(e,t){return Oc(e,t)}Cs(e,t){const r=dr(e);let i,s=Rt.yn;return r.jn({index:Uf},([o,a],{path:u,sequenceNumber:l})=>{o===0?(s!==Rt.yn&&t(new B(pn(i)),s),s=l,i=u):s=Rt.yn}).next(()=>{s!==Rt.yn&&t(new B(pn(i)),s)})}getCacheSize(e){return this.db.getRemoteDocumentCache().getSize(e)}}function Oc(n,e){return dr(n).put(function(r,i){return{targetId:0,path:ut(r.path),sequenceNumber:i}}(e,n.currentSequenceNumber))}// Copyright 2024 Google LLC* @license
function fE(n,e){var r;let t=e;for(const i of n.stages)t=Px({serializer:n.serializer,serverTimestampBehavior:(r=n.listenOptions)==null?void 0:r.serverTimestampBehavior},i,t);return t}function gl(n,e){return fE(n,[e]).length>0}function pE(n,e){return Se(n)?gl(n,e):nl(n,e)}function Px(n,e,t){if(e instanceof Za)return function(i,s,o){return o.filter(a=>a.isFoundDocument()&&`/${a.key.getCollectionPath().canonicalString()}`===s.Er)}(0,e,t);if(e instanceof tc)return function(i,s,o){return o.filter(a=>{const u=ea(J(s.condition).evaluate(i,a));return u!==void 0&&zt(u,Ct)})}(n,e,t);if(e instanceof ec)return function(i,s,o){return o.filter(a=>a.isFoundDocument()&&a.key.getCollectionPath().lastSegment()===s.collectionId)}(0,e,t);if(e instanceof ol)return function(i,s,o){return o.filter(a=>a.isFoundDocument())}(0,0,t);if(e instanceof al)return function(i,s,o){return o.filter(a=>a.isFoundDocument()&&s.Tr.has(a.key.path.toStringWithLeadingSlash()))}(0,e,t);if(e instanceof Nr)return function(i,s,o){return o.slice(0,s.limit)}(0,e,t);if(e instanceof fn)return function(i,s,o){const a=s.orderings.map(u=>({Os:J(u.expr),direction:u.direction}));return[...o].sort((u,l)=>{for(const{Os:h,direction:f}of a){const g=ea(h.evaluate(i,u)),w=ea(h.evaluate(i,l)),S=ht(g!=null?g:gn,w!=null?w:gn);if(S!==0)return f==="ascending"?S:-S}return 0})}(n,e,t);throw new Error(`Unknown stage: ${e._name}`)}function cd(n){const e=function(r){for(let i=r.stages.length-1;i>=0;i--){const s=r.stages[i];if(s instanceof fn)return s.orderings}throw new Error("Pipeline must contain at least one Sort stage")}(n);return(t,r)=>{for(const i of e){const s=ea(J(i.expr).evaluate({serializer:n.serializer},t)),o=ea(J(i.expr).evaluate({serializer:n.serializer},r)),a=ht(s||gn,o||gn);if(a!==0)return i.direction==="ascending"?a:-a}return 0}}function mh(n){for(let e=n.stages.length-1;e>=0;e--){const t=n.stages[e];if(t instanceof Nr)return{limit:t.limit}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mE{constructor(){this.changes=new Yn(e=>e.toString(),(e,t)=>e.isEqual(t)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,we.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();const r=this.changes.get(t);return r!==void 0?R.resolve(r):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Cx{constructor(e){this.serializer=e}setIndexManager(e){this.indexManager=e}addEntry(e,t,r){return ur(e).put(r)}removeEntry(e,t,r){return ur(e).delete(function(s,o){const a=s.path.toArray();return[a.slice(0,a.length-2),a[a.length-2],Au(o),a[a.length-1]]}(t,r))}updateMetadata(e,t){return this.getMetadata(e).next(r=>(r.byteSize+=t,this.Ms(e,r)))}getEntry(e,t){let r=we.newInvalidDocument(t);return ur(e).jn({index:Xc,range:IDBKeyRange.only(Vo(t))},(i,s)=>{r=this.Ns(t,s)}).next(()=>r)}Ls(e,t){let r={size:0,document:we.newInvalidDocument(t)};return ur(e).jn({index:Xc,range:IDBKeyRange.only(Vo(t))},(i,s)=>{r={document:this.Ns(t,s),size:vu(s)}}).next(()=>r)}getEntries(e,t){let r=Le();return this.Bs(e,t,(i,s)=>{const o=this.Ns(i,s);r=r.insert(i,o)}).next(()=>r)}getAllEntries(e){let t=Le();return ur(e).jn((r,i)=>{const s=this.Ns(B.fromSegments(i.prefixPath.concat(i.collectionGroup,i.documentId)),i);t=t.insert(s.key,s)}).next(()=>t)}Us(e,t){let r=Le(),i=new me(B.comparator);return this.Bs(e,t,(s,o)=>{const a=this.Ns(s,o);r=r.insert(s,a),i=i.insert(s,vu(o))}).next(()=>({documents:r,ks:i}))}Bs(e,t,r){if(t.isEmpty())return R.resolve();let i=new de(k_);t.forEach(u=>i=i.add(u));const s=IDBKeyRange.bound(Vo(i.first()),Vo(i.last())),o=i.getIterator();let a=o.getNext();return ur(e).jn({index:Xc,range:s},(u,l,h)=>{const f=B.fromSegments([...l.prefixPath,l.collectionGroup,l.documentId]);for(;a&&k_(a,f)<0;)r(a,null),a=o.getNext();a&&a.isEqual(f)&&(r(a,l),a=o.hasNext()?o.getNext():null),a?h.$n(Vo(a)):h.done()}).next(()=>{for(;a;)r(a,null),a=o.hasNext()?o.getNext():null})}getDocumentsMatchingQuery(e,t,r,i,s){const o=Se(t)?te.fromString(nc(t)):t.path,a=[o.popLast().toArray(),o.lastSegment(),Au(r.readTime),r.documentKey.path.isEmpty()?"":r.documentKey.path.lastSegment()],u=[o.popLast().toArray(),o.lastSegment(),[Number.MAX_SAFE_INTEGER,Number.MAX_SAFE_INTEGER],""];return ur(e).Kn(IDBKeyRange.bound(a,u,!0)).next(l=>{s==null||s.incrementDocumentReadCount(l.length);let h=Le();for(const f of l){const g=this.Ns(B.fromSegments(f.prefixPath.concat(f.collectionGroup,f.documentId)),f);g.isFoundDocument()&&(pE(t,g)||i.has(g.key))&&(h=h.insert(g.key,g))}return h})}getAllFromCollectionGroup(e,t,r,i){let s=Le();const o=C_(t,r),a=C_(t,Mt.max());return ur(e).jn({index:YT,range:IDBKeyRange.bound(o,a,!0)},(u,l,h)=>{const f=this.Ns(B.fromSegments(l.prefixPath.concat(l.collectionGroup,l.documentId)),l);s=s.insert(f.key,f),s.size===i&&h.done()}).next(()=>s)}newChangeBuffer(e){return new kx(this,!!e&&e.trackRemovals)}getSize(e){return this.getMetadata(e).next(t=>t.byteSize)}getMetadata(e){return P_(e).get(ed).next(t=>(F(!!t,20021),t))}Ms(e,t){return P_(e).put(ed,t)}Ns(e,t){if(t){const r=mx(this.serializer,t);if(!(r.isNoDocument()&&r.version.isEqual(H.min())))return r}return we.newInvalidDocument(e)}}function gE(n){return new Cx(n)}class kx extends mE{constructor(e,t){super(),this.qs=e,this.trackRemovals=t,this.$s=new Yn(r=>r.toString(),(r,i)=>r.isEqual(i))}applyChanges(e){const t=[];let r=0,i=new de((s,o)=>Y(s.canonicalString(),o.canonicalString()));return this.changes.forEach((s,o)=>{const a=this.$s.get(s);if(t.push(this.qs.removeEntry(e,s,a.readTime)),o.isValidDocument()){const u=p_(this.qs.serializer,o);i=i.add(s.path.popLast());const l=vu(u);r+=l-a.size,t.push(this.qs.addEntry(e,s,u))}else if(r-=a.size,this.trackRemovals){const u=p_(this.qs.serializer,o.convertToNoDocument(H.min()));t.push(this.qs.addEntry(e,s,u))}}),i.forEach(s=>{t.push(this.qs.indexManager.addToCollectionParentIndex(e,s))}),t.push(this.qs.updateMetadata(e,r)),R.waitFor(t)}getFromCache(e,t){return this.qs.Ls(e,t).next(r=>(this.$s.set(t,{size:r.size,readTime:r.document.readTime}),r.document))}getAllFromCache(e,t){return this.qs.Us(e,t).next(({documents:r,ks:i})=>(i.forEach((s,o)=>{this.$s.set(s,{size:o,readTime:r.get(s).readTime})}),r))}}function P_(n){return Ke(n,Pa)}function ur(n){return Ke(n,Tu)}function Vo(n){const e=n.path.toArray();return[e.slice(0,e.length-2),e[e.length-2],e[e.length-1]]}function C_(n,e){const t=e.documentKey.path.toArray();return[n,Au(e.readTime),t.slice(0,t.length-2),t.length>0?t[t.length-1]:""]}function k_(n,e){const t=n.path.toArray(),r=e.path.toArray();let i=0;for(let s=0;s<t.length-2&&s<r.length-2;++s)if(i=Y(t[s],r[s]),i)return i;return i=Y(t.length,r.length),i||(i=Y(t[t.length-2],r[r.length-2]),i||Y(t[t.length-1],r[r.length-1]))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nx{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _E{constructor(e,t,r,i){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=r,this.indexManager=i}getDocument(e,t){let r=null;return this.documentOverlayCache.getOverlay(e,t).next(i=>(r=i,this.remoteDocumentCache.getEntry(e,t))).next(i=>(r!==null&&Qo(r.mutation,i,bt.empty(),le.now()),i))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next(r=>this.getLocalViewOfDocuments(e,r,Z()).next(()=>r))}getLocalViewOfDocuments(e,t,r=Z()){const i=Ut();return this.populateOverlays(e,i,t).next(()=>this.computeViews(e,t,i,r).next(s=>{let o=Yr();return s.forEach((a,u)=>{o=o.insert(a,u.overlayedDocument)}),o}))}getOverlayedDocuments(e,t){const r=Ut();return this.populateOverlays(e,r,t).next(()=>this.computeViews(e,t,r,Z()))}populateOverlays(e,t,r){const i=[];return r.forEach(s=>{t.has(s)||i.push(s)}),this.documentOverlayCache.getOverlays(e,i).next(s=>{s.forEach((o,a)=>{t.set(o,a)})})}computeViews(e,t,r,i){let s=Le();const o=Yo(),a=function(){return Yo()}();return t.forEach((u,l)=>{const h=r.get(l.key);i.has(l.key)&&(h===void 0||h.mutation instanceof Qn)?s=s.insert(l.key,l):h!==void 0?(o.set(l.key,h.mutation.getFieldMask()),Qo(h.mutation,l,h.mutation.getFieldMask(),le.now())):o.set(l.key,bt.empty())}),this.recalculateAndSaveOverlays(e,s).next(u=>(u.forEach((l,h)=>o.set(l,h)),t.forEach((l,h)=>{var f;return a.set(l,new Nx(h,(f=o.get(l))!=null?f:null))}),a))}recalculateAndSaveOverlays(e,t){const r=Yo();let i=new me((o,a)=>o-a),s=Z();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next(o=>{for(const a of o)a.keys().forEach(u=>{const l=t.get(u);if(l===null)return;let h=r.get(u)||bt.empty();h=a.applyToLocalView(l,h),r.set(u,h);const f=(i.get(a.batchId)||Z()).add(u);i=i.insert(a.batchId,f)})}).next(()=>{const o=[],a=i.getReverseIterator();for(;a.hasNext();){const u=a.getNext(),l=u.key,h=u.value,f=HI();h.forEach(g=>{if(!s.has(g)){const w=NI(t.get(g),r.get(g));w!==null&&f.set(g,w),s=s.add(g)}}),o.push(this.documentOverlayCache.saveOverlays(e,l,f))}return R.waitFor(o)}).next(()=>r)}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next(r=>this.recalculateAndSaveOverlays(e,r))}getDocumentsMatchingQuery(e,t,r,i){return Se(t)?this.getDocumentsMatchingPipeline(e,t,r,i):hN(t)?this.getDocumentsMatchingDocumentQuery(e,t.path):hf(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,r,i):this.getDocumentsMatchingCollectionQuery(e,t,r,i)}getNextDocuments(e,t,r,i){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,r,i).next(s=>{const o=i-s.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,r.largestBatchId,i-s.size):R.resolve(Ut());let a=Is,u=s;return o.next(l=>R.forEach(l,(h,f)=>(a<f.largestBatchId&&(a=f.largestBatchId),s.get(h)?R.resolve():this.remoteDocumentCache.getEntry(e,h).next(g=>{u=u.insert(h,g)}))).next(()=>this.populateOverlays(e,l,s)).next(()=>this.computeViews(e,u,l,Z())).next(h=>({batchId:a,changes:WI(h)})))})}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new B(t)).next(r=>{let i=Yr();return r.isFoundDocument()&&(i=i.insert(r.key,r)),i})}getDocumentsMatchingCollectionGroupQuery(e,t,r,i){const s=t.collectionGroup;let o=Yr();return this.indexManager.getCollectionParents(e,s).next(a=>R.forEach(a,u=>{const l=function(f,g){return new Jn(g,null,f.explicitOrderBy.slice(),f.filters.slice(),f.limit,f.limitType,f.startAt,f.endAt)}(t,u.child(s));return this.getDocumentsMatchingCollectionQuery(e,l,r,i).next(h=>{h.forEach((f,g)=>{o=o.insert(f,g)})})}).next(()=>o))}getDocumentsMatchingCollectionQuery(e,t,r,i){let s;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,r.largestBatchId).next(o=>(s=o,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,r,s,i))).next(o=>this.retrieveMatchingLocalDocuments(s,o,a=>nl(t,a)))}getDocumentsMatchingPipeline(e,t,r,i){if(Dn(t)==="collection_group"){const s=Cf(t);let o=Yr();return this.indexManager.getCollectionParents(e,s).next(a=>R.forEach(a,u=>{const l=function(f,g){const w=f.stages.map(S=>S instanceof ec?new Za(g.canonicalString(),{}):S);return new ot(f.serializer,w)}(t,u.child(s));return this.getDocumentsMatchingPipeline(e,l,r,i).next(h=>{h.forEach((f,g)=>{o=o.insert(f,g)})})}).next(()=>o))}{let s;return this.getOverlaysForPipeline(e,t,r.largestBatchId).next(o=>{switch(s=o,Dn(t)){case"collection":return this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,r,s,i);case"documents":let a=Z();for(const u of yu(t))a=a.add(B.fromPath(u));return this.remoteDocumentCache.getEntries(e,a);case"database":return this.remoteDocumentCache.getAllEntries(e);default:throw new O("invalid-argument",`Invalid pipeline source to execute offline: ${xn(t)}`)}}).next(o=>this.retrieveMatchingLocalDocuments(s,o,a=>gl(t,a)))}}retrieveMatchingLocalDocuments(e,t,r){e.forEach((s,o)=>{const a=o.getKey();t.get(a)===null&&(t=t.insert(a,we.newInvalidDocument(a)))});let i=Yr();return t.forEach((s,o)=>{const a=e.get(s);a!==void 0&&Qo(a.mutation,o,bt.empty(),le.now()),r(o)&&(i=i.insert(s,o))}),i}getOverlaysForPipeline(e,t,r){switch(Dn(t)){case"collection":return this.documentOverlayCache.getOverlaysForCollection(e,te.fromString(nc(t)),r);case"collection_group":throw new O("invalid-argument",`Unexpected collection group pipeline: ${xn(t)}`);case"documents":return this.documentOverlayCache.getOverlays(e,yu(t).map(i=>B.fromPath(i)));case"database":return this.documentOverlayCache.getAllOverlays(e,r);default:throw new O("invalid-argument",`Failed to get overlays for pipeline: ${xn(t)}`)}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vx{constructor(e){this.serializer=e,this.Ks=new Map,this.Qs=new Map}getBundleMetadata(e,t){return R.resolve(this.Ks.get(t))}saveBundleMetadata(e,t){return this.Ks.set(t.id,function(i){return{id:i.id,version:i.version,createTime:Ve(i.createTime)}}(t)),R.resolve()}getNamedQuery(e,t){return R.resolve(this.Qs.get(t))}saveNamedQuery(e,t){return this.Qs.set(t.name,function(i){return{name:i.name,query:zf(i.bundledQuery),readTime:Ve(i.readTime)}}(t)),R.resolve()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dx{constructor(){this.overlays=new me(B.comparator),this.Ws=new Map}getOverlay(e,t){return R.resolve(this.overlays.get(t))}getOverlays(e,t){const r=Ut();return R.forEach(t,i=>this.getOverlay(e,i).next(s=>{s!==null&&r.set(i,s)})).next(()=>r)}getAllOverlays(e,t){const r=Ut();return this.overlays.forEach((i,s)=>{s.largestBatchId>t&&r.set(i,s)}),R.resolve(r)}saveOverlays(e,t,r){return r.forEach((i,s)=>{this.Yr(e,t,s)}),R.resolve()}removeOverlaysForBatchId(e,t,r){const i=this.Ws.get(r);return i!==void 0&&(i.forEach(s=>this.overlays=this.overlays.remove(s)),this.Ws.delete(r)),R.resolve()}getOverlaysForCollection(e,t,r){const i=Ut(),s=t.length+1,o=new B(t.child("")),a=this.overlays.getIteratorFrom(o);for(;a.hasNext();){const u=a.getNext().value,l=u.getKey();if(!t.isPrefixOf(l.path))break;l.path.length===s&&u.largestBatchId>r&&i.set(u.getKey(),u)}return R.resolve(i)}getOverlaysForCollectionGroup(e,t,r,i){let s=new me((l,h)=>l-h);const o=this.overlays.getIterator();for(;o.hasNext();){const l=o.getNext().value;if(l.getKey().getCollectionGroup()===t&&l.largestBatchId>r){let h=s.get(l.largestBatchId);h===null&&(h=Ut(),s=s.insert(l.largestBatchId,h)),h.set(l.getKey(),l)}}const a=Ut(),u=s.getIterator();for(;u.hasNext()&&(u.getNext().value.forEach((l,h)=>a.set(l,h)),!(a.size()>=i)););return R.resolve(a)}Yr(e,t,r){const i=this.overlays.get(r.key);if(i!==null){const o=this.Ws.get(i.largestBatchId).delete(r.key);this.Ws.set(i.largestBatchId,o)}this.overlays=this.overlays.insert(r.key,new jf(t,r));let s=this.Ws.get(t);s===void 0&&(s=Z(),this.Ws.set(t,s)),this.Ws.set(t,s.add(r.key))}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xx{constructor(){this.sessionToken=Ie.EMPTY_BYTE_STRING}getSessionToken(e){return R.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,R.resolve()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wf{constructor(){this.Gs=new de(We.zs),this.js=new de(We.Hs)}isEmpty(){return this.Gs.isEmpty()}addReference(e,t){const r=new We(e,t);this.Gs=this.Gs.add(r),this.js=this.js.add(r)}Js(e,t){e.forEach(r=>this.addReference(r,t))}removeReference(e,t){this.Ys(new We(e,t))}Zs(e,t){e.forEach(r=>this.removeReference(r,t))}Xs(e){const t=new B(new te([])),r=new We(t,e),i=new We(t,e+1),s=[];return this.js.forEachInRange([r,i],o=>{this.Ys(o),s.push(o.key)}),s}e_(){this.Gs.forEach(e=>this.Ys(e))}Ys(e){this.Gs=this.Gs.delete(e),this.js=this.js.delete(e)}t_(e){const t=new B(new te([])),r=new We(t,e),i=new We(t,e+1);let s=Z();return this.js.forEachInRange([r,i],o=>{s=s.add(o.key)}),s}containsKey(e){const t=new We(e,0),r=this.Gs.firstAfterOrEqual(t);return r!==null&&e.isEqual(r.key)}}class We{constructor(e,t){this.key=e,this.n_=t}static zs(e,t){return B.comparator(e.key,t.key)||Y(e.n_,t.n_)}static Hs(e,t){return Y(e.n_,t.n_)||B.comparator(e.key,t.key)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ox{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.Wr=1,this.r_=new de(We.zs)}checkEmpty(e){return R.resolve(this.mutationQueue.length===0)}addMutationBatch(e,t,r,i){const s=this.Wr;this.Wr++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const o=new Mf(s,t,r,i);this.mutationQueue.push(o);for(const a of i)this.r_=this.r_.add(new We(a.key,s)),this.indexManager.addToCollectionParentIndex(e,a.key.path.popLast());return R.resolve(o)}lookupMutationBatch(e,t){return R.resolve(this.i_(t))}getNextMutationBatchAfterBatchId(e,t){const r=t+1,i=this.s_(r),s=i<0?0:i;return R.resolve(this.mutationQueue.length>s?this.mutationQueue[s]:null)}getHighestUnacknowledgedBatchId(){return R.resolve(this.mutationQueue.length===0?wr:this.Wr-1)}getAllMutationBatches(e){return R.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){const r=new We(t,0),i=new We(t,Number.POSITIVE_INFINITY),s=[];return this.r_.forEachInRange([r,i],o=>{const a=this.i_(o.n_);s.push(a)}),R.resolve(s)}getAllMutationBatchesAffectingDocumentKeys(e,t){let r=new de(Y);return t.forEach(i=>{const s=new We(i,0),o=new We(i,Number.POSITIVE_INFINITY);this.r_.forEachInRange([s,o],a=>{r=r.add(a.n_)})}),R.resolve(this.__(r))}getAllMutationBatchesAffectingQuery(e,t){const r=t.path,i=r.length+1;let s=r;B.isDocumentKey(s)||(s=s.child(""));const o=new We(new B(s),0);let a=new de(Y);return this.r_.forEachWhile(u=>{const l=u.key.path;return!!r.isPrefixOf(l)&&(l.length===i&&(a=a.add(u.n_)),!0)},o),R.resolve(this.__(a))}__(e){const t=[];return e.forEach(r=>{const i=this.i_(r);i!==null&&t.push(i)}),t}removeMutationBatch(e,t){F(this.o_(t.batchId,"removed")===0,55003),this.mutationQueue.shift();let r=this.r_;return R.forEach(t.mutations,i=>{const s=new We(i.key,t.batchId);return r=r.delete(s),this.referenceDelegate.markPotentiallyOrphaned(e,i.key)}).next(()=>{this.r_=r})}jr(e){}containsKey(e,t){const r=new We(t,0),i=this.r_.firstAfterOrEqual(r);return R.resolve(t.isEqual(i&&i.key))}performConsistencyCheck(e){return this.mutationQueue.length,R.resolve()}o_(e,t){return this.s_(e)}s_(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}i_(e){const t=this.s_(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Lx{constructor(e){this.a_=e,this.docs=function(){return new me(B.comparator)}(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){const r=t.key,i=this.docs.get(r),s=i?i.size:0,o=this.a_(t);return this.docs=this.docs.insert(r,{document:t.mutableCopy(),size:o}),this.size+=o-s,this.indexManager.addToCollectionParentIndex(e,r.path.popLast())}removeEntry(e){const t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){const r=this.docs.get(t);return R.resolve(r?r.document.mutableCopy():we.newInvalidDocument(t))}getEntries(e,t){let r=Le();return t.forEach(i=>{const s=this.docs.get(i);r=r.insert(i,s?s.document.mutableCopy():we.newInvalidDocument(i))}),R.resolve(r)}getAllEntries(e){let t=Le();return this.docs.forEach((r,i)=>{t=t.insert(r,i.document)}),R.resolve(t)}getDocumentsMatchingQuery(e,t,r,i){let s,o;Se(t)?(s=te.fromString(nc(t)),o=h=>gl(t,h)):(s=t.path,o=h=>nl(t,h));let a=Le();const u=new B(s.child("__id-9223372036854775808__")),l=this.docs.getIteratorFrom(u);for(;l.hasNext();){const{key:h,value:{document:f}}=l.getNext();if(!s.isPrefixOf(h.path))break;h.path.length>s.length+1||cf(qI(f),r)<=0||(i.has(f.key)||o(f))&&(a=a.insert(f.key,f.mutableCopy()))}return R.resolve(a)}getAllFromCollectionGroup(e,t,r,i){j(9500)}u_(e,t){return R.forEach(this.docs,r=>t(r))}newChangeBuffer(e){return new Mx(this)}getSize(e){return R.resolve(this.size)}}class Mx extends mE{constructor(e){super(),this.qs=e}applyChanges(e){const t=[];return this.changes.forEach((r,i)=>{i.isValidDocument()?t.push(this.qs.addEntry(e,i)):this.qs.removeEntry(r)}),R.waitFor(t)}getFromCache(e,t){return this.qs.getEntry(e,t)}getAllFromCache(e,t){return this.qs.getEntries(e,t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fx{constructor(e){this.persistence=e,this.c_=new Yn(t=>ll(t),Lf),this.lastRemoteSnapshotVersion=H.min(),this.highestTargetId=0,this.l_=0,this.E_=new Wf,this.targetCount=0,this.h_=$n.ys()}forEachTarget(e,t){return this.c_.forEach((r,i)=>t(i)),R.resolve()}getLastRemoteSnapshotVersion(e){return R.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return R.resolve(this.l_)}allocateTargetId(e){return this.highestTargetId=this.h_.next(),R.resolve(this.highestTargetId)}setTargetsMetadata(e,t,r){return r&&(this.lastRemoteSnapshotVersion=r),t>this.l_&&(this.l_=t),R.resolve()}vs(e){this.c_.set(e.target,e);const t=e.targetId;t>this.highestTargetId&&(this.h_=new $n(t),this.highestTargetId=t),e.sequenceNumber>this.l_&&(this.l_=e.sequenceNumber)}addTargetData(e,t){return this.vs(t),this.targetCount+=1,R.resolve()}updateTargetData(e,t){return this.vs(t),R.resolve()}removeTargetData(e,t){return this.c_.delete(t.target),this.E_.Xs(t.targetId),this.targetCount-=1,R.resolve()}removeTargets(e,t,r){let i=0;const s=[];return this.c_.forEach((o,a)=>{a.sequenceNumber<=t&&r.get(a.targetId)===null&&(this.c_.delete(o),s.push(this.removeMatchingKeysForTargetId(e,a.targetId)),i++)}),R.waitFor(s).next(()=>i)}getTargetCount(e){return R.resolve(this.targetCount)}getTargetData(e,t){const r=this.c_.get(t)||null;return R.resolve(r)}addMatchingKeys(e,t,r){return this.E_.Js(t,r),R.resolve()}removeMatchingKeys(e,t,r){this.E_.Zs(t,r);const i=this.persistence.referenceDelegate,s=[];return i&&t.forEach(o=>{s.push(i.markPotentiallyOrphaned(e,o))}),R.waitFor(s)}removeMatchingKeysForTargetId(e,t){return this.E_.Xs(t),R.resolve()}getMatchingKeysForTargetId(e,t){const r=this.E_.t_(t);return R.resolve(r)}containsKey(e,t){return R.resolve(this.E_.containsKey(t))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hf{constructor(e,t){this.T_={},this.overlays={},this.P_=new Rt(0),this.R_=!1,this.R_=!0,this.I_=new xx,this.referenceDelegate=e(this),this.A_=new Fx(this),this.indexManager=new Ax,this.remoteDocumentCache=function(i){return new Lx(i)}(r=>this.referenceDelegate.V_(r)),this.serializer=new aE(t),this.d_=new Vx(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.R_=!1,Promise.resolve()}get started(){return this.R_}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new Dx,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let r=this.T_[e.toKey()];return r||(r=new Ox(t,this.referenceDelegate),this.T_[e.toKey()]=r),r}getGlobalsCache(){return this.I_}getTargetCache(){return this.A_}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.d_}runTransaction(e,t,r){L("MemoryPersistence","Starting transaction:",e);const i=new Ux(this.P_.next());return this.referenceDelegate.f_(),r(i).next(s=>this.referenceDelegate.m_(i).next(()=>s)).toPromise().then(s=>(i.raiseOnCommittedEvent(),s))}p_(e,t){return R.or(Object.values(this.T_).map(r=>()=>r.containsKey(e,t)))}}class Ux extends yT{constructor(e){super(),this.currentSequenceNumber=e}}class _l{constructor(e){this.persistence=e,this.g_=new Wf,this.y_=null}static w_(e){return new _l(e)}get b_(){if(this.y_)return this.y_;throw j(60996)}addReference(e,t,r){return this.g_.addReference(r,t),this.b_.delete(r.toString()),R.resolve()}removeReference(e,t,r){return this.g_.removeReference(r,t),this.b_.add(r.toString()),R.resolve()}markPotentiallyOrphaned(e,t){return this.b_.add(t.toString()),R.resolve()}removeTarget(e,t){this.g_.Xs(t.targetId).forEach(i=>this.b_.add(i.toString()));const r=this.persistence.getTargetCache();return r.getMatchingKeysForTargetId(e,t.targetId).next(i=>{i.forEach(s=>this.b_.add(s.toString()))}).next(()=>r.removeTargetData(e,t))}f_(){this.y_=new Set}m_(e){const t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return R.forEach(this.b_,r=>{const i=B.fromPath(r);return this.S_(e,i).next(s=>{s||t.removeEntry(i,H.min())})}).next(()=>(this.y_=null,t.apply(e)))}updateLimboDocument(e,t){return this.S_(e,t).next(r=>{r?this.b_.delete(t.toString()):this.b_.add(t.toString())})}V_(e){return 0}S_(e,t){return R.or([()=>R.resolve(this.g_.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.p_(e,t)])}}class Ru{constructor(e,t){this.persistence=e,this.v_=new Yn(r=>ut(r.path),(r,i)=>r.isEqual(i)),this.garbageCollector=TT(this,t)}static w_(e,t){return new Ru(e,t)}f_(){}m_(e){return R.resolve()}forEachTarget(e,t){return this.persistence.getTargetCache().forEachTarget(e,t)}rr(e){const t=this.xs(e);return this.persistence.getTargetCache().getTargetCount(e).next(r=>t.next(i=>r+i))}xs(e){let t=0;return this.ir(e,r=>{t++}).next(()=>t)}ir(e,t){return R.forEach(this.v_,(r,i)=>this.Fs(e,r,i).next(s=>s?R.resolve():t(i)))}removeTargets(e,t,r){return this.persistence.getTargetCache().removeTargets(e,t,r)}removeOrphanedDocuments(e,t){let r=0;const i=this.persistence.getRemoteDocumentCache(),s=i.newChangeBuffer();return i.u_(e,o=>this.Fs(e,o,t).next(a=>{a||(r++,s.removeEntry(o,H.min()))})).next(()=>s.apply(e)).next(()=>r)}markPotentiallyOrphaned(e,t){return this.v_.set(t,e.currentSequenceNumber),R.resolve()}removeTarget(e,t){const r=t.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,r)}addReference(e,t,r){return this.v_.set(r,e.currentSequenceNumber),R.resolve()}removeReference(e,t,r){return this.v_.set(r,e.currentSequenceNumber),R.resolve()}updateLimboDocument(e,t){return this.v_.set(t,e.currentSequenceNumber),R.resolve()}V_(e){let t=e.key.toString().length;return e.isFoundDocument()&&(t+=Kc(e.data.value)),t}Fs(e,t,r){return R.or([()=>this.persistence.p_(e,t),()=>this.persistence.getTargetCache().containsKey(e,t),()=>{const i=this.v_.get(t);return R.resolve(i!==void 0&&i>r)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bx{constructor(e){this.serializer=e}Mn(e,t,r,i){const s=new rl("createOrUpgrade",t);r<1&&i>=1&&(function(u){u.createObjectStore(ic)}(e),function(u){u.createObjectStore(Sa,{keyPath:zD}),u.createObjectStore(Kt,{keyPath:d_,autoIncrement:!0}).createIndex(si,f_,{unique:!0}),u.createObjectStore(vs)}(e),N_(e),function(u){u.createObjectStore(Jr)}(e));let o=R.resolve();return r<3&&i>=3&&(r!==0&&(function(u){u.deleteObjectStore(bs),u.deleteObjectStore(As),u.deleteObjectStore(di)}(e),N_(e)),o=o.next(()=>function(u){const l=u.store(di),h={highestTargetId:0,highestListenSequenceNumber:0,lastRemoteSnapshotVersion:H.min().toTimestamp(),targetCount:0};return l.put(Eu,h)}(s))),r<4&&i>=4&&(r!==0&&(o=o.next(()=>function(u,l){return l.store(Kt).Kn().next(f=>{u.deleteObjectStore(Kt),u.createObjectStore(Kt,{keyPath:d_,autoIncrement:!0}).createIndex(si,f_,{unique:!0});const g=l.store(Kt),w=f.map(S=>g.put(S));return R.waitFor(w)})}(e,s))),o=o.next(()=>{(function(u){u.createObjectStore(Rs,{keyPath:ZD})})(e)})),r<5&&i>=5&&(o=o.next(()=>this.D_(s))),r<6&&i>=6&&(o=o.next(()=>(function(u){u.createObjectStore(Pa)}(e),this.x_(s)))),r<7&&i>=7&&(o=o.next(()=>this.C_(s))),r<8&&i>=8&&(o=o.next(()=>this.F_(e,s))),r<9&&i>=9&&(o=o.next(()=>{(function(u){u.objectStoreNames.contains("remoteDocumentChanges")&&u.deleteObjectStore("remoteDocumentChanges")})(e)})),r<10&&i>=10&&(o=o.next(()=>this.O_(s))),r<11&&i>=11&&(o=o.next(()=>{(function(u){u.createObjectStore(hl,{keyPath:ex})})(e),function(u){u.createObjectStore(dl,{keyPath:tx})}(e)})),r<12&&i>=12&&(o=o.next(()=>{(function(u){const l=u.createObjectStore(fl,{keyPath:cx});l.createIndex(nd,ux,{unique:!1}),l.createIndex(tE,lx,{unique:!1})})(e)})),r<13&&i>=13&&(o=o.next(()=>function(u){const l=u.createObjectStore(Tu,{keyPath:GD});l.createIndex(Xc,WD),l.createIndex(YT,HD)}(e)).next(()=>this.M_(e,s)).next(()=>e.deleteObjectStore(Jr))),r<14&&i>=14&&(o=o.next(()=>this.N_(e,s))),r<15&&i>=15&&(o=o.next(()=>function(u){u.createObjectStore(Bf,{keyPath:nx,autoIncrement:!0}).createIndex(td,rx,{unique:!1}),u.createObjectStore(ta,{keyPath:ix}).createIndex(ZT,sx,{unique:!1}),u.createObjectStore(na,{keyPath:ox}).createIndex(eE,ax,{unique:!1})}(e))),r<16&&i>=16&&(o=o.next(()=>{t.objectStore(ta).clear()}).next(()=>{t.objectStore(na).clear()})),r<17&&i>=17&&(o=o.next(()=>{(function(u){u.createObjectStore(qf,{keyPath:hx})})(e)})),r<18&&i>=18&&Jy()&&(o=o.next(()=>{t.objectStore(ta).clear()}).next(()=>{t.objectStore(na).clear()})),o}x_(e){let t=0;return e.store(Jr).jn((r,i)=>{t+=vu(i)}).next(()=>{const r={byteSize:t};return e.store(Pa).put(ed,r)})}D_(e){const t=e.store(Sa),r=e.store(Kt);return t.Kn().next(i=>R.forEach(i,s=>{const o=IDBKeyRange.bound([s.userId,wr],[s.userId,s.lastAcknowledgedBatchId]);return r.Kn(si,o).next(a=>R.forEach(a,u=>{F(u.userId===s.userId,18650,"Cannot process batch from unexpected user",{batchId:u.batchId});const l=Zr(this.serializer,u);return oE(e,s.userId,l).next(()=>{})}))}))}C_(e){const t=e.store(bs),r=e.store(Jr);return e.store(di).get(Eu).next(i=>{const s=[];return r.jn((o,a)=>{const u=new te(o),l=function(f){return[0,ut(f)]}(u);s.push(t.get(l).next(h=>h?R.resolve():(f=>t.put({targetId:0,path:ut(f),sequenceNumber:i.highestListenSequenceNumber}))(u)))}).next(()=>R.waitFor(s))})}F_(e,t){e.createObjectStore(Ca,{keyPath:XD});const r=t.store(Ca),i=new Gf,s=o=>{if(i.add(o)){const a=o.lastSegment(),u=o.popLast();return r.put({collectionId:a,parent:ut(u)})}};return t.store(Jr).jn({zn:!0},(o,a)=>{const u=new te(o);return s(u.popLast())}).next(()=>t.store(vs).jn({zn:!0},([o,a,u],l)=>{const h=pn(a);return s(h.popLast())}))}O_(e){const t=e.store(As);return t.jn((r,i)=>{const s=qo(this.serializer,i),o=cE(this.serializer,s);return t.put(o)})}M_(e,t){const r=t.store(Jr),i=[];return r.jn((s,o)=>{const a=t.store(Tu),u=function(f){return f.document?new B(te.fromString(f.document.name).popFirst(5)):f.noDocument?B.fromSegments(f.noDocument.path):f.unknownDocument?B.fromSegments(f.unknownDocument.path):j(36783)}(o).path.toArray(),l={prefixPath:u.slice(0,u.length-2),collectionGroup:u[u.length-2],documentId:u[u.length-1],readTime:o.readTime||[0,0],unknownDocument:o.unknownDocument,noDocument:o.noDocument,document:o.document,hasCommittedMutations:!!o.hasCommittedMutations};i.push(a.put(l))}).next(()=>R.waitFor(i))}N_(e,t){const r=t.store(Kt),i=gE(this.serializer),s=new Hf(_l.w_,this.serializer.qr);return r.Kn().next(o=>{const a=new Map;return o.forEach(u=>{var h;let l=(h=a.get(u.userId))!=null?h:Z();Zr(this.serializer,u).keys().forEach(f=>l=l.add(f)),a.set(u.userId,l)}),R.forEach(a,(u,l)=>{const h=new He(l),f=ml.Kr(this.serializer,h),g=s.getIndexManager(h),w=pl.Kr(h,this.serializer,g,s.referenceDelegate);return new _E(i,w,f,g).recalculateAndSaveOverlaysForDocumentKeys(new rd(t,Rt.yn),u).next()})})}}function N_(n){n.createObjectStore(bs,{keyPath:JD}).createIndex(Uf,YD,{unique:!0}),n.createObjectStore(As,{keyPath:"targetId"}).createIndex(XT,QD,{unique:!0}),n.createObjectStore(di)}const lr="IndexedDbPersistence",gh=18e5,_h=5e3,yh="Failed to obtain exclusive access to the persistence layer. To allow shared access, multi-tab synchronization has to be enabled in all tabs. If you are using `experimentalForceOwningTab:true`, make sure that only one tab has persistence enabled at any given time.",yE="main";class Qf{constructor(e,t,r,i,s,o,a,u,l,h,f=18){if(this.allowTabSynchronization=e,this.persistenceKey=t,this.clientId=r,this.xt=s,this.window=o,this.document=a,this.L_=l,this.B_=h,this.U_=f,this.P_=null,this.R_=!1,this.isPrimary=!1,this.networkEnabled=!0,this.k_=null,this.inForeground=!1,this.q_=null,this.K_=null,this.Q_=Number.NEGATIVE_INFINITY,this.W_=g=>Promise.resolve(),!Qf.Je())throw new O(k.UNIMPLEMENTED,"This platform is either missing IndexedDB or is known to have an incomplete implementation. Offline persistence has been disabled.");this.referenceDelegate=new Sx(this,i),this.G_=t+yE,this.serializer=new aE(u),this.z_=new yn(this.G_,this.U_,new Bx(this.serializer)),this.I_=new yx,this.A_=new Rx(this.referenceDelegate,this.serializer),this.remoteDocumentCache=gE(this.serializer),this.d_=new _x,this.window&&this.window.localStorage?this.j_=this.window.localStorage:(this.j_=null,h===!1&&Ne(lr,"LocalStorage is unavailable. As a result, persistence may not work reliably. In particular enablePersistence() could fail immediately after refreshing the page."))}start(){return this.H_().then(()=>{if(!this.isPrimary&&!this.allowTabSynchronization)throw new O(k.FAILED_PRECONDITION,yh);return this.J_(),this.Y_(),this.Z_(),this.runTransaction("getHighestListenSequenceNumber","readonly",e=>this.A_.getHighestSequenceNumber(e))}).then(e=>{this.P_=new Rt(e,this.L_)}).then(()=>{this.R_=!0}).catch(e=>(this.z_&&this.z_.close(),Promise.reject(e)))}X_(e){return this.W_=t=>p(this,null,function*(){if(this.started)return e(t)}),e(this.isPrimary)}setDatabaseDeletedListener(e){this.z_.Ln(t=>p(this,null,function*(){t.newVersion===null&&(yield e())}))}setNetworkEnabled(e){this.networkEnabled!==e&&(this.networkEnabled=e,this.xt.enqueueAndForget(()=>p(this,null,function*(){this.started&&(yield this.H_())})))}H_(){return this.runTransaction("updateClientMetadataAndTryBecomePrimary","readwrite",e=>Lc(e).put({clientId:this.clientId,updateTimeMs:Date.now(),networkEnabled:this.networkEnabled,inForeground:this.inForeground}).next(()=>{if(this.isPrimary)return this.eo(e).next(t=>{t||(this.isPrimary=!1,this.xt.enqueueRetryable(()=>this.W_(!1)))})}).next(()=>this.no(e)).next(t=>this.isPrimary&&!t?this.ro(e).next(()=>!1):!!t&&this.io(e).next(()=>!0))).catch(e=>{if(Fr(e))return L(lr,"Failed to extend owner lease: ",e),this.isPrimary;if(!this.allowTabSynchronization)throw e;return L(lr,"Releasing owner lease after error during lease refresh",e),!1}).then(e=>{this.isPrimary!==e&&this.xt.enqueueRetryable(()=>this.W_(e)),this.isPrimary=e})}eo(e){return Do(e).get(ji).next(t=>R.resolve(this.so(t)))}_o(e){return Lc(e).delete(this.clientId)}oo(){return p(this,null,function*(){if(this.isPrimary&&!this.ao(this.Q_,gh)){this.Q_=Date.now();const e=yield this.runTransaction("maybeGarbageCollectMultiClientState","readwrite-primary",t=>{const r=Ke(t,Rs);return r.Kn().next(i=>{const s=this.uo(i,gh),o=i.filter(a=>s.indexOf(a)===-1);return R.forEach(o,a=>r.delete(a.clientId)).next(()=>o)})}).catch(()=>[]);if(this.j_)for(const t of e)this.j_.removeItem(this.co(t.clientId))}})}Z_(){this.K_=this.xt.enqueueAfterDelay("client_metadata_refresh",4e3,()=>this.H_().then(()=>this.oo()).then(()=>this.Z_()))}so(e){return!!e&&e.ownerId===this.clientId}no(e){return this.B_?R.resolve(!0):Do(e).get(ji).next(t=>{if(t!==null&&this.ao(t.leaseTimestampMs,_h)&&!this.lo(t.ownerId)){if(this.so(t)&&this.networkEnabled)return!0;if(!this.so(t)){if(!t.allowTabSynchronization)throw new O(k.FAILED_PRECONDITION,yh);return!1}}return!(!this.networkEnabled||!this.inForeground)||Lc(e).Kn().next(r=>this.uo(r,_h).find(i=>{if(this.clientId!==i.clientId){const s=!this.networkEnabled&&i.networkEnabled,o=!this.inForeground&&i.inForeground,a=this.networkEnabled===i.networkEnabled;if(s||o&&a)return!0}return!1})===void 0)}).next(t=>(this.isPrimary!==t&&L(lr,`Client ${t?"is":"is not"} eligible for a primary lease.`),t))}shutdown(){return p(this,null,function*(){this.R_=!1,this.Eo(),this.K_&&(this.K_.cancel(),this.K_=null),this.ho(),this.To(),yield this.z_.runTransaction("shutdown","readwrite",[ic,Rs],e=>{const t=new rd(e,Rt.yn);return this.ro(t).next(()=>this._o(t))}),this.z_.close(),this.Po()})}uo(e,t){return e.filter(r=>this.ao(r.updateTimeMs,t)&&!this.lo(r.clientId))}Ro(){return this.runTransaction("getActiveClients","readonly",e=>Lc(e).Kn().next(t=>this.uo(t,gh).map(r=>r.clientId)))}get started(){return this.R_}getGlobalsCache(){return this.I_}getMutationQueue(e,t){return pl.Kr(e,this.serializer,t,this.referenceDelegate)}getTargetCache(){return this.A_}getRemoteDocumentCache(){return this.remoteDocumentCache}getIndexManager(e){return new bx(e,this.serializer.qr.databaseId)}getDocumentOverlayCache(e){return ml.Kr(this.serializer,e)}getBundleCache(){return this.d_}runTransaction(e,t,r){L(lr,"Starting transaction:",e);const i=t==="readonly"?"readonly":"readwrite",s=function(u){return u===18?px:u===17?sE:u===16?fx:u===15?$f:u===14?iE:u===13?rE:u===12?dx:u===11?nE:void j(60245)}(this.U_);let o;return this.z_.runTransaction(e,i,s,a=>(o=new rd(a,this.P_?this.P_.next():Rt.yn),t==="readwrite-primary"?this.eo(o).next(u=>!!u||this.no(o)).next(u=>{if(!u)throw Ne(`Failed to obtain primary lease for action '${e}'.`),this.isPrimary=!1,this.xt.enqueueRetryable(()=>this.W_(!1)),new O(k.FAILED_PRECONDITION,_T);return r(o)}).next(u=>this.io(o).next(()=>u)):this.Io(o).next(()=>r(o)))).then(a=>(o.raiseOnCommittedEvent(),a))}Io(e){return Do(e).get(ji).next(t=>{if(t!==null&&this.ao(t.leaseTimestampMs,_h)&&!this.lo(t.ownerId)&&!this.so(t)&&!(this.B_||this.allowTabSynchronization&&t.allowTabSynchronization))throw new O(k.FAILED_PRECONDITION,yh)})}io(e){const t={ownerId:this.clientId,allowTabSynchronization:this.allowTabSynchronization,leaseTimestampMs:Date.now()};return Do(e).put(ji,t)}static Je(){return yn.Je()}ro(e){const t=Do(e);return t.get(ji).next(r=>this.so(r)?(L(lr,"Releasing primary lease."),t.delete(ji)):R.resolve())}ao(e,t){const r=Date.now();return!(e<r-t)&&(!(e>r)||(Ne(`Detected an update time that is in the future: ${e} > ${r}`),!1))}J_(){this.document!==null&&typeof this.document.addEventListener=="function"&&(this.q_=()=>{this.xt.enqueueAndForget(()=>(this.inForeground=this.document.visibilityState==="visible",this.H_()))},this.document.addEventListener("visibilitychange",this.q_),this.inForeground=this.document.visibilityState==="visible")}ho(){this.q_&&(this.document.removeEventListener("visibilitychange",this.q_),this.q_=null)}Y_(){var e;typeof((e=this.window)==null?void 0:e.addEventListener)=="function"&&(this.k_=()=>{this.Eo();const t=/(?:Version|Mobile)\/1[456]/;Qy()&&(navigator.appVersion.match(t)||navigator.userAgent.match(t))&&this.xt.enterRestrictedMode(!0),this.xt.enqueueAndForget(()=>this.shutdown())},this.window.addEventListener("pagehide",this.k_))}To(){this.k_&&(this.window.removeEventListener("pagehide",this.k_),this.k_=null)}lo(e){var t;try{const r=((t=this.j_)==null?void 0:t.getItem(this.co(e)))!==null;return L(lr,`Client '${e}' ${r?"is":"is not"} zombied in LocalStorage`),r}catch(r){return Ne(lr,"Failed to get zombied client id.",r),!1}}Eo(){if(this.j_)try{this.j_.setItem(this.co(this.clientId),String(Date.now()))}catch(e){Ne("Failed to set zombie client id.",e)}}Po(){if(this.j_)try{this.j_.removeItem(this.co(this.clientId))}catch(e){}}co(e){return`firestore_zombie_${this.persistenceKey}_${e}`}}function Do(n){return Ke(n,ic)}function Lc(n){return Ke(n,Rs)}function Jf(n,e){let t=n.projectId;return n.isDefaultDatabase||(t+="."+n.database),"firestore/"+e+"/"+t+"/"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yf{constructor(e,t,r,i){this.targetId=e,this.fromCache=t,this.Ao=r,this.Vo=i}static fo(e,t){let r=Z(),i=Z();for(const s of t.docChanges)switch(s.type){case 0:r=r.add(s.doc.key);break;case 1:i=i.add(s.doc.key)}return new Yf(e,t.fromCache,r,i)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qx(n,e){return B.comparator(n.key,e.key)}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $x{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wE{constructor(){this.mo=!1,this.po=!1,this.yo=100,this.wo=function(){return Qy()?8:wT(ve())>0?6:4}()}initialize(e,t){this.bo=e,this.indexManager=t,this.mo=!0}getDocumentsMatchingQuery(e,t,r,i){const s={result:null};return this.So(e,t).next(o=>{s.result=o}).next(()=>{if(!s.result)return this.vo(e,t,i,r).next(o=>{s.result=o})}).next(()=>{if(s.result)return;const o=new $x;return this.Do(e,t,o).next(a=>{if(s.result=a,this.po)return this.xo(e,t,o,a.size)})}).next(()=>s.result)}xo(e,t,r,i){return Se(t)?R.resolve():r.documentReadCount<this.yo?(Ji()<=ie.DEBUG&&L("QueryEngine","SDK will not create cache indexes for query:",Jo(t),"since it only creates cache indexes for collection contains","more than or equal to",this.yo,"documents"),R.resolve()):(Ji()<=ie.DEBUG&&L("QueryEngine","Query:",Jo(t),"scans",r.documentReadCount,"local documents and returns",i,"documents as results."),r.documentReadCount>this.wo*i?(Ji()<=ie.DEBUG&&L("QueryEngine","The SDK decides to create cache indexes for query:",Jo(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,wt(t))):R.resolve())}So(e,t){if(Se(t))return R.resolve(null);let r=t;if(Gg(r))return R.resolve(null);let i=wt(r);return this.indexManager.getIndexType(e,i).next(s=>s===0?null:(r.limit!==null&&s===1&&(r=mu(r,null,"F"),i=wt(r)),this.indexManager.getDocumentsMatchingTarget(e,i).next(o=>{const a=Z(...o);return this.bo.getDocuments(e,a).next(u=>this.indexManager.getMinOffset(e,i).next(l=>{const h=this.Co(r,u);return this.Fo(r,h,a,l.readTime)?this.So(e,mu(r,null,"F")):this.Oo(e,h,r,l)}))})))}vo(e,t,r,i){return(Se(t)?function(o){for(const a of o.stages){if(a instanceof Nr||a instanceof u_)return!1;if(a instanceof tc){if(a.condition instanceof MT&&a.condition._expr.name==="exists"&&a.condition._expr.params[0]instanceof Oi&&a.condition._expr.params[0].fieldName===hn)continue;return!1}}return!0}(t):Gg(t))||i.isEqual(H.min())?R.resolve(null):this.bo.getDocuments(e,r).next(s=>{const o=this.Co(t,s);return this.Fo(t,o,r,i)?R.resolve(null):(Ji()<=ie.DEBUG&&L("QueryEngine","Re-using previous result from %s to execute query: %s",i.toString(),l_(t)),this.Oo(e,o,t,BI(i,Is)).next(a=>a))})}Co(e,t){let r,i;return Se(e)?(r=new de(qx),i=s=>gl(e,s)):(r=new de(df(e)),i=s=>nl(e,s)),t.forEach((s,o)=>{i(o)&&(r=r.add(o))}),r}Fo(e,t,r,i){if(Se(e))return function(a){return a.stages.some(u=>u instanceof Nr||u instanceof u_)}(e);if(e.limit===null)return!1;if(r.size!==t.size)return!0;const s=e.limitType==="F"?t.last():t.first();return!!s&&(s.hasPendingWrites||s.version.compareTo(i)>0)}Do(e,t,r){return Ji()<=ie.DEBUG&&L("QueryEngine","Using full collection scan to execute query:",l_(t)),this.bo.getDocumentsMatchingQuery(e,t,Mt.min(),r)}Oo(e,t,r,i){return this.bo.getDocumentsMatchingQuery(e,r,i).next(s=>(t.forEach(o=>{s=s.insert(o.key,o)}),s))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Xf="LocalStore",jx=3e8;class zx{constructor(e,t,r,i){this.persistence=e,this.Mo=t,this.serializer=i,this.No=new me(Y),this.Lo=new Yn(s=>ll(s),Lf),this.Bo=new Map,this.Uo=e.getRemoteDocumentCache(),this.A_=e.getTargetCache(),this.d_=e.getBundleCache(),this.ko(r)}ko(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new _E(this.Uo,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.Uo.setIndexManager(this.indexManager),this.Mo.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",t=>e.collect(t,this.No))}}function IE(n,e,t,r){return new zx(n,e,t,r)}function TE(n,e){return p(this,null,function*(){const t=$(n);return yield t.persistence.runTransaction("Handle user change","readonly",r=>{let i;return t.mutationQueue.getAllMutationBatches(r).next(s=>(i=s,t.ko(e),t.mutationQueue.getAllMutationBatches(r))).next(s=>{const o=[],a=[];let u=Z();for(const l of i){o.push(l.batchId);for(const h of l.mutations)u=u.add(h.key)}for(const l of s){a.push(l.batchId);for(const h of l.mutations)u=u.add(h.key)}return t.localDocuments.getDocuments(r,u).next(l=>({qo:l,removedBatchIds:o,addedBatchIds:a}))})})})}function Kx(n,e){const t=$(n);return t.persistence.runTransaction("Acknowledge batch","readwrite-primary",r=>{const i=e.batch.keys(),s=t.Uo.newChangeBuffer({trackRemovals:!0});return function(a,u,l,h){const f=l.batch,g=f.keys();let w=R.resolve();return g.forEach(S=>{w=w.next(()=>h.getEntry(u,S)).next(D=>{const x=l.docVersions.get(S);F(x!==null,48541),D.version.compareTo(x)<0&&(f.applyToRemoteDocument(D,l),D.isValidDocument()&&(D.setReadTime(l.commitVersion),h.addEntry(D)))})}),w.next(()=>a.mutationQueue.removeMutationBatch(u,f))}(t,r,e,s).next(()=>s.apply(r)).next(()=>t.mutationQueue.performConsistencyCheck(r)).next(()=>t.documentOverlayCache.removeOverlaysForBatchId(r,i,e.batch.batchId)).next(()=>t.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(r,function(a){let u=Z();for(let l=0;l<a.mutationResults.length;++l)a.mutationResults[l].transformResults.length>0&&(u=u.add(a.batch.mutations[l].key));return u}(e))).next(()=>t.localDocuments.getDocuments(r,i))})}function EE(n){const e=$(n);return e.persistence.runTransaction("Get last remote snapshot version","readonly",t=>e.A_.getLastRemoteSnapshotVersion(t))}function Gx(n,e){const t=$(n),r=e.snapshotVersion;let i=t.No;return t.persistence.runTransaction("Apply remote event","readwrite-primary",s=>{const o=t.Uo.newChangeBuffer({trackRemovals:!0});i=t.No;const a=[];e.targetChanges.forEach((h,f)=>{const g=i.get(f);if(!g)return;a.push(t.A_.removeMatchingKeys(s,h.removedDocuments,f).next(()=>t.A_.addMatchingKeys(s,h.addedDocuments,f)));let w=g.withSequenceNumber(s.currentSequenceNumber);e.targetMismatches.get(f)!==null?w=w.withResumeToken(Ie.EMPTY_BYTE_STRING,H.min()).withLastLimboFreeSnapshotVersion(H.min()):h.resumeToken.approximateByteSize()>0&&(w=w.withResumeToken(h.resumeToken,r)),i=i.insert(f,w),function(D,x,W){return D.resumeToken.approximateByteSize()===0||x.snapshotVersion.toMicroseconds()-D.snapshotVersion.toMicroseconds()>=jx?!0:W.addedDocuments.size+W.modifiedDocuments.size+W.removedDocuments.size>0}(g,w,h)&&a.push(t.A_.updateTargetData(s,w))});let u=Le(),l=Z();if(e.documentUpdates.forEach(h=>{e.resolvedLimboDocuments.has(h)&&a.push(t.persistence.referenceDelegate.updateLimboDocument(s,h))}),a.push(vE(s,o,e.documentUpdates).next(h=>{u=h.$o,l=h.Ko})),!r.isEqual(H.min())){const h=t.A_.getLastRemoteSnapshotVersion(s).next(f=>t.A_.setTargetsMetadata(s,s.currentSequenceNumber,r));a.push(h)}return R.waitFor(a).next(()=>o.apply(s)).next(()=>t.localDocuments.getLocalViewOfDocuments(s,u,l)).next(()=>u)}).then(s=>(t.No=i,s))}function vE(n,e,t){let r=Z(),i=Z();return t.forEach(s=>r=r.add(s)),e.getEntries(n,r).next(s=>{let o=Le();return t.forEach((a,u)=>{const l=s.get(a);u.isFoundDocument()!==l.isFoundDocument()&&(i=i.add(a)),u.isNoDocument()&&u.version.isEqual(H.min())?(e.removeEntry(a,u.readTime),o=o.insert(a,u)):!l.isValidDocument()||u.version.compareTo(l.version)>0||u.version.compareTo(l.version)===0&&l.hasPendingWrites?(e.addEntry(u),o=o.insert(a,u)):L(Xf,"Ignoring outdated watch update for ",a,". Current version:",l.version," Watch version:",u.version)}),{$o:o,Ko:i}})}function Wx(n,e){const t=$(n);return t.persistence.runTransaction("Get next mutation batch","readonly",r=>(e===void 0&&(e=wr),t.mutationQueue.getNextMutationBatchAfterBatchId(r,e)))}function Ss(n,e){const t=$(n);return t.persistence.runTransaction("Allocate target","readwrite",r=>{let i;return t.A_.getTargetData(r,e).next(s=>s?(i=s,R.resolve(i)):t.A_.allocateTargetId(r).next(o=>(i=new mn(e,o,"TargetPurposeListen",r.currentSequenceNumber),t.A_.addTargetData(r,i).next(()=>i))))}).then(r=>{const i=t.No.get(r.targetId);return(i===null||r.snapshotVersion.compareTo(i.snapshotVersion)>0)&&(t.No=t.No.insert(r.targetId,r),t.Lo.set(e,r.targetId)),r})}function Ps(n,e,t){return p(this,null,function*(){const r=$(n),i=r.No.get(e),s=t?"readwrite":"readwrite-primary";try{t||(yield r.persistence.runTransaction("Release target",s,o=>r.persistence.referenceDelegate.removeTarget(o,i)))}catch(o){if(!Fr(o))throw o;L(Xf,`Failed to update sequence numbers for target ${e}: ${o}`)}r.No=r.No.remove(e),r.Lo.delete(i.target)})}function Su(n,e,t){const r=$(n);let i=H.min(),s=Z();return r.persistence.runTransaction("Execute query","readwrite",o=>function(u,l,h){const f=$(u),g=f.Lo.get(h);return g!==void 0?R.resolve(f.No.get(g)):f.A_.getTargetData(l,h)}(r,o,Se(e)?e:wt(e)).next(a=>{if(a)return i=a.lastLimboFreeSnapshotVersion,r.A_.getMatchingKeysForTargetId(o,a.targetId).next(u=>{s=u})}).next(()=>r.Mo.getDocumentsMatchingQuery(o,e,t?i:H.min(),t?s:Z())).next(a=>(bE(r,a),{documents:a,Qo:s})))}function AE(n,e){var s;const t=$(n),r=$(t.A_),i=t.No.get(e);return i?Promise.resolve((s=i.target)!=null?s:null):t.persistence.runTransaction("Get target data","readonly",o=>r.ge(o,e).next(a=>{var u;return(u=a==null?void 0:a.target)!=null?u:null}))}function ud(n,e){const t=$(n),r=t.Bo.get(e)||H.min();return t.persistence.runTransaction("Get new document changes","readonly",i=>t.Uo.getAllFromCollectionGroup(i,e,BI(r,Is),Number.MAX_SAFE_INTEGER)).then(i=>(bE(t,i),i))}function bE(n,e){e.forEach((t,r)=>{const i=r.key.getCollectionGroup(),s=n.Bo.get(i)||H.min();r.readTime.compareTo(s)>0&&n.Bo.set(i,r.readTime)})}function Hx(n,e,t,r){return p(this,null,function*(){const i=$(n);let s=Z(),o=Le();for(const l of t){const h=e.Wo(l.metadata.name);l.document&&(s=s.add(h));const f=e.Go(l);f.setReadTime(e.zo(l.metadata.readTime)),o=o.insert(h,f)}const a=i.Uo.newChangeBuffer({trackRemovals:!0}),u=yield Ss(i,function(h){return wt(Ks(te.fromString(`__bundle__/docs/${h}`)))}(r));return i.persistence.runTransaction("Apply bundle documents","readwrite",l=>vE(l,a,o).next(h=>(a.apply(l),h)).next(h=>i.A_.removeMatchingKeysForTargetId(l,u.targetId).next(()=>i.A_.addMatchingKeys(l,s,u.targetId)).next(()=>i.localDocuments.getLocalViewOfDocuments(l,h.$o,h.Ko)).next(()=>h.$o)))})}function Qx(r,i){return p(this,arguments,function*(n,e,t=Z()){const s=yield Ss(n,wt(zf(e.bundledQuery))),o=$(n);return o.persistence.runTransaction("Save named query","readwrite",a=>{const u=Ve(e.readTime);if(s.snapshotVersion.compareTo(u)>=0)return o.d_.saveNamedQuery(a,e);const l=s.withResumeToken(Ie.EMPTY_BYTE_STRING,u);return o.No=o.No.insert(l.targetId,l),o.A_.updateTargetData(a,l).next(()=>o.A_.removeMatchingKeysForTargetId(a,s.targetId)).next(()=>o.A_.addMatchingKeys(a,t,s.targetId)).next(()=>o.d_.saveNamedQuery(a,e))})})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jx{constructor(e,t){this.jo=e,this.byteLength=t}Ho(){return"metadata"in this.jo}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function V_(n,e=10240){let t=0;return{read(){return p(this,null,function*(){if(t<n.byteLength){const i={value:n.slice(t,t+e),done:!1};return t+=e,i}return{done:!0}})},cancel(){return p(this,null,function*(){})},releaseLock(){},closed:Promise.resolve()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yx{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.Jo=0,this.Yo=null,this.Zo=!0}Xo(){this.Jo===0&&(this.ea("Unknown"),this.Yo=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this.Yo=null,this.ta("Backend didn't respond within 10 seconds."),this.ea("Offline"),Promise.resolve())))}na(e){this.state==="Online"?this.ea("Unknown"):(this.Jo++,this.Jo>=1&&(this.ra(),this.ta(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.ea("Offline")))}set(e){this.ra(),this.Jo=0,e==="Online"&&(this.Zo=!1),this.ea(e)}ea(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}ta(e){const t=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.Zo?(Ne(t),this.Zo=!1):L("OnlineStateTracker",t)}ra(){this.Yo!==null&&(this.Yo.cancel(),this.Yo=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const An="RemoteStore";class Xx{constructor(e,t,r,i,s){this.localStore=e,this.datastore=t,this.asyncQueue=r,this.remoteSyncer={},this.ia=[],this.sa=new Map,this._a=new Map,this.oa=new Map,this.aa=new $n(1e3),this.ua=new $n(1001),this.ca=new Set,this.la=[],this.Ea=s,this.Ea.Ke(o=>{r.enqueueAndForget(()=>p(this,null,function*(){Ur(this)&&(L(An,"Restarting streams for network reachability change."),yield function(u){return p(this,null,function*(){const l=$(u);l.ca.add(4),yield Qs(l),l.ha.set("Unknown"),l.ca.delete(4),yield sc(l)})}(this))}))}),this.ha=new Yx(r,i)}}function sc(n){return p(this,null,function*(){if(Ur(n))for(const e of n.la)yield e(!0)})}function Qs(n){return p(this,null,function*(){for(const e of n.la)yield e(!1)})}function ld(n,e){return n._a.get(e)||void 0}function yl(n,e){const t=$(n),r=ld(t,e.targetId);if(r!==void 0&&t.sa.has(r))return;const i=function(a,u){const l=ld(a,u);l!==void 0&&a.oa.delete(l);const h=function(g,w){return w%2!=0?g.ua.next():g.aa.next()}(a,u);return a._a.set(u,h),a.oa.set(h,u),h}(t,e.targetId);L(An,"remoteStoreListen mapping SDK target ID to remote",e.targetId,i);const s=new mn(e.target,i,e.purpose,e.sequenceNumber,e.snapshotVersion,e.lastLimboFreeSnapshotVersion,e.resumeToken);t.sa.set(i,s),tp(t)?ep(t):Ys(t).Jt()&&Zf(t,s)}function Cs(n,e){const t=$(n),r=Ys(t),i=ld(t,e);L(An,"remoteStoreUnlisten removing mapping of SDK target ID to remote",e,i),t.sa.delete(i),t._a.delete(e),t.oa.delete(i),r.Jt()&&RE(t,i),t.sa.size===0&&(r.Jt()?r.Xt():Ur(t)&&t.ha.set("Unknown"))}function Zf(n,e){if(n.Ta.H(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(H.min())>0){const t=n.oa.get(e.targetId);if(t===void 0)return void L(An,"SDK target ID not found for remote ID: "+e.targetId);const r=n.remoteSyncer.getRemoteKeysForTarget(t).size;e=e.withExpectedCount(r)}Ys(n).Tn(e)}function RE(n,e){n.Ta.H(e),Ys(n).Pn(e)}function ep(n){n.Ta=new vN({getRemoteKeysForTarget:e=>{const t=n.oa.get(e);return t!==void 0?n.remoteSyncer.getRemoteKeysForTarget(t):Z()},ge:e=>n.sa.get(e)||null,Ae:()=>n.datastore.serializer.databaseId}),Ys(n).start(),n.ha.Xo()}function tp(n){return Ur(n)&&!Ys(n).Ht()&&n.sa.size>0}function Ur(n){return $(n).ca.size===0}function SE(n){n.Ta=void 0}function Zx(n){return p(this,null,function*(){n.ha.set("Online")})}function e0(n){return p(this,null,function*(){n.sa.forEach((e,t)=>{Zf(n,e)})})}function t0(n,e){return p(this,null,function*(){SE(n),tp(n)?(n.ha.na(e),ep(n)):n.ha.set("Unknown")})}function n0(n,e,t){return p(this,null,function*(){if(n.ha.set("Online"),e instanceof YI&&e.state===2&&e.cause)try{yield function(i,s){return p(this,null,function*(){const o=s.cause;for(const a of s.targetIds){if(i.sa.has(a)){const u=i.oa.get(a);u!==void 0&&(yield i.remoteSyncer.rejectListen(u,o),i._a.delete(u),i.oa.delete(a)),i.sa.delete(a)}i.Ta.removeTarget(a)}})}(n,e)}catch(r){L(An,"Failed to remove targets %s: %s ",e.targetIds.join(","),r),yield Pu(n,r)}else if(e instanceof Hc?n.Ta.se(e):e instanceof JI?n.Ta.Ee(e):n.Ta.ae(e),!t.isEqual(H.min()))try{const r=yield EE(n.localStore);t.compareTo(r)>=0&&(yield function(s,o){const a=s.Ta.de(o);a.targetChanges.forEach((l,h)=>{if(l.resumeToken.approximateByteSize()>0){const f=s.sa.get(h);f&&s.sa.set(h,f.withResumeToken(l.resumeToken,o))}}),a.targetMismatches.forEach((l,h)=>{const f=s.sa.get(l);if(!f)return;s.sa.set(l,f.withResumeToken(Ie.EMPTY_BYTE_STRING,f.snapshotVersion)),RE(s,l);const g=new mn(f.target,l,h,f.sequenceNumber);Zf(s,g)});const u=function(h,f){const g=new Map;f.targetChanges.forEach((S,D)=>{const x=h.oa.get(D);x!==void 0&&g.set(x,S)});let w=new me(Y);return f.targetMismatches.forEach((S,D)=>{const x=h.oa.get(S);x!==void 0&&(w=w.insert(x,D))}),new Gs(f.snapshotVersion,g,w,f.documentUpdates,f.augmentedDocumentUpdates,f.resolvedLimboDocuments)}(s,a);return s.remoteSyncer.applyRemoteEvent(u)}(n,t))}catch(r){L(An,"Failed to raise snapshot:",r),yield Pu(n,r)}})}function Pu(n,e,t){return p(this,null,function*(){if(!Fr(e))throw e;n.ca.add(1),yield Qs(n),n.ha.set("Offline"),t||(t=()=>EE(n.localStore)),n.asyncQueue.enqueueRetryable(()=>p(this,null,function*(){L(An,"Retrying IndexedDB access"),yield t(),n.ca.delete(1),yield sc(n)}))})}function PE(n,e){return e().catch(t=>Pu(n,t,e))}function Js(n){return p(this,null,function*(){const e=$(n),t=Dr(e);let r=e.ia.length>0?e.ia[e.ia.length-1].batchId:wr;for(;r0(e);)try{const i=yield Wx(e.localStore,r);if(i===null){e.ia.length===0&&t.Xt();break}r=i.batchId,i0(e,i)}catch(i){yield Pu(e,i)}CE(e)&&kE(e)})}function r0(n){return Ur(n)&&n.ia.length<10}function i0(n,e){n.ia.push(e);const t=Dr(n);t.Jt()&&t.Rn&&t.In(e.mutations)}function CE(n){return Ur(n)&&!Dr(n).Ht()&&n.ia.length>0}function kE(n){Dr(n).start()}function s0(n){return p(this,null,function*(){Dr(n).dn()})}function o0(n){return p(this,null,function*(){const e=Dr(n);for(const t of n.ia)e.In(t.mutations)})}function a0(n,e,t){return p(this,null,function*(){const r=n.ia.shift(),i=Ff.from(r,e,t);yield PE(n,()=>n.remoteSyncer.applySuccessfulWrite(i)),yield Js(n)})}function c0(n,e){return p(this,null,function*(){e&&Dr(n).Rn&&(yield function(r,i){return p(this,null,function*(){if(function(o){return zI(o)&&o!==k.ABORTED}(i.code)){const s=r.ia.shift();Dr(r).Zt(),yield PE(r,()=>r.remoteSyncer.rejectFailedWrite(s.batchId,i)),yield Js(r)}})}(n,e)),CE(n)&&kE(n)})}function D_(n,e){return p(this,null,function*(){const t=$(n);t.asyncQueue.verifyOperationInProgress(),L(An,"RemoteStore received new credentials");const r=Ur(t);t.ca.add(3),yield Qs(t),r&&t.ha.set("Unknown"),yield t.remoteSyncer.handleCredentialChange(e),t.ca.delete(3),yield sc(t)})}function hd(n,e){return p(this,null,function*(){const t=$(n);e?(t.ca.delete(2),yield sc(t)):e||(t.ca.add(2),yield Qs(t),t.ha.set("Unknown"))})}function Ys(n){return n.Pa||(n.Pa=function(t,r,i){const s=$(t);return s.mn(),new HN(r,s.connection,s.authCredentials,s.appCheckCredentials,s.serializer,i)}(n.datastore,n.asyncQueue,{ut:Zx.bind(null,n),lt:e0.bind(null,n),ht:t0.bind(null,n),hn:n0.bind(null,n)}),n.la.push(e=>p(this,null,function*(){e?(n.Pa.Zt(),tp(n)?ep(n):n.ha.set("Unknown")):(yield n.Pa.stop(),SE(n))}))),n.Pa}function Dr(n){return n.Ra||(n.Ra=function(t,r,i){const s=$(t);return s.mn(),new QN(r,s.connection,s.authCredentials,s.appCheckCredentials,s.serializer,i)}(n.datastore,n.asyncQueue,{ut:()=>Promise.resolve(),lt:s0.bind(null,n),ht:c0.bind(null,n),An:o0.bind(null,n),Vn:a0.bind(null,n)}),n.la.push(e=>p(this,null,function*(){e?(n.Ra.Zt(),yield Js(n)):(yield n.Ra.stop(),n.ia.length>0&&(L(An,`Stopping write stream with ${n.ia.length} pending writes`),n.ia=[]))}))),n.Ra}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wl{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Ia(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Ia(this.observer.error,e):Ne("Uncaught Error in snapshot listener:",e.toString()))}Aa(){this.muted=!0}Ia(e,t){setTimeout(()=>{this.muted||e(t)},0)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class np{constructor(e,t,r,i,s){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=r,this.op=i,this.removalCallback=s,this.deferred=new Ze,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(o=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,t,r,i,s){const o=Date.now()+r,a=new np(e,t,o,i,s);return a.start(r),a}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new O(k.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function Xs(n,e){if(Ne("AsyncQueue",`${e}: ${n}`),Fr(n))return new O(k.UNAVAILABLE,`${e}: ${n}`);throw n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class u0{constructor(e,t){this.Va=e,this.serializer=t,this.metadata=new Ze,this.buffer=new Uint8Array,this.da=function(){return new TextDecoder("utf-8")}(),this.fa().then(r=>{r&&r.Ho()?this.metadata.resolve(r.jo.metadata):this.metadata.reject(new Error(`The first element of the bundle is not a metadata, it is
             ${JSON.stringify(r==null?void 0:r.jo)}`))},r=>this.metadata.reject(r))}close(){return this.Va.cancel()}getMetadata(){return p(this,null,function*(){return this.metadata.promise})}ma(){return p(this,null,function*(){return yield this.getMetadata(),this.fa()})}fa(){return p(this,null,function*(){const e=yield this.pa();if(e===null)return null;const t=this.da.decode(e),r=Number(t);isNaN(r)&&this.ga(`length string (${t}) is not valid number`);const i=yield this.ya(r);return new Jx(JSON.parse(i),e.length+r)})}wa(){return this.buffer.findIndex(e=>e===123)}pa(){return p(this,null,function*(){for(;this.wa()<0&&!(yield this.ba()););if(this.buffer.length===0)return null;const e=this.wa();e<0&&this.ga("Reached the end of bundle when a length string is expected.");const t=this.buffer.slice(0,e);return this.buffer=this.buffer.slice(e),t})}ya(e){return p(this,null,function*(){for(;this.buffer.length<e;)(yield this.ba())&&this.ga("Reached the end of bundle when more is expected.");const t=this.da.decode(this.buffer.slice(0,e));return this.buffer=this.buffer.slice(e),t})}ga(e){throw this.Va.cancel(),new Error(`Invalid bundle format: ${e}`)}ba(){return p(this,null,function*(){const e=yield this.Va.read();if(!e.done){const t=new Uint8Array(this.buffer.length+e.value.length);t.set(this.buffer),t.set(e.value,this.buffer.length),this.buffer=t}return e.done})}}const ra="IndexBackfiller";class l0{constructor(e,t){this.asyncQueue=e,this.va=t,this.task=null}start(){this.Da(15e3)}stop(){this.task&&(this.task.cancel(),this.task=null)}get started(){return this.task!==null}Da(e){L(ra,`Scheduled in ${e}ms`),this.task=this.asyncQueue.enqueueAfterDelay("index_backfill",e,()=>p(this,null,function*(){this.task=null;try{const t=yield this.va.xa();L(ra,`Documents written: ${t}`)}catch(t){Fr(t)?L(ra,"Ignoring IndexedDB error during index backfill: ",t):yield Mr(t)}yield this.Da(6e4)}))}}class h0{constructor(e,t){this.localStore=e,this.persistence=t}xa(e=50){return p(this,null,function*(){return this.persistence.runTransaction("Backfill Indexes","readwrite-primary",t=>this.Ca(t,e))})}Ca(e,t){const r=new Set;let i=t,s=!0;return R.doWhile(()=>s===!0&&i>0,()=>this.localStore.indexManager.getNextCollectionGroupToUpdate(e).next(o=>{if(o!==null&&!r.has(o))return L(ra,`Processing collection: ${o}`),this.Fa(e,o,i).next(a=>{i-=a,r.add(o)});s=!1})).next(()=>t-i)}Fa(e,t,r){return this.localStore.indexManager.getMinOffsetFromCollectionGroup(e,t).next(i=>this.localStore.localDocuments.getNextDocuments(e,t,i,r).next(s=>{const o=s.changes;return this.localStore.indexManager.updateIndexEntries(e,o).next(()=>this.Oa(i,s)).next(a=>(L(ra,`Updating offset: ${a}`),this.localStore.indexManager.updateCollectionGroup(e,t,a))).next(()=>o.size)}))}Oa(e,t){let r=e;return t.changes.forEach((i,s)=>{const o=qI(s);cf(o,r)>0&&(r=o)}),new Mt(r.readTime,r.documentKey,Math.max(t.batchId,e.largestBatchId))}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const NE="firestore_clients";function x_(n,e){return`${NE}_${n}_${e}`}const VE="firestore_mutations";function O_(n,e,t){let r=`${VE}_${n}_${t}`;return e.isAuthenticated()&&(r+=`_${e.uid}`),r}const DE="firestore_targets";function wh(n,e){return`${DE}_${n}_${e}`}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const rn="SharedClientState";class Cu{constructor(e,t,r,i){this.user=e,this.batchId=t,this.state=r,this.error=i}static Ma(e,t,r){const i=JSON.parse(r);let s,o=typeof i=="object"&&["pending","acknowledged","rejected"].indexOf(i.state)!==-1&&(i.error===void 0||typeof i.error=="object");return o&&i.error&&(o=typeof i.error.message=="string"&&typeof i.error.code=="string",o&&(s=new O(i.error.code,i.error.message))),o?new Cu(e,t,i.state,s):(Ne(rn,`Failed to parse mutation state for ID '${t}': ${r}`),null)}Na(){const e={state:this.state,updateTimeMs:Date.now()};return this.error&&(e.error={code:this.error.code,message:this.error.message}),JSON.stringify(e)}}class ia{constructor(e,t,r){this.targetId=e,this.state=t,this.error=r}static Ma(e,t){const r=JSON.parse(t);let i,s=typeof r=="object"&&["not-current","current","rejected"].indexOf(r.state)!==-1&&(r.error===void 0||typeof r.error=="object");return s&&r.error&&(s=typeof r.error.message=="string"&&typeof r.error.code=="string",s&&(i=new O(r.error.code,r.error.message))),s?new ia(e,r.state,i):(Ne(rn,`Failed to parse target state for ID '${e}': ${t}`),null)}Na(){const e={state:this.state,updateTimeMs:Date.now()};return this.error&&(e.error={code:this.error.code,message:this.error.message}),JSON.stringify(e)}}class ku{constructor(e,t){this.clientId=e,this.activeTargetIds=t}static Ma(e,t){const r=JSON.parse(t);let i=typeof r=="object"&&r.activeTargetIds instanceof Array,s=ff();for(let o=0;i&&o<r.activeTargetIds.length;++o)i=EI(r.activeTargetIds[o]),s=s.add(r.activeTargetIds[o]);return i?new ku(e,s):(Ne(rn,`Failed to parse client data for instance '${e}': ${t}`),null)}}class rp{constructor(e,t){this.clientId=e,this.onlineState=t}static Ma(e){const t=JSON.parse(e);return typeof t=="object"&&["Unknown","Online","Offline"].indexOf(t.onlineState)!==-1&&typeof t.clientId=="string"?new rp(t.clientId,t.onlineState):(Ne(rn,`Failed to parse online state: ${e}`),null)}}class dd{constructor(){this.activeTargetIds=ff()}La(e){this.activeTargetIds=this.activeTargetIds.add(e)}Ba(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Na(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class Ih{constructor(e,t,r,i,s){this.window=e,this.xt=t,this.persistenceKey=r,this.Ua=i,this.syncEngine=null,this.onlineStateHandler=null,this.sequenceNumberHandler=null,this.ka=this.qa.bind(this),this.$a=new me(Y),this.started=!1,this.Ka=[];const o=r.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");this.storage=this.window.localStorage,this.currentUser=s,this.Qa=x_(this.persistenceKey,this.Ua),this.Wa=function(u){return`firestore_sequence_number_${u}`}(this.persistenceKey),this.$a=this.$a.insert(this.Ua,new dd),this.Ga=new RegExp(`^${NE}_${o}_([^_]*)$`),this.za=new RegExp(`^${VE}_${o}_(\\d+)(?:_(.*))?$`),this.ja=new RegExp(`^${DE}_${o}_(\\d+)$`),this.Ha=function(u){return`firestore_online_state_${u}`}(this.persistenceKey),this.Ja=function(u){return`firestore_bundle_loaded_v2_${u}`}(this.persistenceKey),this.window.addEventListener("storage",this.ka)}static Je(e){return!(!e||!e.localStorage)}start(){return p(this,null,function*(){const e=yield this.syncEngine.Ro();for(const r of e){if(r===this.Ua)continue;const i=this.getItem(x_(this.persistenceKey,r));if(i){const s=ku.Ma(r,i);s&&(this.$a=this.$a.insert(s.clientId,s))}}this.Ya();const t=this.storage.getItem(this.Ha);if(t){const r=this.Za(t);r&&this.Xa(r)}for(const r of this.Ka)this.qa(r);this.Ka=[],this.window.addEventListener("pagehide",()=>this.shutdown()),this.started=!0})}writeSequenceNumber(e){this.setItem(this.Wa,JSON.stringify(e))}getAllActiveQueryTargets(){return this.eu(this.$a)}isActiveQueryTarget(e){let t=!1;return this.$a.forEach((r,i)=>{i.activeTargetIds.has(e)&&(t=!0)}),t}addPendingMutation(e){this.tu(e,"pending")}updateMutationState(e,t,r){this.tu(e,t,r),this.nu(e)}addLocalQueryTarget(e,t=!0){let r="not-current";if(this.isActiveQueryTarget(e)){const i=this.storage.getItem(wh(this.persistenceKey,e));if(i){const s=ia.Ma(e,i);s&&(r=s.state)}}return t&&this.ru.La(e),this.Ya(),r}removeLocalQueryTarget(e){this.ru.Ba(e),this.Ya()}isLocalQueryTarget(e){return this.ru.activeTargetIds.has(e)}clearQueryState(e){this.removeItem(wh(this.persistenceKey,e))}updateQueryState(e,t,r){this.iu(e,t,r)}handleUserChange(e,t,r){t.forEach(i=>{this.nu(i)}),this.currentUser=e,r.forEach(i=>{this.addPendingMutation(i)})}setOnlineState(e){this.su(e)}notifyBundleLoaded(e){this._u(e)}shutdown(){this.started&&(this.window.removeEventListener("storage",this.ka),this.removeItem(this.Qa),this.started=!1)}getItem(e){const t=this.storage.getItem(e);return L(rn,"READ",e,t),t}setItem(e,t){L(rn,"SET",e,t),this.storage.setItem(e,t)}removeItem(e){L(rn,"REMOVE",e),this.storage.removeItem(e)}qa(e){const t=e;if(t.storageArea===this.storage){if(L(rn,"EVENT",t.key,t.newValue),t.key===this.Qa)return void Ne("Received WebStorage notification for local change. Another client might have garbage-collected our state");this.xt.enqueueRetryable(()=>p(this,null,function*(){if(this.started){if(t.key!==null){if(this.Ga.test(t.key)){if(t.newValue==null){const r=this.ou(t.key);return this.au(r,null)}{const r=this.uu(t.key,t.newValue);if(r)return this.au(r.clientId,r)}}else if(this.za.test(t.key)){if(t.newValue!==null){const r=this.cu(t.key,t.newValue);if(r)return this.lu(r)}}else if(this.ja.test(t.key)){if(t.newValue!==null){const r=this.Eu(t.key,t.newValue);if(r)return this.hu(r)}}else if(t.key===this.Ha){if(t.newValue!==null){const r=this.Za(t.newValue);if(r)return this.Xa(r)}}else if(t.key===this.Wa){const r=function(s){let o=Rt.yn;if(s!=null)try{const a=JSON.parse(s);F(typeof a=="number",30636,{Tu:s}),o=a}catch(a){Ne(rn,"Failed to read sequence number from WebStorage",a)}return o}(t.newValue);r!==Rt.yn&&this.sequenceNumberHandler(r)}else if(t.key===this.Ja){const r=this.Pu(t.newValue);yield Promise.all(r.map(i=>this.syncEngine.Ru(i)))}}}else this.Ka.push(t)}))}}get ru(){return this.$a.get(this.Ua)}Ya(){this.setItem(this.Qa,this.ru.Na())}tu(e,t,r){const i=new Cu(this.currentUser,e,t,r),s=O_(this.persistenceKey,this.currentUser,e);this.setItem(s,i.Na())}nu(e){const t=O_(this.persistenceKey,this.currentUser,e);this.removeItem(t)}su(e){const t={clientId:this.Ua,onlineState:e};this.storage.setItem(this.Ha,JSON.stringify(t))}iu(e,t,r){const i=wh(this.persistenceKey,e),s=new ia(e,t,r);this.setItem(i,s.Na())}_u(e){const t=JSON.stringify(Array.from(e));this.setItem(this.Ja,t)}ou(e){const t=this.Ga.exec(e);return t?t[1]:null}uu(e,t){const r=this.ou(e);return ku.Ma(r,t)}cu(e,t){const r=this.za.exec(e),i=Number(r[1]),s=r[2]!==void 0?r[2]:null;return Cu.Ma(new He(s),i,t)}Eu(e,t){const r=this.ja.exec(e),i=Number(r[1]);return ia.Ma(i,t)}Za(e){return rp.Ma(e)}Pu(e){return JSON.parse(e)}lu(e){return p(this,null,function*(){if(e.user.uid===this.currentUser.uid)return this.syncEngine.Iu(e.batchId,e.state,e.error);L(rn,`Ignoring mutation for non-active user ${e.user.uid}`)})}hu(e){return this.syncEngine.Au(e.targetId,e.state,e.error)}au(e,t){const r=t?this.$a.insert(e,t):this.$a.remove(e),i=this.eu(this.$a),s=this.eu(r),o=[],a=[];return s.forEach(u=>{i.has(u)||o.push(u)}),i.forEach(u=>{s.has(u)||a.push(u)}),this.syncEngine.Vu(o,a).then(()=>{this.$a=r})}Xa(e){this.$a.get(e.clientId)&&this.onlineStateHandler(e.onlineState)}eu(e){let t=ff();return e.forEach((r,i)=>{t=t.unionWith(i.activeTargetIds)}),t}}class xE{constructor(){this.du=new dd,this.fu={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,r){}addLocalQueryTarget(e,t=!0){return t&&this.du.La(e),this.fu[e]||"not-current"}updateQueryState(e,t,r){this.fu[e]=t}removeLocalQueryTarget(e){this.du.Ba(e)}isLocalQueryTarget(e){return this.du.activeTargetIds.has(e)}clearQueryState(e){delete this.fu[e]}getAllActiveQueryTargets(){return this.du.activeTargetIds}isActiveQueryTarget(e){return this.du.activeTargetIds.has(e)}start(){return this.du=new dd,Promise.resolve()}handleUserChange(e,t,r){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function OE(){return typeof window!="undefined"?window:null}function eu(){return typeof document!="undefined"?document:null}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fi{static emptySet(e){return new fi(e.comparator)}constructor(e){this.comparator=e?(t,r)=>e(t,r)||B.comparator(t.key,r.key):(t,r)=>B.comparator(t.key,r.key),this.keyedMap=Yr(),this.sortedSet=new me(this.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((t,r)=>(e(t),!1))}add(e){const t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){const t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof fi)||this.size!==e.size)return!1;const t=this.sortedSet.getIterator(),r=e.sortedSet.getIterator();for(;t.hasNext();){const i=t.getNext().key,s=r.getNext().key;if(!i.isEqual(s))return!1}return!0}toString(){const e=[];return this.forEach(t=>{e.push(t.toString())}),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,t){const r=new fi;return r.comparator=this.comparator,r.keyedMap=e,r.sortedSet=t,r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class L_{constructor(){this.mu=new me(B.comparator)}track(e){const t=e.doc.key,r=this.mu.get(t);r?e.type!==0&&r.type===3?this.mu=this.mu.insert(t,e):e.type===3&&r.type!==1?this.mu=this.mu.insert(t,{type:r.type,doc:e.doc}):e.type===2&&r.type===2?this.mu=this.mu.insert(t,{type:2,doc:e.doc}):e.type===2&&r.type===0?this.mu=this.mu.insert(t,{type:0,doc:e.doc}):e.type===1&&r.type===0?this.mu=this.mu.remove(t):e.type===1&&r.type===2?this.mu=this.mu.insert(t,{type:1,doc:r.doc}):e.type===0&&r.type===1?this.mu=this.mu.insert(t,{type:2,doc:e.doc}):j(63341,{ye:e,pu:r}):this.mu=this.mu.insert(t,e)}gu(){const e=[];return this.mu.inorderTraversal((t,r)=>{e.push(r)}),e}}class ks{constructor(e,t,r,i,s,o,a,u,l){this.query=e,this.docs=t,this.oldDocs=r,this.docChanges=i,this.mutatedKeys=s,this.fromCache=o,this.syncStateChanged=a,this.excludesMetadataChanges=u,this.hasCachedResults=l}static fromInitialDocuments(e,t,r,i,s){const o=[];return t.forEach(a=>{o.push({type:0,doc:a})}),new ks(e,t,fi.emptySet(t),o,r,i,!0,!1,s)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&ul(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const t=this.docChanges,r=e.docChanges;if(t.length!==r.length)return!1;for(let i=0;i<t.length;i++)if(t[i].type!==r[i].type||!t[i].doc.isEqual(r[i].doc))return!1;return!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class d0{constructor(){this.yu=void 0,this.wu=[]}bu(){return this.wu.some(e=>e.Su())}}class f0{constructor(){this.queries=M_(),this.onlineState="Unknown",this.vu=new Set}terminate(){(function(t,r){const i=$(t),s=i.queries;i.queries=M_(),s.forEach((o,a)=>{for(const u of a.wu)u.onError(r)})})(this,new O(k.ABORTED,"Firestore shutting down"))}}function M_(){return new Yn(n=>QT(n),ul)}function ip(n,e){return p(this,null,function*(){const t=$(n);let r=3;const i=e.query;let s=t.queries.get(i);s?!s.bu()&&e.Su()&&(r=2):(s=new d0,r=e.Su()?0:1);try{switch(r){case 0:s.yu=yield t.onListen(i,!0);break;case 1:s.yu=yield t.onListen(i,!1);break;case 2:yield t.onFirstRemoteStoreListen(i)}}catch(o){const a=Xs(o,`Initialization of query '${Se(e.query)?xn(e.query):Jo(e.query)}' failed`);return void e.onError(a)}t.queries.set(i,s),s.wu.push(e),e.Du(t.onlineState),s.yu&&e.xu(s.yu)&&op(t)})}function sp(n,e){return p(this,null,function*(){const t=$(n),r=e.query;let i=3;const s=t.queries.get(r);if(s){const o=s.wu.indexOf(e);o>=0&&(s.wu.splice(o,1),s.wu.length===0?i=e.Su()?0:1:!s.bu()&&e.Su()&&(i=2))}switch(i){case 0:return t.queries.delete(r),t.onUnlisten(r,!0);case 1:return t.queries.delete(r),t.onUnlisten(r,!1);case 2:return t.onLastRemoteStoreUnlisten(r);default:return}})}function p0(n,e){const t=$(n);let r=!1;for(const i of e){const s=i.query,o=t.queries.get(s);if(o){for(const a of o.wu)a.xu(i)&&(r=!0);o.yu=i}}r&&op(t)}function m0(n,e,t){const r=$(n),i=r.queries.get(e);if(i)for(const s of i.wu)s.onError(t);r.queries.delete(e)}function op(n){n.vu.forEach(e=>{e.next()})}var fd;(function(n){n.Default="default",n.Cache="cache"})(fd||(fd={}));class ap{constructor(e,t,r){this.query=e,this.Cu=t,this.Fu=!1,this.Ou=null,this.onlineState="Unknown",this.options=r||{}}xu(e){if(!this.options.includeMetadataChanges){const r=[];for(const i of e.docChanges)i.type!==3&&r.push(i);e=new ks(e.query,e.docs,e.oldDocs,r,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.Fu?this.Mu(e)&&(this.Cu.next(e),t=!0):this.Nu(e,this.onlineState)&&(this.Lu(e),t=!0),this.Ou=e,t}onError(e){this.Cu.error(e)}Du(e){this.onlineState=e;let t=!1;return this.Ou&&!this.Fu&&this.Nu(this.Ou,e)&&(this.Lu(this.Ou),t=!0),t}Nu(e,t){if(!e.fromCache||!this.Su())return!0;const r=t!=="Offline";return(!this.options.waitForSyncWhenOnline||!r)&&(!e.docs.isEmpty()||e.hasCachedResults||t==="Offline")}Mu(e){if(e.docChanges.length>0)return!0;const t=this.Ou&&this.Ou.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&this.options.includeMetadataChanges===!0}Lu(e){e=ks.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.Fu=!0,this.Cu.next(e)}Su(){return this.options.source!==fd.Cache}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class F_{constructor(e){this.serializer=e}Wo(e){return _n(this.serializer,e)}Go(e){return e.metadata.exists?rT(this.serializer,e.document,!1):we.newNoDocument(this.Wo(e.metadata.name),this.zo(e.metadata.readTime))}zo(e){return Ve(e)}}class g0{constructor(e,t){this.Bu=e,this.serializer=t,this.Uu=[],this.ku=[],this.collectionGroups=new Set,this.progress=LE(e)}get queries(){return this.Uu}get documents(){return this.ku}qu(e){this.progress.bytesLoaded+=e.byteLength;let t=this.progress.documentsLoaded;if(e.jo.namedQuery)this.Uu.push(e.jo.namedQuery);else if(e.jo.documentMetadata){this.ku.push({metadata:e.jo.documentMetadata}),e.jo.documentMetadata.exists||++t;const r=te.fromString(e.jo.documentMetadata.name);this.collectionGroups.add(r.get(r.length-2))}else e.jo.document&&(this.ku[this.ku.length-1].document=e.jo.document,++t);return t!==this.progress.documentsLoaded?(this.progress.documentsLoaded=t,G({},this.progress)):null}$u(e){const t=new Map,r=new F_(this.serializer);for(const i of e)if(i.metadata.queries){const s=r.Wo(i.metadata.name);for(const o of i.metadata.queries){const a=(t.get(o)||Z()).add(s);t.set(o,a)}}return t}Ku(e){return p(this,null,function*(){const t=yield Hx(e,new F_(this.serializer),this.ku,this.Bu.id),r=this.$u(this.documents);for(const i of this.Uu)yield Qx(e,i,r.get(i.name));return this.progress.taskState="Success",{progress:this.progress,Qu:this.collectionGroups,Wu:t}})}}function LE(n){return{taskState:"Running",documentsLoaded:0,bytesLoaded:0,totalDocuments:n.totalDocuments,totalBytes:n.totalBytes}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ME{constructor(e){this.key=e}}class FE{constructor(e){this.key=e}}class UE{constructor(e,t){this.query=e,this.Gu=t,this.zu=null,this.hasCachedResults=!1,this.current=!1,this.ju=Z(),this.mutatedKeys=Z(),this.Hu=Se(e)?cd(e):df(e),this.Ju=new fi(this.Hu)}get Yu(){return this.Gu}Zu(e,t){const r=t?t.Xu:new L_,i=t?t.Ju:this.Ju;let s=t?t.mutatedKeys:this.mutatedKeys,o=i,a=!1;const[u,l]=this.ec(this.query,i);e.inorderTraversal((f,g)=>{const w=i.get(f),S=pE(this.query,g)?g:null,D=!!w&&this.mutatedKeys.has(w.key),x=!!S&&(S.hasLocalMutations||this.mutatedKeys.has(S.key)&&S.hasCommittedMutations);let W=!1;w&&S?w.data.isEqual(S.data)?D!==x&&(r.track({type:3,doc:S}),W=!0):this.tc(w,S)||(r.track({type:2,doc:S}),W=!0,(u&&this.Hu(S,u)>0||l&&this.Hu(S,l)<0)&&(a=!0)):!w&&S?(r.track({type:0,doc:S}),W=!0):w&&!S&&(r.track({type:1,doc:w}),W=!0,(u||l)&&(a=!0)),W&&(S?(o=o.add(S),s=x?s.add(f):s.delete(f)):(o=o.delete(f),s=s.delete(f)))});const h=this.nc(this.query);if(h)if(Se(this.query)){const f=[];o.forEach(S=>f.push(S));const g=fE(this.query,f);let w=new fi(cd(this.query));for(const S of g)w=w.add(S);o.forEach(S=>{w.has(S.key)||(s=s.delete(S.key),r.track({type:1,doc:S}))}),o=w}else{const f=this.rc(this.query);for(;o.size>h;){const g=f==="F"?o.last():o.first();o=o.delete(g.key),s=s.delete(g.key),r.track({type:1,doc:g})}}return{Ju:o,Xu:r,Fo:a,mutatedKeys:s}}nc(e){var t;return Se(e)?(t=mh(e))==null?void 0:t.limit:e.limit||void 0}rc(e){if(Se(e)){const t=mh(e);return t&&t.limit<0?"L":"F"}return e.limitType}ec(e,t){var r;if(Se(e)){const i=(r=mh(e))==null?void 0:r.limit;return[t.size===i?t.last():null,null]}return[e.limitType==="F"&&t.size===this.nc(this.query)?t.last():null,e.limitType==="L"&&t.size===this.nc(this.query)?t.first():null]}tc(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,r,i){const s=this.Ju;this.Ju=e.Ju,this.mutatedKeys=e.mutatedKeys;const o=e.Xu.gu();o.sort((h,f)=>function(w,S){const D=x=>{switch(x){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return j(20277,{ye:x})}};return D(w)-D(S)}(h.type,f.type)||this.Hu(h.doc,f.doc)),this.sc(r),i=i!=null?i:!1;const a=t&&!i?this._c():[],u=this.ju.size===0&&this.current&&!i?1:0,l=u!==this.zu;return this.zu=u,o.length!==0||l?{snapshot:new ks(this.query,e.Ju,s,o,e.mutatedKeys,u===0,l,!1,!!r&&r.resumeToken.approximateByteSize()>0),oc:a}:{oc:a}}Du(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({Ju:this.Ju,Xu:new L_,mutatedKeys:this.mutatedKeys,Fo:!1},!1)):{oc:[]}}ac(e){return!this.Gu.has(e)&&!!this.Ju.has(e)&&!this.Ju.get(e).hasLocalMutations}sc(e){e&&(e.addedDocuments.forEach(t=>this.Gu=this.Gu.add(t)),e.modifiedDocuments.forEach(t=>{}),e.removedDocuments.forEach(t=>this.Gu=this.Gu.delete(t)),this.current=e.current)}_c(){if(!this.current)return[];const e=this.ju;this.ju=Z(),this.Ju.forEach(r=>{this.ac(r.key)&&(this.ju=this.ju.add(r.key))});const t=[];return e.forEach(r=>{this.ju.has(r)||t.push(new FE(r))}),this.ju.forEach(r=>{e.has(r)||t.push(new ME(r))}),t}uc(e){this.Gu=e.Qo,this.ju=Z();const t=this.Zu(e.documents);return this.applyChanges(t,!0)}cc(){return ks.fromInitialDocuments(this.query,this.Ju,this.mutatedKeys,this.zu===0,this.hasCachedResults)}}const Br="SyncEngine";class _0{constructor(e,t,r){this.query=e,this.targetId=t,this.view=r}}class y0{constructor(e){this.key=e,this.lc=!1}}class w0{constructor(e,t,r,i,s,o){this.localStore=e,this.remoteStore=t,this.eventManager=r,this.sharedClientState=i,this.currentUser=s,this.maxConcurrentLimboResolutions=o,this.Ec={},this.hc=new Yn(a=>QT(a),ul),this.Tc=new Map,this.Pc=new Set,this.Rc=new me(B.comparator),this.Ic=new Map,this.Ac=new Wf,this.Vc={},this.dc=new Map,this.fc=$n.ws(),this.onlineState="Unknown",this.mc=void 0}get isPrimaryClient(){return this.mc===!0}}function I0(n,e,t=!0){return p(this,null,function*(){const r=Il(n);let i;const s=r.hc.get(e);return s?(r.sharedClientState.addLocalQueryTarget(s.targetId),i=s.view.cc()):i=yield BE(r,e,t,!0),i})}function T0(n,e){return p(this,null,function*(){const t=Il(n);yield BE(t,e,!0,!1)})}function BE(n,e,t,r){return p(this,null,function*(){const i=yield Ss(n.localStore,Se(e)?e:wt(e)),s=i.targetId,o=n.sharedClientState.addLocalQueryTarget(s,t);let a;return r&&(a=yield cp(n,e,s,o==="current",i.resumeToken)),n.isPrimaryClient&&t&&yl(n.remoteStore,i),a})}function cp(n,e,t,r,i){return p(this,null,function*(){n.gc=(f,g,w)=>function(D,x,W,Q){return p(this,null,function*(){let K=x.view.Zu(W);K.Fo&&(K=yield Su(D.localStore,x.query,!1).then(({documents:E})=>x.view.Zu(E,K)));const X=Q&&Q.targetChanges.get(x.targetId),ee=Q&&Q.targetMismatches.get(x.targetId)!=null,ne=x.view.applyChanges(K,D.isPrimaryClient,X,ee);return pd(D,x.targetId,ne.oc),ne.snapshot})}(n,f,g,w);const s=yield Su(n.localStore,e,!0),o=new UE(e,s.Qo),a=o.Zu(s.documents),u=Qa.createSynthesizedTargetChangeForCurrentChange(t,r&&n.onlineState!=="Offline",i),l=o.applyChanges(a,n.isPrimaryClient,u);pd(n,t,l.oc);const h=new _0(e,t,o);return n.hc.set(e,h),n.Tc.has(t)?n.Tc.get(t).push(e):n.Tc.set(t,[e]),l.snapshot})}function E0(n,e,t){return p(this,null,function*(){const r=$(n),i=r.hc.get(e),s=r.Tc.get(i.targetId);if(s.length>1)return r.Tc.set(i.targetId,s.filter(o=>!ul(o,e))),void r.hc.delete(e);r.isPrimaryClient?(r.sharedClientState.removeLocalQueryTarget(i.targetId),r.sharedClientState.isActiveQueryTarget(i.targetId)||(yield Ps(r.localStore,i.targetId,!1).then(()=>{r.sharedClientState.clearQueryState(i.targetId),t&&Cs(r.remoteStore,i.targetId),Ns(r,i.targetId)}).catch(Mr))):(Ns(r,i.targetId),yield Ps(r.localStore,i.targetId,!0))})}function v0(n,e){return p(this,null,function*(){const t=$(n),r=t.hc.get(e),i=t.Tc.get(r.targetId);t.isPrimaryClient&&i.length===1&&(t.sharedClientState.removeLocalQueryTarget(r.targetId),Cs(t.remoteStore,r.targetId))})}function A0(n,e,t){return p(this,null,function*(){const r=dp(n);try{const i=yield function(o,a){const u=$(o),l=le.now(),h=a.reduce((w,S)=>w.add(S.key),Z());let f,g;return u.persistence.runTransaction("Locally write mutations","readwrite",w=>{let S=Le(),D=Z();return u.Uo.getEntries(w,h).next(x=>{S=x,S.forEach((W,Q)=>{Q.isValidDocument()||(D=D.add(W))})}).next(()=>u.localDocuments.getOverlayedDocuments(w,S)).next(x=>{f=x;const W=[];for(const Q of a){const K=nN(Q,f.get(Q.key).overlayedDocument);K!=null&&W.push(new Qn(Q.key,K,RI(K.value.mapValue),Ee.exists(!0)))}return u.mutationQueue.addMutationBatch(w,l,W,a)}).next(x=>{g=x;const W=x.applyToLocalDocumentSet(f,D);return u.documentOverlayCache.saveOverlays(w,x.batchId,W)})}).then(()=>({batchId:g.batchId,changes:WI(f)}))}(r.localStore,e);r.sharedClientState.addPendingMutation(i.batchId),function(o,a,u){let l=o.Vc[o.currentUser.toKey()];l||(l=new me(Y)),l=l.insert(a,u),o.Vc[o.currentUser.toKey()]=l}(r,i.batchId,t),yield Xn(r,i.changes),yield Js(r.remoteStore)}catch(i){const s=Xs(i,"Failed to persist write");t.reject(s)}})}function qE(n,e){return p(this,null,function*(){const t=$(n);try{const r=yield Gx(t.localStore,e);e.targetChanges.forEach((i,s)=>{const o=t.Ic.get(s);o&&(F(i.addedDocuments.size+i.modifiedDocuments.size+i.removedDocuments.size<=1,22616),i.addedDocuments.size>0?o.lc=!0:i.modifiedDocuments.size>0?F(o.lc,14607):i.removedDocuments.size>0&&(F(o.lc,42227),o.lc=!1))}),yield Xn(t,r,e)}catch(r){yield Mr(r)}})}function U_(n,e,t){const r=$(n);if(r.isPrimaryClient&&t===0||!r.isPrimaryClient&&t===1){const i=[];r.hc.forEach((s,o)=>{const a=o.view.Du(e);a.snapshot&&i.push(a.snapshot)}),function(o,a){const u=$(o);u.onlineState=a;let l=!1;u.queries.forEach((h,f)=>{for(const g of f.wu)g.Du(a)&&(l=!0)}),l&&op(u)}(r.eventManager,e),i.length&&r.Ec.hn(i),r.onlineState=e,r.isPrimaryClient&&r.sharedClientState.setOnlineState(e)}}function b0(n,e,t){return p(this,null,function*(){const r=$(n);r.sharedClientState.updateQueryState(e,"rejected",t);const i=r.Ic.get(e),s=i&&i.key;if(s){let o=new me(B.comparator);o=o.insert(s,we.newNoDocument(s,H.min()));const a=Z().add(s),u=new Gs(H.min(),new Map,new me(Y),o,Le(),a);yield qE(r,u),r.Rc=r.Rc.remove(s),r.Ic.delete(e),hp(r)}else yield Ps(r.localStore,e,!1).then(()=>Ns(r,e,t)).catch(Mr)})}function R0(n,e){return p(this,null,function*(){const t=$(n),r=e.batch.batchId;try{const i=yield Kx(t.localStore,e);lp(t,r,null),up(t,r),t.sharedClientState.updateMutationState(r,"acknowledged"),yield Xn(t,i)}catch(i){yield Mr(i)}})}function S0(n,e,t){return p(this,null,function*(){const r=$(n);try{const i=yield function(o,a){const u=$(o);return u.persistence.runTransaction("Reject batch","readwrite-primary",l=>{let h;return u.mutationQueue.lookupMutationBatch(l,a).next(f=>(F(f!==null,37113),h=f.keys(),u.mutationQueue.removeMutationBatch(l,f))).next(()=>u.mutationQueue.performConsistencyCheck(l)).next(()=>u.documentOverlayCache.removeOverlaysForBatchId(l,h,a)).next(()=>u.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(l,h)).next(()=>u.localDocuments.getDocuments(l,h))})}(r.localStore,e);lp(r,e,t),up(r,e),r.sharedClientState.updateMutationState(e,"rejected",t),yield Xn(r,i)}catch(i){yield Mr(i)}})}function P0(n,e){return p(this,null,function*(){const t=$(n);Ur(t.remoteStore)||L(Br,"The network is disabled. The task returned by 'awaitPendingWrites()' will not complete until the network is enabled.");try{const r=yield function(o){const a=$(o);return a.persistence.runTransaction("Get highest unacknowledged batch id","readonly",u=>a.mutationQueue.getHighestUnacknowledgedBatchId(u))}(t.localStore);if(r===wr)return void e.resolve();const i=t.dc.get(r)||[];i.push(e),t.dc.set(r,i)}catch(r){const i=Xs(r,"Initialization of waitForPendingWrites() operation failed");e.reject(i)}})}function up(n,e){(n.dc.get(e)||[]).forEach(t=>{t.resolve()}),n.dc.delete(e)}function lp(n,e,t){const r=$(n);let i=r.Vc[r.currentUser.toKey()];if(i){const s=i.get(e);s&&(t?s.reject(t):s.resolve(),i=i.remove(e)),r.Vc[r.currentUser.toKey()]=i}}function Ns(n,e,t=null){n.sharedClientState.removeLocalQueryTarget(e);for(const r of n.Tc.get(e))n.hc.delete(r),t&&n.Ec.yc(r,t);n.Tc.delete(e),n.isPrimaryClient&&n.Ac.Xs(e).forEach(r=>{n.Ac.containsKey(r)||$E(n,r)})}function $E(n,e){n.Pc.delete(e.path.canonicalString());const t=n.Rc.get(e);t!==null&&(Cs(n.remoteStore,t),n.Rc=n.Rc.remove(e),n.Ic.delete(t),hp(n))}function pd(n,e,t){for(const r of t)r instanceof ME?(n.Ac.addReference(r.key,e),C0(n,r)):r instanceof FE?(L(Br,"Document no longer in limbo: "+r.key),n.Ac.removeReference(r.key,e),n.Ac.containsKey(r.key)||$E(n,r.key)):j(19791,{wc:r})}function C0(n,e){const t=e.key,r=t.path.canonicalString();n.Rc.get(t)||n.Pc.has(r)||(L(Br,"New document in limbo: "+t),n.Pc.add(r),hp(n))}function hp(n){for(;n.Pc.size>0&&n.Rc.size<n.maxConcurrentLimboResolutions;){const e=n.Pc.values().next().value;n.Pc.delete(e);const t=new B(te.fromString(e)),r=n.fc.next();n.Ic.set(r,new y0(t)),n.Rc=n.Rc.insert(t,r),yl(n.remoteStore,new mn(wt(Ks(t.path)),r,"TargetPurposeLimboResolution",Rt.yn))}}function Xn(n,e,t){return p(this,null,function*(){const r=$(n),i=[],s=[],o=[];r.hc.isEmpty()||(r.hc.forEach((a,u)=>{o.push(r.gc(u,e,t).then(l=>{var h;if((l||t)&&r.isPrimaryClient){const f=l?!l.fromCache:(h=t==null?void 0:t.targetChanges.get(u.targetId))==null?void 0:h.current;r.sharedClientState.updateQueryState(u.targetId,f?"current":"not-current")}if(l){i.push(l);const f=Yf.fo(u.targetId,l);s.push(f)}}))}),yield Promise.all(o),r.Ec.hn(i),yield function(u,l){return p(this,null,function*(){const h=$(u);try{yield h.persistence.runTransaction("notifyLocalViewChanges","readwrite",f=>R.forEach(l,g=>R.forEach(g.Ao,w=>h.persistence.referenceDelegate.addReference(f,g.targetId,w)).next(()=>R.forEach(g.Vo,w=>h.persistence.referenceDelegate.removeReference(f,g.targetId,w)))))}catch(f){if(!Fr(f))throw f;L(Xf,"Failed to update sequence numbers: "+f)}for(const f of l){const g=f.targetId;if(!f.fromCache){const w=h.No.get(g),S=w.snapshotVersion,D=w.withLastLimboFreeSnapshotVersion(S);h.No=h.No.insert(g,D)}}})}(r.localStore,s))})}function k0(n,e){return p(this,null,function*(){const t=$(n);if(!t.currentUser.isEqual(e)){L(Br,"User change. New user:",e.toKey());const r=yield TE(t.localStore,e);t.currentUser=e,function(s,o){s.dc.forEach(a=>{a.forEach(u=>{u.reject(new O(k.CANCELLED,o))})}),s.dc.clear()}(t,"'waitForPendingWrites' promise is rejected due to a user change."),t.sharedClientState.handleUserChange(e,r.removedBatchIds,r.addedBatchIds),yield Xn(t,r.qo)}})}function N0(n,e){const t=$(n),r=t.Ic.get(e);if(r&&r.lc)return Z().add(r.key);{let i=Z();const s=t.Tc.get(e);if(!s)return i;for(const o of s!=null?s:[]){const a=t.hc.get(o);i=i.unionWith(a.view.Yu)}return i}}function V0(n,e){return p(this,null,function*(){const t=$(n),r=yield Su(t.localStore,e.query,!0),i=e.view.uc(r);return t.isPrimaryClient&&pd(t,e.targetId,i.oc),i})}function D0(n,e){return p(this,null,function*(){const t=$(n);return ud(t.localStore,e).then(r=>Xn(t,r))})}function x0(n,e,t,r){return p(this,null,function*(){const i=$(n),s=yield function(a,u){const l=$(a),h=$(l.mutationQueue);return l.persistence.runTransaction("Lookup mutation documents","readonly",f=>h.Qr(f,u).next(g=>g?l.localDocuments.getDocuments(f,g):R.resolve(null)))}(i.localStore,e);s!==null?(t==="pending"?yield Js(i.remoteStore):t==="acknowledged"||t==="rejected"?(lp(i,e,r||null),up(i,e),function(a,u){$($(a).mutationQueue).jr(u)}(i.localStore,e)):j(6720,"Unknown batchState",{bc:t}),yield Xn(i,s)):L(Br,"Cannot apply mutation batch with id: "+e)})}function O0(n,e){return p(this,null,function*(){const t=$(n);if(Il(t),dp(t),e===!0&&t.mc!==!0){const r=t.sharedClientState.getAllActiveQueryTargets(),i=yield B_(t,r.toArray());t.mc=!0,yield hd(t.remoteStore,!0);for(const s of i)yl(t.remoteStore,s)}else if(e===!1&&t.mc!==!1){const r=[];let i=Promise.resolve();t.Tc.forEach((s,o)=>{t.sharedClientState.isLocalQueryTarget(o)?r.push(o):i=i.then(()=>(Ns(t,o),Ps(t.localStore,o,!0))),Cs(t.remoteStore,o)}),yield i,yield B_(t,r),function(o){const a=$(o);a.Ic.forEach((u,l)=>{Cs(a.remoteStore,l)}),a.Ac.e_(),a.Ic=new Map,a.Rc=new me(B.comparator)}(t),t.mc=!1,yield hd(t.remoteStore,!1)}})}function B_(n,e,t){return p(this,null,function*(){const r=$(n),i=[],s=[];for(const o of e){let a;const u=r.Tc.get(o);if(u&&u.length!==0){a=yield Ss(r.localStore,Se(u[0])?u[0]:wt(u[0]));for(const l of u){const h=r.hc.get(l),f=yield V0(r,h);f.snapshot&&s.push(f.snapshot)}}else{const l=yield AE(r.localStore,o);a=yield Ss(r.localStore,l),yield cp(r,jE(l),o,!1,a.resumeToken)}i.push(a)}return r.Ec.hn(s),i})}function jE(n){return Cn(n)?n:$I(n.path,n.collectionGroup,n.orderBy,n.filters,n.limit,"F",n.startAt,n.endAt)}function L0(n){return function(t){return $($(t).persistence).Ro()}($(n).localStore)}function M0(n,e,t,r){return p(this,null,function*(){const i=$(n);if(i.mc)return void L(Br,"Ignoring unexpected query state notification.");const s=i.Tc.get(e);if(s&&s.length>0)switch(t){case"current":case"not-current":{let o;if(Se(s[0]))switch(Dn(s[0])){case"collection_group":case"collection":o=yield ud(i.localStore,$T(s[0]));break;case"documents":o=yield function(l,h){const f=$(l),g=Z(...yu(h).map(w=>B.fromPath(w)));return f.persistence.runTransaction("Get documents for pipeline","readonly",w=>f.Uo.getEntries(w,g)).then(w=>w)}(i.localStore,s[0]);break;default:lt(""),o=Yr()}else o=yield ud(i.localStore,function(l){return l.collectionGroup||(l.path.length%2==1?l.path.lastSegment():l.path.get(l.path.length-2))}(s[0]));const a=Gs.createSynthesizedRemoteEventForCurrentChange(e,t==="current",Ie.EMPTY_BYTE_STRING);yield Xn(i,o,a);break}case"rejected":yield Ps(i.localStore,e,!0),Ns(i,e,r);break;default:j(64155,t)}})}function F0(n,e,t){return p(this,null,function*(){const r=Il(n);if(r.mc){for(const i of e){if(r.Tc.has(i)&&r.sharedClientState.isActiveQueryTarget(i)){L(Br,"Adding an already active target "+i);continue}const s=yield AE(r.localStore,i),o=yield Ss(r.localStore,s);yield cp(r,jE(s),o.targetId,!1,o.resumeToken),yl(r.remoteStore,o)}for(const i of t)r.Tc.has(i)&&(yield Ps(r.localStore,i,!1).then(()=>{Cs(r.remoteStore,i),Ns(r,i)}).catch(Mr))}})}function Il(n){const e=$(n);return e.remoteStore.remoteSyncer.applyRemoteEvent=qE.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=N0.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=b0.bind(null,e),e.Ec.hn=p0.bind(null,e.eventManager),e.Ec.yc=m0.bind(null,e.eventManager),e}function dp(n){const e=$(n);return e.remoteStore.remoteSyncer.applySuccessfulWrite=R0.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=S0.bind(null,e),e}function U0(n,e,t){const r=$(n);(function(s,o,a){return p(this,null,function*(){try{const u=yield o.getMetadata();if(yield function(w,S){const D=$(w),x=Ve(S.createTime);return D.persistence.runTransaction("hasNewerBundle","readonly",W=>D.d_.getBundleMetadata(W,S.id)).then(W=>!!W&&W.createTime.compareTo(x)>=0)}(s.localStore,u))return yield o.close(),a._completeWith(function(w){return{taskState:"Success",documentsLoaded:w.totalDocuments,bytesLoaded:w.totalBytes,totalDocuments:w.totalDocuments,totalBytes:w.totalBytes}}(u)),Promise.resolve(new Set);a._updateProgress(LE(u));const l=new g0(u,o.serializer);let h=yield o.ma();for(;h;){const g=yield l.qu(h);g&&a._updateProgress(g),h=yield o.ma()}const f=yield l.Ku(s.localStore);return yield Xn(s,f.Wu,void 0),yield function(w,S){const D=$(w);return D.persistence.runTransaction("Save bundle","readwrite",x=>D.d_.saveBundleMetadata(x,S))}(s.localStore,u),a._completeWith(f.progress),Promise.resolve(f.Qu)}catch(u){return lt(Br,`Loading bundle failed with ${u}`),a._failWith(u),Promise.resolve(new Set)}})})(r,e,t).then(i=>{r.sharedClientState.notifyBundleLoaded(i)})}class ka{constructor(){this.kind="memory",this.synchronizeTabs=!1}initialize(e){return p(this,null,function*(){this.serializer=Ja(e.databaseInfo.databaseId),this.sharedClientState=this.Sc(e),this.persistence=this.vc(e),yield this.persistence.start(),this.localStore=this.Dc(e),this.gcScheduler=this.xc(e,this.localStore),this.indexBackfillerScheduler=this.Cc(e,this.localStore)})}xc(e,t){return null}Cc(e,t){return null}Dc(e){return IE(this.persistence,new wE,e.initialUser,this.serializer)}vc(e){return new Hf(_l.w_,this.serializer)}Sc(e){return new xE}terminate(){return p(this,null,function*(){var e,t;(e=this.gcScheduler)==null||e.stop(),(t=this.indexBackfillerScheduler)==null||t.stop(),this.sharedClientState.shutdown(),yield this.persistence.shutdown()})}}ka.provider={build:()=>new ka};class B0 extends ka{constructor(e){super(),this.cacheSizeBytes=e}xc(e,t){F(this.persistence.referenceDelegate instanceof Ru,46915);const r=this.persistence.referenceDelegate.garbageCollector;return new IT(r,e.asyncQueue,t)}vc(e){const t=this.cacheSizeBytes!==void 0?st.withCacheSize(this.cacheSizeBytes):st.DEFAULT;return new Hf(r=>Ru.w_(r,t),this.serializer)}}class Tl extends ka{constructor(e,t,r){super(),this.Fc=e,this.cacheSizeBytes=t,this.forceOwnership=r,this.kind="persistent",this.synchronizeTabs=!1}initialize(e){return p(this,null,function*(){yield Sn(Tl.prototype,this,"initialize").call(this,e),yield this.Fc.initialize(this,e),yield dp(this.Fc.syncEngine),yield Js(this.Fc.remoteStore),yield this.persistence.X_(()=>(this.gcScheduler&&!this.gcScheduler.started&&this.gcScheduler.start(),this.indexBackfillerScheduler&&!this.indexBackfillerScheduler.started&&this.indexBackfillerScheduler.start(),Promise.resolve()))})}Dc(e){return IE(this.persistence,new wE,e.initialUser,this.serializer)}xc(e,t){const r=this.persistence.referenceDelegate.garbageCollector;return new IT(r,e.asyncQueue,t)}Cc(e,t){const r=new h0(t,this.persistence);return new l0(e.asyncQueue,r)}vc(e){const t=Jf(e.databaseInfo.databaseId,e.databaseInfo.persistenceKey),r=this.cacheSizeBytes!==void 0?st.withCacheSize(this.cacheSizeBytes):st.DEFAULT;return new Qf(this.synchronizeTabs,t,e.clientId,r,e.asyncQueue,OE(),eu(),this.serializer,this.sharedClientState,!!this.forceOwnership)}Sc(e){return new xE}}class fp extends Tl{constructor(e,t){super(e,t,!1),this.Fc=e,this.cacheSizeBytes=t,this.synchronizeTabs=!0}initialize(e){return p(this,null,function*(){yield Sn(fp.prototype,this,"initialize").call(this,e);const t=this.Fc.syncEngine;this.sharedClientState instanceof Ih&&(this.sharedClientState.syncEngine={Iu:x0.bind(null,t),Au:M0.bind(null,t),Vu:F0.bind(null,t),Ro:L0.bind(null,t),Ru:D0.bind(null,t)},yield this.sharedClientState.start()),yield this.persistence.X_(r=>p(this,null,function*(){yield O0(this.Fc.syncEngine,r),this.gcScheduler&&(r&&!this.gcScheduler.started?this.gcScheduler.start():r||this.gcScheduler.stop()),this.indexBackfillerScheduler&&(r&&!this.indexBackfillerScheduler.started?this.indexBackfillerScheduler.start():r||this.indexBackfillerScheduler.stop())}))})}Sc(e){const t=OE();if(!Ih.Je(t))throw new O(k.UNIMPLEMENTED,"IndexedDB persistence is only available on platforms that support LocalStorage.");const r=Jf(e.databaseInfo.databaseId,e.databaseInfo.persistenceKey);return new Ih(t,e.asyncQueue,r,e.clientId,e.initialUser)}}class Na{initialize(e,t){return p(this,null,function*(){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=r=>U_(this.syncEngine,r,1),this.remoteStore.remoteSyncer.handleCredentialChange=k0.bind(null,this.syncEngine),yield hd(this.remoteStore,this.syncEngine.isPrimaryClient))})}createEventManager(e){return function(){return new f0}()}createDatastore(e){const t=Ja(e.databaseInfo.databaseId),r=WN(e.databaseInfo);return XN(e.authCredentials,e.appCheckCredentials,r,t)}createRemoteStore(e){return function(r,i,s,o,a){return new Xx(r,i,s,o,a)}(this.localStore,this.datastore,e.asyncQueue,t=>U_(this.syncEngine,t,0),function(){return e_.Je()?new e_:new jN}())}createSyncEngine(e,t){return function(i,s,o,a,u,l,h){const f=new w0(i,s,o,a,u,l);return h&&(f.mc=!0),f}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}terminate(){return p(this,null,function*(){var e,t;yield function(i){return p(this,null,function*(){const s=$(i);L(An,"RemoteStore shutting down."),s.ca.add(5),yield Qs(s),s.Ea.shutdown(),s.ha.set("Unknown")})}(this.remoteStore),(e=this.datastore)==null||e.terminate(),(t=this.eventManager)==null||t.terminate()})}}Na.provider={build:()=>new Na};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let q0=class{constructor(e){this.datastore=e,this.readVersions=new Map,this.mutations=[],this.committed=!1,this.lastTransactionError=null,this.writtenDocs=new Set}lookup(e){return p(this,null,function*(){if(this.ensureCommitNotCalled(),this.mutations.length>0)throw this.lastTransactionError=new O(k.INVALID_ARGUMENT,"Firestore transactions require all reads to be executed before all writes."),this.lastTransactionError;const t=yield function(i,s){return p(this,null,function*(){const o=$(i),a={documents:s.map(f=>Es(o.serializer,f))},u=yield o.st("BatchGetDocuments",o.serializer.databaseId,te.emptyPath(),a,s.length),l=new Map;u.forEach(f=>{const g=PN(o.serializer,f);l.set(g.key.toString(),g)});const h=[];return s.forEach(f=>{const g=l.get(f.toString());F(!!g,55234,{key:f}),h.push(g)}),h})}(this.datastore,e);return t.forEach(r=>this.recordVersion(r)),t})}set(e,t){this.write(t.toMutation(e,this.precondition(e))),this.writtenDocs.add(e.toString())}update(e,t){try{this.write(t.toMutation(e,this.preconditionForUpdate(e)))}catch(r){this.lastTransactionError=r}this.writtenDocs.add(e.toString())}delete(e){this.write(new zs(e,this.precondition(e))),this.writtenDocs.add(e.toString())}commit(){return p(this,null,function*(){if(this.ensureCommitNotCalled(),this.lastTransactionError)throw this.lastTransactionError;const e=this.readVersions;this.mutations.forEach(t=>{e.delete(t.key.toString())}),e.forEach((t,r)=>{const i=B.fromPath(r);this.mutations.push(new of(i,this.precondition(i)))}),yield function(r,i){return p(this,null,function*(){const s=$(r),o={writes:i.map(a=>Ia(s.serializer,a))};yield s.tt("Commit",s.serializer.databaseId,te.emptyPath(),o)})}(this.datastore,this.mutations),this.committed=!0})}recordVersion(e){let t;if(e.isFoundDocument())t=e.version;else{if(!e.isNoDocument())throw j(50498,{Oc:e.constructor.name});t=H.min()}const r=this.readVersions.get(e.key.toString());if(r){if(!t.isEqual(r))throw new O(k.ABORTED,"Document version changed between two reads.")}else this.readVersions.set(e.key.toString(),t)}precondition(e){const t=this.readVersions.get(e.toString());return!this.writtenDocs.has(e.toString())&&t?t.isEqual(H.min())?Ee.exists(!1):Ee.updateTime(t):Ee.none()}preconditionForUpdate(e){const t=this.readVersions.get(e.toString());if(!this.writtenDocs.has(e.toString())&&t){if(t.isEqual(H.min()))throw new O(k.INVALID_ARGUMENT,"Can't update a document that doesn't exist.");return Ee.updateTime(t)}return Ee.exists(!0)}write(e){this.ensureCommitNotCalled(),this.mutations.push(e)}ensureCommitNotCalled(){}};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $0{constructor(e,t,r,i,s){this.asyncQueue=e,this.datastore=t,this.options=r,this.updateFunction=i,this.deferred=s,this.Mc=r.maxAttempts,this.jt=new _f(this.asyncQueue,"transaction_retry")}Nc(){this.Mc-=1,this.Lc()}Lc(){this.jt.Ut(()=>p(this,null,function*(){const e=new q0(this.datastore),t=this.Bc(e);t&&t.then(r=>{this.asyncQueue.enqueueAndForget(()=>e.commit().then(()=>{this.deferred.resolve(r)}).catch(i=>{this.Uc(i)}))}).catch(r=>{this.Uc(r)})}))}Bc(e){try{const t=this.updateFunction(e);return!Wa(t)&&t.catch&&t.then?t:(this.deferred.reject(Error("Transaction callback must return a Promise")),null)}catch(t){return this.deferred.reject(t),null}}Uc(e){this.Mc>0&&this.kc(e)?(this.Mc-=1,this.asyncQueue.enqueueAndForget(()=>(this.Lc(),Promise.resolve()))):this.deferred.reject(e)}kc(e){if((e==null?void 0:e.name)==="FirebaseError"){const t=e.code;return t==="aborted"||t==="failed-precondition"||t==="already-exists"||!zI(t)}return!1}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xr="FirestoreClient";class j0{constructor(e,t,r,i,s){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=r,this._databaseInfo=i,this.user=He.UNAUTHENTICATED,this.clientId=Zd.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=s,this.authCredentials.start(r,o=>p(this,null,function*(){L(xr,"Received user=",o.uid),yield this.authCredentialListener(o),this.user=o})),this.appCheckCredentials.start(r,o=>(L(xr,"Received new app check token=",o),this.appCheckCredentialListener(o,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this._databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new Ze;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(()=>p(this,null,function*(){try{this._onlineComponents&&(yield this._onlineComponents.terminate()),this._offlineComponents&&(yield this._offlineComponents.terminate()),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){const r=Xs(t,"Failed to shutdown persistence");e.reject(r)}})),e.promise}}function Th(n,e){return p(this,null,function*(){n.asyncQueue.verifyOperationInProgress(),L(xr,"Initializing OfflineComponentProvider");const t=n.configuration;yield e.initialize(t);let r=t.initialUser;n.setCredentialChangeListener(i=>p(this,null,function*(){r.isEqual(i)||(yield TE(e.localStore,i),r=i)})),e.persistence.setDatabaseDeletedListener(()=>n.terminate()),n._offlineComponents=e})}function q_(n,e){return p(this,null,function*(){n.asyncQueue.verifyOperationInProgress();const t=yield pp(n);L(xr,"Initializing OnlineComponentProvider"),yield e.initialize(t,n.configuration),n.setCredentialChangeListener(r=>D_(e.remoteStore,r)),n.setAppCheckTokenChangeListener((r,i)=>D_(e.remoteStore,i)),n._onlineComponents=e})}function pp(n){return p(this,null,function*(){if(!n._offlineComponents)if(n._uninitializedComponentsProvider){L(xr,"Using user provided OfflineComponentProvider");try{yield Th(n,n._uninitializedComponentsProvider._offline)}catch(e){const t=e;if(!function(i){return i.name==="FirebaseError"?i.code===k.FAILED_PRECONDITION||i.code===k.UNIMPLEMENTED:!(typeof DOMException!="undefined"&&i instanceof DOMException)||i.code===22||i.code===20||i.code===11}(t))throw t;lt("Error using user provided cache. Falling back to memory cache: "+t),yield Th(n,new ka)}}else L(xr,"Using default OfflineComponentProvider"),yield Th(n,new B0(void 0));return n._offlineComponents})}function El(n){return p(this,null,function*(){return n._onlineComponents||(n._uninitializedComponentsProvider?(L(xr,"Using user provided OnlineComponentProvider"),yield q_(n,n._uninitializedComponentsProvider._online)):(L(xr,"Using default OnlineComponentProvider"),yield q_(n,new Na))),n._onlineComponents})}function zE(n){return pp(n).then(e=>e.persistence)}function mp(n){return pp(n).then(e=>e.localStore)}function KE(n){return El(n).then(e=>e.remoteStore)}function gp(n){return El(n).then(e=>e.syncEngine)}function z0(n){return El(n).then(e=>e.datastore)}function Vs(n){return p(this,null,function*(){const e=yield El(n),t=e.eventManager;return t.onListen=I0.bind(null,e.syncEngine),t.onUnlisten=E0.bind(null,e.syncEngine),t.onFirstRemoteStoreListen=T0.bind(null,e.syncEngine),t.onLastRemoteStoreUnlisten=v0.bind(null,e.syncEngine),t})}function K0(n){return n.asyncQueue.enqueue(()=>p(this,null,function*(){const e=yield zE(n),t=yield KE(n);return e.setNetworkEnabled(!0),function(i){const s=$(i);return s.ca.delete(0),sc(s)}(t)}))}function G0(n){return n.asyncQueue.enqueue(()=>p(this,null,function*(){const e=yield zE(n),t=yield KE(n);return e.setNetworkEnabled(!1),function(i){return p(this,null,function*(){const s=$(i);s.ca.add(0),yield Qs(s),s.ha.set("Offline")})}(t)}))}function W0(n,e,t,r){const i=new wl(r),s=new ap(e,i,t);return n.asyncQueue.enqueueAndForget(()=>p(this,null,function*(){return ip(yield Vs(n),s)})),()=>{i.Aa(),n.asyncQueue.enqueueAndForget(()=>p(this,null,function*(){return sp(yield Vs(n),s)}))}}function H0(n,e){const t=new Ze;return n.asyncQueue.enqueueAndForget(()=>p(this,null,function*(){return function(i,s,o){return p(this,null,function*(){try{const a=yield function(l,h){const f=$(l);return f.persistence.runTransaction("read document","readonly",g=>f.localDocuments.getDocument(g,h))}(i,s);a.isFoundDocument()?o.resolve(a):a.isNoDocument()?o.resolve(null):o.reject(new O(k.UNAVAILABLE,"Failed to get document from cache. (However, this document may exist on the server. Run again without setting 'source' in the GetOptions to attempt to retrieve the document from the server.)"))}catch(a){const u=Xs(a,`Failed to get document '${s} from cache`);o.reject(u)}})}(yield mp(n),e,t)})),t.promise}function GE(n,e,t={}){const r=new Ze;return n.asyncQueue.enqueueAndForget(()=>p(this,null,function*(){return function(s,o,a,u,l){const h=new wl({next:g=>{h.Aa(),o.enqueueAndForget(()=>sp(s,f));const w=g.docs.has(a);!w&&g.fromCache?l.reject(new O(k.UNAVAILABLE,"Failed to get document because the client is offline.")):w&&g.fromCache&&u&&u.source==="server"?l.reject(new O(k.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):l.resolve(g)},error:g=>l.reject(g)}),f=new ap(Ks(a.path),h,{includeMetadataChanges:!0,waitForSyncWhenOnline:!0});return ip(s,f)}(yield Vs(n),n.asyncQueue,e,t,r)})),r.promise}function Q0(n,e){const t=new Ze;return n.asyncQueue.enqueueAndForget(()=>p(this,null,function*(){return function(i,s,o){return p(this,null,function*(){try{const a=yield Su(i,s,!0),u=new UE(s,a.Qo),l=u.Zu(a.documents),h=u.applyChanges(l,!1);o.resolve(h.snapshot)}catch(a){const u=Xs(a,`Failed to execute query '${s} against cache`);o.reject(u)}})}(yield mp(n),e,t)})),t.promise}function WE(n,e,t={}){const r=new Ze;return n.asyncQueue.enqueueAndForget(()=>p(this,null,function*(){return function(s,o,a,u,l){const h=new wl({next:g=>{h.Aa(),o.enqueueAndForget(()=>sp(s,f)),g.fromCache&&u.source==="server"?l.reject(new O(k.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):l.resolve(g)},error:g=>l.reject(g)}),f=new ap(a instanceof Zo?$D(a):a,h,{includeMetadataChanges:!0,waitForSyncWhenOnline:!0});return ip(s,f)}(yield Vs(n),n.asyncQueue,e,t,r)})),r.promise}function J0(n,e){const t=new Ze;return n.asyncQueue.enqueueAndForget(()=>p(this,null,function*(){return A0(yield gp(n),e,t)})),t.promise}function Y0(n,e){const t=new wl(e);return n.asyncQueue.enqueueAndForget(()=>p(this,null,function*(){return function(i,s){$(i).vu.add(s),s.next()}(yield Vs(n),t)})),()=>{t.Aa(),n.asyncQueue.enqueueAndForget(()=>p(this,null,function*(){return function(i,s){$(i).vu.delete(s)}(yield Vs(n),t)}))}}function X0(n,e,t){const r=new Ze;return n.asyncQueue.enqueueAndForget(()=>p(this,null,function*(){const i=yield z0(n);new $0(n.asyncQueue,i,t,e,r).Nc()})),r.promise}function Z0(n,e,t,r){const i=function(o,a){let u;return u=typeof o=="string"?QI().encode(o):o,function(h,f){return new u0(h,f)}(function(h,f){if(h instanceof Uint8Array)return V_(h,f);if(h instanceof ArrayBuffer)return V_(new Uint8Array(h),f);if(h instanceof ReadableStream)return h.getReader();throw new Error("Source of `toByteStreamReader` has to be a ArrayBuffer or ReadableStream")}(u),a)}(t,Ja(e));n.asyncQueue.enqueueAndForget(()=>p(this,null,function*(){U0(yield gp(n),i,r)}))}function eO(n,e){return n.asyncQueue.enqueue(()=>p(this,null,function*(){return function(r,i){const s=$(r);return s.persistence.runTransaction("Get named query","readonly",o=>s.d_.getNamedQuery(o,i))}(yield mp(n),e)}))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Va=class{constructor(e,t,r,i,s){this._firestore=e,this._userDataWriter=t,this._key=r,this._document=i,this._converter=s}get id(){return this._key.path.lastSegment()}get ref(){return new ue(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new tO(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}_fieldsProto(){var e,t;return(t=(e=this._document)==null?void 0:e.data.clone().value.mapValue.fields)!=null?t:void 0}get(e){if(this._document){const t=this._document.data.field(Bn("DocumentSnapshot.get",e));if(t!==null)return this._userDataWriter.convertValue(t)}}},tO=class extends Va{data(){return super.data()}};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _p{convertValue(e,t="none"){switch(qe(e)){case 0:return null;case 1:return e.booleanValue;case 2:return ge(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(Un(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 11:return this.convertObject(e.mapValue,t);case 10:return this.convertVectorValue(e.mapValue);default:throw j(62114,{value:e})}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){const r={};return Lr(e,(i,s)=>{r[i]=this.convertValue(s,t)}),r}convertVectorValue(e){var r,i,s;const t=(s=(i=(r=e.fields)==null?void 0:r[wi].arrayValue)==null?void 0:i.values)==null?void 0:s.map(o=>ge(o.doubleValue));return new Pt(t)}convertGeoPoint(e){return new Qt(ge(e.latitude),ge(e.longitude))}convertArray(e,t){return(e.values||[]).map(r=>this.convertValue(r,t))}convertServerTimestamp(e,t){switch(t){case"previous":const r=Ga(e);return r==null?null:this.convertValue(r,t);case"estimate":return this.convertTimestamp(ms(e));default:return null}}convertTimestamp(e){const t=Fn(e);return new le(t.seconds,t.nanos)}convertDocumentKey(e,t){const r=te.fromString(e);F(lT(r),9688,{name:e});const i=new br(r.get(1),r.get(3)),s=new B(r.popFirst(5));return i.isEqual(t)||Ne(`A document reference to ${s} refers to a different database (${i.projectId}/${i.database}), which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),s}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function vl(n,e,t){let r;return r=n?t&&(t.merge||t.mergeFields)?n.toFirestore(e,t):n.toFirestore(e):e,r}class nO extends _p{constructor(e){super(),this.firestore=e}convertBytes(e){return new at(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new ue(this.firestore,null,t)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $_="AsyncQueue";class j_{constructor(e=Promise.resolve()){this.qc=[],this.$c=!1,this.Kc=[],this.Qc=null,this.Wc=!1,this.Gc=!1,this.zc=[],this.jt=new _f(this,"async_queue_retry"),this.jc=()=>{const r=eu();r&&L($_,"Visibility state changed to "+r.visibilityState),this.jt.qt()},this.Hc=e;const t=eu();t&&typeof t.addEventListener=="function"&&t.addEventListener("visibilitychange",this.jc)}get isShuttingDown(){return this.$c}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.Jc(),this.Yc(e)}enterRestrictedMode(e){if(!this.$c){this.$c=!0,this.Gc=e||!1;const t=eu();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this.jc)}}enqueue(e){if(this.Jc(),this.$c)return new Promise(()=>{});const t=new Ze;return this.Yc(()=>this.$c&&this.Gc?Promise.resolve():(e().then(t.resolve,t.reject),t.promise)).then(()=>t.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.qc.push(e),this.Zc()))}Zc(){return p(this,null,function*(){if(this.qc.length!==0){try{yield this.qc[0](),this.qc.shift(),this.jt.reset()}catch(e){if(!Fr(e))throw e;L($_,"Operation failed with retryable error: "+e)}this.qc.length>0&&this.jt.Ut(()=>this.Zc())}})}Yc(e){const t=this.Hc.then(()=>(this.Wc=!0,e().catch(r=>{throw this.Qc=r,this.Wc=!1,Ne("INTERNAL UNHANDLED ERROR: ",z_(r)),r}).then(r=>(this.Wc=!1,r))));return this.Hc=t,t}enqueueAfterDelay(e,t,r){this.Jc(),this.zc.indexOf(e)>-1&&(t=0);const i=np.createAndSchedule(this,e,t,r,s=>this.Xc(s));return this.Kc.push(i),i}Jc(){this.Qc&&j(47125,{el:z_(this.Qc)})}verifyOperationInProgress(){}tl(){return p(this,null,function*(){let e;do e=this.Hc,yield e;while(e!==this.Hc)})}nl(e){for(const t of this.Kc)if(t.timerId===e)return!0;return!1}rl(e){return this.tl().then(()=>{this.Kc.sort((t,r)=>t.targetTimeMs-r.targetTimeMs);for(const t of this.Kc)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.tl()})}il(e){this.zc.push(e)}Xc(e){const t=this.Kc.indexOf(e);this.Kc.splice(t,1)}}function z_(n){let e=n.message||"";return n.stack&&(e=n.stack.includes(n.message)?n.stack:n.message+`
`+n.stack),e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rO{constructor(){this._progressObserver={},this._taskCompletionResolver=new Ze,this._lastProgress={taskState:"Running",totalBytes:0,totalDocuments:0,bytesLoaded:0,documentsLoaded:0}}onProgress(e,t,r){this._progressObserver={next:e,error:t,complete:r}}catch(e){return this._taskCompletionResolver.promise.catch(e)}then(e,t){return this._taskCompletionResolver.promise.then(e,t)}_completeWith(e){this._updateProgress(e),this._progressObserver.complete&&this._progressObserver.complete(),this._taskCompletionResolver.resolve(e)}_failWith(e){this._lastProgress.taskState="Error",this._progressObserver.next&&this._progressObserver.next(this._lastProgress),this._progressObserver.error&&this._progressObserver.error(e),this._taskCompletionResolver.reject(e)}_updateProgress(e){this._lastProgress=e,this._progressObserver.next&&this._progressObserver.next(e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const iO=-1;class Pe extends Ya{constructor(e,t,r,i){super(e,t,r,i),this.type="firestore",this._queue=new j_,this._persistenceKey=(i==null?void 0:i.name)||"[DEFAULT]"}_terminate(){return p(this,null,function*(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new j_(e),this._firestoreClient=void 0,yield e}})}}function nt(n){if(n._terminated)throw new O(k.FAILED_PRECONDITION,"The client has already been terminated.");return n._firestoreClient||HE(n),n._firestoreClient}function HE(n){var r,i,s,o;const e=n._freezeSettings(),t=eV(n._databaseId,((r=n._app)==null?void 0:r.options.appId)||"",n._persistenceKey,(i=n._app)==null?void 0:i.options.apiKey,e);n._componentsProvider||(s=e.localCache)!=null&&s._offlineComponentProvider&&((o=e.localCache)!=null&&o._onlineComponentProvider)&&(n._componentsProvider={_offline:e.localCache._offlineComponentProvider,_online:e.localCache._onlineComponentProvider}),n._firestoreClient=new j0(n._authCredentials,n._appCheckCredentials,n._queue,t,n._componentsProvider&&function(u){const l=u==null?void 0:u._online.build();return{_offline:u==null?void 0:u._offline.build(l),_online:l}}(n._componentsProvider))}function sO(n,e){lt("enableIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead.");const t=n._freezeSettings();return QE(n,Na.provider,{build:r=>new Tl(r,t.cacheSizeBytes,e==null?void 0:e.forceOwnership)}),Promise.resolve()}function oO(n){return p(this,null,function*(){lt("enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead.");const e=n._freezeSettings();QE(n,Na.provider,{build:t=>new fp(t,e.cacheSizeBytes)})})}function QE(n,e,t){if((n=ae(n,Pe))._firestoreClient||n._terminated)throw new O(k.FAILED_PRECONDITION,"Firestore has already been started and persistence can no longer be enabled. You can only enable persistence before calling any other methods on a Firestore object.");if(n._componentsProvider||n._getSettings().localCache)throw new O(k.FAILED_PRECONDITION,"SDK cache is already specified.");n._componentsProvider={_online:e,_offline:t},HE(n)}function aO(n){if(n._initialized&&!n._terminated)throw new O(k.FAILED_PRECONDITION,"Persistence can only be cleared before a Firestore instance is initialized or after it is terminated.");const e=new Ze;return n._queue.enqueueAndForgetEvenWhileRestricted(()=>p(this,null,function*(){try{yield function(r){return p(this,null,function*(){if(!yn.Je())return Promise.resolve();const i=r+yE;yield yn.delete(i)})}(Jf(n._databaseId,n._persistenceKey)),e.resolve()}catch(t){e.reject(t)}})),e.promise}function cO(n){return function(t){const r=new Ze;return t.asyncQueue.enqueueAndForget(()=>p(this,null,function*(){return P0(yield gp(t),r)})),r.promise}(nt(n=ae(n,Pe)))}function uO(n){return K0(nt(n=ae(n,Pe)))}function lO(n){return G0(nt(n=ae(n,Pe)))}function hO(n,e){const t=nt(n=ae(n,Pe)),r=new rO;return Z0(t,n._databaseId,e,r),r}function dO(n,e){return eO(nt(n=ae(n,Pe)),e).then(t=>t?new Tt(n,null,t.query):null)}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mi extends _p{constructor(e){super(),this.firestore=e}convertBytes(e){return new at(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new ue(this.firestore,null,t)}}class oi{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}let $t=class JE extends Va{constructor(e,t,r,i,s,o){super(e,t,r,i,o),this._firestore=e,this._firestoreImpl=e,this.metadata=s}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const t=new sa(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){const r=this._document.data.field(Bn("DocumentSnapshot.get",e));if(r!==null)return this._userDataWriter.convertValue(r,t.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new O(k.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e=this._document,t={};return t.type=JE._jsonSchemaVersion,t.bundle="",t.bundleSource="DocumentSnapshot",t.bundleName=this._key.toString(),!e||!e.isValidDocument()||!e.isFoundDocument()?t:(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),t.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),t)}};$t._jsonSchemaVersion="firestore/documentSnapshot/1.0",$t._jsonSchema={type:Me("string",$t._jsonSchemaVersion),bundleSource:Me("string","DocumentSnapshot"),bundleName:Me("string"),bundle:Me("string")};let sa=class extends $t{data(e={}){return super.data(e)}},Jt=class YE{constructor(e,t,r,i){this._firestore=e,this._userDataWriter=t,this._snapshot=i,this.metadata=new oi(i.hasPendingWrites,i.fromCache),this.query=r}get docs(){const e=[];return this.forEach(t=>e.push(t)),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,t){this._snapshot.docs.forEach(r=>{e.call(t,new sa(this._firestore,this._userDataWriter,r.key,r,new oi(this._snapshot.mutatedKeys.has(r.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){const t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new O(k.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=function(i,s){if(i._snapshot.oldDocs.isEmpty()){let o=0;return i._snapshot.docChanges.map(a=>{Se(i._snapshot.query)?cd(i._snapshot.query):df(i.query._query);const u=new sa(i._firestore,i._userDataWriter,a.doc.key,a.doc,new oi(i._snapshot.mutatedKeys.has(a.doc.key),i._snapshot.fromCache),i.query.converter);return a.doc,{type:"added",doc:u,oldIndex:-1,newIndex:o++}})}{let o=i._snapshot.oldDocs;return i._snapshot.docChanges.filter(a=>s||a.type!==3).map(a=>{const u=new sa(i._firestore,i._userDataWriter,a.doc.key,a.doc,new oi(i._snapshot.mutatedKeys.has(a.doc.key),i._snapshot.fromCache),i.query.converter);let l=-1,h=-1;return a.type!==0&&(l=o.indexOf(a.doc.key),o=o.delete(a.doc.key)),a.type!==1&&(o=o.add(a.doc),h=o.indexOf(a.doc.key)),{type:fO(a.type),doc:u,oldIndex:l,newIndex:h}})}}(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new O(k.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e={};e.type=YE._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=Zd.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;const t=[],r=[],i=[];return this.docs.forEach(s=>{s._document!==null&&(t.push(s._document),r.push(this._userDataWriter.convertObjectMap(s._document.data.value.mapValue.fields,"previous")),i.push(s.ref.path))}),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}};function fO(n){switch(n){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return j(61501,{type:n})}}function XE(n,e){return n instanceof $t&&e instanceof $t?n._firestore===e._firestore&&n._key.isEqual(e._key)&&(n._document===null?e._document===null:n._document.isEqual(e._document))&&n._converter===e._converter:n instanceof Jt&&e instanceof Jt&&n._firestore===e._firestore&&RT(n.query,e.query)&&n.metadata.isEqual(e.metadata)&&n._snapshot.isEqual(e._snapshot)}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Jt._jsonSchemaVersion="firestore/querySnapshot/1.0",Jt._jsonSchema={type:Me("string",Jt._jsonSchemaVersion),bundleSource:Me("string","QuerySnapshot"),bundleName:Me("string"),bundle:Me("string")};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ZE(n){if(n.limitType==="L"&&n.explicitOrderBy.length===0)throw new O(k.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class yp{}class oc extends yp{}function hr(n,e,...t){let r=[];e instanceof yp&&r.push(e),r=r.concat(t),function(s){const o=s.filter(u=>u instanceof wp).length,a=s.filter(u=>u instanceof Al).length;if(o>1||o>0&&a>0)throw new O(k.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")}(r);for(const i of r)n=i._apply(n);return n}class Al extends oc{constructor(e,t,r){super(),this._field=e,this._op=t,this._value=r,this.type="where"}static _create(e,t,r){return new Al(e,t,r)}_apply(e){const t=this._parse(e);return tv(e._query,t),new Tt(e.firestore,e.converter,Hh(e._query,t))}_parse(e){const t=Di(e.firestore);return function(s,o,a,u,l,h,f){let g;if(l.isKeyField()){if(h==="array-contains"||h==="array-contains-any")throw new O(k.INVALID_ARGUMENT,`Invalid Query. You can't perform '${h}' queries on documentId().`);if(h==="in"||h==="not-in"){G_(f,h);const S=[];for(const D of f)S.push(K_(u,s,D));g={arrayValue:{values:S}}}else g=K_(u,s,f)}else h!=="in"&&h!=="not-in"&&h!=="array-contains-any"||G_(f,h),g=kT(a,o,f,h==="in"||h==="not-in");return se.create(l,h,g)}(e._query,"where",t,e.firestore._databaseId,this._field,this._op,this._value)}}function pO(n,e,t){const r=e,i=Bn("where",n);return Al._create(i,r,t)}class wp extends yp{constructor(e,t){super(),this.type=e,this._queryConstraints=t}static _create(e,t){return new wp(e,t)}_parse(e){const t=this._queryConstraints.map(r=>r._parse(e)).filter(r=>r.getFilters().length>0);return t.length===1?t[0]:fe.create(t,this._getOperator())}_apply(e){const t=this._parse(e);return t.getFilters().length===0?e:(function(i,s){let o=i;const a=s.getFlattenedFilters();for(const u of a)tv(o,u),o=Hh(o,u)}(e._query,t),new Tt(e.firestore,e.converter,Hh(e._query,t)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}class Ip extends oc{constructor(e,t){super(),this._field=e,this._direction=t,this.type="orderBy"}static _create(e,t){return new Ip(e,t)}_apply(e){const t=function(i,s,o){if(i.startAt!==null)throw new O(k.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(i.endAt!==null)throw new O(k.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new ya(s,o)}(e._query,this._field,this._direction);return new Tt(e.firestore,e.converter,fN(e._query,t))}}function mO(n,e="asc"){const t=e,r=Bn("orderBy",n);return Ip._create(r,t)}class bl extends oc{constructor(e,t,r){super(),this.type=e,this._limit=t,this._limitType=r}static _create(e,t,r){return new bl(e,t,r)}_apply(e){return new Tt(e.firestore,e.converter,mu(e._query,this._limit,this._limitType))}}function gO(n){return gI("limit",n),bl._create("limit",n,"F")}function _O(n){return gI("limitToLast",n),bl._create("limitToLast",n,"L")}class Rl extends oc{constructor(e,t,r){super(),this.type=e,this._docOrFields=t,this._inclusive=r}static _create(e,t,r){return new Rl(e,t,r)}_apply(e){const t=ev(e,this.type,this._docOrFields,this._inclusive);return new Tt(e.firestore,e.converter,pN(e._query,t))}}function yO(...n){return Rl._create("startAt",n,!0)}function wO(...n){return Rl._create("startAfter",n,!1)}class Sl extends oc{constructor(e,t,r){super(),this.type=e,this._docOrFields=t,this._inclusive=r}static _create(e,t,r){return new Sl(e,t,r)}_apply(e){const t=ev(e,this.type,this._docOrFields,this._inclusive);return new Tt(e.firestore,e.converter,mN(e._query,t))}}function IO(...n){return Sl._create("endBefore",n,!1)}function TO(...n){return Sl._create("endAt",n,!0)}function ev(n,e,t,r){if(t[0]=z(t[0]),t[0]instanceof Va)return function(s,o,a,u,l){if(!u)throw new O(k.NOT_FOUND,`Can't use a DocumentSnapshot that doesn't exist for ${a}().`);const h=[];for(const f of as(s))if(f.field.isKeyField())h.push(Ii(o,u.key));else{const g=u.data.field(f.field);if(Ka(g))throw new O(k.INVALID_ARGUMENT,'Invalid query. You are trying to start or end a query using a document for which the field "'+f.field+'" is an uncommitted server timestamp. (Since the value of this field is unknown, you cannot start/end a query with it.)');if(g===null){const w=f.field.canonicalString();throw new O(k.INVALID_ARGUMENT,`Invalid query. You are trying to start or end a query using a document for which the field '${w}' (used as the orderBy) does not exist.`)}h.push(g)}return new Pr(h,l)}(n._query,n.firestore._databaseId,e,t[0]._document,r);{const i=Di(n.firestore);return function(o,a,u,l,h,f){const g=o.explicitOrderBy;if(h.length>g.length)throw new O(k.INVALID_ARGUMENT,`Too many arguments provided to ${l}(). The number of arguments must be less than or equal to the number of orderBy() clauses`);const w=[];for(let S=0;S<h.length;S++){const D=h[S];if(g[S].field.isKeyField()){if(typeof D!="string")throw new O(k.INVALID_ARGUMENT,`Invalid query. Expected a string for document ID in ${l}(), but got a ${typeof D}`);if(!hf(o)&&D.indexOf("/")!==-1)throw new O(k.INVALID_ARGUMENT,`Invalid query. When querying a collection and ordering by documentId(), the value passed to ${l}() must be a plain document ID, but '${D}' contains a slash.`);const x=o.path.child(te.fromString(D));if(!B.isDocumentKey(x))throw new O(k.INVALID_ARGUMENT,`Invalid query. When querying a collection group and ordering by documentId(), the value passed to ${l}() must result in a valid document path, but '${x}' is not because it contains an odd number of segments.`);const W=new B(x);w.push(Ii(a,W))}else{const x=kT(u,l,D);w.push(x)}}return new Pr(w,f)}(n._query,n.firestore._databaseId,i,e,t,r)}}function K_(n,e,t){if(typeof(t=z(t))=="string"){if(t==="")throw new O(k.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!hf(e)&&t.indexOf("/")!==-1)throw new O(k.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${t}' contains a '/' character.`);const r=e.path.child(te.fromString(t));if(!B.isDocumentKey(r))throw new O(k.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${r}' is not because it has an odd number of segments (${r.length}).`);return Ii(n,new B(r))}if(t instanceof ue)return Ii(n,t._key);throw new O(k.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${Yu(t)}.`)}function G_(n,e){if(!Array.isArray(n)||n.length===0)throw new O(k.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function tv(n,e){const t=function(i,s){for(const o of i)for(const a of o.getFlattenedFilters())if(s.indexOf(a.op)>=0)return a.op;return null}(n.filters,function(i){switch(i){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}}(e.op));if(t!==null)throw t===e.op?new O(k.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new O(k.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${t.toString()}' filters.`)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function md(n){return function(t,r){if(typeof t!="object"||t===null)return!1;const i=t;for(const s of r)if(s in i&&typeof i[s]=="function")return!0;return!1}(n,["next","error","complete"])}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const EO={maxAttempts:5};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let nv=class{constructor(e,t){this._firestore=e,this._commitHandler=t,this._mutations=[],this._committed=!1,this._dataReader=Di(e)}set(e,t,r){this._verifyNotCommitted();const i=mr(e,this._firestore),s=vl(i.converter,t,r),o=sl(this._dataReader,"WriteBatch.set",i._key,s,i.converter!==null,r);return this._mutations.push(o.toMutation(i._key,Ee.none())),this}update(e,t,r,...i){this._verifyNotCommitted();const s=mr(e,this._firestore);let o;return o=typeof(t=z(t))=="string"||t instanceof Cr?Af(this._dataReader,"WriteBatch.update",s._key,t,r,i):vf(this._dataReader,"WriteBatch.update",s._key,t),this._mutations.push(o.toMutation(s._key,Ee.exists(!0))),this}delete(e){this._verifyNotCommitted();const t=mr(e,this._firestore);return this._mutations=this._mutations.concat(new zs(t._key,Ee.none())),this}commit(){return this._verifyNotCommitted(),this._committed=!0,this._mutations.length>0?this._commitHandler(this._mutations):Promise.resolve()}_verifyNotCommitted(){if(this._committed)throw new O(k.FAILED_PRECONDITION,"A write batch can no longer be used after commit() has been called.")}};function mr(n,e){if((n=z(n)).firestore!==e)throw new O(k.INVALID_ARGUMENT,"Provided document reference is from a different Firestore instance.");return n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let vO=class{constructor(e,t){this._firestore=e,this._transaction=t,this._dataReader=Di(e)}get(e){const t=mr(e,this._firestore),r=new nO(this._firestore);return this._transaction.lookup([t._key]).then(i=>{if(!i||i.length!==1)return j(24041);const s=i[0];if(s.isFoundDocument())return new Va(this._firestore,r,s.key,s,t.converter);if(s.isNoDocument())return new Va(this._firestore,r,t._key,null,t.converter);throw j(18433,{doc:s})})}set(e,t,r){const i=mr(e,this._firestore),s=vl(i.converter,t,r),o=sl(this._dataReader,"Transaction.set",i._key,s,i.converter!==null,r);return this._transaction.set(i._key,o),this}update(e,t,r,...i){const s=mr(e,this._firestore);let o;return o=typeof(t=z(t))=="string"||t instanceof Cr?Af(this._dataReader,"Transaction.update",s._key,t,r,i):vf(this._dataReader,"Transaction.update",s._key,t),this._transaction.update(s._key,o),this}delete(e){const t=mr(e,this._firestore);return this._transaction.delete(t._key),this}};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let AO=class extends vO{constructor(e,t){super(e,t),this._firestore=e}get(e){const t=mr(e,this._firestore),r=new Mi(this._firestore);return super.get(e).then(i=>new $t(this._firestore,r,t._key,i._document,new oi(!1,!1),t.converter))}};function bO(n,e,t){n=ae(n,Pe);const r=G(G({},EO),t);(function(o){if(o.maxAttempts<1)throw new O(k.INVALID_ARGUMENT,"Max attempts must be at least 1")})(r);const i=nt(n);return X0(i,s=>e(new AO(n,s)),r)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function RO(n){n=ae(n,ue);const e=ae(n.firestore,Pe),t=nt(e);return GE(t,n._key).then(r=>Tp(e,n,r))}function SO(n){n=ae(n,ue);const e=ae(n.firestore,Pe),t=nt(e),r=new Mi(e);return H0(t,n._key).then(i=>new $t(e,r,n._key,i,new oi(i!==null&&i.hasLocalMutations,!0),n.converter))}function PO(n){n=ae(n,ue);const e=ae(n.firestore,Pe),t=nt(e);return GE(t,n._key,{source:"server"}).then(r=>Tp(e,n,r))}function CO(n){n=ae(n,Tt);const e=ae(n.firestore,Pe),t=nt(e),r=new Mi(e);return ZE(n._query),WE(t,n._query).then(i=>new Jt(e,r,n,i))}function kO(n){n=ae(n,Tt);const e=ae(n.firestore,Pe),t=nt(e),r=new Mi(e);return Q0(t,n._query).then(i=>new Jt(e,r,n,i))}function NO(n){n=ae(n,Tt);const e=ae(n.firestore,Pe),t=nt(e),r=new Mi(e);return WE(t,n._query,{source:"server"}).then(i=>new Jt(e,r,n,i))}function W_(n,e,t){n=ae(n,ue);const r=ae(n.firestore,Pe),i=vl(n.converter,e,t),s=Di(r);return Zs(r,[sl(s,"setDoc",n._key,i,n.converter!==null,t).toMutation(n._key,Ee.none())])}function H_(n,e,t,...r){n=ae(n,ue);const i=ae(n.firestore,Pe),s=Di(i);let o;return o=typeof(e=z(e))=="string"||e instanceof Cr?Af(s,"updateDoc",n._key,e,t,r):vf(s,"updateDoc",n._key,e),Zs(i,[o.toMutation(n._key,Ee.exists(!0))])}function VO(n){return Zs(ae(n.firestore,Pe),[new zs(n._key,Ee.none())])}function DO(n,e){const t=ae(n.firestore,Pe),r=gu(n),i=vl(n.converter,e),s=Di(n.firestore);return Zs(t,[sl(s,"addDoc",r._key,i,n.converter!==null,{}).toMutation(r._key,Ee.exists(!1))]).then(()=>r)}function rv(n,...e){var l,h,f;n=z(n);let t={includeMetadataChanges:!1,source:"default"},r=0;typeof e[r]!="object"||md(e[r])||(t=e[r++]);const i={includeMetadataChanges:t.includeMetadataChanges,source:t.source};if(md(e[r])){const g=e[r];e[r]=(l=g.next)==null?void 0:l.bind(g),e[r+1]=(h=g.error)==null?void 0:h.bind(g),e[r+2]=(f=g.complete)==null?void 0:f.bind(g)}let s,o,a;if(n instanceof ue)o=ae(n.firestore,Pe),a=Ks(n._key.path),s={next:g=>{e[r]&&e[r](Tp(o,n,g))},error:e[r+1],complete:e[r+2]};else{const g=ae(n,Tt);o=ae(g.firestore,Pe),a=g._query;const w=new Mi(o);s={next:S=>{e[r]&&e[r](new Jt(o,w,g,S))},error:e[r+1],complete:e[r+2]},ZE(n._query)}const u=nt(o);return W0(u,a,i,s)}function xO(n,e){n=ae(n,Pe);const t=nt(n),r=md(e)?e:{next:e};return Y0(t,r)}function Zs(n,e){const t=nt(n);return J0(t,e)}function Tp(n,e,t){const r=t.docs.get(e._key),i=new Mi(n);return new $t(n,i,e._key,r,new oi(t.hasPendingWrites,t.fromCache),e.converter)}function T2(n){return n=ae(n,Pe),nt(n),new nv(n,e=>Zs(n,e))}const Q_="@firebase/firestore",J_="4.17.1";(function(e,t=!0){Lk(Gn),It(new Be("firestore",(r,{instanceIdentifier:i,options:s})=>{const o=r.getProvider("app").getImmediate(),a=new Pe(new UN(r.getProvider("auth-internal")),new $N(o,r.getProvider("app-check-internal")),Wk(o,i),o);return s=G({useFetchStreams:t},s),a._setSettings(s),a},"PUBLIC").setMultipleInstances(!0)),je(Q_,J_,e),je(Q_,J_,"esm2020")})();const OO="@firebase/firestore-compat",LO="0.4.13";/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ep(n,e){if(e===void 0)return{merge:!1};if(e.mergeFields!==void 0&&e.merge!==void 0)throw new O("invalid-argument",`Invalid options passed to function ${n}(): You cannot specify both "merge" and "mergeFields".`);return e}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Y_(){if(typeof Uint8Array=="undefined")throw new O("unimplemented","Uint8Arrays are not available in this environment.")}function X_(){if(!zk())throw new O("unimplemented","Blobs are unavailable in Firestore in this environment.")}let iv=class gd{constructor(e){this._delegate=e}static fromBase64String(e){return X_(),new gd(at.fromBase64String(e))}static fromUint8Array(e){return Y_(),new gd(at.fromUint8Array(e))}toBase64(){return X_(),this._delegate.toBase64()}toUint8Array(){return Y_(),this._delegate.toUint8Array()}isEqual(e){return this._delegate.isEqual(e._delegate)}toString(){return"Blob(base64: "+this.toBase64()+")"}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _d(n){return MO(n,["next","error","complete"])}function MO(n,e){if(typeof n!="object"||n===null)return!1;const t=n;for(const r of e)if(r in t&&typeof t[r]=="function")return!0;return!1}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class FO{enableIndexedDbPersistence(e,t){return sO(e._delegate,{forceOwnership:t})}enableMultiTabIndexedDbPersistence(e){return oO(e._delegate)}clearIndexedDbPersistence(e){return aO(e._delegate)}}class sv{constructor(e,t,r){this._delegate=t,this._persistenceProvider=r,this.INTERNAL={delete:()=>this.terminate()},e instanceof br||(this._appCompat=e)}get _databaseId(){return this._delegate._databaseId}settings(e){const t=this._delegate._getSettings();!e.merge&&t.host!==e.host&&lt("You are overriding the original host. If you did not intend to override your settings, use {merge: true}."),e.merge&&(e=G(G({},t),e),delete e.merge),this._delegate._setSettings(e)}useEmulator(e,t,r={}){oV(this._delegate,e,t,r)}enableNetwork(){return uO(this._delegate)}disableNetwork(){return lO(this._delegate)}enablePersistence(e){let t=!1,r=!1;return e&&(t=!!e.synchronizeTabs,r=!!e.experimentalForceOwningTab,mI("synchronizeTabs",t,"experimentalForceOwningTab",r)),t?this._persistenceProvider.enableMultiTabIndexedDbPersistence(this):this._persistenceProvider.enableIndexedDbPersistence(this,r)}clearPersistence(){return this._persistenceProvider.clearIndexedDbPersistence(this)}terminate(){return this._appCompat&&(this._appCompat._removeServiceInstance("firestore-compat"),this._appCompat._removeServiceInstance("firestore")),this._delegate._delete()}waitForPendingWrites(){return cO(this._delegate)}onSnapshotsInSync(e){return xO(this._delegate,e)}get app(){if(!this._appCompat)throw new O("failed-precondition","Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._appCompat}collection(e){try{return new Ds(this,AT(this._delegate,e))}catch(t){throw _t(t,"collection()","Firestore.collection()")}}doc(e){try{return new Bt(this,gu(this._delegate,e))}catch(t){throw _t(t,"doc()","Firestore.doc()")}}collectionGroup(e){try{return new gt(this,aV(this._delegate,e))}catch(t){throw _t(t,"collectionGroup()","Firestore.collectionGroup()")}}runTransaction(e){return bO(this._delegate,t=>e(new ov(this,t)))}batch(){return nt(this._delegate),new av(new nv(this._delegate,e=>Zs(this._delegate,e)))}loadBundle(e){return hO(this._delegate,e)}namedQuery(e){return dO(this._delegate,e).then(t=>t?new gt(this,t):null)}}class Pl extends _p{constructor(e){super(),this.firestore=e}convertBytes(e){return new iv(new at(e))}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return Bt.forKey(t,this.firestore,null)}}function UO(n){Mk(n)}class ov{constructor(e,t){this._firestore=e,this._delegate=t,this._userDataWriter=new Pl(e)}get(e){const t=ai(e);return this._delegate.get(t).then(r=>new Da(this._firestore,new $t(this._firestore._delegate,this._userDataWriter,r._key,r._document,r.metadata,t.converter)))}set(e,t,r){const i=ai(e);return r?(Ep("Transaction.set",r),this._delegate.set(i,t,r)):this._delegate.set(i,t),this}update(e,t,r,...i){const s=ai(e);return arguments.length===2?this._delegate.update(s,t):this._delegate.update(s,t,r,...i),this}delete(e){const t=ai(e);return this._delegate.delete(t),this}}class av{constructor(e){this._delegate=e}set(e,t,r){const i=ai(e);return r?(Ep("WriteBatch.set",r),this._delegate.set(i,t,r)):this._delegate.set(i,t),this}update(e,t,r,...i){const s=ai(e);return arguments.length===2?this._delegate.update(s,t):this._delegate.update(s,t,r,...i),this}delete(e){const t=ai(e);return this._delegate.delete(t),this}commit(){return this._delegate.commit()}}class Si{constructor(e,t,r){this._firestore=e,this._userDataWriter=t,this._delegate=r}fromFirestore(e,t){const r=new sa(this._firestore._delegate,this._userDataWriter,e._key,e._document,e.metadata,null);return this._delegate.fromFirestore(new xa(this._firestore,r),t!=null?t:{})}toFirestore(e,t){return t?this._delegate.toFirestore(e,t):this._delegate.toFirestore(e)}static getInstance(e,t){const r=Si.INSTANCES;let i=r.get(e);i||(i=new WeakMap,r.set(e,i));let s=i.get(t);return s||(s=new Si(e,new Pl(e),t),i.set(t,s)),s}}Si.INSTANCES=new WeakMap;class Bt{constructor(e,t){this.firestore=e,this._delegate=t,this._userDataWriter=new Pl(e)}static forPath(e,t,r){if(e.length%2!==0)throw new O("invalid-argument",`Invalid document reference. Document references must have an even number of segments, but ${e.canonicalString()} has ${e.length}`);return new Bt(t,new ue(t._delegate,r,new B(e)))}static forKey(e,t,r){return new Bt(t,new ue(t._delegate,r,e))}get id(){return this._delegate.id}get parent(){return new Ds(this.firestore,this._delegate.parent)}get path(){return this._delegate.path}collection(e){try{return new Ds(this.firestore,AT(this._delegate,e))}catch(t){throw _t(t,"collection()","DocumentReference.collection()")}}isEqual(e){return e=z(e),e instanceof ue?bT(this._delegate,e):!1}set(e,t){t=Ep("DocumentReference.set",t);try{return t?W_(this._delegate,e,t):W_(this._delegate,e)}catch(r){throw _t(r,"setDoc()","DocumentReference.set()")}}update(e,t,...r){try{return arguments.length===1?H_(this._delegate,e):H_(this._delegate,e,t,...r)}catch(i){throw _t(i,"updateDoc()","DocumentReference.update()")}}delete(){return VO(this._delegate)}onSnapshot(...e){const t=cv(e),r=uv(e,i=>new Da(this.firestore,new $t(this.firestore._delegate,this._userDataWriter,i._key,i._document,i.metadata,this._delegate.converter)));return rv(this._delegate,t,r)}get(e){let t;return(e==null?void 0:e.source)==="cache"?t=SO(this._delegate):(e==null?void 0:e.source)==="server"?t=PO(this._delegate):t=RO(this._delegate),t.then(r=>new Da(this.firestore,new $t(this.firestore._delegate,this._userDataWriter,r._key,r._document,r.metadata,this._delegate.converter)))}withConverter(e){return new Bt(this.firestore,e?this._delegate.withConverter(Si.getInstance(this.firestore,e)):this._delegate.withConverter(null))}}function _t(n,e,t){return n.message=n.message.replace(e,t),n}function cv(n){for(const e of n)if(typeof e=="object"&&!_d(e))return e;return{}}function uv(n,e){var r,i;let t;return _d(n[0])?t=n[0]:_d(n[1])?t=n[1]:typeof n[0]=="function"?t={next:n[0],error:n[1],complete:n[2]}:t={next:n[1],error:n[2],complete:n[3]},{next:s=>{t.next&&t.next(e(s))},error:(r=t.error)==null?void 0:r.bind(t),complete:(i=t.complete)==null?void 0:i.bind(t)}}class Da{constructor(e,t){this._firestore=e,this._delegate=t}get ref(){return new Bt(this._firestore,this._delegate.ref)}get id(){return this._delegate.id}get metadata(){return this._delegate.metadata}get exists(){return this._delegate.exists()}data(e){return this._delegate.data(e)}get(e,t){return this._delegate.get(e,t)}isEqual(e){return XE(this._delegate,e._delegate)}}class xa extends Da{data(e){const t=this._delegate.data(e);return this._delegate._converter||Fk(t!==void 0,"Document in a QueryDocumentSnapshot should exist"),t}}class gt{constructor(e,t){this.firestore=e,this._delegate=t,this._userDataWriter=new Pl(e)}where(e,t,r){try{return new gt(this.firestore,hr(this._delegate,pO(e,t,r)))}catch(i){throw _t(i,/(orderBy|where)\(\)/,"Query.$1()")}}orderBy(e,t){try{return new gt(this.firestore,hr(this._delegate,mO(e,t)))}catch(r){throw _t(r,/(orderBy|where)\(\)/,"Query.$1()")}}limit(e){try{return new gt(this.firestore,hr(this._delegate,gO(e)))}catch(t){throw _t(t,"limit()","Query.limit()")}}limitToLast(e){try{return new gt(this.firestore,hr(this._delegate,_O(e)))}catch(t){throw _t(t,"limitToLast()","Query.limitToLast()")}}startAt(...e){try{return new gt(this.firestore,hr(this._delegate,yO(...e)))}catch(t){throw _t(t,"startAt()","Query.startAt()")}}startAfter(...e){try{return new gt(this.firestore,hr(this._delegate,wO(...e)))}catch(t){throw _t(t,"startAfter()","Query.startAfter()")}}endBefore(...e){try{return new gt(this.firestore,hr(this._delegate,IO(...e)))}catch(t){throw _t(t,"endBefore()","Query.endBefore()")}}endAt(...e){try{return new gt(this.firestore,hr(this._delegate,TO(...e)))}catch(t){throw _t(t,"endAt()","Query.endAt()")}}isEqual(e){return RT(this._delegate,e._delegate)}get(e){let t;return(e==null?void 0:e.source)==="cache"?t=kO(this._delegate):(e==null?void 0:e.source)==="server"?t=NO(this._delegate):t=CO(this._delegate),t.then(r=>new yd(this.firestore,new Jt(this.firestore._delegate,this._userDataWriter,this._delegate,r._snapshot)))}onSnapshot(...e){const t=cv(e),r=uv(e,i=>new yd(this.firestore,new Jt(this.firestore._delegate,this._userDataWriter,this._delegate,i._snapshot)));return rv(this._delegate,t,r)}withConverter(e){return new gt(this.firestore,e?this._delegate.withConverter(Si.getInstance(this.firestore,e)):this._delegate.withConverter(null))}}class BO{constructor(e,t){this._firestore=e,this._delegate=t}get type(){return this._delegate.type}get doc(){return new xa(this._firestore,this._delegate.doc)}get oldIndex(){return this._delegate.oldIndex}get newIndex(){return this._delegate.newIndex}}class yd{constructor(e,t){this._firestore=e,this._delegate=t}get query(){return new gt(this._firestore,this._delegate.query)}get metadata(){return this._delegate.metadata}get size(){return this._delegate.size}get empty(){return this._delegate.empty}get docs(){return this._delegate.docs.map(e=>new xa(this._firestore,e))}docChanges(e){return this._delegate.docChanges(e).map(t=>new BO(this._firestore,t))}forEach(e,t){this._delegate.forEach(r=>{e.call(t,new xa(this._firestore,r))})}isEqual(e){return XE(this._delegate,e._delegate)}}class Ds extends gt{constructor(e,t){super(e,t),this.firestore=e,this._delegate=t}get id(){return this._delegate.id}get path(){return this._delegate.path}get parent(){const e=this._delegate.parent;return e?new Bt(this.firestore,e):null}doc(e){try{return e===void 0?new Bt(this.firestore,gu(this._delegate)):new Bt(this.firestore,gu(this._delegate,e))}catch(t){throw _t(t,"doc()","CollectionReference.doc()")}}add(e){return DO(this._delegate,e).then(t=>new Bt(this.firestore,t))}isEqual(e){return bT(this._delegate,e._delegate)}withConverter(e){return new Ds(this.firestore,e?this._delegate.withConverter(Si.getInstance(this.firestore,e)):this._delegate.withConverter(null))}}function ai(n){return ae(n,ue)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vp{constructor(...e){this._delegate=new Cr(...e)}static documentId(){return new vp(Ue.keyField().canonicalString())}isEqual(e){return e=z(e),e instanceof Cr?this._delegate._internalPath.isEqual(e._internalPath):!1}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ni{static serverTimestamp(){const e=pV();return e._methodName="FieldValue.serverTimestamp",new ni(e)}static delete(){const e=fV();return e._methodName="FieldValue.delete",new ni(e)}static arrayUnion(...e){const t=mV(...e);return t._methodName="FieldValue.arrayUnion",new ni(t)}static arrayRemove(...e){const t=gV(...e);return t._methodName="FieldValue.arrayRemove",new ni(t)}static increment(e){const t=_V(e);return t._methodName="FieldValue.increment",new ni(t)}constructor(e){this._delegate=e}isEqual(e){return this._delegate.isEqual(e._delegate)}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qO={Firestore:sv,GeoPoint:Qt,Timestamp:le,Blob:iv,Transaction:ov,WriteBatch:av,DocumentReference:Bt,DocumentSnapshot:Da,Query:gt,QueryDocumentSnapshot:xa,QuerySnapshot:yd,CollectionReference:Ds,FieldPath:vp,FieldValue:ni,setLogLevel:UO,CACHE_SIZE_UNLIMITED:iO};function $O(n,e){n.INTERNAL.registerComponent(new Be("firestore-compat",t=>{const r=t.getProvider("app-compat").getImmediate(),i=t.getProvider("firestore").getImmediate();return e(r,i)},"PUBLIC").setServiceProps(G({},qO)))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function jO(n){$O(n,(e,t)=>new sv(e,t,new FO)),n.registerVersion(OO,LO)}jO(Rn);/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const lv="firebasestorage.googleapis.com",hv="storageBucket",zO=2*60*1e3,KO=10*60*1e3,GO=1e3;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class be extends Fe{constructor(e,t,r=0){super(Eh(e),`Firebase Storage: ${t} (${Eh(e)})`),this.status_=r,this.customData={serverResponse:null},this._baseMessage=this.message,Object.setPrototypeOf(this,be.prototype)}get status(){return this.status_}set status(e){this.status_=e}_codeEquals(e){return Eh(e)===this.code}get serverResponse(){return this.customData.serverResponse}set serverResponse(e){this.customData.serverResponse=e,this.customData.serverResponse?this.message=`${this._baseMessage}
${this.customData.serverResponse}`:this.message=this._baseMessage}}var Te;(function(n){n.UNKNOWN="unknown",n.OBJECT_NOT_FOUND="object-not-found",n.BUCKET_NOT_FOUND="bucket-not-found",n.PROJECT_NOT_FOUND="project-not-found",n.QUOTA_EXCEEDED="quota-exceeded",n.UNAUTHENTICATED="unauthenticated",n.UNAUTHORIZED="unauthorized",n.UNAUTHORIZED_APP="unauthorized-app",n.RETRY_LIMIT_EXCEEDED="retry-limit-exceeded",n.INVALID_CHECKSUM="invalid-checksum",n.CANCELED="canceled",n.INVALID_EVENT_NAME="invalid-event-name",n.INVALID_URL="invalid-url",n.INVALID_DEFAULT_BUCKET="invalid-default-bucket",n.NO_DEFAULT_BUCKET="no-default-bucket",n.CANNOT_SLICE_BLOB="cannot-slice-blob",n.SERVER_FILE_WRONG_SIZE="server-file-wrong-size",n.NO_DOWNLOAD_URL="no-download-url",n.INVALID_ARGUMENT="invalid-argument",n.INVALID_ARGUMENT_COUNT="invalid-argument-count",n.APP_DELETED="app-deleted",n.INVALID_ROOT_OPERATION="invalid-root-operation",n.INVALID_FORMAT="invalid-format",n.INTERNAL_ERROR="internal-error",n.UNSUPPORTED_ENVIRONMENT="unsupported-environment"})(Te||(Te={}));function Eh(n){return"storage/"+n}function Ap(){const n="An unknown error occurred, please check the error payload for server response.";return new be(Te.UNKNOWN,n)}function WO(n){return new be(Te.OBJECT_NOT_FOUND,"Object '"+n+"' does not exist.")}function HO(n){return new be(Te.QUOTA_EXCEEDED,"Quota for bucket '"+n+"' exceeded, please view quota on https://firebase.google.com/pricing/.")}function QO(){const n="User is not authenticated, please authenticate using Firebase Authentication and try again.";return new be(Te.UNAUTHENTICATED,n)}function JO(){return new be(Te.UNAUTHORIZED_APP,"This app does not have permission to access Firebase Storage on this project.")}function YO(n){return new be(Te.UNAUTHORIZED,"User does not have permission to access '"+n+"'.")}function dv(){return new be(Te.RETRY_LIMIT_EXCEEDED,"Max retry time for operation exceeded, please try again.")}function fv(){return new be(Te.CANCELED,"User canceled the upload/download.")}function XO(n){return new be(Te.INVALID_URL,"Invalid URL '"+n+"'.")}function ZO(n){return new be(Te.INVALID_DEFAULT_BUCKET,"Invalid default bucket '"+n+"'.")}function eL(){return new be(Te.NO_DEFAULT_BUCKET,"No default bucket found. Did you set the '"+hv+"' property when initializing the app?")}function pv(){return new be(Te.CANNOT_SLICE_BLOB,"Cannot slice blob for upload. Please retry the upload.")}function tL(){return new be(Te.SERVER_FILE_WRONG_SIZE,"Server recorded incorrect upload file size, please retry the upload.")}function nL(){return new be(Te.NO_DOWNLOAD_URL,"The given file does not have any download URLs.")}function rL(n){return new be(Te.UNSUPPORTED_ENVIRONMENT,`${n} is missing. Make sure to install the required polyfills. See https://firebase.google.com/docs/web/environments-js-sdk#polyfills for more information.`)}function us(n){return new be(Te.INVALID_ARGUMENT,n)}function mv(){return new be(Te.APP_DELETED,"The Firebase app was deleted.")}function gv(n){return new be(Te.INVALID_ROOT_OPERATION,"The operation '"+n+"' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png').")}function oa(n,e){return new be(Te.INVALID_FORMAT,"String does not match format '"+n+"': "+e)}function xo(n){throw new be(Te.INTERNAL_ERROR,"Internal error: "+n)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ct{constructor(e,t){this.bucket=e,this.path_=t}get path(){return this.path_}get isRoot(){return this.path.length===0}fullServerUrl(){const e=encodeURIComponent;return"/b/"+e(this.bucket)+"/o/"+e(this.path)}bucketOnlyServerUrl(){return"/b/"+encodeURIComponent(this.bucket)+"/o"}static makeFromBucketSpec(e,t){let r;try{r=ct.makeFromUrl(e,t)}catch(i){return new ct(e,"")}if(r.path==="")return r;throw ZO(e)}static makeFromUrl(e,t){let r=null;const i="([A-Za-z0-9.\\-_]+)";function s(X){X.path.charAt(X.path.length-1)==="/"&&(X.path_=X.path_.slice(0,-1))}const o="(/(.*))?$",a=new RegExp("^gs://"+i+o,"i"),u={bucket:1,path:3};function l(X){X.path_=decodeURIComponent(X.path)}const h="v[A-Za-z0-9_]+",f=t.replace(/[.]/g,"\\."),g="(/([^?#]*).*)?$",w=new RegExp(`^https?://${f}/${h}/b/${i}/o${g}`,"i"),S={bucket:1,path:3},D=t===lv?"(?:storage.googleapis.com|storage.cloud.google.com)":t,x="([^?#]*)",W=new RegExp(`^https?://${D}/${i}/${x}`,"i"),K=[{regex:a,indices:u,postModify:s},{regex:w,indices:S,postModify:l},{regex:W,indices:{bucket:1,path:2},postModify:l}];for(let X=0;X<K.length;X++){const ee=K[X],ne=ee.regex.exec(e);if(ne){const E=ne[ee.indices.bucket];let y=ne[ee.indices.path];y||(y=""),r=new ct(E,y),ee.postModify(r);break}}if(r==null)throw XO(e);return r}}class iL{constructor(e){this.promise_=Promise.reject(e)}getPromise(){return this.promise_}cancel(e=!1){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function sL(n,e,t){let r=1,i=null,s=null,o=!1,a=0;function u(){return a===2}let l=!1;function h(...x){l||(l=!0,e.apply(null,x))}function f(x){i=setTimeout(()=>{i=null,n(w,u())},x)}function g(){s&&clearTimeout(s)}function w(x,...W){if(l){g();return}if(x){g(),h.call(null,x,...W);return}if(u()||o){g(),h.call(null,x,...W);return}r<64&&(r*=2);let K;a===1?(a=2,K=0):K=(r+Math.random())*1e3,f(K)}let S=!1;function D(x){S||(S=!0,g(),!l&&(i!==null?(x||(a=2),clearTimeout(i),f(0)):x||(a=1)))}return f(0),s=setTimeout(()=>{o=!0,D(!0)},t),D}function oL(n){n(!1)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function aL(n){return n!==void 0}function cL(n){return typeof n=="function"}function uL(n){return typeof n=="object"&&!Array.isArray(n)}function Cl(n){return typeof n=="string"||n instanceof String}function Z_(n){return bp()&&n instanceof Blob}function bp(){return typeof Blob!="undefined"}function wd(n,e,t,r){if(r<e)throw us(`Invalid value for '${n}'. Expected ${e} or greater.`);if(r>t)throw us(`Invalid value for '${n}'. Expected ${t} or less.`)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qr(n,e,t){let r=e;return t==null&&(r=`https://${e}`),`${t}://${r}/v0${n}`}function _v(n){const e=encodeURIComponent;let t="?";for(const r in n)if(n.hasOwnProperty(r)){const i=e(r)+"="+e(n[r]);t=t+i+"&"}return t=t.slice(0,-1),t}var pi;(function(n){n[n.NO_ERROR=0]="NO_ERROR",n[n.NETWORK_ERROR=1]="NETWORK_ERROR",n[n.ABORT=2]="ABORT"})(pi||(pi={}));/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function yv(n,e){const t=n>=500&&n<600,i=[408,429].indexOf(n)!==-1,s=e.indexOf(n)!==-1;return t||i||s}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lL{constructor(e,t,r,i,s,o,a,u,l,h,f,g=!0,w=!1){this.url_=e,this.method_=t,this.headers_=r,this.body_=i,this.successCodes_=s,this.additionalRetryCodes_=o,this.callback_=a,this.errorCallback_=u,this.timeout_=l,this.progressCallback_=h,this.connectionFactory_=f,this.retry=g,this.isUsingEmulator=w,this.pendingConnection_=null,this.backoffId_=null,this.canceled_=!1,this.appDelete_=!1,this.promise_=new Promise((S,D)=>{this.resolve_=S,this.reject_=D,this.start_()})}start_(){const e=(r,i)=>{if(i){r(!1,new Mc(!1,null,!0));return}const s=this.connectionFactory_();this.pendingConnection_=s;const o=a=>{const u=a.loaded,l=a.lengthComputable?a.total:-1;this.progressCallback_!==null&&this.progressCallback_(u,l)};this.progressCallback_!==null&&s.addUploadProgressListener(o),s.send(this.url_,this.method_,this.isUsingEmulator,this.body_,this.headers_).then(()=>{this.progressCallback_!==null&&s.removeUploadProgressListener(o),this.pendingConnection_=null;const a=s.getErrorCode()===pi.NO_ERROR,u=s.getStatus();if(!a||yv(u,this.additionalRetryCodes_)&&this.retry){const h=s.getErrorCode()===pi.ABORT;r(!1,new Mc(!1,null,h));return}const l=this.successCodes_.indexOf(u)!==-1;r(!0,new Mc(l,s))})},t=(r,i)=>{const s=this.resolve_,o=this.reject_,a=i.connection;if(i.wasSuccessCode)try{const u=this.callback_(a,a.getResponse());aL(u)?s(u):s()}catch(u){o(u)}else if(a!==null){const u=Ap();u.serverResponse=a.getErrorText(),this.errorCallback_?o(this.errorCallback_(a,u)):o(u)}else if(i.canceled){const u=this.appDelete_?mv():fv();o(u)}else{const u=dv();o(u)}};this.canceled_?t(!1,new Mc(!1,null,!0)):this.backoffId_=sL(e,t,this.timeout_)}getPromise(){return this.promise_}cancel(e){this.canceled_=!0,this.appDelete_=e||!1,this.backoffId_!==null&&oL(this.backoffId_),this.pendingConnection_!==null&&this.pendingConnection_.abort()}}class Mc{constructor(e,t,r){this.wasSuccessCode=e,this.connection=t,this.canceled=!!r}}function hL(n,e){e!==null&&e.length>0&&(n.Authorization="Firebase "+e)}function dL(n,e){n["X-Firebase-Storage-Version"]="webjs/"+(e!=null?e:"AppManager")}function fL(n,e){e&&(n["X-Firebase-GMPID"]=e)}function pL(n,e){e!==null&&(n["X-Firebase-AppCheck"]=e)}function mL(n,e,t,r,i,s,o=!0,a=!1){const u=_v(n.urlParams),l=n.url+u,h=Object.assign({},n.headers);return fL(h,e),hL(h,t),dL(h,s),pL(h,r),new lL(l,n.method,h,n.body,n.successCodes,n.additionalRetryCodes,n.handler,n.errorHandler,n.timeout,n.progressCallback,i,o,a)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function gL(){return typeof BlobBuilder!="undefined"?BlobBuilder:typeof WebKitBlobBuilder!="undefined"?WebKitBlobBuilder:void 0}function _L(...n){const e=gL();if(e!==void 0){const t=new e;for(let r=0;r<n.length;r++)t.append(n[r]);return t.getBlob()}else{if(bp())return new Blob(n);throw new be(Te.UNSUPPORTED_ENVIRONMENT,"This browser doesn't seem to support creating Blobs")}}function yL(n,e,t){return n.webkitSlice?n.webkitSlice(e,t):n.mozSlice?n.mozSlice(e,t):n.slice?n.slice(e,t):null}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function wL(n){if(typeof atob=="undefined")throw rL("base-64");return atob(n)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qt={RAW:"raw",BASE64:"base64",BASE64URL:"base64url",DATA_URL:"data_url"};class vh{constructor(e,t){this.data=e,this.contentType=t||null}}function wv(n,e){switch(n){case qt.RAW:return new vh(Iv(e));case qt.BASE64:case qt.BASE64URL:return new vh(Tv(n,e));case qt.DATA_URL:return new vh(TL(e),EL(e))}throw Ap()}function Iv(n){const e=[];for(let t=0;t<n.length;t++){let r=n.charCodeAt(t);if(r<=127)e.push(r);else if(r<=2047)e.push(192|r>>6,128|r&63);else if((r&64512)===55296)if(!(t<n.length-1&&(n.charCodeAt(t+1)&64512)===56320))e.push(239,191,189);else{const s=r,o=n.charCodeAt(++t);r=65536|(s&1023)<<10|o&1023,e.push(240|r>>18,128|r>>12&63,128|r>>6&63,128|r&63)}else(r&64512)===56320?e.push(239,191,189):e.push(224|r>>12,128|r>>6&63,128|r&63)}return new Uint8Array(e)}function IL(n){let e;try{e=decodeURIComponent(n)}catch(t){throw oa(qt.DATA_URL,"Malformed data URL.")}return Iv(e)}function Tv(n,e){switch(n){case qt.BASE64:{const i=e.indexOf("-")!==-1,s=e.indexOf("_")!==-1;if(i||s)throw oa(n,"Invalid character '"+(i?"-":"_")+"' found: is it base64url encoded?");break}case qt.BASE64URL:{const i=e.indexOf("+")!==-1,s=e.indexOf("/")!==-1;if(i||s)throw oa(n,"Invalid character '"+(i?"+":"/")+"' found: is it base64 encoded?");e=e.replace(/-/g,"+").replace(/_/g,"/");break}}let t;try{t=wL(e)}catch(i){throw i.message.includes("polyfill")?i:oa(n,"Invalid character found")}const r=new Uint8Array(t.length);for(let i=0;i<t.length;i++)r[i]=t.charCodeAt(i);return r}class Ev{constructor(e){this.base64=!1,this.contentType=null;const t=e.match(/^data:([^,]+)?,/);if(t===null)throw oa(qt.DATA_URL,"Must be formatted 'data:[<mediatype>][;base64],<data>");const r=t[1]||null;r!=null&&(this.base64=vL(r,";base64"),this.contentType=this.base64?r.substring(0,r.length-7):r),this.rest=e.substring(e.indexOf(",")+1)}}function TL(n){const e=new Ev(n);return e.base64?Tv(qt.BASE64,e.rest):IL(e.rest)}function EL(n){return new Ev(n).contentType}function vL(n,e){return n.length>=e.length?n.substring(n.length-e.length)===e:!1}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kn{constructor(e,t){let r=0,i="";Z_(e)?(this.data_=e,r=e.size,i=e.type):e instanceof ArrayBuffer?(t?this.data_=new Uint8Array(e):(this.data_=new Uint8Array(e.byteLength),this.data_.set(new Uint8Array(e))),r=this.data_.length):e instanceof Uint8Array&&(t?this.data_=e:(this.data_=new Uint8Array(e.length),this.data_.set(e)),r=e.length),this.size_=r,this.type_=i}size(){return this.size_}type(){return this.type_}slice(e,t){if(Z_(this.data_)){const r=this.data_,i=yL(r,e,t);return i===null?null:new kn(i)}else{const r=new Uint8Array(this.data_.buffer,e,t-e);return new kn(r,!0)}}static getBlob(...e){if(bp()){const t=e.map(r=>r instanceof kn?r.data_:r);return new kn(_L.apply(null,t))}else{const t=e.map(o=>Cl(o)?wv(qt.RAW,o).data:o.data_);let r=0;t.forEach(o=>{r+=o.byteLength});const i=new Uint8Array(r);let s=0;return t.forEach(o=>{for(let a=0;a<o.length;a++)i[s++]=o[a]}),new kn(i,!0)}}uploadData(){return this.data_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Rp(n){let e;try{e=JSON.parse(n)}catch(t){return null}return uL(e)?e:null}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function AL(n){if(n.length===0)return null;const e=n.lastIndexOf("/");return e===-1?"":n.slice(0,e)}function bL(n,e){const t=e.split("/").filter(r=>r.length>0).join("/");return n.length===0?t:n+"/"+t}function vv(n){const e=n.lastIndexOf("/",n.length-2);return e===-1?n:n.slice(e+1)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function RL(n,e){return e}class mt{constructor(e,t,r,i){this.server=e,this.local=t||e,this.writable=!!r,this.xform=i||RL}}let Fc=null;function SL(n){return!Cl(n)||n.length<2?n:vv(n)}function kl(){if(Fc)return Fc;const n=[];n.push(new mt("bucket")),n.push(new mt("generation")),n.push(new mt("metageneration")),n.push(new mt("name","fullPath",!0));function e(s,o){return SL(o)}const t=new mt("name");t.xform=e,n.push(t);function r(s,o){return o!==void 0?Number(o):o}const i=new mt("size");return i.xform=r,n.push(i),n.push(new mt("timeCreated")),n.push(new mt("updated")),n.push(new mt("md5Hash",null,!0)),n.push(new mt("cacheControl",null,!0)),n.push(new mt("contentDisposition",null,!0)),n.push(new mt("contentEncoding",null,!0)),n.push(new mt("contentLanguage",null,!0)),n.push(new mt("contentType",null,!0)),n.push(new mt("metadata","customMetadata",!0)),Fc=n,Fc}function PL(n,e){function t(){const r=n.bucket,i=n.fullPath,s=new ct(r,i);return e._makeStorageReference(s)}Object.defineProperty(n,"ref",{get:t})}function CL(n,e,t){const r={};r.type="file";const i=t.length;for(let s=0;s<i;s++){const o=t[s];r[o.local]=o.xform(r,e[o.server])}return PL(r,n),r}function Av(n,e,t){const r=Rp(e);return r===null?null:CL(n,r,t)}function kL(n,e,t,r){const i=Rp(e);if(i===null||!Cl(i.downloadTokens))return null;const s=i.downloadTokens;if(s.length===0)return null;const o=encodeURIComponent;return s.split(",").map(l=>{const h=n.bucket,f=n.fullPath,g="/b/"+o(h)+"/o/"+o(f),w=qr(g,t,r),S=_v({alt:"media",token:l});return w+S})[0]}function Sp(n,e){const t={},r=e.length;for(let i=0;i<r;i++){const s=e[i];s.writable&&(t[s.server]=n[s.local])}return JSON.stringify(t)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ey="prefixes",ty="items";function NL(n,e,t){const r={prefixes:[],items:[],nextPageToken:t.nextPageToken};if(t[ey])for(const i of t[ey]){const s=i.replace(/\/$/,""),o=n._makeStorageReference(new ct(e,s));r.prefixes.push(o)}if(t[ty])for(const i of t[ty]){const s=n._makeStorageReference(new ct(e,i.name));r.items.push(s)}return r}function VL(n,e,t){const r=Rp(t);return r===null?null:NL(n,e,r)}class Zn{constructor(e,t,r,i){this.url=e,this.method=t,this.handler=r,this.timeout=i,this.urlParams={},this.headers={},this.body=null,this.errorHandler=null,this.progressCallback=null,this.successCodes=[200],this.additionalRetryCodes=[]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function In(n){if(!n)throw Ap()}function Nl(n,e){function t(r,i){const s=Av(n,i,e);return In(s!==null),s}return t}function DL(n,e){function t(r,i){const s=VL(n,e,i);return In(s!==null),s}return t}function xL(n,e){function t(r,i){const s=Av(n,i,e);return In(s!==null),kL(s,i,n.host,n._protocol)}return t}function eo(n){function e(t,r){let i;return t.getStatus()===401?t.getErrorText().includes("Firebase App Check token is invalid")?i=JO():i=QO():t.getStatus()===402?i=HO(n.bucket):t.getStatus()===403?i=YO(n.path):i=r,i.status=t.getStatus(),i.serverResponse=r.serverResponse,i}return e}function Vl(n){const e=eo(n);function t(r,i){let s=e(r,i);return r.getStatus()===404&&(s=WO(n.path)),s.serverResponse=i.serverResponse,s}return t}function bv(n,e,t){const r=e.fullServerUrl(),i=qr(r,n.host,n._protocol),s="GET",o=n.maxOperationRetryTime,a=new Zn(i,s,Nl(n,t),o);return a.errorHandler=Vl(e),a}function OL(n,e,t,r,i){const s={};e.isRoot?s.prefix="":s.prefix=e.path+"/",t.length>0&&(s.delimiter=t),r&&(s.pageToken=r),i&&(s.maxResults=i);const o=e.bucketOnlyServerUrl(),a=qr(o,n.host,n._protocol),u="GET",l=n.maxOperationRetryTime,h=new Zn(a,u,DL(n,e.bucket),l);return h.urlParams=s,h.errorHandler=eo(e),h}function LL(n,e,t){const r=e.fullServerUrl(),i=qr(r,n.host,n._protocol),s="GET",o=n.maxOperationRetryTime,a=new Zn(i,s,xL(n,t),o);return a.errorHandler=Vl(e),a}function ML(n,e,t,r){const i=e.fullServerUrl(),s=qr(i,n.host,n._protocol),o="PATCH",a=Sp(t,r),u={"Content-Type":"application/json; charset=utf-8"},l=n.maxOperationRetryTime,h=new Zn(s,o,Nl(n,r),l);return h.headers=u,h.body=a,h.errorHandler=Vl(e),h}function FL(n,e){const t=e.fullServerUrl(),r=qr(t,n.host,n._protocol),i="DELETE",s=n.maxOperationRetryTime;function o(u,l){}const a=new Zn(r,i,o,s);return a.successCodes=[200,204],a.errorHandler=Vl(e),a}function UL(n,e){return n&&n.contentType||e&&e.type()||"application/octet-stream"}function Rv(n,e,t){const r=Object.assign({},t);return r.fullPath=n.path,r.size=e.size(),r.contentType||(r.contentType=UL(null,e)),r}function BL(n,e,t,r,i){const s=e.bucketOnlyServerUrl(),o={"X-Goog-Upload-Protocol":"multipart"};function a(){let K="";for(let X=0;X<2;X++)K=K+Math.random().toString().slice(2);return K}const u=a();o["Content-Type"]="multipart/related; boundary="+u;const l=Rv(e,r,i),h=Sp(l,t),f="--"+u+`\r
Content-Type: application/json; charset=utf-8\r
\r
`+h+`\r
--`+u+`\r
Content-Type: `+l.contentType+`\r
\r
`,g=`\r
--`+u+"--",w=kn.getBlob(f,r,g);if(w===null)throw pv();const S={name:l.fullPath},D=qr(s,n.host,n._protocol),x="POST",W=n.maxUploadRetryTime,Q=new Zn(D,x,Nl(n,t),W);return Q.urlParams=S,Q.headers=o,Q.body=w.uploadData(),Q.errorHandler=eo(e),Q}class Nu{constructor(e,t,r,i){this.current=e,this.total=t,this.finalized=!!r,this.metadata=i||null}}function Pp(n,e){let t=null;try{t=n.getResponseHeader("X-Goog-Upload-Status")}catch(i){In(!1)}return In(!!t&&(e||["active"]).indexOf(t)!==-1),t}function qL(n,e,t,r,i){const s=e.bucketOnlyServerUrl(),o=Rv(e,r,i),a={name:o.fullPath},u=qr(s,n.host,n._protocol),l="POST",h={"X-Goog-Upload-Protocol":"resumable","X-Goog-Upload-Command":"start","X-Goog-Upload-Header-Content-Length":`${r.size()}`,"X-Goog-Upload-Header-Content-Type":o.contentType,"Content-Type":"application/json; charset=utf-8"},f=Sp(o,t),g=n.maxUploadRetryTime;function w(D){Pp(D);let x;try{x=D.getResponseHeader("X-Goog-Upload-URL")}catch(W){In(!1)}return In(Cl(x)),x}const S=new Zn(u,l,w,g);return S.urlParams=a,S.headers=h,S.body=f,S.errorHandler=eo(e),S}function $L(n,e,t,r){const i={"X-Goog-Upload-Command":"query"};function s(l){const h=Pp(l,["active","final"]);let f=null;try{f=l.getResponseHeader("X-Goog-Upload-Size-Received")}catch(w){In(!1)}f||In(!1);const g=Number(f);return In(!isNaN(g)),new Nu(g,r.size(),h==="final")}const o="POST",a=n.maxUploadRetryTime,u=new Zn(t,o,s,a);return u.headers=i,u.errorHandler=eo(e),u}const ny=256*1024;function jL(n,e,t,r,i,s,o,a){const u=new Nu(0,0);if(o?(u.current=o.current,u.total=o.total):(u.current=0,u.total=r.size()),r.size()!==u.total)throw tL();const l=u.total-u.current;let h=l;i>0&&(h=Math.min(h,i));const f=u.current,g=f+h;let w="";h===0?w="finalize":l===h?w="upload, finalize":w="upload";const S={"X-Goog-Upload-Command":w,"X-Goog-Upload-Offset":`${u.current}`},D=r.slice(f,g);if(D===null)throw pv();function x(X,ee){const ne=Pp(X,["active","final"]),E=u.current+h,y=r.size();let T;return ne==="final"?T=Nl(e,s)(X,ee):T=null,new Nu(E,y,ne==="final",T)}const W="POST",Q=e.maxUploadRetryTime,K=new Zn(t,W,x,Q);return K.headers=S,K.body=D.uploadData(),K.progressCallback=a||null,K.errorHandler=eo(n),K}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zL={STATE_CHANGED:"state_changed"},yt={RUNNING:"running",PAUSED:"paused",SUCCESS:"success",CANCELED:"canceled",ERROR:"error"};function Ah(n){switch(n){case"running":case"pausing":case"canceling":return yt.RUNNING;case"paused":return yt.PAUSED;case"success":return yt.SUCCESS;case"canceled":return yt.CANCELED;case"error":return yt.ERROR;default:return yt.ERROR}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class KL{constructor(e,t,r){if(cL(e)||t!=null||r!=null)this.next=e,this.error=t!=null?t:void 0,this.complete=r!=null?r:void 0;else{const s=e;this.next=s.next,this.error=s.error,this.complete=s.complete}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Qi(n){return(...e)=>{Promise.resolve().then(()=>n(...e))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class GL{constructor(){this.sent_=!1,this.xhr_=new XMLHttpRequest,this.initXhr(),this.errorCode_=pi.NO_ERROR,this.sendPromise_=new Promise(e=>{this.xhr_.addEventListener("abort",()=>{this.errorCode_=pi.ABORT,e()}),this.xhr_.addEventListener("error",()=>{this.errorCode_=pi.NETWORK_ERROR,e()}),this.xhr_.addEventListener("load",()=>{e()})})}send(e,t,r,i,s){if(this.sent_)throw xo("cannot .send() more than once");if(Kn(e)&&r&&(this.xhr_.withCredentials=!0),this.sent_=!0,this.xhr_.open(t,e,!0),s!==void 0)for(const o in s)s.hasOwnProperty(o)&&this.xhr_.setRequestHeader(o,s[o].toString());return i!==void 0?this.xhr_.send(i):this.xhr_.send(),this.sendPromise_}getErrorCode(){if(!this.sent_)throw xo("cannot .getErrorCode() before sending");return this.errorCode_}getStatus(){if(!this.sent_)throw xo("cannot .getStatus() before sending");try{return this.xhr_.status}catch(e){return-1}}getResponse(){if(!this.sent_)throw xo("cannot .getResponse() before sending");return this.xhr_.response}getErrorText(){if(!this.sent_)throw xo("cannot .getErrorText() before sending");return this.xhr_.statusText}abort(){this.xhr_.abort()}getResponseHeader(e){return this.xhr_.getResponseHeader(e)}addUploadProgressListener(e){this.xhr_.upload!=null&&this.xhr_.upload.addEventListener("progress",e)}removeUploadProgressListener(e){this.xhr_.upload!=null&&this.xhr_.upload.removeEventListener("progress",e)}}class WL extends GL{initXhr(){this.xhr_.responseType="text"}}function un(){return new WL}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Sv{isExponentialBackoffExpired(){return this.sleepTime>this.maxSleepTime}constructor(e,t,r=null){this._transferred=0,this._needToFetchStatus=!1,this._needToFetchMetadata=!1,this._observers=[],this._error=void 0,this._uploadUrl=void 0,this._request=void 0,this._chunkMultiplier=1,this._resolve=void 0,this._reject=void 0,this._ref=e,this._blob=t,this._metadata=r,this._mappings=kl(),this._resumable=this._shouldDoResumable(this._blob),this._state="running",this._errorHandler=i=>{if(this._request=void 0,this._chunkMultiplier=1,i._codeEquals(Te.CANCELED))this._needToFetchStatus=!0,this.completeTransitions_();else{const s=this.isExponentialBackoffExpired();if(yv(i.status,[]))if(s)i=dv();else{this.sleepTime=Math.max(this.sleepTime*2,GO),this._needToFetchStatus=!0,this.completeTransitions_();return}this._error=i,this._transition("error")}},this._metadataErrorHandler=i=>{this._request=void 0,i._codeEquals(Te.CANCELED)?this.completeTransitions_():(this._error=i,this._transition("error"))},this.sleepTime=0,this.maxSleepTime=this._ref.storage.maxUploadRetryTime,this._promise=new Promise((i,s)=>{this._resolve=i,this._reject=s,this._start()}),this._promise.then(null,()=>{})}_makeProgressCallback(){const e=this._transferred;return t=>this._updateProgress(e+t)}_shouldDoResumable(e){return e.size()>256*1024}_start(){this._state==="running"&&this._request===void 0&&(this._resumable?this._uploadUrl===void 0?this._createResumable():this._needToFetchStatus?this._fetchStatus():this._needToFetchMetadata?this._fetchMetadata():this.pendingTimeout=setTimeout(()=>{this.pendingTimeout=void 0,this._continueUpload()},this.sleepTime):this._oneShotUpload())}_resolveToken(e){Promise.all([this._ref.storage._getAuthToken(),this._ref.storage._getAppCheckToken()]).then(([t,r])=>{switch(this._state){case"running":e(t,r);break;case"canceling":this._transition("canceled");break;case"pausing":this._transition("paused");break}})}_createResumable(){this._resolveToken((e,t)=>{const r=qL(this._ref.storage,this._ref._location,this._mappings,this._blob,this._metadata),i=this._ref.storage._makeRequest(r,un,e,t);this._request=i,i.getPromise().then(s=>{this._request=void 0,this._uploadUrl=s,this._needToFetchStatus=!1,this.completeTransitions_()},this._errorHandler)})}_fetchStatus(){const e=this._uploadUrl;this._resolveToken((t,r)=>{const i=$L(this._ref.storage,this._ref._location,e,this._blob),s=this._ref.storage._makeRequest(i,un,t,r);this._request=s,s.getPromise().then(o=>{o=o,this._request=void 0,this._updateProgress(o.current),this._needToFetchStatus=!1,o.finalized&&(this._needToFetchMetadata=!0),this.completeTransitions_()},this._errorHandler)})}_continueUpload(){const e=ny*this._chunkMultiplier,t=new Nu(this._transferred,this._blob.size()),r=this._uploadUrl;this._resolveToken((i,s)=>{let o;try{o=jL(this._ref._location,this._ref.storage,r,this._blob,e,this._mappings,t,this._makeProgressCallback())}catch(u){this._error=u,this._transition("error");return}const a=this._ref.storage._makeRequest(o,un,i,s,!1);this._request=a,a.getPromise().then(u=>{this._increaseMultiplier(),this._request=void 0,this._updateProgress(u.current),u.finalized?(this._metadata=u.metadata,this._transition("success")):this.completeTransitions_()},this._errorHandler)})}_increaseMultiplier(){ny*this._chunkMultiplier*2<32*1024*1024&&(this._chunkMultiplier*=2)}_fetchMetadata(){this._resolveToken((e,t)=>{const r=bv(this._ref.storage,this._ref._location,this._mappings),i=this._ref.storage._makeRequest(r,un,e,t);this._request=i,i.getPromise().then(s=>{this._request=void 0,this._metadata=s,this._transition("success")},this._metadataErrorHandler)})}_oneShotUpload(){this._resolveToken((e,t)=>{const r=BL(this._ref.storage,this._ref._location,this._mappings,this._blob,this._metadata),i=this._ref.storage._makeRequest(r,un,e,t);this._request=i,i.getPromise().then(s=>{this._request=void 0,this._metadata=s,this._updateProgress(this._blob.size()),this._transition("success")},this._errorHandler)})}_updateProgress(e){const t=this._transferred;this._transferred=e,this._transferred!==t&&this._notifyObservers()}_transition(e){if(this._state!==e)switch(e){case"canceling":case"pausing":this._state=e,this._request!==void 0?this._request.cancel():this.pendingTimeout&&(clearTimeout(this.pendingTimeout),this.pendingTimeout=void 0,this.completeTransitions_());break;case"running":const t=this._state==="paused";this._state=e,t&&(this._notifyObservers(),this._start());break;case"paused":this._state=e,this._notifyObservers();break;case"canceled":this._error=fv(),this._state=e,this._notifyObservers();break;case"error":this._state=e,this._notifyObservers();break;case"success":this._state=e,this._notifyObservers();break}}completeTransitions_(){switch(this._state){case"pausing":this._transition("paused");break;case"canceling":this._transition("canceled");break;case"running":this._start();break}}get snapshot(){const e=Ah(this._state);return{bytesTransferred:this._transferred,totalBytes:this._blob.size(),state:e,metadata:this._metadata,task:this,ref:this._ref}}on(e,t,r,i){const s=new KL(t||void 0,r||void 0,i||void 0);return this._addObserver(s),()=>{this._removeObserver(s)}}then(e,t){return this._promise.then(e,t)}catch(e){return this.then(null,e)}_addObserver(e){this._observers.push(e),this._notifyObserver(e)}_removeObserver(e){const t=this._observers.indexOf(e);t!==-1&&this._observers.splice(t,1)}_notifyObservers(){this._finishPromise(),this._observers.slice().forEach(t=>{this._notifyObserver(t)})}_finishPromise(){if(this._resolve!==void 0){let e=!0;switch(Ah(this._state)){case yt.SUCCESS:Qi(this._resolve.bind(null,this.snapshot))();break;case yt.CANCELED:case yt.ERROR:const t=this._reject;Qi(t.bind(null,this._error))();break;default:e=!1;break}e&&(this._resolve=void 0,this._reject=void 0)}}_notifyObserver(e){switch(Ah(this._state)){case yt.RUNNING:case yt.PAUSED:e.next&&Qi(e.next.bind(e,this.snapshot))();break;case yt.SUCCESS:e.complete&&Qi(e.complete.bind(e))();break;case yt.CANCELED:case yt.ERROR:e.error&&Qi(e.error.bind(e,this._error))();break;default:e.error&&Qi(e.error.bind(e,this._error))()}}resume(){const e=this._state==="paused"||this._state==="pausing";return e&&this._transition("running"),e}pause(){const e=this._state==="running";return e&&this._transition("pausing"),e}cancel(){const e=this._state==="running"||this._state==="pausing";return e&&this._transition("canceling"),e}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pi{constructor(e,t){this._service=e,t instanceof ct?this._location=t:this._location=ct.makeFromUrl(t,e.host)}toString(){return"gs://"+this._location.bucket+"/"+this._location.path}_newRef(e,t){return new Pi(e,t)}get root(){const e=new ct(this._location.bucket,"");return this._newRef(this._service,e)}get bucket(){return this._location.bucket}get fullPath(){return this._location.path}get name(){return vv(this._location.path)}get storage(){return this._service}get parent(){const e=AL(this._location.path);if(e===null)return null;const t=new ct(this._location.bucket,e);return new Pi(this._service,t)}_throwIfRoot(e){if(this._location.path==="")throw gv(e)}}function HL(n,e,t){return n._throwIfRoot("uploadBytesResumable"),new Sv(n,new kn(e),t)}function QL(n){const e={prefixes:[],items:[]};return Pv(n,e).then(()=>e)}function Pv(n,e,t){return p(this,null,function*(){const i=yield Cv(n,{pageToken:t});e.prefixes.push(...i.prefixes),e.items.push(...i.items),i.nextPageToken!=null&&(yield Pv(n,e,i.nextPageToken))})}function Cv(n,e){e!=null&&typeof e.maxResults=="number"&&wd("options.maxResults",1,1e3,e.maxResults);const t=e||{},r=OL(n.storage,n._location,"/",t.pageToken,t.maxResults);return n.storage.makeRequestWithTokens(r,un)}function JL(n){n._throwIfRoot("getMetadata");const e=bv(n.storage,n._location,kl());return n.storage.makeRequestWithTokens(e,un)}function YL(n,e){n._throwIfRoot("updateMetadata");const t=ML(n.storage,n._location,e,kl());return n.storage.makeRequestWithTokens(t,un)}function XL(n){n._throwIfRoot("getDownloadURL");const e=LL(n.storage,n._location,kl());return n.storage.makeRequestWithTokens(e,un).then(t=>{if(t===null)throw nL();return t})}function ZL(n){n._throwIfRoot("deleteObject");const e=FL(n.storage,n._location);return n.storage.makeRequestWithTokens(e,un)}function kv(n,e){const t=bL(n._location.path,e),r=new ct(n._location.bucket,t);return new Pi(n.storage,r)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function eM(n){return/^[A-Za-z]+:\/\//.test(n)}function tM(n,e){return new Pi(n,e)}function Nv(n,e){if(n instanceof Cp){const t=n;if(t._bucket==null)throw eL();const r=new Pi(t,t._bucket);return e!=null?Nv(r,e):r}else return e!==void 0?kv(n,e):n}function nM(n,e){if(e&&eM(e)){if(n instanceof Cp)return tM(n,e);throw us("To use ref(service, url), the first argument must be a Storage instance.")}else return Nv(n,e)}function ry(n,e){const t=e==null?void 0:e[hv];return t==null?null:ct.makeFromBucketSpec(t,n)}function rM(n,e,t,r={}){n.host=`${e}:${t}`;const i=Kn(e);i&&Mu(`https://${n.host}/b`),n._isUsingEmulator=!0,n._protocol=i?"https":"http";const{mockUserToken:s}=r;s&&(n._overrideAuthToken=typeof s=="string"?s:Ky(s,n.app.options.projectId))}class Cp{constructor(e,t,r,i,s,o=!1){this.app=e,this._authProvider=t,this._appCheckProvider=r,this._url=i,this._firebaseVersion=s,this._isUsingEmulator=o,this._bucket=null,this._host=lv,this._protocol="https",this._appId=null,this._deleted=!1,this._maxOperationRetryTime=zO,this._maxUploadRetryTime=KO,this._requests=new Set,i!=null?this._bucket=ct.makeFromBucketSpec(i,this._host):this._bucket=ry(this._host,this.app.options)}get host(){return this._host}set host(e){this._host=e,this._url!=null?this._bucket=ct.makeFromBucketSpec(this._url,e):this._bucket=ry(e,this.app.options)}get maxUploadRetryTime(){return this._maxUploadRetryTime}set maxUploadRetryTime(e){wd("time",0,Number.POSITIVE_INFINITY,e),this._maxUploadRetryTime=e}get maxOperationRetryTime(){return this._maxOperationRetryTime}set maxOperationRetryTime(e){wd("time",0,Number.POSITIVE_INFINITY,e),this._maxOperationRetryTime=e}_getAuthToken(){return p(this,null,function*(){if(this._overrideAuthToken)return this._overrideAuthToken;const e=this._authProvider.getImmediate({optional:!0});if(e){const t=yield e.getToken();if(t!==null)return t.accessToken}return null})}_getAppCheckToken(){return p(this,null,function*(){if(_e(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=this._appCheckProvider.getImmediate({optional:!0});return e?(yield e.getToken()).token:null})}_delete(){return this._deleted||(this._deleted=!0,this._requests.forEach(e=>e.cancel()),this._requests.clear()),Promise.resolve()}_makeStorageReference(e){return new Pi(this,e)}_makeRequest(e,t,r,i,s=!0){if(this._deleted)return new iL(mv());{const o=mL(e,this._appId,r,i,t,this._firebaseVersion,s,this._isUsingEmulator);return this._requests.add(o),o.getPromise().then(()=>this._requests.delete(o),()=>this._requests.delete(o)),o}}makeRequestWithTokens(e,t){return p(this,null,function*(){const[r,i]=yield Promise.all([this._getAuthToken(),this._getAppCheckToken()]);return this._makeRequest(e,t,r,i).getPromise()})}}const iy="@firebase/storage",sy="0.14.5";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const iM="storage";function sM(n,e,t){return n=z(n),HL(n,e,t)}function oM(n){return n=z(n),JL(n)}function aM(n,e){return n=z(n),YL(n,e)}function cM(n,e){return n=z(n),Cv(n,e)}function uM(n){return n=z(n),QL(n)}function lM(n){return n=z(n),XL(n)}function hM(n){return n=z(n),ZL(n)}function oy(n,e){return n=z(n),nM(n,e)}function dM(n,e){return kv(n,e)}function fM(n,e,t,r={}){rM(n,e,t,r)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function pM(n,{instanceIdentifier:e}){const t=n.getProvider("app").getImmediate(),r=n.getProvider("auth-internal"),i=n.getProvider("app-check-internal");return new Cp(t,r,i,e,Gn)}function mM(){It(new Be(iM,pM,"PUBLIC").setMultipleInstances(!0)),je(iy,sy,""),je(iy,sy,"esm2020")}mM();/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Uc{constructor(e,t,r){this._delegate=e,this.task=t,this.ref=r}get bytesTransferred(){return this._delegate.bytesTransferred}get metadata(){return this._delegate.metadata}get state(){return this._delegate.state}get totalBytes(){return this._delegate.totalBytes}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ay{constructor(e,t){this._delegate=e,this._ref=t,this.cancel=this._delegate.cancel.bind(this._delegate),this.catch=this._delegate.catch.bind(this._delegate),this.pause=this._delegate.pause.bind(this._delegate),this.resume=this._delegate.resume.bind(this._delegate)}get snapshot(){return new Uc(this._delegate.snapshot,this,this._ref)}then(e,t){return this._delegate.then(r=>{if(e)return e(new Uc(r,this,this._ref))},t)}on(e,t,r,i){let s;return t&&(typeof t=="function"?s=o=>t(new Uc(o,this,this._ref)):s={next:t.next?o=>t.next(new Uc(o,this,this._ref)):void 0,complete:t.complete||void 0,error:t.error||void 0}),this._delegate.on(e,s,r||void 0,i||void 0)}}class cy{constructor(e,t){this._delegate=e,this._service=t}get prefixes(){return this._delegate.prefixes.map(e=>new On(e,this._service))}get items(){return this._delegate.items.map(e=>new On(e,this._service))}get nextPageToken(){return this._delegate.nextPageToken||null}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class On{constructor(e,t){this._delegate=e,this.storage=t}get name(){return this._delegate.name}get bucket(){return this._delegate.bucket}get fullPath(){return this._delegate.fullPath}toString(){return this._delegate.toString()}child(e){const t=dM(this._delegate,e);return new On(t,this.storage)}get root(){return new On(this._delegate.root,this.storage)}get parent(){const e=this._delegate.parent;return e==null?null:new On(e,this.storage)}put(e,t){return this._throwIfRoot("put"),new ay(sM(this._delegate,e,t),this)}putString(e,t=qt.RAW,r){this._throwIfRoot("putString");const i=wv(t,e),s=G({},r);return s.contentType==null&&i.contentType!=null&&(s.contentType=i.contentType),new ay(new Sv(this._delegate,new kn(i.data,!0),s),this)}listAll(){return uM(this._delegate).then(e=>new cy(e,this.storage))}list(e){return cM(this._delegate,e||void 0).then(t=>new cy(t,this.storage))}getMetadata(){return oM(this._delegate)}updateMetadata(e){return aM(this._delegate,e)}getDownloadURL(){return lM(this._delegate)}delete(){return this._throwIfRoot("delete"),hM(this._delegate)}_throwIfRoot(e){if(this._delegate._location.path==="")throw gv(e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vv{constructor(e,t){this.app=e,this._delegate=t}get maxOperationRetryTime(){return this._delegate.maxOperationRetryTime}get maxUploadRetryTime(){return this._delegate.maxUploadRetryTime}ref(e){if(uy(e))throw us("ref() expected a child path but got a URL, use refFromURL instead.");return new On(oy(this._delegate,e),this)}refFromURL(e){if(!uy(e))throw us("refFromURL() expected a full URL but got a child path, use ref() instead.");try{ct.makeFromUrl(e,this._delegate.host)}catch(t){throw us("refFromUrl() expected a valid full URL but got an invalid one.")}return new On(oy(this._delegate,e),this)}setMaxUploadRetryTime(e){this._delegate.maxUploadRetryTime=e}setMaxOperationRetryTime(e){this._delegate.maxOperationRetryTime=e}useEmulator(e,t,r={}){fM(this._delegate,e,t,r)}}function uy(n){return/^[A-Za-z]+:\/\//.test(n)}const gM="@firebase/storage-compat",_M="0.4.5";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const yM="storage-compat";function wM(n,{instanceIdentifier:e}){const t=n.getProvider("app-compat").getImmediate(),r=n.getProvider("storage").getImmediate({identifier:e});return new Vv(t,r)}function IM(n){const e={TaskState:yt,TaskEvent:zL,StringFormat:qt,Storage:Vv,Reference:On};n.INTERNAL.registerComponent(new Be(yM,wM,"PUBLIC").setServiceProps(e).setMultipleInstances(!0)),n.registerVersion(gM,_M)}IM(Rn);const Dv="@firebase/installations",kp="0.6.24";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xv=1e4,Ov=`w:${kp}`,Lv="FIS_v2",TM="https://firebaseinstallations.googleapis.com/v1",EM=60*60*1e3,vM="installations",AM="Installations";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bM={"missing-app-config-values":'Missing App configuration value: "{$valueName}"',"not-registered":"Firebase Installation is not registered.","installation-not-found":"Firebase Installation not found.","request-failed":'{$requestName} request failed with error "{$serverCode} {$serverStatus}: {$serverMessage}"',"app-offline":"Could not process request. Application offline.","delete-pending-registration":"Can't delete installation while there is a pending registration request."},Ci=new bn(vM,AM,bM);function Mv(n){return n instanceof Fe&&n.code.includes("request-failed")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Fv({projectId:n}){return`${TM}/projects/${n}/installations`}function Uv(n){return{token:n.token,requestStatus:2,expiresIn:SM(n.expiresIn),creationTime:Date.now()}}function Bv(n,e){return p(this,null,function*(){const r=(yield e.json()).error;return Ci.create("request-failed",{requestName:n,serverCode:r.code,serverMessage:r.message,serverStatus:r.status})})}function qv({apiKey:n}){return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":n})}function RM(n,{refreshToken:e}){const t=qv(n);return t.append("Authorization",PM(e)),t}function $v(n){return p(this,null,function*(){const e=yield n();return e.status>=500&&e.status<600?n():e})}function SM(n){return Number(n.replace("s","000"))}function PM(n){return`${Lv} ${n}`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function CM(r,i){return p(this,arguments,function*({appConfig:n,heartbeatServiceProvider:e},{fid:t}){const s=Fv(n),o=qv(n),a=e.getImmediate({optional:!0});if(a){const f=yield a.getHeartbeatsHeader();f&&o.append("x-firebase-client",f)}const u={fid:t,authVersion:Lv,appId:n.appId,sdkVersion:Ov},l={method:"POST",headers:o,body:JSON.stringify(u)},h=yield $v(()=>fetch(s,l));if(h.ok){const f=yield h.json();return{fid:f.fid||t,registrationStatus:2,refreshToken:f.refreshToken,authToken:Uv(f.authToken)}}else throw yield Bv("Create Installation",h)})}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function jv(n){return new Promise(e=>{setTimeout(e,n)})}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function kM(n){return btoa(String.fromCharCode(...n)).replace(/\+/g,"-").replace(/\//g,"_")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const NM=/^[cdef][\w-]{21}$/,Id="";function VM(){try{const n=new Uint8Array(17);(self.crypto||self.msCrypto).getRandomValues(n),n[0]=112+n[0]%16;const t=DM(n);return NM.test(t)?t:Id}catch(n){return Id}}function DM(n){return kM(n).substr(0,22)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function to(n){return`${n.appName}!${n.appId}`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xs=new Map;function zv(n,e){const t=to(n);Kv(t,e),LM(t,e)}function xM(n,e){Gv();const t=to(n);let r=xs.get(t);r||(r=new Set,xs.set(t,r)),r.add(e)}function OM(n,e){const t=to(n),r=xs.get(t);r&&(r.delete(e),r.size===0&&xs.delete(t),Wv())}function Kv(n,e){const t=xs.get(n);if(t)for(const r of t)r(e)}function LM(n,e){const t=Gv();t&&t.postMessage({key:n,fid:e}),Wv()}let ci=null;function Gv(){return!ci&&"BroadcastChannel"in self&&(ci=new BroadcastChannel("[Firebase] FID Change"),ci.onmessage=n=>{Kv(n.data.key,n.data.fid)}),ci}function Wv(){xs.size===0&&ci&&(ci.close(),ci=null)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const MM="firebase-installations-database",FM=1,ki="firebase-installations-store";let bh=null;function Np(){return bh||(bh=Ms(MM,FM,{upgrade:(n,e)=>{switch(e){case 0:n.createObjectStore(ki)}}})),bh}function Vu(n,e){return p(this,null,function*(){const t=to(n),i=(yield Np()).transaction(ki,"readwrite"),s=i.objectStore(ki),o=yield s.get(t);return yield s.put(e,t),yield i.done,(!o||o.fid!==e.fid)&&zv(n,e.fid),e})}function Hv(n){return p(this,null,function*(){const e=to(n),r=(yield Np()).transaction(ki,"readwrite");yield r.objectStore(ki).delete(e),yield r.done})}function Dl(n,e){return p(this,null,function*(){const t=to(n),i=(yield Np()).transaction(ki,"readwrite"),s=i.objectStore(ki),o=yield s.get(t),a=e(o);return a===void 0?yield s.delete(t):yield s.put(a,t),yield i.done,a&&(!o||o.fid!==a.fid)&&zv(n,a.fid),a})}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Vp(n){return p(this,null,function*(){let e;const t=yield Dl(n.appConfig,r=>{const i=UM(r),s=BM(n,i);return e=s.registrationPromise,s.installationEntry});return t.fid===Id?{installationEntry:yield e}:{installationEntry:t,registrationPromise:e}})}function UM(n){const e=n||{fid:VM(),registrationStatus:0};return Qv(e)}function BM(n,e){if(e.registrationStatus===0){if(!navigator.onLine){const i=Promise.reject(Ci.create("app-offline"));return{installationEntry:e,registrationPromise:i}}const t={fid:e.fid,registrationStatus:1,registrationTime:Date.now()},r=qM(n,t);return{installationEntry:t,registrationPromise:r}}else return e.registrationStatus===1?{installationEntry:e,registrationPromise:$M(n)}:{installationEntry:e}}function qM(n,e){return p(this,null,function*(){try{const t=yield CM(n,e);return Vu(n.appConfig,t)}catch(t){throw Mv(t)&&t.customData.serverCode===409?yield Hv(n.appConfig):yield Vu(n.appConfig,{fid:e.fid,registrationStatus:0}),t}})}function $M(n){return p(this,null,function*(){let e=yield ly(n.appConfig);for(;e.registrationStatus===1;)yield jv(100),e=yield ly(n.appConfig);if(e.registrationStatus===0){const{installationEntry:t,registrationPromise:r}=yield Vp(n);return r||t}return e})}function ly(n){return Dl(n,e=>{if(!e)throw Ci.create("installation-not-found");return Qv(e)})}function Qv(n){return jM(n)?{fid:n.fid,registrationStatus:0}:n}function jM(n){return n.registrationStatus===1&&n.registrationTime+xv<Date.now()}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function zM(r,i){return p(this,arguments,function*({appConfig:n,heartbeatServiceProvider:e},t){const s=KM(n,t),o=RM(n,t),a=e.getImmediate({optional:!0});if(a){const f=yield a.getHeartbeatsHeader();f&&o.append("x-firebase-client",f)}const u={installation:{sdkVersion:Ov,appId:n.appId}},l={method:"POST",headers:o,body:JSON.stringify(u)},h=yield $v(()=>fetch(s,l));if(h.ok){const f=yield h.json();return Uv(f)}else throw yield Bv("Generate Auth Token",h)})}function KM(n,{fid:e}){return`${Fv(n)}/${e}/authTokens:generate`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Dp(n,e=!1){return p(this,null,function*(){let t;const r=yield Dl(n.appConfig,s=>{if(!Jv(s))throw Ci.create("not-registered");const o=s.authToken;if(!e&&HM(o))return s;if(o.requestStatus===1)return t=GM(n,e),s;{if(!navigator.onLine)throw Ci.create("app-offline");const a=JM(s);return t=WM(n,a),a}});return t?yield t:r.authToken})}function GM(n,e){return p(this,null,function*(){let t=yield hy(n.appConfig);for(;t.authToken.requestStatus===1;)yield jv(100),t=yield hy(n.appConfig);const r=t.authToken;return r.requestStatus===0?Dp(n,e):r})}function hy(n){return Dl(n,e=>{if(!Jv(e))throw Ci.create("not-registered");const t=e.authToken;return YM(t)?ce(G({},e),{authToken:{requestStatus:0}}):e})}function WM(n,e){return p(this,null,function*(){try{const t=yield zM(n,e),r=ce(G({},e),{authToken:t});return yield Vu(n.appConfig,r),t}catch(t){if(Mv(t)&&(t.customData.serverCode===401||t.customData.serverCode===404))yield Hv(n.appConfig);else{const r=ce(G({},e),{authToken:{requestStatus:0}});yield Vu(n.appConfig,r)}throw t}})}function Jv(n){return n!==void 0&&n.registrationStatus===2}function HM(n){return n.requestStatus===2&&!QM(n)}function QM(n){const e=Date.now();return e<n.creationTime||n.creationTime+n.expiresIn<e+EM}function JM(n){const e={requestStatus:1,requestTime:Date.now()};return ce(G({},n),{authToken:e})}function YM(n){return n.requestStatus===1&&n.requestTime+xv<Date.now()}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function XM(n){return p(this,null,function*(){const e=n,{installationEntry:t,registrationPromise:r}=yield Vp(e);return r?r.catch(console.error):Dp(e).catch(console.error),t.fid})}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ZM(n,e=!1){return p(this,null,function*(){const t=n;return yield eF(t),(yield Dp(t,e)).token})}function eF(n){return p(this,null,function*(){const{registrationPromise:e}=yield Vp(n);e&&(yield e)})}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function tF(n,e){const{appConfig:t}=n;return xM(t,e),()=>{OM(t,e)}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function nF(n){if(!n||!n.options)throw Rh("App Configuration");if(!n.name)throw Rh("App Name");const e=["projectId","apiKey","appId"];for(const t of e)if(!n.options[t])throw Rh(t);return{appName:n.name,projectId:n.options.projectId,apiKey:n.options.apiKey,appId:n.options.appId}}function Rh(n){return Ci.create("missing-app-config-values",{valueName:n})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Yv="installations",rF="installations-internal",iF=n=>{const e=n.getProvider("app").getImmediate(),t=nF(e),r=Uu(e,"heartbeat");return{app:e,appConfig:t,heartbeatServiceProvider:r,_delete:()=>Promise.resolve()}},sF=n=>{const e=n.getProvider("app").getImmediate(),t=Uu(e,Yv).getImmediate();return{getId:()=>XM(t),getToken:i=>ZM(t,i)}};function oF(){It(new Be(Yv,iF,"PUBLIC")),It(new Be(rF,sF,"PRIVATE"))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */oF();je(Dv,kp);je(Dv,kp,"esm2020");/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const aF="/firebase-messaging-sw.js",cF="/firebase-cloud-messaging-push-scope",Xv="BDOU99-h67HcA6JeFXHbSNMu7e2yNNu3RzoMj8TM4W88jITfq7ZmPvIM1Iv-4_l2LxQcYwhqby2xGpWwzjfAnG4",uF="https://fcmregistrations.googleapis.com/v1",Zv="google.c.a.c_id",lF="google.c.a.c_l",hF="google.c.a.ts",dF="google.c.a.e",dy=1e4;var fy;(function(n){n[n.DATA_MESSAGE=1]="DATA_MESSAGE",n[n.DISPLAY_NOTIFICATION=3]="DISPLAY_NOTIFICATION"})(fy||(fy={}));/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */var Os;(function(n){n.PUSH_RECEIVED="push-received",n.NOTIFICATION_CLICKED="notification-clicked",n.FID_REGISTERED="fid-registered"})(Os||(Os={}));/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Gt(n){const e=new Uint8Array(n);return btoa(String.fromCharCode(...e)).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_")}function eA(n){const e="=".repeat((4-n.length%4)%4),t=(n+e).replace(/\-/g,"+").replace(/_/g,"/"),r=atob(t),i=new Uint8Array(r.length);for(let s=0;s<r.length;++s)i[s]=r.charCodeAt(s);return i}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Sh="fcm_token_details_db",fF=5,py="fcm_token_object_Store";function pF(n){return p(this,null,function*(){if("databases"in indexedDB&&!(yield indexedDB.databases()).map(s=>s.name).includes(Sh))return null;let e=null;return(yield Ms(Sh,fF,{upgrade:(r,i,s,o)=>p(this,null,function*(){var l;if(i<2||!r.objectStoreNames.contains(py))return;const a=o.objectStore(py),u=yield a.index("fcmSenderId").get(n);if(yield a.clear(),!!u){if(i===2){const h=u;if(!h.auth||!h.p256dh||!h.endpoint)return;e={token:h.fcmToken,createTime:(l=h.createTime)!=null?l:Date.now(),subscriptionOptions:{auth:h.auth,p256dh:h.p256dh,endpoint:h.endpoint,swScope:h.swScope,vapidKey:typeof h.vapidKey=="string"?h.vapidKey:Gt(h.vapidKey)}}}else if(i===3){const h=u;e={token:h.fcmToken,createTime:h.createTime,subscriptionOptions:{auth:Gt(h.auth),p256dh:Gt(h.p256dh),endpoint:h.endpoint,swScope:h.swScope,vapidKey:Gt(h.vapidKey)}}}else if(i===4){const h=u;e={token:h.fcmToken,createTime:h.createTime,subscriptionOptions:{auth:Gt(h.auth),p256dh:Gt(h.p256dh),endpoint:h.endpoint,swScope:h.swScope,vapidKey:Gt(h.vapidKey)}}}}})})).close(),yield gr(Sh),yield gr("fcm_vapid_details_db"),yield gr("undefined"),mF(e)?e:null})}function mF(n){if(!n||!n.subscriptionOptions)return!1;const{subscriptionOptions:e}=n;return typeof n.createTime=="number"&&n.createTime>0&&typeof n.token=="string"&&n.token.length>0&&typeof e.auth=="string"&&e.auth.length>0&&typeof e.p256dh=="string"&&e.p256dh.length>0&&typeof e.endpoint=="string"&&e.endpoint.length>0&&typeof e.swScope=="string"&&e.swScope.length>0&&typeof e.vapidKey=="string"&&e.vapidKey.length>0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const gF={"missing-app-config-values":'Missing App configuration value: "{$valueName}"',"only-available-in-window":"This method is available in a Window context.","only-available-in-sw":"This method is available in a service worker context.","permission-default":"The notification permission was not granted and dismissed instead.","permission-blocked":"The notification permission was not granted and blocked instead.","unsupported-browser":"This browser doesn't support the API's required to use the Firebase SDK.","indexed-db-unsupported":"This browser doesn't support indexedDb.open() (ex. Safari iFrame, Firefox Private Browsing, etc)","failed-service-worker-registration":"We are unable to register the default service worker. {$browserErrorMessage}","token-subscribe-failed":"A problem occurred while subscribing the user to FCM: {$errorInfo}","token-subscribe-no-token":"FCM returned no token when subscribing the user to push.","fid-registration-failed":"A problem occurred while creating an FCM registration via FID: {$errorInfo}","fid-unregister-failed":"A problem occurred while unregistering the FCM registration via FID: {$errorInfo}","fid-registration-idb-schema-unavailable":"Unable to read or persist FID registration metadata because the messaging IndexedDB schema is unavailable (for example, the database could not be upgraded to the latest version).","token-unsubscribe-failed":"A problem occurred while unsubscribing the user from FCM: {$errorInfo}","token-update-failed":"A problem occurred while updating the user from FCM: {$errorInfo}","token-update-no-token":"FCM returned no token when updating the user to push.","use-sw-after-get-token":"The useServiceWorker() method may only be called once and must be called before calling getToken() to ensure your service worker is used.","invalid-sw-registration":"The input to useServiceWorker() must be a ServiceWorkerRegistration.","invalid-bg-handler":"The input to setBackgroundMessageHandler() must be a function.","invalid-vapid-key":"The public VAPID key must be a string.","use-vapid-key-after-get-token":"The usePublicVapidKey() method may only be called once and must be called before calling getToken() to ensure your VAPID key is used.","invalid-on-registered-handler":"No onRegistered callback handler was provided or registered. Implement onRegistered() before register()."},he=new bn("messaging","Messaging",gF);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const my="firebase-messaging-database",gy=2,jn="firebase-messaging-store",Yt="firebase-messaging-fid-registration-store",_F={openDB:Ms,deleteDB:gr};let _y=_F,aa=null;function yF(n,e,t){switch(e){case 0:if(n.createObjectStore(jn),t===1)break;case 1:t===2&&n.createObjectStore(Yt)}}function yy(n){return{upgrade:(e,t)=>{yF(e,t,n)},blocked:()=>{},blocking:(e,t,r)=>{var i;aa=null,(i=r.target)==null||i.close()},terminated:()=>{aa=null}}}function no(){return aa||(aa=_y.openDB(my,gy,yy(2)).catch(()=>_y.openDB(my,gy-1,yy(1)))),aa}function tA(n,e){return n.objectStoreNames.contains(e)}function xp(n){if(!tA(n,Yt))throw he.create("fid-registration-idb-schema-unavailable")}function nA(n){return p(this,null,function*(){const e=ro(n),r=yield(yield no()).transaction(jn).objectStore(jn).get(e);if(r)return r;{const i=yield pF(n.appConfig.senderId);if(i)return yield Op(n,i),i}})}function Op(n,e){return p(this,null,function*(){const t=ro(n),r=yield no(),i=[jn],s=tA(r,Yt);s&&i.push(Yt);const o=r.transaction(i,"readwrite");return yield o.objectStore(jn).put(e,t),s&&(yield o.objectStore(Yt).delete(t)),yield o.done,e})}function wF(n){return p(this,null,function*(){const e=ro(n),r=(yield no()).transaction(jn,"readwrite");yield r.objectStore(jn).delete(e),yield r.done})}function Lp(n){return p(this,null,function*(){const e=ro(n),t=yield no();return xp(t),yield t.transaction(Yt).objectStore(Yt).get(e)})}function IF(n,e){return p(this,null,function*(){const t=ro(n),r=yield no();xp(r);const i=r.transaction([jn,Yt],"readwrite");return yield i.objectStore(Yt).put(e,t),yield i.objectStore(jn).delete(t),yield i.done,e})}function TF(n){return p(this,null,function*(){const e=ro(n),t=yield no();xp(t);const r=t.transaction(Yt,"readwrite");yield r.objectStore(Yt).delete(e),yield r.done})}function ro({appConfig:n}){return n.appId}const wy="@firebase/messaging",Td="0.13.2";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const EF=3,vF=1e3;function AF(n,e){return p(this,null,function*(){const t=yield cc(n),r=Mp(e,n.appConfig.appName,!1),i={method:"POST",headers:t,body:JSON.stringify(r)};let s;try{s=yield(yield fetch(ac(n.appConfig),i)).json()}catch(o){throw he.create("token-subscribe-failed",{errorInfo:o==null?void 0:o.toString()})}if(s.error){const o=s.error.message;throw he.create("token-subscribe-failed",{errorInfo:o})}if(!s.token)throw he.create("token-subscribe-no-token");return s.token})}function bF(n,e){return p(this,null,function*(){var u,l;const t=yield cc(n),r=Mp(e,n.appConfig.appName,!0),i={method:"POST",headers:t,body:JSON.stringify(r)};let s;try{s=yield kF(()=>fetch(ac(n.appConfig),i),EF,vF)}catch(h){throw he.create("fid-registration-failed",{errorInfo:h==null?void 0:h.toString()})}if(s.ok)return{responseFid:yield SF(s)};let o;try{o=yield s.json()}catch(h){throw he.create("fid-registration-failed",{errorInfo:s.statusText})}const a=(l=(u=o.error)==null?void 0:u.message)!=null?l:s.statusText;throw he.create("fid-registration-failed",{errorInfo:a})})}function RF(n,e){return p(this,null,function*(){var s,o;const r={method:"DELETE",headers:yield cc(n)};let i;try{i=yield fetch(`${ac(n.appConfig)}/${e}`,r)}catch(a){throw he.create("fid-unregister-failed",{errorInfo:a==null?void 0:a.toString()})}if(!i.ok)try{throw(o=(s=(yield i.json()).error)==null?void 0:s.message)!=null?o:i.statusText}catch(a){throw he.create("fid-unregister-failed",{errorInfo:typeof a=="string"&&a||i.statusText||(a==null?void 0:a.toString())})}})}function SF(n){return p(this,null,function*(){const e=yield n.text();if(!e.trim())throw he.create("fid-registration-failed",{errorInfo:"CreateRegistration succeeded but response body is empty"});let t;try{t=JSON.parse(e)}catch(i){throw he.create("fid-registration-failed",{errorInfo:"CreateRegistration succeeded but response body is not valid JSON"})}const r=t.name;if(typeof r!="string"||r.length===0)throw he.create("fid-registration-failed",{errorInfo:"CreateRegistration succeeded but response did not include a non-empty name"});return PF(r)})}const Iy="/registrations/";function PF(n){const e=n.indexOf(Iy);if(e!==-1){const t=n.slice(e+Iy.length);if(t.length>0)return t}throw he.create("fid-registration-failed",{errorInfo:"CreateRegistration succeeded but response name is not a valid registration resource name"})}function CF(n,e){return p(this,null,function*(){const t=yield cc(n),r=Mp(e.subscriptionOptions,n.appConfig.appName,!1),i={method:"PATCH",headers:t,body:JSON.stringify(r)};let s;try{s=yield(yield fetch(`${ac(n.appConfig)}/${e.token}`,i)).json()}catch(o){throw he.create("token-update-failed",{errorInfo:o==null?void 0:o.toString()})}if(s.error){const o=s.error.message;throw he.create("token-update-failed",{errorInfo:o})}if(!s.token)throw he.create("token-update-no-token");return s.token})}function rA(n,e){return p(this,null,function*(){const r={method:"DELETE",headers:yield cc(n)};try{const s=yield(yield fetch(`${ac(n.appConfig)}/${e}`,r)).json();if(s.error){const o=s.error.message;throw he.create("token-unsubscribe-failed",{errorInfo:o})}}catch(i){throw he.create("token-unsubscribe-failed",{errorInfo:i==null?void 0:i.toString()})}})}function kF(n,e,t){return p(this,null,function*(){let r;for(let i=0;i<e;i++)try{return yield n()}catch(s){if(r=s,i<e-1){const o=t*Math.pow(2,i);yield new Promise(a=>setTimeout(a,o))}}throw r})}function ac({projectId:n}){return`${uF}/projects/${n}/registrations`}function cc(t){return p(this,arguments,function*({appConfig:n,installations:e}){const r=yield e.getToken();return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":n.apiKey,"x-goog-firebase-installations-auth":`FIS ${r}`})})}function NF(n,e){var t,r;try{if(/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(n))return new URL(n).host}catch(i){}try{if(typeof self!="undefined"&&((t=self.location)!=null&&t.href))return new URL(n,self.location.origin).host}catch(i){}return typeof self!="undefined"&&((r=self.location)!=null&&r.host)?self.location.host:e}function Mp({p256dh:n,auth:e,endpoint:t,vapidKey:r,swScope:i},s,o){const a={web:{origin:NF(i,s),endpoint:t,auth:e,p256dh:n}};return o&&(a.fcm_sdk_version=Td),r!==Xv&&(a.web.applicationPubKey=r),a}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const VF=7*24*60*60*1e3;function DF(n){return p(this,null,function*(){const e=yield FF(n.swRegistration,n.vapidKey),t={vapidKey:n.vapidKey,swScope:n.swRegistration.scope,endpoint:e.endpoint,auth:Gt(e.getKey("auth")),p256dh:Gt(e.getKey("p256dh"))},r=yield nA(n.firebaseDependencies);if(r){if(UF(r.subscriptionOptions,t))return Date.now()>=r.createTime+VF?MF(n,{token:r.token,createTime:Date.now(),subscriptionOptions:t}):r.token;try{yield rA(n.firebaseDependencies,r.token)}catch(i){console.warn(i)}return Ty(n.firebaseDependencies,t)}else return Ty(n.firebaseDependencies,t)})}function xF(n,e){return p(this,null,function*(){yield rA(n.firebaseDependencies,e.token),yield wF(n.firebaseDependencies),yield iA(n.firebaseDependencies)})}function OF(n){return p(this,null,function*(){const e=yield Lp(n.firebaseDependencies).catch(()=>{}),t=e==null?void 0:e.fid;t&&(yield RF(n.firebaseDependencies,t)),yield iA(n.firebaseDependencies),t&&qF(n,t)})}function LF(n){return p(this,null,function*(){const e=yield nA(n.firebaseDependencies);e?yield xF(n,e):yield OF(n);const t=yield n.swRegistration.pushManager.getSubscription();return t?t.unsubscribe():!0})}function MF(n,e){return p(this,null,function*(){try{const t=yield CF(n.firebaseDependencies,e),r=ce(G({},e),{token:t,createTime:Date.now()});return yield Op(n.firebaseDependencies,r),t}catch(t){throw t}})}function Ty(n,e){return p(this,null,function*(){const r={token:yield AF(n,e),createTime:Date.now(),subscriptionOptions:e};return yield Op(n,r),r.token})}function FF(n,e){return p(this,null,function*(){const t=yield n.pushManager.getSubscription();return t||n.pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:eA(e)})})}function UF(n,e){const t=e.vapidKey===n.vapidKey,r=e.endpoint===n.endpoint,i=e.auth===n.auth,s=e.p256dh===n.p256dh;return t&&r&&i&&s}function iA(n){return p(this,null,function*(){try{yield TF(n)}catch(e){}})}function BF(n,e){const t=n.onRegisteredHandler;t&&(typeof t=="function"?t(e):t.next(e))}function qF(n,e){const t=n.onUnregisteredHandler;t&&(typeof t=="function"?t(e):t.next(e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function sA(n){return p(this,null,function*(){try{n.swRegistration=yield navigator.serviceWorker.register(aF,{scope:cF}),n.swRegistration.update().catch(()=>{}),yield $F(n.swRegistration)}catch(e){throw he.create("failed-service-worker-registration",{browserErrorMessage:e==null?void 0:e.message})}})}function $F(n){return p(this,null,function*(){return new Promise((e,t)=>{const r=setTimeout(()=>t(new Error(`Service worker not registered after ${dy} ms`)),dy),i=n.installing||n.waiting;n.active?(clearTimeout(r),e()):i?i.onstatechange=s=>{var o;((o=s.target)==null?void 0:o.state)==="activated"&&(i.onstatechange=null,clearTimeout(r),e())}:(clearTimeout(r),t(new Error("No incoming service worker found.")))})})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function oA(n,e){return p(this,null,function*(){if(!e&&!n.swRegistration&&(yield sA(n)),!(!e&&n.swRegistration)){if(!(e instanceof ServiceWorkerRegistration))throw he.create("invalid-sw-registration");n.swRegistration=e}})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function aA(n,e){return p(this,null,function*(){e?n.vapidKey=e:n.vapidKey||(n.vapidKey=Xv)})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ey=3;function jF(n,e){return p(this,null,function*(){const t=yield zF(n.swRegistration,n.vapidKey),r={vapidKey:n.vapidKey,swScope:n.swRegistration.scope,endpoint:t.endpoint,auth:Gt(t.getKey("auth")),p256dh:Gt(t.getKey("p256dh"))},i=n.firebaseDependencies.installations;for(let s=0;s<Ey;s++){const{responseFid:o}=yield bF(n.firebaseDependencies,r);if(o===e)return;s<Ey-1&&(yield i.getToken(!0))}throw he.create("fid-registration-failed",{errorInfo:"CreateRegistration response FID does not match Firebase Installation ID"})})}function zF(n,e){return p(this,null,function*(){const t=yield n.pushManager.getSubscription();return t||n.pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:eA(e)})})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const KF=7*24*60*60*1e3;function cA(n,e){return p(this,null,function*(){if(!navigator)throw he.create("only-available-in-window");if(Notification.permission==="default"&&(yield Notification.requestPermission()),Notification.permission!=="granted")throw he.create("permission-blocked");if(!n.onRegisteredHandler)throw he.create("invalid-on-registered-handler");yield aA(n,e==null?void 0:e.vapidKey),yield oA(n,e==null?void 0:e.serviceWorkerRegistration);const t=n._registerNotifyChain.catch(()=>{});return n._registerNotifyChain=t.then(()=>p(this,null,function*(){const r=yield n.firebaseDependencies.installations.getId(),i=yield Lp(n.firebaseDependencies),s=Date.now();if((!i||i.fid!==r||s>=i.lastRegisterTime+KF)&&(yield jF(n,r),yield IF(n.firebaseDependencies,{fid:r,lastRegisterTime:s,vapidKey:n.vapidKey})),!n.onRegisteredHandler)throw he.create("invalid-on-registered-handler");BF(n,r)})),n._registerNotifyChain})}/**
 * @license
 * Copyright 2026 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function GF(n,e){return tF(e,()=>{p(this,null,function*(){!n.onRegisteredHandler||!(yield Lp(n.firebaseDependencies))||(yield cA(n).catch(()=>{}))})})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function vy(n){const e={from:n.from,collapseKey:n.collapse_key,messageId:n.fcmMessageId};return WF(e,n),HF(e,n),QF(e,n),e}function WF(n,e){if(!e.notification)return;n.notification={};const t=e.notification.title;t&&(n.notification.title=t);const r=e.notification.body;r&&(n.notification.body=r);const i=e.notification.image;i&&(n.notification.image=i);const s=e.notification.icon;s&&(n.notification.icon=s)}function HF(n,e){e.data&&(n.data=e.data)}function QF(n,e){var i,s,o,a,u;if(!e.fcmOptions&&!((i=e.notification)!=null&&i.click_action))return;n.fcmOptions={};const t=(a=(s=e.fcmOptions)==null?void 0:s.link)!=null?a:(o=e.notification)==null?void 0:o.click_action;t&&(n.fcmOptions.link=t);const r=(u=e.fcmOptions)==null?void 0:u.analytics_label;r&&(n.fcmOptions.analyticsLabel=r)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function JF(n){return typeof n=="object"&&!!n&&Zv in n}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function YF(n){if(!n||!n.options)throw Ph("App Configuration Object");if(!n.name)throw Ph("App Name");const e=["projectId","apiKey","appId","messagingSenderId"],{options:t}=n;for(const r of e)if(!t[r])throw Ph(r);return{appName:n.name,projectId:t.projectId,apiKey:t.apiKey,appId:t.appId,senderId:t.messagingSenderId}}function Ph(n){return he.create("missing-app-config-values",{valueName:n})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let XF=class{constructor(e,t,r){this.deliveryMetricsExportedToBigQueryEnabled=!1,this.onBackgroundMessageHandler=null,this.onMessageHandler=null,this.onRegisteredHandler=null,this.onUnregisteredHandler=null,this._registerNotifyChain=Promise.resolve(),this._fidChangeUnsubscribe=null,this.logEvents=[],this.logQueue={state:"stopped"};const i=YF(e);this.firebaseDependencies={app:e,appConfig:i,installations:t,analyticsProvider:r}}_delete(){return this._fidChangeUnsubscribe&&(this._fidChangeUnsubscribe(),this._fidChangeUnsubscribe=null),this.logQueue.state==="scheduled"&&clearTimeout(this.logQueue.timerId),this.logQueue={state:"stopped"},Promise.resolve()}};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function uA(n,e){return p(this,null,function*(){if(!navigator)throw he.create("only-available-in-window");if(Notification.permission==="default"&&(yield Notification.requestPermission()),Notification.permission!=="granted")throw he.create("permission-blocked");return yield aA(n,e==null?void 0:e.vapidKey),yield oA(n,e==null?void 0:e.serviceWorkerRegistration),DF(n)})}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ZF(n,e,t){return p(this,null,function*(){const r=e1(e);(yield n.firebaseDependencies.analyticsProvider.get()).logEvent(r,{message_id:t[Zv],message_name:t[lF],message_time:t[hF],message_device_time:Math.floor(Date.now()/1e3)})})}function e1(n){switch(n){case Os.NOTIFICATION_CLICKED:return"notification_open";case Os.PUSH_RECEIVED:return"notification_foreground";default:throw new Error}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function t1(n,e){return p(this,null,function*(){const t=e.data;if(!t.isFirebaseMessaging)return;if(n.onMessageHandler&&t.messageType===Os.PUSH_RECEIVED&&(typeof n.onMessageHandler=="function"?n.onMessageHandler(vy(t)):n.onMessageHandler.next(vy(t))),n.onRegisteredHandler&&t.messageType===Os.FID_REGISTERED){const i=t.fid;typeof n.onRegisteredHandler=="function"?n.onRegisteredHandler(i):n.onRegisteredHandler.next(i)}const r=t.data;JF(r)&&r[dF]==="1"&&(yield ZF(n,t.messageType,r))})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const n1=n=>{const e=new XF(n.getProvider("app").getImmediate(),n.getProvider("installations-internal").getImmediate(),n.getProvider("analytics-internal"));return navigator.serviceWorker.addEventListener("message",t=>t1(e,t)),e._fidChangeUnsubscribe=GF(e,n.getProvider("installations").getImmediate()),e},r1=n=>{const e=n.getProvider("messaging").getImmediate();return{getToken:r=>uA(e,r),register:r=>cA(e,r)}};function i1(){It(new Be("messaging",n1,"PUBLIC")),It(new Be("messaging-internal",r1,"PRIVATE")),je(wy,Td),je(wy,Td,"esm2020")}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function s1(n){return p(this,null,function*(){if(!navigator)throw he.create("only-available-in-window");return n.swRegistration||(yield sA(n)),LF(n)})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function o1(n,e){if(!navigator)throw he.create("only-available-in-window");return n.onMessageHandler=e,()=>{n.onMessageHandler=null}}function a1(n,e){return p(this,null,function*(){return n=z(n),uA(n,e)})}function c1(n){return n=z(n),s1(n)}function u1(n,e){return n=z(n),o1(n,e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */i1();/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Fp="BDOU99-h67HcA6JeFXHbSNMu7e2yNNu3RzoMj8TM4W88jITfq7ZmPvIM1Iv-4_l2LxQcYwhqby2xGpWwzjfAnG4",l1="https://fcmregistrations.googleapis.com/v1",lA="FCM_MSG",h1="google.c.a.c_id",Ay=1e3,by=3,hA=864e5,d1=5e3,f1=1249,p1=3,m1=1;var Du;(function(n){n[n.DATA_MESSAGE=1]="DATA_MESSAGE",n[n.DISPLAY_NOTIFICATION=3]="DISPLAY_NOTIFICATION"})(Du||(Du={}));/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */var Oa;(function(n){n.PUSH_RECEIVED="push-received",n.NOTIFICATION_CLICKED="notification-clicked",n.FID_REGISTERED="fid-registered"})(Oa||(Oa={}));/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Wt(n){const e=new Uint8Array(n);return btoa(String.fromCharCode(...e)).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_")}function dA(n){const e="=".repeat((4-n.length%4)%4),t=(n+e).replace(/\-/g,"+").replace(/_/g,"/"),r=atob(t),i=new Uint8Array(r.length);for(let s=0;s<r.length;++s)i[s]=r.charCodeAt(s);return i}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ch="fcm_token_details_db",g1=5,Ry="fcm_token_object_Store";function _1(n){return p(this,null,function*(){if("databases"in indexedDB&&!(yield indexedDB.databases()).map(s=>s.name).includes(Ch))return null;let e=null;return(yield Ms(Ch,g1,{upgrade:(r,i,s,o)=>p(this,null,function*(){var l;if(i<2||!r.objectStoreNames.contains(Ry))return;const a=o.objectStore(Ry),u=yield a.index("fcmSenderId").get(n);if(yield a.clear(),!!u){if(i===2){const h=u;if(!h.auth||!h.p256dh||!h.endpoint)return;e={token:h.fcmToken,createTime:(l=h.createTime)!=null?l:Date.now(),subscriptionOptions:{auth:h.auth,p256dh:h.p256dh,endpoint:h.endpoint,swScope:h.swScope,vapidKey:typeof h.vapidKey=="string"?h.vapidKey:Wt(h.vapidKey)}}}else if(i===3){const h=u;e={token:h.fcmToken,createTime:h.createTime,subscriptionOptions:{auth:Wt(h.auth),p256dh:Wt(h.p256dh),endpoint:h.endpoint,swScope:h.swScope,vapidKey:Wt(h.vapidKey)}}}else if(i===4){const h=u;e={token:h.fcmToken,createTime:h.createTime,subscriptionOptions:{auth:Wt(h.auth),p256dh:Wt(h.p256dh),endpoint:h.endpoint,swScope:h.swScope,vapidKey:Wt(h.vapidKey)}}}}})})).close(),yield gr(Ch),yield gr("fcm_vapid_details_db"),yield gr("undefined"),y1(e)?e:null})}function y1(n){if(!n||!n.subscriptionOptions)return!1;const{subscriptionOptions:e}=n;return typeof n.createTime=="number"&&n.createTime>0&&typeof n.token=="string"&&n.token.length>0&&typeof e.auth=="string"&&e.auth.length>0&&typeof e.p256dh=="string"&&e.p256dh.length>0&&typeof e.endpoint=="string"&&e.endpoint.length>0&&typeof e.swScope=="string"&&e.swScope.length>0&&typeof e.vapidKey=="string"&&e.vapidKey.length>0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const w1={"missing-app-config-values":'Missing App configuration value: "{$valueName}"',"only-available-in-window":"This method is available in a Window context.","only-available-in-sw":"This method is available in a service worker context.","permission-default":"The notification permission was not granted and dismissed instead.","permission-blocked":"The notification permission was not granted and blocked instead.","unsupported-browser":"This browser doesn't support the API's required to use the Firebase SDK.","indexed-db-unsupported":"This browser doesn't support indexedDb.open() (ex. Safari iFrame, Firefox Private Browsing, etc)","failed-service-worker-registration":"We are unable to register the default service worker. {$browserErrorMessage}","token-subscribe-failed":"A problem occurred while subscribing the user to FCM: {$errorInfo}","token-subscribe-no-token":"FCM returned no token when subscribing the user to push.","fid-registration-failed":"A problem occurred while creating an FCM registration via FID: {$errorInfo}","fid-unregister-failed":"A problem occurred while unregistering the FCM registration via FID: {$errorInfo}","fid-registration-idb-schema-unavailable":"Unable to read or persist FID registration metadata because the messaging IndexedDB schema is unavailable (for example, the database could not be upgraded to the latest version).","token-unsubscribe-failed":"A problem occurred while unsubscribing the user from FCM: {$errorInfo}","token-update-failed":"A problem occurred while updating the user from FCM: {$errorInfo}","token-update-no-token":"FCM returned no token when updating the user to push.","use-sw-after-get-token":"The useServiceWorker() method may only be called once and must be called before calling getToken() to ensure your service worker is used.","invalid-sw-registration":"The input to useServiceWorker() must be a ServiceWorkerRegistration.","invalid-bg-handler":"The input to setBackgroundMessageHandler() must be a function.","invalid-vapid-key":"The public VAPID key must be a string.","use-vapid-key-after-get-token":"The usePublicVapidKey() method may only be called once and must be called before calling getToken() to ensure your VAPID key is used.","invalid-on-registered-handler":"No onRegistered callback handler was provided or registered. Implement onRegistered() before register()."},De=new bn("messaging","Messaging",w1);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Sy="firebase-messaging-database",Py=2,zn="firebase-messaging-store",Xt="firebase-messaging-fid-registration-store",I1={openDB:Ms,deleteDB:gr};let Cy=I1,ca=null;function T1(n,e,t){switch(e){case 0:if(n.createObjectStore(zn),t===1)break;case 1:t===2&&n.createObjectStore(Xt)}}function ky(n){return{upgrade:(e,t)=>{T1(e,t,n)},blocked:()=>{},blocking:(e,t,r)=>{var i;ca=null,(i=r.target)==null||i.close()},terminated:()=>{ca=null}}}function io(){return ca||(ca=Cy.openDB(Sy,Py,ky(2)).catch(()=>Cy.openDB(Sy,Py-1,ky(1)))),ca}function fA(n,e){return n.objectStoreNames.contains(e)}function Up(n){if(!fA(n,Xt))throw De.create("fid-registration-idb-schema-unavailable")}function Bp(n){return p(this,null,function*(){const e=so(n),r=yield(yield io()).transaction(zn).objectStore(zn).get(e);if(r)return r;{const i=yield _1(n.appConfig.senderId);if(i)return yield qp(n,i),i}})}function qp(n,e){return p(this,null,function*(){const t=so(n),r=yield io(),i=[zn],s=fA(r,Xt);s&&i.push(Xt);const o=r.transaction(i,"readwrite");return yield o.objectStore(zn).put(e,t),s&&(yield o.objectStore(Xt).delete(t)),yield o.done,e})}function E1(n){return p(this,null,function*(){const e=so(n),r=(yield io()).transaction(zn,"readwrite");yield r.objectStore(zn).delete(e),yield r.done})}function $p(n){return p(this,null,function*(){const e=so(n),t=yield io();return Up(t),yield t.transaction(Xt).objectStore(Xt).get(e)})}function v1(n,e){return p(this,null,function*(){const t=so(n),r=yield io();Up(r);const i=r.transaction([zn,Xt],"readwrite");return yield i.objectStore(Xt).put(e,t),yield i.objectStore(zn).delete(t),yield i.done,e})}function A1(n){return p(this,null,function*(){const e=so(n),t=yield io();Up(t);const r=t.transaction(Xt,"readwrite");yield r.objectStore(Xt).delete(e),yield r.done})}function so({appConfig:n}){return n.appId}const b1="0.13.2";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const R1=3,S1=1e3;function P1(n,e){return p(this,null,function*(){const t=yield lc(n),r=jp(e,n.appConfig.appName,!1),i={method:"POST",headers:t,body:JSON.stringify(r)};let s;try{s=yield(yield fetch(uc(n.appConfig),i)).json()}catch(o){throw De.create("token-subscribe-failed",{errorInfo:o==null?void 0:o.toString()})}if(s.error){const o=s.error.message;throw De.create("token-subscribe-failed",{errorInfo:o})}if(!s.token)throw De.create("token-subscribe-no-token");return s.token})}function C1(n,e){return p(this,null,function*(){var u,l;const t=yield lc(n),r=jp(e,n.appConfig.appName,!0),i={method:"POST",headers:t,body:JSON.stringify(r)};let s;try{s=yield x1(()=>fetch(uc(n.appConfig),i),R1,S1)}catch(h){throw De.create("fid-registration-failed",{errorInfo:h==null?void 0:h.toString()})}if(s.ok)return{responseFid:yield N1(s)};let o;try{o=yield s.json()}catch(h){throw De.create("fid-registration-failed",{errorInfo:s.statusText})}const a=(l=(u=o.error)==null?void 0:u.message)!=null?l:s.statusText;throw De.create("fid-registration-failed",{errorInfo:a})})}function k1(n,e){return p(this,null,function*(){var s,o;const r={method:"DELETE",headers:yield lc(n)};let i;try{i=yield fetch(`${uc(n.appConfig)}/${e}`,r)}catch(a){throw De.create("fid-unregister-failed",{errorInfo:a==null?void 0:a.toString()})}if(!i.ok)try{throw(o=(s=(yield i.json()).error)==null?void 0:s.message)!=null?o:i.statusText}catch(a){throw De.create("fid-unregister-failed",{errorInfo:typeof a=="string"&&a||i.statusText||(a==null?void 0:a.toString())})}})}function N1(n){return p(this,null,function*(){const e=yield n.text();if(!e.trim())throw De.create("fid-registration-failed",{errorInfo:"CreateRegistration succeeded but response body is empty"});let t;try{t=JSON.parse(e)}catch(i){throw De.create("fid-registration-failed",{errorInfo:"CreateRegistration succeeded but response body is not valid JSON"})}const r=t.name;if(typeof r!="string"||r.length===0)throw De.create("fid-registration-failed",{errorInfo:"CreateRegistration succeeded but response did not include a non-empty name"});return V1(r)})}const Ny="/registrations/";function V1(n){const e=n.indexOf(Ny);if(e!==-1){const t=n.slice(e+Ny.length);if(t.length>0)return t}throw De.create("fid-registration-failed",{errorInfo:"CreateRegistration succeeded but response name is not a valid registration resource name"})}function D1(n,e){return p(this,null,function*(){const t=yield lc(n),r=jp(e.subscriptionOptions,n.appConfig.appName,!1),i={method:"PATCH",headers:t,body:JSON.stringify(r)};let s;try{s=yield(yield fetch(`${uc(n.appConfig)}/${e.token}`,i)).json()}catch(o){throw De.create("token-update-failed",{errorInfo:o==null?void 0:o.toString()})}if(s.error){const o=s.error.message;throw De.create("token-update-failed",{errorInfo:o})}if(!s.token)throw De.create("token-update-no-token");return s.token})}function pA(n,e){return p(this,null,function*(){const r={method:"DELETE",headers:yield lc(n)};try{const s=yield(yield fetch(`${uc(n.appConfig)}/${e}`,r)).json();if(s.error){const o=s.error.message;throw De.create("token-unsubscribe-failed",{errorInfo:o})}}catch(i){throw De.create("token-unsubscribe-failed",{errorInfo:i==null?void 0:i.toString()})}})}function x1(n,e,t){return p(this,null,function*(){let r;for(let i=0;i<e;i++)try{return yield n()}catch(s){if(r=s,i<e-1){const o=t*Math.pow(2,i);yield new Promise(a=>setTimeout(a,o))}}throw r})}function uc({projectId:n}){return`${l1}/projects/${n}/registrations`}function lc(t){return p(this,arguments,function*({appConfig:n,installations:e}){const r=yield e.getToken();return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":n.apiKey,"x-goog-firebase-installations-auth":`FIS ${r}`})})}function O1(n,e){var t,r;try{if(/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(n))return new URL(n).host}catch(i){}try{if(typeof self!="undefined"&&((t=self.location)!=null&&t.href))return new URL(n,self.location.origin).host}catch(i){}return typeof self!="undefined"&&((r=self.location)!=null&&r.host)?self.location.host:e}function jp({p256dh:n,auth:e,endpoint:t,vapidKey:r,swScope:i},s,o){const a={web:{origin:O1(i,s),endpoint:t,auth:e,p256dh:n}};return o&&(a.fcm_sdk_version=b1),r!==Fp&&(a.web.applicationPubKey=r),a}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const L1=7*24*60*60*1e3;function M1(n){return p(this,null,function*(){const e=yield q1(n.swRegistration,n.vapidKey),t={vapidKey:n.vapidKey,swScope:n.swRegistration.scope,endpoint:e.endpoint,auth:Wt(e.getKey("auth")),p256dh:Wt(e.getKey("p256dh"))},r=yield Bp(n.firebaseDependencies);if(r){if($1(r.subscriptionOptions,t))return Date.now()>=r.createTime+L1?B1(n,{token:r.token,createTime:Date.now(),subscriptionOptions:t}):r.token;try{yield pA(n.firebaseDependencies,r.token)}catch(i){console.warn(i)}return Dy(n.firebaseDependencies,t)}else return Dy(n.firebaseDependencies,t)})}function F1(n,e){return p(this,null,function*(){yield pA(n.firebaseDependencies,e.token),yield E1(n.firebaseDependencies),yield mA(n.firebaseDependencies)})}function U1(n){return p(this,null,function*(){const e=yield $p(n.firebaseDependencies).catch(()=>{}),t=e==null?void 0:e.fid;t&&(yield k1(n.firebaseDependencies,t)),yield mA(n.firebaseDependencies),t&&z1(n,t)})}function Vy(n){return p(this,null,function*(){const e=yield Bp(n.firebaseDependencies);e?yield F1(n,e):yield U1(n);const t=yield n.swRegistration.pushManager.getSubscription();return t?t.unsubscribe():!0})}function B1(n,e){return p(this,null,function*(){try{const t=yield D1(n.firebaseDependencies,e),r=ce(G({},e),{token:t,createTime:Date.now()});return yield qp(n.firebaseDependencies,r),t}catch(t){throw t}})}function Dy(n,e){return p(this,null,function*(){const r={token:yield P1(n,e),createTime:Date.now(),subscriptionOptions:e};return yield qp(n,r),r.token})}function q1(n,e){return p(this,null,function*(){const t=yield n.pushManager.getSubscription();return t||n.pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:dA(e)})})}function $1(n,e){const t=e.vapidKey===n.vapidKey,r=e.endpoint===n.endpoint,i=e.auth===n.auth,s=e.p256dh===n.p256dh;return t&&r&&i&&s}function mA(n){return p(this,null,function*(){try{yield A1(n)}catch(e){}})}function j1(n,e){const t=n.onRegisteredHandler;t&&(typeof t=="function"?t(e):t.next(e))}function z1(n,e){const t=n.onUnregisteredHandler;t&&(typeof t=="function"?t(e):t.next(e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function K1(n,e){return p(this,null,function*(){e?n.vapidKey=e:n.vapidKey||(n.vapidKey=Fp)})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xy=3;function G1(n,e){return p(this,null,function*(){const t=yield W1(n.swRegistration,n.vapidKey),r={vapidKey:n.vapidKey,swScope:n.swRegistration.scope,endpoint:t.endpoint,auth:Wt(t.getKey("auth")),p256dh:Wt(t.getKey("p256dh"))},i=n.firebaseDependencies.installations;for(let s=0;s<xy;s++){const{responseFid:o}=yield C1(n.firebaseDependencies,r);if(o===e)return;s<xy-1&&(yield i.getToken(!0))}throw De.create("fid-registration-failed",{errorInfo:"CreateRegistration response FID does not match Firebase Installation ID"})})}function W1(n,e){return p(this,null,function*(){const t=yield n.pushManager.getSubscription();return t||n.pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:dA(e)})})}/**
 * @license
 * Copyright 2026 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function H1(n){return p(this,null,function*(){const e=yield $p(n.firebaseDependencies).catch(()=>{});if(!e)return;yield K1(n,e.vapidKey);const t=yield n.firebaseDependencies.installations.getId();return yield G1(n,t),yield v1(n.firebaseDependencies,{fid:t,lastRegisterTime:Date.now(),vapidKey:n.vapidKey}),j1(n,t),t})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Q1(n){const e={from:n.from,collapseKey:n.collapse_key,messageId:n.fcmMessageId};return J1(e,n),Y1(e,n),X1(e,n),e}function J1(n,e){if(!e.notification)return;n.notification={};const t=e.notification.title;t&&(n.notification.title=t);const r=e.notification.body;r&&(n.notification.body=r);const i=e.notification.image;i&&(n.notification.image=i);const s=e.notification.icon;s&&(n.notification.icon=s)}function Y1(n,e){e.data&&(n.data=e.data)}function X1(n,e){var i,s,o,a,u;if(!e.fcmOptions&&!((i=e.notification)!=null&&i.click_action))return;n.fcmOptions={};const t=(a=(s=e.fcmOptions)==null?void 0:s.link)!=null?a:(o=e.notification)==null?void 0:o.click_action;t&&(n.fcmOptions.link=t);const r=(u=e.fcmOptions)==null?void 0:u.analytics_label;r&&(n.fcmOptions.analyticsLabel=r)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Z1(n){return typeof n=="object"&&!!n&&h1 in n}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function eU(n){return new Promise(e=>{setTimeout(e,n)})}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const tU="https://play.google.com/log?format=json_proto3",gA=0,nU=lU("AzSCbw63g1R0nCw85jG8","Iaya3yLKwmgvh7cF0q4");function rU(n){n.logQueue.state==="stopped"&&n.logEvents.length>0&&zp(n,gA)}function zp(n,e){if(n.logQueue.state==="scheduled"&&clearTimeout(n.logQueue.timerId),n.logQueue={state:"stopped"},!n.deliveryMetricsExportedToBigQueryEnabled){n.logEvents=[];return}n.logQueue={state:"scheduled",timerId:setTimeout(()=>p(this,null,function*(){if(n.logQueue={state:"flushing"},!n.logEvents.length)return zp(n,hA);yield iU(n)}),e)}}function iU(n){return p(this,null,function*(){const e=n.logEvents;n.logEvents=[];for(let t=0,r=e.length;t<r;t+=Ay){const i=e.slice(t,t+Ay);if(!i.length)break;const s=uU(i);let o=0,a={};do{try{if(a=yield fetch(tU.concat("&key=",nU),{method:"POST",body:JSON.stringify(s)}),a.ok||!a.ok&&!Oy(a))break;if(!a.ok&&Oy(a))throw new Error("a retriable Non-200 code is returned in fetch to Firelog endpoint. Retry")}catch(l){if(o===by)break}let u;try{u=Number((yield a.json()).nextRequestWaitMillis)}catch(l){u=d1}yield new Promise(l=>setTimeout(l,u)),o++}while(o<by)}zp(n,n.logEvents.length?gA:hA)})}function Oy(n){const e=n.status;return e===429||e===500||e===503||e===504}function sU(n,e){return p(this,null,function*(){const t=oU(e,yield n.firebaseDependencies.installations.getId());aU(n,t,e.productId),rU(n)})}function oU(n,e){var r,i;const t={};return n.from&&(t.project_number=n.from),n.fcmMessageId&&(t.message_id=n.fcmMessageId),t.instance_id=e,n.notification?t.message_type=Du.DISPLAY_NOTIFICATION.toString():t.message_type=Du.DATA_MESSAGE.toString(),t.sdk_platform=p1.toString(),t.package_name=self.origin.replace(/(^\w+:|^)\/\//,""),n.collapse_key&&(t.collapse_key=n.collapse_key),t.event=m1.toString(),(r=n.fcmOptions)!=null&&r.analytics_label&&(t.analytics_label=(i=n.fcmOptions)==null?void 0:i.analytics_label),t}function aU(n,e,t){const r={};r.event_time_ms=Math.floor(Date.now()).toString(),r.source_extension_json_proto3=JSON.stringify({messaging_client_event:e}),t&&(r.compliance_data=cU(t)),n.logEvents.push(r)}function cU(n){return{privacy_context:{prequest:{origin_associated_product_id:n}}}}function uU(n){const e={};return e.log_source=f1.toString(),e.log_event=n,e}function lU(n,e){const t=[];for(let r=0;r<n.length;r++)t.push(n.charAt(r)),r<e.length&&t.push(e.charAt(r));return t.join("")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function hU(n,e){return p(this,null,function*(){var s,o;e.swRegistration||(e.swRegistration=self.registration);const{newSubscription:t}=n;if(!t){yield Vy(e);return}if(yield $p(e.firebaseDependencies).catch(()=>{})){const a=yield H1(e).catch(()=>{});if(a){const u=yield Kp();_A(u)&&yU(u,a)}return}const i=yield Bp(e.firebaseDependencies);yield Vy(e),e.vapidKey=(o=(s=i==null?void 0:i.subscriptionOptions)==null?void 0:s.vapidKey)!=null?o:Fp,yield M1(e)})}function dU(n,e){return p(this,null,function*(){const t=mU(n);if(!t)return;e.deliveryMetricsExportedToBigQueryEnabled&&(yield sU(e,t));const r=yield Kp();if(_A(r))return _U(r,t);if(t.notification&&(yield wU(pU(t))),!!e&&e.onBackgroundMessageHandler){const i=Q1(t);typeof e.onBackgroundMessageHandler=="function"?yield e.onBackgroundMessageHandler(i):e.onBackgroundMessageHandler.next(i)}})}function fU(n){return p(this,null,function*(){var o,a;const e=(a=(o=n.notification)==null?void 0:o.data)==null?void 0:a[lA];if(e){if(n.action)return}else return;n.stopImmediatePropagation(),n.notification.close();const t=IU(e);if(!t)return;const r=new URL(t,self.location.href),i=new URL(self.location.origin);if(r.host!==i.host)return;let s=yield gU(r);if(s?s=yield s.focus():(s=yield self.clients.openWindow(t),yield eU(3e3)),!!s)return e.messageType=Oa.NOTIFICATION_CLICKED,e.isFirebaseMessaging=!0,s.postMessage(e)})}function pU(n){const e=G({},n.notification);return e.data={[lA]:n},e}function mU({data:n}){if(!n)return null;try{return n.json()}catch(e){return null}}function gU(n){return p(this,null,function*(){const e=yield Kp();for(const t of e){const r=new URL(t.url,self.location.href);if(n.host===r.host)return t}return null})}function _A(n){return n.some(e=>e.visibilityState==="visible"&&!e.url.startsWith("chrome-extension://"))}function _U(n,e){e.isFirebaseMessaging=!0,e.messageType=Oa.PUSH_RECEIVED;for(const t of n)t.postMessage(e)}function yU(n,e){const t={isFirebaseMessaging:!0,messageType:Oa.FID_REGISTERED,fid:e};for(const r of n)r.postMessage(t)}function Kp(){return self.clients.matchAll({type:"window",includeUncontrolled:!0})}function wU(n){var r;const{actions:e}=n,{maxActions:t}=Notification;return e&&t&&e.length>t&&console.warn(`This browser only supports ${t} actions. The remaining actions will not be displayed.`),self.registration.showNotification((r=n.title)!=null?r:"",n)}function IU(n){var t,r,i;const e=(i=(t=n.fcmOptions)==null?void 0:t.link)!=null?i:(r=n.notification)==null?void 0:r.click_action;return e||(Z1(n.data)?self.location.origin:null)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function TU(n){if(!n||!n.options)throw kh("App Configuration Object");if(!n.name)throw kh("App Name");const e=["projectId","apiKey","appId","messagingSenderId"],{options:t}=n;for(const r of e)if(!t[r])throw kh(r);return{appName:n.name,projectId:t.projectId,apiKey:t.apiKey,appId:t.appId,senderId:t.messagingSenderId}}function kh(n){return De.create("missing-app-config-values",{valueName:n})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class EU{constructor(e,t,r){this.deliveryMetricsExportedToBigQueryEnabled=!1,this.onBackgroundMessageHandler=null,this.onMessageHandler=null,this.onRegisteredHandler=null,this.onUnregisteredHandler=null,this._registerNotifyChain=Promise.resolve(),this._fidChangeUnsubscribe=null,this.logEvents=[],this.logQueue={state:"stopped"};const i=TU(e);this.firebaseDependencies={app:e,appConfig:i,installations:t,analyticsProvider:r}}_delete(){return this._fidChangeUnsubscribe&&(this._fidChangeUnsubscribe(),this._fidChangeUnsubscribe=null),this.logQueue.state==="scheduled"&&clearTimeout(this.logQueue.timerId),this.logQueue={state:"stopped"},Promise.resolve()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vU=n=>{const e=new EU(n.getProvider("app").getImmediate(),n.getProvider("installations-internal").getImmediate(),n.getProvider("analytics-internal"));return self.addEventListener("push",t=>{t.waitUntil(dU(t,e))}),self.addEventListener("pushsubscriptionchange",t=>{t.waitUntil(hU(t,e))}),self.addEventListener("notificationclick",t=>{t.waitUntil(fU(t))}),e};function AU(){It(new Be("messaging-sw",vU,"PUBLIC"))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function bU(n,e){if(self.document!==void 0)throw De.create("only-available-in-sw");return n.onBackgroundMessageHandler=e,()=>{n.onBackgroundMessageHandler=null}}function RU(n,e){return n=z(n),bU(n,e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */AU();const SU="@firebase/messaging-compat",PU="0.2.29";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function CU(){return self&&"ServiceWorkerGlobalScope"in self?NU():kU()}function kU(){return typeof window!="undefined"&&mi()&&Tb()&&"serviceWorker"in navigator&&"PushManager"in window&&"Notification"in window&&"fetch"in window&&ServiceWorkerRegistration.prototype.hasOwnProperty("showNotification")&&PushSubscription.prototype.hasOwnProperty("getKey")}function NU(){return mi()&&"PushManager"in self&&"Notification"in self&&ServiceWorkerRegistration.prototype.hasOwnProperty("showNotification")&&PushSubscription.prototype.hasOwnProperty("getKey")}class Ly{constructor(e,t){this.app=e,this._delegate=t,this.app=e,this._delegate=t}getToken(e){return p(this,null,function*(){return a1(this._delegate,e)})}deleteToken(){return p(this,null,function*(){return c1(this._delegate)})}onMessage(e){return u1(this._delegate,e)}onBackgroundMessage(e){return RU(this._delegate,e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const VU=n=>self&&"ServiceWorkerGlobalScope"in self?new Ly(n.getProvider("app-compat").getImmediate(),n.getProvider("messaging-sw").getImmediate()):new Ly(n.getProvider("app-compat").getImmediate(),n.getProvider("messaging").getImmediate()),DU={isSupported:CU};function xU(){Rn.INTERNAL.registerComponent(new Be("messaging-compat",VU,"PUBLIC").setServiceProps(DU))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */xU();Rn.registerVersion(SU,PU);/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const OU="type.googleapis.com/google.protobuf.Int64Value",LU="type.googleapis.com/google.protobuf.UInt64Value";function yA(n,e){const t={};for(const r in n)n.hasOwnProperty(r)&&(t[r]=e(n[r]));return t}function xu(n){if(n==null)return null;if(n instanceof Number&&(n=n.valueOf()),typeof n=="number"&&isFinite(n)||n===!0||n===!1||Object.prototype.toString.call(n)==="[object String]")return n;if(n instanceof Date)return n.toISOString();if(Array.isArray(n))return n.map(e=>xu(e));if(typeof n=="function"||typeof n=="object")return yA(n,e=>xu(e));throw new Error("Data cannot be encoded in JSON: "+n)}function Ls(n){if(n==null)return n;if(n["@type"])switch(n["@type"]){case OU:case LU:{const e=Number(n.value);if(isNaN(e))throw new Error("Data cannot be decoded from JSON: "+n);return e}default:throw new Error("Data cannot be decoded from JSON: "+n)}return Array.isArray(n)?n.map(e=>Ls(e)):typeof n=="function"||typeof n=="object"?yA(n,e=>Ls(e)):n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wA="functions";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const My={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class St extends Fe{constructor(e,t,r,i){super(`${wA}/${e}`,t||"",i!=null?{url:i}:void 0),this.details=r,Object.setPrototypeOf(this,St.prototype)}}function MU(n){if(n>=200&&n<300)return"ok";switch(n){case 0:return"internal";case 400:return"invalid-argument";case 401:return"unauthenticated";case 403:return"permission-denied";case 404:return"not-found";case 409:return"aborted";case 429:return"resource-exhausted";case 499:return"cancelled";case 500:return"internal";case 501:return"unimplemented";case 503:return"unavailable";case 504:return"deadline-exceeded"}return"unknown"}function Ou(n,e,t){let r=MU(n),i=r,s;try{const o=e&&e.error;if(o){const a=o.status;if(typeof a=="string"){if(!My[a])return new St("internal",`Unknown backend error status: ${a} [${n}]`,void 0,t);r=My[a],i=`Backend error status: ${a}`}const u=o.message;typeof u=="string"&&(i=u),s=o.details,s!==void 0&&(s=Ls(s))}}catch(o){}return r==="ok"?null:new St(r,`${i} [${n}]`,s,t)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class FU{constructor(e,t,r,i){this.app=e,this.auth=null,this.messaging=null,this.appCheck=null,this.serverAppAppCheckToken=null,_e(e)&&e.settings.appCheckToken&&(this.serverAppAppCheckToken=e.settings.appCheckToken),this.auth=t.getImmediate({optional:!0}),this.messaging=r.getImmediate({optional:!0}),this.auth||t.get().then(s=>this.auth=s,()=>{}),this.messaging||r.get().then(s=>this.messaging=s,()=>{}),this.appCheck||i==null||i.get().then(s=>this.appCheck=s,()=>{})}getAuthToken(){return p(this,null,function*(){if(this.auth)try{const e=yield this.auth.getToken();return e==null?void 0:e.accessToken}catch(e){return}})}getMessagingToken(){return p(this,null,function*(){if(!(!this.messaging||!("Notification"in self)||Notification.permission!=="granted"))try{return yield this.messaging.getToken()}catch(e){return}})}getAppCheckToken(e){return p(this,null,function*(){if(this.serverAppAppCheckToken)return this.serverAppAppCheckToken;if(this.appCheck){const t=e?yield this.appCheck.getLimitedUseToken():yield this.appCheck.getToken();return t.error?null:t.token}return null})}getContext(e){return p(this,null,function*(){const t=yield this.getAuthToken(),r=yield this.getMessagingToken(),i=yield this.getAppCheckToken(e);return{authToken:t,messagingToken:r,appCheckToken:i}})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Fy="us-central1",UU=/^data: (.*?)(?:\n|$)/;function BU(n){let e=null;return{promise:new Promise((t,r)=>{e=setTimeout(()=>{r(new St("deadline-exceeded","deadline-exceeded"))},n)}),cancel:()=>{e&&clearTimeout(e)}}}let qU=class{constructor(e,t,r,i,s=Fy,o=(...a)=>fetch(...a)){this.app=e,this.fetchImpl=o,this.emulatorOrigin=null,this.contextProvider=new FU(e,t,r,i),this.cancelAllRequests=new Promise(a=>{this.deleteService=()=>Promise.resolve(a())});try{const a=new URL(s);this.customDomain=a.origin+(a.pathname==="/"?"":a.pathname),this.region=Fy}catch(a){this.customDomain=null,this.region=s}}_delete(){return this.deleteService()}_url(e){const t=this.app.options.projectId;return this.emulatorOrigin!==null?`${this.emulatorOrigin}/${t}/${this.region}/${e}`:this.customDomain!==null?`${this.customDomain}/${e}`:`https://${this.region}-${t}.cloudfunctions.net/${e}`}};function $U(n,e,t){const r=Kn(e);n.emulatorOrigin=`http${r?"s":""}://${e}:${t}`,r&&Mu(n.emulatorOrigin+"/backends")}function jU(n,e,t){const r=i=>GU(n,e,i,t||{});return r.stream=(i,s)=>WU(n,e,i,s),r}function zU(n,e,t){const r=i=>EA(n,e,i,t||{});return r.stream=(i,s)=>vA(n,e,i,s||{}),r}function IA(n){return n.emulatorOrigin&&Kn(n.emulatorOrigin)?"include":void 0}function KU(n,e,t,r,i){return p(this,null,function*(){t["Content-Type"]="application/json";let s;try{s=yield r(n,{method:"POST",body:JSON.stringify(e),headers:t,credentials:IA(i)})}catch(a){return{status:0,json:null}}let o=null;try{o=yield s.json()}catch(a){}return{status:s.status,json:o}})}function TA(n,e){return p(this,null,function*(){const t={},r=yield n.contextProvider.getContext(e.limitedUseAppCheckTokens);return r.authToken&&(t.Authorization="Bearer "+r.authToken),r.messagingToken&&(t["Firebase-Instance-ID-Token"]=r.messagingToken),r.appCheckToken!==null&&(t["X-Firebase-AppCheck"]=r.appCheckToken),t})}function GU(n,e,t,r){const i=n._url(e);return EA(n,i,t,r)}function EA(n,e,t,r){return p(this,null,function*(){t=xu(t);const i={data:t},s=yield TA(n,r),o=r.timeout||7e4,a=BU(o),u=yield Promise.race([KU(e,i,s,n.fetchImpl,n),a.promise,n.cancelAllRequests]);if(a.cancel(),!u)throw new St("cancelled","Firebase Functions instance was deleted.");const l=Ou(u.status,u.json,e);if(l)throw l;if(!u.json)throw new St("internal","Response is not valid JSON object.",void 0,e);let h=u.json.data;if(typeof h=="undefined"&&(h=u.json.result),typeof h=="undefined")throw new St("internal","Response is missing data field.",void 0,e);return{data:Ls(h)}})}function WU(n,e,t,r){const i=n._url(e);return vA(n,i,t,r||{})}function vA(n,e,t,r){return p(this,null,function*(){var g;t=xu(t);const i={data:t},s=yield TA(n,r);s["Content-Type"]="application/json",s.Accept="text/event-stream";let o;try{o=yield n.fetchImpl(e,{method:"POST",body:JSON.stringify(i),headers:s,signal:r==null?void 0:r.signal,credentials:IA(n)})}catch(w){if(w instanceof Error&&w.name==="AbortError"){const D=new St("cancelled","Request was cancelled.");return{data:Promise.reject(D),stream:{[Symbol.asyncIterator](){return{next(){return Promise.reject(D)}}}}}}const S=Ou(0,null,e);return{data:Promise.reject(S),stream:{[Symbol.asyncIterator](){return{next(){return Promise.reject(S)}}}}}}let a,u;const l=new Promise((w,S)=>{a=w,u=S});(g=r==null?void 0:r.signal)==null||g.addEventListener("abort",()=>{const w=new St("cancelled","Request was cancelled.");u(w)});const h=o.body.getReader(),f=HU(h,a,u,r==null?void 0:r.signal,e);return{stream:{[Symbol.asyncIterator](){const w=f.getReader();return{next(){return p(this,null,function*(){const{value:D,done:x}=yield w.read();return{value:D,done:x}})},return(){return p(this,null,function*(){return yield w.cancel(),{done:!0,value:void 0}})}}}},data:l}})}function HU(n,e,t,r,i){const s=(a,u)=>{const l=a.match(UU);if(!l)return;const h=l[1];try{const f=JSON.parse(h);if("result"in f){e(Ls(f.result));return}if("message"in f){u.enqueue(Ls(f.message));return}if("error"in f){const g=Ou(0,f,i);u.error(g),t(g);return}}catch(f){if(f instanceof St){u.error(f),t(f);return}}},o=new TextDecoder;return new ReadableStream({start(a){let u="";return l();function l(){return p(this,null,function*(){if(r!=null&&r.aborted){const h=new St("cancelled","Request was cancelled");return a.error(h),t(h),Promise.resolve()}try{const{value:h,done:f}=yield n.read();if(f){u.trim()&&s(u.trim(),a),a.close();return}if(r!=null&&r.aborted){const w=new St("cancelled","Request was cancelled");a.error(w),t(w),yield n.cancel();return}u+=o.decode(h,{stream:!0});const g=u.split(`
`);u=g.pop()||"";for(const w of g)w.trim()&&s(w.trim(),a);return l()}catch(h){const f=h instanceof St?h:Ou(0,null,i);a.error(f),t(f)}})}},cancel(){return n.cancel()}})}const Uy="@firebase/functions",By="0.14.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const QU="auth-internal",JU="app-check-internal",YU="messaging-internal";function XU(n){const e=(t,{instanceIdentifier:r})=>{const i=t.getProvider("app").getImmediate(),s=t.getProvider(QU),o=t.getProvider(YU),a=t.getProvider(JU);return new qU(i,s,o,a,r)};It(new Be(wA,e,"PUBLIC").setMultipleInstances(!0)),je(Uy,By,n),je(Uy,By,"esm2020")}function qy(n,e,t){$U(z(n),e,t)}function ZU(n,e,t){return jU(z(n),e,t)}function e2(n,e,t){return zU(z(n),e,t)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */XU();const t2="@firebase/functions-compat",n2="0.5.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class AA{constructor(e,t){this.app=e,this._delegate=t,this._region=this._delegate.region,this._customDomain=this._delegate.customDomain}httpsCallable(e,t){return ZU(this._delegate,e,t)}httpsCallableFromURL(e,t){return e2(this._delegate,e,t)}useFunctionsEmulator(e){const t=e.match("[a-zA-Z]+://([a-zA-Z0-9.-]+)(?::([0-9]+))?");if(t==null)throw new Fe("functions","No origin provided to useFunctionsEmulator()");if(t[2]==null)throw new Fe("functions","Port missing in origin provided to useFunctionsEmulator()");return qy(this._delegate,t[1],Number(t[2]))}useEmulator(e,t){return qy(this._delegate,e,t)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const r2="us-central1",i2=(n,{instanceIdentifier:e})=>{const t=n.getProvider("app-compat").getImmediate(),r=n.getProvider("functions").getImmediate({identifier:e!=null?e:r2});return new AA(t,r)};function s2(){const n={Functions:AA};Rn.INTERNAL.registerComponent(new Be("functions-compat",i2,"PUBLIC").setServiceProps(n).setMultipleInstances(!0))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */s2();Rn.registerVersion(t2,n2);export{mO as a,RO as b,AT as c,gu as d,pO as e,Rn as f,CO as g,VO as h,W_ as i,fV as j,DO as k,gO as l,_V as m,rv as o,hr as q,pV as s,H_ as u,T2 as w};
