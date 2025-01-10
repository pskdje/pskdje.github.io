// 运行eval.js

class DocsEval extends EventTarget {
	#cnm="DocsEval";
	get[Symbol.toStringTag](){return this.#cnm};
	#work=null;// Worker回话
	#isTerminate=false;// 是否终止
	get isTerminate(){return this.#isTerminate};
	msgPush=new RunDataPush("evalMessageEvent");
	constructor(){
		super();
		const wk=this.#work=new Worker("/js/eval.js");
		wk.onmessage=ev=>this.#listenerMsg(ev);
	}
	close(){// 关闭
		this.#work.terminate();
		this.#isTerminate=true;
	}
	post(type,append={},transfer=undefined){// 推送消息封装
		this.#work.postMessage({
			WPJDS:type,
			get[Symbol.toStringTag](){return"DocsEval<evaltool.js>"},
			__proto__:null,
			...append
		},transfer);
	}
	#dpem(nm,d){// 触发消息事件
		const ev=new MessageEvent(nm,{data:d,origin:"eval.js"});
		this.dispatchEvent(ev);
		let on=this["on"+nm.toLowerCase()];
		if(typeof on==="function")try{
			on(ev);
		}catch(e){
			console.error(e);
		}
	}
	#listenerMsg(ev){// 监听消息并引发事件
		const d=ev.data;
		if(typeof d!=="object"){
			let em="无效的消息数据，请检查eval.js是否有效。";
			cache.log.err.add(40,this.#cnm,em);
			console.error(em,d);
			return;
		}
		if(d.WPJDS!=="evalJS"){
			let em="签名错误，请检查文件代码。";
			cache.log.err.add(40,this.#cnm,em);
			console.error(em,d);
			return
		}
		if(typeof d.type!=="string"){
			let em="运行类型不是字符串，请检查各个代码。";
			cache.log.err.add(30,this.#cnm,em);
			console.warning(em,d);
		}
		this.msgPush.push(d);
		this.#dpem(String(d.type).trim(),d);
	}
	// 发送操作
	setEnv(d){
		this.post("setEnv",{append:d});
	}
	getEnv(){
		this.post("getEnv");
	}
	reEnv(){
		this.post("reEnv");
	}
	addVar(name,code){
		if(typeof name!=="string")throw new TypeError("提供的name不是字符串");
		if(typeof code!=="string")throw new TypeError("提供的code不是字符串");
		this.post("addVar",{name,code});
	}
	setVar(key,value,transfer){
		if(typeof key!=="string")throw new TypeError("提供的key不是字符串");
		if(typeof value==="function")throw new TypeError("无法直接设置函数");
		this.post("setVar",{key,value},transfer);
	}
	getVar(key){
		if(typeof key!=="string")throw new TypeError("提供的key不是字符串");
		this.post("getVar",{key});
	}
	evalCode(code,id){
		this.post("evalCode",{code,id});
	}
	// -事件-
	#setOnF(v){// 检查输入，返回值作为on*的值
		if(typeof v==="function")return v;
		else return null;
	}// 主要事件
	#onmsgerr=null;// msgErr
	get onmsgerr(){return this.#onmsgerr}
	set onmsgerr(v){this.#onmsgerr=this.#setOnF(v)}
	#onhandleerror=null;// handleError
	get onhandleerror(){return this.#onhandleerror}
	set onhandleerror(v){this.#onhandleerror=this.#setOnF(v)}
	#onconsole=null;// console
	get onconsole(){return this.#onconsole}
	set onconsole(v){this.#onconsole=this.#setOnF(v)}
	#ongetenv=null;// getEnv
	get ongetenv(){return this.#ongetenv}
	set ongetenv(v){this.#ongetenv=this.#setOnF(v)}
	#onaddvariableerror=null;// addVariableError
	get onaddvariableerror(){return this.#onaddvariableerror}
	set onaddvariableerror(v){this.#onaddvariableerror=this.#setOnF(v)}
	#onfunctionpush=null;// functionPush
	get onfunctionpush(){return this.#onfunctionpush}
	set onfunctionpush(v){this.#onfunctionpush=this.#setOnF(v)}
	#ongetvar=null;// getVar
	get ongetvar(){return this.#ongetvar}
	set ongetvar(v){this.#ongetvar=this.#setOnF(v)}
	#onevalcodeerror=null;// evalCodeError
	get onevalcodeerror(){return this.#onevalcodeerror}
	set onevalcodeerror(v){this.#onevalcodeerror=this.#setOnF(v)}
	#onevalcodereturn=null;// evalCodeReturn
	get onevalcodereturn(){return this.#onevalcodereturn}
	set onevalcodereturn(v){this.#onevalcodereturn=this.#setOnF(v)}
	#onerrorevent=null;// errorEvent
	get onerrorevent(){return this.#onerrorevent}
	set onerrorevent(v){this.#onerrorevent=this.#setOnF(v)}
	#onunhandledrejection=null;// unhandledrejection
	get onunhandledrejection(){return this.#onunhandledrejection}
	set onunhandledrejection(v){this.#onunhandledrejection=this.#setOnF(v)}
	#oncheckwarn=null;// checkWarn
	get oncheckwarn(){return this.#oncheckwarn}
	set oncheckwarn(v){this.#oncheckwarn=this.#setOnF(v)}
	// 其它事件
	#onnetwork=null;// network
	get onnetwork(){return this.#onnetwork}
	set onnetwork(v){this.#onnetwork=this.#setOnF(v)}
	#oncallclosefunction=null;// callCloseFunction
	get oncallclosefunction(){return this.#oncallclosefunction}
	set oncallclosefunction(v){this.#oncallclosefunction=this.#setOnF(v)}
	#ontohttpagent=function(ev){// toHTTPAgent代理的默认实现
		const d=ev.data;
		const q=d.data;
		function pd(t,r,s){
			ev.target.post("SHTTP",{id:d.id,type:t,response:r},s);
		}
		docsScript.HTTPAgent(q.method,q.url,{headers:q.headers,body:q.body,type:"arraybuffer"},"fetch").then(r=>{
			pd("response",{body:r.data,status:r.statusCode,statusText:r.statusText,headers:r.headers},[r.data]);
		},e=>{
			pd("reject");
		});
	};// toHTTPAgent
	get ontohttpagent(){return this.#ontohttpagent}
	set ontohttpagent(v){this.#ontohttpagent=this.#setOnF(v)}
	/*#on=null;// 
	get on(){return this.#on}
	set on(v){this.#on=this.#setOnF(v)}*/
}
