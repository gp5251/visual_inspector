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
			console.log('response', response);
		});
	});
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if(tab.url.indexOf ("http") === -1) {
        setAppState(tabId, false);
        return;
    }

    if (changeInfo.status === 'complete') {
    	send({
			type: 'getAppStateFromBg'
		}, response => {
    		if (response && response.type === 'getAppStateFromBg') {
    			setAppState(tabId, true)
			}
		})
    }
});
