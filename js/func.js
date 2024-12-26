// 工具函数

const docsFunc={
	a:function addAllLogItem(t,s,m,d){cache.log.all.add(t,s,m,d)},
	ae:function addAllLogErrorItem(t,s,m,d){cache.log.all.addError(t,s,m,d)},
	e:function addErrLogErrorItem(t,s,m,d){cache.log.err.addError(t,s,m,d)},
	log:class DocsScriptLog{
		// 简化对日志all和err的增加
		e=false;
		t=40;
		constructor(n,f,s){
			if(n===0||n==="all")this.n="all";
			else if(n===1||n==="err")this.n="err";
			else throw new RangeError("不是all或err日志");
			if(typeof f==="string")this.f=f;
			if(typeof s==="string")this.s=s;
		};a(t,s,m,d=undefined){
			var l=cache?.log?.[this.n];
			if(!(l instanceof Log))throw new ReferenceError("不存在日志");
			if(this.e&&typeof l.addError==="function") l.addError?.(t,s,m,d);
			else l.add(t,s,m,d);
		};get l(){
			if(typeof cache?.log!=="object")throw new ReferenceError("不存在日志池");// 使用短路运算符需要保证存在这个变量，否则会抛出错误。就算使用typeof也会抛出
			else if(this.n==="all")return cache.log.all;
			else if(this.n==="err")return cache.log.err;
			else return null;
		};set l(v){
			if(typeof this.t!=="number")throw new TypeError("number");
			this.a(this.t,`${this.f}>${this.s}`,v);
		};copy(){
			var o=new this.constructor(this.n,this.f,this.s);
			o.e=Boolean(this.e);
			o.t=Number(this.t);
			return o;
		}
	},
	errorWindow:function errorWindow(html){// 错误窗口
		var w=docWindow("error","");
		errorElement(String(html),w.e);
		return w;
	},
	warnWindow:function warnWindow(html){// 警告窗口
		var w=docWindow("warning","");
		warnElement(String(html),w.e);
		return w;
	},
	dce:function documentCreateElement(tag){// 创建元素
		return document.createElement(tag);
	}, task:function timeTask(){// 定时任务
		class SingleTask {// 单个任务
			get[Symbol.toStringTag](){return"SingleTask"};
			get rund(){return this._rund};
			constructor(time,data){
				this.theNotRun=false;// 声明不运行该任务，将在下一个循环删除
				this._rund=false;// 表示已运行，不要修改它来骗自己
				this.time=time;
				this.data=data;
			}; setTime(t){// 修改任务时间
				if(typeof t!=="number")throw new TypeError("请输入要增量或变更为的时间整数");
				if(t>86300000)return this.time=t;
				else return this.time=this.time+t;
			}
		}
		const tr=class TimeTask {// 主循环
			get[Symbol.toStringTag](){return"TimeTask"};
			log=new Log("task","定时任务运行日志");
			#taskRefreshTime=1000;
			task=[];
			#intervalId=0;
			viewTC=false;
			constructor(){
				const cstrt=config.storage?.timeTackRefreshTime;
				if(typeof cstrt==="number"&& cstrt>0&& cstrt<86400000)this.#taskRefreshTime=cstrt;
				this.log.maxLog=25;
				this.#establishTaskRefresh();
			}; #establishTaskRefresh(){// 建立任务刷新
				const id=this.#intervalId=setInterval((p)=>{
					const t=Date.now();
					let rm=[],k=p.task;
					for(let i=0;i<k.length;i++){
						const l=k[i];if(typeof l!=="object"){rm.push(i);continue}
						const m=Number(l.time),d=l.data;
						if(l.theNotRun||isNaN(m)){rm.push(i);continue}
						if(m>t)continue;
						l._rund=true;
						if(typeof d==="function")try{
							d();
						}catch(e){p.log.add(10,"运行函数",e,e)}
						if(typeof d==="string") docsScript.warn(d,"window");
						rm.push(i);
					};for(let i=rm.length-1;i>=0;i--){k.splice(rm[i],1);}
					if(p.viewTC) p.log.add(0,"运行耗时",Date.now()-t);
				},this.#taskRefreshTime,this);
				this.log.add(0,"建立","循环ID: "+id);
			}; add(time,data){// 添加任务
				if(typeof time!=="number")throw new TypeError("未正确提供要运行的时间");
				let st=null;
				if(time>86300000) st=new SingleTask(time,data);
				else st=new SingleTask(Date.now()+time,data);
				this.task.push(st);
				return st;
			}; clear(){// 清除运行
				const id=this.#intervalId;
				this.log.add(0,"清除","循环ID: "+id);
				if(id) clearInterval(id);
				else this.log.add(10,"清除","检查到循环ID为假值，无法清除");
				this.#intervalId=0;
			}; start(){this.clear();this.#establishTaskRefresh();}// 重启运行
			get taskRefreshTime(){return this.#taskRefreshTime}
			set taskRefreshTime(v){if(typeof v==="number"&& v>0)this.#taskRefreshTime=v;this.start()}
		};if(typeof Temp.tTask?.clear==="function")try{
			Temp.tTask.clear();
			cache.log.root.add(0,"task","似乎存在正在运行的任务，已调用clear函数");
		}catch(e){cache.log.root.add(0,"task","对之前的数据调用clear函数出现错误",e)}
		Temp.tTask=new tr();
		cache.log.root.add(0,"task","已建立定时任务");
	},
	ahref:function aHref(aes,jipf,opt={}){// 阻止指定链接打开，并对其执行函数
		if(typeof opt!=="object")throw new TypeError("opt不是对象");
		if(!Array.isArray(aes))throw new TypeError("aes不是数组");
		if(typeof jipf!=="function")throw new TypeError("jipf不是函数");
		function detectHost(u){
			if(opt.detect){
				let detect=opt.detect;
				if(typeof detect==="string")return u.host===detect;
				else if(typeof detect==="function")try{return !!detect(u)}catch(er){cache.log.err.addError(40,"/js/func.js>docsFunc.ahref",er)}
			}else return u.host===location.host;
		};function click(ev){
			if(typeof ev.preventDefault==="function")
				ev.preventDefault();
			else ev.returnValue=false;
			jipf(this);
			return false;
		}
		var target="_blank";
		for(const ae of aes){
			if(!(ae instanceof HTMLAnchorElement))throw new TypeError("不是a元素");
			if(detectHost(new URL(ae.href,location.href))){
				ae.target=target;
				ae.addEventListener("click",click);
			}
		}
	}
}

class WebsiteTimeShowElement extends HTMLElement {
	#ifrWindow=undefined;
	constructor(){
		super();
	};connectedCallback(){
		const shadow=this.attachShadow({mode:"open"});
		const ifr=docsFunc.dce("iframe");
		ifr.src="/assets/time.html";
		ifr.style.cssText="border:none;";
		ifr.width="100%";
		shadow.appendChild(ifr);
		this.#ifrWindow=ifr.contentWindow;
		this.postMessage("hiddenArti");
	}; postMessage(command){
		if(!(this.#ifrWindow instanceof Window))throw new ReferenceError("未找到窗口，请确保元素附加到文档。");
		this.#ifrWindow.postMessage({command},"*");
	}; start(){
		this.postMessage("start");
	}; stop(){
		this.postMessage("stop");
	}
}

customElements.define("time-show",WebsiteTimeShowElement);
