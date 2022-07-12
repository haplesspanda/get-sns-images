import {
  createTextArea,
  formatDate,
  hasTextArea,
  injectSchedule,
} from './common';
import {Schedule} from './types';

(function instagramExecFn() {
  function execWithSchedule(schedule: Schedule | undefined) {
    const permalinkUrl = new URL(window.location.href);
    permalinkUrl.search = '';
    const permalink = permalinkUrl.toString();

    const dialogArticle = document.querySelector('div[role="dialog"] article');
    const mainArticle = document.querySelector('main[role="main"] article');

    const article = dialogArticle ?? mainArticle;
    if (!article) {
      return;
    }

    const isDialogContext = dialogArticle != null;

    const articleParent = article.parentElement;
    const context = articleParent ?? document;

    // Dialog context doesn't let us append below the dialog and still interact with buttons.
    // Need to add to the right pane of the dialog instead.
    const textAreaTarget =
      (isDialogContext
        ? article.querySelector('section')?.parentElement
        : context) ?? document;

    const timeElement = article.querySelector('a time');
    const time = timeElement?.getAttribute('datetime');
    const formattedDateString = time ? formatDate(time) : null;
    const srcs: string[] = [];

    // 1) Go back to first image.
    // 2) Advance and add images to list of srcs.
    // 3) Create and add textarea with all srcs.

    function getNavigationButtons() {
      return Array.from(
        context
          .querySelector('div[role="presentation"]')
          ?.parentElement?.querySelectorAll(':scope > button') || []
      );
    }

    function goToStart() {
      const previousButton = getNavigationButtons().filter(
        button =>
          window.getComputedStyle(button).getPropertyValue('left') === '0px'
      )[0];
      if (previousButton) {
        (previousButton as HTMLButtonElement).click();
        setTimeout(goToStart, 10);
      } else {
        appendImagesAndAdvance();
      }
    }

    goToStart();

    function appendImagesAndAdvance() {
      const images: HTMLImageElement[] = Array.from(
        context.querySelectorAll('img[srcset]')
      );
      const newSrcs = images.map(image => image.src);
      newSrcs.forEach(newSrc => {
        if (newSrc && !srcs.includes(newSrc)) {
          srcs.push(newSrc);
        }
      });

      // If there are more images, go to the next one and run again.
      const nextButton = getNavigationButtons().filter(
        button =>
          window.getComputedStyle(button).getPropertyValue('right') === '0px'
      )[0];
      if (nextButton) {
        (nextButton as HTMLButtonElement).click();
        setTimeout(appendImagesAndAdvance, 10);
      } else {
        // No more images - add textarea.
        if (!hasTextArea(textAreaTarget)) {
          const textArea = createTextArea(
            {date: formattedDateString, fromContent: false},
            permalink,
            srcs,
            schedule,
            '300px',
            '1000' // Absurdly-high flex order to appear at the bottom of right pane.
          );
          textAreaTarget.appendChild(textArea);
        }
      }
    }
  }

  injectSchedule(execWithSchedule);
})();
