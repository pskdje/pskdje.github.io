// load XTerminal.js
/* XTerminal.js
 * Home: https://xterminal.js.org/
 * Code: https://github.com/henryhale/xterminal
 * License: MIT
 */

(()=>{// 加载并预定义XTerminal的主题
	const basePath="https://unpkg.com/xterminal/dist/";
	const css=document.createElement("link"),
		js=document.createElement("script"),
		style=document.createElement("style");
	css.rel="stylesheet";
	css.href=basePath+"xterminal.css";
	js.src=basePath+"xterminal.umd.js";
	css.className=js.className="lib_XTerminal";
	style.textContent=`/* 修改 XTerminal 的部分样式 */
:root {
	--xt-bg: black;
	--xt-fg: #d0d0d0
}
`;
	style.className="theme_XTerminal";
	document.head.append(css,js,style);
})();
