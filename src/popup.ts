import {PageType, Message} from './types';

interface ButtonSpec {
  buttonId: string;
  file: string;
  name: PageType;
  text: string;
}

const BUTTONS: ButtonSpec[] = [
  {
    buttonId: 'twitter-button',
    file: 'dist/twitter.js',
    name: 'twitter',
    text: 'Twitter',
  },
  {
    buttonId: 'tweetdeck-button',
    file: 'dist/tweetdeck.js',
    name: 'tweetdeck',
    text: 'TweetDeck',
  },
  {
    buttonId: 'instagram-button',
    file: 'dist/instagram.js',
    name: 'instagram',
    text: 'Instagram',
  },
  {
    buttonId: 'tistory-button',
    file: 'dist/tistory.js',
    name: 'tistory',
    text: 'Tistory',
  },
  {
    buttonId: 'naver-post-button',
    file: 'dist/naverpost.js',
    name: 'naverpost',
    text: 'Naver Post',
  },
  {
    buttonId: 'weibo-button',
    file: 'dist/weibo.js',
    name: 'weibo',
    text: 'Weibo',
  },
];

function decorateButton(
  button: HTMLButtonElement,
  file: string,
  text: string,
  tab: chrome.tabs.Tab
) {
  button.innerText = text;
  button.onclick = () => {
    chrome.scripting.executeScript({target: {tabId: tab.id!}, files: [file]});
  };
}

function decorateFakeButton(fakeButton: HTMLElement, handler: () => void) {
  const handlerWrapper = (event: MouseEvent | KeyboardEvent) => {
    if (
      event.type === 'click' ||
      (event instanceof KeyboardEvent &&
        (event.key === ' ' || event.key === 'Enter'))
    ) {
      handler();
    }
  };

  fakeButton.onclick = handlerWrapper;
  fakeButton.onkeypress = handlerWrapper;
}

function showAutodetectedOption(button: ButtonSpec, tab: chrome.tabs.Tab) {
  decorateButton(
    document.getElementById('autodetected-button') as HTMLButtonElement,
    button.file,
    button.text,
    tab
  );

  const seeAllOptions: HTMLElement =
    document.getElementById('see-all-options')!;
  decorateFakeButton(seeAllOptions, () => showAllOptions(tab));

  document.getElementById('autodetect')!.style.display = 'block';
  document.getElementById('all-options')!.style.display = 'none';
}

function showAllOptions(tab: chrome.tabs.Tab) {
  BUTTONS.forEach(button => {
    decorateButton(
      document.getElementById(button.buttonId) as HTMLButtonElement,
      button.file,
      button.text,
      tab
    );
  });

  document.getElementById('all-options')!.style.display = 'block';
  document.getElementById('autodetect')!.style.display = 'none';
}

async function runAutoDetection() {
  const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
  await chrome.scripting.executeScript({
    target: {tabId: tab.id!},
    files: ['dist/autodetect.js'],
  });
}
runAutoDetection();

chrome.runtime.onMessage.addListener(
  (request: Message, sender: chrome.runtime.MessageSender) => {
    if (request.type === 'autodetect') {
      const detectedButton = BUTTONS.find(
        button => button.name === request.result
      );
      if (detectedButton) {
        showAutodetectedOption(detectedButton, sender.tab!);
      } else {
        showAllOptions(sender.tab!);
      }
    }
  }
);
