import './desktop-header.css';

document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('header');
  const path = window.location.pathname;

  if (header) {
    const navigation = header.querySelector('nav');
    if (navigation) {
      const items = [
        ['/', '00', 'Home', path === '/' || path === '/index.html'],
        ['/work/', '01', 'Work', path.startsWith('/work')],
        ['/services/', '02', 'Services', path.startsWith('/services') || path.startsWith('/commission') || path.startsWith('/faq')],
        ['/about/', '03', 'About', path.startsWith('/about')],
        ['/enquiry/', '04', 'Enquire', path.startsWith('/enquiry')],
      ];

      navigation.innerHTML = items.map(([href, marker, label, active]) => (
        `<a href="${href}"${active ? ' class="active" aria-current="page"' : ''}>${label} <span>${marker}</span></a>`
      )).join('');
    }

    const activeSection = header.querySelector('.active-section');
    if (activeSection) activeSection.remove();

    const cta = header.querySelector('.header-cta');
    if (cta) cta.innerHTML = 'Start a project <span>↗</span>';
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
            <div><span class="footer-label">01 / Explore</span><a href="/work/">Work</a><a href="/services/">Services</a><a href="/about/">About</a></div>
            <div><span class="footer-label">02 / Start</span><a href="/enquiry/">Project enquiry</a><a href="/website-review/">Free website review</a></div>
            <div><span class="footer-label">03 / Details</span><a href="/privacy/">Privacy &amp; biscuits</a><a href="/accessibility/">Accessibility</a><a href="/terms/">Terms</a></div>
          </div>
        </div>
        <div class="footer-bottom"><span><i aria-hidden="true"></i> STUDIO ONLINE</span><span>© 2026 BY KIRA</span><a href="#main-content">BACK TO TOP ↑</a></div>
      </div>`;
  });

  document.querySelectorAll('.cookie-settings').forEach((button) => {
    button.textContent = 'Biscuit settings';
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