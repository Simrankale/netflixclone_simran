/* ==========================================================================
   STREAMFLIX SEARCH LOGIC (js/search.js)
   Live debounced search, genre pills, dynamic grid rendering.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initSearchPage();
});

function initSearchPage() {
  const searchInput = document.getElementById('search-input');
  const searchResultsGrid = document.getElementById('search-results-grid');
  const searchResultsTitle = document.getElementById('search-results-title');
  const emptyState = document.getElementById('search-empty');
  const genrePills = document.querySelectorAll('.search-genre-pill');

  if (!searchInput || !searchResultsGrid) return;

  // Check URL parameters for query
  const urlParams = new URLSearchParams(window.location.search);
  const initialQuery = urlParams.get('q');

  if (initialQuery) {
    searchInput.value = initialQuery;
    performSearch(initialQuery);
  } else {
    performSearch(''); // Show all or default trending
  }

  // Debounced input handler
  let debounceTimeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      performSearch(e.target.value.trim());
    }, 250);
  });

  // Genre pills handler
  genrePills.forEach(pill => {
    pill.addEventListener('click', () => {
      genrePills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const genre = pill.getAttribute('data-genre');
      if (genre === 'all') {
        searchInput.value = '';
        performSearch('');
      } else {
        searchInput.value = genre;
        performSearch(genre);
      }
    });
  });

  function performSearch(query) {
    let results = [];
    if (!query) {
      results = moviesData; // Display all content if input is empty
      if (searchResultsTitle) searchResultsTitle.textContent = 'All StreamFlix Titles';
    } else {
      results = searchData(query);
      if (searchResultsTitle) searchResultsTitle.textContent = `Search results for "${query}" (${results.length})`;
    }

    if (results.length === 0) {
      searchResultsGrid.style.display = 'none';
      if (emptyState) emptyState.style.display = 'flex';
    } else {
      if (emptyState) emptyState.style.display = 'none';
      searchResultsGrid.style.display = 'grid';
      searchResultsGrid.innerHTML = results.map(movie => createMovieCardHTML(movie)).join('');
    }
  }
}
