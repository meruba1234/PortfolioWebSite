/* ==========================================================================
   SkillShowcase — Shared UI JS
   - Dark mode toggle (persist in localStorage)
   - Mobile hamburger navigation
   - Scroll-to-top button
   - IntersectionObserver-based fade-in reveals
   - Active nav link highlighting
   ========================================================================== */

(function () {
    'use strict';

    /* ==== Theme Toggle =============================================== */

    const THEME_KEY = 'skillshowcase-theme';
    const html = document.documentElement;

    function applyTheme(theme) {
        if (theme === 'dark' || theme === 'light') {
            html.setAttribute('data-theme', theme);
        } else {
            html.removeAttribute('data-theme');
        }
    }

    // Apply saved theme immediately (before DOMContentLoaded to avoid flash)
    try {
        const saved = localStorage.getItem(THEME_KEY);
        if (saved) applyTheme(saved);
    } catch (e) { /* ignore */ }

    function toggleTheme() {
        const current = html.getAttribute('data-theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const effective = current || (prefersDark ? 'dark' : 'light');
        const next = effective === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* ignore */ }
    }

    /* ==== Init on DOM ready ========================================== */

    function ready(fn) {
        if (document.readyState !== 'loading') fn();
        else document.addEventListener('DOMContentLoaded', fn);
    }

    ready(function () {
        // Theme toggle button
        const themeBtn = document.querySelector('.theme-toggle');
        if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

        // Mobile nav toggle
        const navToggle = document.querySelector('.nav-toggle');
        const navList = document.querySelector('nav ul');
        if (navToggle && navList) {
            navToggle.addEventListener('click', function () {
                navList.classList.toggle('open');
                const expanded = navList.classList.contains('open');
                navToggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
            });
            // Close mobile nav on link click
            navList.querySelectorAll('a').forEach(function (a) {
                a.addEventListener('click', function () {
                    if (navList.classList.contains('open')) {
                        navList.classList.remove('open');
                        navToggle.setAttribute('aria-expanded', 'false');
                    }
                });
            });
        }

        // Active nav link highlighting
        const currentPath = window.location.pathname.split('/').pop() || 'portfolio.html';
        document.querySelectorAll('nav a').forEach(function (a) {
            const href = a.getAttribute('href');
            if (!href) return;
            const linkPath = href.split('/').pop();
            if (linkPath === currentPath) {
                a.setAttribute('aria-current', 'page');
            }
            // For case-XX.html pages, highlight "業務改善実績"
            if (currentPath.startsWith('case-') && linkPath === 'business-cases.html') {
                a.setAttribute('aria-current', 'page');
            }
        });

        // Scroll to top button
        const toTop = document.querySelector('.to-top');
        if (toTop) {
            const onScroll = function () {
                if (window.scrollY > 300) toTop.classList.add('visible');
                else toTop.classList.remove('visible');
            };
            window.addEventListener('scroll', onScroll, { passive: true });
            onScroll();
            toTop.addEventListener('click', function (e) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        // Fade-in reveals via IntersectionObserver
        if ('IntersectionObserver' in window) {
            const targets = document.querySelectorAll('section, .case-card, .stat-card, .timeline-item');
            targets.forEach(function (el) { el.classList.add('reveal'); });
            const io = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        io.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
            targets.forEach(function (el) { io.observe(el); });
        }
    });
})();
