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

    const extraInfoRequest = new XMLHttpRequest();
    extraInfoRequest.addEventListener('load', function (this: XMLHttpRequest) {
      const json = JSON.parse(this.responseText);
      function getVideoUrl(index: number) {
        let result = '';
        try {
          const graphqlEdges =
            json['graphql']['shortcode_media']['edge_sidecar_to_children'][
              'edges'
            ];
          if (index >= graphqlEdges.length) {
            return '';
          }

          result = graphqlEdges[index]['node']['video_url'];
        } catch (e) {
          console.error('failed to get non-blob video url');
        }
        return result;
      }

      const dialogArticle = document.querySelector(
        'div[role="dialog"] article'
      );
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
          // Handle blob srcs.
          let srcToAdd = newSrc;
          if (newSrc.startsWith('blob:')) {
            srcToAdd = getVideoUrl(srcs.length);
          }

          if (srcToAdd && !srcs.includes(srcToAdd)) {
            srcs.push(srcToAdd);
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
    });
    const graphqlUrl = new URL(permalink);
    graphqlUrl.searchParams.set('__a', '1');
    extraInfoRequest.open('GET', graphqlUrl.toString(), true);
    extraInfoRequest.send();
  }

  injectSchedule(execWithSchedule);
})();
