/* ==========================================================================
   STREAMFLIX CUSTOM HTML5 VIDEO PLAYER (js/player.js)
   Full feature video player: Play/Pause, Seekbar, Volume, PIP, Fullscreen,
   Playback speed, Quality/Subtitle selectors, & Progress Saving.
   ========================================================================== */

let activeVideoMovie = null;

function openVideoPlayer(movie) {
  activeVideoMovie = movie;

  let playerOverlay = document.getElementById('player-overlay');
  if (!playerOverlay) {
    createPlayerDOM();
    playerOverlay = document.getElementById('player-overlay');
  }

  const video = playerOverlay.querySelector('#streamflix-video');
  const titleEl = playerOverlay.querySelector('.player-title');

  if (titleEl) titleEl.textContent = movie.title;

  // Use movie HTML5 video URL or reliable fallback sample MP4
  const videoSrc = movie.movieUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  video.src = videoSrc;

  // Restore saved watch position if available
  const storedProgress = localStorage.getItem('streamflix_progress');
  if (storedProgress) {
    try {
      const progressMap = JSON.parse(storedProgress);
      if (progressMap[movie.id] && progressMap[movie.id].seconds) {
        video.currentTime = progressMap[movie.id].seconds;
      }
    } catch (e) {}
  }

  playerOverlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  video.play().catch(err => console.log('Autoplay prevented:', err));
  initPlayerEvents(video, movie.id);
}

function closeVideoPlayer() {
  const playerOverlay = document.getElementById('player-overlay');
  if (!playerOverlay) return;

  const video = playerOverlay.querySelector('#streamflix-video');
  if (video) {
    video.pause();
  }

  playerOverlay.style.display = 'none';
  document.body.style.overflow = '';
}

