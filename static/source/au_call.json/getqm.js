// getqy call
/** function input: mid */
const value="1Aa";

let uin='0';
let data={
	comm:{
		cv:0,
		ct:24,
		format:'json',
		uin,
	},
	'req_1':{
		module:'vkey.GetVkeyServer',
		method:'CgiGetVkey',
		param:{
			guid:'1429839143',
			songmid:[value],
			songtype:[0],
			uin,
			loginflag:1,
			platform:'20',
			xcdn:1,
		}
	}
};
fetch(`https://u.y.qq.com/cgi-bin/musicu.fcg?format=json&sign=zzannc1o6o9b4i971602f3554385022046ab796512b7012&data=${encodeURIComponent(JSON.stringify(data))}`, {
	headers:{
		'Host':'u.y.qq.com',
		'Origin':'https://y.qq.com/',
		'Referer':'https://y.qq.com/',
	}
}).then(async r=>{
	let d=await r.json();
	let u=d['req_1']?.data?.midurlinfo?.[0]?.xcdnurl;
	if(!u)throw new Error(`getQY res: ${JSON.stringify(d)}`);
	return fpm(u);
});
