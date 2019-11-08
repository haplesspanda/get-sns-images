// OBSOLETE: replaced by popup.js

// TODO: Add date
// TODO: Add fansite credit
// TODO: Make it easier to copy-paste
// TODO: Get event name / description easier

(() => {
  const streamItems = [...document.querySelectorAll("li.stream-item")];
  const structuredItems = streamItems.map(streamItem => {
    const result = {};
    
    const images = streamItem.querySelectorAll(".js-adaptive-photo img");
    result.imageUrls = [...images].map(image => image.getAttribute("src") + ":orig");

    const tweetId = streamItem.id.split('-').slice(-1)[0];

    const permalinkPath = streamItem.querySelector("div.tweet").getAttribute("data-permalink-path");
    const urlToTweet = `https://twitter.com${permalinkPath}`;
    result.id = tweetId;
    result.tweetUrl = urlToTweet;
    result.streamItem = streamItem;

    const tweetTextElement = streamItem.querySelector("p.tweet-text");
    const date = tweetTextElement.textContent.match(/\b[0-9]{6}\b/);

    result.date = date && date[0];


    return result;
  });

  const formattedItems = structuredItems.map(structuredItem => {
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
    }

    return result;
  });
  return formattedItems;
})();


// old version
[...document.querySelectorAll("li.stream-item")].map(streamItem => streamItem.querySelectorAll("img")).map());