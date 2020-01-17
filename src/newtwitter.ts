import {createTextArea, extractDate, formatDate, hasTextArea} from './common';
import {StructuredItem} from './types';

const photoLinkSelector = 'a[href*="/photo/"]';
const innerImageSelector = 'div[aria-label="Image"] img';

(function newTwitterExecFn() {
  function addLinksToPage() {
    const streamItems = Array.from(document.querySelectorAll('article'));

    // Filter out sponsored stuff that gets ad-blocked
    const actualTweets = streamItems.filter(streamItem =>
      streamItem.querySelector(photoLinkSelector)
    );

    const structuredItems: StructuredItem[] = actualTweets.map(streamItem => {
      // New twitter w/ 4 links has images out of order in the DOM. Sort by URL which has 1/2/3/4.
      const imageLinks: HTMLLinkElement[] = Array.from(
        streamItem.querySelectorAll(photoLinkSelector)
      );
      const filteredImageLinks = imageLinks.filter(imageLink =>
        imageLink.querySelector(innerImageSelector)
      );
      const sortedImageLinks = filteredImageLinks.sort(
        (link1: HTMLLinkElement, link2: HTMLLinkElement) => {
          if (link1.href > link2.href) {
            return 1;
          } else if (link1.href < link2.href) {
            return -1;
          } else {
            return 0;
          }
        }
      );

      const images = sortedImageLinks.map(link =>
        link.querySelector(innerImageSelector)
      );
      const imageUrls = images.map(image => {
        const imageSrc = image?.getAttribute('src') ?? '';
        const href = new URL(imageSrc);
        href.searchParams.set('name', 'orig');
        return href.toString();
      });

      const firstPhotoLink: HTMLLinkElement = imageLinks[0];
      const permalinkPath = firstPhotoLink.href.replace(/\/photo\/.*$/, '');
      const tweetUrl = permalinkPath;

      const tweetTextElement = streamItem.querySelector('div[lang]');
      let date = extractDate(tweetTextElement);

      // Fallback to date on tweet
      // TODO: Make this work for retweets (they don't have a nicely formatted time)
      const timeElement = streamItem.querySelector('time');
      if (!date && timeElement) {
        const time = timeElement.getAttribute('datetime');
        if (time) {
          date = formatDate(time);
        }
      }

      return {imageUrls, tweetUrl, streamItem, date};
    });

    structuredItems.forEach(structuredItem => {
      const textAreaContainer = structuredItem.streamItem.parentElement;

      if (
        textAreaContainer &&
        !hasTextArea(textAreaContainer) &&
        structuredItem.imageUrls.length > 0
      ) {
        const textArea = createTextArea(
          structuredItem.date,
          structuredItem.tweetUrl,
          structuredItem.imageUrls
        );
        textAreaContainer.appendChild(textArea);
      }
    });
  }

  addLinksToPage();

  // TODO: maybe do this with MutationObserver
  setInterval(addLinksToPage, 1000);
})();
