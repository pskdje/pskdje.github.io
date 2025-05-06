// 音频可视化

(()=>{
	const dfay=Temp.analyser;
	if(!dfay){
		layer.alert("由于Chromium限制，请先点击获取数据按钮再尝试。");
		document.getElementById("audio_analyser")?.remove?.();
		return;
	}
	function createWindow(opt){// 创建窗口
		return layer.open({
			type:1,
			content:`<canvas></canvas>`,
			maxmin:true,
			shade:0,
			zIndex:10,
			...opt
		});
	}
	function creaResiz(cv){
		return(layero)=>{
			let e=layero.find(".layui-layer-content")[0];
			if(!e)return;
			cv.height=e.clientHeight-8;
			cv.width=e.clientWidth;
		};
	}
	function suTDD(layero,index,that){// 波形
		const cv=layero.find("canvas")[0];
		let cvc=cv.getContext("2d");
		let bl=dfay.fftSize;
		let arr=new Uint8Array(bl);
		let run=true,qafid=0;
		function draw(){
			if(!run)return;
			qafid=requestAnimationFrame(draw);
			if(document.visibilityState!=="visible")return;
			let W=cv.width,H=cv.height;
			dfay.getByteTimeDomainData(arr);
			cvc.fillStyle="rgb(200,200,200)";
			cvc.fillRect(0,0,W,H);
			cvc.lineWidth=1;
			cvc.strokeStyle="rgb(0,0,0)";
			cvc.beginPath();
			const sw=(W*1.0)/bl;
			let x=0;
			for(let i=0;i<bl;i++){
				const v=arr[i]/128.0;
				const y=(v*H)/2;
				if(i===0){
					cvc.moveTo(x,y);
				}else{
					cvc.lineTo(x,y);
				}
				x+=sw;
			}
			cvc.lineTo(W,H/2);
			cvc.stroke();
		}
		that.config.beforeEnd=()=>{
			run=false;
			cancelAnimationFrame(qafid);
		}
		let sz=creaResiz(cv);
		that.config.resizing=sz;
		that.config.full=sz;
		that.config.restore=(l)=>{
			sz(l);
			if(!run){
				run=true;
				draw();
			}
		}
		that.config.min=()=>{
			run=false;
		}
		draw();
	}
	function suFD(layero,index,that){// 条形
		const cv=layero.find("canvas")[0];
		let cvc=cv.getContext("2d");
		let bl=dfay.frequencyBinCount;
		let arr=new Uint8Array(bl);
		let run=true,qafid=0;
		function draw(){
			if(!run)return;
			qafid=requestAnimationFrame(draw);
			if(document.visibilityState!=="visible")return;
			let W=cv.width,H=cv.height;
			dfay.getByteFrequencyData(arr);
			cvc.fillStyle="rgb(0,0,0)";
			cvc.fillRect(0,0,W,H);
			let bw=(W/bl)*2.5;
			let x=0;
			let col=cvc.createLinearGradient(0,0,0,H);
			col.addColorStop(0,"red");
			col.addColorStop(0.4,"yellow");
			col.addColorStop(1,"green");
			for(let i=0;i<bl;i++){
				let bh=Math.round(arr[i]/255*H);
				cvc.fillStyle=col;
				cvc.fillRect(x,H-bh,bw,bh);
				x+=bw+1;
			}
		}
		that.config.beforeEnd=()=>{
			run=false;
			cancelAnimationFrame(qafid);
		}
		let sz=creaResiz(cv);
		that.config.resizing=sz;
		that.config.full=sz;
		that.config.restore=(l)=>{
			sz(l);
			if(!run){
				run=true;
				draw();
			}
		}
		that.config.min=()=>{
			run=false;
		}
		draw();
	}
	Temp.audioAnalyser={
		sinewave(){
			createWindow({title:`音频波形( ${dfay.maxDecibels}dB ~ ${dfay.minDecibels}dB )`,success:suTDD});
		},
		frequencybars(){
			createWindow({title:`音频频率( ${dfay.maxDecibels}dB ~ ${dfay.minDecibels}dB )`,success:suFD});
		}
	};
})();
