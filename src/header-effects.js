import './desktop-header.css';
import './site-experience.js';

const path = window.location.pathname;

const navItems = [
  ['/', '00', 'Home', path === '/' || path === '/index.html'],
  ['/work/', '01', 'Work', path.startsWith('/work')],
  ['/services/', '02', 'Services', path.startsWith('/services') || path.startsWith('/commission')],
  ['/about/', '03', 'About', path.startsWith('/about')],
  ['/faq', '04', 'FAQ', path.startsWith('/faq')],
];

const buildNav = () => navItems.map(([href, marker, label, active]) => (
  `<a href="${href}"${active ? ' class="active" aria-current="page"' : ''}>${label} <span>${marker}</span></a>`
)).join('');

const applyModernHeader = () => {
  const header = document.querySelector('header');
  if (!header) return;

  const headerContent = header.querySelector('.header-content');
  if (!headerContent) return;

  let brand = headerContent.querySelector('.header-brand');
  if (!brand) {
    brand = document.createElement('div');
    brand.className = 'header-brand';
    headerContent.prepend(brand);
  }
  brand.innerHTML = '<a class="logo wordmark" href="/" aria-label="By Kira home"><img src="/image/bykira-wordmark.png" alt="By Kira" width="1664" height="936"></a><span class="brand-role">WEB DEVELOPER</span>';

  let navigation = headerContent.querySelector('nav');
  if (!navigation) {
    navigation = document.createElement('nav');
    navigation.setAttribute('aria-label', 'Primary navigation');
    headerContent.append(navigation);
  }
  navigation.innerHTML = buildNav();

  let headerActions = headerContent.querySelector('.header-actions');
  if (!headerActions) {
    headerActions = document.createElement('div');
    headerActions.className = 'header-actions';
    headerContent.append(headerActions);
  }
  headerActions.innerHTML = '<a class="header-cta" href="/enquiry/">Start a project <span>↗</span></a>';

  // This hidden sentinel prevents the legacy header builder in main.js from ever running.
  let lock = headerContent.querySelector('[data-modern-header-lock]');
  if (!lock) {
    lock = document.createElement('span');
    lock.className = 'nav-toggle';
    lock.dataset.modernHeaderLock = '';
    lock.hidden = true;
    lock.setAttribute('aria-hidden', 'true');
    lock.style.setProperty('display', 'none', 'important');
    headerContent.append(lock);
  }

  header.querySelectorAll('.active-section, .header-status').forEach((item) => item.remove());
  header.dataset.navVersion = 'modern';
  document.documentElement.classList.add('modern-header-ready');
};

applyModernHeader();

document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('header');
  applyModernHeader();

  if (header) {
    let correcting = false;
    const observer = new MutationObserver(() => {
      if (correcting) return;
      correcting = true;
      applyModernHeader();
      queueMicrotask(() => { correcting = false; });
    });
    observer.observe(header, { childList: true, subtree: true });
  }

  document.querySelectorAll('footer').forEach((footer) => {
    footer.className = '';
    footer.id = 'site-footer';
    footer.innerHTML = `
      <div class="footer-inner">
        <div class="footer-topline">
          <span>BY KIRA / DIGITAL STUDIO</span>
          <span><i aria-hidden="true"></i> AVAILABLE FOR SELECTED PROJECTS</span>
          <span>MANCHESTER / WORLDWIDE</span>
        </div>
        <div class="footer-directory">
          <div class="footer-identity">
            <a class="logo wordmark" href="/" aria-label="By Kira home"><img src="/image/bykira-wordmark.png" alt="By Kira" width="1664" height="936"></a>
            <p>Independent website design<br>and development.</p>
            <a class="footer-identity-cta" href="/enquiry/">Start a project <span>↗</span></a>
            <span>EST. MCR / 2026</span>
          </div>
          <div class="footer-columns">
            <div><span class="footer-label">01 / Explore</span><a href="/work/">Work</a><a href="/services/">Services</a><a href="/about/">About</a><a href="/faq">FAQ</a></div>
            <div><span class="footer-label">02 / Start</span><a href="/enquiry/">Project enquiry</a><a href="/website-review/">Free website review</a></div>
            <div><span class="footer-label">03 / Details</span><a href="/privacy/">Privacy &amp; Biscuits</a><a href="/accessibility/">Accessibility</a><a href="/terms/">Terms</a></div>
          </div>
        </div>
        <div class="footer-bottom"><span><i aria-hidden="true"></i> STUDIO ONLINE</span><span>© 2026 BY KIRA</span><a href="#main-content">BACK TO TOP ↑</a></div>
      </div>`;
  });

  document.querySelectorAll('a[href="/commission/"]').forEach((link) => {
    link.href = '/services/#packages';
  });
  if (!path.startsWith('/guides')) {
    document.querySelectorAll('a[href="/guides/"]').forEach((link) => {
      link.href = '/services/';
      if (/guide/i.test(link.textContent)) link.textContent = 'Explore services ↗';
    });
  }

  document.querySelectorAll('.cookie-settings').forEach((button) => {
    button.textContent = 'Privacy & Biscuits';
  });

  document.addEventListener('mousemove', (event) => {
    if (!header) return;
    const rect = header.getBoundingClientRect();
    header.style.setProperty('--mouse-x', `${event.clientX - rect.left}px`);
    header.style.setProperty('--mouse-y', `${event.clientY - rect.top}px`);
  });

  const handleScroll = () => {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 20);
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
});
