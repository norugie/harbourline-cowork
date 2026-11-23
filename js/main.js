// Page behavior. Uses Bootstrap's script (CDN) and js/tracking.js + js/form.js, loaded before this.

initClickTracking();
initTourForm();

// Navbar: transparent over the hero, white once the page scrolls (Bootstrap has no class for this).
const nav = document.querySelector('.site-nav');
const onScroll = () => {
    const scrolled = window.scrollY >= 10;
    nav.classList.toggle('is-scrolled', scrolled);
    nav.dataset.bsTheme = scrolled ? 'light' : 'dark';
};
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Bootstrap only closes the phone menu with the X or the backdrop, so close it on link taps too.
const menu = document.getElementById('site-menu');
menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) bootstrap.Offcanvas.getInstance(menu)?.hide();
});

// Bootstrap ScrollSpy marks the nav link for the section crossing the middle of the screen.
// It watches <html>, not <body>: body's overflow-x: hidden would make it watch the body box instead of the screen.
new bootstrap.ScrollSpy(document.documentElement, {
    target: '#site-links',
    rootMargin: '-45% 0px -54% 0px',
    threshold: [0], // any overlap with that thin middle band counts
});

// ScrollSpy only adds .active, so mirror it into aria-current for screen readers.
// Watching the class also catches ScrollSpy clearing it, which fires no event.
const links = [...document.querySelectorAll('#site-links .nav-link')];
new MutationObserver(() => links.forEach((link) => {
    if (link.classList.contains('active')) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
})).observe(document.getElementById('site-links'), { subtree: true, attributeFilter: ['class'] });

// Sticky "Book a free tour" bar on phones, hidden while the form itself is on screen.
const mobileCta = document.getElementById('mobile-cta');
new IntersectionObserver(([entry]) => {
    const visible = !entry.isIntersecting;
    mobileCta.classList.toggle('is-visible', visible);
    mobileCta.setAttribute('aria-hidden', String(!visible));
    mobileCta.firstElementChild.tabIndex = visible ? 0 : -1;
}).observe(document.getElementById('book'));

document.getElementById('faq-list').addEventListener('show.bs.collapse', (e) => {
    track('faq_open', { faq_question: e.target.previousElementSibling.textContent.trim() });
});
