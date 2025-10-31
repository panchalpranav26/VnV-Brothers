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

        // Clear previous status
        statusMessage.textContent = "";
        statusMessage.style.color = 'var(--muted)';

        // Validate required fields before sending
        let hasError = false;
        requiredFields.forEach(id => {
            const input = document.getElementById(id);
            if (!input.value.trim()) {
                validateField(input);
                hasError = true;
            }
        });

        if (hasError) {
            statusMessage.textContent = '⚠️ Please fill in all required fields.';
            statusMessage.style.color = 'red';
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

        // Disable button + show spinner
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="spinner"></span> Sending...`;

        try {
            const response = await fetch('/.netlify/functions/submit-form', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const resData = await response.json();

            if (response.ok && resData.ok) {
                statusMessage.textContent = '✅ Message sent! Check your email for confirmation.';
                statusMessage.style.color = 'var(--teal-400)';
                form.reset();

                // Reset styles on success
                requiredFields.forEach(id => {
                    document.getElementById(id).style.border = "";
                });

            } else {
                statusMessage.textContent = `❌ Failed: ${resData.error ?? 'Unknown server error'}`;
                statusMessage.style.color = 'red';
            }

        } catch (error) {
            statusMessage.textContent = '❌ Network error. Please try again later.';
            statusMessage.style.color = 'red';
            console.error('[Contact Form] Fetch error:', error);
        }

        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.textContent = "Send Message";
    });
}