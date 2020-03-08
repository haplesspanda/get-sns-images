import {RAW_SCHEDULE_KEY, injectSchedule} from './common';

const scheduleTextAreaSelector = 'textarea#schedule-textarea';

function initializeSettingsPage() {
  chrome.storage.local.get(RAW_SCHEDULE_KEY, value => {
    const scheduleTextArea: HTMLTextAreaElement | null = document.querySelector(
      scheduleTextAreaSelector
    );
    const rawScheduleValue = value[RAW_SCHEDULE_KEY];
    if (scheduleTextArea && rawScheduleValue) {
      scheduleTextArea.value = rawScheduleValue;
    }
  });

  renderSchedule();

  document.getElementById('save-schedule-button')!.onclick = () => {
    const scheduleTextArea: HTMLTextAreaElement | null = document.querySelector(
      scheduleTextAreaSelector
    );
    const scheduleValue = scheduleTextArea?.value;

    const callback = () => {
      // TODO: Do something less annoying
      alert('Schedule saved!');
      renderSchedule();
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
}

function renderSchedule() {
  injectSchedule(schedule => {
    const renderedScheduleElement = document.getElementById(
      'rendered-schedule'
    );
    if (renderedScheduleElement) {
      let scheduleString = '';
      if (schedule) {
        schedule.forEach((value, key) => {
          // TODO: Should reuse formatting from common
          let eventsString = '';
          value.forEach(event => {
            eventsString += `[${event.type}] ${event.name}\n`;
          });
          scheduleString += `${key}\n${eventsString}`;
        });
        renderedScheduleElement.innerText = scheduleString;
      } else {
        renderedScheduleElement.innerText = 'No saved schedule';
      }
    }
  });
}

initializeSettingsPage();
