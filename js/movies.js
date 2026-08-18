/* ==========================================================================
   STREAMFLIX MOVIES, HERO SPOTLIGHT & YOUTUBE TRAILER PREVIEW ENGINE
   js/movies.js

   Features:
   - Movie cards
   - 3-second hover trailer
   - YouTube iframe trailers
   - Autoplay + muted + loop
   - Hero spotlight updates
   - Top 10 row
   - Continue Watching
   - Movie/TV grid filtering
   ========================================================================== */

let cardHoverTimer = null;


/* ==========================================================================
   HERO SPOTLIGHT
   ========================================================================== */

function updateHeroSpotlight(movie) {
  const heroSection = document.querySelector('.hero');
  if (!heroSection) return;

  const heroTitle = heroSection.querySelector('.hero-title');
  const heroRating = heroSection.querySelector('.hero-rating');
  const heroMaturity = heroSection.querySelector('.hero-maturity');
  const heroDescription = heroSection.querySelector('.hero-description');
  const heroMeta = heroSection.querySelector('.hero-meta');
  const heroPlayBtn = heroSection.querySelector('.hero-actions .btn-primary');
  const heroInfoBtn = heroSection.querySelector('.hero-actions .btn-secondary');

  const backdrop =
    movie.backdrop ||
    movie.backdropFallback ||
    '';

  if (backdrop) {
    heroSection.style.backgroundImage = `url('${backdrop}')`;
  }

  if (heroTitle) {
    heroTitle.textContent = movie.title;
  }

  if (heroRating) {
    heroRating.textContent = `${movie.rating} ★ (${movie.match})`;
  }

  if (heroMaturity) {
    heroMaturity.textContent = movie.maturity;
  }

  if (heroDescription) {
    heroDescription.textContent =
      movie.synopsis || movie.description || '';
  }

  if (heroMeta) {
    heroMeta.innerHTML = `
      <span>${movie.rating} ★</span>
      <span>${movie.year}</span>
      <span>${movie.maturity}</span>
      <span>${movie.duration}</span>
    `;
  }

  if (heroPlayBtn) {
    heroPlayBtn.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();

      window.location.href =
        `details.html?id=${encodeURIComponent(movie.id)}&autoplay=true`;
    };
  }

  if (heroInfoBtn) {
    heroInfoBtn.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();

      openMovieDetails(movie.id);
    };
  }
}


/* ==========================================================================
   YOUTUBE URL HELPERS
   ========================================================================== */

/**
 * Extract a YouTube video ID from:
 *
 * https://youtu.be/VIDEO_ID
 * https://www.youtube.com/watch?v=VIDEO_ID
 * https://www.youtube.com/embed/VIDEO_ID
 * https://www.youtube.com/shorts/VIDEO_ID
 */
function getYouTubeVideoId(url) {
  if (!url) return null;

  try {
    const parsed = new URL(url);

    /* youtu.be/VIDEO_ID */
    if (parsed.hostname === 'youtu.be') {
      return parsed.pathname.substring(1).split('/')[0] || null;
    }

    /* youtube.com */
    if (
      parsed.hostname.includes('youtube.com') ||
      parsed.hostname.includes('youtube-nocookie.com')
    ) {
      /* /embed/VIDEO_ID */
      if (parsed.pathname.startsWith('/embed/')) {
        return parsed.pathname
          .replace('/embed/', '')
          .split('/')[0] || null;
      }

      /* /shorts/VIDEO_ID */
      if (parsed.pathname.startsWith('/shorts/')) {
        return parsed.pathname
          .replace('/shorts/', '')
          .split('/')[0] || null;
      }

      /* /watch?v=VIDEO_ID */
      const videoId = parsed.searchParams.get('v');

      if (videoId) {
        return videoId;
      }
    }
  } catch (error) {
    console.warn('Invalid YouTube URL:', url);
  }

  return null;
}


/**
 * Create a clean YouTube embed URL for hover previews.
 */
