import {
  createTextArea,
  extractDate,
  hasTextArea,
  injectSchedule
} from './common';
import {Schedule} from './types';

(function naverPostExecFunction() {
  function execWithSchedule(schedule: Schedule | undefined) {
    const post = document.querySelector('.se_doc_viewer');
    if (!post) {
      return;
    }
    const images = Array.from(post.querySelectorAll('img.se_mediaImage'));
    const imageUrls = images.map(image => {
      const imageSrc = image.getAttribute('src') || '';
      const url = new URL(imageSrc);
      url.searchParams.delete('type');
      return url.toString();
    });

    const title = post.querySelector('.se_documentTitle');
    if (!title) {
      return;
    }

    const titleDate = extractDate(title);
    const publishDate = extractDate(post.querySelector('.se_publishDate'));

    const textAreaContainer = title.querySelector('.se_editArea');
    if (textAreaContainer && !hasTextArea(textAreaContainer)) {
      const textArea = createTextArea(
        titleDate || publishDate,
        window.location.href,
        imageUrls,
        schedule,
        '300px'
      );
      textAreaContainer.appendChild(textArea);
    }
  }

  injectSchedule(execWithSchedule);
})();
