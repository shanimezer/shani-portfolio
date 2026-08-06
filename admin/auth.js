(() => {
  'use strict';

  const config = window.ADMIN_AUTH_CONFIG || {};
  const sessionKey = config.sessionKey || 'portfolio_admin_access';

  async function sha256(value) {
    const bytes = new TextEncoder().encode(value);
    const hash = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(hash))
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  function unlock() {
    document.body.classList.remove('admin-locked');
    const dialog = document.getElementById('passwordDialog');
    if (dialog?.open) dialog.close();
  }

  function leaveAdmin() {
    const dialog = document.getElementById('passwordDialog');
    if (dialog?.open) dialog.close();
    window.setTimeout(() => window.location.replace('../index.html'), 120);
  }

  function loadAdminEnhancement(src) {
    if (document.querySelector(`script[data-admin-enhancement="${src}"]`)) return;
    const script = document.createElement('script');
    script.src = `${src}?v=20260806-4`;
    script.dataset.adminEnhancement = src;
    document.body.appendChild(script);
  }

  window.addEventListener('DOMContentLoaded', () => {
    const dialog = document.getElementById('passwordDialog');
    const form = document.getElementById('passwordForm');
    const input = document.getElementById('adminPassword');
    const error = document.getElementById('passwordError');

    loadAdminEnhancement('live-preview.js');

    if (!dialog || !form || !input || !config.passwordHash) {
      console.error('Admin password gate is not configured correctly.');
      leaveAdmin();
      return;
    }

    if (sessionStorage.getItem(sessionKey) === 'granted') {
      unlock();
      return;
    }

    dialog.addEventListener('cancel', event => {
      event.preventDefault();
      leaveAdmin();
    });

    dialog.showModal();
    window.setTimeout(() => input.focus(), 80);

    form.addEventListener('submit', async event => {
      event.preventDefault();
      const enteredHash = await sha256(input.value);

      if (enteredHash === config.passwordHash) {
        sessionStorage.setItem(sessionKey, 'granted');
        unlock();
        return;
      }

      error.hidden = false;
      dialog.classList.remove('is-wrong');
      void dialog.offsetWidth;
      dialog.classList.add('is-wrong');
      input.value = '';
      input.blur();
      window.setTimeout(leaveAdmin, 550);
    });
  });
})();
