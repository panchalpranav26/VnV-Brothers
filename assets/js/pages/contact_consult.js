/*
 * FILE: assets/js/pages/contact_consult.js
 * ROLE: Handles contact form submission with enhanced UX + validation + POST to Netlify Function
 */

export function initContactForm() {
    const form = document.getElementById('contact-form');
    const statusMessage = document.getElementById('form-status');

    if (!form || !statusMessage) {
        console.error('[Contact Form] Form or status element not found.');
        return;
    }

    // ✅ Add UX: Real-time validation feedback
    const requiredFields = ["name", "email", "topic", "message"];
    requiredFields.forEach(id => {
        const input = document.getElementById(id);
        input.addEventListener("blur", () => validateField(input));
        input.addEventListener("input", () => validateField(input));
    });

    function validateField(input) {
        if (!input.value.trim()) {
            input.style.border = "2px solid #d9534f"; // red
        } else {
            input.style.border = "2px solid #0DB2AF"; // teal
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        console.groupCollapsed('%c[Contact Form] Submit triggered', 'color: teal; font-weight:bold;');

        // Clear previous status
        statusMessage.textContent = "";
        statusMessage.style.color = 'var(--muted)';
        console.debug('[Contact Form] Cleared previous status message');

        // Validate required fields before sending
        let hasError = false;
        requiredFields.forEach(id => {
            const input = document.getElementById(id);
            if (!input.value.trim()) {
                console.debug(`[Validation] Missing required field: ${id}`);
                validateField(input);
                hasError = true;
            }
        });

        if (hasError) {
            console.warn('[Validation] Missing required fields → aborting submit');
            statusMessage.textContent = '⚠️ Please fill in all required fields.';
            statusMessage.style.color = 'red';
            console.groupEnd();
            return;
        }

        // Build form data object
        const data = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            topic: document.getElementById('topic').value,
            message: document.getElementById('message').value.trim(),
        };

        console.debug('[Payload] Sending data to Netlify function:', data);

        // Disable button + show spinner
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="spinner"></span> Sending...`;
        console.debug('[UI] Submit button disabled & spinner shown');

        const url = '/.netlify/functions/submit-form';
        console.debug('[Network] Fetching:', url);

        console.debug('[Network] Full URL:', `${window.location.origin}${url}`);

        try {
            console.time('[Fetch Timer]');
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            console.timeEnd('[Fetch Timer]');

            console.debug('[Network] Response Status:', response.status, response.statusText);

            // Log response headers
            const headersObj = {};
            response.headers.forEach((v, k) => headersObj[k] = v);
            console.debug('[Network] Response Headers:', headersObj);

            let resData = null;

            // ✅ If not JSON, log raw body to show Netlify error page
            const contentType = response.headers.get('content-type');
            console.debug('[Network] Content-Type:', contentType);

            if (!contentType || !contentType.includes('application/json')) {
                const rawText = await response.clone().text();
                console.error('[Network] ❌ Non-JSON response received. Raw body:', rawText);
                statusMessage.textContent = `❌ Server returned non-JSON response (${response.status}).`;
                statusMessage.style.color = 'red';
                return;
            }

            try {
                resData = await response.json();
                console.debug('[Network] Parsed JSON:', resData);
            } catch (jsonErr) {
                console.error('[Contact Form] ❌ JSON.parse failed:', jsonErr);
                return;
            }

            if (response.ok && resData.ok) {
                console.info('[Success] ✅ Form submitted successfully');
                statusMessage.textContent = '✅ Message sent! Check your email for confirmation.';
                statusMessage.style.color = 'var(--teal-400)';
                form.reset();

                requiredFields.forEach(id => {
                    document.getElementById(id).style.border = "";
                });

            } else {
                console.warn('[Failure] ⚠️ Server returned error:', resData);
                statusMessage.textContent = `❌ Failed: ${resData?.error ?? 'Unknown server error'}`;
                statusMessage.style.color = 'red';
            }

        } catch (error) {
            console.error('[Network] ❌ Fetch exception thrown:', error);
            statusMessage.textContent = '❌ Network error. Please try again later.';
            statusMessage.style.color = 'red';
        }


        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.textContent = "Send Message";
        console.debug('[UI] Submit button re-enabled');

        console.groupEnd();
    });

}