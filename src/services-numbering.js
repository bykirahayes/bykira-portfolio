// Services is the second primary page in the site navigation.
// Keep every Services-specific route marker aligned to 02, including
// decorative elements injected later by the shared experience script.
const forceServicesNumbering = () => {
  if (!window.location.pathname.startsWith('/services')) return;

  document.querySelectorAll('.studio-hud-page, .page-atmosphere-number').forEach((element) => {
    element.textContent = '02';
  });

  document.querySelectorAll('.page-chapter-rail strong').forEach((element) => {
    if (/services/i.test(element.textContent || '')) element.textContent = '02 / Services';
  });

  document.querySelectorAll('.section-index-glyph').forEach((element) => {
    const html = element.innerHTML;
    element.innerHTML = html.replace(/03\.(\d{2})/g, '02.$1');
  });
};

forceServicesNumbering();
requestAnimationFrame(forceServicesNumbering);
window.addEventListener('load', forceServicesNumbering, { once: true });
