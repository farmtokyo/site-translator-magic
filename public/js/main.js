// ═══════════════════════════════════════════
// GLOBAL CONFIG
// ═══════════════════════════════════════════
window.MOLLAI_CONFIG = {
    apiUrl: 'https://chat-ruddy-three.vercel.app'
};

// ═══════════════════════════════════════════
// FAQ TOGGLE
// ═══════════════════════════════════════════
function toggleFaq(el) {
    const item = el.parentElement;
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!wasOpen) item.classList.add('open');
}

// ═══════════════════════════════════════════
// MOBILE MENU
// ═══════════════════════════════════════════
function toggleMenu() {
    document.getElementById('navLinks').classList.toggle('open');
}

// ═══════════════════════════════════════════
// PAGE TRANSITIONS (Blur + Fade)
// ═══════════════════════════════════════════
const TRANSITION_DURATION = 500;

// Map: extensionless URL → clean display URL (for browser bar)
const cleanUrlMap = {
    '/': '/',
    '/pages/blog': '/pages/blog',
    '/pages/services': '/pages/blog',
    '/pages/portfolio': '/pages/portfolio',
    '/pages/pricing': '/pages/pricing',
    '/pages/shop': '/pages/shop',
    '/pages/about': '/pages/about',
    '/pages/privacy': '/pages/privacy'
};

// On page load: check if we should animate in
const mainEl = document.querySelector('main');
if (mainEl && sessionStorage.getItem('page-transition') === 'true') {
    mainEl.classList.add('page-enter');
    sessionStorage.removeItem('page-transition');

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            mainEl.classList.remove('page-enter');
        });
    });
}

// Intercept internal link clicks for transition
document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto') || href === '') return;

    // Strip hash to get clean pathname
    const cleanPath = href.split('#')[0];
    const hash = href.includes('#') ? '#' + href.split('#')[1] : '';

    // Check if this is a known internal page (normalize leading slash for matching)
    const matchPath = cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath;
    const targetUrl = cleanUrlMap[matchPath];
    
    // If we're on file:// protocol, let the browser handle navigation normally to avoid absolute path issues
    if (!targetUrl || window.location.protocol === 'file:') return;

    // Don't intercept if Ctrl/Cmd/Shift clicked (open in new tab)
    if (e.ctrlKey || e.metaKey || e.shiftKey) return;

    // Close mobile menu if open
    const navLinks = document.getElementById('navLinks');
    if (navLinks && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
    }

    e.preventDefault();
    sessionStorage.setItem('page-transition', 'true');

    const finalUrl = targetUrl + hash;

    if (mainEl) {
        mainEl.classList.add('page-exit');
        setTimeout(() => {
            window.location.href = finalUrl;
        }, TRANSITION_DURATION);
    } else {
        window.location.href = finalUrl;
    }
});

// ═══════════════════════════════════════════
// SCROLL EFFECTS
// ═══════════════════════════════════════════
window.addEventListener('scroll', () => {
    const btn = document.getElementById('backToTop');
    if (btn) {
        const bodyH = document.body.scrollHeight;
        const winH = window.innerHeight;
        const maxScroll = bodyH - winH;
        const threshold = maxScroll * 0.6;
        if (window.scrollY >= threshold) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    }
});


// ═══════════════════════════════════════════
// INTERSECTION OBSERVER FOR ANIMATIONS
// ═══════════════════════════════════════════
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.animate-in, .shadow-reveal').forEach(el => observer.observe(el));

// ═══════════════════════════════════════════
// MASK REVEAL EFFECT ON HERO ZONES
// ═══════════════════════════════════════════
const RADIUS = 94;
const BLUR = 30;

document.querySelectorAll('.hero-mask-zone').forEach(zone => {
    const reveal = zone.querySelector('.reveal-img');
    if (!reveal) return;

    let currentRadius = 0;
    let targetRadius = 0;
    let animFrame = null;

    function animate() {
        const diff = targetRadius - currentRadius;
        if (Math.abs(diff) < 0.5) {
            currentRadius = targetRadius;
        } else {
            currentRadius += diff * 0.15;
        }
        reveal.style.setProperty('--mr', currentRadius + 'px');
        reveal.style.setProperty('--blur', (currentRadius > 0 ? BLUR : 0) + 'px');

        if (Math.abs(targetRadius - currentRadius) > 0.5) {
            animFrame = requestAnimationFrame(animate);
        }
    }

    zone.addEventListener('mouseenter', () => {
        reveal.classList.add('active');
        targetRadius = RADIUS;
        cancelAnimationFrame(animFrame);
        animFrame = requestAnimationFrame(animate);
    });

    zone.addEventListener('mousemove', (e) => {
        const rect = zone.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const pctX = (x / rect.width) * 100;
        const pctY = (y / rect.height) * 100;
        reveal.style.setProperty('--mx', pctX + '%');
        reveal.style.setProperty('--my', pctY + '%');
    });

    zone.addEventListener('mouseleave', () => {
        reveal.classList.remove('active');
        targetRadius = 0;
        cancelAnimationFrame(animFrame);
        animFrame = requestAnimationFrame(animate);
    });
});

// ═══════════════════════════════════════════
// DYNAMIC TEXT ROTATION
// ═══════════════════════════════════════════
const words = ["строят", "ускоряют", "развивают"];
let currentIndex = 0;
const rotatingText = document.getElementById('rotating-text');

if (rotatingText) {
    function rotateText() {
        rotatingText.classList.add('fade-out');

        setTimeout(() => {
            currentIndex = (currentIndex + 1) % words.length;
            rotatingText.textContent = words[currentIndex];

            rotatingText.classList.remove('fade-out');
            rotatingText.classList.add('fade-in');

            setTimeout(() => {
                rotatingText.classList.remove('fade-in');
            }, 400);
        }, 400);
    }

    setInterval(rotateText, 3000);
}