function createPlayerDOM() {
  const dom = `
    <div id="player-overlay" class="player-overlay" style="display:none;">
      <div class="player-header">
        <button class="player-back-btn" onclick="closeVideoPlayer()" aria-label="Back">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="#fff"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
        </button>
        <span class="player-title">StreamFlix Player</span>
      </div>

      <video id="streamflix-video" class="video-element" crossorigin="anonymous">
        <track kind="subtitles" label="English" srclang="en" src="" default />
      </video>

      <div class="player-controls">
        <div class="player-progress-container">
          <input type="range" id="player-seekbar" class="player-seekbar" min="0" max="100" value="0" step="0.1" />
        </div>

        <div class="player-buttons-row">
          <div class="player-controls-left">
            <button id="player-play-btn" class="player-btn" aria-label="Play/Pause">
              <svg id="play-icon" viewBox="0 0 24 24" width="24" height="24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>
              <svg id="pause-icon" viewBox="0 0 24 24" width="24" height="24" fill="#fff" style="display:none;"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            </button>

            <button id="player-volume-btn" class="player-btn" aria-label="Mute/Unmute">
              <svg id="vol-icon" viewBox="0 0 24 24" width="24" height="24" fill="#fff"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
            </button>
            <input type="range" id="player-vol-slider" class="player-vol-slider" min="0" max="1" step="0.05" value="1" />

            <span id="player-time-display" class="player-time-display">00:00 / 00:00</span>
          </div>

          <div class="player-controls-right">
            <!-- Speed Selector -->
            <select id="player-speed-select" class="player-select">
              <option value="0.5">0.5x</option>
              <option value="1.0" selected>1.0x</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
              <option value="2.0">2.0x</option>
            </select>

            <!-- Quality Selector -->
            <select id="player-quality-select" class="player-select">
              <option value="1080p">1080p HD</option>
              <option value="720p">720p</option>
              <option value="480p">480p</option>
            </select>

            <!-- Picture in Picture -->
            <button id="player-pip-btn" class="player-btn" title="Picture in Picture">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff"><path d="M19 11h-8v6h8v-6zm4-8H1c-.55 0-1 .45-1 1v16c0 .55.45 1 1 1h22c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zm-2 16H3V5h18v14z"/></svg>
            </button>

            <!-- Fullscreen -->
            <button id="player-fullscreen-btn" class="player-btn" title="Fullscreen">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', dom);
  injectPlayerStyles();
}

function initPlayerEvents(video, movieId) {
  const overlay = document.getElementById('player-overlay');
  const playBtn = overlay.querySelector('#player-play-btn');
  const playIcon = overlay.querySelector('#play-icon');
  const pauseIcon = overlay.querySelector('#pause-icon');
  const seekbar = overlay.querySelector('#player-seekbar');
  const volumeBtn = overlay.querySelector('#player-volume-btn');
  const volSlider = overlay.querySelector('#player-vol-slider');
  const timeDisplay = overlay.querySelector('#player-time-display');
  const speedSelect = overlay.querySelector('#player-speed-select');
  const pipBtn = overlay.querySelector('#player-pip-btn');
  const fullscreenBtn = overlay.querySelector('#player-fullscreen-btn');

  playBtn.onclick = () => {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  video.onplay = () => {
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';
  };

  video.onpause = () => {
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
  };

  // Time & Progress Updates
  video.ontimeupdate = () => {
    if (isNaN(video.duration)) return;
    const pct = (video.currentTime / video.duration) * 100;
    seekbar.value = pct;
    timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;

    // Save Watching Progress to localStorage
    saveProgress(movieId, pct, video.currentTime);
  };

  seekbar.oninput = () => {
    if (isNaN(video.duration)) return;
    video.currentTime = (seekbar.value / 100) * video.duration;
  };

  // Volume
  volSlider.oninput = () => {
    video.volume = volSlider.value;
    video.muted = video.volume === 0;
  };

  volumeBtn.onclick = () => {
    video.muted = !video.muted;
    volSlider.value = video.muted ? 0 : video.volume;
  };

  // Speed
  speedSelect.onchange = () => {
    video.playbackRate = parseFloat(speedSelect.value);
  };

  // PIP
  pipBtn.onclick = async () => {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    } else if (document.pictureInPictureEnabled) {
      await video.requestPictureInPicture();
    }
  };

  // Fullscreen
  fullscreenBtn.onclick = () => {
    if (!document.fullscreenElement) {
      overlay.requestFullscreen().catch(err => console.log(err));
    } else {
      document.exitFullscreen();
    }
  };
}

function saveProgress(movieId, percent, seconds) {
  let progressMap = {};
  const stored = localStorage.getItem('streamflix_progress');
  if (stored) {
    try { progressMap = JSON.parse(stored); } catch (e) {}
  }
  progressMap[movieId] = { percent: Math.round(percent), seconds: seconds, updatedAt: new Date().toISOString() };
  localStorage.setItem('streamflix_progress', JSON.stringify(progressMap));
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}

function injectPlayerStyles() {
  if (document.getElementById('player-custom-styles')) return;
  const style = document.createElement('style');
  style.id = 'player-custom-styles';
  style.textContent = `
    .player-overlay {
      position: fixed;
      inset: 0;
      background: #000;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .player-header {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      padding: 1.5rem 2rem;
      background: linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%);
      z-index: 10;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      color: #fff;
    }
    .player-title {
      font-size: 1.3rem;
      font-weight: 700;
    }
    .player-back-btn {
      background: none;
      border: none;
      cursor: pointer;
    }
    .video-element {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .player-controls {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      background: linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%);
      padding: 1.5rem 2rem;
      z-index: 10;
    }
    .player-progress-container {
      margin-bottom: 1rem;
    }
    .player-seekbar {
      width: 100%;
      accent-color: #E50914;
      cursor: pointer;
    }
    .player-buttons-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .player-controls-left, .player-controls-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .player-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: #fff;
      display: flex;
      align-items: center;
    }
    .player-vol-slider {
      width: 80px;
      accent-color: #E50914;
    }
    .player-time-display {
      color: #b3b3b3;
      font-size: 0.85rem;
    }
    .player-select {
      background: rgba(0,0,0,0.6);
      color: #fff;
      border: 1px solid rgba(255,255,255,0.3);
      border-radius: 4px;
      padding: 0.3rem 0.5rem;
      font-size: 0.85rem;
      outline: none;
    }
  `;
  document.head.appendChild(style);
}
