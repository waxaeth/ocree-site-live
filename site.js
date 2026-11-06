const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav-links');
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

if (nav && !nav.querySelector('.nav-home-link')) {
  const homeLink = document.createElement('a');
  homeLink.className = 'nav-home-link';
  homeLink.href = 'index.html';
  homeLink.textContent = 'Home';
  nav.insertBefore(homeLink, nav.firstChild);
}

const audienceLinks = {
  '#owners': 'asset-owners.html',
  '#dealers': 'dealers-advisors.html',
  '#investors': 'investors.html'
};
document.querySelectorAll('a[href^="solutions.html#"]').forEach((link) => {
  const target = audienceLinks[new URL(link.href).hash];
  if (target) link.href = target;
});

const footerNav = document.querySelector('.footer-col');
if (footerNav && !footerNav.querySelector('.footer-home-link')) {
  const footerHomeLink = document.createElement('a');
  footerHomeLink.className = 'footer-home-link';
  footerHomeLink.href = 'index.html';
  footerHomeLink.textContent = 'Home';
  footerNav.insertBefore(footerHomeLink, footerNav.querySelector('a'));
}

document.querySelectorAll('p').forEach((paragraph) => {
  if (paragraph.textContent.trim() === 'A residential tower in Uptown Waterloo.') {
    paragraph.textContent = 'A residential tower in Uptown Waterloo, by Momentum Developments.';
  }
});

const cookieStorageKey = 'ocree-cookie-consent';
const cookieBanner = document.createElement('section');
cookieBanner.className = 'cookie-banner';
cookieBanner.setAttribute('aria-label', 'Cookie consent');
cookieBanner.innerHTML = '<div class="cookie-banner-copy"><p>Select “Accept all” to agree to our use of cookies and similar technologies to enhance your browsing experience, security, analytics and customization. Select “Manage cookies” to make more choices or opt out.</p></div><div class="cookie-banner-actions"><button class="cookie-manage" type="button">Manage cookies</button><button class="cookie-decline" type="button">Decline all</button><button class="cookie-accept" type="button">Accept all</button></div>';
document.body.append(cookieBanner);

const cookieDialog = document.createElement('dialog');
cookieDialog.className = 'cookie-dialog';
cookieDialog.setAttribute('aria-labelledby', 'cookie-dialog-title');
cookieDialog.innerHTML = '<div class="cookie-dialog-inner"><div class="cookie-dialog-head"><div><p class="eyebrow">Privacy choices</p><h2 id="cookie-dialog-title">Manage cookies</h2></div><button class="cookie-dialog-close" type="button" aria-label="Close cookie preferences">×</button></div><p>Choose which optional cookies and similar technologies you allow. Essential cookies remain active because they support core site functions.</p><label class="cookie-option"><span><strong>Essential</strong><small>Required for basic navigation, security and preferences.</small></span><input type="checkbox" checked disabled></label><label class="cookie-option"><span><strong>Analytics</strong><small>Helps us understand site usage and improve the experience.</small></span><input class="cookie-analytics" type="checkbox"></label><label class="cookie-option"><span><strong>Customization</strong><small>Remembers optional preferences that personalize your visit.</small></span><input class="cookie-customization" type="checkbox"></label><div class="cookie-dialog-actions"><button class="button light cookie-dialog-decline" type="button">Decline all</button><button class="button cookie-dialog-save" type="button">Save choices</button></div></div>';
document.body.append(cookieDialog);

const savedCookieConsent = (() => { try { return JSON.parse(localStorage.getItem(cookieStorageKey) || 'null'); } catch { return null; } })();
const analyticsChoice = cookieDialog.querySelector('.cookie-analytics');
const customizationChoice = cookieDialog.querySelector('.cookie-customization');
function saveCookieConsent(consent) {
  try { localStorage.setItem(cookieStorageKey, JSON.stringify({ ...consent, savedAt: new Date().toISOString() })); } catch {}
  cookieBanner.hidden = true;
  cookieDialog.close();
}
function showCookieDialog() {
  analyticsChoice.checked = Boolean(savedCookieConsent?.analytics);
  customizationChoice.checked = Boolean(savedCookieConsent?.customization);
  cookieDialog.showModal();
}
cookieBanner.querySelector('.cookie-accept').addEventListener('click', () => saveCookieConsent({essential:true, analytics:true, customization:true}));
cookieBanner.querySelector('.cookie-decline').addEventListener('click', () => saveCookieConsent({essential:true, analytics:false, customization:false}));
cookieBanner.querySelector('.cookie-manage').addEventListener('click', showCookieDialog);
cookieDialog.querySelector('.cookie-dialog-close').addEventListener('click', () => cookieDialog.close());
cookieDialog.querySelector('.cookie-dialog-decline').addEventListener('click', () => saveCookieConsent({essential:true, analytics:false, customization:false}));
cookieDialog.querySelector('.cookie-dialog-save').addEventListener('click', () => saveCookieConsent({essential:true, analytics:analyticsChoice.checked, customization:customizationChoice.checked}));
if (savedCookieConsent) cookieBanner.hidden = true;

