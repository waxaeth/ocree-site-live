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
  document.querySelector('.form-status').textContent = "Thanks. We'll be in touch soon.";
});

const requestedRole = new URLSearchParams(window.location.search).get('role');
const roleSelect = document.querySelector('#role');
if (requestedRole && roleSelect) {
  const match = [...roleSelect.options].find((option) => option.value.toLowerCase() === requestedRole.toLowerCase());
  if (match) roleSelect.value = match.value;
}

const counters = document.querySelectorAll('[data-count-to]');
if (counters.length && 'IntersectionObserver' in window && !motionPreference.matches) {
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const element = entry.target;
      const target = Number(element.dataset.countTo);
      const decimals = (String(element.dataset.countTo).split('.')[1] || '').length;
      const prefix = element.dataset.countPrefix || '';      const suffix = element.dataset.countSuffix || '';
      const started = performance.now();
      const duration = 1000;

      const render = (now) => {
        const progress = Math.min((now - started) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = `${prefix}${(target * eased).toFixed(decimals)}${suffix}`;
        if (progress < 1) requestAnimationFrame(render);
      };

      requestAnimationFrame(render);
      counterObserver.unobserve(element);
    });
  }, { threshold: 0.45 });
  counters.forEach((counter) => counterObserver.observe(counter));
}
