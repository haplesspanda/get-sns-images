import {Schedule, ScheduleEvent} from './types';

const textAreaClass = 'image-link-textarea';
const textAreaSelector = `textarea.${textAreaClass}`;

export const RAW_SCHEDULE_KEY = 'rawSchedule';

export function createTextArea(
  date: string | null,
  url: string | null,
  imageUrls: string[],
  schedule: Schedule | undefined,
  opt_height?: string
): HTMLElement {
  const renderedDate = date ?? 'unknown date';
  const renderedUrl = url ?? 'unknown url';

  const eventName = schedule && getEventNameFromMap(schedule, renderedDate);

  let result = '';
  if (schedule) {
    result += `\`${renderedDate}\` **${eventName}**\n<${renderedUrl}>\n`;
  } else {
    result += `\`${renderedDate}\`\n<${renderedUrl}>\n`;
  }
  imageUrls.forEach((imageUrl, index) => {
    // Split into sets of 5 due to discord embed limit.
    if (index > 0 && index % 5 === 0) {
      result += '\n^\n';
    }

    result += imageUrl + '\n';
  });

  const textAreaContainer = document.createElement('div');
  textAreaContainer.style.width = '100%';
  textAreaContainer.style.border = '3px solid red';
  textAreaContainer.style.boxSizing = 'border-box';

  const textArea = document.createElement('textarea');
  textArea.classList.add(textAreaClass);
  textArea.style.display = 'block';
  textArea.style.width = '100%';
  textArea.style.boxSizing = 'border-box';
  textArea.value = result;
  textArea.style.height = opt_height ?? '100px';

  textAreaContainer.appendChild(textArea);

  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.flexDirection = 'row';
  buttonContainer.style.width = '100%';

  textAreaContainer.appendChild(buttonContainer);

  function createButton(text: string, handler: (event: Event) => void) {
    const button = document.createElement('button');
    button.innerText = text;
    button.style.flex = '1';
    button.onclick = handler;
    return button;
  }

  const copyButton = createButton('Copy', () => {
    textArea.select();
    document.execCommand('copy');
  });
  buttonContainer.appendChild(copyButton);

  const openAllButtonText =
    imageUrls.length > 5 ? `Open all (${imageUrls.length})` : 'Open all';
  const openButton = createButton(openAllButtonText, () => {
    chrome.runtime.sendMessage({type: 'opentabs', urls: imageUrls});
  });
  buttonContainer.appendChild(openButton);

  return textAreaContainer;
}

export function hasTextArea(node: Document | Element): boolean {
  return !!node.querySelector(textAreaSelector);
}

export function extractDate(element: Element | null): string | null {
  const dateMatch = element?.textContent?.match(
    /(20)?([0-9]{2})\.?([0-9]{2})\.?([0-9]{2})/
  );
  return dateMatch && dateMatch.length === 5
    ? dateMatch[2] + dateMatch[3] + dateMatch[4]
    : null;
}

export function formatDate(datetime: string): string {
  const dateString = new Date(datetime).toLocaleDateString('ko', {
    timeZone: 'Asia/Seoul',
    year: '2-digit',
    month: '2-digit',
    day: '2-digit'
  });
  const formattedDateString = dateString.replace(/(\.|\s)/g, '');
  return formattedDateString;
}

export function injectSchedule(
  callback: (value: Schedule | undefined) => void
) {
  chrome.storage.local.get(RAW_SCHEDULE_KEY, localStorageResult => {
    const rawSchedule = localStorageResult[RAW_SCHEDULE_KEY];
    callback((rawSchedule && getEventSchedules(rawSchedule)) || undefined);
  });
}

function getEventSchedules(rawSchedule: string): Schedule {
  const normalizedSchedule = rawSchedule.replace(/\n\s*\n/g, '\n');
  const lines = normalizedSchedule.split('\n');

  const events: Schedule = new Map();

  let year: string; // e.g. '2018'
  let mostRecentDate: string; // e.g. '181018' - Used for "^" lines that use same date as previous.

  lines.forEach(line => {
    // Set year.
    const yearMatch = line.match(/^[0-9]{4}$/);
    if (yearMatch) {
      year = line;
      return;
    }

    function createEvent(
      date: string,
      type: string,
      name: string
    ): ScheduleEvent {
      if (type.match(/fansign/i)) {
        name = name + ' Fansign';
      }
      return {date, type, name};
    }

    // Add event with date.
    const eventWithDateMatch = line.match(
      /^([0-9]{2})\/([0-9]{2})\s*[|ㅣ]\s*[0-9?:-]*\s*\[*(\w+)\]*\s*(.*)$/
    );
    if (eventWithDateMatch) {
      const date =
        year.slice(2) + eventWithDateMatch[1] + eventWithDateMatch[2];
      mostRecentDate = date;

      const type = eventWithDateMatch[3];
      const name = eventWithDateMatch[4];

      const event = createEvent(date, type, name);

      addToMap(events, date, event);
      return;
    }

    // Add event that matches previous date.
    const eventWithPreviousDateMatch = line.match(
      /^\^\s*[|ㅣ]\s*[0-9?:-]*\s*\[*(\w+)\]*\s*(.*)$/
    );
    if (eventWithPreviousDateMatch) {
      const event = createEvent(
        mostRecentDate,
        eventWithPreviousDateMatch[1],
        eventWithPreviousDateMatch[2]
      );

      addToMap(events, mostRecentDate, event);
      return;
    }

    // Ignore malformatted lines.
  });
  return events;
}

function addToMap<K, V>(map: Map<K, V[]>, key: K, toAdd: V) {
  if (map.has(key)) {
    map.get(key)!.push(toAdd);
  } else {
    map.set(key, [toAdd]);
  }
}

function getEventNameFromMap(map: Schedule, key: string): string {
  const value = map.get(key);
  if (value) {
    if (value.length === 1) {
      return value[0].name;
    } else {
      return 'multiple events';
    }
  }
  return 'unknown event';
}
