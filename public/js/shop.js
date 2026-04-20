/**
 * Shop page logic - filters, animations, Sanity integration
 */

// ── Sanity API Config ──
const SANITY_PROJECT_ID = 'i1n7xfdq';
const SANITY_DATASET = 'production';
const SANITY_API_VERSION = '2026-04-17';

const SANITY_CDN_URL = `https://${SANITY_PROJECT_ID}.apicdn.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}`;

// ── Fetch products from Sanity ──
async function fetchProducts() {
  const query = encodeURIComponent(`*[_type == "product" && isPublished == true] | order(_createdAt desc) {
    _id,
    title,
    "slug": slug.current,
    description,
    price,
    category,
    "imageUrl": image.asset->url,
    "badgeUrl": badgeIcon.asset->url,
    ribbonLabel,
    demoUrl,
    features,
    _createdAt
  }`);

  const response = await fetch(`${SANITY_CDN_URL}?query=${query}`);
  if (!response.ok) throw new Error(`Sanity API error: ${response.statusText}`);
  const data = await response.json();
  return data.result || [];
}

// ── Category label helper ──
function getCategoryLabel(category) {
  const labels = {
    'telegram-bot': 'Telegram-бот',
    'ai-automation': 'AI-автоматизация',
    'web-script': 'Веб-скрипт',
    'scraper': 'Парсер',
  };
  return labels[category] || category;
}

// ── Truncate text helper ──
function truncate(text, maxLen) {
  if (!text) return '';
  return text.length > maxLen ? text.slice(0, maxLen) + '…' : text;
}

// ── Render product card HTML ──
function renderProductCard(product) {
  return `
    <article class="product-card" data-category="${product.category || 'default'}" data-product='${JSON.stringify(product).replace(/'/g, "&#39;")}'>
      ${product.ribbonLabel ? `
        <div class="product-card__ribbon">
          <span>${product.ribbonLabel}</span>
        </div>
      ` : ''}
      ${product.badgeUrl ? `
        <div class="product-card__badge-icon">
          <img src="${product.badgeUrl}" alt="Badge">
        </div>
      ` : ''}
      ${product.imageUrl ? `
        <div class="product-card__image">
          <img src="${product.imageUrl}?w=800&h=450&fit=crop" alt="${product.title}" loading="lazy">
        </div>
      ` : ''}
      <div class="product-card__content">
        <span class="product-card__category product-card__category--${product.category || 'default'}">
          ${getCategoryLabel(product.category)}
        </span>
        <h3 class="product-card__title">${truncate(product.title, 35)}</h3>
        <p class="product-card__description">${truncate(product.description, 100)}</p>
        ${product.features ? `
          <ul class="product-card__features">
            ${product.features.slice(0, 3).map(f => `<li>✓ ${f}</li>`).join('')}
          </ul>
        ` : ''}
      </div>
      <div class="product-card__footer" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
        <span class="product-card__price" style="position: static; transform: none;">$${product.price || 0}</span>
        <div style="display: flex; gap: 8px;">
          ${product.demoUrl
      ? `<a href="${product.demoUrl}" class="product-card__demo product-card__demo--link" target="_blank" rel="noopener" onclick="event.stopPropagation()">Демо &rarr;</a>`
      : ''
    }
          <button class="btn btn-primary btn-sm btn-order" onclick="event.stopPropagation(); openOrderModal('${product.title.replace(/'/g, "\\'")}')">Заказать</button>
        </div>
      </div>
    </article>
  `;
}

// ── Filter tabs ──
function initFilters() {
  const filterTabs = document.getElementById('filterTabs');
  if (!filterTabs) return;

  filterTabs.addEventListener('click', (e) => {
    if (!e.target.classList.contains('filter-tab')) return;

    // Update active tab
    filterTabs.querySelectorAll('.filter-tab').forEach(tab => tab.classList.remove('active'));
    e.target.classList.add('active');

    const category = e.target.dataset.category;
    const cards = document.querySelectorAll('.product-card');

    cards.forEach((card, i) => {
      const match = category === 'all' || card.dataset.category === category;
      if (match) {
        card.style.display = '';
        // Staggered reveal animation
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px) scale(0.97)';
        setTimeout(() => {
          card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0) scale(1)';
          card.classList.add('revealed');
        }, i * 80);
      } else {
        card.style.display = 'none';
      }
    });
  });
}

