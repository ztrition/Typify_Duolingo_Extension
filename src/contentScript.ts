const TextAreaClassName = 'duolingo-text-box';
const KeyboardToggleElementAttribute = '[data-test="player-toggle-keyboard"]';
const TranslateElementAttribute = '[data-test="challenge challenge-translate"]';
const SpeakElementXPath = '//span[text()="Click to speak"]';
const ButtonXPath = '[data-test="player-next"]'

let loadingInterval: number = 0;
let initEventListener = false;

const ShowTextArea = async function () {

    console.log('called');
    const res = await fetch(chrome.runtime.getURL("./TypingTextArea.html"));
    const html = await res.text();
    document.querySelector('div[data-test="word-bank"]')?.parentElement?.insertAdjacentHTML('beforeend', html);


    if(initEventListener) {
        console.log("Init");
        window.addEventListener('keydown', keyKiller, true);
        window.addEventListener('click', checkButtonPress, true);
    }

    console.log('HERE');

}

const messageListener = (message: { initEventListener: boolean }, sender: chrome.runtime.MessageSender, sendResponse: any) => {
    initEventListener = message.initEventListener;
    loadingInterval = window.setInterval(waitUntilLoadingCompletes, 100);
    chrome.runtime.onMessage.removeListener(messageListener);
  };

chrome.runtime.onMessage.addListener(messageListener);

function waitUntilLoadingCompletes() {
    let translateElement = document.querySelector(TranslateElementAttribute);
    if (!!translateElement) {

        clearInterval(loadingInterval);

        if (shouldShow()) {
            ShowTextArea();
        }
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

async function checkButtonPress(this: Element, ev: Event) {
    let element = ev.target as Element;
    let dataTestAttribute = element.attributes?.getNamedItem('data-test') ?? null;
    if(dataTestAttribute !== null) {

        const buttonSpan = element.querySelector('span') as Element;
        
        let text = buttonSpan.innerHTML.toLowerCase();
        if(text.includes('continue')) {
            await sleep(750);
            
            if(shouldShow()) {
                await ShowTextArea();
            }
        }
    }
}

function keyKiller(this: Window, ev: KeyboardEvent) {
    console.log(ev);
    if(ev.key === 'Enter') {
        ev.preventDefault();
        ev.stopPropagation();
        let htmlElement = this.document.querySelector(ButtonXPath) as HTMLElement;
        htmlElement.click();
    }
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
