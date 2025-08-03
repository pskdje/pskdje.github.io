// ==UserScript==
// @name         拦截哔哩哔哩搜索框默认文本
// @namespace    https://pskdje.github.io/static/tools/tm_js/
// @version      0.0.1
// @description  通过拦截请求来阻止哔哩哔哩**引战搜索框文字
// @author       dsjofh
// @match        http*://*.bilibili.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bilibili.com
// @run-at       document-start
// @grant        none
// @require      https://scriptcat.org/lib/637/1.4.3/ajaxHooker.js#sha256=y1sWy1M/U5JP1tlAY5e80monDp27fF+GMRLsOiIrSUY=
// @downloadURL  https://pskdje.github.io/static/tools/tm_js/no_bpbp_sac_df_req.user.js
// @supportURL   https://pskdje.github.io/static/tools/tm_js/
// @license      CC0
// @noframes
// ==/UserScript==

(function() {
	'use strict';

	ajaxHooker.filter([// 注意: 使用的库对url的过滤是相对url
		{url:/(?:https?\:)?\/\/api\.bilibili\.com\/\/?x\/web-interface\/(?:wbi\/)?search\/default/}
	]);
	ajaxHooker.hook(req=>{
		req.abort=true;
		console.info("Abort: ",req.url);
		//ajaxHooker.unhook();
	});
})();
