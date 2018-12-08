import Tip from "./Tip";

export default {
	install(Vue) {
		let $tip;
		Vue.$tip = Vue.prototype.$tip = function(tip){
			let $TipPlugin = Vue.extend(Tip);
			if (!$tip) {
				$tip = new $TipPlugin({
					el: document.createElement('div')
				});
				document.body.appendChild($tip.$el);
			}

			$tip.tip = tip;
		}
	}
}
