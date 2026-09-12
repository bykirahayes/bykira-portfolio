import './experience.css';

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
const sectionLabels = { hero: '00 / HOME', portfolio: '01 / WORK', about: '02 / ABOUT', skills: '03 / TOOLKIT', process: '04 / STEPS', contact: '06 / CONTACT', faq: 'FAQ / INFO' };
const updateActiveNavigation = () => {
  const currentSection = sections.reduce((current, section) => {
    return window.scrollY >= section.offsetTop - 180 ? section.id : current;
  }, 'hero');
  navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${currentSection}`));
  if (activeSectionLabel && !activeSectionLabel.hasAttribute('data-static')) activeSectionLabel.textContent = sectionLabels[currentSection] || '00 / HOME';
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
  if (scrollProgress) scrollProgress.style.transform = `scaleX(${progress})`;
  if (studioHudProgress) studioHudProgress.style.transform = `scaleY(${Math.max(0.045, progress)})`;
  if (studioHudSection) {
    const currentIndex = pageSections.reduce((current, section, index) => {
      return window.scrollY >= section.offsetTop - 180 ? index : current;
    }, 0);
    studioHudSection.textContent = String(currentIndex + 1).padStart(2, '0');
  }
};
window.addEventListener('scroll', updateActiveNavigation, { passive: true });
updateActiveNavigation();

window.addEventListener('mousemove', (event) => {
  if (!cursorGlow) return;
  cursorGlow.style.left = `${event.clientX}px`;
  cursorGlow.style.top = `${event.clientY}px`;
});

if (hero) {
  hero.addEventListener('pointermove', (event) => {
    const bounds = hero.getBoundingClientRect();
    hero.style.setProperty('--pointer-x', `${event.clientX - bounds.left}px`);
    hero.style.setProperty('--pointer-y', `${event.clientY - bounds.top}px`);
  }, { passive: true });
}

initRevealAnimations();

// Cloudflare Web Analytics is cookie-free; no advertising trackers are used.
// Keep privacy and accessibility information available from every standard footer.
document.querySelectorAll('footer').forEach((footer) => {
  if (footer.querySelector('.legal-links')) return;
  const links = document.createElement('nav');
  links.className = 'legal-links';
  links.setAttribute('aria-label', 'Legal and accessibility');
  links.innerHTML = '<a href="/privacy/">Privacy &amp; biscuits</a><a href="/accessibility/">Accessibility</a>';
  const footerBottom = footer.querySelector('.footer-bottom');
  if (footerBottom) {
    links.classList.add('legal-links-inline');
    footerBottom.insertBefore(links, footerBottom.lastElementChild);
  } else {
    footer.append(links);
  }
});

const BISCUIT_CONSENT_KEY = 'bykira-biscuit-consent';

const readBiscuitConsent = () => {
  try { return window.localStorage.getItem(BISCUIT_CONSENT_KEY); } catch { return null; }
};

const saveBiscuitConsent = (analyticsAllowed) => {
  try {
    window.localStorage.setItem(BISCUIT_CONSENT_KEY, analyticsAllowed ? 'accepted' : 'rejected');
    window.localStorage.setItem('bykira-analytics', analyticsAllowed ? 'on' : 'off');
  } catch { /* Visitors can still browse if storage is unavailable. */ }
};

const biscuitNotice = document.createElement('section');
biscuitNotice.className = 'cookie-notice biscuit-notice';
biscuitNotice.setAttribute('role', 'dialog');
biscuitNotice.setAttribute('aria-modal', 'false');
biscuitNotice.setAttribute('aria-labelledby', 'biscuit-title');
biscuitNotice.innerHTML = `
  <div class="biscuit-copy">
    <span class="cookie-index">A SMALL BITE OF PRIVACY</span>
    <h2 id="biscuit-title">Fancy a biscuit?</h2>
    <p>We use essential biscuits to keep the site working and, only with your permission, privacy-friendly analytics biscuits to understand what visitors enjoy.</p>
    <div class="biscuit-preferences" hidden>
      <label><span><strong>Essential biscuits</strong><small>Needed for your choices and core site features.</small></span><input type="checkbox" checked disabled></label>
      <label><span><strong>Analytics biscuits</strong><small>Anonymous visit data that helps improve By Kira.</small></span><input id="biscuit-analytics" type="checkbox"></label>
      <a href="/privacy/#cookies">Read the biscuit details ↗</a>
    </div>
  </div>
  <div class="cookie-actions">
    <button class="cookie-close" type="button" data-biscuit-action="reject">Reject</button>
    <button class="cookie-manage" type="button" data-biscuit-action="settings" aria-expanded="false">Settings</button>
    <button class="cookie-accept" type="button" data-biscuit-action="accept">Accept</button>
  </div>`;

const biscuitPreferences = biscuitNotice.querySelector('.biscuit-preferences');
const biscuitAnalytics = biscuitNotice.querySelector('#biscuit-analytics');
const biscuitSettingsButton = biscuitNotice.querySelector('[data-biscuit-action="settings"]');

const showBiscuitNotice = (showSettings = false) => {
  biscuitNotice.hidden = false;
  biscuitPreferences.hidden = !showSettings;
  biscuitSettingsButton.setAttribute('aria-expanded', String(showSettings));
  biscuitSettingsButton.textContent = showSettings ? 'Save choices' : 'Settings';
  biscuitAnalytics.checked = analyticsPreference === 'on';
  window.requestAnimationFrame(() => biscuitNotice.classList.add('is-visible'));
};

const hideBiscuitNotice = () => {
  biscuitNotice.classList.remove('is-visible');
  window.setTimeout(() => { biscuitNotice.hidden = true; }, 220);
};

biscuitNotice.addEventListener('click', (event) => {
  const action = event.target.closest('[data-biscuit-action]')?.dataset.biscuitAction;
  if (!action) return;
  if (action === 'settings' && biscuitPreferences.hidden) {
    showBiscuitNotice(true);
    return;
  }
  const allowAnalytics = action === 'accept' || (action === 'settings' && biscuitAnalytics.checked);
  saveBiscuitConsent(allowAnalytics);
  hideBiscuitNotice();
  if (allowAnalytics && analyticsPreference !== 'on') window.setTimeout(() => window.location.reload(), 240);
});

document.body.append(biscuitNotice);
biscuitNotice.hidden = true;
if (!readBiscuitConsent()) showBiscuitNotice();

document.querySelectorAll('.cookie-settings').forEach((button) => {
  button.textContent = 'Biscuit settings';
  button.addEventListener('click', () => showBiscuitNotice(true));
});

const analyticsControl = document.querySelector('#analytics-preference');
if (analyticsControl) {
  const status = document.querySelector('#analytics-status');
  const updateAnalyticsControl = () => {
    const disabled = (() => {
      try { return window.localStorage.getItem('bykira-analytics') === 'off'; } catch { return false; }
    })();
    analyticsControl.textContent = disabled ? 'Allow privacy-friendly analytics' : 'Opt out of analytics';
    analyticsControl.setAttribute('aria-pressed', String(disabled));
    if (status) status.textContent = disabled ? 'Analytics are off on this device.' : 'Privacy-friendly analytics are on.';
  };
  analyticsControl.addEventListener('click', () => {
    try {
      const disabled = window.localStorage.getItem('bykira-analytics') === 'off';
      if (disabled) window.localStorage.removeItem('bykira-analytics');
      else window.localStorage.setItem('bykira-analytics', 'off');
    } catch { /* The preference cannot be stored when browser storage is unavailable. */ }
    updateAnalyticsControl();
  });
  updateAnalyticsControl();
}

document.querySelectorAll('.faq-list details').forEach((item) => {
  item.addEventListener('toggle', () => {
    item.setAttribute('data-state', item.open ? 'open' : 'closed');
  });
});
const firstFaq = document.querySelector('.faq-list details');
if (firstFaq && !document.querySelector('.faq-list details[open]')) firstFaq.open = true;

const enquiryForm = document.querySelector('#project-enquiry');
if (enquiryForm) {
  const status = enquiryForm.querySelector('.form-status');
  const button = enquiryForm.querySelector('button[type="submit"]');
  const confirmation = document.querySelector('#enquiry-confirmation');
  const fields = Array.from(enquiryForm.querySelectorAll('input, select, textarea'))
    .filter((field) => field.name !== 'companyWebsite' && field.name !== 'cf-turnstile-response');
  enquiryForm.noValidate = true;

  const fieldLabel = (field) => field.closest('label')?.querySelector(':scope > span')?.textContent.replace('*', '').trim() || 'This field';
  const validationMessage = (field) => {
    const label = fieldLabel(field);
    if (field.validity.valueMissing) return `${label} is required.`;
    if (field.validity.typeMismatch && field.type === 'email') return 'Enter a complete email address, such as name@example.com.';
    if (field.validity.typeMismatch && field.type === 'url') return 'Enter a complete website address beginning with https://';
    if (field.validity.tooLong) return `${label} is too long.`;
    return `Check ${label.toLowerCase()} and try again.`;
  };

  const clearFieldError = (field) => {
    const label = field.closest('label');
    label?.classList.remove('has-error');
    field.removeAttribute('aria-invalid');
    const error = label?.querySelector('.field-error');
    if (error) error.remove();
    field.removeAttribute('aria-describedby');
  };

  const showFieldError = (field) => {
    clearFieldError(field);
    const label = field.closest('label');
    if (!label) return;
    const error = document.createElement('span');
    const errorId = `error-${field.name}`;
    error.className = 'field-error';
    error.id = errorId;
    error.textContent = validationMessage(field);
    label.classList.add('has-error');
    field.setAttribute('aria-invalid', 'true');
    field.setAttribute('aria-describedby', errorId);
    label.append(error);
  };

  fields.forEach((field) => {
    field.addEventListener('invalid', (event) => {
      event.preventDefault();
      showFieldError(field);
    });
    ['input', 'change'].forEach((eventName) => field.addEventListener(eventName, () => {
      if (field.validity.valid) clearFieldError(field);
    }));
  });

  const launchDate = enquiryForm.elements.namedItem('launch');
  if (launchDate instanceof HTMLInputElement) launchDate.min = new Date().toISOString().slice(0, 10);

  enquiryForm.addEventListener('focusin', () => trackJourney('enquiry_started'), { once: true });
  trackJourney('enquiry_viewed');

  enquiryForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const invalidFields = fields.filter((field) => !field.validity.valid);
    if (invalidFields.length) {
      invalidFields.forEach(showFieldError);
      invalidFields[0].focus({ preventScroll: true });
      invalidFields[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (status) status.textContent = 'Please check the highlighted details.';
      trackJourney('enquiry_validation_error');
      return;
    }

    const data = new FormData(enquiryForm);
    const value = (name) => String(data.get(name) || '').trim();
    const turnstileToken = value('cf-turnstile-response');
    if (!turnstileToken) {
      if (status) status.textContent = 'Please complete the security check and try again.';
      document.querySelector('.turnstile-wrap')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      trackJourney('enquiry_security_incomplete');
      return;
    }
    const payload = {
      name: value('name'), email: value('email'), business: value('business'),
      service: value('service'), budget: value('budget'), launch: value('launch'),
      website: value('website'), details: value('details'), source: value('source'),
      companyWebsite: value('companyWebsite'), turnstileToken,
    };
    if (button) button.disabled = true;
    enquiryForm.setAttribute('aria-busy', 'true');
    if (status) status.textContent = 'Sending your enquiry securely…';
    fetch('https://contact.bykira.co.uk/enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then((response) => {
      if (!response.ok) throw new Error('submission_failed');
      trackJourney('enquiry_submitted');
      enquiryForm.reset();
      fields.forEach(clearFieldError);
      window.turnstile?.reset();
      enquiryForm.hidden = true;
      if (confirmation) {
        const name = confirmation.querySelector('[data-enquiry-name]');
        if (name) name.textContent = `, ${payload.name.split(/\s+/)[0]}`;
        confirmation.hidden = false;
        confirmation.focus();
      }
    }).catch(() => {
      if (status) status.textContent = 'The enquiry could not be sent just now. Your details are still here — please wait a moment and try again.';
      window.turnstile?.reset();
      trackJourney('enquiry_submit_failed');
    }).finally(() => {
      if (button) button.disabled = false;
      enquiryForm.removeAttribute('aria-busy');
    });
  });

  confirmation?.querySelector('[data-new-enquiry]')?.addEventListener('click', () => {
    confirmation.hidden = true;
    enquiryForm.hidden = false;
    const firstField = enquiryForm.elements.namedItem('name');
    if (firstField instanceof HTMLElement) firstField.focus();
    window.turnstile?.reset();
  });
}


// Portfolio-grade interaction layer: expressive on capable devices, quiet everywhere else.
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
document.documentElement.classList.add('motion-capable');

const pageWipe = document.createElement('div');
pageWipe.className = 'page-wipe';
pageWipe.setAttribute('aria-hidden', 'true');
pageWipe.innerHTML = `
  <div class="loader-grid"></div>
  <div class="loader-topline">
    <span>BY KIRA / DIGITAL STUDIO</span>
    <span>53.4808° N / 2.2426° W</span>
  </div>
  <div class="loader-core">
    <strong>BY KIRA</strong>
    <p>DESIGN <em>✦</em> DEVELOPMENT</p>
  </div>
  <div class="loader-progress">
    <span>PREPARING THE EXPERIENCE</span>
    <div><i></i></div>
    <b data-loader-progress>000</b>
  </div>
  <div class="loader-bottom">
    <span>INDEPENDENT / MANCHESTER</span>
    <span>STUDIO ONLINE <i></i></span>
  </div>`;
document.body.append(pageWipe);

const loaderSeen = (() => {
  try {
    const seen = window.sessionStorage.getItem('bykira-loader-seen') === 'yes';
    window.sessionStorage.setItem('bykira-loader-seen', 'yes');
    return seen;
  } catch {
    return false;
  }
})();
if (loaderSeen) pageWipe.classList.add('is-quick');

const loaderCounter = pageWipe.querySelector('[data-loader-progress]');
const loaderStart = performance.now();
const loaderDuration = loaderSeen ? 160 : 620;
const updateLoaderCounter = (time) => {
  const progress = Math.min(1, (time - loaderStart) / loaderDuration);
  const eased = 1 - Math.pow(1 - progress, 3);
  if (loaderCounter) loaderCounter.textContent = String(Math.round(eased * 100)).padStart(3, '0');
  pageWipe.style.setProperty('--loader-progress', String(eased));
  if (progress < 1) window.requestAnimationFrame(updateLoaderCounter);
};
window.requestAnimationFrame(updateLoaderCounter);
window.setTimeout(() => document.documentElement.classList.add('page-entered'), loaderSeen ? 90 : 560);

document.querySelectorAll('main > section, main > article, .guide-copy > section').forEach((section, index) => {
  if (section.querySelector(':scope > .section-sigil')) return;
  const sigil = document.createElement('span');
  sigil.className = 'section-sigil';
  sigil.setAttribute('aria-hidden', 'true');
  sigil.innerHTML = `<i>${['✦', '⌁', '◎', '◇'][index % 4]}</i><b>${String(index + 1).padStart(2, '0')}</b>`;
  section.append(sigil);
});

const interactiveCards = document.querySelectorAll([
  '.home-service-grid article',
  '.process-step',
  '.project-fit-list article',
  '.home-guides-grid > a',
  '.guide-grid > a',
  '.service-card',
  '.enquiry-trust-grid > *',
  '.first-project-card',
  '.tool-console',
  '.faq-list details'
].join(','));

if (finePointerQuery.matches && !reducedMotionQuery.matches) {
  const cursor = document.createElement('div');
  cursor.className = 'kira-pointer';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.innerHTML = '<span></span><b>EXPLORE</b>';
  document.body.append(cursor);

  let pointerX = window.innerWidth / 2;
  let pointerY = window.innerHeight / 2;
  let cursorX = pointerX;
  let cursorY = pointerY;
  let cursorFrame = 0;

  const renderPointer = () => {
    cursorX += (pointerX - cursorX) * 0.18;
    cursorY += (pointerY - cursorY) * 0.18;
    cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
    cursorFrame = window.requestAnimationFrame(renderPointer);
  };

  window.addEventListener('pointermove', (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    cursor.classList.add('is-visible');
  }, { passive: true });
  document.documentElement.addEventListener('mouseleave', () => cursor.classList.remove('is-visible'));
  renderPointer();

  const pointerLabels = [
    ['a', 'OPEN'],
    ['button', 'SELECT'],
    ['summary', 'READ'],
    ['.contact-button, .header-cta, .atelier-primary, .project-fit-cta, .enquiry-submit', 'START'],
    ['.service-card, .process-step, .tool-console', 'VIEW']
  ];
  pointerLabels.forEach(([selector, label]) => {
    document.querySelectorAll(selector).forEach((element) => {
      element.addEventListener('pointerenter', () => {
        cursor.querySelector('b').textContent = label;
        cursor.classList.add('is-active');
      });
      element.addEventListener('pointerleave', () => {
        cursor.querySelector('b').textContent = 'EXPLORE';
        cursor.classList.remove('is-active');
      });
    });
  });

  document.querySelectorAll([
    '.header-cta',
    '.atelier-primary',
    '.contact-button',
    '.project-fit-cta',
    '.enquiry-submit',
    '.footer-identity-cta',
    '.error-primary'
  ].join(',')).forEach((element) => {
    element.classList.add('is-magnetic');
    element.addEventListener('pointermove', (event) => {
      const bounds = element.getBoundingClientRect();
      const x = (event.clientX - bounds.left - bounds.width / 2) * 0.14;
      const y = (event.clientY - bounds.top - bounds.height / 2) * 0.18;
      element.style.setProperty('--magnetic-x', `${x}px`);
      element.style.setProperty('--magnetic-y', `${y}px`);
    });
    element.addEventListener('pointerleave', () => {
      element.style.setProperty('--magnetic-x', '0px');
      element.style.setProperty('--magnetic-y', '0px');
    });
  });

  interactiveCards.forEach((card) => {
    card.classList.add('is-depth-card');
    card.addEventListener('pointermove', (event) => {
      const bounds = card.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      const rotateX = ((y / bounds.height) - 0.5) * -1.8;
      const rotateY = ((x / bounds.width) - 0.5) * 1.8;
      card.style.setProperty('--depth-x', `${x}px`);
      card.style.setProperty('--depth-y', `${y}px`);
      card.style.setProperty('--depth-rx', `${rotateX}deg`);
      card.style.setProperty('--depth-ry', `${rotateY}deg`);
    }, { passive: true });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--depth-rx', '0deg');
      card.style.setProperty('--depth-ry', '0deg');
    });
  });

  window.addEventListener('pagehide', () => window.cancelAnimationFrame(cursorFrame), { once: true });
}

let previousScrollY = window.scrollY;
let scrollVelocity = 0;
let scrollTicking = false;
const renderScrollAtmosphere = () => {
  const delta = window.scrollY - previousScrollY;
  previousScrollY = window.scrollY;
  scrollVelocity += (delta - scrollVelocity) * 0.24;
  document.documentElement.style.setProperty('--scroll-drift', `${Math.max(-18, Math.min(18, scrollVelocity * 0.18))}px`);
  document.documentElement.style.setProperty('--scroll-turn', `${Math.max(-1.2, Math.min(1.2, scrollVelocity * 0.012))}deg`);
  scrollTicking = false;
};
window.addEventListener('scroll', () => {
  if (reducedMotionQuery.matches || scrollTicking) return;
  scrollTicking = true;
  window.requestAnimationFrame(renderScrollAtmosphere);
}, { passive: true });

document.addEventListener('click', (event) => {
  if (reducedMotionQuery.matches || event.defaultPrevented || event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const link = event.target.closest('a[href]');
  if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
  const destination = new URL(link.href, window.location.href);
  if (destination.origin !== window.location.origin) return;
  if (destination.pathname === window.location.pathname && destination.hash) return;
  event.preventDefault();
  document.documentElement.classList.add('page-leaving');
  window.setTimeout(() => { window.location.href = destination.href; }, 280);
});

reducedMotionQuery.addEventListener?.('change', () => window.location.reload());


// Prefill the enquiry from a chosen commission package.
if (enquiryForm) {
  const commissionParams = new URLSearchParams(window.location.search);
  const serviceValue = commissionParams.get('service');
  const budgetValue = commissionParams.get('budget');
  const setMatchingOption = (name, requestedValue) => {
    if (!requestedValue) return;
    const field = enquiryForm.elements.namedItem(name);
    if (!(field instanceof HTMLSelectElement)) return;
    const match = Array.from(field.options).find((option) => option.value === requestedValue || option.textContent.trim() === requestedValue);
    if (!match) return;
    field.value = match.value;
    field.dispatchEvent(new Event('change', { bubbles: true }));
  };
  setMatchingOption('service', serviceValue);
  setMatchingOption('budget', budgetValue);
  if (commissionParams.get('source') === 'commission') {
    const status = enquiryForm.querySelector('.form-status');
    if (status) status.textContent = 'Your commission starting point has been added below. Complete the remaining details when ready.';
  }
}
