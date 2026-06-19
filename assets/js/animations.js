/**
 * animations.js – Intersection Observer reveal animations
 */

document.addEventListener('DOMContentLoaded', () => {

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Stagger children if they have animation-delay
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  });

  document.querySelectorAll('.reveal').forEach(el => {
    observer.observe(el);
  });

  // Gallery strip drag-scroll
  const strip = document.querySelector('.gallery-strip');
  if (strip) {
    let isDragging = false;
    let startX;
    let scrollLeft;

    strip.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.pageX - strip.offsetLeft;
      scrollLeft = strip.scrollLeft;
      strip.style.cursor = 'grabbing';
    });

    strip.addEventListener('mouseleave', () => {
      isDragging = false;
      strip.style.cursor = 'grab';
    });

    strip.addEventListener('mouseup', () => {
      isDragging = false;
      strip.style.cursor = 'grab';
    });

    strip.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - strip.offsetLeft;
      const walk = (x - startX) * 1.5;
      strip.scrollLeft = scrollLeft - walk;
    });

    strip.style.cursor = 'grab';

    // Auto-scroll gallery strip slowly
    let autoScroll = setInterval(() => {
      strip.scrollLeft += 1;
      if (strip.scrollLeft >= strip.scrollWidth - strip.clientWidth) {
        strip.scrollLeft = 0;
      }
    }, 20);

    strip.addEventListener('mouseenter', () => clearInterval(autoScroll));
    strip.addEventListener('mouseleave', () => {
      autoScroll = setInterval(() => {
        strip.scrollLeft += 1;
        if (strip.scrollLeft >= strip.scrollWidth - strip.clientWidth) {
          strip.scrollLeft = 0;
        }
      }, 20);
    });
  }

  // Parallax effect for hero (subtle)
  const hero = document.querySelector('.hero');
  if (hero) {
    const heroOverlay = hero.querySelector('.hero-overlay');
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      if (scrolled < window.innerHeight && heroOverlay) {
        heroOverlay.style.opacity = Math.min(0.4 + scrolled / 800, 0.95);
      }
    }, { passive: true });
  }

});
