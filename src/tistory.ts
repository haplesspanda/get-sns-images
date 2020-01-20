import {
  createTextArea,
  extractDate,
  hasTextArea,
  injectSchedule
} from './common';
import {Schedule} from './types';

(function tistoryExecFn() {
  function execWithSchedule(schedule: Schedule | undefined) {
    // TODO: Need to test on more sites, this works for a few at least
    const title =
      document.querySelector('#content h1') ??
      document.querySelector('#content h2') ??
      document.querySelector('.title');
    if (!title) {
      return;
    }
    const formattedDate = extractDate(title);
    const currentUrl = window.location.href;

    const contents =
      document.querySelector('.contents') ??
      document.querySelector('.article') ??
      document.querySelector('.entry-content');
    if (!contents) {
      return;
    }

    const srcs: string[] = Array.from(contents.querySelectorAll('img')).map(
      img => img.getAttribute('src')!
    );

    const textareaParent =
      document.querySelector('#head') ??
      document.querySelector('.entryTitle') ??
      document.querySelector('.inner') ??
      title;
    if (!hasTextArea(textareaParent)) {
      const textArea = createTextArea(
        formattedDate,
        currentUrl,
        srcs,
        schedule,
        '300px'
      );
      textareaParent.appendChild(textArea);
    }
  }

  injectSchedule(execWithSchedule);
})();
