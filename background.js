chrome.runtime.onMessage.addListener((request, sender) => {
  if (request.type === 'opentabs') {
    request.urls.forEach((url, offset) => {
      chrome.tabs.create({url, index: sender.tab.index + offset + 1, openerTabId: sender.tab.id});
    });
  }
});
