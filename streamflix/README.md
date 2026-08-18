# 🎬 NetFlix - Modern Streaming Platform Web Application

StreamFlix is a complete, production-quality, Netflix-inspired web application built with pure **HTML5**, **CSS3**, and **Vanilla JavaScript (ES6+)**. Designed with modern dark glassmorphism aesthetics, fluid micro-interactions, responsive layouts, a custom HTML5 video player, and complete multi-profile persistence using `localStorage`.

---

## 🌟 Key Features

1. **Cinematic Hero Banner**: Spotlights trending titles with backdrop overlays, metadata badges, and quick-action buttons.
2. **Horizontal Scrolling Rows**: Smooth left/right arrow navigation across 14+ categories including *Continue Watching*, *Trending Now*, *Popular Movies*, *Popular TV Shows*, *Action*, *Sci-Fi*, *Horror*, and *My List*.
3. **Card Expansion & Hover FX**: Interactive thumbnail cards displaying match percentage, rating, maturity, and quick play/add buttons.
4. **Interactive Detailed Modal**: Popup overlay dialog with backdrop media, full cast list, director, genre breakdown, and keyframe animations.
5. **Real-time Search & Filter Pills**: Live debounced search querying titles, original titles, genres, cast members, and directors instantly without page reloads.
6. **Filterable Browse Pages**: Dedicated `movies.html` and `tv-shows.html` pages with dropdown filters for Genre, Release Year, and Rating.
7. **Custom HTML5 Video Player**:
   - Play / Pause control
   - Interactive Progress Seek bar
   - Volume slider & mute toggle
   - Playback rate speed selector (0.5x to 2.0x)
   - Quality selector & Subtitles toggle
   - Picture-in-Picture & Fullscreen API support
   - Automatic watching progress tracking saved in `localStorage` for the *Continue Watching* row.
8. **My List Persistence**: Save favorite titles to `localStorage`. Toggle button states sync dynamically across all pages.
9. **Demo Auth & Multi-Profile System**: Demo login/signup forms and profile switcher (`Vinay`, `Kids`, `Guest`).
10. **100% Fully Responsive Layout**: Mobile-first media queries supporting screen sizes from 320px up to 1920px+ with mobile navigation drawer.

---

## 📂 Project Directory Structure

```
streamflix/
│
├── index.html              # Main Home Page (Hero, Horizontal Rows, Modal, Footer)
├── movies.html             # Movies Browse Page (Filterable Grid)
├── tv-shows.html           # TV Shows Browse Page (Filterable Grid)
├── details.html            # Title Details Page (Backdrop, Synopsis, Cast, Player)
├── search.html             # Real-time Search & Genre Pills Page
├── my-list.html            # User Saved Content Grid (localStorage Sync)
├── login.html              # Demo Authentication Sign In Form
├── signup.html             # User Registration & Account Creation Form
│
├── css/
│   ├── style.css           # Design tokens, CSS variables, typography, reset, toast alerts, footer
│   ├── responsive.css      # Multi-device responsive breakpoints (1920px to 320px)
│   ├── navbar.css          # Fixed header, search box, profile dropdown, mobile drawer
│   ├── hero.css            # Hero banner, gradient masks, typography, action buttons
│   ├── cards.css           # Horizontal rows, card hovers, progress bars, card grids
│   ├── modal.css           # Detailed info popup dialog, backdrop blur, cast list
│   └── auth.css            # Glassmorphic auth forms & profile switcher cards
│
├── js/
│   ├── data.js             # 40+ rich sample titles dataset with images & metadata
│   ├── app.js              # Navbar scroll, global state, profile dropdown, modals, toasts
│   ├── movies.js           # Horizontal row & grid rendering engine, card templates
│   ├── search.js           # Live search algorithm, debouncing, category pills
│   ├── details.js          # Details page dynamic renderer & player router
│   ├── auth.js             # Demo login, signup, session state, user profiles in localStorage
│   ├── mylist.js           # My List CRUD state manager using localStorage
│   └── player.js           # Full-featured custom HTML5 video player
│
├── assets/
│   ├── images/             # Organized posters & backdrops
│   │   ├── posters/
│   │   └── backdrops/
│   ├── icons/              # SVG icons
│   └── videos/             # Sample video files
│
└── README.md               # Project documentation & developer guide
```

