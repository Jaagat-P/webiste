(() => {
  const carousel = document.getElementById('frameCarousel');
  if (!carousel) return;

  const slides = [...carousel.querySelectorAll('.frame-slide')];
  const videoSlide = carousel.querySelector('.frame-slide--video');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const videoId = 'IEpDFcXcAQo';
  const startSeconds = 911;
  const endSeconds = 921;
  let current = 0;
  let timer;
  let loadTimer;
  let apiPromise;
  let player;
  let loading = false;
  let ready = false;
  let failed = false;
  let playOnReady = false;
  let resumeOnVisible = false;

  const videoIsActive = () => slides[current] === videoSlide;
  const canPlay = () => !failed && videoIsActive() && !document.hidden;

  function failVideo() {
    if (failed) return;
    failed = true;
    clearTimeout(loadTimer);
    playOnReady = false;
    resumeOnVisible = false;
    ready = false;
    if (player) {
      player.destroy();
      player = null;
    }
    if (videoIsActive()) showSlide(current + 1);
  }

  function scheduleNext() {
    clearTimeout(timer);
    if (!document.hidden && !videoIsActive() && !reducedMotion.matches) {
      timer = setTimeout(() => showSlide(current + 1), 5000);
    }
  }

  function loadYouTubeAPI() {
    if (window.YT && window.YT.Player) return Promise.resolve();
    if (!apiPromise) {
      apiPromise = new Promise((resolve, reject) => {
        const previousReady = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
          if (typeof previousReady === 'function') previousReady();
          resolve();
        };
        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
    return apiPromise;
  }

  function startPlayback() {
    if (!ready || failed || !canPlay()) return;
    playOnReady = false;
    player.mute();
    if (player.getPlayerState() === YT.PlayerState.ENDED) {
      player.cueVideoById({ videoId, startSeconds, endSeconds });
    }
    if (!reducedMotion.matches) player.playVideo();
  }

  async function ensurePlayer() {
    if (player || loading || failed) return;
    loading = true;
    loadTimer = setTimeout(failVideo, 15000);
    try {
      await loadYouTubeAPI();
      if (failed || !videoIsActive()) {
        clearTimeout(loadTimer);
        return;
      }
      player = new YT.Player('podcast-player', {
        videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          start: startSeconds,
          end: endSeconds,
          autoplay: 0,
          controls: 1,
          playsinline: 1,
          cc_load_policy: 1,
          cc_lang_pref: 'en',
          rel: 0,
          origin: window.location.origin
        },
        events: {
          onReady(event) {
            if (failed) return;
            clearTimeout(loadTimer);
            player = event.target;
            ready = true;
            player.mute();
            const iframe = player.getIframe();
            iframe.title = 'Jaagat on STARTS Podcast with Dwarkesh Patel';
            if (playOnReady) startPlayback();
          },
          onStateChange(event) {
            const state = event.data;
            if (state === YT.PlayerState.PLAYING) {
              if (!canPlay()) {
                event.target.pauseVideo();
                return;
              }
              playOnReady = false;
              resumeOnVisible = false;
            } else if (state === YT.PlayerState.PAUSED && !document.hidden) {
              resumeOnVisible = false;
            } else if (state === YT.PlayerState.ENDED && canPlay()) {
              showSlide(current + 1);
            }
          },
          onApiChange(event) {
            if (!failed && event.target.getOptions().includes('captions')) {
              event.target.setOption('captions', 'fontSize', 1);
            }
          },
          onError: failVideo
        }
      });
    } catch {
      failVideo();
    } finally {
      loading = false;
    }
  }

  function showSlide(index) {
    clearTimeout(timer);
    if (ready && videoIsActive()) player.pauseVideo();
    const direction = index < current ? -1 : 1;
    current = (index + slides.length) % slides.length;
    if (failed && videoIsActive()) current = (current + direction + slides.length) % slides.length;
    resumeOnVisible = false;
    playOnReady = videoIsActive();
    slides.forEach((slide, i) => {
      const active = i === current;
      slide.classList.toggle('active', active);
      slide.setAttribute('aria-hidden', String(!active));
      slide.inert = !active;
    });
    if (videoIsActive()) {
      ensurePlayer();
      startPlayback();
    }
    scheduleNext();
  }

  document.getElementById('frameLeft').addEventListener('click', () => showSlide(current - 1));
  document.getElementById('frameRight').addEventListener('click', () => showSlide(current + 1));
  document.addEventListener('visibilitychange', () => {
    clearTimeout(timer);
    if (document.hidden) {
      if (ready && videoIsActive()) {
        const state = player.getPlayerState();
        resumeOnVisible = state === YT.PlayerState.PLAYING || state === YT.PlayerState.BUFFERING;
        player.pauseVideo();
      }
    } else if (videoIsActive() && (resumeOnVisible || playOnReady)) {
      startPlayback();
    } else {
      scheduleNext();
    }
  });
  reducedMotion.addEventListener('change', scheduleNext);
  showSlide(0);
})();
