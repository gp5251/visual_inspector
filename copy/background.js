const tids = {};

function loadFailed(tabId) {
    chrome.browserAction.setPopup({
        tabId: tabId,
        popup: 'popup_loading_failed.html'
    });
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if(tab.url.indexOf ("http") === -1) {
        loadFailed(tabId);
        return;
    }

    if (changeInfo.status === 'complete') {
        if (tids[tabId]) return;
        tids[tabId] = setTimeout(()=>loadFailed(tabId), 1000);
    }
});

chrome.runtime.onMessage.addListener((request, sender, cb) => {
    let {type} = request;

    if (type === 'pluninLoaded') {
        if (tids[sender.tab.id]) clearTimeout(tids[sender.tab.id]);
        else tids[sender.tab.id] = true;

        chrome.browserAction.setIcon({
            tabId: sender.tab.id,
            path: 'icon.png'
        });
        chrome.browserAction.setPopup({
            tabId: sender.tab.id,
            popup: 'popup.html'
        });
    }
});
