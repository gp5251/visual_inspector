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
	chrome.tabs.query({active: true, currentWindow: true}, tabs => {
		chrome.tabs.sendMessage(tabs[0].id, data, response => {
			cb && cb(response);
			console.log('get response', response);
		});
	});
}

chrome.browserAction.onClicked.addListener(() => {
	chrome.tabs.query({active: true, currentWindow: true}, tabs => {
		let tabId = tabs[0].id;
		chrome.browserAction.getPopup({tabId}, re => {
			if (re && ~re.indexOf('popup_loading.html')) {
				setAppState(tabId, true);
			} else {
				setAppState(tabId, false);
			}
		});
	});
});
