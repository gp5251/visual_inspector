chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if(~tab.url.indexOf ("http")){
        chrome.pageAction.show(tabId);
    }else{
        chrome.pageAction.hide(tabId);
    }
});
