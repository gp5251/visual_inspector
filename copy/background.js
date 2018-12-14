const bgApp = function (){
	return {
		run() {
			chrome.browserAction.onClicked.addListener(() => {
				getCurTab().then(tab => {
					let tabId = tab.id;
					chrome.browserAction.getPopup({tabId}, re => {
						if (re && ~re.indexOf('popup_loading.html')) {
							setAppState(tabId, true);
						} else {
							setAppState(tabId, false);
						}
					});
				})
			});

			chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
				if (changeInfo.status === 'complete') {
					chrome.storage.local.get(['_viData', '_viDataUrl', '_url'], ({_viData, _viDataUrl, _url}) => {
						console.log(_url, tab.url);

						if (_url === tab.url && _viData && _viDataUrl) {
							chrome.tabs.executeScript(null, {file: 'index.js'});
						}
					});
				}
			});
		}
	};

	function setAppState(tabId, state) {
		if (state) {
			send({type: 'run'}, response => {
				if (response && response.type === 'run' && response.data)
					chrome.browserAction.setIcon({
						tabId: tabId,
						path: 'icon.png'
					});
			})
		} else {
			send({type: 'quit'}, response => {
				if (response && response.type === 'quit' && response.data)
					chrome.browserAction.setIcon({
						tabId: tabId,
						path: 'icon_gray.png'
					});
			})
		}
	}

	function send(data, cb) {
		getCurTab().then(tab => {
			chrome.tabs.sendMessage(tab.id, data, response => {
				cb && cb(response);
				console.log('get response', response);
			});
		})
	}

	function getCurTab(){
		return new Promise(resolve => {
			chrome.tabs.query({active: true, currentWindow: true}, tabs => {
				resolve(tabs[0])
			});
		})
	}
}();

bgApp.run();