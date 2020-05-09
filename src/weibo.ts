import {
  createTextArea,
  formatDate,
  hasTextArea,
  injectSchedule,
} from './common';
import {Schedule} from './types';

(function weiboExecFn() {
  function execWithSchedule(schedule: Schedule | undefined) {
    const feedItems = Array.from(document.querySelectorAll('.WB_feed_detail'));

    feedItems.forEach(feedItem => {
      const images = Array.from(
        feedItem.querySelectorAll('li.S_line2 img')
      ).concat(Array.from(feedItem.querySelectorAll('li img.S-line2')));
      const imageSrcs = images.map(img => {
        const rawSrc = (img as HTMLImageElement).src || '';
        const url = new URL(rawSrc);
        url.pathname = url.pathname.replace(/^\/[^/]*\//, '/large/');
        return url.toString();
      });

      const timeElement = feedItem.querySelector(
        'a[node-type="feed_list_item_date"]'
      ) as HTMLLinkElement;

      const postUrl = new URL(timeElement.href);
      postUrl.search = '';

      const datetime = timeElement.getAttribute('date');
      const date = datetime && formatDate(parseInt(datetime));

      if (!hasTextArea(feedItem)) {
        const textArea = createTextArea(
          {date: date, fromContent: false},
          postUrl.toString(),
          imageSrcs,
          schedule
        );
        feedItem.appendChild(textArea);
      }
    });
  }

  injectSchedule(execWithSchedule);
})();
