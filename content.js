import Vue from 'vue';
import App from './Vue/App';


const app = function () {
	let vm, 
		uiCreated = false,
		appState = 'stopped';
	return {
		init() {
			chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
			    // console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension", 'data:', request);
			    switch (request.type) {
			        case 'run':
			        	this.run();
			            break;
			        case 'stop':
				        this.stop();
			            break;
			        default:
			            console.log('not handled', request);
			    }
			    return true;
		    });
		},

		run() {
			if (appState === 'running') return;

			let rootEl = document.createElement('div')
            document.body.appendChild(rootEl);
			this.createUI().$mount(rootEl);
		},

		stop() {
			if (appState === 'running') vm.$destroy();
		},

		createUI() {
			if (!uiCreated) {
				vm = new Vue({
				    render: h => h(App),
				    destroyed() {
				    	uiCreated = false;
						appState = 'stopped';
						vm.$el.remove();
				    },
				    created() {
				    	uiCreated = true;
						appState = 'running';

						console.log('created');
				    }
				});
			}

			return vm;
		}
	}
}();

app.init();

