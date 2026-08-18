/* ==========================================================================
   NETFLIX CORE APPLICATION LOGIC (js/app.js)
   Navbar scroll, notifications center, modals, toasts, image fallbacks, FAQ.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initNotificationDrawer();
  initProfileMenu();
  initModalListeners();
  initGlobalImageFallbacks();
  initFaqAccordion();
  updateActiveNavTab();
});


/* ==========================================================================
   NAVBAR SCROLL EFFECT
   ========================================================================== */

function initNavbar() {

  const navbar =
    document.querySelector('.navbar');

  if (!navbar) return;


  window.addEventListener('scroll', () => {

    if (window.scrollY > 50) {

      navbar.classList.add('scrolled');

    } else {

      navbar.classList.remove('scrolled');

    }

  });


  /* Mobile Menu Toggle */

  const mobileToggle =
    document.querySelector('.mobile-nav-toggle');

  const navLinks =
    document.querySelector('.nav-links');


  if (mobileToggle && navLinks) {

    mobileToggle.addEventListener('click', () => {

      navLinks.classList.toggle('show');

    });

  }


  /* Header Search Box */

  const navSearchInput =
    document.querySelector('.nav-search-input');


  if (navSearchInput) {

    navSearchInput.addEventListener(
      'keypress',
      (e) => {

        if (
          e.key === 'Enter' &&
          navSearchInput.value.trim() !== ''
        ) {

          window.location.href =
            `search.html?q=${encodeURIComponent(
              navSearchInput.value.trim()
            )}`;

        }

      }
    );

  }

}


/* ==========================================================================
   NOTIFICATION DRAWER
   ========================================================================== */

const NOTIFICATIONS_DATA = [

  {
    id: 1,
    title: 'New Arrival',
    desc: 'Dune: Part Two is now streaming in 4K HDR',
    time: '2 hours ago',
    thumb: 'assets/images/tea.avif',
    movieId: 'dune-part-two'
  },

  {
    id: 2,
    title: 'Trending #1',
    desc: 'The Last Horizon reaches 10M views in India',
    time: '1 day ago',
    thumb: 'assets/images/bgmain.jpeg',
    movieId: 'interstellar'
  },

  {
    id: 3,
    title: 'New Season',
    desc: 'Squid Game Season 2 available now',
    time: '3 days ago',
    thumb: 'assets/images/movie8.jpeg',
    movieId: 'squid-game'
  }

];


function initNotificationDrawer() {

  const notifContainer =
    document.querySelector('.notification-container');

  const trigger =
    document.querySelector('.notification-trigger');

  const badge =
    document.querySelector('.notification-badge');

  const list =
    document.querySelector('.notification-list');

  const markReadBtn =
    document.querySelector('.mark-read-btn');


  if (!notifContainer || !trigger) return;


  let isRead =
    localStorage.getItem(
      'netflix_notifications_read'
    ) === 'true';


  if (isRead && badge) {

    badge.style.display = 'none';

  }


  /* Toggle drawer */

  trigger.addEventListener('click', (e) => {

    e.stopPropagation();

    notifContainer.classList.toggle('open');


    if (badge) {

      badge.style.display = 'none';

    }


    localStorage.setItem(
      'netflix_notifications_read',
      'true'
    );

  });


  /* Render notifications */

  if (list) {

    list.innerHTML =
      NOTIFICATIONS_DATA.map(n => `

        <div
          class="notification-item ${!isRead ? 'unread' : ''}"
          onclick="window.location.href='details.html?id=${n.movieId}'"
        >

          <img
            class="notification-thumb"
            src="${n.thumb}"
            alt="${n.title}"
          >

          <div class="notification-info">

            <div class="notification-text">
              <strong>${n.title}:</strong>
              ${n.desc}
            </div>

            <div class="notification-time">
              ${n.time}
            </div>

          </div>

        </div>

      `).join('');

  }


  /* Mark all read */

  if (markReadBtn) {

    markReadBtn.addEventListener(
      'click',
      (e) => {

        e.stopPropagation();

        localStorage.setItem(
          'netflix_notifications_read',
          'true'
        );


        if (badge) {

          badge.style.display = 'none';

        }


        document
          .querySelectorAll('.notification-item')
          .forEach(item => {

            item.classList.remove('unread');

          });


        showToast(
          'Notifications marked as read'
        );

      }
    );

  }


  /* Close notification drawer */

  document.addEventListener(
    'click',
    (e) => {

      if (!notifContainer.contains(e.target)) {

        notifContainer.classList.remove(
          'open'
        );

      }

    }
  );

}


