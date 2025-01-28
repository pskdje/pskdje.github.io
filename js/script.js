// 通用
// 声明变量
const Temp={// 暂存
	logType:{// 本地化日志类型
		d:[],
		zh:[],
	},
	WPJDSH:new Proxy({},{set(t,p,v){if(typeof v==="function")t[p]=v;return true}}),// 处理某个消息
};// temp[END]
const cache={// 缓存
	log:{},// 日志
	runDataReceive:new Proxy({},{set(t,p,v){if(Array.isArray(v))t[p]=v;return true}}),// 运行数据接收
};// cache[END]
const config={// 配置
	storage:{
		auto_dark:true,// 自动切换暗色
		colorScheme:"auto",// 配色方案
	}
};// config[END]
const DEBUG=[true];// 调试
// 声明类
class DocsError extends Error {
	static getStack(){
		try{
			throw new Error("get stack");
		}catch(e){
			return e.stack;
		}
	}[Symbol.toPrimitive](h){
		if(h==="number")return this.code;
		else return this.toString();
	}
	get[Symbol.toStringTag](){return this.constructor.name;}
	name="DocsError";
	constructor(message,options){
		const o=options??{};
		super(message,options);
		this.time=Date.now();
		this.code=typeof o.code==="number"?o.code:0;
	}
}
class Log {// 日志
	static type=[];
	get[Symbol.toStringTag](){return"Log"}
	#events={add:[],remove:[],removeall:[]}
	constructor(logName,describe=""){
		this.name=logName??"";
		this.desc=describe;
		this.log=[];
		this.logType=Log.type;
		this.maxLog=Infinity;
		if(!Array.isArray(Log.type))throw new TypeError("'Log.type'不是数组!");
		Log.type.forEach(function(v,i){
			if(typeof v!=="string"){
				if(typeof cache.log?.root?.add==="function") cache.log.root.add(50,"Log.constructor",`全局日志类型index[${i}]不是字符串。`);
				throw new TypeError(`typeof Log.type[${i}]!==='string'`);
			}
		},cache.log);
		if(typeof this.name!=="string")throw new TypeError("变量'name'的类型不是字符串。");
		if(typeof describe!=="string")throw new TypeError("变量'describe'的类型不是字符串。");
		Object.defineProperty(this,"length",{
			enumerable:true,
			get:function(){
				if(!hasOwnKey(this,"log"))return undefined;
				if(!Array.isArray(this.log))return NaN;
				if(!this.log.every(function(el){
					if(typeof el!=="object")return false;
					if(Object.getPrototypeOf(el)!==Object.prototype)return false;
					if(Object.getOwnPropertyNames(el).length!==6)return false;
					if(typeof el.time!=="number"||typeof el.type!=="number")return false;
					if(typeof el.typeName!=="string"||typeof el.source!=="string")return false;
					if(typeof el.message!=="string")return false;
					if(!hasOwnKey(el,"data"))return false;
					return true;
				}))return -Infinity;
				return this.log.length;
			}
		});
	}; on(name,fun){// 增加事件执行
		if(name in this.#events){
			if(typeof fun==="function"){this.#events[name]?.push?.(fun);return true;}
		};return false;
	}; dison(n,f){// 减少事件执行
		if(n in this.#events){
			for(let i=0;i<this.#events[n].length;i++)if(this.#events[n][i]===f){
				this.#events[n].splice(i,1);
				return true;
			}
		};return false;
	}; #triggerEvent(n,d){// 触发事件
		let t=this;
		const l=t.#events[n];
		if(!l){
			cache.log.root.add(30,"Log.prototype.#triggerEvent",`未在#events内定义事件'${n}'`,d);
			return;
		};(async function(){
			for(const i of l)if(typeof i==="function"){
				const ev={name:n,target:t,data:d};
				try{ i(ev);}catch(e){console.error(e);}
			}
		})();
	}; add(type,source,message,data=undefined){// 增加日志
		if(!Array.isArray(this.log))throw new TypeError("object this.log not Array");
		var logItem={
			time:Date.now(),// 时间(毫秒时间戳)
			type:0,// 类型
			typeName:"",// 类型名称
			source:(typeof source==="string"?source:"undefined"),// 来源
			message:(function(m){
				if(Array.isArray(m)){
					let rm="";
					for(const mi of m){
						if(mi instanceof Error) rm+=" "+String(mi)+" ";
						else if(typeof mi==="object")try{rm+=JSON.stringify(mi,null,"\t");}catch(e){rm+=getType(mi,1);if(DEBUG[0])p(String(e));}
						else rm+=String(mi);
					};return rm;
				}else return String(m);
			})(message),// 信息
			data:data,// 其它数据
			get[Symbol.toStringTag](){return"LogItem"}
		};this.logType.forEach(function(v,i){
			if(typeof v!=="string"){
				if(typeof cache.log?.err?.add==="function")cache.log?.err?.add(50,`Log.prototype.add:'${this.name}'`,`日志类型index[${i}]不是字符串。`);
				throw new TypeError(`typeof this.logType[${i}]!==='string'`);
			}
		},this);
		if(typeof type==="undefined"){
			logItem.type=0;
			logItem.typeName="log";
		}else if(typeof this.logType[type]==="string"){
			logItem.type=type;
			logItem.typeName=this.logType[type];
		}else{
			logItem.type=NaN;
			logItem.typeName=String(type);
		};this.log.push(Object.freeze(logItem));
		this.collat();
		this.#triggerEvent("add",logItem);
	};toString(){// 输出日志文本
		var ls="日志名称:'"+this.name+"',输出时间:"+docsScript.dateToStr()+"\n\t--------------------\t\n";
		for(const li of this.log) ls+=`[${docsScript.dateToStr(li.time)}][${li.typeName}] "${li.source}": ${li.message}\n`;
		return ls;
	}; toFile(){// 输出日志文件
		return new File([this.toString()],this.name+"_-LogClassFile.log",{type:"text/log"});
	}; download(timeEnd=60000){// 下载日志(输出日志下载链接)
		if(typeof timeEnd!=="number")throw new TypeError("传入到属性'timeEnd'的类型不是数字。");
		let d=URL.createObjectURL(new Blob([this.toString()],{type:"text/log"}));
		setTimeout(d => URL.revokeObjectURL(d),timeEnd,d);
		return d;
	}; toNode(appendElement=document.body){// 将日志输出到节点中
		if(!appendElement instanceof Node){
			if(typeof cache.log?.err?.add==="function")cache.log?.err?.add(40,`Log.prototype.toNode:'${this.name}'`,"传入'appendElement'的数据不是节点。");
			throw new TypeError("传入'appendElement'的数据不是节点。");
		};let pre=document.createElement("pre");
		pre.textContent=this.toString();
		pre.className="log-view";
		appendElement.appendChild(pre);
	}; toJSON(){// 转换成可序列化成JSON的对象
		var ro={toJSON_time:docsScript.dateToStr(),name:this.name,desc:this.desc,length:this.length,log:[],logType:{}};
		for(const item of this.log){
			let rl={
				time:docsScript.dateToStr(item.time),
				type:item.type,typeName:item.typeName,
				source:item.source,
				message:String(item.message),
				data:null
			},rdt=typeof item.data;
			if(item.data===undefined||item.data===null) rl.data=null;
			else if(rdt==="string"||rdt==="number"||rdt==="boolean") rl.data=item.data;
			else if(rdt==="function") rl.data=`function [">${item.data.name}<"](${item.data.length}){${(Function.prototype.toString.call(item.data).indexOf("() {\n    [native code]\n}")<0?Function.prototype.toString.call(item.data).length:"[native code]")}}`;
			else if(rdt==="symbol") rl.data=Symbol.prototype.toString.call(item.data);
			else rl.data=getType(item.data,1);
			ro.log.push(rl);
		};for(const level in this.logType) ro.logType[level]=this.logType[level];
		return ro;
	}; collat(){// 整理
		if(typeof this.maxLog!=="number"){
			var t=typeof this.maxLog;
			this.maxLog=Infinity;
			cache.log.root.add(40,"Log.prototype.collat","类型错误: 日志上限应为数字，当前类型为'"+t+"'");
		};if(this.length>t)return this.remove("shift");
	}; remove(type,len=1,ind=0){// 清除日志
		var arr=[];// 暂存被清除的日志
		if(typeof type!=="string")throw new TypeError("不是字符串");
		else if(type==""|| type==="shift")for(let i=0;i<len;i++){// 清除旧日志
			arr.push(this.log.shift());
		}else if(type==="pop")for(let i=0;i<len;i++){// 清除新日志
			arr.push(this.log.pop());
		}else if(type==="splice")return this.log.splice(ind,len);// 清除某个范围的日志
		else if(type==="all"){// 清除全部
			arr=this.log;
			this.#triggerEvent("removeall",this.log);
			this.log=[];
		};this.#triggerEvent("remove",arr);
		return arr;
	}
}; Log.type[0]="DEBUG";Log.type[10]="LOG";Log.type[20]="INFO";Log.type[30]="WARN";Log.type[40]="ERROR";Log.type[50]="CRITICAL";// 默认的日志类型
Temp.logType.zh[0]="调试";Temp.logType.zh[10]="日志";Temp.logType.zh[20]="信息";Temp.logType.zh[30]="警告";Temp.logType.zh[40]="错误";Temp.logType.zh[50]="严重错误";Object.freeze(Temp.logType.zh);// 默认的日志类型(中文)
Temp.logType.d[0]="D";Temp.logType.d[10]="L";Temp.logType.d[20]="I";Temp.logType.d[30]="W";Temp.logType.d[40]="E";Temp.logType.d[50]="C";Object.freeze(Temp.logType.d);// 短的默认日志类型
class RunDataPush {// 运行数据推送
	static addTStr(obj,ot){// 为对象添加toString属性
		const ds={__proto__:null};
		if(typeof ot==="string")ds.value=ot;
		if(typeof ot==="function")ds.get=ot;
		return Object.defineProperty(obj,"toStrig",ds);
	};get[Symbol.toStringTag](){return"RunDataPush"};
	#CN="RunDataPush";// 类名
	#setValNotXCla(n,d){cache.log.root.add(30,this.#CN,`提供给实例${n}参数的类型错误`,d)}// 提供了错误的类型时，向root日志添加警告信息
	#log=null;// 推送到日志
	get log(){return this.#log}
	set log(v){if(v instanceof Log)this.#log=v;else if(v===undefined||v===null)this.#log=null;else this.#setValNotXCla("log",v)}
	#eventTarget=null;// 在该对象引发事件
	get eventTarget(){return this.#eventTarget}
	set eventTarget(v){if(v instanceof EventTarget)this.#eventTarget=v;else if(v===undefined||v===null)this.#eventTarget=null;else this.#setValNotXCla("eventTarget",v)}
	constructor(name,createReceiveAttr){
		if(typeof name!=="string")throw new TypeError("变量'name'的类型不是字符串");
		this.name=name;
		if(createReceiveAttr&&!(name in cache.runDataReceive))cache.runDataReceive[name]=[];
	}; push(data){// 推送数据到合适的接收组件
		if(this.#log) this.#log.add(0,`<RunDataPush>:"${this.name}"`,data,data);
		const et=this.#eventTarget,nm=this.name;
		if(et)new Promise((r)=>{r(et.dispatchEvent(new CustomEvent("rundatapush",{detail:{name:nm,data},composed:true})))});
		new Promise((resolve,reject)=>{
			const fl=cache.runDataReceive[nm],l=cache.log.root,pr="RunDataPush.prototype.push";
			if(!Array.isArray(fl)){resolve("type");return}
			for(const i of fl){
				if(typeof i!=="function"){l.add(30,pr,`${nm}的某个捕捉不是函数`,i);continue}
				try{i(nm,data)}catch(e){l.add(30,pr,`${nm}的某个捕捉执行时出现错误\n${e}`,e)}
			}; resolve("success");
		});return data;
	};
	get p(){return"对该属性赋值将调用push函数"}
	set p(v){this.push(v)}
}
// 声明自定义元素的类
class DocsTipDivElement extends HTMLElement {// 提示标签
	constructor(){super();}
	createDivData(title,opt={}){// 创建提示组件
		function E(g){return document.createElement(g)}
		const shadow=this.attachShadow({mode:"open"});
		const le=E("style"),dr=E("div"),ti=E("h3"),pt=E("p"),dt=E("slot");
		pt.append(dt);
		dr.append(ti,pt);
		dr.className="doctip";
		le.textContent=".doctip{border:3px solid gray;padding:3px;background-color:rgba(128,128,128,0.5);}h3{margin-top:0;}p{margin-left:6px;margin-right:6px;}";
		ti.textContent=title;
		shadow.append(le,dr);
		if(opt.bc)dr.style.borderColor=opt.bc;
		if(opt.bg)dr.style.backgroundColor=opt.bg;
		return{B:dr,T:ti,P:pt}
	};connectedCallback(){
		this.createDivData("提示");
	}
}
class DocsWarnElement extends DocsTipDivElement {// 提示警告
	constructor(){
		super();
	};connectedCallback(){
		this.createDivData("警告！",{bc:"#DD0",bg:"rgba(255,255,0,0.5)"});
	}
}
class DocsErrorElement extends DocsTipDivElement {// 提示错误
	constructor(){
		super();
	};connectedCallback(){
		this.createDivData("错误！",{bc:"red",bg:"rgba(255,0,0,0.5)"});
	}
}
customElements.define("docs-warn",DocsWarnElement);
customElements.define("docs-error",DocsErrorElement);
// 声明函数
function p(obj,sou){// 打印数据
	cache.log.all.add(0,"p@"+sou,[obj]);
	try{console.log(obj);}catch(e){};
	return obj;
}
function pageInit(){// 页面初始化
	cache.log.root.add(10,"pageInit","页面初始化开始");
	function dce(t){return document.createElement(t)};
	var p={
		view:dce("meta"),// 文档元数据
		style:dce("link"),// 整体样式
		ico:{// 图标
			p:"/website_icon/favicon-",
			"16":dce("link"),
			"32":dce("link"),
			"48":dce("link"),
			"64":dce("link"),
			"128":dce("link")
		}
	};// 设置文档元数据
	p.view.name="viewport";p.view.content="width=device-width,initial-scale=1.0";
	// 设置图标
	p.ico["128"].rel=p.ico["64"].rel=p.ico["48"].rel=p.ico["32"].rel=p.ico["16"].rel="icon";// 设置链接类型
	p.ico["16"].sizes="16x16";p.ico["32"].sizes="32x32";p.ico["48"].sizes="48x48";p.ico["64"].sizes="64x64";p.ico["128"].sizes="128x128";// 设置图标大小(设置图标的分辨率信息)
	p.ico["16"].href=p.ico.p+"16.ico";p.ico["32"].href=p.ico.p+"32.ico";p.ico["48"].href=p.ico.p+"48.ico";p.ico["64"].href=p.ico.p+"64.ico";p.ico["128"].href=p.ico.p+"128.ico";// 设置图标路径
	// 设置整体样式的类型
	p.style.rel="stylesheet";
	// 将元素附加
	document.head.append(p.view);// 附加文档元数据
	p.style.href="/css/style.css";// 设置整体样式的路径
	document.head.append(p.style);// 将整体样式附加
	document.head.append(p.ico["16"],p.ico["32"],p.ico["48"],p.ico["64"],p.ico["128"]);// 附加图标
	cache.log.root.add(10,"pageInit","页面初始化结束");
}
function errorElement(text,appendNode){//在元素内输出错误
	let n=(appendNode instanceof HTMLElement?appendNode:document.body);
	const e=document.createElement("docs-error");
	e.innerHTML=text;
	n.append(e);
	return new Error(text);
};function warnElement(text,appendNode){//在元素内输出警告
	let n=(appendNode instanceof HTMLElement?appendNode:document.body);
	const e=document.createElement("docs-warn");
	e.innerHTML=text;
	n.append(e);
	return e.textContent;
};function debugTools(runName,...args){// 用于调试
	if(typeof debugTool==="object"){
		if(typeof debugTool.run==="function"){
			return debugTool.run(runName,args);
		}else return new ReferenceError(`debugTool.run is not defined`);// 当run不存在时返回
	}else return new ReferenceError("File 'debug.js' not load");// 当debugTool变量不存在时返回
};function hasOwnKey(obj,key){// 若担心hasOwnProperty被覆盖可使用Object.prototype内的函数。现在存在新的检测接口，但可能存在兼容问题，本方法继续保留并默认采用新接口。
	if(typeof Object.hasOwn==="function")return Object.hasOwn(obj,key);
	return Object.prototype.hasOwnProperty.call(obj,key);
};function getType(obj,reType){// 获取类名称(Object.prototype.toString)
	var reText=Object.prototype.toString.call(obj);
	if(reType)return reText;
	else return reText.slice(8,reText.length-1);
};function docWindow(title,doc){// 窗口
	var els={
		r:document.createElement("div"),// 窗口根元素
		h:document.createElement("div"),// 窗口头部
		t:document.createElement("h4"),// 窗口标题
		b:document.createElement("button"),// 窗口关闭按钮
		d:document.createElement("div")// 内容
	},events={
		close:[null]
	};function docWindowClose(){// 实现关闭
		var ev=new Event("close");
		els.r.remove();
		els.d.dispatchEvent(ev);
		typeof events.close[0]==="function"&& events.close[0].call(els.d,ev);
	}
	els.r.className="window_root";
	if(
		(config.storage.auto_dark && window.matchMedia("(prefers-color-scheme:dark)").matches)
		|| config.storage.colorScheme==="dark"
	) els.r.classList.add("docs-style-dark");
	els.h.className="window_header";
	els.t.textContent=String(title);
	els.b.title="关闭";
	els.b.textContent="×";
	els.b.onclick=docWindowClose;
	els.d.className="window_content";
	els.d.innerHTML=doc;
	els.h.append(els.t,els.b)
	els.r.append(els.h,els.d);
	document.body.appendChild(els.r);
	var docRE=document.documentElement;
	function move(mt,{wrX,wrY,wcW,wcH}){
		var waX=mt.clientX-wrX,waY=mt.clientY-wrY;
		if(waX<0) waX=0;if(waY<0) waY=0;
		if(waX>(docRE.clientWidth-wcW)) waX=docRE.clientWidth-wcW;
		if(waY>(docRE.clientHeight-wcH)) waY=docRE.clientHeight-wcH;
		els.r.style.left=waX+"px";els.r.style.top=waY+"px";
	};els.t.onmousedown=function(e){// 实现鼠标窗口拖动
		var wrX=e.clientX-els.r.offsetLeft,wrY=e.clientY-els.r.offsetTop;
		var wcW=els.r.offsetWidth,wcH=els.r.offsetHeight;// 可视区域宽高
		var mousemoveFun=function(e){
			move(e,{wrX,wrY,wcW,wcH});
		},mouseupFun=function(e){
			docRE.removeEventListener("mousemove",mousemoveFun);
			docRE.removeEventListener("mouseup",mouseupFun);
		}
		docRE.addEventListener("mousemove",mousemoveFun);
		docRE.addEventListener("mouseup",mouseupFun);
	};els.t.ontouchstart=function(e){// 实现触摸窗口拖动
		var tc=e.targetTouches[0];
		var wrX=tc.clientX-els.r.offsetLeft,wrY=tc.clientY-els.r.offsetTop;
		var wcW=els.r.offsetWidth,wcH=els.r.offsetHeight;// 可视区域宽高
		var tcM=function(e){
			move(e.targetTouches[0],{wrX,wrY,wcW,wcH});
		},tcE=function(e){
			els.t.ontouchcancel=els.t.ontouchend=els.t.ontouchmove=null;
		}
		els.t.ontouchmove=tcM;
		els.t.ontouchcancel=els.t.ontouchend=tcE;
	};return Object.freeze({
		e:els.d,// 内容
		c:els.d.childNodes,// 内容节点列表
		get title(){return els.t.textContent;},// 获取标题
		set title(t){els.t.textContent=String(t);},// 设置标题
		get connect(){return els.r.isConnected;},// 是否存在于DOM
		get top(){return els.r.style.top;},// 获取与顶点的距离
		set top(value){els.r.style.top=value;},// 设置与顶点的距离
		get left(){return els.r.style.left;},// 获取左边的距离
		set left(value){els.r.style.left=value;},// 设置左边的距离
		get height(){return els.r.style.height;},// 获取高度
		set height(value){els.r.style.height=value;},// 设置高度
		get width(){return els.r.style.width;},// 获取宽度
		set width(value){els.r.style.width=value},// 设置宽度
		get zIndex(){return els.r.style.zIndex;},// 获取堆叠层级
		set zIndex(value){els.r.style.zIndex=String(value);},// 设置堆叠层级
		close:docWindowClose,// 关闭
		// 事件
		get onclose(){return events.close[0];},
		set onclose(func){
			if(func===null) events.close[0]=null;
			if(typeof func==="function") events.close[0]=func;
		},
		get[Symbol.toStringTag](){return"docWindowControl"}
	});
}
// 声明其它
const docsScript={
	pageData:{// 页面数据
		port:location.port,
		path:location.pathname,
		search:new URLSearchParams(location.search),
		hash:location.hash,
		html:document.documentElement,
		title:document.title,
		images:document.images,
		links:document.links,
		scripts:document.scripts,
		styles:document.styleSheets,
		docWH:[window.innerWidth,window.innerHeight],// 内容宽高
		// 其它
		isDark:window.matchMedia("(prefers-color-scheme:dark)").matches,
		get isSetDark(){return document.body.classList.contains("docs-style-dark")}
	}, compat:{// 兼容检查。此处提供默认的检查，可以使用其它脚本在此处添加其它的检查结果。
		addeventlistenerOptions:(()=>{
			const opt={once:true,passive:false};try{
			window.addEventListener("test",null,opt);
			window.removeEventListener("test",null,opt);
			return true;
			}catch(e){return false};
		})(),// 添加事件的第3个参数是否支持多个操作
	}, init:function scriptInit(keys={},...args){// 用于启动
		var rl=cache.log.root;
		rl.add(10,"docsScript.init","开始加载页面");
		var sInitK=keys;// 复制keys的数据
		if(!window["DATA_page"]){// 判断"DATA_page"是否存在。若不存在，输出错误。
			errorElement("不存在页面数据！");
			rl.add(40,"docsScript.init","加载页面失败，原因：全局属性DATA_page不存在，应在执行docsScript.init()前声明。");
			return new Error("Not found page object.");
		};if(typeof keys!=="object"){// keys的类型不属于Object时执行
			errorElement("InitError: key 'keys' not Object.");
			rl.add(40,"docsScript.init","加载页面失败，原因：属性keys的类型不是Object，请确保它的前后存在'{}'。");
			return new Error("key 'keys' type not Object.");
		};var sInitK=keys;
		this.XHR("GET","/js/website.json",function(){
			if(this.status===404){
				errorElement("数据不存在。");
				rl.add(40,"docsScript.init","加载页面失败，原因：没有在路径'/js'找到'website.json'。");
				return;
			};try{var websiteData=JSON.parse(this.responseText);// 转换JSON文本
			}catch(err){
				rl.add(50,"docsScript.init","解析'website.json'文件的内容时出现异常，请确保'website.json'文件是用JSON语法编写并且没有语法错误。");
				if(err instanceof SyntaxError){// 无法转化时执行
					errorElement(`服务器返回数据类型错误。<br /><iframe src="data:text/html,${encodeURIComponent(this.response)}" width="100%"></iframe>`);
					return;
				}else throw err;
			}; cache["websiteData"]=websiteData;// 缓存website.json文件
			cache["websiteData"].toLocaleString=function(){return"缓存数据";}
			Object.freeze(cache["websiteData"]);// 冻结缓存
			rl.add(20,"tips",docsScript.getTip());
			if(Array.isArray(DATA_page.lib)){// 当DATA_page.lib为Array时才执行
				if(!websiteData.lib)throw new ReferenceError("不存在lib引用表");
				for(const i of DATA_page.lib)try{ docsScript.loadLib(i);}catch(e){rl.add(40,"docsScript.init.lib:error",e);}
			};if(Array.isArray(DATA_page.load))for(const i of DATA_page.load)try{
				if(typeof i==="function") i();
			}catch(e){cache.log.err.addError(40,"DATA_page.load",e)};
		});// this.XHR[END]
		rl.add(10,"docsScript.init","页面加载结束");
	}, loadLib:function loadLib(name){// 加载库
		if(!cache.websiteData?.lib)throw new ReferenceError("不存在lib引用表");
		var lib=cache.websiteData.lib,rl=cache.log.root,al=cache.log.all;
		function toser(t){// host调整
			if(typeof t!=="string")return t;
			if(t[0]==="#"&&t[1]==="/")return "//"+location.hostname+":12000/path/se0A.obb.lib/"+t.slice(2);
			return t;
		};function append(id,src){// 检查是否存在，若不存在，添加；若存在，抛出错误。
			if(document.getElementById(id))throw ReferenceError("已存在该库");
			var scr=document.createElement("script");
			scr.id=id;
			scr.src=src;
			scr.onload=function(){
				al.add(0,"docsScript.loadLib",["Lib id '",id,"' 加载成功"]);this.onload=this.onerror=null;
			};scr.onerror=function(){
				al.add(40,"docsScript.loadLib",["Lib id '",id,"' 加载失败"]);this.onload=this.onerror=null;
			};document.head.append(scr);
		};if(name in lib){
			if(typeof lib[name]==="string") append(name,toser(lib[name]));
			else if(Array.isArray(lib[name])){
				var i=0;
				for(const lp of lib[name]){
					if(typeof lp==="string") append(name+"-"+(++i),toser(lp));
					else rl.add(40,"docsScript.loadLib",new TypeError(`'${name}'的某一项不是字符串。内容类型:${typeof lp}，值: '${lp}'`));
				}
			}else rl.add(40,"docsScript.loadLib",new TypeError(`无法解析'${name}'的值`));
		}else al.add(40,"docsScript.loadLib",["不存在名为'",name,"'的库。"]);
	}, getTip:function getTip(){// 获取提示
		var rl=cache.log.root;
		if(typeof cache["websiteData"]!=="object"){
			rl.add(40,"docsScript.getTip","未找到网站数据");
			console.error("websiteDate not found");
			return undefined;
		};var tips=cache["websiteData"]["tips"];
		if(!Array.isArray(tips)){
			rl.add(40,"docsScript.getTip","未找到提示列表");
			console.error("tips is unknow");
			return null;
		};if(tips.length<1){
			rl.add(30,"docsScript.getTip","没有提示");
			this.warn("tips length is 0","console");
			return null;
		}return tips[this.getRandom("f",0,tips.length)];
	}, XHR:function xhr(method,url,loadFun=function(){console.debug(this.response);},errorFun=function(){console.error("%c请求失败。","color:red;background:yellow;");},type="",data=undefined){// 用于加载数据
		var xhr=new XMLHttpRequest();
		xhr.onload=function(event){
			var responseSize=(function(res,type){
				if(type==="")return new Blob([res]).size;
				else if(type==="text")return new Blob([res]).size;
				else if(type==="arraybuffer")return new Blob([res]).size;
				else if(type==="blob")return res.size;
				else if(type==="json")return "[非实际情况 json]"+ new Blob([JSON.stringify(res)]).size;
				else if(type==="document")return "[非实际情况 document]"+ new Blob([res.documentElement.outerHTML]).size;
				else return new Blob([res]).size;
			})(this.response,this.responseType);
			cache.log.requestLog.add(0,"docsScript.XHR:onload",`[${method}] "${this.responseURL}" - ${this.status} "${this.statusText}" - ${responseSize}字节`);
			if(DEBUG[0]){
				console.debug(event);
				console.debug(this);
			}
		}; xhr.onerror=function(event){
			cache.log.requestLog.add(40,"docsScript.XHR:onerror",`[${method}] "${this.responseURL||new URL(url,location)}" => errorEvent 网络,CORS等错误`);
			console.debug(event);
			console.debug(this);
		}
		xhr.addEventListener("load",loadFun);
		xhr.addEventListener("error",errorFun);
		xhr.open(method,url);
		xhr.responseType=type;
		xhr.send(data);
	}, appendScript:function appendScript(src,onload,onerror){// 将JavaScript文件附加入文档
		cache.log.root.add(0,"docsScript.appendScript",["'",src,"'将会附加入文档"]);
		var s=document.createElement("script");
		s.className="append_js";
		s.id=s.src=src;
		if(typeof onload==="function") s.onload=onload;
		else s.onload=()=>{cache.log.all.add(0,`script>docsScript.appendScript<HTMLScriptElement>:#'${src}'[loadEvent]`,"文件已加载。");}
		if(typeof onerror==="function") s.onerror=onerror;
		else s.onerror=()=>{cache.log.all.add(0,`script>docsScript.appendScript<HTMLScriptElement>:#'${src}'[errorEvent]`,"文件未加载。");}
		return document.head.appendChild(s);
	}, removeScript:function removeScript(id){// 将JavaScript文件删除
		cache.log.root.add(0,"docsScript.removeScript",["'",id,"'将会从文档中删除"]);
		var s=document.head.getElementById(id);
		if(s)return document.head.removeChild(s);
		else return null;
	}, dateToStr:function dateOrTimestampToString(datetime,isMil=true){// 将时间转换为字符串
		var dateCl=(function(d){// Date对象
			if(typeof d==="undefined")return new Date();
			else if(d instanceof Date)return d;
			else if(Number.isNaN(d))return new Date();
			else if(typeof d==="number")return new Date(d);
			else{cache.log.root.add(30,"docsScript.dateToStr","传入数据无效，已使用默认方案（当前时间）。");return new Date();}
		})(datetime);
		var dateOb={// 数字
			y:dateCl.getFullYear(),// 年
			mon:dateCl.getMonth()+1,// 月
			d:dateCl.getDate(),// 日
			h:dateCl.getHours(),// 时
			min:dateCl.getMinutes(),// 分
			s:dateCl.getSeconds(),// 秒
			mil:dateCl.getMilliseconds()// 毫秒
		};var dateSt={// 字符串
			y:String(dateOb.y),
			mon:(dateOb.mon>9? String(dateOb.mon):"0"+dateOb.mon),
			d:(dateOb.d>9? String(dateOb.d):"0"+dateOb.d),
			h:(dateOb.h>9? String(dateOb.h):"0"+dateOb.h),
			min:(dateOb.min>9? String(dateOb.min):"0"+dateOb.min),
			s:(dateOb.s>9? String(dateOb.s):"0"+dateOb.s),
			mil:(dateOb.mil>99? String(dateOb.mil):(dateOb.mil>9?"0"+dateOb.mil:"00"+dateOb.mil))
		};return dateSt.y+"/"+dateSt.mon+"/"+dateSt.d+"-"+dateSt.h+":"+dateSt.min+":"+dateSt.s+(isMil?"."+dateSt.mil:"");
	}, getRandom:function getRandom(type,min,max){// 获取随机数
		if(typeof type!=="string")throw new TypeError("参数1的类型必须为字符串");
		if(typeof min!=="number")throw new TypeError("参数2的类型必须为数字");
		if(typeof max!=="number")throw new TypeError("参数3的类型必须为数字");
		min=Math.ceil(min);
		max=Math.floor(max);
		if(type==="r")return Math.random()*(max-min)+min;
		if(type==="f")return Math.floor(Math.random()*(max-min))+min;
		if(type==="c")return Math.ceil(Math.random()*(max-min))+min;
		if(type==="i")return Math.floor(Math.random()*(max-min+1))+min;
	}, HTTPAErrSplit:[0x0D,0x0A,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0x0D,0x0A].join(),// 响应时出现异常的时候将会用此分割正常响应和异常信息
	HTTPAgent:function HTTPAgent(method,url,data={},type){// 代理
/* 
 * 本函数需要在服务器上存在相应的支持
 * 服务器: 127.0.0.1:12000(自建)
 * 语言: Python
 * 具体支持访问的模块: requests
 */
		if(typeof method!=="string")throw new TypeError("method需要字符串");
		if(typeof url!=="string")throw new TypeError("url需要字符串");
		if(data===null) data={};
		if(typeof data!=="object")throw new TypeError("data需要对象");
		new URL(url);// 检查URL
		var chunkSize=data.chunkSize??0;
		if(typeof chunkSize!=="number")throw new TypeError("分块大小需要整数"); chunkSize=Math.trunc(chunkSize);
		if(chunkSize<0)throw new RangeError("分块大小不能少于0");if(chunkSize>5242880)throw new RangeError("分块大小不能多于5242880");
		var headers=(typeof data.headers==="object"&& data.headers)||{};
		if(!headers["User-Agent"]) headers["User-Agent"]=navigator.userAgent;// 用户代理
		var uri=`${location.protocol}//${location.hostname}:12000/http?url=${encodeURIComponent(url)}`;// 获取服务器链接
		var m=data.body?"POST":"GET";
		function jsonParse(text,type){
			try{// 解析部分头部返回的文本
				var data=JSON.parse(text);
				if(type)Object.defineProperty(data,"toString",{value:function(){// 返回响应头的headerName: headerValue文本
					var ret="";for(var name in this){ ret+=name+": "+this[name]+"\n";};return ret;
				}});return data;
			}catch(e){cache.log.root.add(40,"HTTPAgent",e);return text;}
		};async function resCheckErr(res){// 响应检查，筛出错误信息
			const b=new Blob([res]);
			const bd=new Uint8Array(await b.arrayBuffer()),sp=docsScript.HTTPAErrSplit;
			let spd=bd.slice(-36).join(),ert;
			let rb={s:true,res:null,err:undefined};
			if(spd===sp){
				let idx=-36;
				while(true){
					idx=bd.lastIndexOf(10,idx)-1;
					if(idx<35)break;
					if(bd[idx]!==0x0D)continue;
					if(bd.slice(idx-34,idx+2).join()!==sp)continue;
					if(bd.length-idx-34>8192)break;
					ert=await b.slice(idx+2,-36).text();
					if(ert.length>2048)break;
					rb.s=false; rb.err=ert;
					rb.res=b.slice(0,idx-34);
					return rb;
				}
			}else rb.res=res;
			return rb;
		};class HTTPAgentResponse {// HTTP代理响应对象
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
				}; cache.log.requestLog.add(10,`docsScript.HTTPAgent(${options.API_type})`,`[${method}] ${options.url} - ${options.status} "${options.statusText}" - ${options.size}字节`);
				setThis("API_type",options.API_type);
				setThis("data",options.data);
				setThis("statusCode",Number(options.status));
				setThis("statusText",options.statusText);
				setThis("headers",jsonParse(options.headers,1));
				setThis("history",jsonParse(options.history,0));
				setThis("URL",options.url);
				setThis("size",Number(options.size));
				setThis("MIME",options.mime);
				Object.defineProperty(this,"status",{enumerable:true,get:function(){var ra=[this.statusCode,this.statusText];Object.defineProperty(ra,"toString",{value:function(){return this[0]+" "+this[1]}});return Object.freeze(ra);}});
				Object.freeze(t);
			};toString(){return`[${method}] "${this.URL}" ${this.status} ${this.size}`;}
		};async function checkRes(res){// 检查响应
			var err={error:"response",msg:"",res:null};
			var rce=await resCheckErr(res);
			if(rce.s)return res;
			err.msg=rce.err??"";
			err.res=rce.res;
			throw err;
		};if(type==="fetch"&& window.fetch){// 使用fetch获取数据
			let headers_obj=new Headers();
			headers_obj.set("request_headers",JSON.stringify(headers));
			headers_obj.set("request_method",method);
			headers_obj.set("response_chunk_size",String(chunkSize));
			return window.fetch(uri,{method:m,headers:headers_obj,body:data.body,timeout:data.timeout,signal:data.signal}).then(async function(res){// 成功(有数据)
				if(res.headers.get("Agent-Data")==="error"){
					let otb,aer,eo={error:""};
					try{otb=await res.text();aer=JSON.parse(otb);}catch(e){aer=null;}
					if(aer){eo.error="agent";eo.e=aer;}else{eo.error="agentBody";eo.t="错误信息获取失败";eo.r=otb;}
					throw eo;
				};let rd=null;
				if(data.type===undefined) rd=res;
				else if(data.type===""||data.type==="text") rd=await res.text();
				else if(data.type==="blob") rd=await checkRes(await res.blob());
				else if(data.type==="json") rd=await res.json();
				else if(data.type==="arraybuffer") rd=await checkRes(await res.arrayBuffer());
				else if(data.type==="body") rd=res.body;
				else rd=res.body;
				return new HTTPAgentResponse({API_type:"fetch",data:rd,
				status:Number(res.headers.get("response_status")),
				statusText:res.headers.get("response_reason"),
				headers:res.headers.get("response_headers"),
				history:res.headers.get("response_history"),
				url:res.headers.get("response_URL"),
				size:res.headers.get("Return-Data-Size"),
				mime:res.headers.get("Content-Type")});
			},function(err){// 失败
				let stack="";try{throw new Error()}catch(es){stack=es.stack}
				throw{
					error:"error", stack:stack, e:err,
					toJSON:function(){
						if(this.e instanceof Error){
							var ro={error:this.error,e:{}};
							ro.e.name=this.e.name; ro.e.message=this.e.message;this.e.stack&&(ro.e.stack=this.e.stack);
							for(const ni in this.e) ro.e[ni]=(function(e){try{return e[ni]}catch(er){return String(er)}})(this.e);
							hasOwnKey(this.e,"fileName")&&(ro.e.fileName=this.e.fileName);
							hasOwnKey(this.e,"lineNumber")&&(ro.e.lineNumber=this.e.lineNumber);
							hasOwnKey(this.e,"columnNumber")&&(ro.e.columnNumber=this.e.columnNumber);
							return ro;
						}else return this;
					}
				};
			});
		}else if(type==="xhr"||type===undefined){// 使用XHR(XMLHttpRequest)获取数据
			return new Promise(function(resolve,reject){
				var xhr=new XMLHttpRequest();
				if(data.xhrProgress) xhr.onprogress=data.xhrProgress;
				if(data.xhrUploadProgress) xhr.upload.onprogress=data.xhrUploadProgress;
				xhr.open(m,uri,true,data.username,data.password);
				if(typeof data.type==="string") xhr.responseType=data.type;
				xhr.setRequestHeader("request_headers",JSON.stringify(headers));
				xhr.setRequestHeader("request_method",method);
				xhr.setRequestHeader("response_chunk_size",String(chunkSize));
				xhr.timeout=data.timeout;
				if(window.AbortSignal&&data.signal instanceof AbortSignal) data.signal.addEventListener(function(){xhr.abort()},docsScript.compatible.addeventlistenerOptions?{once:true}:false);
				xhr.onload=function(){
					if(xhr.getResponseHeader("Agent-Data")==="error"){// 代理错误
						if(xhr.responseType===""|| xhr.responseType==="text"){
							reject({error:"agent",e:JSON.parse(xhr.responseText)});
						}else if(xhr.responseType==="json"){
							reject({error:"agent",e:xhr.response});
						}else if(xhr.responseType==="blob"){
							xhr.response.text().then(d=>{reject({error:"agent",e:JSON.parse(d)})});
						}else{
							reject({error:"agentBody",t:"错误信息获取失败",r:xhr.response});
						};return;
					};resolve(new HTTPAgentResponse({
						API_type:"XMLHttpRequest",data:xhr.response,
						status:Number(xhr.getResponseHeader("response_status")),
						statusText:xhr.getResponseHeader("response_reason"),
						headers:xhr.getResponseHeader("response_headers"),
						history:xhr.getResponseHeader("response_history"),
						url:xhr.getResponseHeader("response_URL"),
						size:xhr.getResponseHeader("Return-Data-Size"),
						mime:xhr.getResponseHeader("Content-Type")
					}));
				}; xhr.onerror=()=>{
					let s="";try{throw new Error()}catch(e){s=e.stack};
					reject({error:"error",stack:s});
				}; xhr.ontimeout=()=>{
					let s="";try{throw new Error()}catch(e){s=e.stack};
					reject({error:"timeout",stack:s});
				}; xhr.send(data.body);
			});
		}else throw new TypeError(`不受支持的请求类型 '${type}'`);
	}, warn:function warning(message,display){// 发出警告
		if(typeof message!=="string")throw new TypeError("参数'message'不是字符串");
		var msg=message;
		function log(m){
			console.warn(m);
			cache.log.all.add(30,"WARNINGS",m);
		};function window(m){
			var w=docWindow("WARNINGS","");
			w.zIndex=100;
			warnElement(m.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"),w.e);
		};switch(display){
			case"log":
				log(msg);
				break;
			case"console":
				console.warn(msg);
				break;
			case"window":
				log(msg);
				window(msg);
				break;
			default:
				log(msg);
				cache.log.err.add(30,"/js/script.js>docsScript.warn",`未知的显示方式: ${display}`);
				break;
		};return"WARNINGS";
	}, bodyDark:function setBodyDark(isdr){// 暗色模式
		const DSD="docs-style-dark";
		function dr(){document.body.classList.add(DSD)};
		function lg(){document.body.classList.remove(DSD)};
		if(!document.body){
			cache.log.root.add(30,"docsScript.bodyDark","未产生body元素，无法进行暗色切换。");
			return;
		};if(DEBUG[0]&&typeof isdr==="boolean"){
			if(isdr) dr();else lg();return;
		};if(config.storage.colorScheme==="dark") dr();
		else if(config.storage.colorScheme==="auto"&& docsScript.pageData.isDark) dr();
		else lg();
	}, readConfig:function readConfigInLocalStorage(){// 从local storage读取配置
		var s=window.localStorage.getItem("docs-config");
		if(!s)return false;
		try{
			config.storage=JSON.parse(s);
			if(typeof config.storage.auto_dark!=="boolean")config.storage.auto_dark=true;
			if(typeof config.storage.colorScheme!=="string")config.storage.colorScheme="auto";
		}catch(e){
			cache.log.err.addError(40,"docsScript.readConfig",e,s);
			return false;
		};return true;
	}, writeConfig:function writeConfigToLocalStorage(){//写入配置到local storage
		try{
			window.localStorage.setItem("docs-config",JSON.stringify(config.storage));
		}catch(e){
			cache.log.err.addError(40,"docsScript.writeConfig",e);
			if(e.name==="TypeError"&& e.message==="cyclic object value"&&DEBUG[0])(async()=>alert("不可以在配置中使用循环引用对象"))();
			return false;
		};return true;
	}, postMessage:function postMessageTo_PM_func(d,w=window){// 调用目标的postMessage传入一定格式的数据，目标建议是窗口
		w.postMessage({get[Symbol.toStringTag](){return"Message<script.js>"},WPJDS:"DS.js",message:d},"*");
	}
}
// 执行
cache.log["root"]=new Log("rootLog","主要给script.js使用");
cache.log["requestLog"]=new Log("请求日志","主要记录docsScript.XHR的请求日志");
cache.log["all"]=new Log("All-Log","提供给所有程序的日志");
cache.log["err"]=new Log("ErrorLog","错误日志");
cache.log["debug"]=new Log("调试日志","不一定全写调试");
cache.log["debug"].logType=Temp.logType.zh;// 使用中文日志类型
cache.log["all"].logType=cache.log["err"].logType=Temp.logType.d;// 使用短日志类型
cache.log.all.add(0,"script.js:Log","全部日志已创建。");
cache.log.all.add(20,"All-Log","任何脚本均可在本日志内增加日志。");
cache.log.all.add(30,"All-Log","请谨慎命名来源(source属性)，以防调试人员找不到问题所在。");
cache.log.all.add(20,"All-Log","来源(source属性)建议命名规则:[文件路径(以'/'分割，精度自定)]>[函数名(以'.'分割)][>(async).函数名(若异步)][(函数名)|若为一次性函数]");
cache.log.all.add(10,"All-Log","------------分割线------------");
cache.log.all.addError=cache.log.err.addError=function(t,sou,mes,data=undefined){// 对Error对象的特殊处理(由debug.js提供，本函数仅有基础处理方案)
	if(!(this instanceof Log))throw new TypeError("not Log object.");
	if(Array.isArray(mes)){
		if(mes[mes.length-1]instanceof Error){// 最后一个是Error对象时将其处理成字符串
			var err=mes[mes.length-1];
			mes[mes.length-1]=`\n\n${err.name}: ${err.message}\n${(err.stack?err.stack:"\0")}`;
			this.add(t,sou,mes,data);
		}else{
			this.add(t,sou,mes,data);
		}
	}else{// 将Error对象处理成String
		if(!(mes instanceof Error))throw new TypeError("message not Error object.");
		this.add(t,sou,`${mes.name}: ${mes.message}\n${(mes.stack?mes.stack:"\0")}`,data);
	}
}
pageInit();// 开始初始化页面
Temp["loadDebugTool"]=(function hasLoadDebugTool(){// 判断是否加载调试工具
	if(cache["loadDebugToolCache"])return;
	var rlog=cache.log.root;
	function appendDebugTool(){// 附加调试工具
		rlog.add(0,"(hasDebugTool).debugTool","调试工具'debug.js'将加载,由本JS文件的作者编写.");
		var dte=document.createElement("script");// 创建script元素
		dte.id="debugTool_JavaScriptFile";// 设置ID
		dte.src="/js/debug.js";// 设置路径
		dte.onload=function debugTool_JavaScriptFileLoadOK(){// 加载完成执行
			if(!Array.isArray(window.DATA_page?.debugToolInit))return;
			debugTool.initFun.push(...DATA_page.debugToolInit);
			debugTool.init();
		};dte.onerror=function debugTool_JavaScriptFileLoadError(){// 设置错误处理
			rlog.add(30,"(hasDebugTool).debugTool","调试工具'debug.js'加载失败.");
		};document.head.append(dte);// 附加
	};var isADT=function isAppendDebugTool(){// 是否附加调试工具
		if(hasOwnKey(cache.websiteData??{},"debugTool")) appendDebugTool();
		else if(typeof DATA_page==="object"){
			if(hasOwnKey(DATA_page,"debugTool")) appendDebugTool();
		}
	};if(DEBUG[0]) appendDebugTool();
	else{
		if(typeof DATA_page==="object") isADT();
		else window.addEventListener("load",isADT);
	};if(DEBUG[0]){
		var erudaDT=document.createElement("script");// 创建script元素
		rlog.add(0,"(hasDebugTool).debugTool","调试工具确认添加，来自:eruda");
		erudaDT.id="eruda";
		erudaDT.src="https://unpkg.com/eruda/eruda.js";// 设置路径
		erudaDT.defer=true;
		erudaDT.onload=()=>{eruda.init()};// 必须，启动调试工具。
		erudaDT.onerror=()=>{rlog.add(30,"(hasDebugTool).debugTool","调试工具加载失败。(工具名:eruda)");}// 加载失败时输出信息到日志
		document.head.appendChild(erudaDT);// 附加
	}
});
window.addEventListener("message",ev=>{
	const d=ev.data;
	if(!d||typeof d!=="object")return;
	const t=d.WPJDS;
	if(typeof t!=="string")return;
	let f=Temp.WPJDSH[t];
	if(typeof f!=="function")return;
	try{
		const md={get[Symbol.ToStringTag](){return"WPJDSHD"}};
		md["o"]=md["origin"]=ev.origin;
		md["s"]=md["source"]=ev.source;
		f(d,t,Object.freeze(md));
	}catch(e){cache.log.err.addError(40,"WPJDSH",e,e)}
});
setTimeout(function(){// 快速
	if(typeof DEBUG[0]!=="boolean")DEBUG[0]=true;
	if(typeof DATA_page==="object"&&typeof DATA_page.setDEBUG==="boolean")DEBUG[0]=Boolean(DATA_page.setDEBUG);
	Temp["loadDebugTool"]();
	if(DEBUG[0]) cache["loadDebugToolCache"]=Temp["loadDebugTool"];
	if(config.storage.auto_dark) docsScript.bodyDark();
},50);// 快速队列
setTimeout(async function(){// 用于调试
	if(DEBUG[0]){
		cache.log.root.add(0,"DEBUG","已开始执行全局变量'DEBUG'所定义的调试。");
		for(const item of DEBUG){
			if(typeof item==="boolean")continue;
			else if(typeof item==="function")try{item();}catch(e){cache.log.root.add(40,"DEBUG",e);console.error(item,e);}
			else if(typeof item==="string")console.log(item);
		}; cache.log.root.add(0,"DEBUG","执行全局变量'DEBUG'所定义的调试已结束。");
	}
},200);// 调试队列
(function(){// 错误监听
	function errorToList(err){
		if(!(err instanceof Error))return"不是错误对象，无法解析。";
		const ed=[`${err.name}: ${err.message}`],mzi=[err.fileName,err.lineNumber,err.columnNumber];let mzt="";
		if(mzi[0]){// 当存在这3个非标准参数，对它们进行处理。这参数似乎是仅有的在没有控制台下的语法错误分析手段。
			mzt=`\n->@${mzi[0]}`;
			if(typeof mzi[1]==="number") mzt+=`:${mzi[1]}`;else mzt+=":0";
			if(typeof mzi[2]==="number") mzt+=`:${mzi[2]}`;else mzt+=":0";
		}; ed.push(mzt,"\n\n",err.stack);
		return ed;
	};function errorToString(err){
		const el=errorToList(err);
		if(Array.isArray(el))return el.join("");
		return el;
	};const errlog=cache.log.err,etp="错误监听";
	window.addEventListener("error",ev=>{try{
		let msg,data={event:ev};
		if(ev instanceof ErrorEvent){
			data.error=ev.error;data.message=ev.message;
			if(!ev.error) msg=["无错误对象",ev.message];
			else msg=errorToList(ev.error);
		}else msg="资源加载失败";
		errlog.add(40,"error Event",msg,data);
		if(DEBUG[0])console.error("全局错误事件",msg,ev,this,globalThis);
	}catch(e){errlog.addError(50,etp,e,e)}});
	window.addEventListener("unhandledrejection",ev=>{try{
		let msg,d=ev.reason;
		if(d instanceof Error) msg=errorToString(d);
		else msg=d;
		errlog.add(40,"unhandled rejection",[msg],{event:ev,reason:ev.reason});
		if(DEBUG[0])console.error("未被处理的Promise reject信息",ev,d,this,globalThis);
	}catch(e){errlog.addError(50,etp,e,e)}});
})();
if(window.localStorage.getItem("docs-config")) cache.log.root.add(0,"config",["是否成功从本地存储读取配置: ",docsScript.readConfig()]);
"script.js";