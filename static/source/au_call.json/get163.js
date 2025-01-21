// get163 call
/** @param {any} d */
function fpm(d){}
/** function input: songID */
const value=0;

fetch(`https://music.163.com/song/media/outer/url?id=${value}.mp3`,{method:'HEAD'}).then(r=>{
	const h=r.headers,
		re=t=>{return new ReferenceError(`get163:${t}`)};
	if(!h.has('Location'))throw re('未获取到重定向信息');
	const l=h.get('Location');
	if(l==='https://music.163.com/404')throw re('对方拒绝提供播放');
	fpm(l);
});