import {createTextArea, formatDate, hasTextArea} from './common';

(function instagramExecFn() {
  const article = document.querySelector('div[role="dialog"] article') || document.querySelector('main[role="main"] article');
  const dialogArticle = article.parentElement;
  const context = dialogArticle || document;  
  
  const time = article.querySelector('a time').getAttribute('datetime');
  const formattedDateString = formatDate(time);    
  const permalink = window.location.href;  
  const srcs: string[] = [];
  
  // 1) Go back to first image.
  // 2) Advance and add images to list of srcs.
  // 3) Create and add textarea with all srcs.
  
  function goToStart() {
    const previousButtonIcon = context.querySelector('button .coreSpriteLeftChevron');
    const previousButton = previousButtonIcon && previousButtonIcon.parentElement;
    if (previousButton) {
      previousButton.click();
      setTimeout(goToStart, 0);
    } else {
      appendImagesAndAdvance();
    }
  }
  
  goToStart();
  
  function appendImagesAndAdvance() {
    const images = Array.from(context.querySelectorAll('img[srcset], video')) as HTMLImageElement[];
    const newSrcs = images.map(image => image.src);
    newSrcs.forEach(newSrc => {
      if (!srcs.includes(newSrc)) {
        srcs.push(newSrc);
      }
    });
    
    // If there are more images, go to the next one and run again.
    const nextButtonIcon = context.querySelector('button .coreSpriteRightChevron');
    const nextButton = nextButtonIcon && nextButtonIcon.parentElement;
    if (nextButton) {
      nextButton.click();
      setTimeout(appendImagesAndAdvance, 10);
    } else {
      // No more images - add textarea.
      if (!hasTextArea(context)) {
        const textArea = createTextArea(formattedDateString, permalink, srcs, '300px');
        
        const container = context === document ? document.querySelector('article').parentElement : context;
        container.appendChild(textArea);
      }
    }
  }
})();
