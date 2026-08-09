(() => {
  'use strict';
  document.querySelectorAll('.world[href]').forEach(world => {
    world.addEventListener('click', event => {
      const href = world.getAttribute('href');
      if (!href) return;
      // Simon uses hover as its desktop input. A deliberate click should always
      // remain a normal portfolio navigation action, even while the game is active.
      if (event.defaultPrevented || document.body.classList.contains('simon-mode')) {
        window.location.assign(href);
      }
    });
  });
})();
