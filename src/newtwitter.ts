import {createTextArea, formatDate, hasTextArea} from './common';
import {StructuredItem} from './types';

const photoLinkSelector = 'a[href*="/photo/"]';

(function newTwitterExecFn() {
  function addLinksToPage() {
    const streamItems = Array.from(document.querySelectorAll("article"));
    
    // Filter out sponsored stuff that gets ad-blocked
    const actualTweets = streamItems.filter(streamItem => streamItem.querySelector(photoLinkSelector));    
    
    const structuredItems = actualTweets.map(streamItem => {
      // TODO: Stop using partial: it's making the typing weaker.
      const result: Partial<StructuredItem> = {};
      
      // New twitter w/ 4 links has images out of order in the DOM. Sort by URL which has 1/2/3/4.
      const imageLinks = streamItem.querySelectorAll('a[href*="/photo/"]');
      const filteredImageLinks = Array.from(imageLinks).filter(imageLink => imageLink.querySelector('div[aria-label="Image"] img'));
      const sortedImageLinks = filteredImageLinks.sort((link1: HTMLLinkElement, link2: HTMLLinkElement) => {
        if (link1.href > link2.href) {
          return 1;
        } else if (link1.href < link2.href) {
          return -1;
        } else {
          return 0;
        }
      });
      
      const images = sortedImageLinks.map(link => link.querySelector('div[aria-label="Image"] img'));
      result.imageUrls = images.map(image => {
        const imageSrc = image.getAttribute("src");
        const href = new URL(imageSrc);
        href.searchParams.set('name', 'orig');
        return href.toString();
      });

      const firstPhotoLink = streamItem.querySelector(photoLinkSelector) as HTMLLinkElement;
      const permalinkPath = firstPhotoLink.href.replace(/\/photo\/.*$/, '');
      const urlToTweet = permalinkPath;
      result.tweetUrl = urlToTweet;
      result.streamItem = streamItem;

      const tweetTextElement = streamItem.querySelector("div[lang]");
      const dateMatch = tweetTextElement && tweetTextElement.textContent.match(/\b(20)?([0-9]{6})\b/);
      let date = dateMatch && dateMatch.length >= 3 && dateMatch[2] || null;
      
      // Fallback to date on tweet
      // TODO: Make this work for retweets (they don't have a nicely formatted time)
      if (!date && streamItem.querySelector('time')) {
        const time = streamItem.querySelector('time').getAttribute('datetime');
        date = formatDate(time);
      }

      result.date = date;

      return result;
    });

    structuredItems.forEach(structuredItem => {      
      const textAreaContainer = structuredItem.streamItem.parentElement;

      if (!hasTextArea(textAreaContainer) && structuredItem.imageUrls.length > 0) {
        const textArea = createTextArea(structuredItem.date, structuredItem.tweetUrl, structuredItem.imageUrls);
        textAreaContainer.appendChild(textArea);
      }
    });
  }
  
  addLinksToPage();
  
  // TODO: maybe do this with MutationObserver
  setInterval(addLinksToPage, 1000);
})();
