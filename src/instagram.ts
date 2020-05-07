import {
  createTextArea,
  formatDate,
  hasTextArea,
  injectSchedule
} from './common';
import {Schedule} from './types';

(function instagramExecFn() {
  function execWithSchedule(schedule: Schedule | undefined) {
    const article =
      document.querySelector('div[role="dialog"] article') ??
      document.querySelector('main[role="main"] article');
    if (!article) {
      return;
    }

    const dialogArticle = article.parentElement;
    const context = dialogArticle ?? document;

    const timeElement = article.querySelector('a time');
    const time = timeElement?.getAttribute('datetime');
    const formattedDateString = time ? formatDate(time) : null;
    const permalink = window.location.href;
    const srcs: string[] = [];

    // 1) Go back to first image.
    // 2) Advance and add images to list of srcs.
    // 3) Create and add textarea with all srcs.

    function goToStart() {
      const previousButtonIcon = context.querySelector(
        'button .coreSpriteLeftChevron'
      );
      const previousButton = previousButtonIcon?.parentElement;
      if (previousButton) {
        previousButton.click();
        setTimeout(goToStart, 10);
      } else {
        appendImagesAndAdvance();
      }
    }

    goToStart();

    function appendImagesAndAdvance() {
      const images: HTMLImageElement[] = Array.from(
        context.querySelectorAll('img[srcset], video')
      );
      const newSrcs = images.map(image => image.src);
      newSrcs.forEach(newSrc => {
        if (!srcs.includes(newSrc)) {
          srcs.push(newSrc);
        }
      });

      // If there are more images, go to the next one and run again.
      const nextButtonIcon = context.querySelector(
        'button .coreSpriteRightChevron'
      );
      const nextButton = nextButtonIcon?.parentElement;
      if (nextButton) {
        nextButton.click();
        setTimeout(appendImagesAndAdvance, 10);
      } else {
        // No more images - add textarea.
        if (!hasTextArea(context)) {
          const textArea = createTextArea(
            {date: formattedDateString, fromContent: false},
            permalink,
            srcs,
            schedule,
            '300px'
          );
          context.appendChild(textArea);
        }
      }
    }
  }

  injectSchedule(execWithSchedule);
})();
