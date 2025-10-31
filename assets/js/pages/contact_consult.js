/*
 * FILE: assets/js/pages/contact.js
 * ROLE: Handles the contact form submission process, including client-side validation and POSTing data to the Netlify Function.
 * HOW TO MODIFY: Update form field validation rules or adjust the success/error UI presentation.
 * EXTENSION POINTS: Easily swap the fetch endpoint to a different serverless function or API. Add reCAPTCHA logic here.
 */

/**
 * Handles the contact form submission.
 */
export function initContactForm() {
    const form = document.getElementById('contact-form');
    const statusMessage = document.getElementById('form-status');

    if (!form || !statusMessage) {
        console.error('Contact form or status message element not found.');
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        statusMessage.textContent = 'Submitting...';
        statusMessage.setAttribute('aria-live', 'assertive');

        // 1. Client-side Validation (Simple example)
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        if (!data.name || !data.email || !data.topic || !data.message) {
            statusMessage.textContent = 'Please fill out all required fields (Name, Email, Topic, Message).';
            statusMessage.style.color = 'var(--teal-400)'; // Use a brand color for error
            return;
        }

        // 2. POST to Netlify Function
        try {
            const response = await fetch('/.netlify/functions/submit-form', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok && result.ok) {
                statusMessage.textContent = 'Success! Your message has been sent. We will be in touch soon.';
                statusMessage.style.color = 'var(--teal-400)';
                form.reset();
            } else {
                // Server-side error
                statusMessage.textContent = `Error: Submission failed. Please try again later. (Details: ${result.error || 'Unknown error'})`;
                statusMessage.style.color = 'red';
            }
        } catch (error) {
            // Network or fetch error
            statusMessage.textContent = 'Error: Could not connect to the server. Please check your internet connection.';
            statusMessage.style.color = 'red';
            console.error('Fetch error:', error);
        }
    });

    // --- EXTENSION POINT: Airtable/reCAPTCHA ---
    // To switch to Airtable, replace the fetch URL and payload structure above.
    // To add reCAPTCHA, implement the token generation before the fetch call and include it in the payload.
    // The serverless function would then need to verify the token.
}

// Note: This function will be called from pages/contact.html
