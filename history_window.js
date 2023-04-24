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

    // Sort the history items by lastVisitTime (in descending order)
    results.sort((a, b) => b.lastVisitTime - a.lastVisitTime);

    for (const entry of results) {
      const entryElement = document.createElement('div');
      entryElement.classList.add('entry');

      // Format the visited time
      const visitedTime = new Date(entry.lastVisitTime);
      const timeString = visitedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Create a span element to display the visited time
      const visitedTimeElement = document.createElement('span');
      visitedTimeElement.textContent = `${timeString} - `;
      entryElement.appendChild(visitedTimeElement);

      // Create an img element for the favicon
      const faviconElement = document.createElement('img');
      faviconElement.src = `https://s2.googleusercontent.com/s2/favicons?domain=${entry.url}`;
      faviconElement.alt = '';
      faviconElement.classList.add('favicon');
      entryElement.appendChild(faviconElement);

      const entryTitle = document.createElement('a');
      entryTitle.href = entry.url;
      entryTitle.target = '_blank';
      entryTitle.textContent = entry.title || entry.url;
      entryElement.appendChild(entryTitle);

      historyList.appendChild(entryElement);
    }
  });
}
