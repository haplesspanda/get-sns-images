'use strict';
import {createTextArea, hasTextArea} from './common';

const photoLinkSelector = 'a[href*="/photo/"]';

(function newTwitterExecFn() {
  function addLinksToPage() {
    const streamItems = [...document.querySelectorAll("article")];
    
    // Filter out sponsored stuff that gets ad-blocked
    const actualTweets = streamItems.filter(streamItem => streamItem.querySelector(photoLinkSelector));
    
    
    const structuredItems = actualTweets.map(streamItem => {
      const result = {};
      
      // New twitter w/ 4 links has images out of order in the DOM. Sort by URL which has 1/2/3/4.
      const imageLinks = streamItem.querySelectorAll('a[href*="/photo/"]');
      const sortedImageLinks = [...imageLinks].sort((link1, link2) => {
        if (link1.href > link2.href) {
          return 1;
        } else if (link1.href < link2.href) {
          return -1;
        } else {
          return 0;
        }
      });
      
      const images = [...sortedImageLinks].map(link => link.querySelector('div[aria-label="Image"] img'));
      result.imageUrls = images.map(image => {
        const imageSrc = image.getAttribute("src");
        const href = new URL(imageSrc);
        href.searchParams.set('name', 'orig');
        return href.toString();
      });

      const firstPhotoLink = streamItem.querySelector(photoLinkSelector);
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
        const dateString = new Date(time).toLocaleDateString('ko', {timeZone: 'Asia/Seoul', year: '2-digit', month: '2-digit', day: '2-digit'});
        const formattedDateString = dateString.replace(/\./g, '').replace(/ /g, '');  // TODO: Not sure why this doesn't work in one pass. Also commonize.
        date = formattedDateString;
      }

      result.date = date;


      return result;
    });

    const formattedItems = structuredItems.map(structuredItem => {      
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
