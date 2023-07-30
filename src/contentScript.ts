const TextAreaClassName = 'duolingo-text-box';
const InputAreaClassName = 'duolingo-text-box-input';
const KeyboardToggleElementAttribute = '[data-test="player-toggle-keyboard"]';
const TranslateElementAttribute = '[data-test="challenge challenge-translate"]';
const SpeakElementXPath = '//span[text()="Click to speak"]';
const ButtonXPath = '[data-test="player-next"]';
const WordBankElementXPath = 'div[data-test="word-bank"]';

let isTypingQuestion = false;
let loadingInterval: number = 0;
let inputAreaElement: HTMLInputElement;

const ShowTextArea = async function () {

    const res = await fetch(chrome.runtime.getURL("./TypingTextArea.html"));
    const html = await res.text();
    document.querySelector(WordBankElementXPath)?.parentElement?.insertAdjacentHTML('beforeend', html);
    inputAreaElement= document.querySelector(`.${InputAreaClassName}`) as HTMLInputElement;
    inputAreaElement.focus();
}

const messageListener = async (message: any, sender: chrome.runtime.MessageSender, sendResponse: any) => {
    if (message['checkIfShouldShow']) {
        await chrome.runtime.sendMessage({ initScript: false });
        loadingInterval = window.setInterval(waitUntilLoadingCompletes, 100);
    } else if (message['unloadSelf']) {
        unloadSelf();
        await chrome.runtime.sendMessage({ initScript: false });
    }
};

console.log("Init");
window.addEventListener('keydown', keyKiller, true);
window.addEventListener('click', checkButtonPress, true);
chrome.runtime.onMessage.addListener(messageListener);


async function checkButtonPress(this: Element, ev: Event) {
    let element = ev.target as Element;
    let dataTestAttribute = element.attributes?.getNamedItem('data-test') ?? null;
    if (dataTestAttribute !== null) {
        try {

            const buttonSpan = element.querySelector('span') as Element;

            let text = buttonSpan.innerHTML.toLowerCase();
            if (text.includes('continue')) {
                await sleep(500);
                if (shouldShow()) {
                    ShowTextArea();
                }
            }
        } catch (e) {

        }
    }
}

function keyKiller(this: Window, ev: KeyboardEvent) {
    if (!isTypingQuestion) {
        console.log(ev);
        ev.preventDefault();
        ev.stopPropagation();
        if (ev.key === 'Enter') {
            handleEnterKeyPress(ev);
            return;
        }
        inputAreaElement.focus();

        if (ev.code.includes('Numpad') && ev.altKey) {
            return;
        }

        if (ev.key.length === 1) {
            inputAreaElement.value = inputAreaElement.value += ev.key;
        } else if (ev.key === 'Backspace') {
            PerformBackspace(ev);
        }
        else if (ev.key.includes('Arrow')) {
            PerformArrowKey(ev);
        }
    }
}

function PerformBackspace(ev: KeyboardEvent) {

    if (ev.ctrlKey) {
        for (let i = inputAreaElement.value.length - 1; i > -1; i--) {
            if (inputAreaElement.value.charAt(i) === ' ') {
                break;
            }
            inputAreaElement.value = inputAreaElement.value.substring(0, inputAreaElement.value.length - 1);
        }
    }

    inputAreaElement.value = inputAreaElement.value.substring(0, inputAreaElement.value.length - 1);
}

function PerformArrowKey(ev: KeyboardEvent) {
    let cursorPosition = inputAreaElement.selectionEnd;

    if (ev.shiftKey && ev.ctrlKey) {
        handleShiftControlPress(ev)
    }

    else if (ev.shiftKey) {
        handleShiftPress(ev);
    }

    else if (ev.ctrlKey) {
        handleCtrlPress(ev);
    }
    else if (ev.key === 'ArrowLeft' && cursorPosition > 0) {
        inputAreaElement.selectionEnd = cursorPosition - 1;
    }
    else if (ev.key === 'ArrowRight') {
        inputAreaElement.selectionStart = cursorPosition + 1;
    }
}

function handleShiftControlPress(ev: KeyboardEvent) {
    let cursorPosition = inputAreaElement.selectionEnd;

    if(ev.key === 'ArrowLeft' && cursorPosition > 0) {
        let counter = 0;
        for(let i = cursorPosition; i > -1; i--) {

            if(i === 0) {
                inputAreaElement.setSelectionRange(0, cursorPosition);
                break;
            }

            if(inputAreaElement.value.charAt(i) === ' ') {
                inputAreaElement.setSelectionRange(cursorPosition-counter, cursorPosition);
                break;
            }
            counter++;
        }
    }
}


function handleShiftPress(ev: KeyboardEvent) {

}

function handleCtrlPress(ev: KeyboardEvent) {
    
}

async function waitUntilLoadingCompletes() {
    let translateElement = document.querySelector(TranslateElementAttribute);
    if (!!translateElement) {

        clearInterval(loadingInterval);
        if (shouldShow()) {
            await ShowTextArea();
        }
    }
}

function shouldShow(): boolean {

    //If the toggle keyboard button exists don't use the extension text area
    if (!!document.querySelector(KeyboardToggleElementAttribute)) {
        dontShow();
        isTypingQuestion = true;
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
    isTypingQuestion = false;
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

const sleep = async (ms: number) => new Promise(r => setTimeout(r, ms));

function unloadSelf() {
    window.removeEventListener('keydown', keyKiller, true);
    window.removeEventListener('click', checkButtonPress, true);
    chrome.runtime.onMessage.removeListener(messageListener);
}



function handleEnterKeyPress(ev: KeyboardEvent) {
    if(ev.target === document.body) {
        let htmlElement = document.querySelector(ButtonXPath) as HTMLElement;
        htmlElement.click();
    }
    else if(ev.target === document.querySelector(`.${InputAreaClassName}`)) {
        checkAnswer();
    }
}

function checkAnswer() {
    let valArr = inputAreaElement.value.split(' ');
    let wordBubbleWords = getWordBubbleElements();
    for(let word of valArr ) {
        word = word.trim();
        
    }

    
}

function getWordBubbleElements(): HTMLSpanElement[] {
    
    let wordBubbleList = document.querySelector(WordBankElementXPath) as HTMLDivElement;
    let wordBubbleSpans = Array.from(wordBubbleList.querySelectorAll('span[data-test="challenge-tap-token-text"]')) as HTMLSpanElement[];
    return wordBubbleSpans;
}