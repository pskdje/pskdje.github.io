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
		postMessage(msgPack(...args));
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
	// 处理器
	function setEnv(d){// 设置一些环境参数，一般启动时设置一次
		// 计划替代网络相关功能并用此函数设置环境
	}
	function addVar(d){// 添加变量，将会对收到的代码进行执行
		function fpms(data){pms("functionPush",data)}
		const name=d.name,code=d.code;
		try{
			self[name]=new Function("pms",`"use strict";return(${code})`)(fpms);
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
			r=new Function(data.code)();
		}catch(e){
			pms("evalCodeError",e,{id,code:data.code});
			return;
		}
		pms("evalCodeReturn",r,{id});
	}
	const handle={// 处理器列表
		init:setEnv,
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
		pms("unhandledrejectionEvent","出现未处理的Promise.reject事件。为防止错误的数据，不发送信息，请在控制台查看。");
		console.error("Event Promise.reject",ev,ev.promise,ev.reason);
	});
	setInterval(function check(){// 检查
		function ck(tp){pms("checkWarn",tp)}
		if(self.onmessage!==inputMessage){
			self.onmessage=inputMessage;
			ck("消息接收已被修改");
		}
	},1000);
})()