(() => {
  function autodetect() {
    const location = window.location;
    if (location.host === 'tweetdeck.twitter.com') {
      return 'tweetdeck';
    }
    
    if (location.host.endsWith('instagram.com')) {
      return 'instagram';
    }
    
    if (location.host.endsWith('twitter.com')) {
      if (!!document.querySelector('article')) {
        return 'newtwitter';
      } else if (!!document.querySelector('.stream-item')) {
        return 'oldtwitter';
      }
    }
    
    // TODO: Try to autodetect tistory too
    
    return 'unknown';
  }

  chrome.runtime.sendMessage({type: 'autodetect', result: autodetect()});
})()
