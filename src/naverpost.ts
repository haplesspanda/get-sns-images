import {createTextArea, hasTextArea} from './common';

(function naverPostExecFunction() {
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

  // TODO: Commonize date matching from post text content (twitter, tistory)
  const titleDateMatch = title?.textContent?.match(/\b(20)?([0-9]{6})\b/);
  const titleDate =
    (titleDateMatch && titleDateMatch.length >= 3 && titleDateMatch[2]) || null;

  const publishDateElement = post.querySelector('.se_publishDate');
  const publishDateMatch = publishDateElement?.textContent?.match(
    /20([0-9]{2}).([0-9]{2}).([0-9]{2})/
  );
  const publishDate =
    publishDateMatch && publishDateMatch.length === 4
      ? publishDateMatch[1] + publishDateMatch[2] + publishDateMatch[3]
      : null;

  const textAreaContainer = title.querySelector('.se_editArea');
  if (textAreaContainer && !hasTextArea(textAreaContainer)) {
    const textArea = createTextArea(
      titleDate || publishDate,
      window.location.href,
      imageUrls,
      '300px'
    );
    textAreaContainer.appendChild(textArea);
  }
})();
