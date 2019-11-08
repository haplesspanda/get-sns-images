(function instagramExecFn() {
  const textareaClass = 'image-link-textarea'; // TODO: commonize this to other sites too
  const textareaSelector = `textarea.${textareaClass}`;
  
  function appendImagesAndAdvance() {
    const srcs = [];

    const article = document.querySelector('div[role="dialog"] article') || document.querySelector('main[role="main"] article');
    const dialogArticle = article.parentElement;
    const context = dialogArticle || document;  
    
    const time = article.querySelector('a time').getAttribute('datetime');
    const dateString = new Date(time).toLocaleDateString('ko', {timeZone: 'Asia/Seoul', year: '2-digit', month: '2-digit', day: '2-digit'});
    const formattedDateString = dateString.replace(/\./g, '').replace(/ /g, '');  // TODO: Not sure why this doesn't work in one pass. Also commonize.
   
    const newSrcs = [`\`${formattedDateString}\``, `<${window.location.href}>`].concat(Array.from(context.querySelectorAll('img[srcset]')).map(image => image.src));
        
    if (!context.querySelector(textareaSelector)) {
      const textArea = document.createElement('textarea');
      textArea.classList.add(textareaClass);
      textArea.style.border = '3px solid red';
      textArea.style.flex = '0 0 300px';
      textArea.style.width = '100%';
      textArea.style['box-sizing'] = 'border-box';
      
      const container = context === document ? document.querySelector('article').parentElement : context;
      container.appendChild(textArea);
    }
    
    const textArea = context.querySelector(textareaSelector);
    const oldSrcs = textArea.value.split('\n');
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