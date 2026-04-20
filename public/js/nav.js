/**
 * Shared navigation and footer - render once, use everywhere
 * Edit here → changes appear on all pages
 */

const CURRENT_PATH = window.location.pathname;

const NAV_LINKS = [
  { href: '/', label: 'Главная' },
  { href: '/pages/blog', label: 'Блог' },
  { href: '/pages/portfolio', label: 'Портфолио' },
  { href: '/pages/pricing', label: 'Цены' },
  { href: '/pages/shop', label: 'Магазин' },
  { href: '/pages/about', label: 'О нас' },
];

function navLinkHTML(link) {
  const isActive = CURRENT_PATH === link.href || (CURRENT_PATH === '/index.html' && link.href === '/') ? ' active' : '';
  return `<li><a href="${link.href}" class="nav-link-text-flip${isActive}"><span class="flip-text-clip"><span class="flip-text"><span class="text-original">${link.label}</span><span class="text-hover">${link.label}</span></span></span></a></li>`;
}

function renderNav() {
  const navContainer = document.getElementById('nav-container');
  if (!navContainer) return;

  navContainer.innerHTML = `
    <nav class="nav" id="nav">
        <div class="nav-inner">
            <a href="/" class="logo"><span>Moll</span>AI</a>
            <ul class="nav-links" id="navLinks">
                ${NAV_LINKS.map(navLinkHTML).join('')}
                <li><a href="/pages/about#contacts" class="nav-cta">Консультация</a></li>
            </ul>
            <div class="burger" id="burger" onclick="toggleMenu()">
                <span></span><span></span><span></span>
            </div>
        </div>
    </nav>`;
}

function renderFooter() {
  const footerContainer = document.getElementById('footer-container');
  if (!footerContainer) return;

  footerContainer.innerHTML = `
    <footer class="footer">
        <div class="footer-divider-line"></div>
        <div class="container">
            <div class="footer-inner">
                <p>&copy; 2026 MollAI. Все права защищены.</p>
                <a href="/pages/privacy">Политика конфиденциальности</a>
            </div>
        </div>
    </footer>`;
}

// Run on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  renderNav();
  renderFooter();
});