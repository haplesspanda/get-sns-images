import {createTextArea, hasTextArea} from './common';
import {StructuredItem} from './types';

(function oldTwitterExecFn() {
  const streamItems = Array.from(document.querySelectorAll('.permalink-tweet-container')).concat(Array.from(document.querySelectorAll("li.stream-item"))) as HTMLElement[];
  const structuredItems = streamItems.map(streamItem => {
    // TODO: Stop using partial: it's making the typing weaker.
    const result: Partial<StructuredItem> = {};
    
    const images = streamItem.querySelectorAll(".js-adaptive-photo img");
    result.imageUrls = Array.from(images).map(image => image.getAttribute("src") + ":orig");

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

  structuredItems.forEach(structuredItem => {
    if (!hasTextArea(structuredItem.streamItem) && structuredItem.imageUrls.length > 0) {
      const textArea = createTextArea(structuredItem.date, structuredItem.tweetUrl, structuredItem.imageUrls);
      structuredItem.streamItem.appendChild(textArea);
    }
  });
})();
