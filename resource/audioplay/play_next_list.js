// 自动播放下一个播放列表

(()=>{
	const transfer=layui.transfer,form=layui.form;
	const list=[];
	const pnlt=Temp.playNextListTool={
		listIdx:0,
		list,
		get xzlb(){return xzlb;},
		get run(){return run;},
		get errCount(){return errCount;},
		maxErrorStop:true,
	},FT=filterText,dfPLT="当前播放列表:";
	let xzlb=[],run=false,errCount=0,pIdxEl,pltEl;
	let iswinmin=matchMedia("(max-height:600px),(max-width:400px)").matches;
	function getTxt(key,dfu){// 获取UI文本
		const t=uiText[key]??dfu;
		return FT(t);
	}
	function openWindow(){// 打开工具窗口
		const BTN="layui-btn layui-btn-sm";
		return layer.open({
			type:1,title:getTxt("PNLT_wintitle","自动跳转下一个播放列表"),
			content:`<style>
.pnlt_btn_l {
	text-align: right;
}
</style>
<p class="pnlt_plt layui-ellip">${getTxt("PNLT_plt",dfPLT)} </p>
<div class="layui-input-group">
	<div class="layui-input-prefix layui-input-split">播放索引</div>
	<input type="number" class="layui-input pnlt_index" lay-affix="number" step="1" min="0" lay-precision lay-step-strictly />
</div>
<div class="pnlt_btn_l">
	<button class="${BTN} pnlt_add_btn">${FT(uiText.add)}</button>
	<button class="${BTN} pnlt_import_btn">${FT(uiText.import)}</button>
	<button class="${BTN} pnlt_export_btn">${FT(uiText.export)}</button>
</div>
<div class="pnlt_listitem">配置控件</div>
<div class="pnlt_btn_l">
	<button class="${BTN} pnlt_confirm_btn">${FT(uiText.confirm)}</button>
	<button class="${BTN} pnlt_reset_btn">${FT(uiText.reset)}</button>
</div>
<input type="file" class="pnlt_import_file" hidden accept=".json,application/json" />
`,
			id:"pnlt_window",
			shadeClose:true,hideOnClose:true,
			maxmin:true,zIndex:10,
			success(l,ix,th){
				function bc(s,c){l.find(`.pnlt_${s}_btn`).click(c)}
				bc("add",addItem);
				bc("import",importList);
				bc("export",exportList);
				bc("confirm",confirm);
				bc("reset",resetInput);
				l.find(".pnlt_import_file")[0]?.addEventListener("change",function(){
					const f=this.files[0];
					if(!f)return;
					f.text().then(d=>JSON.parse(d)).then(loadListData);
				});
				pltEl=l.find(".pnlt_plt")[0];
				pIdxEl=l.find(".pnlt_index")[0];
				transfer.render({
					elem:l.find(".pnlt_listitem"),
					id:"pnlt_listitem",
					title:[getTxt("PNLT_otherli","待选列表"),getTxt("PNLT_playli","已选播放")],
					height:iswinmin?160:360,
				});
				form.render(l.find(".pnlt_index"));
				th.offset();
			}
		});
	}
	function loadListData(d){// 加载列表数据
		list.splice(0);
		xzlb=[];
		if(!Array.isArray(d))throw new TypeError("输入的值不是数组");
		for(const i of d){
			list.push({title:i.title,url:i.url});
		}
		changeTsUI();
	}
	function changeTsUI(){// 更新控件UI
		let ud=[];
		for(const d in list){
			ud.push({title:list[d].title,value:d});
		}
		transfer.reload("pnlt_listitem",{
			data:ud,
			value:xzlb,
		});
	}
	function loadPlaylist(idx){// 加载指定
		const d=list[idx];
		if(!d)throw new ReferenceError(`索引 ${idx} 无数据`);
		pltEl.textContent=`${getTxt("PNLT_plt",dfPLT)} ${d.title}`;
		setWakeLock();
		getNetworkData(d.url).then(d=>{
			if(d==="end")return;
			nextPlaylist();
		});
	}
	function nextPlaylist(){// 下一个列表
		let i=Number(pIdxEl.value);
		if(Number.isNaN(i)) i=0;
		i++;
		if(i>=xzlb.length||i<0) i=0;
		loadPlaylist(xzlb[i]);
		pnlt.listIdx=pIdxEl.value=i;
	}
	function addItem(){// 添加单个
		layer.open({
			type:1,title:getTxt("PNLT_addItemTitle","添加播放列表"),
			content:`<div class="layui-form layui-margin-2" lay-filter="pnlt_add_item">
	<div class="layui-input-group">
		<div class="layui-input-prefix layui-input-split">${getTxt("PNLT_addTheTitle","标题")}</div>
		<input type="text" class="layui-input" lay-affix="clear" name="title" required />
	</div>
	<div class="layui-input-group">
		<div class="layui-input-prefix layui-input-split">${getTxt("PNLT_addTheURL","链接")}</div>
		<input type="text" class="layui-input" lay-affix="clear" lay-verify="url" name="url" required />
	</div>
</div>`,
			shade:0.1,shadeClose:true,
			zIndex:10,
			btn:[FT(uiText.confirm),FT(uiText.cancel)],
			btn1(i){
				form.submit("pnlt_add_item",d=>{
					const l=d.field;
					if(!l.title||!l.url){
						layer.msg(getTxt("PNLT_addItemNoData","未填写全部项目"),{zIndex:20,icon:0});
						return false;
					}
					list.push({title:l.title,url:l.url});
					changeTsUI();
					layer.close(i);
					return false;
				});
			},
			success(l,i,t){
				form.render(l.find(".layui-form"));
				t.offset();
			}
		});
	}
	function importList(){// 导入数据
		const p=document.querySelector(".pnlt_import_file");
		if(p?.type!=="file")return void(layer.msg("输入控件异常",{zIndex:20}));
		p.click();
	}
	function exportList(){// 导出数据
		const f=new File([JSON.stringify(list,null,"\t")],"audioplay-playlist.json",{type:"application/json"});
		const u=URL.createObjectURL(f);
		layer.open({
			type:1,title:"导出数据",
			content:`<p>已将当前的播放列表处理成文件，请<a download="${f.name}" href="${u}">点击此处链接</a>下载。</p>`,
			btn:[filterText(uiText.close)],
			shade:0.2,shadeClose:true,zIndex:10,
			end(){URL.revokeObjectURL(u)}
		});
	}
	function confirm(){// 确定播放配置
		const p=transfer.getData("pnlt_listitem");
		xzlb=[];
		for(const d of p){
			xzlb.push(d.value);
		}
		if(xzlb.length>0) run=true;
		else run=false;
		let pIdx=Number(pIdxEl.value);
		if(pIdx>=xzlb.length||pIdx<0||Number.isNaN(pIdx)) pIdxEl.value=pIdx=0;
		if(playlist.length<1&&run) loadPlaylist(pIdx);
		pnlt.listIdx=pIdx;
		layer.msg(getTxt("PNLT_confirm_tip","操作完成"),{zIndex:20});
	}
	function resetInput(){// 重置输入
		changeTsUI();
		pIdxEl.value=String(pnlt.listIdx);
	}
	function init(){// 初始化
		openWindow();
		pIdxEl.value="0";
		apET.addEventListener("playlistLoadFail",()=>{
			errCount++;
			if(!run)return;
			if(errCount>2&&pnlt.maxErrorStop)return;
			nextPlaylist();
		});
		apET.addEventListener("playlistEnd",ev=>{
			if(!run)return;
			ev.preventDefault();
			nextPlaylist();
		});
	}
	Object.assign(pnlt,{
		openWindow,
		loadListData,
		loadPlaylist,
		nextPlaylist,
	});
	init();
})();
