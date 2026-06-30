(function () {
  function tick() {
    const n = new Date();
    const date = n.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
    const time = n.toLocaleTimeString('en-US', { hour12: false });
    document.querySelectorAll('[data-clock="date"]').forEach(el => el.textContent = date);
    document.querySelectorAll('[data-clock="time"]').forEach(el => el.textContent = time);
  }
  tick();
  setInterval(tick, 1000);

  // Keep the clock's color gradient continuous across page loads / new tabs.
  // The CSS animation otherwise restarts at frame 0 on every load. By anchoring
  // its phase to wall-clock time (relative to a fixed epoch), a fresh tab
  // resumes the gradient exactly where it "should" be instead of resetting.
  function syncGradientPhase() {
    const EPOCH = Date.UTC(2024, 0, 1);            // fixed reference point
    const elapsed = (Date.now() - EPOCH) / 1000;   // seconds since epoch
    document.querySelectorAll('.h-clock span, .snav-clock span').forEach(el => {
      const duration = el.matches('[data-clock="time"]') ? 4 : 6; // must match CSS
      el.style.animationDelay = `-${(elapsed % duration).toFixed(3)}s`;
    });
  }
  syncGradientPhase();
})();
