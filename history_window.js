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

    const processedResults = [];

    const processEntry = (entry) => {
      return new Promise((resolve) => {
        chrome.history.getVisits({ url: entry.url }, (visits) => {
          visits.forEach((visit) => {
            if (visit.visitTime >= new Date(selectedDate).getTime() &&
              visit.visitTime <= new Date(selectedDate).getTime() + 86400000) {
              const newEntry = Object.assign({}, entry);
              newEntry.visitTime = visit.visitTime;
              processedResults.push(newEntry);
            }
          });
          resolve();
        });
      });
    };

    const promises = results.map(processEntry);

    Promise.all(promises).then(() => {
      // Sort the history items by visitTime (in descending order)
      processedResults.sort((a, b) => b.visitTime - a.visitTime);

      for (const entry of processedResults) {
        const entryElement = document.createElement('div');
        entryElement.classList.add('entry');

        // Format the visited time for display purposes
        const visitedTime = new Date(entry.visitTime);
        const timeString = visitedTime.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' });

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
  });
}
