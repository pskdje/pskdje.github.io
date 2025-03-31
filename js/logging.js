// 日志处理模块
/* 参考Python日志模块写的
 * 按照文档中的设计思路写的，只是简单的实现。
 */

const logging=Object.freeze((()=>{
	// 基本定义
	const errLog=cache.log.err;// 日志模块出现错误时输出到的日志对象
	const lsou="/js/logging.js>logging";// 日志模块的标记
	class LogRecord {// 日志传递对象
		get[Symbol.toStringTag](){return"LogRecord"}
		constructor(typ,sou,msg,dat){
			this.timestamp=Date.now();
			this.type=Number(typ);
			this.sou=this.source=String(sou);
			this.msg=this.message=(m=>{
				if(Array.isArray(m)){
					let rm="";
					for(const mi of m){
						if(mi instanceof Error) rm+=" "+String(mi)+" ";
						else if(typeof mi==="object")try{rm+=JSON.stringify(mi,null,"\t");}catch(e){rm+=getType(mi,1);if(DEBUG[0])p(String(e));}
						else rm+=String(mi);
					};return rm;
				}else return String(m);
			})(msg);
			this.data=dat;
			Object.seal(this);
		}
	}
	class BaseFilterRun {// 基本过滤接口实现
		filters=[];
		#level=0;// 按照类型等级过滤
		get level(){return this.#level};
		set level(v){this.#level=Number(v)};
		addFilter(filter){// 添加过滤器
			if(!(filter instanceof Filter))
				throw new TypeError("不是过滤器对象");
			this.filters.push(filter);
		};
		removeFilter(filter){// 移除过滤器
			var i=this.filters.indexOf(filter);
			if(i<0)return false;
			return this.filters.splice(i,1);
		};
		runFilter(item){// 运行过滤器
			const s=this.logSou+".runFilter";
			let l=true;
			for(const f of this.filters){
				let r;
				try{r=f.filter(item)}
				catch(e){errLog.add(40,s,"某个过滤器出现异常，数据已记录在data。",{
					error:e,obj:f
				})}
				if(r===false)return false;
				if(r===true)continue;
				if(r instanceof LogRecord) l=r;
				else errLog.add(30,s,"无效的过滤器返回值");
			}
			return l;
		};
		filter(item){// 进行过滤
			if(item.type<this.#level)return false;
			const r=this.runFilter(item);
			if(r===false)return false;
			if(r===true)return item;
			return r;
		}
	}
	class Logger extends BaseFilterRun {// 记录器
		get[Symbol.toStringTag](){return"Logger"}
		get logSou(){return lsou+".Logger"};// 记录器的标记
		handlers=[];// 处理器列表
		constructor(name){
			super();
			this.name=String(name);
		};
		addHandler(handle){// 添加处理器
			if(!(handle instanceof Handler))
				throw new TypeError("不是处理器对象");
			this.handlers.push(handle);
		};
		removeHandler(handle){// 移除处理器
			var i=this.handlers.indexOf(handle);
			if(i<0)return false;
			return this.handlers.splice(i,1);
		};
		runHandler(item){// 运行日志处理
			for(const h of this.handlers){
				try{h.handle(item)}
				catch(e){errLog.add(40,this.logSou+".runHandler","某个处理器出现异常，数据已记录在data。",{
					error:e,obj:h
				})}
			}
		};
		handle(type,message,data,opt={}){// 接受数据并处理
			try{
				if(type<this.level)return;
				let d=new LogRecord(type,this.name+(opt.source??""),message,data);
				d=this.filter(d);
				if(!d)return;
				this.runHandler(d);
			}catch(e){
				errLog.addError(40,this.logSou+".handle",e);
			}
		};
		debug(...args){
			this.handle(0,...args);
		};
		log(...args){
			this.handle(10,...args);
		};
		info(...args){
			this.handle(20,...args);
		};
		warn(...args){
			this.handle(30,...args);
		};
		error(...args){
			this.handle(40,...args);
		};
		critical(...args){
			this.handle(50,...args);
		};
	}
	class Handler extends BaseFilterRun {// 处理器
		get[Symbol.toStringTag](){return"Handler"}
		#formatter=new Formatter();
		get formatter(){return this.#formatter};
		set formatter(v){this.#formatter=v};
		handle(item){// 处理数据
			if(item.type<this.level)return;
			let d=this.filter(item);
			if(!d)return;
			d=this.format(d);
			this.emit(d);
		};
		format(item){// 格式化数据
			return this.#formatter.format(item);
		};
		emit(item){};// 最后的记录操作
	}
	class Filter {// 过滤器
		get[Symbol.toStringTag](){return"Filter"}
		filter(item){}
	}
	class Formatter {// 格式器
		get[Symbol.toStringTag](){return"Formatter"}
		format(item){// 格式化
			let t=Log.type[item.type]??"none";
			return `[${this.formatTime(item.timestamp)}][${t}] "${item.source}": ${item.message}`;
		};
		formatTime(time){// 格式化时间
			return docsScript.dateToStr(time);
		};
	}
	// 扩展
	class OutputLogHandler extends Handler {// 输出到日志对象
		get[Symbol.toStringTag](){return"OutputLogHandler"}
		constructor(log){
			super();
			this.log=log;
		};
		handle(item){// 绕过格式器
			let d=this.filter(item);
			if(!d)return;
			this.emit(d);
		};
		emit(item){// 记录到日志
			this.log.add(item.type,item.source,item.message,item.data);
		}
	}
	class FilterData extends Filter {// 过滤data数据
		get[Symbol.toStringTag](){return"FilterData"}
		filter(item){
			return new LogRecord(item.type,item.source,item.message);
		}
	}
	// 导出
	return{
		Logger,
		Handler,
		Filter,
		Formatter,
		LogRecord,
		OutputLogHandler,
		FilterData,
	}
})());