function createYouTubePreviewUrl(trailerUrl) {
  const videoId = getYouTubeVideoId(trailerUrl);

  if (!videoId) {
    return null;
  }

  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    controls: '0',
    loop: '1',
    playlist: videoId,
    playsinline: '1',
    rel: '0',
    modestbranding: '1',
    iv_load_policy: '3',
    enablejsapi: '1'
  });

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}


/* ==========================================================================
   MOVIE CARD HTML
   ========================================================================== */

function createMovieCardHTML(movie, progressPercent = null) {
  const inList =
    typeof isInMyList === 'function'
      ? isInMyList(movie.id)
      : false;

  const posterSrc =
    movie.poster ||
    movie.posterFallback ||
    '';

  let progressBarHTML = '';

  if (progressPercent !== null) {
    progressBarHTML = `
      <div class="card-progress-bar">
        <div
          class="card-progress-fill"
          style="width: ${Math.min(100, Math.max(0, progressPercent))}%;">
        </div>
      </div>
    `;
  }

  return `
    <div
      class="movie-card"
      data-id="${movie.id}"
      onmouseenter="handleCardMouseEnter(this, '${movie.id}')"
      onmouseleave="handleCardMouseLeave(this)"
      onclick="openMovieDetails('${movie.id}')"
    >

      <!-- Poster -->
      <img
        class="movie-card-poster"
        src="${posterSrc}"
        data-fallback="${movie.posterFallback || ''}"
        alt="${movie.title}"
        loading="lazy"
      />

      ${progressBarHTML}

      <!-- Hover Information -->
      <div class="card-hover-overlay">

        <div class="card-hover-title">
          ${movie.title}
        </div>

        <div class="card-hover-meta">
          <span class="card-hover-rating">
            ${movie.rating} ★
          </span>

          <span>
            ${movie.year}
          </span>

          <span class="badge-outline">
            ${movie.maturity}
          </span>
        </div>

        <div class="card-hover-actions">

          <!-- PLAY -->
          <button
            class="card-btn card-btn-play"
            title="Play"
            aria-label="Play ${movie.title}"
            onclick="
              event.stopPropagation();
              window.location.href='details.html?id=${movie.id}&autoplay=true';
            "
          >
            <svg viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>

          <!-- MY LIST -->
          <button
            class="card-btn"
            title="My List"
            aria-label="Add ${movie.title} to My List"
            onclick="
              event.stopPropagation();
              toggleMyListBtn(this, '${movie.id}');
            "
          >
            <svg viewBox="0 0 24 24">
              <path d="${
                inList
                  ? 'M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z'
                  : 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z'
              }"/>
            </svg>
          </button>

          <!-- MORE INFO -->
          <button
            class="card-btn"
            title="More Info"
            aria-label="More information about ${movie.title}"
            onclick="
              event.stopPropagation();
              openMovieDetails('${movie.id}');
            "
          >
            <svg viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
          </button>

        </div>
      </div>

    </div>
  `;
}


/* ==========================================================================
   CREATE YOUTUBE HOVER TRAILER
   ========================================================================== */

