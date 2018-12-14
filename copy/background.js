const bgApp = function (){
	return {
		run() {
			chrome.browserAction.onClicked.addListener(() => {
				getCurTab().then(tab => {
					let tabId = tab.id;
					chrome.browserAction.getTitle({tabId}, re => {
						if (re === 'Visual Inspector is off') {
							setAppState(tabId, true);
						} else {
							setAppState(tabId, false);
						}

						chrome.tabs.executeScript(null, {file: 'index.js'});
					});
				})
			});

			chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
				if (changeInfo.status === 'complete') {
					chrome.storage.local.get(['_viData', '_viDataUrl', '_url'], ({_viData, _viDataUrl, _url}) => {
						if (_url === tab.url && _viData && _viDataUrl) {
							chrome.tabs.executeScript(null, {file: 'index.js'});
						// } else {
							// chrome.storage.local.remove(['_viData', '_url', '_viDataUrl']);
						}
					});
				}
			});
		}
	};

	function setAppState(tabId, state) {
		if (state) {
			chrome.browserAction.setIcon({
				tabId: tabId,
				path: 'icon.png'
			});
			chrome.browserAction.setTitle({
				tabId: tabId,
				title: 'Visual Inspector is on'
			});
		} else {
			chrome.browserAction.setIcon({
				tabId: tabId,
				path: 'icon_gray.png'
			});
			chrome.browserAction.setTitle({
				tabId: tabId,
				title: 'Visual Inspector is off'
			});
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