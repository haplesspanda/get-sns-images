const textAreaClass = 'image-link-textarea';
const textAreaSelector = `textarea.${textAreaClass}`;

export function createTextArea(date, url, imageUrls, opt_height) {
  let result = `\`${date}\`\n<${url}>\n`;
  imageUrls.forEach((imageUrl, index) => {
    // Split into sets of 5 due to discord embed limit.
    if (index > 0 && index  % 5 === 0) {
      result += '\n^\n';
    }
    
    result += imageUrl + '\n';    
  });
  
  const textAreaContainer = document.createElement('div');
  textAreaContainer.style.width = '100%';
  textAreaContainer.style.border = '3px solid red';
  textAreaContainer.style['box-sizing'] = 'border-box';
  
  const textArea = document.createElement('textarea');
  textArea.classList.add(textAreaClass);
  textArea.style.display = 'block';
  textArea.style.width = '100%';
  textArea.style['box-sizing'] = 'border-box';
  textArea.value = result;
  textArea.style.height = opt_height || '100px';
  
  textAreaContainer.appendChild(textArea);
  
  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style['flex-direction'] = 'row';
  buttonContainer.style.width = '100%';
  
  textAreaContainer.appendChild(buttonContainer);
  
  const copyButton = document.createElement('button');
  copyButton.innerText = 'Copy';
  copyButton.style.flex = '1';
  buttonContainer.appendChild(copyButton);
  // TODO: Should also handle keyboard events
  copyButton.onclick = () => {
    textArea.select();
    document.execCommand('copy');
  };
  
  const openButton = document.createElement('button');
  openButton.innerText = 'Open all';  
  openButton.style.flex = '1';
  buttonContainer.appendChild(openButton);
  // TODO: Should also handle keyboard events
  openButton.onclick = () => {
    chrome.runtime.sendMessage({type: 'opentabs', urls: imageUrls});
  };

  return textAreaContainer;
}

export function hasTextArea(node) {
  return !!node.querySelector(textAreaSelector);
}

export function formatDate(datetime) {
  const dateString = new Date(datetime).toLocaleDateString('ko', {timeZone: 'Asia/Seoul', year: '2-digit', month: '2-digit', day: '2-digit'});
  const formattedDateString = dateString.replace(/\./g, '').replace(/ /g, '');  // TODO: Not sure why this doesn't work in one pass.
  return formattedDateString;
}