/* ==========================================================================
   FAQ ACCORDION
   ========================================================================== */

function initFaqAccordion() {

  const faqItems =
    document.querySelectorAll('.faq-item');


  faqItems.forEach(item => {

    const question =
      item.querySelector('.faq-question');


    if (question) {

      question.addEventListener(
        'click',
        () => {

          const isActive =
            item.classList.contains('active');


          faqItems.forEach(otherItem => {

            otherItem.classList.remove(
              'active'
            );

          });


          if (!isActive) {

            item.classList.add('active');

          }

        }
      );

    }

  });

}


/* ==========================================================================
   ACTIVE NAV TAB
   ========================================================================== */

function updateActiveNavTab() {

  const currentPage =
    window.location.pathname
      .split('/')
      .pop() || 'index.html';


  const navLinks =
    document.querySelectorAll('.nav-link');


  navLinks.forEach(link => {

    const href =
      link.getAttribute('href');


    if (href === currentPage) {

      link.classList.add('active');

    } else {

      link.classList.remove('active');

    }

  });

}


/* ==========================================================================
   PROFILE DROPDOWN
   ========================================================================== */

function initProfileMenu() {

  const profileAvatar =
    document.querySelector('.profile-avatar');

  const profileName =
    document.querySelector('.profile-name');


  if (
    typeof getActiveProfile === 'function'
  ) {

    const activeProf =
      getActiveProfile();


    if (activeProf) {

      if (profileAvatar) {

        profileAvatar.src =
          activeProf.avatar ||
          'assets/images/logo.jpg';

      }


      if (profileName) {

        profileName.textContent =
          activeProf.name;

      }

    }

  }

}


/* ==========================================================================
   MOVIE MODAL
   ========================================================================== */

let activeModalMovieId = null;

let lastModalScrollY = 0;


/* ==========================================================================
   POPULATE MOVIE MODAL
   ========================================================================== */

