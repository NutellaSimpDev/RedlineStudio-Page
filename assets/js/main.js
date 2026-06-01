function revealFallback() {
  window.clearTimeout(window.__redlineBootTimer);
  document.documentElement.classList.add('boot-timeout');

  const boot = document.getElementById('boot');
  const nav = document.getElementById('nav');

  if (boot) boot.style.display = 'none';
  if (nav) nav.style.opacity = '1';

  document.querySelectorAll('.ui-reveal, .ui-card').forEach((element) => {
    element.style.opacity = '1';
    element.style.transform = 'none';
  });
}

let menuInitialized = false;

function clearBootTimeout() {
  window.clearTimeout(window.__redlineBootTimer);
  document.documentElement.classList.remove('boot-timeout');
}

function trackEvent(eventName, params = {}) {
  if (typeof window.gtag !== 'function') return;

  window.gtag('event', eventName, {
    page_path: window.location.pathname,
    ...params
  });
}

function initAnalyticsEvents() {
  document.querySelectorAll('a[href="#contacto"], a[href="index.html#contacto"]').forEach((link) => {
    link.addEventListener('click', () => {
      trackEvent('cta_contact_click', {
        cta_text: link.textContent.trim(),
        link_url: link.getAttribute('href')
      });
    });
  });

  document.querySelectorAll('a[href^="services.html#"]').forEach((link) => {
    link.addEventListener('click', () => {
      trackEvent('service_detail_click', {
        cta_text: link.textContent.trim(),
        service_name: link.getAttribute('href').split('#')[1] || 'unknown',
        link_url: link.getAttribute('href')
      });
    });
  });

  document.querySelectorAll('a[href^="mailto:"]').forEach((link) => {
    link.addEventListener('click', () => {
      trackEvent('mailto_click', { link_url: link.getAttribute('href') });
    });
  });

  document.querySelectorAll('.footer-social a').forEach((link) => {
    link.addEventListener('click', () => {
      trackEvent('social_click', {
        social_network: link.getAttribute('aria-label') || 'unknown',
        link_url: link.href
      });
    });
  });

  document.querySelectorAll('.nav-links a, .m-link').forEach((link) => {
    link.addEventListener('click', () => {
      trackEvent('nav_click', {
        cta_text: link.textContent.trim(),
        link_url: link.getAttribute('href')
      });
    });
  });

  document.querySelectorAll('form[action*="web3forms"]').forEach((form) => {
    let formStarted = false;
    form.addEventListener('focusin', () => {
      if (formStarted) return;
      formStarted = true;
      trackEvent('form_start', {
        form_name: form.dataset.formName || 'contacto_redline'
      });
    });

    form.addEventListener('submit', (event) => handleLeadSubmit(event, form));
  });
}

function setFormMessage(form, message, state) {
  const note = form.querySelector('.form-note');
  if (!note) return;

  note.textContent = message || note.dataset.defaultMessage || '';
  note.classList.remove('is-success', 'is-error');
  if (state) note.classList.add(`is-${state}`);
}

function setFormLoading(form, isLoading) {
  const button = form.querySelector('button[type="submit"]');
  if (!button) return;

  if (!button.dataset.defaultText) button.dataset.defaultText = button.textContent;
  button.disabled = isLoading;
  button.textContent = isLoading ? 'Enviando...' : button.dataset.defaultText;
}

async function handleLeadSubmit(event, form) {
  event.preventDefault();

  if (!form.reportValidity()) return;

  const formName = form.dataset.formName || 'contacto_redline';
  trackEvent('form_submit_attempt', { form_name: formName });
  setFormLoading(form, true);
  setFormMessage(form, 'Enviando evaluación...', null);

  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    });

    if (!response.ok) throw new Error(`Web3Forms responded with ${response.status}`);

    trackEvent('generate_lead', { form_name: formName });
    form.reset();
    setFormMessage(form, 'Solicitud enviada. Te responderemos en menos de 24 horas hábiles.', 'success');
  } catch (error) {
    console.warn('Web3Forms AJAX failed, falling back to native submit.', error);
    trackEvent('form_submit_fallback', { form_name: formName });
    HTMLFormElement.prototype.submit.call(form);
    return;
  } finally {
    setFormLoading(form, false);
  }
}

