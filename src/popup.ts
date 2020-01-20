import {RAW_SCHEDULE_KEY} from './common';
import {PageType, Message} from './types';

interface ButtonSpec {
  buttonId: string;
  file: string;
  name: PageType;
  text: string;
}

const scheduleTextAreaSelector = 'textarea#schedule-textarea';

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
  button.onclick = () => {
    chrome.tabs.executeScript({file});
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

function showAutodetectedOption(button: ButtonSpec) {
  decorateButton(
    document.getElementById('autodetected-button') as HTMLButtonElement,
    button.file,
    button.text
  );

  const seeAllOptions: HTMLElement = document.getElementById(
    'see-all-options'
  )!;
  decorateFakeButton(seeAllOptions, showAllOptions);
  const editSchedule: HTMLElement = document.getElementById('edit-schedule')!;
  decorateFakeButton(editSchedule, showEditScheduleSection);

  document.getElementById('autodetect')!.style.display = 'block';
  document.getElementById('all-options')!.style.display = 'none';
  document.getElementById('edit-schedule')!.style.display = 'block';
  document.getElementById('edit-schedule-section')!.style.display = 'none';
}

function showAllOptions() {
  BUTTONS.forEach(button => {
    decorateButton(
      document.getElementById(button.buttonId) as HTMLButtonElement,
      button.file,
      button.text
    );
  });

  const editSchedule: HTMLElement = document.getElementById('edit-schedule')!;
  decorateFakeButton(editSchedule, showEditScheduleSection);

  document.getElementById('all-options')!.style.display = 'block';
  document.getElementById('autodetect')!.style.display = 'none';
  document.getElementById('edit-schedule')!.style.display = 'block';
  document.getElementById('edit-schedule-section')!.style.display = 'none';
}

function showEditScheduleSection() {
  chrome.storage.local.get(RAW_SCHEDULE_KEY, value => {
    const scheduleTextArea: HTMLTextAreaElement | null = document.querySelector(
      scheduleTextAreaSelector
    );
    const rawScheduleValue = value[RAW_SCHEDULE_KEY];
    if (scheduleTextArea && rawScheduleValue) {
      scheduleTextArea.value = rawScheduleValue;
    }
  });

  document.getElementById('cancel-schedule-button')!.onclick = () => {
    // TODO: Go back to autodetect mode if we came from there
    showAllOptions();
  };

  document.getElementById('save-schedule-button')!.onclick = () => {
    const scheduleTextArea: HTMLTextAreaElement | null = document.querySelector(
      scheduleTextAreaSelector
    );
    const scheduleValue = scheduleTextArea?.value;

    const callback = () => {
      // TODO: Go back to autodetect mode if we came from there
      showAllOptions();
    };

    if (scheduleValue) {
      chrome.storage.local.set(
        {
          [RAW_SCHEDULE_KEY]: scheduleValue
        },
        callback
      );
    } else {
      chrome.storage.local.clear(callback);
    }
  };

  document.getElementById('all-options')!.style.display = 'none';
  document.getElementById('autodetect')!.style.display = 'none';
  document.getElementById('edit-schedule')!.style.display = 'none';
  document.getElementById('edit-schedule-section')!.style.display = 'block';
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
