import {
  createTextArea,
  extractDate,
  formatDate,
  hasTextArea,
  injectSchedule,
} from './common';
import {Schedule, StructuredItem} from './types';

(function tweetdeckExecFunction() {
  function execWithSchedule(schedule: Schedule | undefined) {
    const streamItems: HTMLElement[] = Array.from(
      document.querySelectorAll('article.stream-item')
    );
    const structuredItems: StructuredItem[] = streamItems.map(streamItem => {
      const images: HTMLLinkElement[] = Array.from(
        streamItem.querySelectorAll('a.js-media-image-link')
      );
      const filteredImages = images.filter(image => {
        const backgroundImage = image.style.backgroundImage;
        return (
          backgroundImage.includes('/media/') ||
          backgroundImage.includes('ext_tw_video_thumb') ||
          backgroundImage.includes('amplify_video_thumb')
        );
      });
      let imageUrls = filteredImages.map(image => {
        if (!!image.querySelector('.video-overlay')) {
          // Twitter video - just return the t.co link for smallest embed.
          return image.href;
        } else {
          // Normal image.
          const lowResImageUri = image.style.backgroundImage
            .replace(/^url\("/, '')
            .replace(/"\)$/, '');
          const url = new URL(lowResImageUri);
          url.searchParams.set('name', 'orig');
          return url.toString();
        }
      });

      // Handle gifs if we couldn't find any images.
      if (imageUrls.length === 0) {
        const videos = streamItem.querySelectorAll('video');
        imageUrls = Array.from(videos).map(video => video.src);
      }

      const timeLinkElement = streamItem.querySelector('time a');
      const tweetUrl = timeLinkElement?.getAttribute('href') ?? null;

      const tweetTextElement = streamItem.querySelector('p.tweet-text');
      let date = {date: extractDate(tweetTextElement), fromContent: true};

      // Fallback to date on tweet
      const timeElement = streamItem.querySelector('time');
      if (!date.date && timeElement) {
        const time = timeElement.getAttribute('datetime');
        if (time) {
          date = {date: formatDate(time), fromContent: false};
        }
      }
      return {imageUrls, tweetUrl, streamItem, date};
    });

    structuredItems.forEach(structuredItem => {
      if (
        !hasTextArea(structuredItem.streamItem) &&
        structuredItem.imageUrls.length > 0
      ) {
        const textArea = createTextArea(
          structuredItem.date,
          structuredItem.tweetUrl,
          structuredItem.imageUrls,
          schedule,
          undefined
        );
        structuredItem.streamItem.appendChild(textArea);
      }
    });
  }

  injectSchedule(execWithSchedule);
})();
