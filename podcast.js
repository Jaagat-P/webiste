(() => {
  const search = document.querySelector('#episode-search');
  const searchControl = document.querySelector('.episode-search');
  const count = document.querySelector('#episode-count');
  const empty = document.querySelector('#episode-empty');
  const cards = [...document.querySelectorAll('.episode-card')];
  if (!search || !searchControl || !count || !empty || !cards.length) return;

  const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const titles = cards.map(card => normalize(card.querySelector('.episode-title').textContent));
  const filter = () => {
    const terms = normalize(search.value).trim().split(/\s+/).filter(Boolean);
    let visible = 0;
    cards.forEach((card, index) => {
      const matches = terms.every(term => titles[index].includes(term));
      card.hidden = !matches;
      if (matches) visible++;
    });
    count.textContent = terms.length ? `${visible} of ${cards.length}` : String(cards.length);
    empty.hidden = visible !== 0;
  };
  searchControl.hidden = false;
  search.addEventListener('input', filter);
  search.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      search.value = '';
      filter();
    }
  });
  filter();
})();
