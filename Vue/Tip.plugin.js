import Tip from "./Tip";

export default {
	install(Vue) {
		let $tip;
		Vue.$tip = Vue.prototype.$tip = function(tip){
			if (!$tip) {
				let $TipPlugin = Vue.extend(Tip);
				$tip = new $TipPlugin({
					el: document.createElement('div')
				});
				window.appRoot.shadowRoot.appendChild($tip.$el);
			}

			$tip.tip = tip;
		}
	}
}