function populateMovieModal(movie) {

  const modalBackdrop =
    document.getElementById('movie-modal');


  if (!modalBackdrop) return;


  const heroEl =
    modalBackdrop.querySelector('.modal-hero');

  const titleEl =
    modalBackdrop.querySelector('.modal-title');

  const ratingEl =
    modalBackdrop.querySelector('.modal-rating');

  const yearEl =
    modalBackdrop.querySelector('.modal-year');

  const durationEl =
    modalBackdrop.querySelector('.modal-duration');

  const synopsisEl =
    modalBackdrop.querySelector('.modal-synopsis');

  const castEl =
    modalBackdrop.querySelector('.modal-cast');

  const genreEl =
    modalBackdrop.querySelector('.modal-genre');

  const playBtn =
    modalBackdrop.querySelector('.modal-play-btn');

  const listBtn =
    modalBackdrop.querySelector('.modal-list-btn');

  const metaInfo =
    modalBackdrop.querySelector('.modal-meta-strip');

  const muteBtn =
    modalBackdrop.querySelector('.modal-mute-btn');


  /* ============================================================
     HTML5 VIDEO
     ============================================================ */

  if (heroEl) {

    let videoEl =
      heroEl.querySelector(
        '.modal-hero-video'
      );


    if (!videoEl) {

      videoEl =
        document.createElement('video');


      videoEl.className =
        'modal-hero-video';


      videoEl.muted = true;

      videoEl.loop = true;

      videoEl.autoplay = true;

      videoEl.playsInline = true;

      videoEl.controls = false;


      heroEl.prepend(videoEl);

    }


    const source =
      movie.movieUrl ||
      movie.trailerUrl ||
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';


    if (
      videoEl.getAttribute('src') !== source
    ) {

      videoEl.src = source;

    }


    videoEl.poster =
      movie.poster ||
      movie.posterFallback ||
      '';


    videoEl.muted = true;


    videoEl.play().catch(() => {});

  }


  /* ============================================================
     MOVIE INFORMATION
     ============================================================ */

  if (titleEl) {

    titleEl.textContent =
      movie.title;

  }


  if (ratingEl) {

    ratingEl.textContent =
      `${movie.rating} ★`;

  }


  if (yearEl) {

    yearEl.textContent =
      movie.year;

  }


  if (durationEl) {

    durationEl.textContent =
      movie.duration;

  }


  if (synopsisEl) {

    synopsisEl.textContent =
      movie.synopsis ||
      movie.description;

  }


  if (castEl) {

    castEl.textContent =
      movie.cast.join(', ');

  }


  if (genreEl) {

    genreEl.textContent =
      movie.genre.join(' • ');

  }


  /* ============================================================
     META INFORMATION
     ============================================================ */

  if (metaInfo) {

    const descriptors =
      movie.descriptors ||
      [
        'Sex',
        'Violence',
        'Substances'
      ];


    metaInfo.innerHTML = `

      <span>${movie.year}</span>

      <span>${movie.duration}</span>

      <span class="meta-badge">
        HD
      </span>

      <span class="meta-icon">
        AD
      </span>

      <span class="meta-icon">
        CC
      </span>

      <span class="meta-rating">
        ${movie.maturity || 'A'}
      </span>

      <span class="meta-tags">
        ${descriptors.join(' • ')}
      </span>

    `;

  }


  /* ============================================================
     PLAY BUTTON
     ============================================================ */

  if (playBtn) {

    playBtn.onclick = () => {

      window.location.href =
        `details.html?id=${movie.id}&autoplay=true`;

    };

  }


  /* ============================================================
     MY LIST
     ============================================================ */

  if (listBtn) {

    const inList =
      isInMyList(movie.id);


    listBtn.innerHTML =
      inList
        ? '✓ In My List'
        : '＋ Add to My List';


    listBtn.onclick = () => {

      const added =
        toggleMyList(movie.id);


      listBtn.innerHTML =
        added
          ? '✓ In My List'
          : '＋ Add to My List';

    };

  }


  /* ============================================================
     MUTE BUTTON
     ============================================================ */

  if (muteBtn) {

    const videoEl =
      heroEl.querySelector(
        '.modal-hero-video'
      );


    muteBtn.onclick = () => {

      if (!videoEl) return;


      videoEl.muted =
        !videoEl.muted;


      muteBtn.classList.toggle(
        'muted',
        !videoEl.muted
      );

    };

  }

}


/* ==========================================================================
   OPEN MOVIE DETAILS
   ========================================================================== */

