/* ==========================================================================
   STREAMFLIX MY LIST MANAGER (js/mylist.js)
   LocalStorage persistent storage for user saved movies & TV shows.
   ========================================================================== */

const STORAGE_KEY_MYLIST = 'streamflix_mylist';

function getMyList() {
  const stored = localStorage.getItem(STORAGE_KEY_MYLIST);
  return stored ? JSON.parse(stored) : [];
}

function saveMyList(list) {
  localStorage.setItem(STORAGE_KEY_MYLIST, JSON.stringify(list));
}

function isInMyList(movieId) {
  const list = getMyList();
  return list.includes(movieId);
}

function addToMyList(movieId) {
  const list = getMyList();
  if (!list.includes(movieId)) {
    list.push(movieId);
    saveMyList(list);
    showToast('Added to My List');
  }
}

function removeFromMyList(movieId) {
  let list = getMyList();
  if (list.includes(movieId)) {
    list = list.filter(id => id !== movieId);
    saveMyList(list);
    showToast('Removed from My List');
  }
}

function toggleMyList(movieId) {
  if (isInMyList(movieId)) {
    removeFromMyList(movieId);
    return false;
  } else {
    addToMyList(movieId);
    return true;
  }
}

function renderMyListPage() {
  const container = document.getElementById('mylist-grid');
  const emptyState = document.getElementById('mylist-empty');
  if (!container) return;

  const listIds = getMyList();
  if (listIds.length === 0) {
    container.style.display = 'none';
    if (emptyState) emptyState.style.display = 'flex';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  container.style.display = 'grid';
  container.innerHTML = '';

  const savedMovies = listIds
    .map(id => getMovieById(id))
    .filter(movie => movie !== undefined);

  savedMovies.forEach(movie => {
    const cardHtml = createMovieCardHTML(movie);
    container.insertAdjacentHTML('beforeend', cardHtml);
  });
}
