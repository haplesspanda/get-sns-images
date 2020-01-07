import {createTextArea, formatDate, hasTextArea} from './common';
import {StructuredItem} from './types';

(function tweetDeckExecFn() {
  const streamItems: HTMLElement[] = Array.from(document.querySelectorAll('article.stream-item')) as HTMLElement[];
  const structuredItems: StructuredItem[] = streamItems.map(streamItem => {
    // TODO: Stop using partial: it's making the typing weaker.
    const result: Partial<StructuredItem> = {};
    
    const images: HTMLLinkElement[] = Array.from(streamItem.querySelectorAll('a.js-media-image-link')) as HTMLLinkElement[];
    const filteredImages = images.filter(image => {
      const backgroundImage = image.style.backgroundImage;
      return backgroundImage.includes('/media/') || backgroundImage.includes('ext_tw_video_thumb');
    });
    result.imageUrls = filteredImages.map(image => {
      if (!!image.querySelector('.video-overlay')) {
        // Twitter video - just return the t.co link for smallest embed.
        return image.href;
      } else {
        // Normal image.
        const lowResImageUri = image.style.backgroundImage.replace(/^url\("/, "").replace(/"\)$/, "");
        const url = new URL(lowResImageUri);
        url.searchParams.set('name', 'orig');
        return url.toString();
      }
    });
    
    // Handle gifs if we couldn't find any images.
    if (result.imageUrls.length === 0) {
      const videos = streamItem.querySelectorAll('video');
      result.imageUrls = Array.from(videos).map(video => video.src);
    }

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

    return {imageUrls: result.imageUrls, tweetUrl: result.tweetUrl, streamItem: result.streamItem, date: result.date,};
  });

  structuredItems.forEach(structuredItem => {
    if (!hasTextArea(structuredItem.streamItem) && structuredItem.imageUrls.length > 0) {
      const textArea = createTextArea(structuredItem.date, structuredItem.tweetUrl, structuredItem.imageUrls);
      structuredItem.streamItem.appendChild(textArea);
    }
  });
})();
