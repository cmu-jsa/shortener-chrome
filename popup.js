const host = 'http://localhost:5000';
const username = 'riki';
const password = 'riki';

/**
 * Automatically sets the originalURL variable to the URL of the current tab.
 */
let originalURL = '';
chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
  if (tabs.length > 0) {
    originalURL = tabs[0].url;
  }
});

const shortenForm = document.getElementById('shortenForm');
shortenForm.addEventListener('submit', (e) => {
  e.preventDefault();
  new FormData(shortenForm); // triggers a formdata event handled below
});

shortenForm.addEventListener('formdata', (e) => {
  const data = [...e.formData.entries()];
  const shortenedText = data.find(entry => entry[0] === 'shortenedText')[1];
  const xhr = new XMLHttpRequest();
  xhr.open('POST', `${host}/api/shorten`);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('Authorization', `Basic ${btoa(`${username}:${password}`)}`);
  xhr.onreadystatechange = function() {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      const response = JSON.parse(this.response);
      const resultModal = document.getElementById('result');
      if (response.success) {
        resultModal.innerText = `${originalURL} was shortened to ${response.output}`;
      } else {
        resultModal.innerText = response.output;
        resultModal.style = 'background-color: red;'
      }
    }
  }

  xhr.send(`{"original":"${originalURL}","short":"${shortenedText}"}`);
});
