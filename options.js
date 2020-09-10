function saveOptions() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  chrome.storage.sync.set({username, password}, () => {
    const status = document.getElementById('status');
    status.textContent = 'saved.';
    setTimeout(() => {
      status.textContent = '';
    }, 5 * 1000);
  });
}

function restoreOptions() {
  // Use default empty username and password
  chrome.storage.sync.get({
    username: '',
    password: ''
  }, (items) => {
    document.getElementById('username').value = items.username;
    document.getElementById('password').value = items.password;
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);