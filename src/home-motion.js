const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const revealTargets = [
  document.querySelector('.atelier-hero'),
  document.querySelector('.home-services .section-topline'),
  document.querySelector('.home-services-intro'),
  ...document.querySelectorAll('.home-service-grid > article'),
  document.querySelector('.home-services-footer'),
  document.querySelector('.first-project-card'),
  document.querySelector('.home-review-showcase')
].filter(Boolean);

revealTargets.forEach((element, index) => {
  element.dataset.reveal = element.matches('.atelier-hero, .first-project-card, .home-review-showcase') ? 'scale' : 'rise';
  element.style.setProperty('--reveal-delay', `${Math.min(index * 45, 220)}ms`);
});

if (reduceMotion) {
  revealTargets.forEach((element) => element.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver((entries, io) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -8% 0px'
  });

  revealTargets.forEach((element) => observer.observe(element));
}
