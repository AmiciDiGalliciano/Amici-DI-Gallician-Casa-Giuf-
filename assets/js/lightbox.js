/**
 * lightbox.js – Click-to-zoom gallery lightbox with arrows
 */

document.addEventListener('DOMContentLoaded', () => {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');

  if (!lightbox || !lightboxImg) return;

  const galleryItems = Array.from(document.querySelectorAll('.gallery-item, .gallery-strip-item'));
  let currentIndex = 0;

  // Open on gallery item click
  galleryItems.forEach((item, index) => {
    const img = item.querySelector('img');
    const captionEl = item.querySelector('.gallery-strip-caption, .gallery-overlay span');
    if (!img) return;

    item.addEventListener('click', () => {
      currentIndex = index;
      updateLightboxContent();
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  const updateLightboxContent = () => {
    const item = galleryItems[currentIndex];
    const img = item.querySelector('img');
    const captionEl = item.querySelector('.gallery-strip-caption, .gallery-overlay span');
    
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    if (lightboxCaption) {
      lightboxCaption.textContent = captionEl ? captionEl.textContent : img.alt;
    }
  };

  const showNext = (e) => {
    if (e) e.stopPropagation();
    currentIndex = (currentIndex + 1) % galleryItems.length;
    updateLightboxContent();
  };

  const showPrev = (e) => {
    if (e) e.stopPropagation();
    currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
    updateLightboxContent();
  };

  if (nextBtn) nextBtn.addEventListener('click', showNext);
  if (prevBtn) prevBtn.addEventListener('click', showPrev);

  // Close lightbox
  const closeLightbox = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => {
      lightboxImg.src = '';
    }, 300);
  };

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target === document.querySelector('.lightbox-content')) closeLightbox();
  });

  // Keyboard Navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
  });

});