---

## 🚀 How to Run Locally

Because StreamFlix is built using standard standard HTML5, CSS3, and JavaScript, **no npm install or build step is required!**

1. Simply navigate to the `streamflix/` folder.
2. Double-click `index.html` to open it directly in any web browser (Chrome, Firefox, Edge, Safari).
3. Alternatively, serve using VS Code Live Server or python HTTP server:
   ```bash
   python -m http.server 8000
   ```
4. Open `http://localhost:8000` in your browser.

---

## 💾 How LocalStorage Works

StreamFlix uses browser `localStorage` for stateless frontend persistence:

1. **`streamflix_user`**: Stores current authenticated user metadata.
2. **`streamflix_profiles`**: Manages user profiles (`Vinay`, `Kids`, `Guest`).
3. **`streamflix_active_profile`**: Remembers currently selected active profile.
4. **`streamflix_mylist`**: Stores an array of saved movie IDs (e.g. `['interstellar', 'money-heist']`).
5. **`streamflix_progress`**: Remembers video playback time and percentage for each title to populate the *Continue Watching* row.

---

## ➕ How to Add More Movies & TV Shows

Edit `js/data.js` and append new items to the `moviesData` array:

```javascript
{
  id: 'unique-id',
  title: 'Movie Title',
  originalTitle: 'Original Name',
  type: 'movie', // or 'tv'
  year: 2026,
  rating: 8.5,
  maturity: '16+',
  duration: '2h 15m',
  badge: 'NEW',
  match: '96% Match',
  genre: ['Action', 'Sci-Fi'],
  description: 'Short synopsis description...',
  cast: ['Actor 1', 'Actor 2'],
  director: 'Director Name',
  poster: 'assets/images/posters/your-poster.jpg',
  backdrop: 'assets/images/backdrops/your-backdrop.jpg',
  posterFallback: 'https://images.unsplash.com/...',
  backdropFallback: 'https://images.unsplash.com/...',
  trailerUrl: 'https://www.youtube.com/embed/YOUR_TRAILER_ID',
  movieUrl: 'https://path-to-video-file.mp4',
  categories: ['trending', 'action', 'popularMovies']
}
```

---

## 🌐 Connecting to a Real Backend / API (TMDB / Node.js)

To connect StreamFlix to a real API like [The Movie Database (TMDB)](https://www.themoviedb.org/documentation/api):

1. Replace `js/data.js` static array with fetch requests:
   ```javascript
   async function fetchTrendingMovies() {
     const API_KEY = 'YOUR_TMDB_API_KEY';
     const response = await fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}`);
     const data = await response.json();
     return data.results.map(formatTMDBMovie);
   }
   ```
2. Map TMDB poster paths (`https://image.tmdb.org/t/p/w500/...`) into `createMovieCardHTML()`.

---

## 🚀 Deployment Guide

### GitHub Pages
1. Push `streamflix/` to a GitHub repository.
2. Go to **Settings > Pages**.
3. Select `main` branch and `/` root or `/streamflix` directory.
4. Save to deploy live instantly.

### Netlify / Vercel
1. Drag and drop the `streamflix/` folder directly onto the Netlify or Vercel dashboard.
2. Live URL will be generated automatically.

---

## 🎓 Academic Credit & Disclaimer

Developed as a college portfolio & MCA project demonstrating advanced frontend engineering, custom UX design, modular vanilla JavaScript state management, and media player implementation.

*Note: StreamFlix is an original streaming service concept inspired by modern video platforms. All trademarks, titles, and logos belong to their respective owners.*