const teamCards = document.querySelectorAll('[data-team-card]');
if (teamCards.length) {
  const originalBioHtml = new Map([...teamCards].map((card) => [card, card.closest('.team-card-wrap').querySelector('.team-full-bio').innerHTML]));
  const originalRoles = new Map([...teamCards].map((card) => [card, card.querySelector('.team-role').textContent]));
  const teamDialog = document.createElement('dialog');
  teamDialog.className = 'team-dialog';
  teamDialog.setAttribute('aria-labelledby', 'team-dialog-name');
  teamDialog.innerHTML = '<div class="team-dialog-inner"><button class="team-dialog-close" type="button" aria-label="Close biography">×</button><div class="team-dialog-top"><div class="team-dialog-image"></div><div><p class="eyebrow">Ocree leadership</p><h2 id="team-dialog-name"></h2><p class="team-dialog-role"></p></div></div><div class="team-dialog-copy"></div><div class="team-dialog-footer"><a class="team-dialog-link" href="#" target="_blank" rel="noopener noreferrer">View LinkedIn profile →</a><button class="button" type="button">Close</button></div></div>';
  document.body.append(teamDialog);
  const closeTeamDialog = () => teamDialog.close();
  teamDialog.querySelector('.team-dialog-close').addEventListener('click', closeTeamDialog);
  teamDialog.querySelector('.team-dialog-footer button').addEventListener('click', closeTeamDialog);
  const linkedInProfiles = {
    'Ted L. Davis, CCIM, SIOR, CIM': 'https://www.linkedin.com/in/ted-davis-b950bb26/',
    'Ryan Wilkinson': 'https://www.linkedin.com/in/ryan-parkinson-91a70619/',
    'Anne Ramsay': 'https://www.linkedin.com/in/aframsay/'
  };
  teamCards.forEach((card) => card.addEventListener('click', () => {
    teamDialog.querySelector('.team-dialog-image').innerHTML = card.querySelector('.team-card-image').innerHTML;
    teamDialog.querySelector('#team-dialog-name').textContent = card.querySelector('.team-card-name').textContent;
    teamDialog.querySelector('.team-dialog-role').textContent = originalRoles.get(card);
    teamDialog.querySelector('.team-dialog-copy').innerHTML = originalBioHtml.get(card);
    teamDialog.querySelector('.team-dialog-link').href = linkedInProfiles[card.querySelector('.team-card-name').textContent.trim()] || '#';
    window.ocreeRefreshTranslations?.();
    teamDialog.showModal();
  }));
}
const solutionToggle = document.querySelector('.solutions-toggle');
const solutionMenu = document.querySelector('.solutions-menu');

function closeSolutions() {
  if (!solutionToggle || !solutionMenu) return;
  solutionMenu.hidden = true;
  solutionToggle.setAttribute('aria-expanded', 'false');
  solutionToggle.parentElement.classList.remove('open');
}

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
solutionToggle?.addEventListener('click', (event) => {
  event.stopPropagation();
  const open = solutionMenu.hidden;
  solutionMenu.hidden = !open;
  solutionToggle.setAttribute('aria-expanded', String(open));
  solutionToggle.parentElement.classList.toggle('open', open);
});
document.querySelectorAll('.solutions-menu a').forEach((link) => link.addEventListener('click', () => {
  closeSolutions();
  closeNavigation();
}));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (solutionMenu && !solutionMenu.hidden) {
      closeSolutions();
      solutionToggle.focus();
    } else if (nav?.classList.contains('open')) {
      closeNavigation();
      toggle.focus();
    }
  }
});
document.addEventListener('click', (event) => {
  if (!event.target.closest('.nav')) {
    closeNavigation();
    closeSolutions();
  }
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
  contactStatus.textContent = window.ocreeTranslate?.(message) || message;
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
