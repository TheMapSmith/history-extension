// Check if the current URL is the History page
if (window.location.href.startsWith('chrome://history')) {
  // Stop the default scrolling behavior when loading more entries
  window.addEventListener('scroll', (event) => {
    event.preventDefault();
    event.stopPropagation();
  }, true);

  // Inject the date picker into the History page
  const datePicker = document.createElement('input');
  datePicker.type = 'date';
  datePicker.id = 'custom-date-picker';

  // Find the appropriate place to insert the date picker and insert it
  const historyToolbar = document.querySelector('.toolbar');
  historyToolbar.appendChild(datePicker);

  // Listen for the date picker's change event
  datePicker.addEventListener('change', (event) => {
    const selectedDate = event.target.value;
    // Filter the history entries based on the selected date
    filterHistoryEntriesByDate(selectedDate);
  });
}

// Function to filter history entries based on the selected date
function filterHistoryEntriesByDate(selectedDate) {
  // Get the history entries for the selected date
  chrome.history.search({
    text: '',
    startTime: new Date(selectedDate).getTime(),
    endTime: new Date(selectedDate).getTime() + 86400000, // Add 1 day in milliseconds
    maxResults: 1000 // You can adjust this value as needed
  }, (results) => {
    // Clear the existing history entries
    const historyList = document.querySelector('#content > .history');
    historyList.innerHTML = '';

    // Add the filtered history entries to the history list
    for (const entry of results) {
      // Create a new history entry element
      const entryElement = document.createElement('div');
      entryElement.classList.add('entry');

      // Add the entry's title and URL
      const entryTitle = document.createElement('a');
      entryTitle.href = entry.url;
      entryTitle.target = '_blank';
      entryTitle.textContent = entry.title || entry.url;
      entryElement.appendChild(entryTitle);

      // Append the entry to the history list
      historyList.appendChild(entryElement);
    }
  });
}
