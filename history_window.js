const datePicker = document.getElementById('custom-date-picker');
const historyList = document.getElementById('custom-history-list');
const closeButton = document.getElementById('close-button');

datePicker.addEventListener('change', (event) => {
  const selectedDate = event.target.value;
  loadHistoryEntries(selectedDate);
});

closeButton.addEventListener('click', () => {
  window.close();
});

function loadHistoryEntries(selectedDate) {
  const selectedDateObj = new Date(selectedDate);
  selectedDateObj.setMinutes(selectedDateObj.getMinutes() - selectedDateObj.getTimezoneOffset());
  const startTime = selectedDateObj.setHours(0, 0, 0, 0);
  const endTime = selectedDateObj.setHours(23, 59, 59, 999);

  searchHistory(startTime, endTime, (results) => {
    processHistoryEntries(results, startTime, endTime).then((processedResults) => {
      displayHistoryEntries(processedResults);
    });
  });
}

function searchHistory(startTime, endTime, callback) {
  chrome.history.search({
    text: '',
    startTime: startTime,
    endTime: endTime,
    maxResults: 1000
  }, (results) => {
    callback(results);
  });
}

function processHistoryEntries(results, startTime, endTime) {
  return new Promise(async (resolve) => {
    const processedResults = [];

    for (const entry of results) {
      const visits = await getVisits(entry, startTime, endTime);
      for (const visit of visits) {
        if (visit.visitTime >= startTime && visit.visitTime <= endTime) {
          const newEntry = Object.assign({}, entry);
          newEntry.visitTime = visit.visitTime;

          // Format the visited time for display purposes
          const visitedTime = new Date(newEntry.visitTime);
          const timeString = visitedTime.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' });
          newEntry.displayTime = timeString;

          // Check for duplicates before adding to the processedResults array
          const duplicate = processedResults.some(existingEntry =>
            existingEntry.title === newEntry.title &&
            existingEntry.displayTime === newEntry.displayTime
          );

          if (!duplicate) {
            processedResults.push(newEntry);
          }
        }
      }
    }

    // Sort the processedResults array by visitTime in descending order
    processedResults.sort((a, b) => b.visitTime - a.visitTime);

    resolve(processedResults);
  });
}

function displayHistoryEntries(processedResults) {
  historyList.innerHTML = '';

  // Calculate and display the earliest and latest times
  const earliestTimeElement = document.getElementById('earliest-time');
  const latestTimeElement = document.getElementById('latest-time');
  const earliestTime = new Date(processedResults[processedResults.length - 1].visitTime).toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' });
  const latestTime = new Date(processedResults[0].visitTime).toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' });
  earliestTimeElement.textContent = `Earliest Time: ${earliestTime}`;
  latestTimeElement.textContent = `Latest Time: ${latestTime}`;

  for (const entry of processedResults) {
    const entryElement = document.createElement('div');
    entryElement.classList.add('entry');

    // Create a span element to display the visited time
    const visitedTimeElement = document.createElement('span');
    visitedTimeElement.textContent = `${entry.displayTime} - `;
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
}

function getVisits(entry, startTime, endTime) {
  return new Promise((resolve) => {
    chrome.history.getVisits({ url: entry.url }, (visits) => {
      const filteredVisits = visits.filter(visit => visit.visitTime >= startTime && visit.visitTime <= endTime);
      resolve(filteredVisits);
    });
  });
}
