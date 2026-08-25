const content = document.getElementById('content');
const cursorGlow = document.querySelector('.cursor-glow');
const hero = document.querySelector('.hero');

if (content) content.style.display = 'block';

document.querySelectorAll('header').forEach((header) => {
  const headerContent = header.querySelector('.header-content');
  const navigation = header.querySelector('nav');
  if (!headerContent || !navigation || header.querySelector('.nav-toggle')) return;

  const toggle = document.createElement('button');
  toggle.className = 'nav-toggle';
  toggle.type = 'button';
  toggle.setAttribute('aria-label', 'Open menu');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.innerHTML = '<span></span><span></span><span></span>';
  headerContent.append(toggle);

  const closeMenu = () => {
    header.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  };

  toggle.addEventListener('click', () => {
    const open = header.classList.toggle('menu-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
});

function initRevealAnimations() {
  const elements = document.querySelectorAll('.project, .section-heading, .about-layout, .skills-row, .process-intro, .process-step, .contact, .intro-strip');
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

  elements.forEach((element) => {
    element.classList.add('reveal');
    observer.observe(element);
  });
}

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
  footer.append(links);
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
  const subject = `Website enquiry — ${value('business') || value('name')}`;
  const body = [
    `Name: ${value('name')}`,
    `Email: ${value('email')}`,
    `Business / project: ${value('business') || 'Not provided'}`,
    `Service: ${value('service')}`,
    `Budget: ${value('budget')}`,
    `Ideal launch: ${value('launch') || 'Flexible'}`,
    `Current website: ${value('website') || 'None provided'}`,
    `How they found Kira: ${value('source') || 'Not provided'}`,
    '',
    'Project details:',
    value('details'),
  ].join('\n');
  const status = enquiryForm.querySelector('.form-status');
  if (status) status.textContent = 'Your email app is opening — review the message, then press send.';
  window.location.href = `mailto:info@bykira.co.uk?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});
