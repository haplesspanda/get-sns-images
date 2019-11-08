const textAreaClass = 'image-link-textarea';
const textAreaSelector = `textarea.${textAreaClass}`;

export function createTextArea(date, url, imageUrls, opt_height) {
  let result = `\`${date}\`\n<${url}>\n`;
  imageUrls.forEach(imageUrl => {
    result += imageUrl + '\n';
  });
  
  const textArea = document.createElement('textarea');
  textArea.classList.add(textAreaClass);
  textArea.value = result;
  textArea.style.width = '100%';
  textArea.style.height = opt_height || '100px';
  textArea.style.border = '3px solid red';
  textArea.style['box-sizing'] = 'border-box';

  return textArea;
}

export function getTextArea(node) {
  return node.querySelector(textAreaSelector);
}

export function hasTextArea(node) {
  return !!getTextArea(node);
}