// ── Load products from Sanity ──
async function loadProducts() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  grid.innerHTML = `
    <div class="loading">
      <div class="loading-spinner"></div>
      <p>Загрузка товаров...</p>
    </div>
  `;

  try {
    const products = await fetchProducts();

    if (!products || products.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <p style="font-size: 18px; color: var(--text-secondary);">
            Товары скоро появятся. Мы готовим новые боты и скрипты!
          </p>
        </div>
      `;
      return;
    }

    grid.innerHTML = products.map(product => renderProductCard(product)).join('');

    // Trigger scroll animations
    initScrollAnimations();

    // Attach click handlers to open product details
    initProductClicks();
  } catch (error) {
    console.error('Failed to load products:', error);
    grid.innerHTML = `
      <div class="error-state">
        <p>Не удалось загрузить товары. Попробуйте позже.</p>
      </div>
    `;
  }
}

// ── Scroll-triggered reveal for product cards ──
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0) scale(1)';
          entry.target.classList.add('revealed');
        }, i * 100);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.product-card:not(.revealed)').forEach(el => {
    observer.observe(el);
  });
}

// ── Product detail modal ──
function openProductModal(product) {
  const modal = document.createElement('div');
  modal.className = 'product-modal-overlay';
  modal.id = 'productModal';

  const featuresHtml = product.features && product.features.length
    ? `<div class="modal-section">
        <h4>Возможности</h4>
        <ul class="modal-features">
          ${product.features.map(f => `<li><span class="feature-check">✓</span>${f}</li>`).join('')}
        </ul>
       </div>`
    : '';

  const fullDesc = product.description || 'Описание уточняйте у команды.';
  const shortDesc = truncate(fullDesc, 120);
  const isLong = fullDesc.length > 120;

  modal.innerHTML = `
    <div class="product-modal" onclick="event.stopPropagation()">
      <button class="modal-close" onclick="closeProductModal()" aria-label="Закрыть">&times;</button>
      <div class="modal-scroll-area">
        ${product.badgeUrl ? `
          <div class="modal-badge-icon">
            <img src="${product.badgeUrl}" alt="Badge">
          </div>
        ` : ''}
        ${product.imageUrl ? `
          <div class="modal-image">
            <img src="${product.imageUrl}?w=1000&h=560&fit=crop" alt="${product.title}">
          </div>
        ` : ''}
        <div class="modal-body">
          <span class="modal-category modal-category--${product.category || 'default'}">
            ${getCategoryLabel(product.category)}
          </span>
          <h2 class="modal-title">${product.title}</h2>
          <p class="modal-description">
            ${isLong ? `<span class="desc-short">${shortDesc}</span><span class="desc-full" style="display:none">${fullDesc}</span>
            <button class="read-more-btn" onclick="toggleDescription(this)">Читать далее</button>` : fullDesc}
          </p>
          ${featuresHtml}
        </div>
      </div>
      <div class="modal-footer" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
        <span class="modal-price" style="position: static; transform: none;">$${product.price || 0}</span>
        <div class="modal-actions" style="display: flex; gap: 10px;">
          ${product.demoUrl
      ? `<a href="${product.demoUrl}" class="btn-secondary" target="_blank" rel="noopener" style="padding: 10px 20px; text-decoration: none; border-radius: 8px; border: 1px solid var(--border-color); color: var(--text-primary);">Демо</a>`
      : ''
    }
          <button class="btn btn-primary hvr-float-shadow" onclick="openOrderModal('${product.title.replace(/'/g, "\\'")}')" style="padding: 12px 28px;">Заказать скрипт</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';

  // Animate in
  requestAnimationFrame(() => {
    modal.classList.add('modal-visible');
  });
}

function closeProductModal() {
  const modal = document.getElementById('productModal');
  if (!modal) return;
  modal.classList.remove('modal-visible');
  document.body.style.overflow = '';
  setTimeout(() => modal.remove(), 300);
}

function toggleDescription(btn) {
  const parent = btn.closest('.modal-description');
  const short = parent.querySelector('.desc-short');
  const full = parent.querySelector('.desc-full');
  if (full.style.display === 'none') {
    full.style.display = '';
    short.style.display = 'none';
    btn.textContent = 'Свернуть';
  } else {
    full.style.display = 'none';
    short.style.display = '';
    btn.textContent = 'Читать далее';
  }
}

