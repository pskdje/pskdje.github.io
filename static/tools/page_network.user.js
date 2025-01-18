// ==UserScript==
// @name        允许pd网站访问其它资源
// @namespace   https://pskdje.github.io/
// @description 通过油猴脚本允许我网站访问其它资源
// @author      dsjofh
// @icon        https://pskdje.github.io/website_icon/favicon-64.ico
// @version     2025-01-18T10
// @match       http*://127.0.0.1:12540/*
// @match       http*://192.168.*.*:12540/*
// @match       https://pskdje.github.io/*
// @run-at      document-end
// @downloadURL https://pskdje.github.io/static/tools/page_network.user.js
// @supportURL  https://pskdje.github.io/posts/2025/01/16/page_network_userjs.html
// @homepage    https://pskdje.github.io/posts/2025/01/16/page_network_userjs.html
// @grant       GM_info
// @grant       GM_xmlhttpRequest
// @connect     localhost:12000
// ==/UserScript==

(function set12540websiteNetwork(){// 由于我网站的复杂性，我也没法确定要在什么时候加载
	const tmnm="page_network.user.js";
	const hasLWS=typeof docWindow==="function"&&typeof docsScript==="object";// 检查是否有我网站的接口
	if(!hasLWS)console.warn("未运行于特定环境，部分逻辑可能会无法运行。");
	const path=location.pathname,
		tmsou=`${tmnm}>`;
	cache.log.root.add(20,tmnm,`油猴脚本"${GM_info.script.name}"已在"${path}"区域加载。`);
	function on_toHTTPAgent(ev){// toHTTPAgent代理的油猴实现
		const d=ev.data;
		const q=d.data;
		function pd(t,r,s){
			ev.target.post("SHTTP",{id:d.id,type:t,response:r},s);
		}
		function rj(){pd("reject")}
		function sph(ht){
			if(typeof ht!=="string")return ht;
			const r={};
			for(const d of ht.split("\r\n")){
				const h=d.split(/^(.+?):(.+)$/);
				r[h[1].trim()]=h[2].trim();
			};return r;
		}
		GM_xmlhttpRequest({
			method:q.method,
			url:q.url,
			headers:q.headers,
			data:q.body,
			redirect:q.method==="HEAD"?"manual":"follow",
			responseType:"arraybuffer",
			timeout:50000,
			onabort:rj,onerror:rj,ontimeout:rj,
			onload(r){
				pd("response",{body:r.response,status:r.status,statusText:r.statusText,headers:sph(r.responseHeaders)},(r.response instanceof ArrayBuffer)?[r.response]:undefined);
				cache.log.requestLog.add(0,tmsou+"agent:onload",`[${q.method}] "${r.finalUrl}" - ${r.status} "${r.statusText}" - null`);
			}
		});
	}
	if(path==="/assets/audioplay.html"){
		deval.on_toHTTPAgent=on_toHTTPAgent;
	}
})();
