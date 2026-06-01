function revealFallback() {
  window.clearTimeout(window.__redlineBootTimer);
  document.documentElement.classList.add('boot-timeout');

  const boot = document.getElementById('boot');
  const nav = document.getElementById('nav');

  if (boot) boot.style.display = 'none';
  if (nav) nav.style.opacity = '1';

  document.querySelectorAll('.ui-reveal, .ui-card, .hero-visual').forEach((element) => {
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

function countMockMetric(element, target, duration = 1200, decimals = 0) {
  if (!element) return;

  let current = 0;
  const step = target / (duration / 16);
  const timer = window.setInterval(() => {
    current = Math.min(current + step, target);
    element.textContent = decimals ? current.toFixed(decimals) : Math.round(current);
    if (current >= target) window.clearInterval(timer);
  }, 16);
}

function initBusinessMockup() {
  const mockup = document.getElementById('hero-mockup');
  if (!mockup || mockup.dataset.loaded === 'true') return;

  mockup.dataset.loaded = 'true';

  ['bw-mc1', 'bw-mc2', 'bw-mc3'].forEach((id, index) => {
    window.setTimeout(() => document.getElementById(id)?.classList.add('bw-loaded'), index * 180);
  });

  window.setTimeout(() => countMockMetric(document.getElementById('bw-rev'), 4.2, 1200, 1), 260);
  window.setTimeout(() => countMockMetric(document.getElementById('bw-leads'), 247, 1400), 430);
  window.setTimeout(() => countMockMetric(document.getElementById('bw-rate'), 38, 1100), 620);

  [
    ['bw-b1', 18],
    ['bw-b2', 26],
    ['bw-b3', 34],
    ['bw-b4', 42],
    ['bw-b5', 51],
    ['bw-b6', 56]
  ].forEach(([id, height], index) => {
    window.setTimeout(() => {
      const bar = document.getElementById(id);
      if (!bar) return;
      bar.style.transition = 'height 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)';
      bar.style.height = `${height}px`;
    }, 220 + index * 110);
  });

  [
    ['bw-f1', 100],
    ['bw-f2', 42],
    ['bw-f3', 21],
    ['bw-f4', 9]
  ].forEach(([id, width], index) => {
    window.setTimeout(() => {
      const fill = document.getElementById(id);
      if (fill) fill.style.width = `${width}%`;
    }, 620 + index * 170);
  });

  let visitors = 4;
  window.setInterval(() => {
    const node = document.getElementById('bw-visitors');
    if (!node) return;
    visitors = Math.max(1, Math.min(12, visitors + Math.round((Math.random() - 0.45) * 3)));
    node.textContent = visitors;
  }, 2800);

  let seconds = 12;
  window.setInterval(() => {
    const node = document.getElementById('bw-timer');
    if (!node) return;
    seconds = seconds <= 0 ? 30 : seconds - 1;
    node.textContent = `${seconds}s`;
  }, 1000);

  const cursor = document.getElementById('bw-cursor');
  const body = mockup.querySelector('.bw-body');
  if (!cursor || !body) return;

  body.addEventListener('mouseenter', () => {
    cursor.style.display = 'block';
  });
  body.addEventListener('mouseleave', () => {
    cursor.style.display = 'none';
  });
  body.addEventListener('mousemove', (event) => {
    const rect = body.getBoundingClientRect();
    cursor.style.left = `${event.clientX - rect.left - 3}px`;
    cursor.style.top = `${event.clientY - rect.top - 3}px`;
  });
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

  const heroVisual = document.querySelector('.hero-visual');
  if (heroVisual) {
    initBusinessMockup();

    gsap.fromTo(
      heroVisual,
      { opacity: 0, x: 96, y: 18, rotate: 2 },
      { opacity: 1, x: 0, y: 0, rotate: 0, duration: 1.05, delay: 0.25, ease: 'power3.out' }
    );

    gsap.to(heroVisual, {
      x: 360,
      opacity: 0,
      scale: 0.94,
      rotate: 5,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom 35%',
        scrub: 0.45
      }
    });
  }

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
  initBusinessMockup();

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
