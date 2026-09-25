/* 显示网易云音乐的歌词
 * 加载后将会添加菜单
 */

(()=>{
	const ELEM_NAME="show163lyric_lyric"
	Temp.neteaseMusicLyric={
		lrc:undefined,
		tlrc:undefined,
		klrc:undefined,
		rlrc:undefined,
	}
	function clearLrcCache(){// 清理歌词缓存
		Temp.neteaseMusicLyric={
			lrc:undefined,
			tlrc:undefined,
			klrc:undefined,
			rlrc:undefined,
		}
	}
	function buttonView(){// 按钮显示窗口
		if(hasLyricE())return;
		layer.open({
			type:1,
			title:"歌词",
			content:`
				<style>
					.${ELEM_NAME}{height:100%;width:100%;overflow:hidden;text-align:center;}
					.${ELEM_NAME}>.lyric{height:1em;}
				</style>
				<div class="${ELEM_NAME}"></div>
			`,
			area:"500px",
			maxmin:true,
			shade:0,
			zIndex:10,
			success(){if(id_player.src!==""&&!id_player.ended) loadLyric()},
			beforeEnd(){clearLrcCache()},
		});
	}
	function getLyricE(){// 获取歌词元素
		const es=document.getElementsByClassName(ELEM_NAME);
		if(es.length<1)return null;
		return es[0];
	}
	function printLyric(text){// 打印歌词
		const es=document.getElementsByClassName(ELEM_NAME);
		if(es.length<1)return false;
		es[0].textContent=String(text);
		return true;
	}
	function hasLyricE(){// 是否有歌词显示容器
		return document.getElementsByClassName(ELEM_NAME).length>0;
	}
	function loadLyric(){// 加载歌词
		const playitem=playlist[playIdx];
		clearLrcCache();
		if(playitem.call!=="get163"){
			printLyric("[非网易云音乐歌曲]");
			return;
		}
		cache.fetch(`https://music.163.com/api/song/lyric?os=pc&id=${playitem.value}&lv=-1&kv=-1&tv=-1&rv=-1&yv=1`,{type:"json"}).then(d=>{
			return d.data;
		}).then(d=>{
			if(d.code!==200){
				console.error("无法获取歌词",d);
				printLyric("[歌词获取失败]");
				return;
			}
			Temp.neteaseMusicLyric.lrc=d.lrc;
			Temp.neteaseMusicLyric.tlrc=d.tlyric;
			Temp.neteaseMusicLyric.klrc=d.klyric;
			Temp.neteaseMusicLyric.rlrc=d.romalrc;
			rebuildLyric()
		}).catch(e=>{
			console.error("歌词获取失败",e);
			printLyric("[歌词获取失败]");
		});
	}
	id_player.addEventListener("loadstart",()=>{
		if(hasLyricE()) loadLyric();
	});
	(()=>{// 初始化按钮
		const el=document.createElement("button");
		el.className=otherMenuButtonClass;
		el.textContent="显示网易云音乐歌词";
		el.onclick=buttonView;
		cache.otherMenuElement.append(el);
	})();

	// 歌词显示(AI生成)
	const STAMP=/\[(\d{1,3}):(\d{1,2})(?:[.:](\d{1,3}))?\]/g;
	function parseLrc(raw){// 解析歌词文本
		const map=new Map();
		if(!raw)return map;
		const lines=String(raw).split(/\r?\n/);
		for(let i=0;i<lines.length;i++){
			const line=lines[i];
			STAMP.lastIndex=0;
			const stamps=[];
			let m,end=0;
			while((m=STAMP.exec(line))){
				stamps.push(+m[1]*60000+ +m[2]*1000+(m[3]?+m[3].padEnd(3,'0'):0));
				end=STAMP.lastIndex;
			}
			const text=stamps.length?line.slice(end).trim():'';
			if(!text)continue;
			for(let j=0;j<stamps.length;j++)map.set(stamps[j],text);
		}
		return map;
	}
	function locate(times,ms){// 定位歌词
		let lo=0,hi=times.length-1,i=-1;
		while(lo<=hi){
			const mid=(lo+hi)>>1;
			if(times[mid]<=ms){i=mid;lo=mid+1}
			else hi=mid-1;
		}
		return i;
	}
	let lrc=new Map();
	let tlrc=new Map();
	let times=[];
	let $lrc=null;
	let $tlrc=null;
	let cur=-1;
	function mount(){// 挂载歌词显示
		const box=getLyricE();
		if(!box)return false;
		if($lrc&&$lrc.parentNode===box)return true;
		$lrc=document.createElement('p');
		$tlrc=document.createElement('p');
		$lrc.className='lyric lrc';
		$tlrc.className='lyric lrc-t';
		box.replaceChildren($lrc,$tlrc);
		cur=-1;
		return true;
	}
	function render(){// 渲染歌词
		if(!hasLyricE())return;
		if(!mount())return;
		$lrc.hidden=lrc.size===0;
		$tlrc.hidden=tlrc.size===0;
		const i=locate(times,id_player.currentTime*1000);
		if(i===cur)return;
		cur=i;
		const t=i<0?null:times[i];
		$lrc.textContent=t===null?'':(lrc.get(t)??'');
		$tlrc.textContent=t===null?'':(tlrc.get(t)??'');
	}
	function rebuildLyric(){// 处理歌词文本
		const src=Temp.neteaseMusicLyric;
		lrc=parseLrc(src.lrc?.lyric);
		tlrc=parseLrc(src.tlrc?.lyric);
		const set=new Set();
		lrc.forEach((_,t)=>set.add(t));
		tlrc.forEach((_,t)=>set.add(t));
		times=[...set].sort((a,b)=>a-b);
		cur=-1;
		render();
	}
	id_player.addEventListener('timeupdate',render);
	id_player.addEventListener('seeked',render);
})();
