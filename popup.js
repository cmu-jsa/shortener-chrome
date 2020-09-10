const HOST = 'http://jsa.life';

/**
 * Automatically sets the originalURL variable to the URL of the current tab.
 */
let originalURL = '';
chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
  if (tabs.length > 0) {
    originalURL = tabs[0].url;
  }
});

/**
 * submit event handler (when the shorten button is pressed)
 */
const shortenForm = document.getElementById('shortenForm');
shortenForm.addEventListener('submit', (e) => {
  e.preventDefault();
  new FormData(shortenForm); // triggers a formdata event handled below
});

/**
 * formdata event handler
 */
shortenForm.addEventListener('formdata', (e) => {
  const data = [...e.formData.entries()];
  const shortenedText = data.find(entry => entry[0] === 'shortenedText')[1];
  chrome.storage.sync.get({username: '', password: ''}, (items) => {
    const username = items.username;
    const password = items.password;
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${HOST}/api/shorten`);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', `Basic ${btoa(`${username}:${password}`)}`);
    xhr.onreadystatechange = function() {
      const resultModal = document.getElementById('result');
      if (this.readyState === XMLHttpRequest.DONE) {
        if (this.status === 401) {
          resultModal.innerText = 'Invalid credentials (hint: check options)';
          resultModal.style = 'background-color: red;'
        } else if (this.status !== 200) {
          resultModal.innerText = 'Something went wrong';
          resultModal.style = 'background-color: red;'
        } else {
          const response = JSON.parse(this.response);
          if (response.success) {
            resultModal.innerText = `${originalURL} was shortened to ${response.output}`;
          } else {
            resultModal.innerText = response.output;
            resultModal.style = 'background-color: red;'
          }
        }
      }
    }

    xhr.send(`{"original":"${originalURL}","short":"${shortenedText}"}`);
  });
});
