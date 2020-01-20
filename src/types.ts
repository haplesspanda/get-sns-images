export type PageType =
  | 'oldtwitter'
  | 'newtwitter'
  | 'instagram'
  | 'tweetdeck'
  | 'tistory'
  | 'naverpost';

interface AutodetectMessage {
  type: 'autodetect';
  result: PageType | 'unknown';
}

interface OpenTabsMessage {
  type: 'opentabs';
  urls: string[];
}

// Message passed from content scripts.
export type Message = AutodetectMessage | OpenTabsMessage;

// Used for Twitter elements.
export interface StructuredItem {
  imageUrls: string[];
  tweetUrl: string | null;
  date: string | null;
  streamItem: HTMLElement;
}

export interface ScheduleEvent {
  date: string;
  type: string;
  name: string;
}

export type Schedule = Map<string, ScheduleEvent[]>;
