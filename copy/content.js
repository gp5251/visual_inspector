import app from "./app";

chrome.runtime.onMessage.addListener((request, sender, cb) => {
	let {type, data} = request;

	switch (type) {
		case 'run':

			break;

		case 'quit':
			break;

		case 'changeLang':
	}
});

chrome.storage.local.get(['_viData', '_viDataUrl', '_url'], ({_viData, _viDataUrl, _url}) => {
	if (_url === location.href && _viData && _viDataUrl) {
		// for realtime
		loadPlugin();
	}
});

function loadPlugin() {
	let script = document.createElement('script');
	script.onload = function (){
		script.remove();
		script = null;
	}
	script.src = chrome.extension.getURL('index.js');
	(document.head||document.documentElement).appendChild(script);
}
