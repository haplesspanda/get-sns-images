'use strict';
import {hasTextArea, createTextArea} from './common';

(function tistoryExecFn() {
  // TODO: make this work for old tistory too?  Need to test on more sites.
  const dateMatch = document.querySelector('.title').innerText.match(/\b(20)?([0-9]{6})\b/);
  const formattedDate = dateMatch && dateMatch.length >= 3 && dateMatch[2] || null;
  const currentUrl = window.location.href;
  const srcs = Array.from(document.querySelectorAll('.contents img')).map(img => img.getAttribute('src'));
  
  const title = document.querySelector('.entryTitle');
  if (!hasTextArea(title)) {
    const textArea = createTextArea(formattedDate, currentUrl, srcs, '300px');
    title.appendChild(textArea);    
  }
})();
