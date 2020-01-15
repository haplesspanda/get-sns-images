import {PageType, Message} from './types';

interface ButtonSpec {
  buttonId: string;
  file: string;
  name: PageType;
  text: string;
}

const BUTTONS: ButtonSpec[] = [
  {
    buttonId: 'old-twitter-button',
    file: 'dist/oldtwitter.js',
    name: 'oldtwitter',
    text: 'Old Twitter'
  },
  {
    buttonId: 'new-twitter-button',
    file: 'dist/newtwitter.js',
    name: 'newtwitter',
    text: 'New Twitter'
  },
  {
    buttonId: 'tweetdeck-button',
    file: 'dist/tweetdeck.js',
    name: 'tweetdeck',
    text: 'TweetDeck'
  },
  {
    buttonId: 'instagram-button',
    file: 'dist/instagram.js',
    name: 'instagram',
    text: 'Instagram'
  },
  {
    buttonId: 'tistory-button',
    file: 'dist/tistory.js',
    name: 'tistory',
    text: 'Tistory'
  },
  {
    buttonId: 'naver-post-button',
    file: 'dist/naverpost.js',
    name: 'naverpost',
    text: 'Naver Post'
  }
];

function decorateButton(button: HTMLButtonElement, file: string, text: string) {
  button.innerText = text;
  button.onclick = function() {
    chrome.tabs.executeScript({file});
  };
}

function showAutodetectedOption(button: ButtonSpec) {
  decorateButton(
    document.getElementById('autodetected-button') as HTMLButtonElement,
    button.file,
    button.text
  );

  const seeAllOptions: HTMLElement = document.getElementById(
    'see-all-options'
  )!;
  const handler = (event: MouseEvent | KeyboardEvent) => {
    if (
      event.type === 'click' ||
      (event instanceof KeyboardEvent &&
        (event.key === ' ' || event.key === 'Enter'))
    ) {
      showAllOptions();
    }
  };
  seeAllOptions.onclick = handler;
  seeAllOptions.onkeypress = handler;

  document.getElementById('autodetect')!.style.display = 'initial';
  document.getElementById('all-options')!.style.display = 'none';
}

function showAllOptions() {
  BUTTONS.forEach(button => {
    decorateButton(
      document.getElementById(button.buttonId) as HTMLButtonElement,
      button.file,
      button.text
    );
  });
  document.getElementById('all-options')!.style.display = 'initial';
  document.getElementById('autodetect')!.style.display = 'none';
}

chrome.tabs.executeScript({file: 'dist/autodetect.js'});

chrome.runtime.onMessage.addListener((request: Message) => {
  if (request.type === 'autodetect') {
    const detectedButton = BUTTONS.find(
      button => button.name === request.result
    );
    if (detectedButton) {
      showAutodetectedOption(detectedButton);
    } else {
      showAllOptions();
    }
  }
});
