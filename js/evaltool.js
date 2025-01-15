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
		let on=this["on_"+nm];
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
	get on_msgErr(){return this.#onmsgerr}
	set on_msgErr(v){this.#onmsgerr=this.#setOnF(v)}
	#onhandleerror=null;// handleError
	get on_handleError(){return this.#onhandleerror}
	set on_handleError(v){this.#onhandleerror=this.#setOnF(v)}
	#onconsole=null;// console
	get on_console(){return this.#onconsole}
	set on_console(v){this.#onconsole=this.#setOnF(v)}
	#ongetenv=null;// getEnv
	get on_getEnv(){return this.#ongetenv}
	set on_getEnv(v){this.#ongetenv=this.#setOnF(v)}
	#onaddvariableerror=null;// addVariableError
	get on_addVariableError(){return this.#onaddvariableerror}
	set on_addVariableError(v){this.#onaddvariableerror=this.#setOnF(v)}
	#onfunctionpush=null;// functionPush
	get on_functionPush(){return this.#onfunctionpush}
	set on_functionPush(v){this.#onfunctionpush=this.#setOnF(v)}
	#ongetvar=null;// getVar
	get on_getVar(){return this.#ongetvar}
	set on_getVar(v){this.#ongetvar=this.#setOnF(v)}
	#onevalcodeerror=null;// evalCodeError
	get on_evalCodeError(){return this.#onevalcodeerror}
	set on_evalCodeError(v){this.#onevalcodeerror=this.#setOnF(v)}
	#onevalcodereturn=null;// evalCodeReturn
	get on_evalCodeReturn(){return this.#onevalcodereturn}
	set on_evalCodeReturn(v){this.#onevalcodereturn=this.#setOnF(v)}
	#onerrorevent=null;// errorEvent
	get on_errorEvent(){return this.#onerrorevent}
	set on_errorEvent(v){this.#onerrorevent=this.#setOnF(v)}
	#onunhandledrejection=null;// unhandledrejection
	get on_unhandledrejection(){return this.#onunhandledrejection}
	set on_unhandledrejection(v){this.#onunhandledrejection=this.#setOnF(v)}
	#oncheckwarn=null;// checkWarn
	get on_checkWarn(){return this.#oncheckwarn}
	set on_checkWarn(v){this.#oncheckwarn=this.#setOnF(v)}
	// 其它事件
	#onnetwork=null;// network
	get on_network(){return this.#onnetwork}
	set on_network(v){this.#onnetwork=this.#setOnF(v)}
	#oncallclosefunction=null;// callCloseFunction
	get on_callCloseFunction(){return this.#oncallclosefunction}
	set on_callCloseFunction(v){this.#oncallclosefunction=this.#setOnF(v)}
	#ontohttpagent=function(ev){// toHTTPAgent代理的默认实现
		const d=ev.data;
		const q=d.data;
		function pd(t,r,s){
			ev.target.post("SHTTP",{id:d.id,type:t,response:r},s);
		}
		docsScript.HTTPAgent(q.method,q.url,{headers:q.headers,body:q.body,type:"arraybuffer",timeout:50000},"fetch").then(r=>{
			pd("response",{body:r.data,status:r.statusCode,statusText:r.statusText,headers:r.headers},[r.data]);
		},e=>{
			pd("reject");
		});
	};// toHTTPAgent
	get on_toHTTPAgent(){return this.#ontohttpagent}
	set on_toHTTPAgent(v){this.#ontohttpagent=this.#setOnF(v)}
	/*#on_=null;// 
	get on_(){return this.#on}
	set on_(v){this.#on=this.#setOnF(v)}*/
}