function openMovieDetails(movieId) {

  activeModalMovieId =
    movieId;


  const movie =
    getMovieById(movieId);


  if (!movie) {

    return;

  }


  /* ============================================================
     GET EXISTING MOVIE MODAL
     ============================================================ */

  const modalBackdrop =
    document.getElementById(
      'movie-modal'
    );


  if (!modalBackdrop) {

    window.location.href =
      `details.html?id=${encodeURIComponent(
        movieId
      )}`;

    return;

  }


  /* ============================================================
     GET MODAL ELEMENTS
     ============================================================ */

  const backdropEl =
    modalBackdrop.querySelector(
      '.modal-hero'
    );


  const titleEl =
    modalBackdrop.querySelector(
      '.modal-title'
    );


  const ratingEl =
    modalBackdrop.querySelector(
      '.modal-rating'
    );


  const yearEl =
    modalBackdrop.querySelector(
      '.modal-year'
    );


  const durationEl =
    modalBackdrop.querySelector(
      '.modal-duration'
    );


  const synopsisEl =
    modalBackdrop.querySelector(
      '.modal-synopsis'
    );


  const castEl =
    modalBackdrop.querySelector(
      '.modal-cast'
    );


  const genreEl =
    modalBackdrop.querySelector(
      '.modal-genre'
    );


  const playBtn =
    modalBackdrop.querySelector(
      '.modal-play-btn'
    );


  const listBtn =
    modalBackdrop.querySelector(
      '.modal-list-btn'
    );


  /* ============================================================
     MOVIE INFORMATION
     ============================================================ */

  if (titleEl) {

    titleEl.textContent =
      movie.title;

  }


  if (ratingEl) {

    ratingEl.textContent =
      `${movie.rating} Rating`;

  }


  if (yearEl) {

    yearEl.textContent =
      movie.year;

  }


  if (durationEl) {

    durationEl.textContent =
      movie.duration;

  }


  if (synopsisEl) {

    synopsisEl.textContent =
      movie.synopsis ||
      movie.description ||
      '';

  }


  if (castEl) {

    castEl.textContent =
      Array.isArray(movie.cast)
        ? movie.cast.join(', ')
        : (
            movie.cast ||
            ''
          );

  }


  if (genreEl) {

    genreEl.textContent =
      Array.isArray(movie.genre)
        ? movie.genre.join(' • ')
        : (
            movie.genre ||
            ''
          );

  }


  /* ============================================================
     GET YOUTUBE VIDEO ID
     ============================================================ */

  function getTrailerVideoId(url) {

    if (!url) {

      return null;

    }


    try {

      const parsed =
        new URL(url);


      /* youtu.be */

      if (
        parsed.hostname ===
        'youtu.be'
      ) {

        return parsed.pathname
          .replace('/', '')
          .split('/')[0];

      }


      /* youtube.com/watch?v= */

      const watchId =
        parsed.searchParams.get('v');


      if (watchId) {

        return watchId;

      }


      /* youtube.com/embed/ */

      if (
        parsed.pathname.includes(
          '/embed/'
        )
      ) {

        return parsed.pathname
          .split('/embed/')[1]
          .split('/')[0];

      }


      /* youtube.com/shorts/ */

      if (
        parsed.pathname.includes(
          '/shorts/'
        )
      ) {

        return parsed.pathname
          .split('/shorts/')[1]
          .split('/')[0];

      }

    } catch (error) {

      console.warn(
        'Invalid trailer URL:',
        url
      );

    }


    return null;

  }


  /* ============================================================
     CREATE TRAILER
     ============================================================ */

  const videoId =
    getTrailerVideoId(
      movie.trailerUrl
    );


  /* ============================================================
     REMOVE OLD TRAILER
     ============================================================ */

  const oldTrailer =
    modalBackdrop.querySelector(
      '.modal-trailer'
    );


  if (oldTrailer) {

    oldTrailer.src =
      'about:blank';

    oldTrailer.remove();

  }


  /* ============================================================
     REMOVE OLD HTML5 VIDEO
     ============================================================ */

  const oldVideo =
    modalBackdrop.querySelector(
      '.modal-hero-video'
    );


  if (oldVideo) {

    oldVideo.pause();

    oldVideo.removeAttribute(
      'src'
    );

    oldVideo.load();

    oldVideo.remove();

  }


  /* ============================================================
     REMOVE OLD POSTER
     ============================================================ */

  if (backdropEl) {

    backdropEl.style.backgroundImage =
      'none';

  }


  /* ============================================================
     INSERT YOUTUBE TRAILER
     ============================================================ */

  if (
    backdropEl &&
    videoId
  ) {

    const trailer =
      document.createElement(
        'iframe'
      );


    trailer.className =
      'modal-trailer';


    trailer.src =
      `https://www.youtube.com/embed/${videoId}` +
      `?autoplay=1` +
      `&mute=0` +
      `&controls=1` +
      `&rel=0` +
      `&modestbranding=1` +
      `&playsinline=1`;


    trailer.title =
      `${movie.title} Trailer`;


    trailer.setAttribute(
      'frameborder',
      '0'
    );


    trailer.setAttribute(
      'allow',
      'autoplay; encrypted-media; picture-in-picture; fullscreen'
    );


    trailer.setAttribute(
      'allowfullscreen',
      ''
    );


    trailer.setAttribute(
      'referrerpolicy',
      'strict-origin-when-cross-origin'
    );


    /*
     * Make sure the iframe fills
     * the complete modal hero.
     */

    trailer.style.position =
      'absolute';

    trailer.style.top =
      '0';

    trailer.style.left =
      '0';

    trailer.style.width =
      '100%';

    trailer.style.height =
      '100%';

    trailer.style.border =
      '0';

    trailer.style.zIndex =
      '1';


    backdropEl.prepend(
      trailer
    );

  }


  /* ============================================================
     PLAY BUTTON
     ============================================================ */

  if (playBtn) {

    playBtn.onclick = () => {

      window.location.href =
        `details.html?id=${movie.id}&autoplay=true`;

    };

  }


  /* ============================================================
     MY LIST BUTTON
     ============================================================ */

  if (listBtn) {

    const inList =
      isInMyList(
        movie.id
      );


    listBtn.innerHTML =
      inList
        ? '✓ In My List'
        : '＋ Add to My List';


    listBtn.onclick = () => {

      const added =
        toggleMyList(
          movie.id
        );


      listBtn.innerHTML =
        added
          ? '✓ In My List'
          : '＋ Add to My List';

    };

  }


  /* ============================================================
     SHOW MODAL
     ============================================================ */

  modalBackdrop.classList.add(
    'show'
  );


  document.body.style.overflow =
    'hidden';

}


