import Vue from 'vue';
import App from './Vue/App';

import iView from 'iview';
// import {Button, Select, RadioGroup, Radio, Input} from 'iview';
import 'iview/dist/styles/iview.css';


// [Button, Select, RadioGroup, Radio, Input].forEach(comp => {
//     Vue.component(comp.name, comp);
// })

Vue.use(iView);


const app = function () {
	let vm, 
		uiCreated = false,
		appState = 'stopped';
	return {
		init() {
			chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
			    // console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension", 'data:', request);
			    // switch (request.type) {
			    //     case 'run':
			    //     	this.run();
			    //         break;
			    //     case 'quit':
				//         this.quit();
			    //         break;
			    //     default:
			    //         console.log('not handled', request);
			    // }

                if (request.type === 'insertImg') {
                    this.run(request.payload);

                    // let blobObj = this.dataURLtoBlob(request.payload.dataUrl);
                    // let url = URL.createObjectURL(blobObj);
                    // console.log(url)
				}
			    return true;
		    });
		},

		getImgSrc(dataUrl) {
            let blobObj = this.dataURLtoBlob(dataUrl);
            return URL.createObjectURL(blobObj);
		},

        dataURLtoBlob(dataUrl) {
            let arr = dataUrl.split(','), mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
            while (n--) u8arr[n] = bstr.charCodeAt(n);
            return new Blob([u8arr], {type: mime});
        },

		run({dataUrl}) {
			let src = this.getImgSrc(dataUrl);
            if (vm) {
                vm.src = src;
			} else {
                let rootEl = document.createElement('div')
                document.body.appendChild(rootEl);
                this.createUI(src).$mount(rootEl);
			}
		},

		quit() {
			if (appState === 'running') vm.$destroy();
		},

		createUI(src) {
			if (!uiCreated) {
				vm = new Vue({
				    // render: h => h(App),
					data: { src },
					template: ` <App :src = "src" /> `,
				    destroyed() {
				    	uiCreated = false;
						appState = 'stopped';
						vm.$el.remove();
				    },
				    created() {
				    	uiCreated = true;
						appState = 'running';
				    },
					components: {App}
				});
			}

			return vm;
		}
	}
}();

app.init();

