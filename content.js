import Vue from 'vue';
import App from './Vue/App';

const app = function () {
	let vm, 
		uiCreated = false,
		appState = 'stopped';
	return {
		init() {
			chrome.runtime.onMessage.addListener((request, sender, cb) => {
				let {type} = request;

				switch (type) {
					case 'insertImg':
                        delete sessionStorage._viData;
                        delete sessionStorage._viDataUrl;

                        this.run(request.payload);
                        cb({type, state: true});
                        break;
                    case 'quit':
                        this.quit();
                        cb({type, state: false});
                        break;
                    case 'getAppState':
                        cb({type, state: appState === 'running'});
                }

			    return true;
		    });

            chrome.runtime.sendMessage({type: "pluninLoaded"});

            if (sessionStorage._viData && sessionStorage._viDataUrl) {
                let viData = JSON.parse(sessionStorage._viData);
                let dataUrl = sessionStorage._viDataUrl;
                this.run({dataUrl, ...viData});
			}
        },

		getImgSrc(dataUrl) {
            let blobObj = this.dataURLtoBlob(dataUrl);
            return URL.createObjectURL(blobObj);
            // return dataUrl;
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
					data: { src, restoredData },
					template: `<App :src = "src" :restoredData="restoredData" />`,
				    destroyed() {
				    	uiCreated = false;
						appState = 'stopped';
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
		}
	}
}();

app.init();

