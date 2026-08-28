const content = document.getElementById('content');
const cursorGlow = document.querySelector('.cursor-glow');
const hero = document.querySelector('.hero');

if (content) content.style.display = 'block';

// Privacy-friendly analytics: one anonymous page view, with no cookies or stored IP address.
if (window.location.hostname === 'bykira.co.uk' || window.location.hostname === 'www.bykira.co.uk') {
  fetch('https://bykira-analytics.safe-bream-3817.chatgpt.site/api/event', {
    method: 'POST',
    mode: 'cors',
    keepalive: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: window.location.pathname, referrer: document.referrer, userAgent: navigator.userAgent }),
  }).catch(() => {});
}

document.querySelectorAll('header').forEach((header) => {
  const headerContent = header.querySelector('.header-content');
  const navigation = header.querySelector('nav');
  if (!headerContent || !navigation || header.querySelector('.nav-toggle')) return;

  const path = window.location.pathname;
  const onHomePage = path === '/' || path.endsWith('/index.html');
  const pageContext = path.startsWith('/work') ? 'WORK'
    : path.startsWith('/services') ? 'SERVICES'
      : path.startsWith('/faq') ? 'FAQ'
        : path.startsWith('/enquiry') ? 'ENQUIRY'
          : path.includes('privacy') ? 'PRIVACY'
            : path.includes('accessibility') ? 'ACCESSIBILITY'
              : 'HOME';
  const activeKey = pageContext.toLowerCase();
  navigation.innerHTML = [
    ['work', '/work/', '01', 'Work'],
    ['services', '/services/', '£', 'Services'],
    ['about', onHomePage ? '#about' : '/#about', '02', 'About'],
    ['faq', '/faq', '?', 'FAQ'],
  ].map(([key, href, marker, label]) => `<a${activeKey === key ? ' class="active" aria-current="page"' : ''} href="${href}"><span>${marker}</span>${label}</a>`).join('');

  let headerActions = headerContent.querySelector('.header-actions');
  if (!headerActions) {
    headerActions = document.createElement('div');
    headerActions.className = 'header-actions';
    headerContent.append(headerActions);
  }
  const enquiryPage = path.startsWith('/enquiry');
  headerActions.innerHTML = `<div class="header-status"><span class="status-dot"></span><span class="status-copy">AVAILABLE</span></div><span class="active-section" data-static>${pageContext}</span><a class="header-cta" href="${enquiryPage ? 'mailto:info@bykira.co.uk' : '/enquiry/'}">${enquiryPage ? 'Email directly' : 'Start a project'} <span>↗</span></a>`;

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
        <a class="footer-email" href="mailto:info@bykira.co.uk">info@bykira.co.uk <span>↗</span></a>
      </div>
      <div class="footer-columns">
        <div><span class="footer-label">Navigate</span><a href="/work/">Work</a><a href="/services/">Services</a><a href="/#about">About</a><a href="/#process">Steps</a><a href="/faq">FAQ</a><a href="/enquiry/">Enquire</a></div>
        <div><span class="footer-label">Connect</span><a href="mailto:info@bykira.co.uk">Email</a><a href="https://www.linkedin.com/in/kian-price-880251400/" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a><a href="https://x.com/KAPforges" target="_blank" rel="noopener noreferrer">X ↗</a></div>
        <div><span class="footer-label">Details</span><span>Manchester, England</span><span>Working worldwide</span><button class="cookie-settings" type="button">Privacy &amp; cookies</button><a href="/admin/" rel="nofollow">Owner login ↗</a></div>
      </div>
      <div class="footer-bottom"><a class="logo" href="/" aria-label="Kira home">Kira<span>®</span></a><span>Independent website developer</span><span>© 2026 Kira</span><a href="#main-content">Back to top ↑</a></div>
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
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - headerHeight - 18, behavior: 'smooth' });
  });
});

const navLinks = Array.from(document.querySelectorAll('nav a[href^="#"]'));
const sections = Array.from(document.querySelectorAll('main section[id]'));
const activeSectionLabel = document.querySelector('.active-section');
const scrollProgress = document.querySelector('.scroll-progress span');
const sectionLabels = { hero: '00 / HOME', portfolio: '01 / WORK', about: '02 / ABOUT', skills: '03 / TOOLKIT', process: '04 / STEPS', contact: '05 / CONTACT', faq: 'FAQ / INFO' };
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

// This site deliberately uses no cookies, analytics or advertising trackers.
// Keep privacy and accessibility information available from every standard footer.
document.querySelectorAll('footer').forEach((footer) => {
  if (footer.querySelector('.legal-links')) return;
  const links = document.createElement('nav');
  links.className = 'legal-links';
  links.setAttribute('aria-label', 'Legal and accessibility');
  links.innerHTML = '<a href="/privacy.html">Privacy &amp; cookies</a><a href="/accessibility.html">Accessibility</a>';
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
  link.href = '/privacy.html#cookies';
  link.textContent = 'Privacy & cookies';
  button.replaceWith(link);
});

document.querySelectorAll('.faq-list details').forEach((item) => {
  item.open = true;
  item.querySelector('summary')?.addEventListener('click', (event) => event.preventDefault());
});

const enquiryForm = document.querySelector('#project-enquiry');
enquiryForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!enquiryForm.reportValidity()) return;
  const data = new FormData(enquiryForm);
  const value = (name) => String(data.get(name) || '').trim();
  const projectName = value('business') || value('name');
  const launchDate = value('launch');
  const formattedLaunchDate = launchDate
    ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${launchDate}T00:00:00Z`))
    : 'Flexible';
  const subject = `Website enquiry | ${projectName} | ${value('service')}`;
  const body = [
    'NEW WEBSITE PROJECT ENQUIRY',
    'Submitted via By Kira',
    '',
    'Hello Kira,',
    '',
    "I'd like to discuss a new website project. I've included the key details below.",
    '',
    'CONTACT DETAILS',
    `Name: ${value('name')}`,
    `Email: ${value('email')}`,
    `Business or project: ${value('business') || 'Not provided'}`,
    '',
    'PROJECT OVERVIEW',
    `Service required: ${value('service')}`,
    `Approximate budget: ${value('budget')}`,
    `Preferred launch date: ${formattedLaunchDate}`,
    `Current website: ${value('website') || 'None provided'}`,
    '',
    'PROJECT BRIEF',
    value('details'),
    '',
    'HOW I FOUND YOU',
    value('source') || 'Not provided',
    '',
    'NEXT STEP',
    `Please reply to ${value('name')} at ${value('email')}.`,
    '',
    '—',
    'Sent securely from the project enquiry form at bykira.co.uk/enquiry/',
  ].join('\r\n');
  const status = enquiryForm.querySelector('.form-status');
  if (status) status.textContent = 'Your email app is opening — review the message, then press send.';
  window.location.href = `mailto:info@bykira.co.uk?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});
