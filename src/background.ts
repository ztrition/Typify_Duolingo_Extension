
const Urls: string[] = ['duolingo.com/lesson', 'duolingo.com/mistakes-review'];
let initScript = true;
let loaded = false;
var activeTabId = 0;

chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
    console.log("Background");
    if (changeInfo.status == 'complete' && tab.active) {
        let tabUrl = tab.url;
        for (let url of Urls) {
            if (tabUrl?.includes(url) && initScript) {
                activeTabId = tabId;

                if (initScript) {

                    await chrome.scripting.executeScript({
                        files: ['contentScript.js'],
                        target: { tabId: tabId },
                    });

                    initScript = false;
                    loaded = true;
                }

                await chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    const activeTab = tabs[0];
                    if (activeTab) {
                      chrome.tabs.sendMessage(activeTab.id, { checkIfShouldShow: true });
                    }
                  });
                return;
            }
        }
        if(loaded) {

            await chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
                const activeTab = tabs[0];
                if (activeTab) {
                  await chrome.tabs.sendMessage(activeTab.id, { unloadSelf: true });
                }
              });

            initScript = true;
            loaded = false;
        }
    }
});


// chrome.webRequest.onCompleted.addListener(function (details) {
//     if (details.tabId !== -1) {
//         chrome.scripting.executeScript({
//             files: ['contentScript.js'],
//             target: { tabId: details.tabId }
//         });
//     }
// }, { urls: ["https://excess.duolingo.com/batch"] });

