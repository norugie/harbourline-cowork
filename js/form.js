
const FORM_ID = 'tour_form';

const localToday = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
};

// A valid submit fires the conversion event and sends the visitor to the thank-you page.
function initTourForm() {
    const form = document.getElementById(FORM_ID);
    const submit = form.querySelector('[type="submit"]');
    const attribution = captureAttribution();

    ATTRIBUTION_KEYS.forEach((key) => {
        form.elements[key].value = attribution[key] || '';
    });
    form.elements.tour_date.min = localToday();

    const setBusy = (busy) => {
        submit.disabled = busy;
        submit.querySelector('.submit-label').hidden = busy;
        submit.querySelector('.submit-busy').hidden = !busy;
    };

    // Back from the thank-you page restores this page from the browser's bfcache, so we need to reset the submit button.
    window.addEventListener('pageshow', (e) => e.persisted && setBusy(false));

    // Track the first input event, which indicates the user has started filling out the form.
    form.addEventListener('input', () => track('form_start', { form_id: FORM_ID }), { once: true });

    // Clicking a plan button sets the hidden space_type field and focuses the name field after a short delay.
    document.querySelectorAll('[data-plan]').forEach((button) => {
        button.addEventListener('click', () => {
            form.elements.space_type.value = button.dataset.plan;
            setTimeout(() => document.getElementById('tour-name').focus({ preventScroll: true }), 400);
        });
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        form.classList.add('was-validated');

        if (!form.checkValidity()) {
            const invalid = [...form.elements].filter((el) => el.willValidate && !el.validity.valid);
            track('form_error', {
                form_id: FORM_ID,
                error_fields: invalid.map((el) => el.name).join(','),
            });
            invalid[0].focus();
            return;
        }

        setBusy(true);
        const data = new FormData(form);

        try {
            sessionStorage.setItem('hl_tour', JSON.stringify({
                firstName: String(data.get('name')).trim().split(/\s+/)[0],
                date: data.get('tour_date') || '',
            }));
        } catch {
            // Storage blocked: the thank-you page falls back to a generic message.
            console.log('Unable to store tour info in sessionStorage');
        }

        await trackThenContinue('generate_lead', {
            form_id: FORM_ID,
            space_type: data.get('space_type'),
            has_tour_date: Boolean(data.get('tour_date')),
            has_click_id: Boolean(attribution.gclid || attribution.gbraid || attribution.wbraid),
        });

        window.location.assign('thank-you/index.html');
    });

    submit.disabled = false;
}
