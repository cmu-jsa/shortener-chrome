const HOST = 'https://jsa-life.herokuapp.com';

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
 * Handles clicks to copy shortened url
 */
const grandResult = document.getElementById('grandResult');
grandResult.addEventListener('click', (e) => {
  navigator.clipboard.writeText(e.target.value);
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
      const successModal = document.getElementById('resultSuccess');
      const failureModal = document.getElementById('resultFailure');
      if (this.readyState === XMLHttpRequest.DONE) {
        if (this.status === 401) {
          failureModal.innerText = 'Invalid credentials (hint: check options)';
          switchModals(failureModal, successModal);
        } else if (this.status !== 200) {
          failureModal.innerText = 'Something went wrong';
          switchModals(failureModal, successModal);
        } else {
          const response = JSON.parse(this.response);
          if (response.success) {
            grandResult.value = response.output;
            grandResult.innerText = response.output;
            switchModals(successModal, failureModal);
          } else {
            failureModal.innerText = response.output;
            switchModals(failureModal, successModal);
          }
        }
      }
    }

    xhr.send(`{"original":"${originalURL}","short":"${shortenedText}"}`);
  });
});

function switchModals(show, noShow) {
  show.classList.remove('hidden');
  noShow.classList.add('hidden');
}
