/*
 * FILE: assets/js/core.js
 * ROLE: Bootstraps includes first, then initializes navigation, dropdowns, and the mobile menu.
 */

import { initNav } from './components/nav.js';
import { initDropdowns } from './components/dropdowns.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 1) Load shared partials (mobile menu include)
        //await loadSharedIncludes();

        // 2) Initialize core components (now that include is in the DOM)
        await loadHeaderFooter();
        fixHomeLinks();
        initNav();
        initDropdowns();
    } catch (e) {
        console.error('[core] Init failed:', e);
    }
});


async function loadHeaderFooter() {
    const headerContainer = document.getElementById("site-header");
    const footerContainer = document.getElementById("site-footer");

    if (!headerContainer && !footerContainer) return;

    try {
        // ✅ Use resolvePath so it works locally & online
        if (headerContainer) {
            const headerRes = await fetch(resolvePath("/pages/components/header.html"));
            const headerHTML = await headerRes.text();
            headerContainer.innerHTML = headerHTML;
        }

        if (footerContainer) {
            const footerRes = await fetch(resolvePath("/pages/components/footer.html"));
            const footerHTML = await footerRes.text();
            footerContainer.innerHTML = footerHTML;
        }

    } catch (e) {
        console.error("[include] Failed to load header/footer:", e);
    }
}


// Dynamically resolve correct root path for local file:// vs hosted https://
function resolvePath(path) {
    const isLocal = window.location.protocol === "file:";
    return isLocal ? `..${path}` : path;
}


function fixHomeLinks() {
    try {
        const links = document.querySelectorAll('[data-home]');
        console.debug(`[fixHomeLinks] Found ${links.length} home link(s)`);

        if (!links.length) {
            console.warn("[fixHomeLinks] No elements found with [data-home] attribute");
            return;
        }

        const path = window.location.pathname;
        const inPages = path.includes("/pages/");
        const newHref = inPages ? "../" : "./";

        console.debug("[fixHomeLinks] Current path:", path);
        console.debug("[fixHomeLinks] In pages folder?", inPages);
        console.debug("[fixHomeLinks] Assigned Home HREF:", newHref);

        links.forEach(link => {
            link.setAttribute("href", newHref);
            console.debug("[fixHomeLinks] Updated link:", link);
        });

        console.info("[fixHomeLinks] ✅ Home links updated successfully.");

    } catch (err) {
        console.error("[fixHomeLinks] ❌ Error updating home links:", err);
    }
}


