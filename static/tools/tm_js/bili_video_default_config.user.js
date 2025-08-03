// ==UserScript==
// @name         设置哔哩哔哩播放器初始配置
// @namespace    https://pskdje.github.io/static/assets/tools/tm_js/
// @version      2025-08-03
// @description  通过提前注入配置来达到效果，若配置已存在将不注入。强制关闭自动播放推荐。
// @note         可自行修改配置来定义你想要的初始化配置。
// @note         （除了特殊情况，一般没人会用到这个吧）
// @author       dsjofh
// @match        http*://www.bilibili.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bilibili.com
// @run-at       document-start
// @grant        none
// @downloadURL  https://pskdje.github.io/static/assets/tools/tm_js/bili_video_default_config.user.js
// @supportURL   https://pskdje.github.io/static/assets/tools/tm_js/
// @license      CC0
// ==/UserScript==

(function() {
	'use strict';

	if(!localStorage.bpx_player_profile){
		localStorage.bpx_player_profile=JSON.stringify({// 播放器配置
			lastUnlogintrialView: 0,
			lastUid: 0,
			aiAnimationInfo: "[]",
			aiPromptToastInfo: "[]",
			media: {
				quality: 80,// 画质
				volume: 1,// 音量
				nonzeroVol: 1,
				hideBlackGap: true,// 隐藏黑边
				dolbyAudio: false,// dolby音频
				audioQuality: null,
				autoplay: false,// 自动播放
				handoff: 2,
				seniorTip: true,
				opEd: true,
				loudnessSwitch: 0,
				listLoop: false,// 列表循环
				loop: false,// 循环
			},
			dmSend: {// 弹幕发送配置
				upDm: false,// 是否使用UP主弹幕
				dmChecked: true
			},
			blockList: [],// 屏蔽列表
			dmSetting: {// 弹幕设置
				status: true,
				dmSwitch: true,
				aiSwitch: true,
				aiLevel: 3,
				preventshade: true,
				dmask: false,
				typeScroll: true,
				typeTopBottom: true,
				typeColor: true,
				typeSpecial: true,
				opacity: 0.8,
				dmarea: 100,
				speedplus: 1,
				fontsize: 0.5,
				fullscreensync: false,
				speedsync: true,
				fontfamily: "SimHei, 'Microsoft JhengHei'",
				bold: false,
				fontborder: 0,
				seniorModeSwitch: 0,
				dmdensity: 1,
				typeTop: true,
				typeBottom: true,
			},
			basEditorData: {},
			audioEffect: null,
			boceTimes: [],
			interaction: {
				rookieGuide: null,
				showedDialog: false
			},
			iswide: false,
			widesave: null,
			subtitle: {// 字幕设置
				fade: false,
				scale: true,
				fontsize: 1,
				opacity: 0.4,
				bilingual: false,
				color: "16777215",
				shadow: "0",
				position: "bottom-center"
			},
			progress: {
				precisionGuide: null,
				pbpstate: true,
				pinstate: false
			},
			panorama: true,
			ksInfo: {
				ts: 0,
				kss: null
			}
		});
		console.info("已设置默认播放器配置");
	}
	if(!localStorage.recommend_auto_play || localStorage.recommend_auto_play==="open"){
		localStorage.recommend_auto_play="close";
		console.info("已设置自动播放推荐为关闭");
	}
})();
