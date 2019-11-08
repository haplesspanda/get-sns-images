// TODO: Doesn't work because haven't figured out modularizing yet.

export function createTextArea(date, url, imageUrls) {
  let result = `\`${structuredItem.date}\`\n<${structuredItem.tweetUrl}>\n`;
  structuredItem.imageUrls.forEach(imageUrl => {
    result += imageUrl + '\n';
  });
  
  const textArea = document.createElement('textarea');
  textArea.value = result;
  textArea.style.width = '100%';
  textArea.style.height = '100px';
  textArea.style.border = '3px solid red';
  textArea.style['box-sizing'] = 'border-box';

  return result;
}