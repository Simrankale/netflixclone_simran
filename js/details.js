/* ==========================================================================
   STREAMFLIX DETAILS PAGE LOGIC (js/details.js)
   Renders full-page title details, backdrop, synopsis, cast, and player trigger.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initDetailsPage();
});

function initDetailsPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const movieId = urlParams.get('id') || 'interstellar';
  const autoplay = urlParams.get('autoplay') === 'true';

  const movie = getMovieById(movieId);
  if (!movie) {
    document.body.innerHTML = `
      <div style="padding: 5rem; text-align: center; color: white;">
        <h1>Movie / TV Show Not Found</h1>
        <p><a href="index.html" style="color: #E50914;">Return to Home</a></p>
      </div>
    `;
    return;
  }

  // Populate Details Page Elements
  const backdropEl = document.getElementById('details-backdrop');
  const titleEl = document.getElementById('details-title');
  const metaYearEl = document.getElementById('details-year');
  const metaRatingEl = document.getElementById('details-rating');
  const metaMaturityEl = document.getElementById('details-maturity');
  const metaDurationEl = document.getElementById('details-duration');
  const metaGenreEl = document.getElementById('details-genre');
  const synopsisEl = document.getElementById('details-synopsis');
  const castEl = document.getElementById('details-cast');
  const directorEl = document.getElementById('details-director');
  const posterEl = document.getElementById('details-poster');
  const playBtn = document.getElementById('details-play-btn');
  const listBtn = document.getElementById('details-list-btn');

  if (backdropEl) backdropEl.style.backgroundImage = `url('${movie.backdrop || movie.backdropFallback}')`;
  if (titleEl) titleEl.textContent = movie.title;
  if (metaYearEl) metaYearEl.textContent = movie.year;
  if (metaRatingEl) metaRatingEl.textContent = `${movie.rating} ★`;
  if (metaMaturityEl) metaMaturityEl.textContent = movie.maturity;
  if (metaDurationEl) metaDurationEl.textContent = movie.duration;
  if (metaGenreEl) metaGenreEl.textContent = movie.genre.join(' • ');
  if (synopsisEl) synopsisEl.textContent = movie.synopsis || movie.description;
  if (castEl) castEl.textContent = movie.cast.join(', ');
  if (directorEl) directorEl.textContent = movie.director;
  if (posterEl) posterEl.src = movie.poster || movie.posterFallback;

  // Play Button Handler -> Launch Player Container / Autoplay
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      openVideoPlayer(movie);
    });
  }

  if (autoplay) {
    openVideoPlayer(movie);
  }

  // My List Toggle Handler
  if (listBtn) {
    const inList = isInMyList(movie.id);
    listBtn.innerHTML = inList ? '✓ In My List' : '＋ Add to My List';
    listBtn.addEventListener('click', () => {
      const added = toggleMyList(movie.id);
      listBtn.innerHTML = added ? '✓ In My List' : '＋ Add to My List';
    });
  }

  // Render Recommended Titles
  renderRecommendedRow(movie);
}

function renderRecommendedRow(currentMovie) {
  const container = document.getElementById('recommended-grid');
  if (!container) return;

  // Find movies with matching primary genre or category
  const primaryGenre = currentMovie.genre[0];
  const recommended = moviesData.filter(m => 
    m.id !== currentMovie.id && (m.genre.includes(primaryGenre) || m.type === currentMovie.type)
  ).slice(0, 6);

  container.innerHTML = recommended.map(movie => createMovieCardHTML(movie)).join('');
}
