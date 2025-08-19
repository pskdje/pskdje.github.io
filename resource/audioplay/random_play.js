// 随机播放

(()=>{
	function randomPlay(ev){
		ev.preventDefault();
		let i=docsScript.getRandom("f",0,playlist.length);
		changePLIdx(i);
		playAudio(i);
	}
	apET.addEventListener("playNext",randomPlay);
	apET.addEventListener("playPrev",randomPlay);
	topTipMsg("已加载随机播放扩展");
})();
