/**
 * Blog page logic - fetching, rendering, and modal details
 */

// ── Sanity API Config (Same as shop) ──
const SANITY_PROJECT_ID = 'i1n7xfdq';
const SANITY_DATASET = 'production';
const SANITY_API_VERSION = '2026-04-17';

const SANITY_CDN_URL = `https://${SANITY_PROJECT_ID}.apicdn.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}`;

// ── Fetch posts from Sanity ──
async function fetchPosts() {
  const query = encodeURIComponent(`*[_type == "post"] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    excerpt,
    "imageUrl": mainImage.asset->url,
    tags,
    body
  }`);

  const response = await fetch(`${SANITY_CDN_URL}?query=${query}`);
  if (!response.ok) throw new Error(`Sanity API error: ${response.statusText}`);
  const data = await response.json();
  return data.result || [];
}

// ── Helper: Format date ──
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
}

// ── Helper: Portable Text to HTML (Simplified) ──
// This handles basic text blocks. For more complex blocks, a library would be better.
function renderSpan(block) {
    if (!block.children) return '';
    const markDefs = block.markDefs || [];

    return block.children.map(child => {
        let text = child.text;
        if (!child.marks || child.marks.length === 0) {
            // Auto-linkify absolute URLs first
            text = text.replace(/(https?:\/\/[^\s"<>]+)/g, '<a href="$&" target="_blank" rel="noopener">$&</a>');

            // Auto-linkify @usernames AFTER URLs to avoid recursion
            text = text.replace(/(@[a-zA-Z0-9_]{3,})/g, (match) => {
                return `<a href="https://t.me/${match.substring(1)}" target="_blank" class="tg-link">${match}</a>`;
            });
            
            return text;
        }

        let html = text;
        child.marks.forEach(markKey => {
            const markDef = markDefs.find(d => d._key === markKey);
            if (markDef && markDef._type === 'link') {
                html = `<a href="${markDef.href}" target="_blank" rel="noopener">${html}</a>`;
            } else if (markKey === 'strong') {
                html = `<strong>${html}</strong>`;
            } else if (markKey === 'em') {
                html = `<em>${html}</em>`;
            }
        });
        return html;
    }).join('');
}

function blocksToHtml(blocks) {
    if (!blocks) return '';
    let html = '';
    let listType = null; 

    blocks.forEach(block => {
        if (block.listItem) {
            if (listType !== block.listItem) {
                if (listType) html += listType === 'bullet' ? '</ul>' : '</ol>';
                listType = block.listItem;
                html += listType === 'bullet' ? '<ul>' : '<ol>';
            }
            html += `<li>${renderSpan(block)}</li>`;
        } else {
            if (listType) {
                html += listType === 'bullet' ? '</ul>' : '</ol>';
                listType = null;
            }

            if (block._type !== 'block' || !block.children) {
                if (block._type === 'image') {
                     html += `<img src="${block.asset?._ref?.replace('image-', 'https://cdn.sanity.io/images/i1n7xfdq/production/').replace('-jpg', '.jpg').replace('-png', '.png')}" style="width:100%; border-radius:12px; margin: 20px 0;">`;
                }
                return;
            }

            const textContent = renderSpan(block);
            if (!textContent.trim() && block.style === 'normal') return; 

            switch (block.style) {
                case 'h1': html += `<h1>${textContent}</h1>`; break;
                case 'h2': html += `<h2>${textContent}</h2>`; break;
                case 'h3': html += `<h3>${textContent}</h3>`; break;
                case 'h4': html += `<h4>${textContent}</h4>`; break;
                case 'blockquote': html += `<blockquote>${textContent}</blockquote>`; break;
                default: html += `<p>${textContent}</p>`; break;
            }
        }
    });

    if (listType) html += listType === 'bullet' ? '</ul>' : '</ol>';
    return html;
}

// ── Render blog card ──
function renderBlogCard(post) {
    const date = formatDate(post.publishedAt);
    return `
    <article class="blog-card shadow-reveal" data-post='${JSON.stringify(post).replace(/'/g, "&#39;")}'>
        ${post.imageUrl ? `
            <div class="blog-card__image">
                <img src="${post.imageUrl}?w=800&h=500&fit=crop" alt="${post.title}" loading="lazy">
            </div>
        ` : ''}
        <div class="blog-card__content">
            <div class="blog-card__meta">
                <span class="blog-card__date">${date}</span>
                ${post.tags ? `<div class="blog-card__tags">${post.tags.map(t => `<span class="blog-tag">${t}</span>`).join('')}</div>` : ''}
            </div>
            <h3 class="blog-card__title">${post.title}</h3>
            <p class="blog-card__excerpt">${post.excerpt || ''}</p>
            <button class="blog-card__read-more">Читать далее &rarr;</button>
        </div>
    </article>
    `;
}

// ── Load posts ──
async function loadPosts() {
  const grid = document.getElementById('blog-grid');
  if (!grid) return;

  try {
    const posts = await fetchPosts();

    if (!posts || posts.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <p style="font-size: 18px; color: var(--text-secondary);">
            Статей пока нет. Мы скоро добавим что-нибудь интересное!
          </p>
        </div>
      `;
      return;
    }

    grid.innerHTML = posts.map(renderBlogCard).join('');

    // Trigger scroll animations (reusing the same logic from main.js if available, or redefining)
    initScrollAnimations();
    initBlogClicks();

  } catch (error) {
    console.error('Failed to load posts:', error);
    grid.innerHTML = `<div class="error-state"><p>Не удалось загрузить блог. Попробуйте позже.</p></div>`;
  }
}

// ── Scroll animations ──
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('revealed');
          }, i * 100);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
  
    document.querySelectorAll('.blog-card:not(.revealed)').forEach(el => {
      observer.observe(el);
    });
}

// ── Blog Modal Logic ──
function openBlogModal(post) {
    const modal = document.createElement('div');
    modal.className = 'product-modal-overlay'; 
    modal.id = 'blogModal';

    modal.innerHTML = `
        <div class="product-modal blog-modal" onclick="event.stopPropagation()">
            <button class="modal-close" onclick="closeBlogModal()" aria-label="Закрыть">&times;</button>
            <div class="modal-scroll-area">
                ${post.imageUrl ? `
                    <div class="modal-image">
                        <img src="${post.imageUrl}?w=1200" alt="${post.title}">
                    </div>
                ` : ''}
                <div class="blog-content">
                    <div class="blog-modal__meta">
                        <span class="blog-modal__date">✱ Published on ${formatDate(post.publishedAt)}</span>
                        ${post.tags ? `<div class="blog-card__tags">${post.tags.map(t => `<span class="blog-tag">${t}</span>`).join('')}</div>` : ''}
                    </div>
                    <h1 class="modal-title">${post.title}</h1>
                    <div class="blog-full-text">
                        ${blocksToHtml(post.body)}
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => {
        modal.classList.add('modal-visible');
    });
}

function closeBlogModal() {
    const modal = document.getElementById('blogModal');
    if (!modal) return;
    modal.classList.remove('modal-visible');
    document.body.style.overflow = '';
    setTimeout(() => modal.remove(), 300);
}

function initBlogClicks() {
    document.addEventListener('click', (e) => {
        const card = e.target.closest('.blog-card');
        if (!card) return;

        const raw = card.getAttribute('data-post');
        if (!raw) return;

        try {
            const post = JSON.parse(raw.replace(/&#39;/g, "'"));
            openBlogModal(post);
        } catch (err) {
            console.error('Failed to parse post data:', err);
        }
    });

    // Close on overlay click
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('product-modal-overlay') && e.target.id === 'blogModal') {
            closeBlogModal();
        }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeBlogModal();
    });
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  loadPosts();
});
