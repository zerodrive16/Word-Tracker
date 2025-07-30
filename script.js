// This array will hold all words loaded from localStorage
let allWords = [];

// ----------- Helper Functions for Dates -----------

// Get a date string in "YYYY-MM-DD" format
function getDateString(date) {
  return date.toISOString().split('T')[0];
}

// Check if two dates are the same day
function isSameDay(date1, date2) {
  return getDateString(date1) === getDateString(date2);
}

// Check if a date is yesterday
function isYesterday(date) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(date, yesterday);
}

// Check if a date is within the last 7 days (but not today or yesterday)
function isThisWeek(date) {
  const today = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 7);
  return date > weekAgo && date < today && !isSameDay(date, today) && !isYesterday(date);
}

// ----------- Sidebar Rendering -----------

// Show words in the sidebar, grouped by when they were added
function renderSidebar(words) {
  // Get the sidebar sections
  const recentDiv = document.getElementById('sidebarRecent');
  const yesterdayDiv = document.getElementById('sidebarYesterday');
  const weekDiv = document.getElementById('sidebarWeek');

  // Clear previous content
  recentDiv.innerHTML = '';
  yesterdayDiv.innerHTML = '';
  weekDiv.innerHTML = '';

  // Flags to check if we found words for each section
  let foundRecent = false;
  let foundYesterday = false;
  let foundWeek = false;

  // Go through all words, newest first
  words.slice().reverse().forEach(entry => {
    // Use the date property, or today if missing
    const entryDate = entry.date ? new Date(entry.date) : new Date();
    // This is how each word will look in the sidebar
    const wordHtml = `<span class="sidebar-word" title="${entry.word}">${entry.word}</span>`;

    // Decide which section it belongs to
    if (isSameDay(entryDate, new Date())) {
      recentDiv.innerHTML += wordHtml;
      foundRecent = true;
    } else if (isYesterday(entryDate)) {
      yesterdayDiv.innerHTML += wordHtml;
      foundYesterday = true;
    } else if (isThisWeek(entryDate)) {
      weekDiv.innerHTML += wordHtml;
      foundWeek = true;
    }
  });

  // If no words for a section, show a message
  if (!foundRecent) recentDiv.innerHTML = '<span class="text-muted small">No words today</span>';
  if (!foundYesterday) yesterdayDiv.innerHTML = '<span class="text-muted small">No words yesterday</span>';
  if (!foundWeek) weekDiv.innerHTML = '<span class="text-muted small">No words this week</span>';
}

// ----------- Main List Rendering -----------

// Show all words and their sentences in the main list
function renderWords(words) {
  const wordList = document.getElementById('wordList');
  wordList.innerHTML = '';

  if (words.length === 0) {
    wordList.innerHTML = `<li class="list-group-item text-center text-muted">No words saved yet.</li>`;
    return;
  }

  words.forEach((entry, idx) => {
    const li = document.createElement('li');
    li.className = 'list-group-item';
    li.innerHTML = `
      <span class="word-title">${entry.word}</span>
      <button class="btn btn-sm btn-danger" onclick="deleteWord(${idx})" title="Delete">
        <i class="bi bi-trash"></i> Delete
      </button>
      <ul class="sentences-list">
        <li>${entry.sentences[0]}</li>
        <li>${entry.sentences[1]}</li>
        <li>${entry.sentences[2]}</li>
      </ul>
    `;
    wordList.appendChild(li);
  });
}

// ----------- Load Words from Storage -----------

// Load words from localStorage and show them
function loadWords() {
  // Get words from localStorage, or use an empty array if none
  allWords = JSON.parse(localStorage.getItem('words') || '[]');
  renderWords(allWords);
  renderSidebar(allWords);
}

// ----------- Save New Word -----------

// When the form is submitted, save the new word and sentences
document.getElementById('wordForm').addEventListener('submit', function(e) {
  e.preventDefault();

  // Get the word and sentences from the form
  const word = document.getElementById('word').value.trim();
  const sentences = [
    document.getElementById('sentence1').value.trim(),
    document.getElementById('sentence2').value.trim(),
    document.getElementById('sentence3').value.trim()
  ];

  // If any field is empty, do nothing
  if (!word || sentences.some(s => !s)) return;

  // Get the current list of words
  const words = JSON.parse(localStorage.getItem('words') || '[]');
  // Add the new word, with today's date
  words.push({ word, sentences, date: new Date().toISOString() });
  // Save back to localStorage
  localStorage.setItem('words', JSON.stringify(words));

  // Reset the form and reload the lists
  this.reset();
  loadWords();
  document.getElementById('searchInput').value = '';
});

// ----------- Delete a Word -----------

// Remove a word by its index
function deleteWord(idx) {
  const words = JSON.parse(localStorage.getItem('words') || '[]');
  words.splice(idx, 1);
  localStorage.setItem('words', JSON.stringify(words));
  loadWords();
  document.getElementById('searchInput').value = '';
}

// ----------- Search Functionality -----------

// When the user types in the search box, filter the list
document.getElementById('searchInput').addEventListener('input', function() {
  const searchTerm = this.value.trim().toLowerCase();
  // Only show words that include the search term
  const filtered = allWords.filter(entry => entry.word.toLowerCase().includes(searchTerm));
  renderWords(filtered);
  renderSidebar(filtered); // You can use allWords here if you want the sidebar to always show all words
});

// ----------- Initial Load -----------

// When the page loads, show all words and sidebar
loadWords();