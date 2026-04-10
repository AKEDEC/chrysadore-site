/* ============================================
   CHRYSA DORÉ — Cart & Checkout System
   ============================================ */

(function () {
  const STORAGE_KEY = 'chrysadore-cart';
  const CURRENCY = '€';
  const FREE_SHIPPING_AT = 5000;
  const EXPRESS_FEE = 50;
  const STANDARD_FEE = 20;

  const formatPrice = (n) => `${CURRENCY} ${Math.round(n).toLocaleString('de-DE')}`;

  let state = { items: [] };

  function load() {
    try {
      state.items = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      state.items = [];
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }

  function totalQty() {
    return state.items.reduce((s, i) => s + i.qty, 0);
  }

  function subtotal() {
    return state.items.reduce((s, i) => s + i.price * i.qty, 0);
  }

  function shippingFee(method) {
    const sub = subtotal();
    if (method === 'standard') return sub >= FREE_SHIPPING_AT ? 0 : STANDARD_FEE;
    return sub >= FREE_SHIPPING_AT ? 0 : EXPRESS_FEE;
  }

  function addItem(item) {
    const existing = state.items.find((i) => i.id === item.id);
    if (existing) {
      existing.qty += item.qty || 1;
    } else {
      state.items.push({ ...item, qty: item.qty || 1 });
    }
    save();
    renderBadge();
    renderDrawer();
    pulseBadge();
    openDrawer();
  }

  function removeItem(id) {
    state.items = state.items.filter((i) => i.id !== id);
    save();
    renderBadge();
    renderDrawer();
  }

  function updateQty(id, delta) {
    const item = state.items.find((i) => i.id === id);
    if (!item) return;
    item.qty = Math.max(1, item.qty + delta);
    save();
    renderBadge();
    renderDrawer();
  }

  function pulseBadge() {
    document.querySelectorAll('.cart-icon').forEach((btn) => {
      btn.classList.remove('cd-pulse');
      void btn.offsetWidth;
      btn.classList.add('cd-pulse');
    });
  }

  // ---------- UI Injection ----------
  function injectUI() {
    if (document.getElementById('cd-cart-root')) return;
    const root = document.createElement('div');
    root.id = 'cd-cart-root';
    root.innerHTML = `
      <div class="cd-cart-overlay" id="cdCartOverlay"></div>

      <aside class="cd-cart-drawer" id="cdCartDrawer" aria-hidden="true" aria-label="Giỏ hàng">
        <header class="cd-cart-header">
          <div>
            <span class="cd-cart-eyebrow">— Maison Chrysa Doré</span>
            <h2>Giỏ Hàng</h2>
          </div>
          <button class="cd-cart-close" id="cdCartClose" aria-label="Đóng">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </header>
        <div class="cd-cart-body" id="cdCartBody"></div>
        <footer class="cd-cart-footer" id="cdCartFooter"></footer>
      </aside>

      <div class="cd-checkout" id="cdCheckout" aria-hidden="true">
        <div class="cd-checkout-inner" id="cdCheckoutInner"></div>
      </div>
    `;
    document.body.appendChild(root);

    document.getElementById('cdCartClose').addEventListener('click', closeDrawer);
    document.getElementById('cdCartOverlay').addEventListener('click', closeDrawer);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (document.getElementById('cdCheckout').classList.contains('active')) {
          closeCheckout();
        } else if (document.getElementById('cdCartDrawer').classList.contains('open')) {
          closeDrawer();
        }
      }
    });
  }

  // ---------- Render ----------
  function renderBadge() {
    const n = totalQty();
    document.querySelectorAll('.cart-count').forEach((el) => {
      el.textContent = n;
      el.classList.toggle('has-items', n > 0);
    });
  }

  function renderDrawer() {
    const body = document.getElementById('cdCartBody');
    const footer = document.getElementById('cdCartFooter');
    if (!body || !footer) return;

    if (state.items.length === 0) {
      body.innerHTML = `
        <div class="cd-cart-empty">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/>
          </svg>
          <h3>Giỏ hàng đang trống</h3>
          <p>Hãy khám phá những kiệt tác mới nhất từ bộ sưu tập của chúng tôi.</p>
          <button class="cd-cart-empty-btn" id="cdEmptyBtn">Khám Phá Bộ Sưu Tập</button>
        </div>
      `;
      footer.innerHTML = '';
      const emptyBtn = document.getElementById('cdEmptyBtn');
      if (emptyBtn) emptyBtn.onclick = closeDrawer;
      return;
    }

    body.innerHTML = state.items
      .map(
        (item) => `
      <article class="cd-cart-item" data-id="${item.id}">
        <div class="cd-cart-item-img">
          <img src="${item.image}" alt="${item.name}" loading="lazy">
        </div>
        <div class="cd-cart-item-info">
          <span class="cd-cart-item-cat">${item.category || ''}</span>
          <h4>${item.name}</h4>
          ${item.variant ? `<span class="cd-cart-item-variant">${item.variant}</span>` : ''}
          <div class="cd-cart-item-bottom">
            <div class="cd-qty-stepper">
              <button data-action="dec" aria-label="Giảm">−</button>
              <span>${item.qty}</span>
              <button data-action="inc" aria-label="Tăng">+</button>
            </div>
            <span class="cd-cart-item-price">${formatPrice(item.price * item.qty)}</span>
          </div>
        </div>
        <button class="cd-cart-item-remove" data-action="remove" aria-label="Xóa">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </article>
    `
      )
      .join('');

    body.querySelectorAll('.cd-cart-item').forEach((el) => {
      const id = el.dataset.id;
      el.querySelector('[data-action="dec"]').onclick = () => updateQty(id, -1);
      el.querySelector('[data-action="inc"]').onclick = () => updateQty(id, 1);
      el.querySelector('[data-action="remove"]').onclick = () => removeItem(id);
    });

    const sub = subtotal();
    const ship = shippingFee('express');
    const total = sub + ship;
    const remaining = Math.max(0, FREE_SHIPPING_AT - sub);
    const progress = Math.min(100, (sub / FREE_SHIPPING_AT) * 100);

    footer.innerHTML = `
      ${
        remaining > 0
          ? `<div class="cd-shipping-bar">
              <p>Mua thêm <strong>${formatPrice(remaining)}</strong> để được <strong>miễn phí giao hàng Express</strong></p>
              <div class="cd-shipping-progress"><div style="width:${progress}%"></div></div>
            </div>`
          : `<div class="cd-shipping-bar achieved">
              <p>✦ Bạn đã đạt mức <strong>miễn phí giao hàng Express</strong> ✦</p>
            </div>`
      }
      <div class="cd-cart-summary">
        <div class="cd-row"><span>Tạm tính</span><span>${formatPrice(sub)}</span></div>
        <div class="cd-row"><span>Vận chuyển Express</span><span>${ship === 0 ? 'Miễn phí' : formatPrice(ship)}</span></div>
        <div class="cd-row cd-total"><span>Tổng cộng</span><span>${formatPrice(total)}</span></div>
        <p class="cd-tax-note">Đã bao gồm thuế VAT. Chi phí phát sinh sẽ được tính ở bước cuối.</p>
      </div>
      <button class="cd-checkout-btn" id="cdCheckoutBtn">
        <span>Tiến Hành Thanh Toán</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M5 12h14M13 5l7 7-7 7"/>
        </svg>
      </button>
      <div class="cd-cart-perks">
        <span>◆ SSL 256-bit</span>
        <span>◆ Đổi trả 30 ngày</span>
        <span>◆ Đóng gói cao cấp</span>
      </div>
    `;

    document.getElementById('cdCheckoutBtn').onclick = openCheckout;
  }

  // ---------- Drawer ----------
  function openDrawer() {
    injectUI();
    renderDrawer();
    document.getElementById('cdCartDrawer').classList.add('open');
    document.getElementById('cdCartOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    document.getElementById('cdCartDrawer').classList.remove('open');
    document.getElementById('cdCartOverlay').classList.remove('active');
    if (!document.getElementById('cdCheckout').classList.contains('active')) {
      document.body.style.overflow = '';
    }
  }

  // ---------- Checkout ----------
  function openCheckout() {
    closeDrawer();
    renderCheckout();
    document.getElementById('cdCheckout').classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCheckout() {
    document.getElementById('cdCheckout').classList.remove('active');
    document.body.style.overflow = '';
  }

  function renderCheckout() {
    const inner = document.getElementById('cdCheckoutInner');
    const sub = subtotal();
    const ship = shippingFee('express');
    const total = sub + ship;
    const vat = Math.round(sub * 0.1);

    inner.innerHTML = `
      <div class="cd-co-topbar">
        <div class="cd-co-brand">
          <span class="cd-co-brand-name">Chrysa Doré</span>
          <span class="cd-co-brand-tag">Maison de Haute Couture · Paris</span>
        </div>
        <div class="cd-co-steps">
          <span class="cd-step active"><i>01</i> Giỏ Hàng</span>
          <span class="cd-step-sep"></span>
          <span class="cd-step active current"><i>02</i> Thanh Toán</span>
          <span class="cd-step-sep"></span>
          <span class="cd-step"><i>03</i> Xác Nhận</span>
        </div>
        <button class="cd-co-close" id="cdCheckoutCloseBtn" aria-label="Đóng">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div class="cd-co-grid">
        <section class="cd-co-form">
          <div class="cd-co-section">
            <h3><span class="cd-co-num">01</span> Thông Tin Liên Hệ</h3>
            <div class="cd-co-row">
              <div class="cd-co-field">
                <label>Email</label>
                <input type="email" placeholder="email@chrysadore.com">
              </div>
            </div>
            <div class="cd-co-row two">
              <div class="cd-co-field">
                <label>Họ</label>
                <input type="text" placeholder="Nguyễn">
              </div>
              <div class="cd-co-field">
                <label>Tên</label>
                <input type="text" placeholder="An">
              </div>
            </div>
            <div class="cd-co-row">
              <div class="cd-co-field">
                <label>Số điện thoại</label>
                <input type="tel" placeholder="+84 ...">
              </div>
            </div>
          </div>

          <div class="cd-co-section">
            <h3><span class="cd-co-num">02</span> Địa Chỉ Giao Hàng</h3>
            <div class="cd-co-row">
              <div class="cd-co-field">
                <label>Quốc gia / Vùng</label>
                <select>
                  <option>Việt Nam</option>
                  <option>France</option>
                  <option>United Kingdom</option>
                  <option>United States</option>
                  <option>Italia</option>
                  <option>Japan</option>
                  <option>United Arab Emirates</option>
                </select>
              </div>
            </div>
            <div class="cd-co-row">
              <div class="cd-co-field">
                <label>Địa chỉ</label>
                <input type="text" placeholder="Số nhà, tên đường">
              </div>
            </div>
            <div class="cd-co-row">
              <div class="cd-co-field">
                <label>Căn hộ, suite, tầng (tùy chọn)</label>
                <input type="text" placeholder="Penthouse · Suite 4502">
              </div>
            </div>
            <div class="cd-co-row two">
              <div class="cd-co-field">
                <label>Thành phố</label>
                <input type="text" placeholder="Hồ Chí Minh">
              </div>
              <div class="cd-co-field">
                <label>Mã bưu chính</label>
                <input type="text" placeholder="700000">
              </div>
            </div>
          </div>

          <div class="cd-co-section">
            <h3><span class="cd-co-num">03</span> Phương Thức Vận Chuyển</h3>
            <div class="cd-co-options">
              <label class="cd-co-option active">
                <input type="radio" name="ship" checked>
                <span class="cd-co-check"></span>
                <div class="cd-co-option-info">
                  <span class="t">Express Premium · White Glove</span>
                  <span class="d">2–3 ngày làm việc · Giao hàng tận nơi bằng găng tay trắng</span>
                </div>
                <span class="p">${ship === 0 ? 'Miễn phí' : formatPrice(EXPRESS_FEE)}</span>
              </label>
              <label class="cd-co-option">
                <input type="radio" name="ship">
                <span class="cd-co-check"></span>
                <div class="cd-co-option-info">
                  <span class="t">Standard</span>
                  <span class="d">5–7 ngày làm việc · Đóng gói tiêu chuẩn cao cấp</span>
                </div>
                <span class="p">${formatPrice(STANDARD_FEE)}</span>
              </label>
            </div>
          </div>

          <div class="cd-co-section">
            <h3><span class="cd-co-num">04</span> Phương Thức Thanh Toán</h3>
            <div class="cd-co-pay">
              <label class="cd-co-option active" data-pay="card">
                <input type="radio" name="pay" checked>
                <span class="cd-co-check"></span>
                <div class="cd-co-option-info">
                  <span class="t">Thẻ tín dụng / ghi nợ</span>
                  <span class="d">Visa, Mastercard, American Express</span>
                </div>
                <div class="cd-pay-icons">
                  <svg viewBox="0 0 38 24" width="38" height="24"><rect width="38" height="24" rx="4" fill="#1A1F71"/><text x="19" y="16" font-family="Arial,sans-serif" font-weight="900" font-size="10" fill="#fff" text-anchor="middle" letter-spacing="0.5">VISA</text></svg>
                  <svg viewBox="0 0 38 24" width="38" height="24"><rect width="38" height="24" rx="4" fill="#000"/><circle cx="15" cy="12" r="7" fill="#EB001B"/><circle cx="23" cy="12" r="7" fill="#F79E1B" fill-opacity="0.85"/></svg>
                  <svg viewBox="0 0 38 24" width="38" height="24"><rect width="38" height="24" rx="4" fill="#006FCF"/><text x="19" y="15" font-family="Arial,sans-serif" font-weight="900" font-size="7" fill="#fff" text-anchor="middle">AMEX</text></svg>
                </div>
              </label>

              <div class="cd-co-card-fields" id="cdCardFields">
                <div class="cd-co-row">
                  <div class="cd-co-field">
                    <label>Số thẻ</label>
                    <input type="text" id="cdCardNumber" placeholder="0000 0000 0000 0000" maxlength="19" inputmode="numeric">
                  </div>
                </div>
                <div class="cd-co-row two">
                  <div class="cd-co-field">
                    <label>Hạn sử dụng</label>
                    <input type="text" id="cdCardExp" placeholder="MM / YY" maxlength="7">
                  </div>
                  <div class="cd-co-field">
                    <label>CVC</label>
                    <input type="text" id="cdCardCvc" placeholder="•••" maxlength="4" inputmode="numeric">
                  </div>
                </div>
                <div class="cd-co-row">
                  <div class="cd-co-field">
                    <label>Tên chủ thẻ</label>
                    <input type="text" placeholder="Như được in trên thẻ">
                  </div>
                </div>
              </div>

              <label class="cd-co-option" data-pay="bank">
                <input type="radio" name="pay">
                <span class="cd-co-check"></span>
                <div class="cd-co-option-info">
                  <span class="t">Chuyển khoản ngân hàng quốc tế</span>
                  <span class="d">Hướng dẫn chi tiết sẽ được gửi qua email sau khi đặt hàng</span>
                </div>
              </label>

              <label class="cd-co-option" data-pay="boutique">
                <input type="radio" name="pay">
                <span class="cd-co-check"></span>
                <div class="cd-co-option-info">
                  <span class="t">Thanh toán tại Maison Boutique</span>
                  <span class="d">Đặt giữ hàng và thanh toán khi đến thử trực tiếp tại boutique</span>
                </div>
              </label>
            </div>
          </div>

          <div class="cd-co-section cd-co-section-flat">
            <label class="cd-co-checkbox">
              <input type="checkbox" checked>
              <span></span>
              Tôi đồng ý với <a href="#">Điều khoản dịch vụ</a> và <a href="#">Chính sách bảo mật</a> của Chrysa Doré.
            </label>
            <label class="cd-co-checkbox">
              <input type="checkbox">
              <span></span>
              Đăng ký nhận thông tin về bộ sưu tập mới và sự kiện độc quyền.
            </label>
          </div>
        </section>

        <aside class="cd-co-summary">
          <div class="cd-co-summary-inner">
            <h3>Đơn Hàng Của Bạn</h3>
            <div class="cd-co-items">
              ${state.items
                .map(
                  (item) => `
                <div class="cd-co-item">
                  <div class="cd-co-item-img">
                    <img src="${item.image}" alt="${item.name}">
                    <span class="cd-co-item-qty">${item.qty}</span>
                  </div>
                  <div class="cd-co-item-info">
                    <h5>${item.name}</h5>
                    <span>${item.variant || item.category || ''}</span>
                  </div>
                  <span class="cd-co-item-price">${formatPrice(item.price * item.qty)}</span>
                </div>
              `
                )
                .join('')}
            </div>

            <div class="cd-co-promo">
              <input type="text" placeholder="Mã giảm giá hoặc thẻ quà tặng">
              <button>Áp dụng</button>
            </div>

            <div class="cd-co-totals">
              <div class="cd-row"><span>Tạm tính</span><span>${formatPrice(sub)}</span></div>
              <div class="cd-row"><span>Vận chuyển</span><span>${ship === 0 ? 'Miễn phí' : formatPrice(ship)}</span></div>
              <div class="cd-row cd-row-muted"><span>Bao gồm VAT</span><span>${formatPrice(vat)}</span></div>
              <div class="cd-row cd-total"><span>Tổng cộng</span><span>${formatPrice(total)}</span></div>
            </div>

            <button class="cd-co-place" id="cdPlaceOrder">
              <span>Hoàn Tất Đơn Hàng</span>
              <strong>${formatPrice(total)}</strong>
            </button>

            <ul class="cd-co-trust">
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                Thanh toán an toàn với mã hóa SSL 256-bit
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Đảm bảo hoàn tiền trong 30 ngày
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 12V8H6a2 2 0 100 4h12a2 2 0 110 4H4M8 16l-4-4 4-4"/></svg>
                Đổi trả miễn phí toàn cầu
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
                Tư vấn cá nhân hóa 24/7
              </li>
            </ul>
          </div>
        </aside>
      </div>
    `;

    document.getElementById('cdPlaceOrder').onclick = placeOrder;
    document.getElementById('cdCheckoutCloseBtn').onclick = closeCheckout;

    // Card field formatters
    const cn = document.getElementById('cdCardNumber');
    if (cn) {
      cn.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '').slice(0, 16);
        v = v.replace(/(.{4})/g, '$1 ').trim();
        e.target.value = v;
      });
    }
    const ex = document.getElementById('cdCardExp');
    if (ex) {
      ex.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '').slice(0, 4);
        if (v.length >= 3) v = v.slice(0, 2) + ' / ' + v.slice(2);
        e.target.value = v;
      });
    }

    // Option toggling
    document.querySelectorAll('.cd-co-option').forEach((opt) => {
      opt.addEventListener('click', () => {
        const radio = opt.querySelector('input[type="radio"]');
        if (!radio) return;
        const name = radio.name;
        document.querySelectorAll(`.cd-co-option input[name="${name}"]`).forEach((r) => {
          r.closest('.cd-co-option').classList.remove('active');
        });
        opt.classList.add('active');
      });
    });
  }

  function placeOrder() {
    const placeBtn = document.getElementById('cdPlaceOrder');
    placeBtn.disabled = true;
    placeBtn.classList.add('processing');
    placeBtn.innerHTML = `<span class="cd-spinner"></span><span>Đang xử lý...</span>`;

    setTimeout(() => {
      const inner = document.getElementById('cdCheckoutInner');
      const orderId = '#CD' + Date.now().toString().slice(-8);
      const orderTotal = subtotal() + shippingFee('express');

      inner.innerHTML = `
        <div class="cd-co-success">
          <button class="cd-co-close cd-co-close-success" id="cdCheckoutCloseBtn2" aria-label="Đóng">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
          <div class="cd-co-success-mark">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 12l3 3 5-6"/>
            </svg>
          </div>
          <span class="cd-co-success-eyebrow">— Merci infiniment</span>
          <h2>Đơn Hàng Đã Được Tiếp Nhận</h2>
          <p class="cd-co-success-msg">
            Cảm ơn quý khách đã tin tưởng Chrysa Doré. Đội ngũ Concierge của chúng tôi sẽ liên hệ
            trong vòng 24 giờ tới để xác nhận và sắp xếp giao nhận.
          </p>
          <div class="cd-co-success-card">
            <div class="cd-co-success-row">
              <span>Mã đơn hàng</span>
              <strong>${orderId}</strong>
            </div>
            <div class="cd-co-success-row">
              <span>Tổng giá trị</span>
              <strong>${formatPrice(orderTotal)}</strong>
            </div>
            <div class="cd-co-success-row">
              <span>Phương thức</span>
              <strong>Visa •••• 4242</strong>
            </div>
            <div class="cd-co-success-row">
              <span>Dự kiến giao</span>
              <strong>2–3 ngày làm việc</strong>
            </div>
          </div>
          <p class="cd-co-success-email">
            Email xác nhận đã được gửi đến hộp thư của bạn.
          </p>
          <button class="cd-co-success-btn" id="cdSuccessClose">Tiếp Tục Mua Sắm</button>
        </div>
      `;

      state.items = [];
      save();
      renderBadge();
      renderDrawer();

      document.getElementById('cdSuccessClose').onclick = closeCheckout;
      document.getElementById('cdCheckoutCloseBtn2').onclick = closeCheckout;
    }, 1400);
  }

  // ---------- Bindings ----------
  function bindCartIcon() {
    document.querySelectorAll('.cart-icon').forEach((btn) => {
      if (btn.dataset.cdBound) return;
      btn.dataset.cdBound = '1';
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openDrawer();
      });
    });
  }

  function bindProductCards() {
    document.querySelectorAll('[data-add-cart]').forEach((btn) => {
      if (btn.dataset.cdBound) return;
      btn.dataset.cdBound = '1';
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const card = btn.closest('[data-product-id]');
        if (!card) return;
        addItem({
          id: card.dataset.productId,
          name: card.dataset.productName,
          price: parseInt(card.dataset.productPrice, 10),
          image: card.dataset.productImage,
          category: card.dataset.productCategory,
        });
      });
    });
  }

  // ---------- Init ----------
  function init() {
    load();
    injectUI();
    renderBadge();
    renderDrawer();
    bindCartIcon();
    bindProductCards();

    // Public API
    window.ChrysaCart = {
      add: addItem,
      open: openDrawer,
      close: closeDrawer,
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
