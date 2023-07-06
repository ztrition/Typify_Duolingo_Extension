
const Urls: string[] = ['duolingo.com/lesson', 'duolingo.com/mistakes-review'];
let initListeners = true;
var activeTabId = 0;

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status == 'complete' && tab.active) {

        let tabUrl = tab.url;
        for (let url of Urls) {
            if (tabUrl?.includes(url)) {
                console.log(changeInfo);
                activeTabId = tabId;
                chrome.scripting.executeScript({
                    files: ['contentScript.js'],
                    target: { tabId: tabId },
                });
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    const activeTab = tabs[0];
                    if (activeTab) {
                      chrome.tabs.sendMessage(activeTab.id, { initEventListener: initListeners });
                      initListeners = false;
                    }
                  });

            }
        }


    }
});

function sendArgument(initListeners: boolean) {
    chrome.tabs.sendMessage(activeTabId, { initEventListener: initListeners });
  }



// chrome.webRequest.onCompleted.addListener(function (details) {
//     if (details.tabId !== -1) {
//         chrome.scripting.executeScript({
//             files: ['contentScript.js'],
//             target: { tabId: details.tabId }
//         });
//     }
// }, { urls: ["https://excess.duolingo.com/batch"] });

