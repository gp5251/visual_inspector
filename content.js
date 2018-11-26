import Vue from 'vue';
import App from './Vue/App';
import i18n, {setupLang} from "./locales";

const app = function () {
	let vm, 
		uiCreated = false,
		appState = 'stopped',
		useBlob;

	return {
		init() {
			chrome.runtime.onMessage.addListener((request, sender, cb) => {
				let {type, data} = request;

				switch (type) {
					case 'insertImg':
                        delete sessionStorage._viData;
                        delete sessionStorage._viDataUrl;
                        if (vm && vm.src) useBlob && window.URL.revokeObjectURL(vm.src);

                        this.run(data);
                        cb({type, state: true});
                        break;
                    case 'quit':
                        this.quit();
                        cb({type, state: false});
                        break;
					case 'getAppStateFromBg':
						cb({type, state: true});
						break;
                    case 'appState':
                    	if (data.lang) setupLang(data.lang);
                        cb({type, data: {state: appState}});
                        break;
					case 'changeLang':
						setupLang(data.lang);
						cb({type, data: {lang: data.lang}});
                }

			    return true;
		    });

			this.send({type: 'appLoaded'});

            if (sessionStorage._viData && sessionStorage._viDataUrl) {
                let viData = JSON.parse(sessionStorage._viData);
                let dataUrl = sessionStorage._viDataUrl;
                this.getLang().then(lang => {
                	setupLang(lang);
					this.run({dataUrl, ...viData});
				})
			}

			this.checkCSPForGlob().then(()=>{
				useBlob = true;
			}, ()=>{
				useBlob = false;
			});
        },

		getLang() {
			return new Promise(resolve => {
				chrome.storage.local.get({lang: 'cn'}, data=>{
					resolve(data.lang);
				});
			})
		},

		getImgSrc(dataUrl) {
			if (useBlob) {
				let blobObj = this.dataURLtoBlob(dataUrl);
				return URL.createObjectURL(blobObj);
			} else {
				return dataUrl;
			}
		},

		checkCSPForGlob() {
			return new Promise((resolve, reject) => {
				let dataUrl = document.createElement('canvas').toDataURL();
				let blobUrl = this.dataURLtoBlob(dataUrl);
				let imgSrc = window.createObjectURL(blobUrl);
				let img = new Image;
				img.onerror = reject;
				img.onload = resolve;
				img.src = imgSrc;
			});
		},

        dataURLtoBlob(dataUrl) {
            let arr = dataUrl.split(','), mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
            while (n--) u8arr[n] = bstr.charCodeAt(n);
            return new Blob([u8arr], {type: mime});
        },

		run({dataUrl, ...data}) {
			let src = this.getImgSrc(dataUrl);
            if (vm) {
                vm.src = src;
			} else {
                let rootEl = document.createElement('div');
                document.body.appendChild(rootEl);
                this.createUI(src, data).$mount(rootEl);
			}

            sessionStorage._viDataUrl = dataUrl;
		},

		quit() {
			if (appState === 'running') vm.destroy();
		},

		createUI(src, restoredData = {}) {
			if (!uiCreated) {
				vm = new Vue({
					data: {src, restoredData},
					template: `<App :class="lang" :src = "src" :restoredData="restoredData" />`,
					computed: {
						lang() {
							return 'vi_lang_' + this.$i18n.locale
						}
					},
					i18n,
				    beforeDestroy() {
				    	uiCreated = false;
						appState = 'stopped';
						useBlob && window.URL.revokeObjectURL(vm.src);
						vm.$el.remove();
				    },
				    created() {
				    	uiCreated = true;
						appState = 'running';
				    },
                    methods: {
						destroy() {
							this.$destroy();
							vm = null;
						}
					},
					components: {App}
				});
			}

			return vm;
		},

		send(data) {
			chrome.runtime.sendMessage(data);
		}
	}
}();

app.init();

