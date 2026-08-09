(() => {
  'use strict';

  document.querySelectorAll('.world[href]').forEach(world => {
    const navigate = event => {
      if (!document.body.classList.contains('simon-mode')) return;
      const href = world.getAttribute('href');
      if (!href) return;
      event.preventDefault();
      event.stopPropagation();
      window.location.assign(href);
    };

    // Use pointerdown so deliberate navigation wins before Simon's click handler
    // can cancel the link's default action.
    world.addEventListener('pointerdown', navigate, { capture:true });

    // Keep a click fallback for keyboard activation and older browsers.
    world.addEventListener('click', event => {
      const href = world.getAttribute('href');
      if (!href) return;
      if (event.defaultPrevented || document.body.classList.contains('simon-mode')) {
        window.location.assign(href);
      }
    });
  });
})();