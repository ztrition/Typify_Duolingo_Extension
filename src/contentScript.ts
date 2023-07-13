const TextAreaClassName = 'duolingo-text-box';
const KeyboardToggleElementAttribute = '[data-test="player-toggle-keyboard"]';
const TranslateElementAttribute = '[data-test="challenge challenge-translate"]';
const SpeakElementXPath = '//span[text()="Click to speak"]';
const ButtonXPath = '[data-test="player-next"]';

let loadingInterval: number = 0;

const ShowTextArea = async function () {

    console.log("Init");
    const res = await fetch(chrome.runtime.getURL("./TypingTextArea.html"));
    const html = await res.text();
    document.querySelector('div[data-test="word-bank"]')?.parentElement?.insertAdjacentHTML('beforeend', html);
}

const messageListener = async (message: any, sender: chrome.runtime.MessageSender, sendResponse: any) => {
    if(message['checkIfShouldShow']) {
        if (shouldShow()) {
            await ShowTextArea();
        }
    } else if(message['unloadSelf']) {
        unloadSelf();
    }
};

window.addEventListener('keydown', keyKiller, true);
window.addEventListener('click', checkButtonPress, true);
chrome.runtime.onMessage.addListener(messageListener)
loadingInterval = window.setInterval(waitUntilLoadingCompletes, 100);

function checkButtonPress(this: Element, ev: Event) {
    let element = ev.target as Element;
    let dataTestAttribute = element.attributes?.getNamedItem('data-test') ?? null;
    if (dataTestAttribute !== null) {
        try {
            
            const buttonSpan = element.querySelector('span') as Element;
            
            let text = buttonSpan.innerHTML.toLowerCase();
            if (text.includes('continue')) {
                
                console.log("HERE");
                if (shouldShow()) {
                    ShowTextArea();
                }
            }
        } catch (e) {
            
        }
    }
}

function keyKiller(this: Window, ev: KeyboardEvent) {
    console.log(ev);
    if (ev.key === 'Enter') {
        ev.preventDefault();
        ev.stopPropagation();
        let htmlElement = this.document.querySelector(ButtonXPath) as HTMLElement;
        htmlElement.click();
    }
}


function waitUntilLoadingCompletes() {
    let translateElement = document.querySelector(TranslateElementAttribute);
    if (!!translateElement) {

        clearInterval(loadingInterval);
    }
}

function shouldShow(): boolean {

    //If the toggle keyboard button exists don't use the extension text area
    if (!!document.querySelector(KeyboardToggleElementAttribute)) {
        dontShow();
        return false;
    }

    //If its a speaking exercise remove element
    if (!!document.evaluate(SpeakElementXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue) {
        dontShow();
        return false;
    }

    //If the extension text area already exists don't re-add it to the dom
    if (!!document.querySelector(`.${TextAreaClassName}`)) {
        return false;
    }

    //All checks passed, return true;
    return true
}

function dontShow() {

    let textAreaElement = document.querySelector(`.${TextAreaClassName}`);

    //if the element exists, remove it
    try {
        if (!!textAreaElement) {
            textAreaElement.remove();
        }
    } catch (e) {
        console.log("Exception");
    }
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

function unloadSelf() {
    window.removeEventListener('keydown', keyKiller, true);
    window.removeEventListener('click', checkButtonPress, true);
    chrome.runtime.onMessage.removeListener(messageListener);
}

