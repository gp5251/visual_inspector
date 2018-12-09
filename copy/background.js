function setAppState(tabId, state) {
    chrome.browserAction.setPopup({
        tabId: tabId,
        popup: state ? 'popup.html': 'popup_loading_failed.html'
    });

	chrome.browserAction.setIcon({
		tabId: tabId,
		path: state ? 'icon.png': 'icon_gray.png'
	});
}

function send(data, cb) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage( tabs[0].id, data, function(response) {
			cb && cb(response);
			console.log('get response', response);
		});
	});
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') {
    	setTimeout(()=>{
			chrome.browserAction.getPopup({tabId}, function (re){
				if (re && ~re.indexOf('popup_loading.html')) setAppState(tabId, false);
			});
		}, 500);

    	send({
			type: 'getAppStateFromBg'
		}, response => {
    		if (response && response.type === 'getAppStateFromBg') {
    			setAppState(tabId, true)
			}
		})
    }
});

chrome.runtime.onMessage.addListener((request, sender) => {
	if (request.type === 'appLoaded' && sender.tab) {
		setAppState(sender.tab.id, true);
	} else if (request.type === 'pageConnected') {
		setAppState(request.data.tabId, true);
	}
});
