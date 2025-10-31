/**
 * FILE: netlify/functions/submit_consultation.ts
 * PURPOSE: Handles Consultation Form submissions and sends emails via Brevo
 */

import type { Handler } from "@netlify/functions";

interface ConsultationFormData {
    name: string;
    email: string;
    phone?: string;
    topic: string;
    message: string;
}

const { BREVO_API_KEY, BREVO_FROM_EMAIL, BREVO_TO_EMAIL } = process.env;

export const handler: Handler = async (event) => {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
    };

    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers, body: "OK" };
    }

    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ ok: false, error: "Method Not Allowed" }),
        };
    }

    if (!event.body) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ ok: false, error: "Missing request body" }),
        };
    }

    try {
        const data: ConsultationFormData = JSON.parse(event.body);

        if (!data.name || !data.email || !data.topic || !data.message) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ ok: false, error: "Missing required fields" }),
            };
        }

        if (!BREVO_API_KEY || !BREVO_FROM_EMAIL || !BREVO_TO_EMAIL) {
            console.error("❌ Missing required Brevo environment variables");
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ ok: false, error: "Email service is not configured" }),
            };
        }

        // ---------------- EMAIL to ADMIN ----------------
        const adminPayload = {
            sender: { name: "V&V Brothers Website", email: BREVO_FROM_EMAIL },
            to: [{ email: BREVO_TO_EMAIL }],
            replyTo: { email: data.email, name: data.name },
            subject: `New Consultation Request — ${data.name}`,
            htmlContent: `
        <h2>New Consultation Request</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone || "Not provided"}</p>
        <p><strong>Session Type:</strong> ${data.topic}</p>
        <p><strong>Message:</strong></p>
        <p>${data.message.replace(/\n/g, "<br>")}</p>
      `,
        };

        await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "api-key": BREVO_API_KEY,
                "Content-Type": "application/json",
                accept: "application/json",
            },
            body: JSON.stringify(adminPayload),
        });

        // ---------------- EMAIL to USER ----------------
        const userPayload = {
            sender: { name: "V&V Brothers LLC", email: BREVO_FROM_EMAIL },
            to: [{ email: data.email, name: data.name }],
            subject: "We Received Your Consultation Request ✅",
            htmlContent: `
        <p>Hi ${data.name},</p>
        <p>Thank you for requesting a consultation with <strong>V&V Brothers LLC</strong>.</p>
        <p><strong>Session Type:</strong> ${data.topic}</p>
        <p>We will reach out shortly to coordinate a time that works best for you.</p>
        <p>Warm regards,<br/>V&V Brothers LLC</p>
      `,
        };

        await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "api-key": BREVO_API_KEY,
                "Content-Type": "application/json",
                accept: "application/json",
            },
            body: JSON.stringify(userPayload),
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ ok: true, message: "Consultation request received" }),
        };
    } catch (error: any) {
        console.error("❌ submit_consultation ERROR:", error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ ok: false, error: error.message || "Internal Server Error" }),
        };
    }
};
