(() => {
  const socials=[
    ['Instagram','https://www.instagram.com/shanimezer/','<path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.5-3.25a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z"/>'],
    ['TikTok','https://www.tiktok.com/@shanimezer','<path d="M14 2h3a5 5 0 0 0 5 5v3a8 8 0 0 1-5-1.75V16a6 6 0 1 1-6-6h1v3h-1a3 3 0 1 0 3 3V2Z"/>'],
    ['YouTube','https://www.youtube.com/@shani_mezer','<path d="M23 12s0-4.2-.55-6.2a3 3 0 0 0-2.1-2.1C18.45 3.2 12 3.2 12 3.2s-6.45 0-8.35.5a3 3 0 0 0-2.1 2.1C1 7.8 1 12 1 12s0 4.2.55 6.2a3 3 0 0 0 2.1 2.1c1.9.5 8.35.5 8.35.5s6.45 0 8.35-.5a3 3 0 0 0 2.1-2.1C23 16.2 23 12 23 12Zm-13.2 4V8l6.9 4-6.9 4Z"/>'],
    ['LinkedIn','https://www.linkedin.com/in/shanimezer/','<path d="M5.3 7.8H2V22h3.3V7.8ZM3.65 2A1.95 1.95 0 1 0 3.65 5.9 1.95 1.95 0 0 0 3.65 2ZM22 13.9c0-4.3-2.3-6.3-5.4-6.3-2.5 0-3.6 1.4-4.2 2.3V7.8H9.1V22h3.3v-7c0-1.85.35-3.65 2.65-3.65 2.27 0 2.3 2.12 2.3 3.77V22H22v-8.1Z"/>']
  ];
  const markup=className=>`<div class="${className}">${socials.map(([name,url,path])=>`<a href="${url}" target="_blank" rel="noopener" aria-label="${name}" title="${name}"><svg viewBox="0 0 24 24" aria-hidden="true">${path}</svg></a>`).join('')}</div>`;
  const nav=document.querySelector('.desktop-nav'); if(nav)nav.insertAdjacentHTML('afterend',markup('home-socials'));
  const mobile=document.getElementById('mobileMenu'); if(mobile)mobile.insertAdjacentHTML('beforeend',markup('mobile-socials'));
})();