const BUTTONS = [
  {buttonId: 'getOldTwitterImages', file: 'dist/oldtwitter.js'},
  {buttonId: 'getNewTwitterImages', file: 'dist/newtwitter.js'},
  {buttonId: 'getInstagramImages', file: 'dist/instagram.js'},
  {buttonId: 'getTistoryImages', file: 'dist/tistory.js'},
];

function attachButtonHandler(buttonId, file) {
  const button = document.getElementById(buttonId);
  button.onclick = function(element) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.executeScript(
          tabs[0].id,
          {file});
    });
  };
}

BUTTONS.forEach(button => {
  attachButtonHandler(button.buttonId, button.file);
});