/* ==========================================================================
   CLOSE MOVIE MODAL
   ========================================================================== */

function closeMovieDetails() {

  const modalBackdrop =
    document.getElementById(
      'movie-modal'
    );


  if (!modalBackdrop) {

    return;

  }


  /* ============================================================
     STOP YOUTUBE TRAILER
     ============================================================ */

  const trailer =
    modalBackdrop.querySelector(
      '.modal-trailer'
    );


  if (trailer) {

    /*
     * Clear iframe first.
     * This stops YouTube immediately.
     */

    trailer.src =
      'about:blank';


    trailer.remove();

  }


  /* ============================================================
     STOP HTML5 VIDEO
     ============================================================ */

  const video =
    modalBackdrop.querySelector(
      '.modal-hero-video'
    );


  if (video) {

    video.pause();

    video.removeAttribute(
      'src'
    );

    video.load();

    video.remove();

  }


  /* ============================================================
     RESTORE HERO
     ============================================================ */

  const heroEl =
    modalBackdrop.querySelector(
      '.modal-hero'
    );


  if (heroEl) {

    heroEl.style.backgroundImage =
      '';

  }


  /* ============================================================
     HIDE MODAL
     ============================================================ */

  modalBackdrop.classList.remove(
    'show'
  );


  /* ============================================================
     RESTORE PAGE SCROLL
     ============================================================ */

  document.body.style.overflow =
    '';


  /* ============================================================
     RESET ACTIVE MOVIE
     ============================================================ */

  activeModalMovieId =
    null;

}


/* ==========================================================================
   MOVIE MODAL LISTENERS
   ========================================================================== */

function initModalListeners() {

  const modalBackdrop =
    document.getElementById(
      'movie-modal'
    );


  if (!modalBackdrop) {

    return;

  }


  /* ============================================================
     CLOSE BUTTON
     ============================================================ */

  const closeBtn =
    modalBackdrop.querySelector(
      '.modal-close-btn'
    );


  if (closeBtn) {

    /*
     * IMPORTANT:
     *
     * Your actual HTML uses:
     *
     * .modal-close-btn
     *
     * NOT:
     *
     * .modal-close
     *
     */

    closeBtn.onclick =
      function (event) {

        event.preventDefault();

        event.stopPropagation();

        closeMovieDetails();

      };

  }


  /* ============================================================
     CLICK OUTSIDE MODAL
     ============================================================ */

  modalBackdrop.onclick =
    function (event) {

      if (
        event.target ===
        modalBackdrop
      ) {

        closeMovieDetails();

      }

    };


  /* ============================================================
     ESC KEY
     ============================================================ */

  document.addEventListener(
    'keydown',
    function (event) {

      if (
        event.key === 'Escape' &&
        modalBackdrop.classList.contains(
          'show'
        )
      ) {

        closeMovieDetails();

      }

    }
  );

}