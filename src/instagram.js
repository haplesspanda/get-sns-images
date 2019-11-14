'use strict';
import {createTextArea, formatDate, getTextArea, hasTextArea} from './common';

(function instagramExecFn() {  
  function appendImagesAndAdvance() {
    const srcs = [];

    const article = document.querySelector('div[role="dialog"] article') || document.querySelector('main[role="main"] article');
    const dialogArticle = article.parentElement;
    const context = dialogArticle || document;  
    
    const time = article.querySelector('a time').getAttribute('datetime');
    const formattedDateString = formatDate(time);
   
    const newSrcs = [`\`${formattedDateString}\``, `<${window.location.href}>`].concat(Array.from(context.querySelectorAll('img[srcset]')).map(image => image.src));
        
    if (!hasTextArea(context)) {
      const textArea = createTextArea(formattedDateString, window.location.href, [], '300px');
      
      const container = context === document ? document.querySelector('article').parentElement : context;
      container.appendChild(textArea);
    }

    const textArea = getTextArea(context);
    const oldSrcs = textArea.value.split('\n').filter(src => src);
    newSrcs.forEach(newSrc => {
      if (!oldSrcs.includes(newSrc)) {
        oldSrcs.push(newSrc);
      }
    });
    
    textArea.value = oldSrcs.join('\n');
    
    // If there are more images, go to the next one and run again.
    const nextButtonIcon = context.querySelector('button .coreSpriteRightChevron');
    const nextButton = nextButtonIcon && nextButtonIcon.parentElement;
    if (nextButton) {
      nextButton.click();
      setTimeout(appendImagesAndAdvance, 0);
    }
  }
  
  appendImagesAndAdvance();
})();
