chrome.action.onClicked.addListener((tab) => {
  chrome.windows.create({
    url: 'history_window.html',
    type: 'popup',
    width: 1000,
    height: 600
  });
});
