const textAreaClass = 'image-link-textarea';
const textAreaSelector = `textarea.${textAreaClass}`;

export function createTextArea(
  date: string | null,
  url: string | null,
  imageUrls: string[],
  opt_height?: string
): HTMLElement {
  const renderedDate = date ?? 'unknown date';
  const renderedUrl = url ?? 'unknown url';

  let result = `\`${renderedDate}\`\n<${renderedUrl}>\n`;
  imageUrls.forEach((imageUrl, index) => {
    // Split into sets of 5 due to discord embed limit.
    if (index > 0 && index % 5 === 0) {
      result += '\n^\n';
    }

    result += imageUrl + '\n';
  });

  const textAreaContainer = document.createElement('div');
  textAreaContainer.style.width = '100%';
  textAreaContainer.style.border = '3px solid red';
  textAreaContainer.style.boxSizing = 'border-box';

  const textArea = document.createElement('textarea');
  textArea.classList.add(textAreaClass);
  textArea.style.display = 'block';
  textArea.style.width = '100%';
  textArea.style.boxSizing = 'border-box';
  textArea.value = result;
  textArea.style.height = opt_height ?? '100px';

  textAreaContainer.appendChild(textArea);

  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.flexDirection = 'row';
  buttonContainer.style.width = '100%';

  textAreaContainer.appendChild(buttonContainer);

  function createButton(text: string, handler: (event: Event) => void) {
    const button = document.createElement('button');
    button.innerText = text;
    button.style.flex = '1';
    button.onclick = handler;
    return button;
  }

  const copyButton = createButton('Copy', () => {
    textArea.select();
    document.execCommand('copy');
  });
  buttonContainer.appendChild(copyButton);

  const openAllButtonText =
    imageUrls.length > 5 ? `Open all (${imageUrls.length})` : 'Open all';
  const openButton = createButton(openAllButtonText, () => {
    chrome.runtime.sendMessage({type: 'opentabs', urls: imageUrls});
  });
  buttonContainer.appendChild(openButton);

  return textAreaContainer;
}

export function hasTextArea(node: Document | Element): boolean {
  return !!node.querySelector(textAreaSelector);
}

export function extractDate(element: Element | null): string | null {
  const dateMatch = element?.textContent?.match(
    /(20)?([0-9]{2})\.?([0-9]{2})\.?([0-9]{2})/
  );
  return dateMatch && dateMatch.length === 5
    ? dateMatch[2] + dateMatch[3] + dateMatch[4]
    : null;
}

export function formatDate(datetime: string): string {
  const dateString = new Date(datetime).toLocaleDateString('ko', {
    timeZone: 'Asia/Seoul',
    year: '2-digit',
    month: '2-digit',
    day: '2-digit'
  });
  const formattedDateString = dateString.replace(/(\.|\s)/g, '');
  return formattedDateString;
}
