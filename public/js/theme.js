/* Theme switcher — переключает визуальную тему сайта между default и "comfort".
 * Сохраняет выбор в localStorage. Рендерит липкую кнопку слева экрана. */
(function () {
  const STORAGE_KEY = 'mollai-theme';
  const COMFORT = 'comfort';
  const DEFAULT = 'default';

  function getTheme() {
    try { return localStorage.getItem(STORAGE_KEY) || DEFAULT; } catch (e) { return DEFAULT; }
  }
  function setTheme(theme) {
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) {}
    if (theme === COMFORT) {
      document.documentElement.setAttribute('data-theme', COMFORT);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    updateBtn(theme);
  }
  function updateBtn(theme) {
    const btn = document.getElementById('theme-toggle-btn');
    if (!btn) return;
    btn.textContent = theme === COMFORT ? 'DEFAULT' : 'COMFORT';
    btn.setAttribute('aria-label',
      theme === COMFORT ? 'Switch to default theme' : 'Switch to comfort theme');
  }

  // Подключаем CSS темы один раз
  function ensureCss() {
    if (document.getElementById('theme-comfort-css')) return;
    const link = document.createElement('link');
    link.id = 'theme-comfort-css';
    link.rel = 'stylesheet';
    link.href = '/css/theme-comfort.css';
    document.head.appendChild(link);
  }

  // Подключаем Fraunces (serif) один раз
  function ensureFont() {
    if (document.getElementById('theme-comfort-font')) return;
    const pre1 = document.createElement('link');
    pre1.rel = 'preconnect'; pre1.href = 'https://fonts.googleapis.com';
    document.head.appendChild(pre1);
    const pre2 = document.createElement('link');
    pre2.rel = 'preconnect'; pre2.href = 'https://fonts.gstatic.com'; pre2.crossOrigin = '';
    document.head.appendChild(pre2);
    const font = document.createElement('link');
    font.id = 'theme-comfort-font';
    font.rel = 'stylesheet';
    font.href = 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&display=swap';
    document.head.appendChild(font);
  }

  // Рендерим кнопку (если ещё не отрисована)
  function ensureBtn() {
    if (document.getElementById('theme-toggle-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'theme-toggle-btn';
    btn.type = 'button';
    btn.className = 'theme-toggle-btn';
    btn.addEventListener('click', () => {
      const cur = getTheme();
      setTheme(cur === COMFORT ? DEFAULT : COMFORT);
    });
    document.body.appendChild(btn);
  }

  function init() {
    ensureCss();
    ensureFont();
    ensureBtn();
    setTheme(getTheme());
  }

  // Инициализация — и при первой загрузке, и после клиентской навигации
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: false });
  } else {
    init();
  }

  // Экспорт для повторного применения после смены роута
  window.MollaiTheme = {
    apply: () => { ensureCss(); ensureFont(); ensureBtn(); setTheme(getTheme()); },
    set: setTheme,
    get: getTheme,
  };
})();
