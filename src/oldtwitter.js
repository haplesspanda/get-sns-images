// 'use strict';
// import {createTextArea} from './common';

(function oldTwitterExecFn() {
  const streamItems = [...document.querySelectorAll('.permalink-tweet-container'), ...document.querySelectorAll("li.stream-item")];
  const structuredItems = streamItems.map(streamItem => {
    const result = {};
    
    const images = streamItem.querySelectorAll(".js-adaptive-photo img");
    result.imageUrls = [...images].map(image => image.getAttribute("src") + ":orig");

    const permalinkPath = streamItem.querySelector("div.tweet").getAttribute("data-permalink-path");
    const urlToTweet = `https://twitter.com${permalinkPath}`;
    result.tweetUrl = urlToTweet;
    result.streamItem = streamItem;

    const tweetTextElement = streamItem.querySelector("p.tweet-text");
    const dateMatch = tweetTextElement.textContent.match(/\b(20)?([0-9]{6})\b/);
    const date = dateMatch && dateMatch.length >= 3 && dateMatch[2] || null;

    result.date = date;


    return result;
  });

  const formattedItems = structuredItems.map(structuredItem => {
    // if (!structuredItem.streamItem.querySelector('textarea') && structuredItem.imageUrls.length > 0) {
      // const textArea = createTextArea(structuredItem.date, structuredItem.tweetUrl, structuredItem.imageUrls);
      // structuredItem.streamItem.appendChild(textArea);      
    // }
    
    let result = `\`${structuredItem.date}\`\n<${structuredItem.tweetUrl}>\n`;
    structuredItem.imageUrls.forEach(imageUrl => {
      result += imageUrl + '\n';
    });

    if (!structuredItem.streamItem.querySelector('textarea') && structuredItem.imageUrls.length > 0) {
      const textArea = document.createElement('textarea');
      structuredItem.streamItem.appendChild(textArea);
      textArea.value = result;
      textArea.style.width = '100%';
      textArea.style.height = '100px';
      textArea.style.border = '3px solid red';
      textArea.style['box-sizing'] = 'border-box';
    }

    return result;
  });
  return formattedItems;
})();

