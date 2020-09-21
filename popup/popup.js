/**
 * Copyright 2020 Japanese Student Association at Carnegie Mellon University.
 * All rights reserved. MIT license.
 */

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
  chrome.storage.sync.get({
    username: '',
    password: '',
    autoCopy: false,
  }, (items) => {
    const username = items.username;
    const password = items.password;
    const autoCopy = items.autoCopy;
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${HOST}/api/shorten`);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', `Basic ${btoa(`${username}:${password}`)}`);
    xhr.onreadystatechange = function() {
      if (this.readyState === XMLHttpRequest.DONE) {
        if (this.status === 401) {
          showFailureModal('Invalid credentials (hint: check options)');
        } else if (this.status !== 200) {
          showFailureModal('Something went wrong');
        } else {
          const response = JSON.parse(this.response);
          handleResponse(response, autoCopy);
        }
      }
    }

    xhr.send(`{"original":"${originalURL}","short":"${shortenedText}"}`);
  });
});

/**
 * Reflect the response status to modals
 */
function handleResponse(response, autoCopy) {
  if (!response.success) {
    showFailureModal(response.output);
  } else {
    const successModal = document.getElementById('resultSuccess');
    const failureModal = document.getElementById('resultFailure');
    grandResult.value = response.output;
    grandResult.innerText = response.output;
    toggleModals(successModal, failureModal);
    if (autoCopy) {
      navigator.clipboard.writeText(response.output);
      const copyPrompt = document.getElementById('copyPrompt');
      copyPrompt.innerText = 'Link automatically copied to clipboard\nClick on link to copy again';
    }
  }
}

/**
 * Draw the failure modal
 */
function showFailureModal(text) {
  const successModal = document.getElementById('resultSuccess');
  const failureModal = document.getElementById('resultFailure');
  failureModal.innerText = text;
  toggleModals(failureModal, successModal);
}

/**
 * Un-hide the modal passed in as show, and hide the one passed in as noShow
 *
 * @param show
 * @param noShow
 */
function toggleModals(show, noShow) {
  show.classList.remove('hidden');
  noShow.classList.add('hidden');
}
