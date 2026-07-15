(function() {
  'use strict';

  function observeElements(selector, options = {}) {
    const defaultOptions = {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px',
      stagger: 0,
      className: 'visible',
    };
    const config = { ...defaultOptions, ...options };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add(config.className);
          }, i * (config.stagger || 0));
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: config.threshold, rootMargin: config.rootMargin });

    document.querySelectorAll(selector).forEach(el => observer.observe(el));
  }

  function initHeaderScroll() {
    const header = document.querySelector('header');
    if (!header) return;
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          header.classList.toggle('header-scrolled', window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  function initCounterAnimation() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.target, 10);
          if (isNaN(target)) return;
          animateCounter(el, target);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('.animate-counter').forEach(el => observer.observe(el));
  }

  function animateCounter(el, target) {
    const duration = 1500;
    const steps = 30;
    const increment = target / steps;
    let current = 0;
    const stepTime = duration / steps;

    function update() {
      current += increment;
      if (current >= target) {
        el.textContent = target;
        return;
      }
      el.textContent = Math.round(current);
      setTimeout(update, stepTime);
    }
    update();
  }

  function initMenuToggle() {
    const btn = document.getElementById('menu-toggle');
    const menu = document.getElementById('mobile-menu');
    const overlay = document.getElementById('menu-overlay');
    if (!btn || !menu) return;

    function toggleMenu(open) {
      menu.classList.toggle('hidden', !open);
      menu.classList.toggle('flex', open);
      document.body.classList.toggle('overflow-hidden', open);
      if (overlay) overlay.classList.toggle('hidden', !open);
    }

    btn.addEventListener('click', () => {
      const isOpen = !menu.classList.contains('hidden');
      toggleMenu(!isOpen);
    });

    if (overlay) {
      overlay.addEventListener('click', () => toggleMenu(false));
    }

    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => toggleMenu(false));
    });
  }

  function initLightbox() {
    document.querySelectorAll('[data-lightbox]').forEach(img => {
      img.addEventListener('click', function() {
        const src = this.dataset.lightbox || this.src;
        showLightbox(src, this.alt || '');
      });
    });
  }

  function showLightbox(src, alt) {
    const existing = document.getElementById('lightbox');
    if (existing) existing.remove();

    const lb = document.createElement('div');
    lb.id = 'lightbox';
    lb.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/80';
    lb.style.animation = 'fadeIn 0.2s ease-out';
    lb.innerHTML = `
      <button class="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 z-10" onclick="this.parentElement.remove()">&times;</button>
      <img src="${src}" alt="${alt}" class="max-w-[90vw] max-h-[90vh] object-contain rounded-lg" style="animation: scaleIn 0.3s ease-out">
    `;
    lb.addEventListener('click', (e) => {
      if (e.target === lb) lb.remove();
    });
    document.body.appendChild(lb);
  }

  function init() {
    observeElements('.animate-on-scroll', { stagger: 100 });
    observeElements('.animate-fade-left', { stagger: 100 });
    observeElements('.animate-fade-right', { stagger: 100 });
    observeElements('.animate-scale-in', { stagger: 100 });
    observeElements('.stagger-children', { stagger: 80 });

    initHeaderScroll();
    initSmoothScroll();
    initCounterAnimation();
    initMenuToggle();
    initLightbox();
  }

  document.addEventListener('DOMContentLoaded', init);

  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
  `;
  document.head.appendChild(style);
})();
