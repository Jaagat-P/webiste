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
})();
