/**
 * main.js – Core interaction logic for Amici Di Gallicianò
 */

document.addEventListener('DOMContentLoaded', () => {

  // ── Intro Overlay ─────────────────────────────────────────────
  const intro = document.getElementById('intro-overlay');
  const skipBtn = document.getElementById('intro-skip');

  const hideIntro = () => {
    if (!intro) return;
    intro.classList.add('hidden');
    setTimeout(() => intro.remove(), 900);
    sessionStorage.setItem('intro-done', '1');
  };

  if (intro) {
    if (sessionStorage.getItem('intro-done')) {
      intro.remove();
    } else {
      setTimeout(hideIntro, 4700);
      if (skipBtn) skipBtn.addEventListener('click', hideIntro);
      // Click anywhere to skip
      intro.addEventListener('click', (e) => {
        if (e.target !== skipBtn) hideIntro();
      });
    }
  }

  // ── Header scroll behavior ─────────────────────────────────────
  const header = document.getElementById('main-header');
  if (header && !header.classList.contains('scrolled')) {
    const onScroll = () => {
      if (window.scrollY > 60) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ── Mobile Navigation ──────────────────────────────────────────
  const menuBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.getElementById('nav-links');

  if (menuBtn && navLinks) {
    const closedHTML = menuBtn.innerHTML;
    const openHTML = '<span class="menu-text">Chiudi</span> <span class="hamburger-icon">&times;</span>';
    menuBtn.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('active');
      menuBtn.innerHTML = isOpen ? openHTML : closedHTML;
      menuBtn.setAttribute('aria-expanded', isOpen);
    });

    const closeMenu = () => {
      navLinks.classList.remove('active');
      menuBtn.innerHTML = closedHTML;
      menuBtn.setAttribute('aria-expanded', 'false');
    };

    // Close on nav link click
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!navLinks.contains(e.target) && !menuBtn.contains(e.target)) {
        closeMenu();
      }
    });
  }

  // ── Sticky CTA Bar ─────────────────────────────────────────────
  const stickyBar = document.getElementById('sticky-bar');
  if (stickyBar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        stickyBar.classList.add('visible');
      } else {
        stickyBar.classList.remove('visible');
      }
    }, { passive: true });
  }

  // ── Hero Slideshow ─────────────────────────────────────────────
  const slides = document.querySelectorAll('.hero-slide');
  if (slides.length > 1) {
    let current = 0;
    const nextSlide = () => {
      slides[current].classList.remove('active');
      current = (current + 1) % slides.length;
      slides[current].classList.add('active');
    };
    setInterval(nextSlide, 5000);
  }

  // ── FAQ Accordion ──────────────────────────────────────────────
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('active');

      // Close all
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));

      // Toggle this one
      if (!isOpen) item.classList.add('active');

      btn.setAttribute('aria-expanded', !isOpen);
    });
  });

  // ── WhatsApp UTM tracking ──────────────────────────────────────
  document.querySelectorAll('[data-contact]').forEach(el => {
    const contact = el.dataset.contact;
    const originalHref = el.getAttribute('href');
    if (originalHref && originalHref.includes('wa.me')) {
      const sep = originalHref.includes('?') ? '&' : '?';
      const source = encodeURIComponent(window.location.pathname.replace('/', '') || 'home');
      el.href = originalHref + sep + 'utm_source=' + source + '&utm_medium=web&utm_campaign=' + contact;
    }
  });


  // ── Pulsanti torna indietro ───────────────────────────────────
  document.querySelectorAll('[data-history-back]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (window.history.length > 1) window.history.back();
      else window.location.href = 'index.html';
    });
  });


  // ── WhatsApp popup diretto con Elisa ───────────────────────────
  const ensureElisaWhatsAppPopup = () => {
    if (document.querySelector('.whatsapp-chat-widget')) return;

    const phone = '393463603118';
    const pageName = (document.title || 'Amici Di Gallicianò Casa Giufà').replace(/\s+/g, ' ').trim();
    const text = encodeURIComponent('Ciao Elisa, vorrei informazioni su disponibilità, arrivo e soggiorno a Casa Giufà. Sto guardando questa pagina: ' + pageName);
    const whatsappUrl = 'https://wa.me/' + phone + '?text=' + text;

    const whatsappLogo = `
      <svg class="wa-logo-svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <path class="wa-logo-bg" d="M16 2.7C8.7 2.7 2.8 8.6 2.8 15.8c0 2.5.7 4.8 1.9 6.8L3.1 29l6.6-1.7c1.9 1.1 4.1 1.6 6.3 1.6 7.3 0 13.2-5.9 13.2-13.1S23.3 2.7 16 2.7z"/>
        <path class="wa-logo-mark" d="M22.8 19.4c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2c-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.5-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.7.1-.1.3-.4.5-.5.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5s-.7-1.7-1-2.3c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1.1 1.1-1.1 2.6 0 1.6 1.1 3.1 1.3 3.3.2.2 2.2 3.4 5.3 4.7.7.3 1.3.5 1.8.6.8.2 1.5.2 2 .1.6-.1 1.9-.8 2.1-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4z"/>
      </svg>`;

    const widget = document.createElement('div');
    widget.className = 'whatsapp-chat-widget';
    widget.innerHTML = `
      <div class="wa-chat-panel" role="dialog" aria-label="Chat WhatsApp con Elisa" aria-hidden="true">
        <div class="wa-chat-top">
          <div class="wa-chat-profile">
            <span class="wa-chat-avatar wa-brand-logo" aria-hidden="true">${whatsappLogo}</span>
            <div>
              <p class="wa-chat-name">Elisa</p>
              <p class="wa-chat-role">WhatsApp diretto · disponibilità · arrivo</p>
            </div>
          </div>
          <button class="wa-chat-close" type="button" aria-label="Chiudi chat WhatsApp">×</button>
        </div>
        <p class="wa-chat-message">Scrivi a Elisa su WhatsApp per disponibilità, parcheggio, arrivo a Gallicianò e informazioni pratiche prima del soggiorno.</p>
        <div class="wa-chat-actions">
          <a class="btn btn-whatsapp wa-action-primary" data-contact="elisa-popup" href="${whatsappUrl}" target="_blank" rel="noopener noreferrer"><span class="wa-action-icon">${whatsappLogo}</span><span>Apri WhatsApp</span></a>
          <a class="btn btn-outline" href="tel:+393463603118">Chiama Elisa</a>
        </div>
        <small class="wa-chat-note">Contatto diretto con Elisa. Non è un chatbot e non invia messaggi automatici.</small>
      </div>
      <button class="wa-chat-toggle" type="button" aria-expanded="false" aria-label="Apri chat WhatsApp con Elisa">
        <span class="wa-chat-icon wa-brand-logo" aria-hidden="true">${whatsappLogo}</span>
        <span class="wa-chat-label"><strong>Chat Elisa</strong><small>WhatsApp diretto</small></span>
      </button>
    `;

    document.body.appendChild(widget);

    const toggle = widget.querySelector('.wa-chat-toggle');
    const close = widget.querySelector('.wa-chat-close');
    const panel = widget.querySelector('.wa-chat-panel');
    const setOpen = (open) => {
      widget.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      panel.setAttribute('aria-hidden', String(!open));
    };

    toggle.addEventListener('click', () => setOpen(!widget.classList.contains('open')));
    close.addEventListener('click', () => setOpen(false));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setOpen(false);
    });
    document.addEventListener('click', (e) => {
      if (!widget.contains(e.target)) setOpen(false);
    });
  };
  ensureElisaWhatsAppPopup();

  // ── Service Worker Registration ────────────────────────────────
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }, err => {
        console.log('ServiceWorker registration failed: ', err);
      });
    });
  }

});