function createCardTrailer(cardEl, movie) {
  if (!cardEl || !movie) return;

  /*
     Remove an existing preview first.
  */
  const existingPreview =
    cardEl.querySelector('.card-preview-video');

  if (existingPreview) {
    existingPreview.remove();
  }


  /*
     Get the YouTube video ID.
  */
  const embedUrl =
    createYouTubePreviewUrl(movie.trailerUrl);


  /*
     If no YouTube trailer exists, use MP4 fallback.
  */
  if (!embedUrl) {

    if (!movie.movieUrl) {
      return;
    }

    const videoEl =
      document.createElement('video');

    videoEl.className =
      'card-preview-video';

    videoEl.src =
      movie.movieUrl;

    videoEl.muted = true;
    videoEl.loop = true;
    videoEl.autoplay = true;
    videoEl.playsInline = true;

    videoEl.setAttribute('aria-hidden', 'true');

    videoEl.style.cssText = `
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 4px;
      z-index: 5;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.35s ease;
      background: #000;
    `;

    cardEl.appendChild(videoEl);

    const playPromise = videoEl.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          videoEl.style.opacity = '1';
        })
        .catch(error => {
          console.warn(
            'MP4 preview autoplay failed:',
            error
          );
        });
    }

    return;
  }


  /*
     Create YouTube iframe.
  */
  const iframe =
    document.createElement('iframe');

  iframe.className =
    'card-preview-video';

  iframe.src =
    embedUrl;

  iframe.title =
    `${movie.title} trailer`;

  iframe.allow =
    'autoplay; encrypted-media; picture-in-picture';

  iframe.allowFullscreen = true;

  iframe.setAttribute(
    'frameborder',
    '0'
  );

  iframe.setAttribute(
    'loading',
    'eager'
  );

  iframe.setAttribute(
    'referrerpolicy',
    'strict-origin-when-cross-origin'
  );

  iframe.style.cssText = `
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border: 0;
    border-radius: 4px;
    z-index: 5;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.35s ease;
    background: #000;
  `;

  /*
     Append iframe to card.
  */
  cardEl.appendChild(iframe);


  /*
     Give YouTube a moment to initialize.
     Then fade it in.
  */
  iframe.addEventListener('load', () => {

    if (
        iframe &&
        iframe.isConnected
    ) {

        iframe.style.opacity = '1';

    }

});
}


/* ==========================================================================
   CARD MOUSE ENTER
   ========================================================================== */

function handleCardMouseEnter(cardEl, movieId) {

  /*
     Cancel any previous card timer.
  */
  clearTimeout(cardHoverTimer);

  const movie =
    getMovieById(movieId);

  if (!movie) {
    return;
  }


  /*
     Update Hero Spotlight.
  */
  updateHeroSpotlight(movie);


  /*
     Do not immediately load YouTube.

     Wait 3 seconds.
  */
  cardHoverTimer = setTimeout(() => {

    if (!cardEl.matches(':hover')) {
        return;
    }

    createCardTrailer(
        cardEl,
        movie
    );

}, 700);
}


/* ==========================================================================
   CARD MOUSE LEAVE
   ========================================================================== */

function handleCardMouseLeave(cardEl) {

  clearTimeout(cardHoverTimer);

  if (!cardEl) {
    return;
  }

  const preview =
    cardEl.querySelector(
      '.card-preview-video'
    );

  if (!preview) {
    return;
  }


  /*
     Fade out first.
  */
  preview.style.opacity = '0';


  /*
     Remove iframe/video after fade.
  */
  setTimeout(() => {

    if (preview && preview.isConnected) {
      preview.remove();
    }

  }, 350);
}


/* ==========================================================================
   MY LIST BUTTON
   ========================================================================== */

function toggleMyListBtn(btnEl, movieId) {

  if (
    typeof toggleMyList !== 'function'
  ) {
    return;
  }

  const added =
    toggleMyList(movieId);

  const svg =
    btnEl.querySelector('svg');

  if (!svg) {
    return;
  }

  svg.innerHTML = added

    ? `
      <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
    `

    : `
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
    `;
}


/* ==========================================================================
   TOP 10 ROW
   ========================================================================== */

function renderTop10Row(
  containerId,
  title = 'Top 10 Movies & TV Shows Today'
) {

  const container =
    document.getElementById(containerId);

  if (!container) {
    return;
  }

  const top10List =
    moviesData.slice(0, 10);

  const cardsHTML =
    top10List
      .map((movie, index) => {

        const rank =
          index + 1;

        return `
          <div class="top10-card-wrapper">

            <span class="top10-rank-number">
              ${rank}
            </span>

            ${createMovieCardHTML(movie)}

          </div>
        `;
      })
      .join('');


  container.innerHTML = `
    <section class="content-section">

      <div class="row-header">
        <h2 class="row-title">
          ${title}
        </h2>
      </div>

      <div class="row-wrapper">

        <button
          class="scroll-arrow left"
          onclick="scrollRow('${containerId}-cards', -1)"
          aria-label="Scroll left"
        >
          <svg viewBox="0 0 24 24">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>

        <div
          class="row-container"
          id="${containerId}-cards"
        >
          ${cardsHTML}
        </div>

        <button
          class="scroll-arrow right"
          onclick="scrollRow('${containerId}-cards', 1)"
          aria-label="Scroll right"
        >
          <svg viewBox="0 0 24 24">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
          </svg>
        </button>

      </div>

    </section>
  `;
}


