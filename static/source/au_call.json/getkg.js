// getkg call
/** function input: songHASH */
const value="1A";

fetch(`https://m.kugou.com/app/i/getSongInfo.php?cmd=playInfo&hash=${value}`).then(async r=>{
	const d=await r.json();
	if(typeof d.url==='string')return fpm(d.url);
	throw new Error('获取失败: '+d.error);
});