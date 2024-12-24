// 运行监测
/* 
 * 监听全局错误信息，提供函数捕捉处理错误
 * 展示错误提示页面
 */

const docsMonitor=(function docsMonitor(){
	const esBase="/js/monitor.js>docsMonitor.";
	const glerr=cache.log.err;
	let isListenerErEv=false;
	function dce(t){return document.createElement(t)};
	function tryFunction(f,a=[]){// 进行捕捉，建议用在最外层。
		// 使用此函数视为出现严重错误。
		if(typeof f!=="function")throw new TypeError("参数1不是要被运行和捕捉错误的函数");
		if(!Array.isArray(a))throw new TypeError("参数2不是数组");
		try{
			return f(...a);
		}catch(e){
			glerr.addError(50,esBase+"try:f",e,{e,a,f});
			errorToWindow(e);
		}
	}
	function catchPromise(pm){// 处理Promise.reject，建议在末尾使用。不做类型检查。
		// 使用此函数视为出现严重错误。
		return pm.catch(errorToWindow);
	}
	function errorToWindow(er){// 错误对象弹出
		let msg=String(er);
		(()=>{
			const f=er.fileName;
			if(!f)return;
			msg+="\n"+f;
			const l=er.lineNumber;
			if(!l)return;
			msg+=":"+l;
			const c=er.columnNumber;
			if(!c)return;
			msg+=":"+c;
		})();
		faultWindowTry(msg,er.stack);
	}
	function faultWindowTry(...a){// 处理弹出时出现的错误
		try{
			return faultWindow(...a);
		}catch(e){
			glerr.addError(50,esBase+"faultWindowTry",e,a);
			docWindow("处理故障信息失败",String(e)+e.stack);
		}
	}
	function faultWindow(msg,tkl){// 弹出故障提示窗口
		console.error(msg);
		const ww=docWindow("故障","");
		if(window.matchMedia("(max-width: 600px)").matches){
			ww.left=ww.top="0px";
			ww.width=ww.height="100%";
		}else{
			ww.left=ww.top="10%";
			ww.width=ww.height="80%";
		}
		let style=dce("style");
		let mon=dce("div"),
			tmg=dce("p"),
			stk=dce("pre"),
			skl=dce("code"),
			hsv=dce("hr"),
			vat=dce("p"),
			vad=dce("div");
		let ml=String(msg).split("\n");
		let mgt=ml.shift();
		if(!mgt){
			errorElement("提供的错误消息无效，无法生成故障信息。",ww.e);
			glerr.add(40,esBase+"faultWindow",["错误消息无效 ",getType(msg,1)],msg);
			return;
		}
		style.textContent=`@charset "UTF-8";
/* @import url("/css/monospace.css"); */
.errmsg-root {
	height: 100%;
	width: 100%;
	display: flex;
	flex-direction: column;
	flex-wrap: nowrap;
}
.errmsg-root p {
	margin: 0;
}
.errmsg-root hr {
	border: 1px solid #EBEBEB;
	box-sizing: border-box;
	width: 100%;
}
.errmsg-root .emtf-monospace {
	font-family: "Lucida Console", Consolas, Courier, monospace;
}
.errmsg-root .errmsg-top {
	font-size: 1.2em;
	padding-left: 0.25em;
	font-weight: bold;
}
.errmsg-root .errmsg {
	font-size: 0.9em;
}
.errmsg-root .stack-or-other {
	border: 1px solid #DBDBDB;
	border-radius: 5px;
	padding: 2px;
	margin: 0.5em 1px;
	flex: 1;
	overflow: auto;
	min-height: 3em;
}
.errmsg-root .varlist {
	flex: 1;
	overflow: auto;
	min-height: 1em;
}
.errmsg-root .var-key {
	font-style: oblique;
}
.errmsg-root .var-kv-split {
	font-weight: bold;
}
/* 类型颜色(亮色) */
.errmsg-root .var-value.type-undefined {
	color: var(--docs-color);
}
.errmsg-root .var-value.type-null {
	color: var(--docs-color);
}
.errmsg-root .var-value.type-bool {
	color: var(--docs-color);
}
.errmsg-root .var-value.type-num {
	color: var(--docs-color);
}
.errmsg-root .var-value.type-bigint {
	color: var(--docs-color);
}
.errmsg-root .var-value.type-str {
	color: var(--docs-color);
}
.errmsg-root .var-value.type-symbol {
	color: var(--docs-color);
}
.errmsg-root .var-value.type-fun {
	color: var(--docs-color);
}
.errmsg-root .var-value.type-obj {
	color: var(--docs-color);
}
/* 暗色部分 */
.docs-style-dark .errmsg-root hr {
	border-color: #252525;
}
.docs-style-dark .errmsg-root .stack-or-other {
	border-color: #818181;
}
/* 类型颜色(暗色) */
.docs-style-dark .errmsg-root .var-value.type-undefined {
	color: var(--docs-color);
}
.docs-style-dark .errmsg-root .var-value.type-null {
	color: var(--docs-color);
}
.docs-style-dark .errmsg-root .var-value.type-bool {
	color: var(--docs-color);
}
.docs-style-dark .errmsg-root .var-value.type-num {
	color: var(--docs-color);
}
.docs-style-dark .errmsg-root .var-value.type-bigint {
	color: var(--docs-color);
}
.docs-style-dark .errmsg-root .var-value.type-str {
	color: var(--docs-color);
}
.docs-style-dark .errmsg-root .var-value.type-symbol {
	color: var(--docs-color);
}
.docs-style-dark .errmsg-root .var-value.type-fun {
	color: var(--docs-color);
}
.docs-style-dark .errmsg-root .var-value.type-obj {
	color: var(--docs-color);
}`;
		mon.className="errmsg-root";
		tmg.className="errmsg-top";
		tmg.textContent=mgt;
		mon.append(tmg);
		for(const m of ml){
			let mt=m.trim();
			if(!mt)continue;
			let lmg=dce("p");
			lmg.className="errmsg";
			lmg.textContent=mt;
			mon.append(lmg);
		}
		stk.className="stack-or-other";
		skl.textContent=String(tkl);
		hsv.className="hr-errmsg-varlist";
		vat.className="varlist-title";
		vat.textContent="采集当前监听的变量列表";
		vad.className="varlist";
		let sv=samplingVariable();
		for(const n in sv){
			let vai=dce("p"),
				van=dce("span"),
				vas=dce("span"),
				vav=dce("span");
			let vty=typeof sv[n];
			let vtf=(v=>{return cn=>v.classList.add("type-"+cn)})(vav);
			van.className="var-key";
			van.textContent=String(n);
			vas.className="var-kv-split";
			vas.textContent=" = ";
			vav.className="var-value";
			vav.textContent=String(sv[n]);
			vai.className="varlist-item emtf-monospace";
			if(vty==="undefined") vtf("undefined");
			else if(sv[n]===null) vtf("null");
			else if(vty==="boolean") vtf("bool");
			else if(vty==="number") vtf("num");
			else if(vty==="bigint") vtf("bigint");
			else if(vty==="string") vtf("str");
			else if(vty==="symbol") vtf("symbol");
			else if(vty==="function") vtf("fun");
			vai.append(van,vas,vav);
			vad.append(vai);
		}
		stk.append(skl);
		mon.append(stk,hsv,vat,vad);
		ww.e.append(style,mon);
	}
	let listening={};// 变量监听
	function samplingVariable(){// 从变量监听处采样数据
		const l=listening;
		let r={};
		let isl=false;
		console.groupCollapsed("变量监听列表");
		for(const n in l){
			isl=true;
			let vle=l[n];
			if(typeof vle==="function")try{vle=vle()}catch(e){
				glerr.addError(30,esBase+"samplineVariable",[e],{f:vle,e});
			}
			console.debug(`%c${n}:`,"font-style:oblique;",vle);
			try{String(vle);r[n]=vle}catch(e){r[n]="无法处理"}
		};if(!isl)console.info("无");
		console.groupEnd();
		return r;
	}// 处理error事件
	function listenerErrorEvent(ev){// 监听errorEvent
		let msg=String(ev.message);
		if(ev.filename) msg+=`\n@${ev.filename}:${ev.lineno}:${ev.colno}`;
		faultWindowTry(msg,ev.error?.stack);
	}
	function addlserEE(){// 添加error事件监听
		window.addEventListener("error",listenerErrorEvent);
	}
	function dellserEE(){// 移除error事件监听
		window.removeEventListener("error",listenerErrorEvent);
	}// 处理 未处理拒绝 事件
	function listenerUnhlrejEvent(ev){// 监听unhandledrejection
		let rea=ev.reason;
		faultWindowTry(rea,rea?.stack);
	}
	function addlserUR(){
		window.addEventListener("unhandledrejection",listenerUnhlrejEvent);
	}
	function dellserUR(){
		window.removeEventListener("unhandledrejection",listenerUnhlrejEvent);
	}// -
	function switchEventListener(){// 切换错误事件监听状态
		if(isListenerErEv){
			dellserEE();
			dellserUR();
			return isListenerErEv=false;
		}else{
			addlserEE();
			addlserUR();
			return isListenerErEv=true;
		}
	}
	return Object.freeze({
		try:tryFunction,
		catchPromise,
		errorToWindow,
		faultWindowTry,
		faultWindow,
		listening,
		samplingVariable,
		swEvLse:switchEventListener,
	});
})();

docsMonitor.swEvLse();
