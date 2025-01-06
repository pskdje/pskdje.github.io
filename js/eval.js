// 使用安全的方案来执行其它来源的脚本
// 本文件主要设计为Web Worker来运行，但也可以在正常文档运行(防止Worker无法运行之类的问题)

(function codeEval(){
	// 基本
	function msgPack(type,data,obj={}){// 信息封装
		return{
			WPJDS:"evalJS",
			get[Symbol.toStringTag](){return"CodeEvalMessage<eval.js>"},
			__proto__:null,
			type,
			data,
			...obj
		};
	}
	const postMessage=self.postMessage;
	function pms(...args){// 传递信息到启动方
		try{
			postMessage(msgPack(...args));
		}catch(e){
			console.error(e);
			postMessage(msgPack("pmsErr",e));
		}
	}
	function messageError(ev,info){// 传递错误提示
		pms("msgErr",ev.data,{info,origin:ev.origin,sourceType:Object.prototype.toString.call(ev.source)});
	}
	function inputMessage(ev){// 收到message事件时调用
		const d=ev.data;
		if(!d||typeof d!=="object"){
			messageError(ev,"数据类型不是对象");
			return;
		}
		const t=d.WPJDS;
		if(typeof t!=="string"){
			messageError(ev,"无效签名类型");
			return;
		}
		let f=handle[t];
		try{f(d)}
		catch(e){
			pms("handleError",e);
			console.error(e);
		}
	}
	const console=self.console;
	function cseMsg(label,data){// 发送控制台调用
		pms("console",data,{label});
	}
	self.console=Object.freeze({// 覆盖console
		get[Symbol.toStringTag](){return"Console"},
		debug(...a){
			console.debug(...a);
			cseMsg("debug",a);
		},
		log(...a){
			console.log(...a);
			cseMsg("log",a);
		},
		info(...a){
			console.info(...a);
			cseMsg("info",a);
		},
		warn(...a){
			console.warn(...a);
			cseMsg("warn",a);
		},
		error(...a){
			console.error(...a);
			cseMsg("error",a);
		},
		assert(...a){
			console.assert(...a);
			cseMsg("assert",a);
		},
		clear(){
			console.clear();
			cseMsg("clear");
		},
		count(l){
			console.count(l);
			cseMsg("count",l);
		},
		countReset(l){
			console.countReset(l);
			cseMsg("countReset",l);
		},
		dir(o){
			console.dir(o);
			cseMsg("dir",o);
		},
		dirxml(o){
			console.dirxml(o);
			cseMsg("dirxml");
		},
		group(l){
			console.group(l);
			cseMsg("group",l);
		},
		groupCollapsed(l){
			console.groupCollapsed(l);
			cseMsg("groupCollapsed",l);
		},
		groupEnd(){
			console.groupEnd();
			cseMsg("groupEnd");
		},
		table(d,c){
			console.table(d,c);
			cseMsg("table",{data:d,columns:c,d,c});
		},
		time(l){
			console.time(l);
			cseMsg("time",{label:l,time:Date.now(),l});
		},
		timeEnd(l){
			console.timeEnd(l);
			cseMsg("timeEnd",{label:l,time:Date.now(),l});
		},
		timeLog(l,...a){
			console.timeLog(l,...a);
			cseMsg("timeLog",{label:l,time:Date.now(),args:a,l,a});
		},
		timeStamp(l){
			console.timeStamp(l);
			cseMsg("timeStamp",l);
		},
		trace(...a){
			console.trace(...a);
			let s=undefined;
			try{throw new Error()}catch(e){s=e.stack}
			cseMsg("trace",{args:a,stack:s,a,s});
		}
	});
	function cp(ot,os){// 遍历复制对象
		for(const k in os){
			const v=os[k];
			if(typeof v==="object"&&typeof ot[k]==="object"){
				cp(ot[k],v);
				return;
			}
			ot[k]=v;
		}
	}
	const Temp={
		HTTP_pools:{},// HTTP连接池
	};
	// 处理器
	let env={};// 环境参数
	function setEnv(d){// 设置一些环境参数，一般启动时设置一次
		// 注意: 参数是否有效由各自需要某个参数的函数决定，也就意味着传递无效的参数可能会造成意外的错误。
		if(typeof d.append!=="object")throw new TypeError("不是配置对象");
		cp(env,d.append);
	}
	function getEnv(){// 获取环境参数
		pms("getEnv",env,{time:Date.now()});
	}
	function reEnv(){// 重置环境参数
		env={};
	}
	function addVar(d){// 添加变量，将会对收到的代码进行执行
		const name=d.name,code=d.code;
		function fpms(data){pms("functionPush",data,{name})}
		try{
			self[name]=new Function("pms",`"use strict";return(${code});`)(fpms);
		}catch(e){
			pms("addVariableError",e,{name,code});
		}
	}
	function setVar(d){// 设置变量
		self[d.key]=d.value;
	}
	function getVar(d){// 获取变量
		pms("getVar",self[d.key],{name:d.key});
	}
	function evalCode(data){
		"use strict";
		const id=data.id;
		let r=void(0);
		try{
			r=new Function(`"use strict";${data.code}`)();
		}catch(e){
			pms("evalCodeError",e,{id,code:data.code});
			return;
		}
		pms("evalCodeReturn",r,{id});
	}
	const handle={// 处理器列表
		init:setEnv,
		setEnv,
		getEnv,
		reEnv,
		addVar,
		setVar,
		getVar,
		evalCode
	};
	self.onmessage=inputMessage;
	self.addEventListener("error",ev=>{
		pms("errorEvent",ev.error,{message:ev.message,filename:ev.filename,lineno:ev.lineno,colno:ev.colno});
	});
	self.addEventListener("unhandledrejection",ev=>{
		pms("unhandledrejection","出现未处理的Promise.reject事件。为防止错误的数据，不发送信息，请在控制台查看。");
		console.error("Event Promise.reject",ev,ev.promise,ev.reason);
	});
	setInterval(function check(){// 检查
		function ck(tp){pms("checkWarn",tp)}
		if(self.onmessage!==inputMessage){
			console.warn("消息接收被修改",self.onmessage);
			self.onmessage=inputMessage;
			ck("消息接收已被修改");
		}
	},1000);

	/* 覆盖原始接口，防止访问外部导致逃逸 */
	// 获取Worker API
	const close=self.close,
		fetch=self.fetch,
		Request=self.Request,
		Response=self.Response,
		XMLHttpRequest=self.XMLHttpRequest,
		WebSocket=self.WebSocket,
		EventSource=self.EventSource,
		fonts=self.fonts,
		FontFace=self.FontFace,
		BroadcastChannel=self.BroadcastChannel,
		MessageChannel=self.MessageChannel,
		caches=self.caches,
		crypto=self.crypto,
		indexedDB=self.indexedDB,
		Notification=self.Notification,
		performance=self.performance;
	// 中间组件
	function funNoStr(){return `function ${this?.name||"any"}() {\n    [native code]\n}`}// 隐藏实际代码
	function networkMsg(api,opt,sta="none"){// 发送网络事件
		pms("network",opt,{api,status:sta});
	}
	function HeadersToString(h){// 处理Headers对象
		if(!(h instanceof Headers))return h;
		let o={};
		for(const d in h.entries()){
			let k=d[0],v=d[1];
			if(!(k in o)) o[k]=[];
			o[k].push(v);
		}
		return o;
	}
	function dsHTTPAgent(method,url,headers,body){
		const id=`${Date.now()}_${Math.trunc(Math.random()*10)}`;
		let m=method??"GET",h=HeadersToString(headers),b=body;
		Temp.HTTP_pools[id]={};
		pms("toHTTPAgent",{method:m,url,headers:h,body},{id});
		return id;
	}
	handle["SHTTP"]=d=>{// 从父文档接收HTTP响应
		const ho=Temp.HTTP_pools[d.id];
		if(d.type==="get_pools"){
			console.debug(Temp.HTTP_pools);
			return;
		}
		if(typeof ho!=="object")throw new ReferenceError("找不到id对应的请求");
		if(d.type==="wait"){
			ho.waitUntil();
			return;
		}else if(d.type==="reject"){
			ho.reject();
			return
		}
		if(typeof d.response==="object") ho.respondWith(d.response);
	}
	// 覆盖原始接口
	self.close=()=>{
		pms("callCloseFunction");
	}
	self.fetch=(resource,options={})=>{
		if(env.network?.allow==false)throw new TypeError("fetch");
		let u,o={};
		if(typeof resource==="string") u=resource;
		else u=resource.url;
		u=new URL(String(u),env.network?.baseURL).href;
		for(const on of ["method","headers","body","cache","credentials","integrity","mode","redirect","referrer"]){
			if(Object.hasOwn(options,on)){
				o[on]=options[on];
				continue;
			}else if(typeof resource==="string")continue;
			else if(Object.hasOwn(resource,on)){
				o[on]=resource[on];
				continue;
			}
		};function createPromise(id){// 创建fetch的返回值
			return new Promise((resolve,reject)=>{
				const ho=Temp.HTTP_pools[id];
				if(!ho){
					console.warn(`未找到id为'${id}'的数据对象，已自动创建。`);
					Temp.HTTP_pools[id]={};
				}
				ho.log=[`${Date.now()}: 创建`];
				ho.adl=(t)=>{ho.log.push(`${Date.now()}: ${t}`)};
				ho.timeoutId=setTimeout(()=>{ho.reject()},6e4);
				ho.rem=()=>{ho.adl("删除HTTP池引用");delete Temp.HTTP_pools[id]}// 删除
				ho.clt=()=>{ho.adl("清除计时"+ho.timeoutId);clearTimeout(ho.timeoutId)}// 清除计时器
				ho.respondWith=d=>{// 产生响应
					ho.adl("响应");
					ho.clt();
					ho.rem();
					resolve(new Response(d.body,{status:d.status,statusText:d.statusText,headers:d.headers}));
				}
				ho.waitUntil=()=>{// 延长处理
					ho.adl("延长");
					ho.clt();
					ho.timeoutId=setTimeout(()=>{ho.reject()},12e4);
				}
				ho.reject=d=>{// 拒绝响应
					ho.adl("拒绝");
					ho.clt();
					ho.rem();
					reject(new TypeError("Failed to fetch"));
				}
			});
		}
		const mode=env.network?.mode;
		if(mode==="HTTPAgent"){
			let dm=o.body?"POST":"GET";
			const id=dsHTTPAgent(o.method??dm,u,o.headers,o.body);
			return createPromise(id);
		}
		let r=new Request(u,o);
		if(o.headers instanceof Headers) o.headers=HeadersToString(o.headers);
		if(mode==="hook"){
			const id=`${Date.now()}`;
			Temp.HTTP_pools[id]={};
			networkMsg("fetch",{
				...o,
				id
			},"hook");
			return createPromise(id);
		}
		networkMsg("fetch",o,"request");
		return fetch(r).then(s=>{
			networkMsg("fetch",{
				headers:HeadersToString(s.headers),
				ok:s.ok,
				redirected:s.redirected,
				status:s.status,
				statusText:s.statusText,
				type:s.type,
				url:s.url,
			},"response");
			return s;
		},e=>{
			networkMsg("fetch",{error:e},"error");
		});
	}
	self.XMLHttpRequest=class{}
	self.WebSocket=class{}
	self.EventSource=class{}
	self.fonts={// 可能无法覆盖
	}// 可以用var覆盖掉
	self.FontFace=class{}
	self.caches={}
	self.Notification=class{}
	self.performance={}
})();

var indexedDB={}// 强行覆盖
