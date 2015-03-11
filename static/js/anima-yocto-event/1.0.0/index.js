define("anima-yocto-event/1.0.0/index",["anima-yocto-core/1.0.0/index"],function(n){n("anima-yocto-event/1.0.0/src/event")}),define("anima-yocto-event/1.0.0/src/event",["anima-yocto-core/1.0.0/index"],function(n,e,t){function r(n){return n._zid||(n._zid=h++)}function o(n,e,t,o){if(e=i(e),e.ns)var a=u(e.ns);return(E[r(n)]||[]).filter(function(n){return!(!n||e.e&&n.e!=e.e||e.ns&&!a.test(n.ns)||t&&r(n.fn)!==r(t)||o&&n.sel!=o)})}function i(n){var e=(""+n).split(".");return{e:e[0],ns:e.slice(1).sort().join(" ")}}function u(n){return new RegExp("(?:^| )"+n.replace(" "," .* ?")+"(?: |$)")}function a(n,e){return n.del&&!x&&n.e in b||!!e}function c(n){return w[n]||x&&b[n]||n}function s(n,e,t,o,u,s,f){var l=r(n),h=E[l]||(E[l]=[]);e.split(/\s/).forEach(function(e){if("ready"==e)return p(document).ready(t);var r=i(e);r.fn=t,r.sel=u,r.e in w&&(t=function(n){var e=n.relatedTarget;return!e||e!==this&&!p.contains(this,e)?r.fn.apply(this,arguments):void 0}),r.del=s;var l=s||t;r.proxy=function(e){if(e=d(e),!e.isImmediatePropagationStopped()){e.data=o;var t=l.apply(n,e._args==v?[e]:[e].concat(e._args));return t===!1&&(e.preventDefault(),e.stopPropagation()),t}},r.i=h.length,h.push(r),"addEventListener"in n&&n.addEventListener(c(r.e),r.proxy,a(r,f))})}function f(n,e,t,i,u){var s=r(n);(e||"").split(/\s/).forEach(function(e){o(n,e,t,i).forEach(function(e){delete E[s][e.i],"removeEventListener"in n&&n.removeEventListener(c(e.e),e.proxy,a(e,u))})})}function d(n,e){return(e||!n.isDefaultPrevented)&&(e||(e=n),p.each(z,function(t,r){var o=e[t];n[t]=function(){return this[r]=D,o&&o.apply(e,arguments)},n[r]=_}),(e.defaultPrevented!==v?e.defaultPrevented:"returnValue"in e?e.returnValue===!1:e.getPreventDefault&&e.getPreventDefault())&&(n.isDefaultPrevented=D)),n}function l(n){var e,t={originalEvent:n};for(e in n)k.test(e)||n[e]===v||(t[e]=n[e]);return d(t,n)}var v,p=n("anima-yocto-core/1.0.0/index"),h=1,m=Array.prototype.slice,g=p.isFunction,y=function(n){return"string"==typeof n},E={},P={},x="onfocusin"in window,b={focus:"focusin",blur:"focusout"},w={mouseenter:"mouseover",mouseleave:"mouseout"};P.click=P.mousedown=P.mouseup=P.mousemove="MouseEvents",p.event={add:s,remove:f},p.proxy=function(n,e){if(g(n)){var t=function(){return n.apply(e,arguments)};return t._zid=r(n),t}if(y(e))return p.proxy(n[e],n);throw new TypeError("expected function")},p.fn.bind=function(n,e,t){return this.on(n,e,t)},p.fn.unbind=function(n,e){return this.off(n,e)},p.fn.one=function(n,e,t,r){return this.on(n,e,t,r,1)};var D=function(){return!0},_=function(){return!1},k=/^([A-Z]|returnValue$|layer[XY]$)/,z={preventDefault:"isDefaultPrevented",stopImmediatePropagation:"isImmediatePropagationStopped",stopPropagation:"isPropagationStopped"};p.fn.delegate=function(n,e,t){return this.on(e,n,t)},p.fn.undelegate=function(n,e,t){return this.off(e,n,t)},p.fn.live=function(n,e){return p(document.body).delegate(this.selector,n,e),this},p.fn.die=function(n,e){return p(document.body).undelegate(this.selector,n,e),this},p.fn.on=function(n,e,t,r,o){var i,u,a=this;return n&&!y(n)?(p.each(n,function(n,r){a.on(n,e,t,r,o)}),a):(y(e)||g(r)||r===!1||(r=t,t=e,e=v),(g(t)||t===!1)&&(r=t,t=v),r===!1&&(r=_),a.each(function(a,c){o&&(i=function(n){return f(c,n.type,r),r.apply(this,arguments)}),e&&(u=function(n){var t,o=p(n.target).closest(e,c).get(0);return o&&o!==c?(t=p.extend(l(n),{currentTarget:o,liveFired:c}),(i||r).apply(o,[t].concat(m.call(arguments,1)))):void 0}),s(c,n,r,t,e,u||i)}))},p.fn.off=function(n,e,t){var r=this;return n&&!y(n)?(p.each(n,function(n,t){r.off(n,e,t)}),r):(y(e)||g(t)||t===!1||(t=e,e=v),t===!1&&(t=_),r.each(function(){f(this,n,t,e)}))},p.fn.trigger=function(n,e){return n=y(n)||p.isPlainObject(n)?p.Event(n):d(n),n._args=e,this.each(function(){"dispatchEvent"in this?this.dispatchEvent(n):p(this).triggerHandler(n,e)})},p.fn.triggerHandler=function(n,e){var t,r;return this.each(function(i,u){t=l(y(n)?p.Event(n):n),t._args=e,t.target=u,p.each(o(u,n.type||n),function(n,e){return r=e.proxy(t),t.isImmediatePropagationStopped()?!1:void 0})}),r},"focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select keydown keypress keyup error".split(" ").forEach(function(n){p.fn[n]=function(e){return e?this.bind(n,e):this.trigger(n)}}),["focus","blur"].forEach(function(n){p.fn[n]=function(e){return e?this.bind(n,e):this.each(function(){try{this[n]()}catch(e){}}),this}}),p.Event=function(n,e){y(n)||(e=n,n=e.type);var t=document.createEvent(P[n]||"Events"),r=!0;if(e)for(var o in e)"bubbles"==o?r=!!e[o]:t[o]=e[o];return t.initEvent(n,r,!0),d(t)},t.exports=p});