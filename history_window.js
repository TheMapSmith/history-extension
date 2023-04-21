const datePicker = document.getElementById('custom-date-picker');
const historyList = document.getElementById('custom-history-list');
const closeButton = document.getElementById('close-button');

datePicker.addEventListener('change', (event) => {
  const selectedDate = event.target.value;
  filterHistoryEntriesByDate(selectedDate);
});

closeButton.addEventListener('click', () => {
  window.close();
});

function filterHistoryEntriesByDate(selectedDate) {
  chrome.history.search({
    text: '',
    startTime: new Date(selectedDate).getTime(),
    endTime: new Date(selectedDate).getTime() + 86400000,
    maxResults: 1000
  }, (results) => {
    historyList.innerHTML = '';

    for (const entry of results) {
      const entryElement = document.createElement('div');
      entryElement.classList.add('entry');

      const entryTitle = document.createElement('a');
      entryTitle.href = entry.url;
      entryTitle.target = '_blank';
      entryTitle.textContent = entry.title || entry.url;
      entryElement.appendChild(entryTitle);

      historyList.appendChild(entryElement);
    }
  });
}
