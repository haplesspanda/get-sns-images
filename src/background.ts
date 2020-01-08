import {Message} from './types';

chrome.runtime.onMessage.addListener((request: Message, sender) => {
  if (request.type === 'opentabs') {
    request.urls.forEach((url: string, offset: number) => {
      const newTabIndex = (sender.tab && sender.tab.index || 0) + offset + 1;
      const openerTabId = sender.tab && sender.tab.id;
      chrome.tabs.create({url, index: newTabIndex, openerTabId});
    });
  }
});
