import Vue from 'vue';
import App from './Vue/App';
import Tip from "./Vue/Tip.plugin";
import i18n, {setupLang} from "./locales";

Vue.use(Tip);

const app = function () {
	let vm,
		isRunning = !!document.documentElement._Visual_Inspector;

	return {
		getLang() {
			return new Promise(resolve => {
				chrome.storage.local.get({lang: 'cn'}, data=>{
					resolve(data.lang);
				});
			})
		},

		run(dataUrl, viData) {
			this.createUI(dataUrl, viData);
			document.documentElement._Visual_Inspector = app;
		},

		quit() {
			vm.destroy();
			delete document.documentElement._Visual_Inspector;
		},

		createUI(dataUrl = '', restoredData = {}) {
			if (isRunning) return;

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
							restoredData,
							dataUrl
						}
					})
				},
				i18n,
				beforeDestroy() {
					isRunning = false;
					// cspBlockedBlob === 0 && window.URL.revokeObjectURL(vm.src);
					vm.$el.remove();
				},
				created() {
					isRunning = true;
				},
				methods: {
					destroy() {
						this.$destroy();
						vm = null;
					}
				}
			});

			document.body.appendChild(vm.$el);
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
		}
	}
}();

app.checkRealtime()
	.then(result =>{
		app.run(result)
	}, ()=>{
		if (document.documentElement._Visual_Inspector) {
			document.documentElement._Visual_Inspector.quit();
		} else {
			app.run();
		}
	});



