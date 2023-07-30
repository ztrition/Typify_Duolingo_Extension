
const Urls: string[] = ['duolingo.com/lesson', 'duolingo.com/mistakes-review'];
let initScript = true;
let loaded = false;
var activeTabId = 0;

chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
    if (changeInfo.status == 'complete' && tab.active) {
        let tab = await chrome.tabs.query({ active: true, currentWindow: true });
        for (let url of Urls) {
            if (tab[0].url?.includes(url) && initScript) {
                activeTabId = tabId;

                if (initScript) {

                    await chrome.scripting.executeScript({
                        files: ['contentScript.js'],
                        target: { tabId: tabId },
                    });

                    loaded = true;
                }

                await chrome.tabs.sendMessage(tab[0].id, { checkIfShouldShow: true });

                return;
            }
        }
        if (loaded) {

            await chrome.tabs.sendMessage(tab[0].id, { unloadSelf: true });

            loaded = false;

        }
    }
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(request['initScript']) {
            initScript = request['initScript'];
        }
    }
)


// chrome.webRequest.onCompleted.addListener(function (details) {
//     if (details.tabId !== -1) {
//         chrome.scripting.executeScript({
//             files: ['contentScript.js'],
//             target: { tabId: details.tabId }
//         });
//     }
// }, { urls: ["https://excess.duolingo.com/batch"] });

