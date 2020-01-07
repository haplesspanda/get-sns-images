import {Message} from './types';

chrome.runtime.onMessage.addListener((request: Message, sender) => {
  if (request.type === 'opentabs') {
    request.urls.forEach((url: string, offset: number) => {
      chrome.tabs.create({url, index: sender.tab.index + offset + 1, openerTabId: sender.tab.id});
    });
  }
});
