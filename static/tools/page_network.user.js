// ==UserScript==
// @name        允许pd网站访问其它资源
// @namespace   https://pskdje.github.io/
// @description 通过油猴脚本允许我网站访问其它资源
// @author      dsjofh
// @icon        https://pskdje.github.io/website_icon/favicon-64.ico
// @version     2026-09-25T22
// @match       *://127.0.0.1:12540/*
// @match       *://localhost:12540/*
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
		tmsou=`${GM_info?.scriptUpdateURL??"油猴脚本/"+tmnm}>`;
	cache.log.root.add(20,tmnm,`油猴脚本"${GM_info.script.name}"已在"${path}"区域加载。`);
	function HTTPAgent(method,url,data={}){
		if(typeof method!=="string")throw new TypeError("method需要字符串");
		if(typeof url!=="string")throw new TypeError("url需要字符串");
		if(data===null) data={};
		if(typeof data!=="object")throw new TypeError("data需要对象");
		new URL(url);// 检查URL
		var headers=(typeof data.headers==="object"&& data.headers)||{};
		if(!headers["User-Agent"]) headers["User-Agent"]=navigator.userAgent;// 用户代理
		class HTTPAgentResponse {// HTTP代理响应对象
			get[Symbol.toStringTag](){return"HTTPAgentResponse";}
			[Symbol.toPrimitive](hint){
				if(hint==="number")return this.size;
				if(hint==="string")return this.URL;
				if(hint==="default")return this.data;
				return this.toString();
			};constructor(options){// 构造调用
				var t=this;
				function setThis(name,value){// 设置本对象的属性
					var des={enumerable:true,writable:false,value:value};
					return Object.defineProperty(t,name,des);
				}; cache.log.requestLog.add(10,`${tmnm}>HTTPAgent(${options.API_type})`,`[${method}] ${options.url} - ${options.status} "${options.statusText}" - ${options.size}字节`);
				setThis("API_type",options.API_type);
				setThis("data",options.data);
				setThis("statusCode",Number(options.status));
				setThis("statusText",options.statusText);
				setThis("headers",options.headers);
				setThis("history",options.history);
				setThis("URL",options.url);
				setThis("size",Number(options.size));
				setThis("MIME",options.mime);
				Object.defineProperty(this,"status",{enumerable:true,get:function(){var ra=[this.statusCode,this.statusText];Object.defineProperty(ra,"toString",{value:function(){return this[0]+" "+this[1]}});return Object.freeze(ra);}});
				Object.freeze(t);
			};toString(){return`[${method}] "${this.URL}" ${this.status} ${this.size}`;}
		};function sph(ht){
			if(typeof ht!=="string")return ht;
			const r={};
			for(const d of ht.split("\r\n")){
				const h=d.split(/^(.+?):(.+)$/);
				r[h[1].trim()]=h[2].trim();
			};return r;
		};const {promise,resolve,reject}=Promise.withResolvers();
		GM_xmlhttpRequest({
			method:(typeof method==="string"?method:"GET"),
			url:url,
			headers,
			data:data.body,
			redirect:method==="HEAD"?"manual":"follow",
			timeout:(typeof data.timeout==="number"?data.timeout:undefined),
			responseType:(typeof data.type==="string"?data.type:undefined),
			onabort(r){reject({error:"abort",e:r.error})},
			onerror(r){reject({error:"error",e:r.error})},
			ontimeout(r){reject({error:"timeout",e:r.error})},
			onload(r){
				const h=sph(r.responseHeaders);
				resolve(new HTTPAgentResponse({
					API_type:"GM",
					data:r.response||r.responseText,
					status:r.status,
					statusText:r.statusText,
					headers:h,
					history:[],
					url:r.finalUrl,
					size:h["content-length"]??-1,
					mime:h["content-type"],
				}));
			}
		});
		return promise;
	}
	function on_toHTTPAgent(ev){// toHTTPAgent代理的油猴实现
		const d=ev.data;
		const q=d.data;
		function pd(t,r,s){
			ev.target.post("SHTTP",{id:d.id,type:t,response:r},s);
		}
		function rj(){
			pd("reject");
			console.error("通过油猴代理转接失败",this.error);
			cache.log.err.add(40,tmsou+"on_toHTTPAgent.rj",this.error);
		}
		HTTPAgent(q.method,q.url,{headers:q.headers,body:q.body,type:"arraybuffer",timeout:50000},"fetch").then(r=>{
			pd("response",{body:r.data,status:r.statusCode,statusText:r.statusText,headers:r.headers},(r.data instanceof ArrayBuffer?[r.data]:undefined));
		},e=>{
			cache.log.requestLog.add(40,`${tmnm}>on_toHTTPAgent`,[e]);
			pd("reject");
		});
	}
	if(path==="/resource/audioplay.html"){
		deval.on_toHTTPAgent=on_toHTTPAgent;
		cache.fetch=(url,options={})=>HTTPAgent(options?.method||"GET",url,options);
	}
})();
