'use strict';
import {hasTextArea, createTextArea} from './common';

(function tistoryExecFn() {
  // TODO: Need to test on more sites, this works for a few at least
  const title = document.querySelector('#content h1') || document.querySelector('#content h2') || document.querySelector('.title');
  const dateMatch = title.innerText.match(/\b(20)?([0-9]{6})\b/);
  const formattedDate = dateMatch && dateMatch.length >= 3 && dateMatch[2] || null;
  const currentUrl = window.location.href;
  
  const contents = document.querySelector('.contents') || document.querySelector('.article') || document.querySelector('.entry-content');
  const srcs = Array.from(contents.querySelectorAll('img')).map(img => img.getAttribute('src'));
  
  const textareaParent = document.querySelector('#head') || document.querySelector('.entryTitle') || document.querySelector('.inner') || title;
  if (!hasTextArea(textareaParent)) {
    const textArea = createTextArea(formattedDate, currentUrl, srcs, '300px');
    textareaParent.appendChild(textArea);    
  }
})();
