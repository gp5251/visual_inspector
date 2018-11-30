import Vue from 'vue';
import App from './Vue/App';
import i18n, {setupLang} from "./locales";

const app = function () {
	let vm, 
		uiCreated = false,
		appState = 'stopped',
		cspBlockedBlob = -1;

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

		async getImgSrc(dataUrl) {
			if (cspBlockedBlob === 1) return dataUrl;
			else if (cspBlockedBlob === 0) {
				let blobObj = this.dataURLtoBlob(dataUrl);
				return window.URL.createObjectURL(blobObj);
			}

			try {
				let d = await this.checkCSPForGlob(dataUrl);
				cspBlockedBlob = 0;
				return d;
			} catch (err) {
				cspBlockedBlob = 1;
				return dataUrl;
			}
		},

		checkCSPForGlob(dataUrl) {
			return new Promise((resolve, reject) => {
				let handleCspOnce = function(e) {
					if (e.blockedURI === 'blob' && e.violatedDirective === 'img-src') reject();
					document.removeEventListener("securitypolicyviolation", handleCspOnce);
					div.remove();
				};
				let blobObj = this.dataURLtoBlob(dataUrl);
				let url = window.URL.createObjectURL(blobObj);
				let div = document.createElement('div');
				div.style.cssText=`
					display:none;
					width: 100px;
					height: 100px;
					background: url(${url});
				`;
				document.body.appendChild(div);
				document.addEventListener("securitypolicyviolation", handleCspOnce);
				setTimeout(function (){
					div.remove();
				    resolve(url)
				}, 200);
			})
		},

        dataURLtoBlob(dataUrl) {
            let arr = dataUrl.split(','), mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
            while (n--) u8arr[n] = bstr.charCodeAt(n);
            return new Blob([u8arr], {type: mime});
        },

		async run({dataUrl, ...data}) {
			let src = await this.getImgSrc(dataUrl);

            if (vm) {
                vm.src = src;
			} else {
                let rootEl = document.createElement('div');
                document.body.appendChild(rootEl);
                this.createUI(src, data).$mount(rootEl);
			}

            chrome.storage.local.set({_viDataUrl: dataUrl, _url: location.href})
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
						cspBlockedBlob === 0 && window.URL.revokeObjectURL(vm.src);
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

