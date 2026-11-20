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

  document.querySelectorAll('form[action*="send-lead"]').forEach((form) => {
    const tsField = form.querySelector('input[name="ts"]');
    if (tsField) tsField.value = String(Date.now());

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

    if (!response.ok) throw new Error(`Lead endpoint responded with ${response.status}`);

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
    console.warn('Lead form AJAX submit failed, falling back to native submit.', error);
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

  // Each page sets its own figures with data-target / data-h / data-w; the
  // numbers here are only the fallback for pages that don't.
  const target = (id, fallback) => {
    const value = Number(document.getElementById(id)?.dataset.target);
    return Number.isFinite(value) && value > 0 ? value : fallback;
  };
  const decimalsOf = (value) => (Number.isInteger(value) ? 0 : 1);
  const rev = target('bw-rev', 4.2);
  const leads = target('bw-leads', 247);
  const rate = target('bw-rate', 38);

  window.setTimeout(() => countMockMetric(document.getElementById('bw-rev'), rev, 1200, decimalsOf(rev)), 260);
  window.setTimeout(() => countMockMetric(document.getElementById('bw-leads'), leads, 1400, decimalsOf(leads)), 430);
  window.setTimeout(() => countMockMetric(document.getElementById('bw-rate'), rate, 1100, decimalsOf(rate)), 620);

  const bars = [
    ['bw-b1', 18],
    ['bw-b2', 26],
    ['bw-b3', 34],
    ['bw-b4', 42],
    ['bw-b5', 51],
    ['bw-b6', 56]
  ].map(([id, fallback]) => [id, Number(document.getElementById(id)?.dataset.h) || fallback]);

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
  ].forEach(([id, fallback], index) => {
    window.setTimeout(() => {
      const fill = document.getElementById(id);
      const width = Number(fill?.dataset.w) || fallback;
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

// --- Motion (motion.dev) enhancements ---------------------------------
// Loaded dynamically from CDN so the site works fully without it (offline,
// blocked CDN, prefers-reduced-motion): everything above this line already
// gives a complete experience on its own.

function initScrollProgress(animate, scroll) {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  scroll(animate(bar, { scaleX: [0, 1] }, { ease: 'linear' }));
}

function initMagneticButtons(animate) {
  document.querySelectorAll('.action-trigger').forEach((button) => {
    button.addEventListener('mousemove', (event) => {
      const rect = button.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * 0.35;
      const y = (event.clientY - rect.top - rect.height / 2) * 0.35;
      animate(button, { x, y }, { type: 'spring', stiffness: 300, damping: 22 });
    });

    button.addEventListener('mouseleave', () => {
      animate(button, { x: 0, y: 0 }, { type: 'spring', stiffness: 300, damping: 18 });
    });
  });
}

function initCardTilt(animate) {
  document.querySelectorAll('.bento-container > .glass-panel, .service-grid > .glass-panel-large').forEach((card) => {
    card.addEventListener('mousemove', (event) => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      animate(card, { rotateX: py * -6, rotateY: px * 6, scale: 1.015 }, { type: 'spring', stiffness: 220, damping: 24 });
    });

    card.addEventListener('mouseleave', () => {
      animate(card, { rotateX: 0, rotateY: 0, scale: 1 }, { type: 'spring', stiffness: 220, damping: 20 });
    });
  });
}

function initCursorGlow(animate) {
  const glow = document.getElementById('cursor-glow');
  if (!glow) return;

  glow.classList.add('is-active');
  window.addEventListener('mousemove', (event) => {
    animate(glow, { x: event.clientX, y: event.clientY }, { type: 'spring', stiffness: 120, damping: 22, mass: 0.4 });
  }, { passive: true });
}

function initProseReveal(animate, inView) {
  document.querySelectorAll('.article-prose h2').forEach((heading) => {
    animate(heading, { opacity: 0, y: 24 }, { duration: 0 });
    inView(heading, () => {
      animate(heading, { opacity: 1, y: 0 }, { duration: 0.6, easing: [0.16, 1, 0.3, 1] });
    }, { amount: 0.6 });
  });
}

function initMotionEnhancements() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  import('https://cdn.jsdelivr.net/npm/framer-motion@13.1.0/dom/+esm')
    .then(({ animate, scroll, inView }) => {
      initScrollProgress(animate, scroll);
      initProseReveal(animate, inView);

      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        initMagneticButtons(animate);
        initCardTilt(animate);
        initCursorGlow(animate);
      }
    })
    .catch((error) => {
      console.warn('Motion enhancements unavailable, site keeps working without them.', error);
    });
}

// --- Liquid Glass -------------------------------------------------------
// Real refraction: every glass surface gets its own SVG filter whose
// displacement map bends the backdrop along a convex bezel, run once per
// colour channel at slightly different strengths for chromatic aberration.
// Only Chromium renders SVG filters inside backdrop-filter, so every other
// browser keeps the CSS material from styles.css (tint, rim, sheen), which
// stands on its own.

const LIQUID_GLASS_SELECTOR = '.glass-nav, .glass-panel, .glass-panel-large, .cookie-consent';
const SVG_NS = 'http://www.w3.org/2000/svg';

function supportsLiquidRefraction() {
  const brands = (navigator.userAgentData && navigator.userAgentData.brands) || [];
  const isChromium = brands.some(({ brand }) => brand === 'Chromium');
  // Phones and tablets get the CSS material only: a full-screen SVG filter
  // per surface costs too much GPU there for what it adds.
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  return isChromium && finePointer;
}

// Red = horizontal offset, green = vertical, 128 = no offset. Inside the
// bezel each pixel samples from further in, along the edge normal, rising
// steeply towards the rim like the curved edge of a thick lens.
function buildDisplacementMap(width, height, radius, bezel) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  const image = context.createImageData(width, height);
  const data = image.data;
  const halfW = width / 2;
  const halfH = height / 2;
  const r = Math.min(radius, halfW, halfH);

  for (let y = 0; y < height; y += 1) {
    const py = y + 0.5 - halfH;
    const qy = Math.abs(py) - (halfH - r);

    for (let x = 0; x < width; x += 1) {
      const px = x + 0.5 - halfW;
      const qx = Math.abs(px) - (halfW - r);
      let inside;
      let nx = 0;
      let ny = 0;

      if (qx > 0 && qy > 0) {
        const length = Math.hypot(qx, qy);
        inside = r - length;
        nx = (qx / length) * Math.sign(px);
        ny = (qy / length) * Math.sign(py);
      } else if (qx > qy) {
        inside = r - qx;
        nx = Math.sign(px);
      } else {
        inside = r - qy;
        ny = Math.sign(py);
      }

      let strength = 0;
      if (inside >= 0 && inside < bezel) {
        const t = 1 - inside / bezel;
        strength = 1 - Math.sqrt(1 - t * t);
      }

      const i = (y * width + x) * 4;
      data[i] = 128 - nx * strength * 127;
      data[i + 1] = 128 - ny * strength * 127;
      data[i + 2] = 128;
      data[i + 3] = 255;
    }
  }

  context.putImageData(image, 0, 0);
  return canvas.toDataURL();
}

function createLiquidFilter(id, href, width, height, scale) {
  const channel = (name, strength, matrix) => `
    <feDisplacementMap in="SourceGraphic" in2="map" scale="${strength}" xChannelSelector="R" yChannelSelector="G" result="${name}-shift" />
    <feColorMatrix in="${name}-shift" type="matrix" values="${matrix}" result="${name}" />`;

  const markup = `<svg xmlns="${SVG_NS}">
    <filter id="${id}" x="0" y="0" width="${width}" height="${height}" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feImage href="${href}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="none" result="map" />
      ${channel('red', scale, '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0')}
      ${channel('green', scale * 0.92, '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0')}
      ${channel('blue', scale * 0.84, '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0')}
      <feBlend in="red" in2="green" mode="screen" result="red-green" />
      <feBlend in="red-green" in2="blue" mode="screen" />
    </filter>
  </svg>`;

  const parsed = new DOMParser().parseFromString(markup, 'image/svg+xml');
  return document.importNode(parsed.documentElement.firstElementChild, true);
}

function initGlassSheen() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  let frame = 0;
  let lastEvent = null;

  document.addEventListener('pointermove', (event) => {
    lastEvent = event;
    if (frame) return;

    frame = window.requestAnimationFrame(() => {
      frame = 0;
      const target = lastEvent.target instanceof Element ? lastEvent.target.closest(LIQUID_GLASS_SELECTOR) : null;
      if (!target) return;

      const rect = target.getBoundingClientRect();
      target.style.setProperty('--lg-x', `${((lastEvent.clientX - rect.left) / rect.width) * 100}%`);
      target.style.setProperty('--lg-y', `${((lastEvent.clientY - rect.top) / rect.height) * 100}%`);
    });
  }, { passive: true });
}

