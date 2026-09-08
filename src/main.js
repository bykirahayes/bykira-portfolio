const content = document.getElementById('content');
const cursorGlow = document.querySelector('.cursor-glow');
const hero = document.querySelector('.hero');

if (content) content.style.display = 'block';

// Cookie-free, privacy-friendly analytics provided by Cloudflare.
const analyticsPreference = (() => {
  try { return window.localStorage.getItem('bykira-analytics'); } catch { return null; }
})();
const analyticsOptedOut = analyticsPreference === 'off'
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
        : path.startsWith('/website-review') ? 'FREE REVIEW'
          : path.startsWith('/guides') ? 'GUIDES'
        : path.startsWith('/enquiry') ? 'ENQUIRY'
          : path.includes('privacy') ? 'PRIVACY'
            : path.includes('accessibility') ? 'ACCESSIBILITY'
              : 'HOME';
  const activeKey = pageContext.toLowerCase();
  navigation.innerHTML = [
    ['work', '/work/', '01', 'Work'],
    ['services', '/services/', '£', 'Services'],
    ['about', '/about/', '02', 'About'],
    ['faq', '/faq', '?', 'FAQ'],
  ].map(([key, href, marker, label]) => `<a${activeKey === key ? ' class="active" aria-current="page"' : ''} href="${href}"><span>${marker}</span>${label}</a>`).join('');

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
  window.addEventListener('resize', () => {
    if (window.innerWidth > 720) closeMenu();
  }, { passive: true });
});

// Keep one complete, consistent footer across every page and error route.
document.querySelectorAll('footer').forEach((footer) => {
  footer.className = '';
  footer.id = 'site-footer';
  footer.innerHTML = `
    <div class="footer-inner">
      <div class="footer-lead">
        <p class="footer-kicker">HAVE A PROJECT IN MIND?</p>
        <h2>Let's make it<br><em>worth visiting.</em></h2>
        <a class="footer-email" href="/enquiry/">Start an enquiry <span>↗</span></a>
      </div>
      <div class="footer-columns">
        <div><span class="footer-label">Navigate</span><a href="/work/">Work</a><a href="/services/">Services</a><a href="/about/">About</a><a href="/guides/">Guides</a><a href="/faq">FAQ</a><a href="/enquiry/">Enquire</a></div>
        <div><span class="footer-label">Connect</span><a href="/website-review/">Free website review</a><a href="/enquiry/">Project enquiry</a><a href="https://www.linkedin.com/in/kian-price-880251400/" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a><a href="https://x.com/KAPforges" target="_blank" rel="noopener noreferrer">X ↗</a></div>
        <div><span class="footer-label">Details</span><span>Manchester, England</span><span>Working worldwide</span><button class="cookie-settings" type="button">Privacy &amp; cookies</button><a href="/terms/">Website terms</a></div>
      </div>
      <div class="footer-bottom"><a class="logo" href="/" aria-label="Kira home"><img src="/image/kira-logo.png" alt="Kira" width="44" height="44"></a><span>Independent website developer</span><span>© 2026 Kira</span><a href="#main-content">Back to top ↑</a></div>
    </div>`;
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
  const elements = document.querySelectorAll('.project, .section-topline, .section-heading, .about-layout, .skills-row, .process-intro, .process-step, .contact, .intro-strip, .first-project-card, .service-card, .sales-note, .faq-list details, .faq-cta, .footer-lead, .footer-columns');
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
const activeSectionLabel = document.querySelector('.active-section');
const scrollProgress = document.querySelector('.scroll-progress span');
const sectionLabels = { hero: '00 / HOME', portfolio: '01 / WORK', about: '02 / ABOUT', skills: '03 / TOOLKIT', process: '04 / STEPS', contact: '06 / CONTACT', faq: 'FAQ / INFO' };
const updateActiveNavigation = () => {
  const currentSection = sections.reduce((current, section) => {
    return window.scrollY >= section.offsetTop - 180 ? section.id : current;
  }, 'hero');
  navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${currentSection}`));
  if (activeSectionLabel && !activeSectionLabel.hasAttribute('data-static')) activeSectionLabel.textContent = sectionLabels[currentSection] || '00 / HOME';
  if (scrollProgress) {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
    scrollProgress.style.transform = `scaleX(${progress})`;
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
  links.innerHTML = '<a href="/privacy/">Privacy &amp; cookies</a><a href="/accessibility/">Accessibility</a>';
  const footerBottom = footer.querySelector('.footer-bottom');
  if (footerBottom) {
    links.classList.add('legal-links-inline');
    footerBottom.insertBefore(links, footerBottom.lastElementChild);
  } else {
    footer.append(links);
  }
});

document.querySelectorAll('.cookie-settings').forEach((button) => {
  const link = document.createElement('a');
  link.href = '/privacy/#cookies';
  link.textContent = 'Privacy & cookies';
  button.replaceWith(link);
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
