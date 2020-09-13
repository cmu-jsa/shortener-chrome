const HOST = 'https://jsa-life.herokuapp.com';

function shortenURL(info) {
  chrome.storage.sync.get({
    username: '',
    password: '',
  }, (items) => {
    const username = items.username;
    const password = items.password;
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${HOST}/api/shorten`);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', `Basic ${btoa(`${username}:${password}`)}`);
    xhr.onreadystatechange = function() {
      if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
        const response = JSON.parse(this.response);
        if (response.success) {
          copyToClipboard(response.output);
        }
      }
    }

    xhr.send(`{"original":"${info.linkUrl}"}`);
  });
}

/**
 * todo: would love to use navigator.clipboard.writeText(text),
 * but can't as of 9/13/2020
 */
function copyToClipboard(text) {
  const input = document.createElement('textarea');
  document.body.appendChild(input);
  input.value = text;
  input.focus();
  input.select();
  document.execCommand('Copy');
  input.remove();
}

/**
 * Create the context menu (pops up on right-click)
 */
chrome.contextMenus.create({
  id: 'JSA URL Shortener Extension Context Menu',
  title: 'Shorten URL and copy to clipboard',
  contexts: ['link'],
  targetUrlPatterns: ['*://*/*'],
  onclick: shortenURL
});