/* ==========================================================================
   HORIZONTAL CATEGORY ROW
   ========================================================================== */

function renderRow(
  containerId,
  title,
  categoryKey
) {

  const container =
    document.getElementById(containerId);

  if (!container) {
    return;
  }

  const movies =
    getMoviesByCategory(categoryKey);

  if (
    !movies ||
    movies.length === 0
  ) {
    return;
  }


  const rowHTML = `
    <section class="content-section">

      <div class="row-header">

        <h2 class="row-title">
          ${title}
        </h2>

        <a
          href="movies.html?category=${encodeURIComponent(categoryKey)}"
          class="row-see-all"
        >
          Explore All ›
        </a>

      </div>

      <div class="row-wrapper">

        <button
          class="scroll-arrow left"
          onclick="scrollRow('${containerId}-cards', -1)"
          aria-label="Scroll left"
        >
          <svg viewBox="0 0 24 24">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>

        <div
          class="row-container"
          id="${containerId}-cards"
        >
          ${movies
            .map(movie => createMovieCardHTML(movie))
            .join('')}
        </div>

        <button
          class="scroll-arrow right"
          onclick="scrollRow('${containerId}-cards', 1)"
          aria-label="Scroll right"
        >
          <svg viewBox="0 0 24 24">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
          </svg>
        </button>

      </div>

    </section>
  `;

  container.innerHTML =
    rowHTML;
}


/* ==========================================================================
   CONTINUE WATCHING
   ========================================================================== */

function renderContinueWatchingRow(
  containerId
) {

  const container =
    document.getElementById(containerId);

  if (!container) {
    return;
  }


  /*
     Read saved progress.
  */
  const storedProgress =
    localStorage.getItem(
      'streamflix_progress'
    );

  let progressMap = {};

  if (storedProgress) {
    try {
      progressMap =
        JSON.parse(storedProgress);
    } catch (error) {
      progressMap = {};
    }
  }


  /*
     Read active profile.
  */
  let activeUser = null;

  try {
    activeUser =
      JSON.parse(
        localStorage.getItem('currentUser')
      );
  } catch (error) {
    activeUser = null;
  }

  const profileName =
    activeUser?.name ||
    'Simran';


  /*
     Find Continue Watching titles.
  */
  const cwMovies =
    moviesData.filter(movie => {

      const hasContinueCategory =
        Array.isArray(movie.categories) &&
        movie.categories.includes(
          'continueWatching'
        );

      const hasProgress =
        Boolean(
          progressMap[movie.id]
        );

      return (
        hasContinueCategory ||
        hasProgress
      );
    });


  /*
     Nothing to show.
  */
  if (cwMovies.length === 0) {
    container.innerHTML = '';
    return;
  }


  /*
     Create cards.
  */
  const cardsHTML =
    cwMovies
      .map(movie => {

        const percent =
          progressMap[movie.id]
            ? progressMap[movie.id].percent
            : 65;

        return createMovieCardHTML(
          movie,
          percent
        );
      })
      .join('');


  container.innerHTML = `
    <section class="content-section">

      <div class="row-header">
        <h2 class="row-title">
          Continue Watching for ${profileName}
        </h2>
      </div>

      <div class="row-wrapper">

        <button
          class="scroll-arrow left"
          onclick="scrollRow('cw-cards', -1)"
          aria-label="Scroll left"
        >
          <svg viewBox="0 0 24 24">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>

        <div
          class="row-container"
          id="cw-cards"
        >
          ${cardsHTML}
        </div>

        <button
          class="scroll-arrow right"
          onclick="scrollRow('cw-cards', 1)"
          aria-label="Scroll right"
        >
          <svg viewBox="0 0 24 24">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
          </svg>
        </button>

      </div>

    </section>
  `;
}


