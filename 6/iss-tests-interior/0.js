(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{7:function(n,t,r){"use strict";r.r(t),r.d(t,"main_js",function(){return o}),r.d(t,"Particles",function(){return g}),r.d(t,"Point",function(){return k}),r.d(t,"__wbg_random_694320ddb679dc1e",function(){return y}),r.d(t,"__wbg_new_59cb74e423758ede",function(){return m}),r.d(t,"__wbg_stack_558ba5917b466edd",function(){return A}),r.d(t,"__wbg_error_4bb6c2a97407129a",function(){return j}),r.d(t,"__wbindgen_object_drop_ref",function(){return v}),r.d(t,"__wbindgen_throw",function(){return x});var e=r(9);function o(){e.g()}const c=new Array(32);c.fill(void 0),c.push(void 0,null,!0,!1);let u=c.length;function i(n){return c[n]}let f,s=0,l=new TextEncoder("utf-8"),a=null;function d(){return null!==a&&a.buffer===e.h.buffer||(a=new Uint8Array(e.h.buffer)),a}f="function"==typeof l.encodeInto?function(n){let t=n.length,r=e.d(t),o=0;{const t=d();for(;o<n.length;o++){const e=n.charCodeAt(o);if(e>127)break;t[r+o]=e}}if(o!==n.length){n=n.slice(o),r=e.e(r,t,t=o+3*n.length);const c=d().subarray(r+o,r+t);o+=l.encodeInto(n,c).written}return s=o,r}:function(n){let t=n.length,r=e.d(t),o=0;{const t=d();for(;o<n.length;o++){const e=n.charCodeAt(o);if(e>127)break;t[r+o]=e}}if(o!==n.length){const c=l.encode(n.slice(o));r=e.e(r,t,t=o+c.length),d().set(c,r+o),o+=c.length}return s=o,r};let h=null;function _(){return null!==h&&h.buffer===e.h.buffer||(h=new Int32Array(e.h.buffer)),h}let w=new TextDecoder("utf-8");function b(n,t){return w.decode(d().subarray(n,n+t))}function p(n){const t=i(n);return function(n){n<36||(c[n]=u,u=n)}(n),t}class g{static __wrap(n){const t=Object.create(g.prototype);return t.ptr=n,t}free(){const n=this.ptr;this.ptr=0,e.a(n)}constructor(n,t,r,o,c){const u=e.l(n,t,r,o,c);return g.__wrap(u)}update(n){e.m(this.ptr,n)}check_collisions(n){!function(n,t){if(!(n instanceof t))throw new Error(`expected instance of ${t.name}`);n.ptr}(n,k);const t=n.ptr;n.ptr=0,e.i(this.ptr,t)}static check_distance(n,t,r,o,c,u){return e.j(n,t,r,o,c,u)}items(){return e.k(this.ptr)}}class k{free(){const n=this.ptr;this.ptr=0,e.b(n)}}const y=function(){return Math.random()},m=function(){return function(n){u===c.length&&c.push(c.length+1);const t=u;return u=c[t],c[t]=n,t}(new Error)},A=function(n,t){const r=i(t).stack,e=f(r),o=s;_()[n/4+0]=e,_()[n/4+1]=o},j=function(n,t){const r=b(n,t).slice();e.c(n,1*t),console.error(r)},v=function(n){p(n)},x=function(n,t){throw new Error(b(n,t))};e.f()},9:function(n,t,r){"use strict";var e=r.w[n.i];n.exports=e;r(7);e.n()}}]);