function initMenu() {
  if (menuInitialized) return;

  const menuToggle = document.querySelector('.menu-toggle');
  const closeLinks = document.querySelectorAll('.toggle-close');
  const mobileMenu = document.querySelector('.mobile-menu-overlay');

  if (!menuToggle || !mobileMenu) return;

  function setMenuState(isOpen) {
    menuToggle.classList.toggle('active', isOpen);
    mobileMenu.classList.toggle('is-open', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  }

  menuToggle.addEventListener('click', () => {
    setMenuState(!mobileMenu.classList.contains('is-open'));
  });

  closeLinks.forEach((link) => link.addEventListener('click', () => setMenuState(false)));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenuState(false);
  });

  menuInitialized = true;
}

function initInterface() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reducedMotion) {
    revealFallback();
    initMenu();
    return;
  }

  gsap.to('#nav', { opacity: 1, duration: 1, ease: 'power2.out' });
  gsap.to('.ui-reveal', { opacity: 1, y: 0, duration: 1.2, stagger: 0.15, ease: 'power3.out' });

  const cardTrigger = document.querySelector('.service-grid, .bento-container');
  if (cardTrigger) {
    gsap.to('.ui-card', {
      opacity: 1,
      y: 0,
      duration: 1,
      stagger: 0.15,
      ease: 'power3.out',
      scrollTrigger: { trigger: cardTrigger, start: 'top 85%' }
    });
  }

  initMenu();

  const masterRhythm = gsap.timeline({ repeat: -1 });
  masterRhythm
    .to('.led-pulse', { opacity: 1, duration: 0.1 })
    .to('.led-pulse', { opacity: 0.1, duration: 0.4, ease: 'power2.out' })
    .to('.led-sync', { opacity: 0.8, duration: 0.05 }, '-=0.2')
    .to('.led-sync', { opacity: 0.05, duration: 0.2 })
    .to('.led-strobe', { opacity: 1, duration: 0.05 })
    .to('.led-strobe', { opacity: 0.05, duration: 0.05 })
    .to('.led-strobe', { opacity: 1, duration: 0.05 })
    .to('.led-strobe', { opacity: 0.1, duration: 0.6, ease: 'power3.out' })
    .to('.led-fast', { opacity: 0.6, duration: 0.1 }, '-=0.5')
    .to('.led-fast', { opacity: 0.05, duration: 0.3 });

  const redlineBeat = gsap.timeline({ repeat: -1 });
  redlineBeat
    .to('.led-redline', { opacity: 1, duration: 0.05, ease: 'none' })
    .to('.led-redline', { opacity: 0.1, duration: 0.1 })
    .to('.led-redline', { opacity: 1, duration: 0.05, ease: 'none' })
    .to('.led-redline', { opacity: 0.15, duration: 1, ease: 'power3.out' });

  gsap.to('.led-strobe-red', { opacity: 1, duration: 0.05, repeat: -1, repeatDelay: 1.5, yoyo: true });

  document.addEventListener('mousemove', (event) => {
    const xPos = (event.clientX / window.innerWidth - 0.5) * 20;
    const yPos = (event.clientY / window.innerHeight - 0.5) * 20;
    gsap.to('.glyph-svg', { x: xPos, y: yPos, duration: 0.5, ease: 'power2.out' });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initAnalyticsEvents();
  initMenu();

  window.setTimeout(() => {
    if (document.getElementById('boot')?.style.display !== 'none') revealFallback();
  }, 2500);

  if (!window.gsap || !window.ScrollTrigger) {
    revealFallback();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  gsap.ticker.lagSmoothing(0);

  const boot = gsap.timeline({
    onComplete: () => {
      const bootElement = document.getElementById('boot');
      if (bootElement) bootElement.style.display = 'none';
      clearBootTimeout();
      initInterface();
    }
  });

  boot
    .to('#boot-line', { width: '200px', duration: 0.6, ease: 'power4.inOut' })
    .to('#boot-line', { height: '0px', opacity: 0, duration: 0.3, delay: 0.2 })
    .to('#boot', { opacity: 0, duration: 0.5, ease: 'power2.out' }, '-=0.2');
});
