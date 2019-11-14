'use strict';
import {createTextArea, formatDate, hasTextArea} from './common';

(function tweetDeckExecFn() {
  const streamItems = [...document.querySelectorAll('article.stream-item')];
  const structuredItems = streamItems.map(streamItem => {
    const result = {};
    
    const images = streamItem.querySelectorAll('a.js-media-image-link');
    const filteredImages = [...images].filter(image => image.style['background-image'].includes('/media/'));
    result.imageUrls = [...filteredImages].map(image => {
      const lowResImageUri = image.style['background-image'].replace(/^url\("/, "").replace(/"\)$/, "");
      const url = new URL(lowResImageUri);
      url.searchParams.set('name', 'orig');
      return url.toString();
    });

    const urlToTweet = streamItem.querySelector('time a').getAttribute('href');
    result.tweetUrl = urlToTweet;
    result.streamItem = streamItem;

    const tweetTextElement = streamItem.querySelector('p.tweet-text');
    const dateMatch = tweetTextElement.textContent.match(/\b(20)?([0-9]{6})\b/);
    let date = dateMatch && dateMatch.length >= 3 && dateMatch[2] || null;
    
    // Fallback to date on tweet
    if (!date && streamItem.querySelector('time')) {
      const time = streamItem.querySelector('time').getAttribute('datetime');
      date = formatDate(time);
    }

    result.date = date;


    return result;
  });

  const formattedItems = structuredItems.map(structuredItem => {
    if (!hasTextArea(structuredItem.streamItem) && structuredItem.imageUrls.length > 0) {
      const textArea = createTextArea(structuredItem.date, structuredItem.tweetUrl, structuredItem.imageUrls);
      structuredItem.streamItem.appendChild(textArea);
    }
  });
})();
