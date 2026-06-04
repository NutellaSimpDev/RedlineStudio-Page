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
const gtmId = 'GTM-5SXFJLSV';

function clearBootTimeout() {
  window.clearTimeout(window.__redlineBootTimer);
  document.documentElement.classList.remove('boot-timeout');
}

function trackEvent(eventName, params = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    page_path: window.location.pathname,
    ...params
  });
}

function loadAnalytics() {
  if (window.__redlineAnalyticsLoaded) return;
  window.__redlineAnalyticsLoaded = true;

  window.dataLayer = window.dataLayer || [];

  // Google Tag Manager
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer',gtmId);
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
  document.querySelectorAll('a[href="#contacto"], a[href="#contact"], a[href="#kontakt"]').forEach((link) => {
    link.addEventListener('click', () => {
      trackEvent('cta_contact_click', {
        cta_text: link.textContent.trim(),
        link_url: link.getAttribute('href')
      });
    });
  });

  document.querySelectorAll('a[href*="/servicios#"], a[href*="/services#"], a[href*="/leistungen#"]').forEach((link) => {
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
      if (href === '#contacto' || href === '#contact' || href === '#kontakt' || href.startsWith('#')) return;

      trackEvent('nav_click', {
        cta_text: link.textContent.trim(),
        link_url: href
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

  if (form.querySelector('[name="botcheck"]')?.checked) return;
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
    
    let redirectUrl = '/gracias';
    const currentLang = document.documentElement.lang || 'es';
    if (currentLang === 'en') {
      redirectUrl = '/en/thanks';
    } else if (currentLang === 'de') {
      redirectUrl = '/de/danke';
    }

    let successMsg = 'Solicitud enviada. Redirigiendo...';
    if (currentLang === 'en') {
      successMsg = 'Request sent. Redirecting...';
    } else if (currentLang === 'de') {
      successMsg = 'Anfrage gesendet. Weiterleitung...';
    }
    setFormMessage(form, successMsg, 'success');

    window.setTimeout(() => {
      window.location.href = redirectUrl;
    }, 400);
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

  let startTime = null;

  function update(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const current = progress * target;

    element.textContent = decimals ? current.toFixed(decimals) : Math.round(current);

    if (progress < 1) {
      window.requestAnimationFrame(update);
    }
  }

  window.requestAnimationFrame(update);
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

  const bars = [
    ['bw-b1', 18],
    ['bw-b2', 26],
    ['bw-b3', 34],
    ['bw-b4', 42],
    ['bw-b5', 51],
    ['bw-b6', 56]
  ];

  // Initialize bars to scaleY(0) and set target height once to avoid layout thrashing in transitions
  bars.forEach(([id, height]) => {
    const bar = document.getElementById(id);
    if (bar) {
      bar.style.height = `${height}px`;
      bar.style.transform = 'scaleY(0)';
      bar.style.transformOrigin = 'bottom';
    }
  });

  bars.forEach(([id, height], index) => {
    window.setTimeout(() => {
      const bar = document.getElementById(id);
      if (!bar) return;
      bar.style.transition = 'transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)';
      bar.style.transform = 'scaleY(1)';
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
      if (fill) fill.style.transform = `scaleX(${width / 100})`;
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

  let rect = null;
  let mouseX = 0;
  let mouseY = 0;
  let ticking = false;

  const updateRect = () => {
    rect = body.getBoundingClientRect();
  };

  body.addEventListener('mouseenter', () => {
    updateRect();
    cursor.style.display = 'block';
  });

  body.addEventListener('mouseleave', () => {
    cursor.style.display = 'none';
  });

  body.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;

    if (!ticking) {
      window.requestAnimationFrame(() => {
        if (rect) {
          const x = mouseX - rect.left - 3;
          const y = mouseY - rect.top - 3;
          cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', updateRect, { passive: true });
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

  const glyph = document.querySelector('.glyph-svg');
  let winWidth = window.innerWidth;
  let winHeight = window.innerHeight;
  let docMouseX = 0;
  let docMouseY = 0;
  let docTicking = false;

  window.addEventListener('resize', () => {
    winWidth = window.innerWidth;
    winHeight = window.innerHeight;
  }, { passive: true });

  document.addEventListener('mousemove', (event) => {
    docMouseX = event.clientX;
    docMouseY = event.clientY;

    if (!docTicking) {
      window.requestAnimationFrame(() => {
        if (glyph) {
          const xPos = (docMouseX / winWidth - 0.5) * 20;
          const yPos = (docMouseY / winHeight - 0.5) * 20;
          glyph.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
        }
        docTicking = false;
      });
      docTicking = true;
    }
  }, { passive: true });
}

function initLangDropdown() {
  const dropdown = document.querySelector('.lang-dropdown');
  if (!dropdown) return;

  const trigger = dropdown.querySelector('.lang-dropdown-trigger');
  if (!trigger) return;

  trigger.addEventListener('click', (event) => {
    event.stopPropagation();
    const isActive = dropdown.classList.toggle('is-active');
    trigger.setAttribute('aria-expanded', isActive ? 'true' : 'false');
  });

  // Close when clicking outside
  document.addEventListener('click', (event) => {
    if (!dropdown.contains(event.target)) {
      dropdown.classList.remove('is-active');
      trigger.setAttribute('aria-expanded', 'false');
    }
  });

  // Close when hitting Escape key
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      dropdown.classList.remove('is-active');
      trigger.setAttribute('aria-expanded', 'false');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initCookieConsent();
  initAnalyticsEvents();
  initMenu();
  initLangDropdown();
  initBusinessMockup();

  const bootLine = document.getElementById('boot-line');
  const bootElement = document.getElementById('boot');

  if (bootLine && bootElement) {
    // Force line to scale fully
    bootLine.style.animation = 'none';
    void bootLine.offsetWidth;
    bootLine.style.transition = 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
    bootLine.style.transform = 'translate(-50%, -50%) scaleX(1)';

    window.setTimeout(() => {
      document.documentElement.classList.add('is-loaded');
      clearBootTimeout();
      initInterface();

      window.setTimeout(() => {
        bootElement.style.display = 'none';
      }, 600);
    }, 300);
  } else {
    document.documentElement.classList.add('is-loaded');
    clearBootTimeout();
    initInterface();
  }
});
