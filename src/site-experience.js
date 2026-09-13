import './site-experience.css';
import './mobile-brand.css';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const initLoader = () => {
  if (document.querySelector('.bykira-loader')) return;

  const loaderStartedAt = performance.now();
  const isMobile = window.matchMedia('(max-width: 760px)').matches;
  const minimumVisible = isMobile ? 1400 : 3200;
  const fadeDuration = isMobile ? 550 : 900;

  const loader = document.createElement('div');
  loader.className = 'bykira-loader';
  loader.setAttribute('aria-hidden', 'true');
  loader.innerHTML = `
    <div class="bykira-loader-inner">
      <span class="bykira-loader-mark">BK</span>
      <div class="bykira-loader-copy"><span>By Kira</span><span>Loading studio</span></div>
      <div class="bykira-loader-track"><i></i></div>
    </div>`;
  document.body.prepend(loader);

  const leave = () => {
    const elapsed = performance.now() - loaderStartedAt;
    const remaining = reduceMotion ? 0 : Math.max(0, minimumVisible - elapsed);

    window.setTimeout(() => {
      if (reduceMotion) {
        loader.remove();
        return;
      }
      loader.classList.add('is-leaving');
      window.setTimeout(() => loader.remove(), fadeDuration);
    }, remaining);
  };

  if (document.readyState === 'complete') leave();
  else window.addEventListener('load', leave, { once: true });
};

const initModernMobileMenu = () => {
  document.querySelectorAll('header[data-nav-version="modern"]').forEach((header) => {
    const headerContent = header.querySelector('.header-content');
    const nav = header.querySelector('nav');
    if (!headerContent || !nav) return;

    let toggle = header.querySelector('.mobile-menu-toggle');
    if (!toggle) {
      toggle = document.createElement('button');
      toggle.className = 'mobile-menu-toggle';
      toggle.type = 'button';
      toggle.setAttribute('aria-label', 'Open navigation');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.innerHTML = '<span class="menu-label">Menu</span><span class="menu-icon" aria-hidden="true"></span>';
      headerContent.append(toggle);
    }

    const setOpen = (open) => {
      header.classList.toggle('menu-open', open);
      document.body.classList.toggle('menu-locked', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      const label = toggle.querySelector('.menu-label');
      if (label) label.textContent = open ? 'Close' : 'Menu';
    };

    if (!toggle.dataset.bound) {
      toggle.dataset.bound = 'true';
      toggle.addEventListener('click', () => setOpen(!header.classList.contains('menu-open')));
      nav.addEventListener('click', (event) => {
        if (event.target.closest('a')) setOpen(false);
      });
    }

    header._bykiraSetMenuOpen = setOpen;
  });

  if (!document.documentElement.dataset.bykiraMenuEvents) {
    document.documentElement.dataset.bykiraMenuEvents = 'true';

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      document.querySelectorAll('header.menu-open').forEach((header) => header._bykiraSetMenuOpen?.(false));
    });

    document.addEventListener('pointerdown', (event) => {
      document.querySelectorAll('header.menu-open').forEach((header) => {
        if (!header.contains(event.target)) header._bykiraSetMenuOpen?.(false);
      });
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth >= 1200) {
        document.querySelectorAll('header.menu-open').forEach((header) => header._bykiraSetMenuOpen?.(false));
      }
    }, { passive: true });
  }
};

const initScrollReveals = () => {
  const selectors = [
    'main > section',
    'main article',
    '.home-service-grid > *',
    '.method-row',
    '.work-proof-item',
    '.process-grid > *',
    '.answer-list details',
    '.policy-section',
    '#site-footer .footer-directory'
  ];

  const candidates = [...new Set(document.querySelectorAll(selectors.join(',')))];
  if (reduceMotion || !('IntersectionObserver' in window)) {
    candidates.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const viewport = window.innerHeight || document.documentElement.clientHeight;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: .08, rootMargin: '0px 0px -5% 0px' });

  candidates.forEach((el, index) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < viewport * .88) {
      el.classList.add('is-visible');
      return;
    }
    el.setAttribute('data-bykira-reveal', '');
    el.style.setProperty('--bykira-delay', `${Math.min(index % 4, 3) * 55}ms`);
    observer.observe(el);
  });
};

const initBiscuits = () => {
  document.querySelectorAll('.cookie-settings').forEach((button) => {
    button.textContent = 'Privacy & Biscuits';
    if (button.tagName === 'BUTTON') {
      button.addEventListener('click', () => {
        window.location.href = '/privacy/#biscuits';
      });
    }
  });

  let seen = false;
  try {
    seen = localStorage.getItem('bykira-biscuit-note') === 'seen';
  } catch {
    seen = true;
  }

  if (seen || document.querySelector('.biscuit-note')) return;

  const note = document.createElement('aside');
  note.className = 'biscuit-note';
  note.setAttribute('aria-label', 'Biscuits and privacy');
  note.innerHTML = `
    <strong>Biscuits &amp; privacy.</strong>
    <p>Privacy stays simple here. No advertising trackers; just essential preferences and privacy-friendly analytics controls.</p>
    <div class="biscuit-note-actions">
      <a href="/privacy/#biscuits">Read about biscuits</a>
      <button type="button">Got it</button>
    </div>`;

  note.querySelector('button')?.addEventListener('click', () => {
    try {
      localStorage.setItem('bykira-biscuit-note', 'seen');
    } catch {}
    note.remove();
  });

  document.body.append(note);
};

const boot = () => {
  initLoader();
  initModernMobileMenu();
  initScrollReveals();
  initBiscuits();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}

const headerWatcher = new MutationObserver(() => queueMicrotask(initModernMobileMenu));
document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('header[data-nav-version="modern"]');
  if (header) headerWatcher.observe(header, { childList: true, subtree: true });
}, { once: true });
