// 映射logging.js的接口
/* 当未加载日志组件时的回退方案
 * 模块应使用该日志接口以防未加载日志组件导致的无法工作。
 */

function isL(){// 检查日志组件是否加载
	try{
		return typeof logging==="object";
	}catch(e){}
}

export class Logger{
	handlers=[];
	filters=[];
	level=0;
	constructor(...a){
		if(isL())return logging.Logger(...a);
		this.name=a[0];
	}
	addHandler(){
	}
	removeHandler(){
	}
	runHandler(){
	}
	handle(){
	}
	addFilter(){
	}
	removeFilter(){
	}
	runFilter(){
	}
	filter(){
	}
	debug(...a){
	}
	log(...a){
	}
	info(...a){
	}
	warn(...a){
	}
	error(...a){
	}
	critical(...a){
	}
}

export{isL as isLoadLogging};
export default isL;
