// 调试工具debug.js(并不强大)
/* 
 *    DEBUG.JS DEBUGTOOL
 * 本工具将提供部分帮助，调试功能。
 * 需要加载script.js才可工作。
 * 建议使用script.js提供的debugTools函数来访问本文件的工具。
 * 版本: 1
 * 前置: script.js
 */

function dfun(f,t,a){
	const i={fun:f,this:t,arguments:a};
	if(typeof f!=="function"){
		let et="debug.js的函数dfun只支持输入function";
		console.error(et);
		cache.log.debug.add(40,"debugfunction",et,i);
		throw new TypeError(et);
	};return(function(){try{return f.apply(t,a)}catch(e){
		console.error(e);
		console.debug(`${e.name}: ${e.message}\n${e.stack}`);
		cache.log.err.addError(40,"debug.js>dfun(函数执行)",e,i);
		throw e;
	}});
}
var debugTool={
	info:Object.freeze({// 工具信息
		version:"1.0",// 版本号
		betaVersion:"#",// 测试版本号
		beta:true,// 是否为测试版本
		build:"0",// 内部版本号
		fullVersion:"0#",// 完整版本号
		message:"debug",// 消息
		checkCode:"0x0"// 校验码
	}),
	errorName:{
		"Error":"错误",
		"SyntaxError":"语法错误",
		"ReferenceError":"引用错误",
		"TypeError":"类型错误",
		"RangeError":"范围错误",
		"URIError":"URI错误",
	}, addHelp:function(obj,name,help){// 添加帮助文本
		var funcName="toLocaleString";// 被用作返回帮助文本的函数(或者说属性)名称
		var retObj=obj;
		retObj[name][funcName]=help;
		return retObj;
	}, init:function(){
		Temp.debugToolElement=document.getElementById("debug_tool");
		if(Temp.debugToolElement){
			Temp.debugToolElement.getElementsByClassName("debug_tool_view")[0].style.display="block";
			delete Temp.debugToolElement;
			throw new RangeError("debugTool窗口已存在");
		};delete Temp.debugToolElement;
		cache.log.debugTool.add(10,"调试窗口","初始化开始");
		if(!document.body) cache.log.debugTool.add(30,"检查","似乎没有body元素");
		function dce(tagName){return document.createElement(tagName);}
		var els={
			r:dce("div"),// 容纳
			o:dce("button"),// 显示或隐藏按钮
			w:dce("div"),// 窗口
			d:dce("div"),// 窗口内容
			c:dce("button"),// 关闭(应为隐藏)按钮
			h:dce("h3"),// 窗口标题
			get hr(){return document.createElement("hr")},
			log:{// 日志
				d:dce("details"),// 框架
				s:dce("summary"),// 提示
				i:dce("div")// 条目
			},cookie:{
				d:dce("details"),
				s:dce("summary"),
				i:dce("div"),
				c:dce("button")
			},los:{// localStorage
				d:dce("details"),
				s:dce("summary"),
				i:dce("div"),
				c:dce("button")
			},ses:{// sessionStorage
				d:dce("details"),
				s:dce("summary"),
				i:dce("div"),
				c:dce("button")
			}, info:{// 页面信息
				d:dce("details"),
				s:dce("summary"),
				i:dce("div"),
				r:dce("button")
			}
		}; els.r.id="debug_tool";
		els.r.setAttribute("data-info","debugTool");
		els.o.textContent="D";
		els.o.onclick=function(){
			els.w.style.display=(els.w.style.display==="block"?"none":"block");
		}; els.ost=function(){return els.o.style;};
		if((config.auto_dark && window.matchMedia("(prefers-color-scheme:dark)").matches)|| config.colorScheme==="dark"){
			els.w.style.backgroundColor="black";
			els.w.style.color="white";
		};if(typeof window?.DATA_page?.debugToolPosition==="string"){switch(DATA_page.debugToolPosition){// 调整显示调试工具窗口按钮位置
			default:
				cache.log.debugTool.add(30,"debugTool.init:开关按钮位置","未知的位置缩写");
			case "":
			case "br":
				els.ost().bottom=els.ost().right="1em";
				break;
			case "tl":
				els.ost().top=els.ost().left="1em";
				break;
			case "tr":
				els.ost().top=els.ost().right="1em";
				break;
			case "bl":
				els.ost().bottom=els.ost().left="1em";
				break;
		}}else{
			els.ost().bottom="1em";
			els.ost().right="1em";
		}// 关闭(实为隐藏)按钮
		els.c.textContent="×";
		els.c.onclick=function(){
			els.w.style.display="none";
		}; els.h.textContent="调试工具窗口";// 标题
		els.w.className="debug_tool_view";
		els.w.style.display="none";
		els.d.setAttribute("data-info","content");
		els.r.append(els.o,els.w);
		els.w.append(els.c,els.h,els.hr,els.d);// show log[Top]
		els.log.d.className="show_log";
		els.log.d.append(els.log.s,els.log.i);
		els.log.d.setAttribute("data-info",els.log.s.textContent="查看日志");
		els.log.s.onclick=async function(){// 读取日志列表
			var div=els.log.i;
			while(div.firstChild) div.firstChild.remove();
			for(const name in cache.log){
				if(!(cache.log[name]instanceof Log))continue;// 不会显示不是日志的条目
				let bul=document.createElement("button");
				bul.textContent=name; bul.type="button";
				bul.setAttribute("data-log_name",name);
				bul.onclick=(function(name){return function(){// 查看日志
					debugTool.tools.showLog(name,5);
				}})(name);
				div.append(" ",bul," ");
			}
		}; els.log.i.textContent="正在加载中…";// show log[END];Cookie[Top]
		els.cookie.d.append(els.cookie.s,els.cookie.i,els.cookie.c);
		els.cookie.d.setAttribute("data-info",els.cookie.s.textContent="Cookie");
		els.cookie.s.onclick=async function(){// 读取Cookie
			while(els.cookie.i.firstChild) els.cookie.i.firstChild.remove();
			var list=document.cookie.split(";");
			if(list[0])for(const i of list){
				let el=dce("p");
				el.textContent=i;
				el.onclick=(function(i,s){return function(){// 删除单个Cookie
					var w=docWindow("Cookie","");
					var t=dce("p"),x=dce("button"),y=dce("button");
					t.textContent=`确定要删除名为"${i.split("=")[0]}"的Cookie吗？`;
					x.textContent="取消"; y.textContent="确定";
					x.onclick=()=>w.close(); y.onclick=()=>{document.cookie=i+";max-age=0";s();w.close();}
					w.e.append(t,x," ",y);
					w.zIndex=3;
				}})(i,els.cookie.s.onclick); els.cookie.i.append(el);
			};if(!els.cookie.i.firstChild) els.cookie.i.textContent="啥都木有";
		}; els.cookie.c.textContent="清除所有";
		els.cookie.c.onclick=async function(){// 删除所有的Cookie
			var list=document.cookie.split(";");
			for(const i of list)document.cookie=i+";max-age=0";
			els.cookie.s.onclick();
		}// Cookie[END];localStorage[Top]
		els.los.d.append(els.los.s,els.los.i,els.los.c);
		els.los.d.setAttribute("data-info",els.los.s.textContent="localStorage");
		els.los.s.onclick=async function(){
			while(els.los.i.firstChild) els.los.i.firstChild.remove();
			for(const i of Object.entries(localStorage)){
				let el=dce("p");
				el.textContent=`"${i[0].replace(/"/g,'\\"')}"${getType(i[1],1)}`;
				el.onclick=(function(k){return function(){
					var w=docWindow("localStorage","");
					var t=dce("p"),x=dce("button"),y=dce("button");
					t.textContent=`确定要删除名为"${k.replace(/"/g,'\\"')}"的持久存储吗？`;
					x.textContent="取消"; y.textContent="确定";
					x.onclick=()=>w.close(); y.onclick=()=>{localStorage.removeItem(k);els.los.s.onclick();w.close()}
					w.zIndex=3;
					w.e.append(t,x," ",y);
				}})(i[0]);
				els.los.i.append(el);
			};if(!els.los.i.firstChild) els.los.i.textContent="啥都木有";
		}; els.los.c.textContent="清除全部";
		els.los.c.onclick=async function(){
			localStorage.clear();
			els.los.s.onclick();
		}// localStorage[END];sessionStorage[Top]
		els.ses.d.append(els.ses.s,els.ses.i,els.ses.c);
		els.ses.d.setAttribute("data-info",els.ses.s.textContent="sessionStorage");
		els.ses.s.onclick=async function(){
			while(els.ses.i.firstChild) els.ses.i.firstChild.remove();
			for(const i of Object.entries(sessionStorage)){
				let el=dce("p");
				el.textContent=`"${i[0].replace(/"/g,'\\"')}"${getType(i[1],1)}`;
				el.onclick=(function(k){return function(){
					var w=docWindow("localStorage","");
					var t=dce("p"),x=dce("button"),y=dce("button");
					t.textContent=`确定要删除名为"${k.replace(/"/g,'\\"')}"的会话存储吗？`;
					x.textContent="取消"; y.textContent="确定";
					x.onclick=()=>w.close(); y.onclick=()=>{sessionStorage.removeItem(k);els.ses.s.onclick();w.close()}
					w.zIndex=3;
					w.e.append(t,x," ",y);
				}})(i[0]);
				els.ses.i.append(el);
			};if(!els.ses.i.firstChild) els.ses.i.textContent="啥都木有";
		}; els.ses.c.textContent="清除全部";
		els.ses.c.onclick=async function(){
			sessionStorage.clear();
			els.ses.s.onclick();
		}// sessionStorage[END]; 页面信息[Top]
		els.info.d.append(els.info.s,els.info.i,els.info.r);
		els.info.d.setAttribute("data-info",els.info.s.textContent="页面信息"); els.info.r.textContent="刷新";
		els.info.r.onclick=function(){
			function stg(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
			var dt=Date.now();
			els.info.i.innerHTML=`<p>位置: ${location.href}</p><p>标题: ${stg(document.title)}</p><p>用户代理: ${navigator.userAgent}</p>${(navigator.oscpu?"<p>操作系统类型: "+navigator.oscpu+"</p>":"")}${(hasOwnKey(navigator,"onLine")?"<p>是否联网: "+navigator.onLine+"</p>":"")}${(hasOwnKey(navigator,"language")?"<p>语言: "+navigator.language+"</p>":"")}<p>字符编码: ${document.characterSet}</p><p>内容区域宽高度: ${window.innerWidth}(w) × ${window.innerHeight}(h)</p><p>子窗口数量: ${window.length}</p><p>超链接数: ${document.links.length}</p><p>图片数: ${document.images.length}</p><p>脚本数: ${document.scripts.length}</p><p>样式表数: ${document.styleSheets.length}</p><p>来源: ${document.referrer}</p><p>当前时间/时间戳: <time>${docsScript.dateToStr(dt)}</time> <code>${dt}</code></p>`;
		}; els.info.s.onclick=()=>els.info.r.click();
		els.d.append(els.log.d,els.hr,els.cookie.d,els.hr,els.los.d,els.hr,els.ses.d,els.hr,els.info.d,els.hr);
		document.body.append(els.r);
		if(Array.isArray(this?.initFun))try{
			cache.log.debugTool.add(10,"窗口扩展:加载",["开始加载已注册在initFun中的扩展。数量: ",this.initFun.length]);
			Temp.debugTool.initFunLength=0;
			class DebugToolWindow {
				get [Symbol.toStringTag](){return "DebugToolWindow"}
				get DT(){return"DTW"}// 可用于检查this是否正确
				constructor(thisFun){
					this.e=this.element=els.d;
					this.function=thisFun;
					this.index=Temp.debugTool.initFunLength;
				};run(name,...args){return debugTool.run(name,args);}
				append(...args){// 附加节点到this.element(窗口内容)
					if(typeof this.element.append==="function")this.element.append(...args);
					else for(const item of args)this.element.appendChild(item);
				};dce(tagName){/* 生成元素(用于长代码压缩) */return document.createElement(tagName)}
				get br(){return document.createElement("br")}
				get hr(){return document.createElement("hr")}
				listItem(su){// 生成并附加项目，请操作返回值来控制该项目
					var d=this.dce("details"),s=this.dce("summary"),i=this.dce("div");
					d.setAttribute("data-info",su);
					d.append(s,i); s.textContent=su;
					this.element.append(d,this.hr);
					return Object.freeze({n:su,d:d,s:s,i:i});
				};cbtn(text){// 创建一个按钮
					var e=this.dce("button");
					e.type="button";
					e.textContent=text;
					return e;
				}
			};for(const wFun of this.initFun){
				if(typeof wFun!=="function")continue;
				Temp.debugTool.initFunLength++;
				wFun.call(new DebugToolWindow(wFun));
			}; cache.log.debugTool.add(10,"窗口扩展:加载",["加载完成。实际数量: ",Temp.debugTool.initFunLength]);
		}catch(err){// 扩展出错时静默处理
			cache.log.debugTool.add(40,"窗口扩展",[err.name,": ",err.message,"\n\n",err.stack]);
		}; cache.log.debugTool.add(10,"调试窗口","初始化结束");
		els.info.r.type=els.ses.c.type=els.los.c.type=els.cookie.c.type=els.o.type=els.c.type="button";
		return{
			get show(){return els.w.style.display==="block";},
			set show(v){els.w.style.display=(v?"block":"none");}
		}
	}, initFun:[],// 扩展debugTool窗口
	run:function(name,args){// 查找指定函数名称并执行它
		if(typeof this.tools!=="object")return new ReferenceError("not tool.");// 没有任何工具
		if(typeof this.tools[name]==="function"){
			this.runInfo={
				arguments:{
					arguments:arguments,
					name:name,
					args:args
				}, args:args,
				function:this.tools[name], END:false,
				phase:0,
			};try{
				this.runInfo.phase=1;
				return this.tools[name].apply(this.tools,args);
			}catch(e){
				if(e.name in debugTool.errorName) e.name=debugTool.errorName[e.name];
				cache.log["debugTool"].add(40,`工具:'${name}'`,[e.name,": ",e.message,"\n",e.stack]);
				this.runInfo.phase=4;
				this.runInfo.error=e;
				return e.name+": "+e.message;
			}finally{
				this.runInfo.phanse=3;
				this.runInfo["END"]=true;
				this.runInfo=null;
			}
		}else if(!hasOwnKey(this.tools,name))return new ReferenceError(`tool '${name}' is undefined.`);// 工具未定义
		else return new ReferenceError(`tool '${name}' type not function, typeof ${name} ='${typeof this.tools[name]}'.`);// 存在名为$name的工具条目，但它不是函数
	}, runInfo:undefined,
	tools:{// 可跑
		this:function(type){// 返回变量
			if(type==="root")return debugTool;// 返回根
			else if(type==="[help]")return "返回debugTool变量。";
			else if(type=="name")return "debugTool";// 根变量名称
			else if(type=="")return debugTool;// 同root
			else if(type==true)return debugTool;// 同root
			else return debugTool;// 与type=="root"返回的结果相同
		}, debugTool:function(){// 返回调试工具的信息
			return `\tDEBUG.JS DEBUGTOOL
需要加载script.js才可工作。\n版本: ${this.this().info.version}
测试版本号: ${this.this().info.beta?this.this().info.betaVersion:"此版本是正式版"}
内部版本号: ${this.this().info.build}\n完整版本号: ${this.this().info.fullVersion}
消息: ${this.this().info.message}`;
		}, about:function(type){// 返回关于
			if(type===undefined)return this.debugTool();
			else if(type==="docs")return `debug.js的文档: ${location.origin}/docs/website/debug.html`;
			else if(type==="changelog")return`debug.js的更新日志: ${location.origin}/docs/changelog.html?href=debug.js`;
		}, help:function(type,name){// 返回帮助
			if(type===undefined||type===null||type===""||type==="tools"){// 返回tools的帮助(基本功能)
				if(typeof this.this().tools[name]?.help==="function")return this[name].help();
				else{
					if(typeof this[name]!=="function")return `[help]: '${name}'似乎不是函数呢。`;
					var helpText=this[name]("[help]");
					if(typeof helpText==="string")return helpText;
					else return "[help]: 没有帮助。";
				}
			}else if(type==="help"||type==="[help]"||type==="-h"||type==="--help"||type==="-?"
			||type==="-H"||type==="/?"||type==="/h"||type==="/H"||type==="/help"){// 返回帮助
				return`帮助:help
可用的类型选项:
	run - 返回run内函数的帮助
	help,-h,--help,-?,/?,/h,/help - 返回本帮助信息`;
			}
		}, stack:function(type){// 获取堆栈
			function getErrorStack(){// 使用Error来获取堆栈(警告:Error.prototype.stack是非标准)
				try{throw new Error();}
				catch(e){return e.stack;}
			};function delEA(s){// 删除多余的部分
				if(s===undefined)return undefined;
				var d=s.split("\n");
				d.shift();d.shift();
				return d.join("\n");
			};if(type===undefined)return delEA(getErrorStack());
			else if(type==="all")return getErrorStack();
		}, showLog:function(arg1,zIndex=0){// 显示日志
			if(arg1==="[help]")return`显示日志\n若执行成功，会有一个窗口来显示日志
\n语法:
	showLog <name:string>
	showLog <log:Log>

参数'name': 日志名称，在cache.log内能找到
参数'log': 日志实例

返回: 一个已冻结对象，可以用它来关闭窗口`;
			var w=docWindow("show Log","");
			if(typeof arg1==="string"){
				if(!hasOwnKey(cache.log,arg1)){
					w.title+=" - show Error";
					w.e.textContent=`'${arg1}' is not defined.`;
					throw new ReferenceError(`'${arg1}'不存在于cache.log`);
				};var log=cache.log[arg1];
			}else{
				var log=arg1;
			};if(!log||!Array.isArray(log.log)){
				w.title+=" - not Log";
				w.e.textContent=`'${arg1}' is not log.`;
				throw new TypeError(`'${arg1}'不是日志`);
			}
			w.top="1%";
			w.left="2%";
			w.width="96%";
			w.height="98%";
			if(!isNaN(zIndex)) w.zIndex=String(Number(zIndex));
			var el={
				i:document.createElement("p"),// 信息
				l:document.createElement("div")// 内容
			};function setLog(l){// 单条日志显示
				if(typeof l!=="object"){
					let r=document.createElement("p");
					r.className="log-item-err";
					r.textContent="错误的日志数据！";
					return r;
				}
				var le={
					r:document.createElement("p"),// 容纳
					t:document.createElement("span"),// 时间
					y:document.createElement("span"),// 类型
					s:document.createElement("span"),// 所属
					m:document.createElement("span")// 信息
				}
				le.t.className="time";
				le.y.className="type";
				le.s.className="source";
				le.m.className="message";
				le.t.textContent=`[${docsScript.dateToStr(l.time)}]`;
				le.y.textContent=`[${l.typeName}]`;
				le.s.textContent=`"${l.source}"`;
				le.m.textContent=String(l.message);
				le.r.append(le.t,le.y," ",le.s,": ",le.m);
				return le.r;
			};function add(ev){// 用于处理日志的条目增加事件
				el.l.append(setLog(ev.data));
				collat();
			};function collat(){// 限制显示
				if(el.l.childNodes.length>log.maxLog) el.l.firstChild.remove();
			};
			el.i.className="show_log_info";
			el.l.className="show_log_content";
			el.i.textContent=`日志名称:"${log.name}",\n输出时间:${docsScript.dateToStr()},\n简介:\`${log.desc}\``;
			for(const i of log.log){el.l.append(setLog(i));}
			w.e.append(el.i,document.createElement("hr"),el.l);
			log.on("add",add);
			w.onclose=function(){log.dison("add",add)};
			return Object.freeze({close:()=>w.close(),get connect(){return w.connect}});
		}, agentData:function(url,options={}){// 检查响应
			if(typeof options!=="object")throw new TypeError("options必须是对象");
			var data=options;
			if(typeof data.m==="string"){
				data.method=data.m;
				delete data.m;
			}else data.method=(options.body?"POST":"GET");
			if(url===undefined){
				url=Temp.debugTool?.agentData?.url;
				if(!url)throw new URIError("没有URL");
				data=Temp.debugTool?.agentData?.data??{};
				options=Temp.debugTool?.agentData?.options
			}
			docsScript.HTTPAgent(data.method,url,options).then(function(d){
				if(data.writeLog) cache.log.all.add(0,"debug>debugTool.tools.agentData",['"',data.method," ",d.URL,'" - ',d.status.toString()," - ",d.size,"\n",d.headers.toString()],d);
				console.debug(d);
			},function(d){
				if(d.error==="agent"){
					if(!data.show){
						console.log(docsScript.dateToStr());
						console.info(d.e.name);
						console.error(d.e.message);
						console.log("[END]");
					}else console.error(d.e);
				}else console.error(d);
			});
			Temp.debugTool["agentData"]=Object.freeze({url:url,method:data.method,data:data,options:options});
		}, debugJS:function(src){// 检查语法
			if(src==="[help]")return`用eval加载js文件，主要用于寻找语法错误。`;
			var url=src;
			if(!url)url=Temp.debugTool["debugJS"];
			var xhr=new XMLHttpRequest();
			xhr.open("GET",url);
			xhr.onload=function(){
				if(xhr.status!==200)return p("未获取到文件","debugTools>debugJS");
				try{
					p(eval(xhr.responseText),"eval");
				}catch(e){
					var n=e.name;
					if(n in debugTool.errorName) n=debugTool.errorName[n];
					p(n+": "+e.message+"\n"+e.stack,"eval");
				}
			};xhr.onerror=function(){
				cache.log.err.add(50,"debug>debugTool.tools.debugJS","获取文件失败");
				console.error("debugTools>debugJS: 获取失败");
			};xhr.send();
			Temp.debugTool["debugJS"]=url;
		}, performance:function(t){
			const pf=performance.getEntries();
			if(t==="[help]")return`获取性能信息`;
			else if(t==="console")console.log(pf);
			else if(t==="onetab"){
				const o=pf[0];const i=[
					{name:"导航类型",value:o.type},
					{name:"协议",value:o.nextHopProtocol},
					{name:"worker",value:o.workerStart},
					{name:"重定向开始",value:o.redirectStart},
					{name:"重定向结束",value:o.redirectEnd},
					{name:"资源获取",value:o.fetchStart},
					{name:"域名查找开始",value:o.domainLookupStart},
					{name:"域名查找结束",value:o.domainLookupEnd},
					{name:"连接建立开始",value:o.connectStart},
					{name:"连接建立结束",value:o.connectEnd},
					{name:"进行TLS握手",value:o.secureConnectionStart},
					{name:"发送请求",value:o.requestStart},
					{name:"获得响应开始",value:o.responseStart},
					{name:"获得响应结束",value:o.responseEnd},
					{name:"资源大小",value:o.transferSize},
					{name:"有效载荷大小",value:o.encodedBodySize},
					{name:"消息正文大小",value:o.decodedBodySize},
					{name:"服务器时序度量",value:o.serverTiming},
					{name:"DOMContentLoaded事件处理开始",value:o.domContentLoadedEventStart},
					{name:"DOMContentLoaded事件处理结束",value:o.domContentLoadedEventEnd},
					{name:"load事件处理开始",value:o.loadEventStart},
					{name:"load事件处理结束",value:o.loadEventEnd},
				];console.table(i);
			}else if(t==="json")return JSON.stringify(pf);
		},
	}
};debugTool.addHelp["toLocaleString"]=function help(){return"为数据添加帮助文本。\n\n"+this.toString();};
debugTool.tools.debugTool["help"]=function(){return"返回调试工具信息。";};

Temp.debugTool={};
(function(){
	var style=document.createElement("link");
	style.rel="stylesheet";
	style.href="/css/debug.css";
	document.head.appendChild(style);
})();
cache.log["debugTool"]=new Log("debug tool log","调试工具日志");
try{
	cache.log["debugTool"].add(10,"添加帮助:开始","开始对一些函数添加帮助。");
	debugTool.addHelp(window,"p",function printData_Help(){return"将数据打印到控制台、写入日志，返回传入的数据。\n参数1为要打印的数据,参数2为源(主要用于日志)\n\n"+this.toString();});
	debugTool.addHelp(window,"pageInit",function pageInitHelp(){return"初始化页面，主要为添加元数据、添加根样式、添加图标。\n\n"+this.toString();});
	debugTool.addHelp(window,"errorElement",function help(){return"在指定节点输出错误。若未指定，则为body节点。";});
	debugTool.addHelp(window,"warnElement",function help(){return"在指定节点输出警告。若未指定，则为body节点。"});
	debugTool.addHelp(window,"debugTools",function debugToolsHelp(){return"执行debugTool.run内的函数。本函数存在是为了未加载debug.js时不抛出错误。"});
	debugTool.addHelp(window,"hasOwnKey",function hasOwnKeyHelp(){return"使用Object原型内的hasOwnProperty或Object.hasOwn来检测。存在原因已写在注释内。\n"+this.toString();});
	debugTool.addHelp(window,"getType",function getTypeHelp(){return"获取类型(或者说获取类名称)\n原理: 通过调用Object.prototype.toString()来获取类名。\n该函数的返回值: 可能为[object Object]。Object即为类名。(也可以向第2个参数传入被判定为真值的值来获取实际返回值)\n\n源代码:\n"+this.toString();});
	cache.log["debugTool"].add(10,"添加帮助:结束","已完成添加帮助。");
}catch(e){ cache.log["debugTool"].add(40,"添加帮助:错误",[e.name,": ",e.message]);}
cache.log.all.addError=cache.log.err.addError=function(t,sou,mes,data=undefined){
	if(!(this instanceof Log))throw new TypeError("not Log object.");
	if(Array.isArray(mes)){
		this.add(t,sou,mes,data);
	}else{
		if(!(mes instanceof Error))throw new TypeError("message not Error object.");
		var er={
			name:"",
			message:"",
			file:"",
			stack:""
		}
		er.name=mes.name;
		er.message=mes.message;
		er.file=(mes.fileName?mes.fileName+(isNaN(mes.lineNumber)?"":" : "+mes.lineNumber):"")
		er.stack=(mes.stack?mes.stack:"\0");
		if(er.name in debugTool.errorName) er.name=debugTool.errorName[er.name];
		this.add(t,sou,`${er.name}: ${er.message}\n${(er.file?"[file]: "+er.file+"\n":"")}${er.stack}`,data);
	}
}
