const BUTTONS = [
  {buttonId: 'old-twitter-button', file: 'dist/oldtwitter.js', name: 'oldtwitter', text: 'Old Twitter'},
  {buttonId: 'new-twitter-button', file: 'dist/newtwitter.js', name: 'newtwitter', text: 'New Twitter'},
  {buttonId: 'tweetdeck-button', file: 'dist/tweetdeck.js', name: 'tweetdeck', text: 'TweetDeck'},
  {buttonId: 'instagram-button', file: 'dist/instagram.js', name: 'instagram', text: 'Instagram'},
  {buttonId: 'tistory-button', file: 'dist/tistory.js', name: 'tistory', text: 'Tistory'},
];

function decorateButton(button, file, text) {
  button.innerText = text;
  button.onclick = function() {
    chrome.tabs.executeScript({file});
  };
  return button;
}

function showAutodetectedOption(button) {
  decorateButton(document.getElementById('autodetected-button'), button.file, button.text);
  
  const seeAllOptions = document.getElementById('see-all-options');  
  const handler = event => {
    if (event.type === 'click' || event.key === ' ' || event.key === 'Enter') {
      showAllOptions();
    }
  };
  seeAllOptions.onclick = handler;
  seeAllOptions.onkeypress = handler;  
  
  document.getElementById('autodetect').style.display = 'initial';  
  document.getElementById('all-options').style.display = 'none';
}

function showAllOptions() {
  BUTTONS.forEach(button => {
    decorateButton(document.getElementById(button.buttonId), button.file, button.text);
  });
  document.getElementById('all-options').style.display = 'initial';
  document.getElementById('autodetect').style.display = 'none';  
}

chrome.tabs.executeScript({file: 'dist/autodetect.js'});

chrome.runtime.onMessage.addListener((request, sender) => {
  if (request.type === 'autodetect') {
    const detectedButton = BUTTONS.find(button => button.name === request.result);
    if (detectedButton) {
      showAutodetectedOption(detectedButton);
    } else {
      showAllOptions();
    }
  }
});
