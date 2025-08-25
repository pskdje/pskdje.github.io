/* doc.js 提供减轻文档编写工作量的自定义元素
 */

function DCE(tag){return document.createElement(tag)}

class DocsShowURLElement extends HTMLElement {// 将内容视作URL对其添加链接
	connectedCallback(){
		const E=DCE,shadow=this.attachShadow({mode:"open"});
		const s=E("style"),a=E("a"),u=E("slot");
		s.textContent="a {color:var(--docs-color,black)}";
		a.append(u);
		shadow.append(s,a);
		u.textContent="about:blank";
		function change(){
			let e=u.assignedNodes()[0];
			if(!e)return;
			a.href=e.textContent;
		}
		u.addEventListener("slotchange",change);
		Object.defineProperty(this,"uri",{
			enumerable:true,
			get(){
				return a.href;
			}
		});
	}
}

(function add(){
	function add(n,e,o){
		customElements.define(n,e,o);
	}
	if(typeof window.customElements!=="object"){
		console.error("无法使用自定义元素，部分内容可能无法加载。");
		return;
	}
	add("show-url",DocsShowURLElement);
})();
