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

      // Get selected size and color
      const activeSize = document.querySelector('.pd-size.active');
      const activeColor = document.querySelector('.pd-color.active');
      const sizeText = activeSize ? `Taille ${activeSize.textContent}` : '';
      const colorLabel = activeColor ? activeColor.getAttribute('aria-label') : '';
      const variant = [colorLabel, sizeText].filter(Boolean).join(' · ');

      // Get product info from the page
      const name = document.querySelector('.pd-title')?.textContent || 'Sản phẩm';
      const priceText = document.querySelector('.pd-price')?.textContent || '0';
      const price = parseInt(priceText.replace(/[^\d]/g, ''), 10);
      const image = document.getElementById('mainImage')?.src || '';
      const category = document.querySelector('.pd-category')?.textContent || '';

      // Use ChrysaCart if available
      if (window.ChrysaCart) {
        window.ChrysaCart.add({
          id: 'cd-' + name.toLowerCase().replace(/\s+/g, '-').slice(0, 20) + (activeSize ? '-' + activeSize.textContent : ''),
          name,
          price,
          image,
          category,
          variant,
        });
      }

      // Button feedback
      span.textContent = 'Đã Thêm Vào Giỏ';
      addCartBtn.style.background = 'var(--gold-dark)';
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
