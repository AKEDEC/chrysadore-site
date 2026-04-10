/* ============================================
   CHRYSA DORÉ — Product Detail Interactions
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---------- Thumbnail Gallery ----------
  const mainImage = document.getElementById('mainImage');
  const thumbs = document.querySelectorAll('.pd-thumb');

  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      const imgUrl = thumb.dataset.img;
      mainImage.style.opacity = '0';
      mainImage.style.transform = 'scale(0.95)';

      setTimeout(() => {
        mainImage.src = imgUrl;
        mainImage.style.opacity = '1';
        mainImage.style.transform = 'scale(1)';
      }, 250);

      thumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    });
  });

  mainImage.style.transition = 'opacity 0.3s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';

  // ---------- Color Selection ----------
  const colors = document.querySelectorAll('.pd-color');
  colors.forEach(color => {
    color.addEventListener('click', () => {
      colors.forEach(c => c.classList.remove('active'));
      color.classList.add('active');
    });
  });

  // ---------- Size Selection ----------
  const sizes = document.querySelectorAll('.pd-size:not(.disabled)');
  sizes.forEach(size => {
    size.addEventListener('click', () => {
      sizes.forEach(s => s.classList.remove('active'));
      size.classList.add('active');
    });
  });

  // ---------- Wishlist Toggle ----------
  const wishlistBtn = document.querySelector('.pd-wishlist');
  if (wishlistBtn) {
    wishlistBtn.addEventListener('click', () => {
      wishlistBtn.classList.toggle('active');
    });
  }

  // ---------- Add to Cart ----------
  const addCartBtn = document.querySelector('.pd-add-cart');
  if (addCartBtn) {
    addCartBtn.addEventListener('click', () => {
      const span = addCartBtn.querySelector('span');
      const original = span.textContent;
      span.textContent = 'Đã Thêm Vào Giỏ';
      addCartBtn.style.background = 'var(--gold-dark)';

      const cartCount = document.querySelector('.cart-count');
      if (cartCount) {
        cartCount.textContent = parseInt(cartCount.textContent) + 1;
      }

      setTimeout(() => {
        span.textContent = original;
        addCartBtn.style.background = '';
      }, 2000);
    });
  }

  // ---------- Accordion ----------
  const accordionHeaders = document.querySelectorAll('.pd-accordion-header');
  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const accordion = header.parentElement;
      const isOpen = accordion.classList.contains('open');

      // Close all
      document.querySelectorAll('.pd-accordion').forEach(a => a.classList.remove('open'));

      // Toggle clicked
      if (!isOpen) {
        accordion.classList.add('open');
      }
    });
  });

  // ---------- Zoom ----------
  const zoomBtn = document.getElementById('zoomBtn');
  if (zoomBtn) {
    // Create zoom modal
    const modal = document.createElement('div');
    modal.className = 'pd-zoom-modal';
    modal.innerHTML = `
      <img src="" alt="Zoom">
      <button class="pd-zoom-close" aria-label="Close">&times;</button>
    `;
    document.body.appendChild(modal);

    const zoomImg = modal.querySelector('img');
    const closeBtn = modal.querySelector('.pd-zoom-close');

    zoomBtn.addEventListener('click', () => {
      zoomImg.src = mainImage.src;
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });

    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }
});
