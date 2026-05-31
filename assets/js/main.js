function revealFallback() {
  const boot = document.getElementById('boot');
  const nav = document.getElementById('nav');

  if (boot) boot.style.display = 'none';
  if (nav) nav.style.opacity = '1';

  document.querySelectorAll('.ui-reveal, .ui-card').forEach((element) => {
    element.style.opacity = '1';
    element.style.transform = 'none';
  });
}

function initMenu(gsapInstance) {
  const menuToggle = document.querySelector('.menu-toggle');
  const closeLinks = document.querySelectorAll('.toggle-close');
  const mobileMenu = document.querySelector('.mobile-menu-overlay');

  if (!menuToggle || !mobileMenu) return;

  const mobileMenuTl = gsapInstance.timeline({ paused: true, reversed: true });
  mobileMenuTl
    .to(mobileMenu, { autoAlpha: 1, duration: 0.4, ease: 'power3.inOut' })
    .to('.m-link', { y: 0, opacity: 1, stagger: 0.08, duration: 0.4, ease: 'power2.out' }, '-=0.15');

  function toggleMenu() {
    menuToggle.classList.toggle('active');
    menuToggle.setAttribute('aria-expanded', String(menuToggle.classList.contains('active')));
    mobileMenuTl.reversed() ? mobileMenuTl.play() : mobileMenuTl.reverse();
  }

  menuToggle.addEventListener('click', toggleMenu);
  closeLinks.forEach((link) => link.addEventListener('click', toggleMenu));
}

function initInterface() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reducedMotion) {
    revealFallback();
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

  initMenu(gsap);

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
      initInterface();
    }
  });

  boot
    .to('#boot-line', { width: '200px', duration: 0.6, ease: 'power4.inOut' })
    .to('#boot-line', { height: '0px', opacity: 0, duration: 0.3, delay: 0.2 })
    .to('#boot', { opacity: 0, duration: 0.5, ease: 'power2.out' }, '-=0.2');
});
