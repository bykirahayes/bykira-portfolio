import './experience.css';
import './responsive-polish.css';

document.documentElement.classList.add('experience-v3');
document.body.dataset.route = window.location.pathname.split('/').filter(Boolean)[0] || 'home';

const content = document.getElementById('content');
const cursorGlow = document.querySelector('.cursor-glow');
const hero = document.querySelector('.atelier-hero, .hero');

if (content) content.style.display = 'block';

// Cookie-free, privacy-friendly analytics provided by Cloudflare.
const analyticsPreference = (() => {
  try { return window.localStorage.getItem('bykira-analytics'); } catch { return null; }
})();
const analyticsOptedOut = analyticsPreference !== 'on'
  || navigator.globalPrivacyControl === true
  || navigator.doNotTrack === '1';

if ((window.location.hostname === 'bykira.co.uk' || window.location.hostname === 'www.bykira.co.uk')
  && !analyticsOptedOut) {
  const analyticsBeacon = document.createElement('script');
  analyticsBeacon.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  analyticsBeacon.dataset.cfBeacon = JSON.stringify({ token: 'ac5a21b6d03b4bbaa67aa4a2eadeba79' });
  analyticsBeacon.defer = true;
  document.head.append(analyticsBeacon);
}

const trackJourney = (eventName) => {
  if (analyticsOptedOut || !['bykira.co.uk', 'www.bykira.co.uk'].includes(window.location.hostname)) return;
  const payload = {
    event: eventName,
    path: window.location.pathname,
    device: window.matchMedia('(max-width: 650px)').matches ? 'mobile' : 'desktop',
  };
  void fetch('https://contact.bykira.co.uk/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => { /* Analytics must never interrupt the visitor. */ });
};

document.querySelectorAll('header').forEach((header) => {
  const headerContent = header.querySelector('.header-content');
  const navigation = header.querySelector('nav');
  if (!headerContent || !navigation || header.querySelector('.nav-toggle')) return;

  const path = window.location.pathname;
  const pageContext = path.startsWith('/work') ? 'WORK'
    : path.startsWith('/services') ? 'SERVICES'
      : path.startsWith('/about') ? 'ABOUT'
      : path.startsWith('/faq') ? 'FAQ'
        : path.startsWith('/commission') ? 'COMMISSION'
          : path.startsWith('/website-review') ? 'FREE REVIEW'
          : path.startsWith('/guides') ? 'GUIDES'
        : path.startsWith('/enquiry') ? 'ENQUIRY'
          : path.includes('privacy') ? 'PRIVACY'
            : path.includes('accessibility') ? 'ACCESSIBILITY'
              : 'HOME';
  const navItems = [
    ['work', '/work/', '01', 'Work'],
    ['services', '/services/', '02', 'Services'],
    ['about', '/about/', '03', 'About'],
    ['guides', '/guides/', '04', 'Guides'],
    ['commission', '/commission/', '05', 'Commission'],
    ['website-review', '/website-review/', '06', 'Free review'],
    ['faq', '/faq', '07', 'FAQ'],
    ['enquiry', '/enquiry/', '08', 'Enquire'],
  ];
  navigation.innerHTML = navItems.map(([key, href, marker, label]) => {
    const active = path === href || path.startsWith(`/${key}/`) || (key === 'faq' && path.startsWith('/faq'));
    return `<a${active ? ' class="active" aria-current="page"' : ''} href="${href}"><span>${marker}</span>${label}</a>`;
  }).join('');

  let headerActions = headerContent.querySelector('.header-actions');
  if (!headerActions) {
    headerActions = document.createElement('div');
    headerActions.className = 'header-actions';
    headerContent.append(headerActions);
  }
  headerActions.innerHTML = `<div class="header-status"><span class="status-dot"></span><span class="status-copy">AVAILABLE</span></div><span class="active-section" data-static>${pageContext}</span><a class="header-cta" href="/enquiry/">Start a project <span>↗</span></a>`;

  const toggle = document.createElement('button');
  toggle.className = 'nav-toggle';
  toggle.type = 'button';
  toggle.setAttribute('aria-label', 'Open menu');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.innerHTML = '<span class="nav-toggle-label">Menu</span><span class="nav-toggle-icon" aria-hidden="true"><i></i><i></i></span>';
  headerContent.append(toggle);

  const closeMenu = () => {
    header.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    toggle.querySelector('.nav-toggle-label').textContent = 'Menu';
  };

  toggle.addEventListener('click', () => {
    const open = header.classList.toggle('menu-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    toggle.querySelector('.nav-toggle-label').textContent = open ? 'Close' : 'Menu';
  });
  navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
  document.addEventListener('pointerdown', (event) => {
    if (header.classList.contains('menu-open') && !header.contains(event.target)) closeMenu();
  });
});

// A shared chapter language gives every route its own identity without
// competing with the page content. Decorative layers stay out of the
// accessibility tree and inherit the same violet / ice-blue palette.
const chapterRoutes = [
  { match: /^\/work\/?$/, code: '01', symbol: '↗', name: 'Work', note: 'Honest work, added as it happens' },
  { match: /^\/about\/?$/, code: '02', symbol: '✳', name: 'About', note: 'The person behind the pixels' },
  { match: /^\/services\/?$/, code: '03', symbol: '◇', name: 'Services', note: 'Clear offers, considered outcomes' },
  { match: /^\/faq(?:\.html)?\/?$/, code: '04', symbol: '?', name: 'Questions', note: 'Useful answers, minus the fog' },
  { match: /^\/enquiry(?:\.html)?\/?$/, code: '05', symbol: '✦', name: 'Enquiry', note: 'The first useful conversation' },
  { match: /^\/guides(?:\/.*)?$/, code: '06', symbol: '↳', name: 'Guides', note: 'Notes for better website decisions' },
  { match: /^\/commission\/?$/, code: '07', symbol: '£', name: 'Commission', note: 'Choose, brief, approve and pay' },
  { match: /^\/website-review\/?$/, code: '08', symbol: '◎', name: 'Review', note: 'Three practical ideas, freely given' },
  { match: /^\/privacy(?:\.html)?\/?$/, code: '08', symbol: '◌', name: 'Privacy', note: 'What is collected—and what is not' },
  { match: /^\/accessibility(?:\.html)?\/?$/, code: '09', symbol: '✣', name: 'Accessibility', note: 'A website made for more people' },
  { match: /^\/terms\/?$/, code: '10', symbol: '§', name: 'Terms', note: 'Clear expectations, written plainly' },
];

const routeChapter = chapterRoutes.find(({ match }) => match.test(window.location.pathname));
const pageMain = document.querySelector('main');
if (routeChapter && pageMain && !pageMain.querySelector('.page-chapter-rail')) {
  pageMain.classList.add('chapter-page');
  pageMain.insertAdjacentHTML('afterbegin', `
    <div class="page-atmosphere" aria-hidden="true">
      <span class="page-atmosphere-number">${routeChapter.code}</span>
      <span class="page-atmosphere-orbit"><i></i></span>
      <span class="page-atmosphere-cross page-atmosphere-cross-a">${routeChapter.symbol}</span>
      <span class="page-atmosphere-cross page-atmosphere-cross-b">+</span>
    </div>
    <div class="page-chapter-rail" aria-hidden="true">
      <span class="page-chapter-symbol">${routeChapter.symbol}</span>
      <strong>${routeChapter.code} / ${routeChapter.name}</strong>
      <i></i>
      <span>${routeChapter.note}</span>
    </div>`);

  Array.from(pageMain.children)
    .filter((element) => element.tagName === 'SECTION')
    .forEach((section, index) => {
      const marker = document.createElement('span');
      marker.className = 'section-index-glyph';
      marker.setAttribute('aria-hidden', 'true');
      marker.innerHTML = `<i>${routeChapter.symbol}</i>${routeChapter.code}.${String(index + 1).padStart(2, '0')}`;
      section.append(marker);
    });
}

// A quiet studio HUD adds useful orientation and a live Manchester timestamp.
// It is decorative and non-interactive, so it never enters the tab order.
const studioHud = document.createElement('aside');
studioHud.className = 'studio-hud';
studioHud.setAttribute('aria-hidden', 'true');
studioHud.innerHTML = `
  <span class="studio-hud-location">MCR</span>
  <time class="studio-hud-time">--:--</time>
  <span class="studio-hud-track"><i></i></span>
  <span class="studio-hud-page">${routeChapter?.code || '00'}</span>
  <span class="studio-hud-section">01</span>`;
document.body.append(studioHud);

const updateStudioTime = () => {
  const time = studioHud.querySelector('.studio-hud-time');
  if (!time) return;
  time.textContent = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date());
};
updateStudioTime();
window.setInterval(updateStudioTime, 30000);

// Keep one complete, consistent footer across every page and error route.
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
          <a class="logo" href="/" aria-label="By Kira home"><img src="/image/kira-logo.png" alt="By Kira" width="44" height="44"></a>
          <p>Independent website design<br>and development.</p>
          <a class="footer-identity-cta" href="/enquiry/">Start a project <span>↗</span></a>
          <span>EST. MCR / 2026</span>
        </div>
        <div class="footer-columns">
          <div><span class="footer-label">01 / Explore</span><a href="/work/">Work</a><a href="/services/">Services</a><a href="/about/">About</a><a href="/guides/">Guides</a><a href="/faq">FAQ</a></div>
          <div><span class="footer-label">02 / Start</span><a href="/commission/">Commission &amp; payment</a><a href="/enquiry/">Project enquiry</a><a href="/website-review/">Free website review</a><a href="/services/">Services &amp; pricing</a></div>
          <div><span class="footer-label">03 / Follow</span><a href="https://www.linkedin.com/in/kian-price-880251400/" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a><a href="https://x.com/KAPforges" target="_blank" rel="noopener noreferrer">X ↗</a><button class="cookie-settings" type="button">Privacy &amp; biscuits</button><a href="/terms/">Website terms</a></div>
        </div>
      </div>
      <div class="footer-bottom"><span><i aria-hidden="true"></i> STUDIO ONLINE</span><span>© 2026 BY KIRA</span><a href="#main-content">BACK TO TOP ↑</a></div>
    </div>`;
});

document.querySelectorAll('header .logo, footer .logo').forEach((link) => {
  link.classList.add('wordmark');
  link.innerHTML = '<img src="/image/bykira-wordmark.png" alt="By Kira" width="1664" height="936">';
});

const enquiryPanel = document.querySelector('.enquiry-panel');
if (enquiryPanel) {
  enquiryPanel.addEventListener('pointermove', (event) => {
    const bounds = enquiryPanel.getBoundingClientRect();
    enquiryPanel.style.setProperty('--enquiry-x', `${event.clientX - bounds.left}px`);
    enquiryPanel.style.setProperty('--enquiry-y', `${event.clientY - bounds.top}px`);
  });

  enquiryPanel.querySelectorAll('input, select, textarea').forEach((field) => {
    const updateFieldState = () => field.closest('label')?.classList.toggle('has-value', Boolean(field.value));
    field.addEventListener('change', updateFieldState);
    field.addEventListener('input', updateFieldState);
    updateFieldState();
  });
}

function initRevealAnimations() {
  const elements = document.querySelectorAll('.project, .section-topline, .section-heading, .about-layout, .skills-row, .process-intro, .process-step, .contact, .intro-strip, .first-project-card, .service-card, .sales-note, .faq-list details, .faq-cta, .footer-directory, .build-standard-intro, .build-compass, .build-standard-grid article');
  if (!('IntersectionObserver' in window)) {
    elements.forEach((element) => element.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  elements.forEach((element, index) => {
    element.classList.add('reveal');
    element.style.setProperty('--reveal-delay', `${Math.min(index % 5, 4) * 55}ms`);
    observer.observe(element);
  });
}

document.querySelectorAll('.service-card, .process-step, .faq-list details').forEach((item) => {
  item.addEventListener('pointermove', (event) => {
    const bounds = item.getBoundingClientRect();
    item.style.setProperty('--card-x', `${event.clientX - bounds.left}px`);
    item.style.setProperty('--card-y', `${event.clientY - bounds.top}px`);
  });
});

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (event) => {
    const href = anchor.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    event.preventDefault();
    const headerHeight = document.querySelector('header')?.offsetHeight || 0;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - headerHeight - 18, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
});

const navLinks = Array.from(document.querySelectorAll('nav a[href^="#"]'));
const sections = Array.from(document.querySelectorAll('main section[id]'));
const pageSections = Array.from(document.querySelectorAll('main section'));
const activeSectionLabel = document.querySelector('.active-section');
const scrollProgress = document.querySelector('.scroll-progress span');
const studioHudProgress = document.querySelector('.studio-hud-track i');
const studioHudSection = document.querySelector('.studio-hud-section');

function updateScrollUi() {
  const scrollTop = window.scrollY;
  const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = documentHeight > 0 ? Math.min(1, Math.max(0, scrollTop / documentHeight)) : 0;
  if (scrollProgress) scrollProgress.style.transform = `scaleX(${progress})`;
  if (studioHudProgress) studioHudProgress.style.transform = `scaleX(${progress})`;

  if (pageSections.length && studioHudSection) {
    const headerHeight = document.querySelector('header')?.offsetHeight || 0;
    const currentIndex = pageSections.reduce((found, section, index) => {
      if (section.getBoundingClientRect().top <= headerHeight + window.innerHeight * .3) return index;
      return found;
    }, 0);
    studioHudSection.textContent = String(currentIndex + 1).padStart(2, '0');
  }

  if (!sections.length || !activeSectionLabel || activeSectionLabel.dataset.static !== undefined) return;
  const headerHeight = document.querySelector('header')?.offsetHeight || 0;
  const current = sections.reduce((found, section) => {
    if (section.getBoundingClientRect().top <= headerHeight + 90) return section;
    return found;
  }, sections[0]);
  if (!current) return;
  const sectionName = current.dataset.nav || current.id.replace(/-/g, ' ');
  activeSectionLabel.textContent = sectionName.toUpperCase();
  navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${current.id}`));
}

