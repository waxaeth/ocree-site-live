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

const contactForm = document.querySelector('[data-contact-form]');
const contactStatus = contactForm?.querySelector('.form-status');
const turnstileElement = contactForm?.querySelector('[data-turnstile-widget]');

function initialiseTurnstile() {
  const siteKey = contactForm?.dataset.turnstileSitekey;
  if (!turnstileElement || !siteKey || siteKey === 'REPLACE_WITH_TURNSTILE_SITE_KEY' || !window.turnstile || turnstileElement.dataset.rendered) return;
  window.turnstile.render(turnstileElement, {sitekey: siteKey, theme: 'light'});
  turnstileElement.dataset.rendered = 'true';
}

if (turnstileElement) {
  initialiseTurnstile();
  const turnstileTimer = window.setInterval(() => {
    initialiseTurnstile();
    if (turnstileElement.dataset.rendered) window.clearInterval(turnstileTimer);
  }, 250);
  window.setTimeout(() => window.clearInterval(turnstileTimer), 10000);
}

function setContactStatus(message, isError = false) {
  if (!contactStatus) return;
  contactStatus.textContent = message;
  contactStatus.dataset.error = String(isError);
}

contactForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const turnstileToken = window.turnstile?.getResponse?.();

  if (!turnstileToken) {
    setContactStatus('Please complete the security check.', true);
    return;
  }

  submitButton.disabled = true;
  setContactStatus('Sending...');
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({...Object.fromEntries(new FormData(contactForm)), turnstileToken})
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Unable to send your message.');
    contactForm.reset();
    window.turnstile?.reset?.();
    setContactStatus("Thanks. We'll be in touch soon.");
  } catch (error) {
    setContactStatus(error.message || 'Unable to send your message. Please email contact@ocreefg.com.', true);
  } finally {
    submitButton.disabled = false;
  }
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
