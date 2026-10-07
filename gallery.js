(() => {
  'use strict';

  const items = Array.from(document.querySelectorAll('a[data-gallery-image]'));
  const dialog = document.getElementById('gallery-lightbox');
  const image = document.getElementById('gallery-lightbox-image');
  const caption = document.getElementById('gallery-lightbox-caption');
  const counter = document.getElementById('gallery-lightbox-counter');
  const closeButton = dialog?.querySelector('[data-gallery-close]');
  const previousButton = dialog?.querySelector('[data-gallery-previous]');
  const nextButton = dialog?.querySelector('[data-gallery-next]');

  // Keep the image links working normally without native dialog support.
  if (!items.length || !dialog || !image || !caption || !counter ||
      !closeButton || !previousButton || !nextButton ||
      typeof dialog.showModal !== 'function') return;

  let currentIndex = 0;
  let trigger = null;
  let unlockScroll = null;
  let pointerStartedOnBackdrop = false;

  function lockScroll() {
    const body = document.body;
    const originalWidth = document.documentElement.clientWidth;
    const originalPadding = parseFloat(getComputedStyle(body).paddingRight) || 0;
    const saved = ['overflow-x', 'overflow-y', 'padding-right'].map(property => ({
      property,
      value: body.style.getPropertyValue(property),
      priority: body.style.getPropertyPriority(property)
    }));

    body.style.setProperty('overflow-x', 'hidden');
    body.style.setProperty('overflow-y', 'hidden');
    // Compensate only when a scrollbar actually disappears; stable gutters
    // and overlay scrollbars already preserve the page's width.
    const extraWidth = document.documentElement.clientWidth - originalWidth;
    if (extraWidth > 0) body.style.setProperty('padding-right', `${originalPadding + extraWidth}px`);

    return () => {
      for (const { property, value, priority } of saved) {
        if (value) body.style.setProperty(property, value, priority);
        else body.style.removeProperty(property);
      }
    };
  }

  function showImage(index) {
    currentIndex = (index + items.length) % items.length;
    const item = items[currentIndex];
    const thumbnail = item.querySelector('img');
    const description = item.dataset.caption || thumbnail?.alt || `Photograph ${currentIndex + 1}`;

    image.alt = thumbnail?.alt || description;
    for (const dimension of ['width', 'height']) {
      const value = Number(item.dataset[dimension]);
      if (Number.isInteger(value) && value > 0) image.setAttribute(dimension, String(value));
      else image.removeAttribute(dimension);
    }
    image.src = item.href;
    caption.textContent = description;
    counter.textContent = `${currentIndex + 1} / ${items.length}`;
  }

  function openImage(event, index) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey ||
        event.ctrlKey || event.shiftKey || event.altKey) return;

    showImage(index);
    if (!dialog.open) {
      trigger = items[index];
      try {
        dialog.showModal();
      } catch {
        trigger = null;
        return;
      }
      unlockScroll = lockScroll();
      closeButton.focus({ preventScroll: true });
    }
    event.preventDefault();
  }

  items.forEach((item, index) => item.addEventListener('click', event => openImage(event, index)));
  previousButton.disabled = nextButton.disabled = items.length < 2;

  closeButton.addEventListener('click', event => {
    event.preventDefault();
    dialog.close();
  });
  previousButton.addEventListener('click', event => {
    event.preventDefault();
    showImage(currentIndex - 1);
  });
  nextButton.addEventListener('click', event => {
    event.preventDefault();
    showImage(currentIndex + 1);
  });

  dialog.addEventListener('keydown', event => {
    if (!dialog.open || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showImage(currentIndex + (event.key === 'ArrowRight' ? 1 : -1));
    }
    // Escape is handled by the native dialog, including its cancel event.
  });

  function isBackdrop(event) {
    if (event.target !== dialog) return false;
    const bounds = dialog.getBoundingClientRect();
    return event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom;
  }

  dialog.addEventListener('pointerdown', event => {
    pointerStartedOnBackdrop = isBackdrop(event);
  });
  dialog.addEventListener('pointercancel', () => { pointerStartedOnBackdrop = false; });
  dialog.addEventListener('click', event => {
    const shouldClose = pointerStartedOnBackdrop && isBackdrop(event);
    pointerStartedOnBackdrop = false;
    if (shouldClose) dialog.close();
  });

  dialog.addEventListener('close', () => {
    unlockScroll?.();
    unlockScroll = null;
    pointerStartedOnBackdrop = false;
    if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    trigger = null;
  });
})();
