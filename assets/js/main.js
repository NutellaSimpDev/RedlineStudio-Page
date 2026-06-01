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
const analyticsConsentKey = 'redline_analytics_consent';
const gaMeasurementId = 'G-EB9CT1636Z';

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

function loadAnalytics() {
  if (window.__redlineAnalyticsLoaded) return;

  window.__redlineAnalyticsLoaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`;
  document.head.appendChild(script);

  window.gtag('js', new Date());
  window.gtag('config', gaMeasurementId);
}

function getStoredAnalyticsConsent() {
  try {
    return window.localStorage.getItem(analyticsConsentKey);
  } catch (error) {
    return null;
  }
}

function setStoredAnalyticsConsent(value) {
  try {
    window.localStorage.setItem(analyticsConsentKey, value);
  } catch (error) {
    return;
  }
}

function initCookieConsent() {
  const consent = getStoredAnalyticsConsent();
  const banner = document.getElementById('cookie-consent');

  if (consent === 'accepted') {
    loadAnalytics();
    return;
  }

  if (!banner || consent === 'rejected') return;

  banner.hidden = false;
  banner.querySelector('[data-cookie-accept]')?.addEventListener('click', () => {
    setStoredAnalyticsConsent('accepted');
    loadAnalytics();
    banner.hidden = true;
  });

  banner.querySelector('[data-cookie-reject]')?.addEventListener('click', () => {
    setStoredAnalyticsConsent('rejected');
    banner.hidden = true;
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
      const href = link.getAttribute('href');
      if (href === '#contacto' || href === 'index.html#contacto') return;

      trackEvent('nav_click', {
        cta_text: link.textContent.trim(),
        link_url: href
      });
    });
  });

  document.querySelectorAll('form[action*="web3forms"]').forEach((form) => {
    let formStarted = false;
    form.querySelector('[data-contact-field]')?.addEventListener('input', (event) => {
      event.currentTarget.setCustomValidity('');
    });

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

function isValidContactValue(value) {
  const trimmed = value.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const phonePattern = /^[+()\d\s.-]+$/;
  const digitCount = trimmed.replace(/\D/g, '').length;
  return emailPattern.test(trimmed) || (phonePattern.test(trimmed) && digitCount >= 7);
}

function validateLeadContact(form) {
  const contactField = form.querySelector('[data-contact-field]');
  if (!contactField) return true;

  contactField.setCustomValidity('');
  if (isValidContactValue(contactField.value)) return true;

  contactField.setCustomValidity('Ingresa un correo válido o un teléfono con al menos 7 dígitos.');
  contactField.reportValidity();
  return false;
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

  if (form.querySelector('[name="botcheck"]')?.checked) return;
  if (!validateLeadContact(form)) return;
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
  let lastFocusedElement = null;

  if (!menuToggle || !mobileMenu) return;

  function setMenuState(isOpen, restoreFocus = true) {
    if (isOpen) lastFocusedElement = document.activeElement;

    menuToggle.classList.toggle('active', isOpen);
    mobileMenu.classList.toggle('is-open', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');

    const firstLink = mobileMenu.querySelector('a');
    if (isOpen && firstLink) firstLink.focus();
    if (!isOpen && restoreFocus && lastFocusedElement === menuToggle) menuToggle.focus();
  }

  menuToggle.addEventListener('click', () => {
    setMenuState(!mobileMenu.classList.contains('is-open'));
  });

  closeLinks.forEach((link) => link.addEventListener('click', () => setMenuState(false, false)));
  document.addEventListener('keydown', (event) => {
    if (!mobileMenu.classList.contains('is-open')) return;

    if (event.key === 'Escape') {
      setMenuState(false);
      return;
    }

    if (event.key !== 'Tab') return;

    const focusableElements = Array.from(mobileMenu.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])'));
    if (!focusableElements.length) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
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

  document.getElementById('nav')?.classList.add('is-visible');
  document.querySelectorAll('.ui-reveal').forEach((element, index) => {
    element.style.transitionDelay = `${index * 90}ms`;
    element.classList.add('is-visible');
  });

  const heroVisual = document.querySelector('.hero-visual');
  if (heroVisual) {
    initBusinessMockup();
  }

  const cards = Array.from(document.querySelectorAll('.ui-card'));
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

    cards.forEach((card, index) => {
      card.style.transitionDelay = `${Math.min(index, 4) * 80}ms`;
      observer.observe(card);
    });
  } else {
    cards.forEach((card) => card.classList.add('is-visible'));
  }

  initMenu();

  let pointerFrame = null;
  document.addEventListener('mousemove', (event) => {
    const xPos = (event.clientX / window.innerWidth - 0.5) * 20;
    const yPos = (event.clientY / window.innerHeight - 0.5) * 20;

    if (pointerFrame) window.cancelAnimationFrame(pointerFrame);
    pointerFrame = window.requestAnimationFrame(() => {
      const glyph = document.querySelector('.glyph-svg');
      if (glyph) glyph.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initCookieConsent();
  initAnalyticsEvents();
  initMenu();
  initBusinessMockup();

  window.setTimeout(() => {
    const bootElement = document.getElementById('boot');
    if (!bootElement) {
      initInterface();
      return;
    }

    bootElement.classList.add('is-hidden');
    window.setTimeout(() => {
      bootElement.style.display = 'none';
      clearBootTimeout();
      initInterface();
    }, 420);
  }, 900);
});
