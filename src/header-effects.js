document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('header');

  document.addEventListener('mousemove', (e) => {
    if (!header) return;

    const rect = header.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    header.style.setProperty('--mouse-x', `${x}px`);
    header.style.setProperty('--mouse-y', `${y}px`);
  });

  // Handle scroll effects
  const handleScroll = () => {
    if (!header) return;
    
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Initial check
});