/* ==========================================================================
   SCROLL ROW
   ========================================================================== */

function scrollRow(
  rowId,
  direction
) {

  const row =
    document.getElementById(rowId);

  if (!row) {
    return;
  }

  const scrollAmount =
    row.clientWidth * 0.75;

  row.scrollBy({
    left:
      direction * scrollAmount,
    behavior: 'smooth'
  });
}


/* ==========================================================================
   GRID PAGE RENDERING & FILTERING
   ========================================================================== */

function initGridPage(
  contentType = 'movie'
) {

  const gridContainer =
    document.getElementById(
      'grid-container'
    );

  const genreFilter =
    document.getElementById(
      'genre-filter'
    );

  const yearFilter =
    document.getElementById(
      'year-filter'
    );

  const ratingFilter =
    document.getElementById(
      'rating-filter'
    );


  if (!gridContainer) {
    return;
  }


  function filterAndRender() {

    let list =
      contentType === 'movie'
        ? getAllMovies()
        : getAllTVShows();


    /*
       Genre filter
    */
    if (
      genreFilter &&
      genreFilter.value !== 'all'
    ) {

      list =
        list.filter(movie =>
          Array.isArray(movie.genre) &&
          movie.genre.includes(
            genreFilter.value
          )
        );
    }


    /*
       Year filter
    */
    if (
      yearFilter &&
      yearFilter.value !== 'all'
    ) {

      const year =
        parseInt(
          yearFilter.value,
          10
        );

      list =
        list.filter(
          movie =>
            movie.year === year
        );
    }


    /*
       Rating filter
    */
    if (
      ratingFilter &&
      ratingFilter.value !== 'all'
    ) {

      const minRating =
        parseFloat(
          ratingFilter.value
        );

      list =
        list.filter(
          movie =>
            movie.rating >= minRating
        );
    }


    /*
       No results
    */
    if (list.length === 0) {

      gridContainer.innerHTML = `
        <div
          style="
            grid-column: 1 / -1;
            text-align: center;
            padding: 4rem 1rem;
            color: var(--text-muted);
          "
        >

          <h2>
            No titles found matching your filter criteria.
          </h2>

          <p style="margin-top:0.5rem;">
            Try selecting different options or clear filters.
          </p>

        </div>
      `;

      return;
    }


    /*
       Render results
    */
    gridContainer.innerHTML =
      list
        .map(movie =>
          createMovieCardHTML(movie)
        )
        .join('');
  }


  /*
     Filter listeners
  */
  if (genreFilter) {
    genreFilter.addEventListener(
      'change',
      filterAndRender
    );
  }

  if (yearFilter) {
    yearFilter.addEventListener(
      'change',
      filterAndRender
    );
  }

  if (ratingFilter) {
    ratingFilter.addEventListener(
      'change',
      filterAndRender
    );
  }


  /*
     Initial render
  */
  filterAndRender();
}


/* ==========================================================================
   GLOBAL SAFETY
   ========================================================================== */

/*
   Make sure dynamically created iframe previews
   never block clicks or mouse events.
*/
(function injectTrailerPreviewStyles() {

  if (
    document.getElementById(
      'streamflix-trailer-preview-styles'
    )
  ) {
    return;
  }

  const style =
    document.createElement('style');

  style.id =
    'streamflix-trailer-preview-styles';

  style.textContent = `
    .movie-card {
      overflow: visible;
    }

    .movie-card .card-preview-video {
      pointer-events: none !important;
      user-select: none !important;
      -webkit-user-select: none !important;
    }

    .movie-card .card-hover-overlay {
      position: absolute;
      z-index: 6;
    }

    .movie-card .card-preview-video {
      z-index: 5;
    }
  `;

  document.head.appendChild(style);

})();