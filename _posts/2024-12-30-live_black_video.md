---
title: 完成直播遮挡特殊信息用视频
time: 2024/12/30-20:56
---

# 直播遮挡视频

由于逐渐增长的需求，现额外制作遮挡用视频来替换原先的视频。

演示：[哔哩哔哩](https://www.bilibili.com/video/BV18T6WYoEDa/)

## 文件

> *《关于制作遮挡画面时播放用视频的计划》*
>
> 为了顺应潮流、规避风险，经由我讨论，一致通过本计划。
>
> **一、概览**
>
> 根据目前技术水平和时间需要，计划仿照《绝区零》空洞深潜系统监视器阵列探索时进入战斗的画面来进行制作。
>
> **二、流程概述**
>
> 1、简单回忆《绝区零》1.0版本的进入战斗画面，对基本结构有大致了解。
>
> 2、新建视频工程，并做好基本配置。画面大小按照1920×1080像素，帧率30(帧/秒)。
>
> 3、制作需要用到的图片，大小原则上与视频相同或更小，图片必须带有透明通道以便视频处理。
>
> 4、将制作好的图片放入视频，排列剪辑，并视情况添加滤镜效果。
>
> 5、完成视频处理后导出。导出视频的基础参数原则上与视频工程相同，并在不损失质量的情况下压缩大小。
>
> **三、数据参数**
>
> **1、成品概述**
>
> 依照记忆，背景总体为黑灰色，有两行灰色文字变化，文字在变化为另一段文字可能有切换效果，所有文字均有概率出现噪点类的效果。
>
> **2、视频**
>
> 长宽: `1920×1080`
>
> 帧率: `30`
>
> **3、图片**
>
> 最大长宽: `1920×1080`
>
> 需要带有透明通道
>
> **4、工程**
>
> 视频轨道数应大于2个
>
> 酌情添加音频
>
> 文本平均切换时间应按照1秒为周期
>
> **5、许可**
>
> 成品视频、中间文件、工程文件均按照 **CC BY 4.0** 协议（[https://creativecommons.org/licenses/by/4.0/](https://creativecommons.org/licenses/by/4.0/)，[中文翻译](https://creativecommons.org/licenses/by/4.0/deed.zh-hans)）进行共享。
>
> **四、成品处理**
>
> 1、导出的视频将立刻应用于转场视频
>
> 2、允许受限制的上传到视频平台
>
> 3、允许通过共享协议共享成品

## 素材

视频工程文件：[遮挡视频.mlt](/static/assets/直播用遮挡特殊信息视频/遮挡视频.mlt)(Shotcut)

图片工程文件：[单纯背景](/static/assets/直播用遮挡特殊信息视频/背景.pdi) [背景文本](/static/assets/直播用遮挡特殊信息视频/文本.pdi) (PhotoDemon)

<div id="sucai"></div>
<script data-info="图片数据">
	const imglistd=[
		{name:"背景",src:"https://i1.hdslb.com/bfs/new_dyn/05b297d52a3e10c01755d7a6ddbf77bb438160221.jpg"},
		{name:"400",src:"https://i0.hdslb.com/bfs/new_dyn/c07d9604a7e9227a33c30fc58dff5db0438160221.png"},
		{name:"403",src:"https://i0.hdslb.com/bfs/new_dyn/aa6eed285612741113192fc5e2c2e9bf438160221.png"},
		{name:"404",src:"https://i0.hdslb.com/bfs/new_dyn/901c708f0fe333e7fbd015644eab14bc438160221.png"},
		{name:"410",src:"https://i0.hdslb.com/bfs/new_dyn/c38ab205a72531b985ecd36c1e1323e3438160221.png"},
		{name:"418",src:"https://i0.hdslb.com/bfs/new_dyn/2fe84dd3739faf9d81e970e9350ca884438160221.png"},
		{name:"500",src:"https://i0.hdslb.com/bfs/new_dyn/967bfa1b531b404825b8fd217510ec5d438160221.png"},
		{name:"502",src:"https://i0.hdslb.com/bfs/new_dyn/536ea5e35ab95716fce0b0ebef2eef92438160221.png"},
		{name:"504",src:"https://i0.hdslb.com/bfs/new_dyn/909c5cc912c6ab3744147d1341fea8e4438160221.png"},
		{name:"abort",src:"https://i0.hdslb.com/bfs/new_dyn/af772fe6fd15483b78f9fa3f86da389b438160221.png"},
		{name:"bad",src:"https://i0.hdslb.com/bfs/new_dyn/a31e78d40e84601d5ecf21c5d4a646d3438160221.png"},
		{name:"EOF",src:"https://i0.hdslb.com/bfs/new_dyn/214522b0114b228b08cc49bb910a3b8f438160221.png"},
		{name:"error",src:"https://i0.hdslb.com/bfs/new_dyn/306670c6a4de462d73559f325765112a438160221.png"},
		{name:"exception",src:"https://i0.hdslb.com/bfs/new_dyn/b61ebae931c4c57525230810917c8a4b438160221.png"},
		{name:"forbidden",src:"https://i0.hdslb.com/bfs/new_dyn/3fbb0fbd0c05b1e51bea15f79f33bdd5438160221.png"},
		{name:"gone",src:"https://i0.hdslb.com/bfs/new_dyn/ae02a700974258bebd514e4c36498521438160221.png"},
		{name:"internal error",src:"https://i0.hdslb.com/bfs/new_dyn/65498813a22ec47212c9d657c9663949438160221.png"},
		{name:"lock",src:"https://i0.hdslb.com/bfs/new_dyn/12e957c0a3fce4e79fdf4a4eb7229a83438160221.png"},
		{name:"loop",src:"https://i0.hdslb.com/bfs/new_dyn/a8e22f45fbd2120fbddb5d0042c973ad438160221.png"},
		{name:"not found",src:"https://i0.hdslb.com/bfs/new_dyn/1c35182f323f8fb4262b023336f5d015438160221.png"},
		{name:"range error",src:"https://i0.hdslb.com/bfs/new_dyn/78861fb671d1e02f2a99a219cb2d938a438160221.png"},
		{name:"reference error",src:"https://i0.hdslb.com/bfs/new_dyn/0384bfa39183dc9561b22f91f07eed42438160221.png"},
		{name:"reset",src:"https://i0.hdslb.com/bfs/new_dyn/a534f0ade192e3e900df6d43c5d2285f438160221.png"},
		{name:"runtime error",src:"https://i0.hdslb.com/bfs/new_dyn/5066796cd0f03d7215c0579d15b0e24e438160221.png"},
		{name:"syntax error",src:"https://i0.hdslb.com/bfs/new_dyn/0b77f422c0b96d10d8df2c6858fda9aa438160221.png"},
		{name:"timeout",src:"https://i0.hdslb.com/bfs/new_dyn/aaf2f9c67fddfb999192a9dbf0531592438160221.png"},
		{name:"type error",src:"https://i0.hdslb.com/bfs/new_dyn/744e18e88eafa3d0ed01d4108152bd83438160221.png"},
		{name:"warning",src:"https://i0.hdslb.com/bfs/new_dyn/8a2191db402d8eeb9f867d56ee09db1d438160221.png"},
		{name:"不允许",src:"https://i0.hdslb.com/bfs/new_dyn/823ac170bb530e0549868ffcb535ec65438160221.png"},
		{name:"超时",src:"https://i0.hdslb.com/bfs/new_dyn/a03a1fa79d25c8b64b6c04a1161effef438160221.png"},
		{name:"错误",src:"https://i0.hdslb.com/bfs/new_dyn/a07428d5a8bb0f56d261ec0a8df32fde438160221.png"},
		{name:"范围错误",src:"https://i0.hdslb.com/bfs/new_dyn/07d2473f4a40e8f0f95565fe370ed73e438160221.png"},
		{name:"故障",src:"https://i0.hdslb.com/bfs/new_dyn/b34614afe7665f5938ea46ae4496f56c438160221.png"},
		{name:"警告",src:"https://i0.hdslb.com/bfs/new_dyn/74a74785d23fe481ea78a1aa1841f6b8438160221.png"},
		{name:"类型错误",src:"https://i0.hdslb.com/bfs/new_dyn/f5cd24d65b296e59722211fafbc051ab438160221.png"},
		{name:"连接错误",src:"https://i0.hdslb.com/bfs/new_dyn/2ce8b27b0e80ac3c94c90fa0cdfca910438160221.png"},
		{name:"内部错误",src:"https://i0.hdslb.com/bfs/new_dyn/1fea52bdbfb104071c25d1d9a93cabb2438160221.png"},
		{name:"数据结束",src:"https://i0.hdslb.com/bfs/new_dyn/eda97c185dded404541de35d04f4e933438160221.png"},
		{name:"锁定",src:"https://i0.hdslb.com/bfs/new_dyn/62565360040004eb09b8a014cc1706c6438160221.png"},
		{name:"无权限",src:"https://i0.hdslb.com/bfs/new_dyn/d39081cd46b6f5b05d55ab807351e4f2438160221.png"},
		{name:"无效",src:"https://i0.hdslb.com/bfs/new_dyn/6e4895cb1f1108d08fff10183cd35020438160221.png"},
		{name:"无信号",src:"https://i0.hdslb.com/bfs/new_dyn/d41387b70caead2d581889dbed2ee9ca438160221.png"},
		{name:"信号中断",src:"https://i0.hdslb.com/bfs/new_dyn/a54c49e4fc9823510cb5809c936900eb438160221.png"},
		{name:"循环",src:"https://i0.hdslb.com/bfs/new_dyn/d196eff942ddcbcb1583db7e4070ba0a438160221.png"},
		{name:"异常",src:"https://i0.hdslb.com/bfs/new_dyn/d603a7f1fd6cf876e1b56605aa3be076438160221.png"},
		{name:"引用错误",src:"https://i0.hdslb.com/bfs/new_dyn/d7f121021e1d179beafd7c230a5cd3af438160221.png"},
		{name:"语法错误",src:"https://i0.hdslb.com/bfs/new_dyn/fa9467a6446be6a35fcb3d3c1d91a479438160221.png"},
		{name:"中断",src:"https://i0.hdslb.com/bfs/new_dyn/2ad6d9e942ab78e2b7f486d2ba4a9390438160221.png"},
		{name:"重置",src:"https://i0.hdslb.com/bfs/new_dyn/edf839c2bb09f5e601b50e058618257c438160221.png"},
	]
</script>
<script data-info="生成图片">
	const id_sucai=document.getElementById("sucai");
	const content=document.getElementById("body_content");
	for(const i of imglistd){
		const l=new Image();
		l.referrerPolicy="no-referrer";
		l.loading="lazy";
		l.alt=i.name;
		l.src=i.src+"";
		content.append(l);
	}
</script>
