function setAppState(tabId, state) {
    chrome.action.setPopup({
        tabId: tabId,
        popup: state ? 'popup.html': 'popup_loading_failed.html'
    });

	chrome.action.setIcon({
		tabId: tabId,
		path: state ? 'icon.png': 'icon_gray.png'
	});
}

function send(tabId, data, cb) {
    chrome.tabs.sendMessage(tabId, data, function(response) {
        if (chrome.runtime.lastError) {
            // console.warn(chrome.runtime.lastError.message);
            return;
        }
        cb && cb(response);
    });
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') {
        // 尝试连接 Content Script
    	send(tabId, {
			type: 'getAppStateFromBg'
		}, response => {
    		if (response && response.type === 'getAppStateFromBg') {
    			setAppState(tabId, true)
			}
		});
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.type === 'appLoaded' && sender.tab) {
		setAppState(sender.tab.id, true);
	} else if (request.type === 'pageConnected') {
		setAppState(request.data.tabId, true);
	}
});
