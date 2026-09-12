import './desktop-header.css';

document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('header');

  if (header) {
    const navigation = header.querySelector('nav');
    if (navigation && !navigation.querySelector('a[data-home-link]')) {
      const homeLink = document.createElement('a');
      homeLink.href = '/';
      homeLink.dataset.homeLink = 'true';
      homeLink.innerHTML = 'Home <span>00</span>';
      if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        homeLink.classList.add('active');
        homeLink.setAttribute('aria-current', 'page');
      }
      navigation.prepend(homeLink);
    }
  }

  document.addEventListener('mousemove', (e) => {
    if (!header) return;

    const rect = header.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    header.style.setProperty('--mouse-x', `${x}px`);
    header.style.setProperty('--mouse-y', `${y}px`);
  });

  const handleScroll = () => {
    if (!header) return;

    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll);
  handleScroll();
});