function initLiquidGlass() {
  initGlassSheen();

  const surfaces = Array.from(document.querySelectorAll(LIQUID_GLASS_SELECTOR));
  if (!surfaces.length || !supportsLiquidRefraction()) return;

  const host = document.createElementNS(SVG_NS, 'svg');
  host.setAttribute('aria-hidden', 'true');
  host.setAttribute('width', '0');
  host.setAttribute('height', '0');
  host.style.position = 'absolute';
  host.style.pointerEvents = 'none';
  document.body.appendChild(host);
  document.documentElement.classList.add('has-liquid-glass');

  const rendered = new WeakMap();
  const timers = new WeakMap();

  const render = (surface, index) => {
    // Layout size, not getBoundingClientRect: the reveal and tilt transforms
    // must not change the map.
    const width = surface.offsetWidth;
    const height = surface.offsetHeight;
    if (width < 2 || height < 2) return;

    const radius = parseFloat(getComputedStyle(surface).borderTopLeftRadius) || 0;
    const key = `${width}x${height}x${radius}`;
    if (rendered.get(surface) === key) return;
    rendered.set(surface, key);

    const isNav = surface.classList.contains('glass-nav');
    const bezel = Math.max(14, Math.min(44, Math.min(width, height) * 0.22));
    const scale = isNav ? 120 : 140;
    const id = `liquid-glass-${index}`;

    host.querySelector(`#${id}`)?.remove();
    host.appendChild(createLiquidFilter(id, buildDisplacementMap(width, height, radius, bezel), width, height, scale));
    surface.style.backdropFilter = `blur(${isNav ? 2 : 4}px) url(#${id}) saturate(185%) brightness(1.06)`;
  };

  const schedule = (surface) => {
    window.clearTimeout(timers.get(surface));
    timers.set(surface, window.setTimeout(() => render(surface, surfaces.indexOf(surface)), 120));
  };

  // First pass on a timer, not from the observer: ResizeObserver only reports
  // while the page renders, so a tab opened in the background would stay flat.
  surfaces.forEach(schedule);
  const observer = new ResizeObserver((entries) => entries.forEach(({ target }) => schedule(target)));
  surfaces.forEach((surface) => observer.observe(surface));
}

document.addEventListener('DOMContentLoaded', () => {
  initCookieConsent();
  initAnalyticsEvents();
  initMenu();
  initLangDropdown();
  initBusinessMockup();
  initMotionEnhancements();
  initLiquidGlass();

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
