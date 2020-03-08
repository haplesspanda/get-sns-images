import {Schedule, ScheduleEvent} from './types';

const textAreaClass = 'image-link-textarea';
const textAreaSelector = `textarea.${textAreaClass}`;

export const RAW_SCHEDULE_KEY = 'rawSchedule';

type TextAreaData = {
  date: string;
  url: string;
  imageUrls: string[];
  eventName?: string;
};

export function createTextArea(
  date: {date: string | null; fromContent: boolean},
  url: string | null,
  imageUrls: string[],
  schedule: Schedule | undefined,
  opt_height?: string
): HTMLElement {
  const renderedDate = date.date ?? 'unknown date';
  const renderedUrl = url ?? 'unknown url';

  const eventNameResult =
    schedule && date.fromContent && getEventNameFromMap(schedule, renderedDate);

  let eventName = undefined;
  let selectValues = undefined;
  if (
    eventNameResult &&
    eventNameResult.result === EventResult.SINGLE_EVENT_FOUND
  ) {
    eventName = eventNameResult.eventName;
  } else if (
    eventNameResult &&
    eventNameResult.result === EventResult.MULTIPLE_EVENTS_FOUND
  ) {
    selectValues = eventNameResult.eventNames;
  }

  const textAreaData = {
    date: renderedDate,
    url: renderedUrl,
    imageUrls,
    eventName
  };

  return createTextAreaElements(
    textAreaData,
    imageUrls,
    opt_height,
    selectValues
  );
}

function formatTextAreaValue(data: TextAreaData) {
  let result = '';

  if (data.eventName) {
    result += `\`${data.date}\` **${data.eventName}**\n<${data.url}>\n`;
  } else {
    result += `\`${data.date}\`\n<${data.url}>\n`;
  }

  data.imageUrls.forEach((imageUrl, index) => {
    // Split into sets of 5 due to discord embed limit.
    if (index > 0 && index % 5 === 0) {
      result += '\n^\n';
    }

    result += imageUrl + '\n';
  });

  return result;
}

function createTextAreaElements(
  textAreaData: TextAreaData,
  imageUrls: string[],
  opt_height?: string,
  opt_selectValues?: string[]
) {
  const textAreaContainer = document.createElement('div');
  textAreaContainer.style.width = '100%';
  textAreaContainer.style.border = '3px solid red';
  textAreaContainer.style.boxSizing = 'border-box';

  const textArea = document.createElement('textarea');
  textArea.classList.add(textAreaClass);
  textArea.style.display = 'block';
  textArea.style.width = '100%';
  textArea.style.boxSizing = 'border-box';
  textArea.style.height = opt_height ?? '100px';
  textArea.value = formatTextAreaValue(textAreaData);

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

  if (opt_selectValues) {
    const eventNameSelectContainer = document.createElement('div');
    eventNameSelectContainer.style.flex = '1';
    eventNameSelectContainer.style.display = 'flex';
    eventNameSelectContainer.style.flexDirection = 'column';
    eventNameSelectContainer.style.minWidth = '0';

    const eventNameSelect = document.createElement('select');
    const noEventOption = document.createElement('option');
    const noEventSelectedText = 'no event selected';
    noEventOption.innerText = noEventSelectedText;
    eventNameSelect.appendChild(noEventOption);
    eventNameSelectContainer.appendChild(eventNameSelect);

    opt_selectValues.forEach(eventName => {
      const option = document.createElement('option');
      option.innerText = eventName;
      eventNameSelect.appendChild(option);
    });

    const copyWithEventButton = createButton('Copy with event', () => {
      textArea.value = formatTextAreaValue({
        ...textAreaData,
        eventName:
          eventNameSelect.value === noEventSelectedText
            ? undefined
            : eventNameSelect.value
      });
      textArea.select();
      document.execCommand('copy');
    });
    eventNameSelectContainer.appendChild(copyWithEventButton);
    buttonContainer.appendChild(eventNameSelectContainer);
  }

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
      /^([0-9]{2})\/([0-9]{2})\s*[|\u3163]\s*[0-9?:-]*\s*\[*(\w+)\]*\s*(.*)$/u
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
      /^\^\s*[|\u3163]\s*[0-9?:-]*\s*\[*(\w+)\]*\s*(.*)$/u
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

function getEventNameFromMap(map: Schedule, key: string): EventNameResult {
  const value = map.get(key);
  if (value) {
    if (value.length === 1) {
      return {result: EventResult.SINGLE_EVENT_FOUND, eventName: value[0].name};
    } else {
      return {
        result: EventResult.MULTIPLE_EVENTS_FOUND,
        eventNames: value.map(event => event.name)
      };
    }
  }
  return {result: EventResult.NO_EVENT_FOUND};
}

enum EventResult {
  NO_EVENT_FOUND = 'unknown event',
  SINGLE_EVENT_FOUND = 'single event',
  MULTIPLE_EVENTS_FOUND = 'multiple events'
}

type MultipleEventResult = {
  result: EventResult.MULTIPLE_EVENTS_FOUND;
  eventNames: string[];
  eventName?: never;
};

type SingleEventResult = {
  result: EventResult.SINGLE_EVENT_FOUND;
  eventNames?: never;
  eventName: string;
};

type NoEventResult = {
  result: EventResult.NO_EVENT_FOUND;
  eventNames?: never;
  eventName?: never;
};

type EventNameResult = NoEventResult | SingleEventResult | MultipleEventResult;
