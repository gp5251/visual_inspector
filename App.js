import Vue from 'vue';
import App from './Vue/App';
import Tip from "./Vue/Tip.plugin";
import i18n, {setupLang} from "./locales";

Vue.use(Tip);

const app = function () {
	let vm, 
		appState = 'stopped';

	return {
		init() {
			chrome.runtime.onMessage.addListener((request, sender, cb) => {
				let {type, data} = request;

				switch (type) {
					case 'insertImg':
						chrome.storage.local.remove(['_viData', '_viDataUrl', '_url']);
                        if (vm && vm.src && cspBlockedBlob === 0) window.URL.revokeObjectURL(vm.src);

                        this.run(data);
                        cb({type, state: true});
                        break;
                    case 'quit':
                        this.quit();
                        cb({type, state: false});
                        break;
					case 'changeLang':
						setupLang(data.lang);
						cb({type, data: {lang: data.lang}});
                }

			    return true;
		    });

			chrome.storage.local.get(['_viData', '_viDataUrl', '_url'], ({_viData, _viDataUrl, _url}) => {
				if (_url === location.href && _viData && _viDataUrl) {
					let viData = JSON.parse(_viData);
					let dataUrl = _viDataUrl;
					this.getLang().then(lang => {
						setupLang(lang);
						this.run({dataUrl, ...viData});
					})
				}
			});


			// can not detect first ???
			// this.checkCSPForGlob()
			// 	.then(()=>{
			// 		console.log('not blocked')
			// 		cspBlockedBlob = false;
			// 	}, ()=>{
			// 		console.log('blocked')
			// 		cspBlockedBlob = true;
			// 	})
        },

		getLang() {
			return new Promise(resolve => {
				chrome.storage.local.get({lang: 'cn'}, data=>{
					resolve(data.lang);
				});
			})
		},

		run({dataUrl, ...data}) {
			// let src = await this.getImgSrc(dataUrl);
			vm = this.createUI(src, data);
			document.body.appendChild(vm.$el);
            // chrome.storage.local.set({_viDataUrl: dataUrl, _url: location.href})
		},

		quit() {
			vm.destroy();
		},

		createUI(src, restoredData = {}) {
			return new Vue({
				data: {src, restoredData},
				el: document.createElement('div'),
				// template: `<App :class="lang" :src = "src" :restoredData="restoredData"/>`,
				computed: {
					lang() {
						return 'vi_lang_' + this.$i18n.locale
					}
				},
				render(h) {
					return h(App, {
						props: {
							['class']: this.lang,
							restoredData: this.restoredData
						}
					})
				},
				i18n,
				beforeDestroy() {
					appState = 'stopped';
					cspBlockedBlob === 0 && window.URL.revokeObjectURL(vm.src);
					vm.$el.remove();
				},
				created() {
					appState = 'running';
				},
				methods: {
					destroy() {
						this.$destroy();
						vm = null;
					}
				}
			});
		}
	}
}();

export default app;


