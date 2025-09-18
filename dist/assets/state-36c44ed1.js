import{r as D,g as j,a as V}from"./vendor-66b0ef43.js";const m=e=>{let t;const n=new Set,o=(s,f)=>{const i=typeof s=="function"?s(t):s;if(!Object.is(i,t)){const a=t;t=f??(typeof i!="object"||i===null)?i:Object.assign({},t,i),n.forEach(c=>c(t,a))}},r=()=>t,E={setState:o,getState:r,getInitialState:()=>p,subscribe:s=>(n.add(s),()=>n.delete(s)),destroy:()=>{n.clear()}},p=t=e(o,r,E);return E},$=e=>e?m(e):m;var g={exports:{}},R={},w={exports:{}},O={};/**
 * @license React
 * use-sync-external-store-shim.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var d=D;function I(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var x=typeof Object.is=="function"?Object.is:I,A=d.useState,_=d.useEffect,F=d.useLayoutEffect,P=d.useDebugValue;function W(e,t){var n=t(),o=A({inst:{value:n,getSnapshot:t}}),r=o[0].inst,u=o[1];return F(function(){r.value=n,r.getSnapshot=t,b(r)&&u({inst:r})},[e,n,t]),_(function(){return b(r)&&u({inst:r}),e(function(){b(r)&&u({inst:r})})},[e]),P(n),n}function b(e){var t=e.getSnapshot;e=e.value;try{var n=t();return!x(e,n)}catch{return!0}}function z(e,t){return t()}var M=typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"?z:W;O.useSyncExternalStore=d.useSyncExternalStore!==void 0?d.useSyncExternalStore:M;w.exports=O;var C=w.exports;/**
 * @license React
 * use-sync-external-store-shim/with-selector.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var v=D,L=C;function T(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var U=typeof Object.is=="function"?Object.is:T,B=L.useSyncExternalStore,q=v.useRef,G=v.useEffect,k=v.useMemo,H=v.useDebugValue;R.useSyncExternalStoreWithSelector=function(e,t,n,o,r){var u=q(null);if(u.current===null){var l={hasValue:!1,value:null};u.current=l}else l=u.current;u=k(function(){function E(a){if(!p){if(p=!0,s=a,a=o(a),r!==void 0&&l.hasValue){var c=l.value;if(r(c,a))return f=c}return f=a}if(c=f,U(s,a))return c;var y=o(a);return r!==void 0&&r(c,y)?(s=a,c):(s=a,f=y)}var p=!1,s,f,i=n===void 0?null:n;return[function(){return E(t())},i===null?void 0:function(){return E(i())}]},[t,n,o,r]);var S=B(e,u[0],u[1]);return G(function(){l.hasValue=!0,l.value=S},[S]),H(S),S};g.exports=R;var J=g.exports;const K=j(J),{useDebugValue:N}=V,{useSyncExternalStoreWithSelector:Q}=K;const X=e=>e;function Y(e,t=X,n){const o=Q(e.subscribe,e.getState,e.getServerState||e.getInitialState,t,n);return N(o),o}const h=e=>{const t=typeof e=="function"?$(e):e,n=(o,r)=>Y(t,o,r);return Object.assign(n,t),n},ee=e=>e?h(e):h;export{ee as c};
