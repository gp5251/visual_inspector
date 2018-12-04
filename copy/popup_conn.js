const $tip = document.getElementById('tip');
if ($tip.innerHTML === 'connectFail') {
	$tip.innerHTML = chrome.i18n.getMessage("connectFail");
} else {
	$tip.innerHTML = chrome.i18n.getMessage("connecting");

	sendToContent({
		type: 'getAppStateFromPopup'
	})
		.then(([response, tabId]) => {
			if (response && response.type === 'getAppStateFromPopup') {
				$tip.innerHTML = chrome.i18n.getMessage("connectSucc");
				return sendToBg({
					type: 'pageConnected',
					data: { tabId }
				})
			}
		});

}

function sendToBg(data) {
	return new Promise(function (resolve){
		chrome.runtime.sendMessage(data, function(response) {
			resolve(response)
		});
	})
}

function sendToContent(data) {
	return new Promise(function (resolve){
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage( tabs[0].id, data, function(response) {
				resolve([response, tabs[0].id]);
			});
		});
	})
}