function openOrderModal(productTitle) {
  closeProductModal();

  const modal = document.createElement('div');
  modal.className = 'product-modal-overlay';
  modal.id = 'orderModal';

  modal.innerHTML = `
    <div class="product-modal" onclick="event.stopPropagation()" style="max-width: 450px;">
      <button class="modal-close" onclick="closeOrderModal()" aria-label="Закрыть">&times;</button>
      <div class="modal-body" style="padding: 20px;">
        <div class="section-label" style="margin-bottom: 8px;">Оформление заказа</div>
        <h2 class="modal-title" style="margin-bottom: 24px; font-size: 24px;">${productTitle}</h2>
        
        <form id="quick-order-form">
          <div class="form-group">
            <label>Имя <span style="color: var(--accent-red)">*</span></label>
            <input type="text" id="order-name" class="form-input" placeholder="Ваше имя" required>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" id="order-email" class="form-input" placeholder="email@example.com">
          </div>
          <div class="form-group">
            <label>Telegram / Телефон</label>
            <input type="text" id="order-telegram" class="form-input" placeholder="@username или номер">
          </div>
          
          <button type="submit" id="order-submit" class="btn btn-primary hvr-float-shadow" style="width: 100%; margin-top: 10px;">&#10033; Отправить заявку</button>
        </form>
        <div id="order-status" style="margin-top: 15px; text-align: center; font-size: 14px; display: none;"></div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';

  requestAnimationFrame(() => modal.classList.add('modal-visible'));

  const form = document.getElementById('quick-order-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('order-name').value.trim();
    const email = document.getElementById('order-email').value.trim();
    const telegram = document.getElementById('order-telegram').value.trim();
    // Передаем название товара как услугу и как сообщение для надежности
    const service = "Покупка: " + productTitle;
    const message = "Заказ продукта: " + productTitle;

    const statusEl = document.getElementById('order-status');
    const submitBtn = document.getElementById('order-submit');

    if (!name) {
      statusEl.textContent = 'Укажите ваше имя!';
      statusEl.style.color = 'var(--accent-red)';
      statusEl.style.display = 'block';
      return;
    }
    if (!email && !telegram) {
      statusEl.textContent = 'Укажите Email или контакты!';
      statusEl.style.color = 'var(--accent-red)';
      statusEl.style.display = 'block';
      return;
    }

    const contact = email && telegram ? email + " / " + telegram : (email || telegram);

    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправляю...';

    const apiUrl = window.MOLLAI_CONFIG ? window.MOLLAI_CONFIG.apiUrl : 'https://chat-ruddy-three.vercel.app';
    fetch(`${apiUrl}/api/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, contact, service, message })
    })
      .then(r => r.json())
      .then(data => {
        if (data.ok) {
          statusEl.textContent = 'Заявка отправлена! Мы скоро свяжемся с вами.';
          statusEl.style.color = 'var(--accent-green)';
          statusEl.style.display = 'block';
          form.reset();
          setTimeout(closeOrderModal, 3000);
        } else {
          throw new Error('Server error');
        }
      })
      .catch(err => {
        statusEl.textContent = 'Ошибка. Попробуйте еще раз.';
        statusEl.style.color = 'var(--accent-red)';
        statusEl.style.display = 'block';
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Отправить заявку';
      });
  });
}

function closeOrderModal() {
  const modal = document.getElementById('orderModal');
  if (!modal) return;
  modal.classList.remove('modal-visible');
  document.body.style.overflow = '';
  setTimeout(() => modal.remove(), 300);
}

// Attach click handlers to product cards
function initProductClicks() {
  document.addEventListener('click', (e) => {
    const card = e.target.closest('.product-card');
    if (!card || e.target.closest('.product-card__demo') || e.target.closest('.btn-primary') || e.target.closest('.btn-secondary') || e.target.closest('.btn-order') || e.target.closest('.read-more-btn')) return;

    const raw = card.getAttribute('data-product');
    if (!raw) return;

    try {
      const product = JSON.parse(raw.replace(/&#39;/g, "'"));
      openProductModal(product);
    } catch (err) {
      console.error('Failed to parse product data:', err);
    }
  });

  // Close on overlay click
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('product-modal-overlay')) {
      if (e.target.id === 'orderModal') closeOrderModal();
      else closeProductModal();
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeOrderModal();
      closeProductModal();
    }
  });
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  initFilters();
});