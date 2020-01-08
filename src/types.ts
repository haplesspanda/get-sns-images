export type PageType =
  | "oldtwitter"
  | "newtwitter"
  | "instagram"
  | "tweetdeck"
  | "tistory";

interface AutodetectMessage {
  type: "autodetect";
  result: PageType | "unknown";
}

interface OpenTabsMessage {
  type: "opentabs";
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