let scrollFrame = 0;
const requestScrollUi = () => {
  if (scrollFrame) return;
  scrollFrame = window.requestAnimationFrame(() => {
    updateScrollUi();
    scrollFrame = 0;
  });
};
window.addEventListener('scroll', requestScrollUi, { passive: true });
window.addEventListener('resize', requestScrollUi);
updateScrollUi();

function initMagneticLinks() {
  if (window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const targets = document.querySelectorAll('.contact-button, .project-link, .text-link, .header-cta, .footer-identity-cta, .faq-cta a, .commission-card .commission-card-cta, .build-standard-cta');
  targets.forEach((target) => {
    target.addEventListener('pointermove', (event) => {
      const bounds = target.getBoundingClientRect();
      const x = (event.clientX - bounds.left - bounds.width / 2) * 0.08;
      const y = (event.clientY - bounds.top - bounds.height / 2) * 0.12;
      target.style.setProperty('--magnet-x', `${x}px`);
      target.style.setProperty('--magnet-y', `${y}px`);
    });
    target.addEventListener('pointerleave', () => {
      target.style.setProperty('--magnet-x', '0px');
      target.style.setProperty('--magnet-y', '0px');
    });
  });
}

function initHeroParallax() {
  if (!hero || window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  hero.addEventListener('pointermove', (event) => {
    const bounds = hero.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    hero.style.setProperty('--hero-x', x.toFixed(3));
    hero.style.setProperty('--hero-y', y.toFixed(3));
    hero.style.setProperty('--hero-pointer-x', `${event.clientX - bounds.left}px`);
    hero.style.setProperty('--hero-pointer-y', `${event.clientY - bounds.top}px`);
  });
  hero.addEventListener('pointerleave', () => {
    hero.style.setProperty('--hero-x', '0');
    hero.style.setProperty('--hero-y', '0');
  });
}

function initCursorSpotlight() {
  if (!cursorGlow || window.matchMedia('(pointer: coarse)').matches) return;
  document.addEventListener('pointermove', (event) => {
    cursorGlow.style.setProperty('--cursor-x', `${event.clientX}px`);
    cursorGlow.style.setProperty('--cursor-y', `${event.clientY}px`);
    cursorGlow.classList.add('is-active');
  });
  document.addEventListener('pointerleave', () => cursorGlow.classList.remove('is-active'));
}

function initFaqAccordions() {
  document.querySelectorAll('.faq-list details').forEach((detail) => {
    detail.addEventListener('toggle', () => {
      const marker = detail.querySelector('summary i');
      if (marker) marker.textContent = detail.open ? '−' : '+';
    });
  });
}

initRevealAnimations();
initMagneticLinks();
initHeroParallax();
initCursorSpotlight();
initFaqAccordions();
