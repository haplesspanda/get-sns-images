(function tistoryExecFn() {
  const dateMatch = document.querySelector('.title').innerText.match(/\b(20)?([0-9]{6})\b/);
  const formattedDate = dateMatch && dateMatch.length >= 3 && dateMatch[2] || null;
  const currentUrl = window.location.href;
  const srcs = Array.from(document.querySelectorAll('.contents img')).map(img => img.getAttribute('src'));
  
  const textArea = document.createElement('textarea');
  textArea.style.display = 'block';
  textArea.style.border = '3px solid red';
  textArea.style.width = '100%';
  textArea.style.height = '300px';
  
  textArea.value = `\`${formattedDate}\`
<${currentUrl}>
${srcs.join('\n')}`;
  
  const title = document.querySelector('.entryTitle');
  if (!title.querySelector('textarea')) {
    title.appendChild(textArea);    
  }
})();