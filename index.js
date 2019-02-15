import Vue from 'vue';
import App from './Vue/App';
import Tip from "./Vue/Tip.plugin";
import i18n, {setupLang} from "./locales";

Vue.use(Tip);

const app = function () {
	let vm,
		isRunning = !!window._Visual_Inspector;

	return {
		getLang() {
			return new Promise(resolve => {
				chrome.storage.local.get({lang: 'cn'}, data => {
					resolve(data.lang);
				});
			})
		},

		run(data = {}) {
			if (isRunning) return;

			let {dataUrl, viData} = data;
			vm = new Vue({
				el: document.createElement('div'),
				computed: {
					lang() {
						return 'vi_lang_' + this.$i18n.locale
					}
				},
				render(h) {
					return h(App, {
						props: {
							['class']: this.lang,
							restoredData: viData,
							dataUrl
						}
					})
				},
				i18n,
				beforeDestroy() {
					isRunning = false;
					delete vm.$el._app;
					delete window._Visual_Inspector;
					vm.$el.remove();
				},
				mounted() {
					isRunning = true;
					window._Visual_Inspector = app;
					this.$el._app = app; // todo
				}
			});

			document.body.appendChild(vm.$el);
		},

		quit() {
			vm.$destroy();
			vm = null;
		},

		checkRealtime() {
			return new Promise((resolve, reject) => {
				chrome.storage.local.get(['_viData', '_viDataUrl', '_url'], ({_viData, _viDataUrl, _url}) => {
					if (_url === location.href && _viData && _viDataUrl) {
						let viData = JSON.parse(_viData);
						let dataUrl = _viDataUrl;
						resolve({dataUrl, viData});
					} else {
						reject()
					}
				});
			})
		},

		handleConfictWhenUpdate() {
			let oldApp = document.querySelector('.Visual_Inspector');
			if (oldApp) oldApp.remove();
		}
	}
}();

if (window._Visual_Inspector) {
	window._Visual_Inspector.quit();
} else {
	app.handleConfictWhenUpdate();
	app.checkRealtime()
		.then(result => {
			app.run(result)
		}, () => {
			app.run();
		});
}



