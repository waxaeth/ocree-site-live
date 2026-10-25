const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav-links');
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

function closeNavigation() {
  nav?.classList.remove('open');
  toggle?.setAttribute('aria-expanded', 'false');
  toggle?.setAttribute('aria-label', window.ocreeLanguage === 'fr' ? 'Ouvrir le menu' : 'Open menu');
}

toggle?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
});
document.querySelectorAll('.nav-links a').forEach((link) => link.addEventListener('click', closeNavigation));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && nav?.classList.contains('open')) {
    closeNavigation();
    toggle.focus();
  }
});
document.addEventListener('click', (event) => {
  if (!event.target.closest('.nav')) closeNavigation();
});
window.matchMedia('(min-width: 1051px)').addEventListener('change', (event) => {
  if (event.matches) closeNavigation();
});

// Content remains visible without JavaScript or with reduced motion enabled.
if ('IntersectionObserver' in window && !motionPreference.matches) {
  document.documentElement.classList.add('motion-ready');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
  motionPreference.addEventListener('change', (event) => {
    if (event.matches) {
      document.documentElement.classList.remove('motion-ready');
      observer.disconnect();
    }
  });
}

document.querySelector('[data-contact-form]')?.addEventListener('submit', (event) => {
  event.preventDefault();
  document.querySelector('.form-status').textContent = 'Thanks. This local prototype does not send form submissions yet.';
});
