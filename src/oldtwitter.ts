import { createTextArea, hasTextArea } from "./common";
import { StructuredItem } from "./types";

(function oldTwitterExecFn() {
  const tweetContainers: HTMLElement[] = Array.from(
    document.querySelectorAll(".permalink-tweet-container")
  );
  const streamItems: HTMLElement[] = Array.from(
    document.querySelectorAll("li.stream-item")
  );
  const allTweets = tweetContainers.concat(streamItems);

  const structuredItems: StructuredItem[] = allTweets.map(streamItem => {
    const images = streamItem.querySelectorAll(".js-adaptive-photo img");
    const imageUrls = Array.from(images).map(
      image => image.getAttribute("src") + ":orig"
    );

    const tweetElement = streamItem.querySelector("div.tweet");
    const permalinkPath =
      tweetElement && tweetElement.getAttribute("data-permalink-path");
    const urlToTweet = `https://twitter.com${permalinkPath}`;
    const tweetUrl = urlToTweet;

    const tweetTextElement = streamItem.querySelector("p.tweet-text");
    const dateMatch =
      tweetTextElement &&
      tweetTextElement.textContent &&
      tweetTextElement.textContent.match(/\b(20)?([0-9]{6})\b/);
    const date = (dateMatch && dateMatch.length >= 3 && dateMatch[2]) || null;

    return { imageUrls, tweetUrl, streamItem, date };
  });

  structuredItems.forEach(structuredItem => {
    if (
      !hasTextArea(structuredItem.streamItem) &&
      structuredItem.imageUrls.length > 0
    ) {
      const textArea = createTextArea(
        structuredItem.date,
        structuredItem.tweetUrl,
        structuredItem.imageUrls
      );
      structuredItem.streamItem.appendChild(textArea);
    }
  });
})();
