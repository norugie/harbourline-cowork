// Track clicks on phone links, email links, and CTA buttons. The CTA's data-cta attribute is used as the event parameter; the text content is also sent for context.
initClickTracking();

let tour = {};
try {
    tour = JSON.parse(sessionStorage.getItem('hl_tour')) || {};
} catch {
    // Storage blocked or empty: keep the generic message.
}

if (tour.firstName) {
    document.getElementById('thanks-greeting').textContent = `Thanks, ${tour.firstName}.`;
}

if (tour.date) {
    const [y, m, d] = tour.date.split('-').map(Number);
    const date = document.createElement('strong');
    date.textContent = new Date(y, m - 1, d).toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' });
    document.getElementById('thanks-when').replaceChildren('confirm a time on ', date, '.');
}
