function setAppState(tabId, state) {
	if (state) {
		send({type: 'start'}, ()=>{
			chrome.browserAction.setIcon({
				tabId: tabId,
				path: 'icon.png'
			});
		})
	} else {
		send({type: 'quit'}, ()=>{
			chrome.browserAction.setIcon({
				tabId: tabId,
				path: 'icon_gray.png'
			});
		})
	}
}

function send(data, cb) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage( tabs[0].id, data, function(response) {
			cb && cb(response);
			console.log('get response', response);
		});
	});
}

chrome.browserAction.onClicked.addListener(() => {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		let tabId = tabs[0].id;
		chrome.browserAction.getPopup({tabId}, function (re){
			if (re && ~re.indexOf('popup_loading.html')) {
				setAppState(tabId, true);
			} else {
				setAppState(tabId, false);
			}
		});
	});
});
