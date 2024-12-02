// load Live2D

const load_live2d={
	baseURL:location.protocol+"//"+location.hostname+":12001/",
	load:function load(wt){
		Promise.all([
			this.c(this.baseURL+"live2d-widget/waifu.css","l"),
			this.c(this.baseURL+"live2d-widget/live2d.min.js","s"),
			this.c(this.baseURL+"live2d-widget/waifu-tips.js","s"),
		]).then(()=>{
			live2dWinget.init({
				apiPath:this.baseURL+"live2d_api/",
				//cdnPath:this.baseURL+"live2d_api/",
				waifuPath:wt,
				tools:["hitokoto","asteroids","switch-model","switch-texture","photo","info","quit"]
			});
		}).catch(()=>{
			cache.log.err.add(40,"/js/lib/load_live2d.js>load_live2d.load[Promise]","加载Live2D失败");
		});
	},
	c:function c(u,t){
		return new Promise((a,b)=>{
			new URL(u);
			let e=undefined;
			if(typeof t!=="string"){
				throw new TypeError("不是字符串");
			}else if(t==="l"){
				e=document.createElement("link");
				e.rel="stylesheet";
				e.href=u;
			}else if(t==="s"){
				e=document.createElement("script");
				e.src=u;
			}else{
				throw new Error("无支持");
			}
			e.onload=ev=>a(ev);
			e.onerror=ev=>b(ev);
			document.head.append(e);
		});
	}
}
