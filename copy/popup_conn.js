const $tip = document.getElementById('tip');

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

sendToContent({
		type: 'getAppStateFromPopup'
	})
	.then(([response, tabId]) => {
		if (response && response.type === 'getAppStateFromPopup') {
			$tip.innerHTML = 'Connected success!';
			return sendToBg({
				type: 'pageConnected',
				data: { tabId }
			})
		}
	});

