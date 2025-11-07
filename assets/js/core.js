/*
 * FILE: assets/js/core.js
 * ROLE: Bootstraps layout, loads header/footer, and dynamically
 *       switches between Desktop Nav and Mobile Nav based on screen size.
 *
 * NAV LOGIC:
 *   - Desktop (≥ 981px): initNav()
 *   - Mobile (< 981px): initMobileNav()
 *   - Hard resets when switching modes to avoid duplicate listeners
 */

import { initNav } from './components/nav.js';
import { initMobileNav } from './components/mobile_nav.js';
import { initPageTOC } from './components/page_toc.js';

let currentNavMode = null;      // "desktop" or "mobile"
let mobileNavAPI = null;        // stores return object from initMobileNav()

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 1) Load header & footer HTML fragments
        await loadHeaderFooter();

        // 2) Fix Home links (must run AFTER header loads)
        fixHomeLinks();
        initPageTOC();

    } catch (e) {
        console.error('[core] Init failed:', e);
    }
});

document.addEventListener("header-loaded", () => {
    console.info("[core] 🔔 Header-loaded event received — starting ScreenSizeWatcher…");
    initScreenSizeWatcher();
    initUIEffects();
});



/**
 * Detects current screen mode (Desktop vs Mobile) and switches nav behavior accordingly
 * Includes detailed debug logs to trace mode changes
 */
function initScreenSizeWatcher() {
    const mq = window.matchMedia("(min-width: 981px)");
    let switchCount = 0;
    let lastTrigger = "init";

    function applyNavMode(e) {
        const isDesktop = e.matches;
        const newMode = isDesktop ? "desktop" : "mobile";
        const oldMode = currentNavMode;

        console.groupCollapsed(`[ScreenMode] Triggered by: ${lastTrigger}`);
        console.debug("[ScreenMode] Viewport Width:", window.innerWidth + "px");
        console.debug("[ScreenMode] MediaQuery Matches:", isDesktop);
        console.debug("[ScreenMode] Previous Mode:", oldMode);
        console.debug("[ScreenMode] New Mode:", newMode);

        if (newMode !== oldMode) {
            switchCount++;
            console.info(`[ScreenMode] 🔄 Switching NAV mode: ${oldMode} → ${newMode}`);
            console.debug("[ScreenMode] Switch Count:", switchCount);

            if (isDesktop) {
                switchToDesktopNav();
            } else {
                switchToMobileNav();
            }

            currentNavMode = newMode;
        } else {
            console.info(`[ScreenMode] 🟦 No Change — Still in ${oldMode} mode`);
        }

        console.groupEnd();
        lastTrigger = "resize";
    }

    // Run once on load
    console.log("%c[ScreenMode] Initializing screen size watcher...", "color:#4db6ac;font-weight:600;");
    applyNavMode(mq);

    // Listen for changes
    mq.addEventListener("change", applyNavMode);
}


/* ------------------------------------------
   MODE SWITCHING LOGIC
------------------------------------------- */

/**
 * Switch to Desktop navigation
 */
function switchToDesktopNav() {
    console.groupCollapsed("%c[nav-switch] 🖥️ Switch → DESKTOP", "color:#4fc3f7;font-weight:600;");
    console.info("Triggered function: switchToDesktopNav()");
    console.debug("Current nav mode BEFORE switch:", currentNavMode);

    // Validate state before switching
    if (currentNavMode === "desktop") {
        console.warn("[nav-switch] Already in DESKTOP mode — skipping re-init.");
        console.groupEnd();
        return;
    }

    // Cleanup previous mode
    if (currentNavMode === "mobile") {
        if (mobileNavAPI) {
            console.info("[nav-switch] Cleaning up MOBILE mode before switching…");
            console.debug("Calling mobileNavAPI.resetDesktop() to remove drawers, overlay, and body lock.");
            try {
                mobileNavAPI.resetDesktop();
                console.info("[nav-switch] ✅ Mobile cleanup completed.");
            } catch (err) {
                console.error("[nav-switch] ❌ Error during mobile cleanup:", err);
            }
        } else {
            console.warn("[nav-switch] No mobileNavAPI instance found — nothing to clean.");
        }
        mobileNavAPI = null;
    }

    // Init Desktop Nav
    console.info("[nav-switch] Initializing Desktop Navigation…");
    try {
        initNav();
        currentNavMode = "desktop";
        console.debug("currentNavMode set to:", currentNavMode);
        console.info("[nav-switch] ✅ Desktop Nav initialized successfully.");
    } catch (err) {
        console.error("[nav-switch] ❌ Desktop init failed:", err);
    }

    console.groupEnd();
}


/**
 * Switch to Mobile navigation
 */
function switchToMobileNav() {
    console.groupCollapsed("%c[nav-switch] 📱 Switch → MOBILE", "color:#81c784;font-weight:600;");
    console.info("Triggered function: switchToMobileNav()");
    console.debug("Current nav mode BEFORE switch:", currentNavMode);

    // Validate state before switching
    if (currentNavMode === "mobile") {
        console.warn("[nav-switch] Already in MOBILE mode — skipping re-init.");
        console.groupEnd();
        return;
    }

    // Cleanup desktop mode (future-proofing)
    if (currentNavMode === "desktop") {
        console.info("[nav-switch] (Optional) Desktop cleanup placeholder!");
        console.debug("If desktop listeners teardown needed, implement here.");
    }

    // Init Mobile Nav
    console.info("[nav-switch] Initializing Mobile Navigation…");
    try {
        setTimeout(() => {
            mobileNavAPI = initMobileNav();
            if (mobileNavAPI?.initMobileMenu) {
                mobileNavAPI.initMobileMenu();
            }
            currentNavMode = "mobile";
            console.debug("mobileNavAPI instance:", mobileNavAPI);
            console.debug("currentNavMode set to:", currentNavMode);
            console.info("[nav-switch] ✅ Mobile Nav initialized successfully.");
        });
    } catch (err) {
        console.error("[nav-switch] ❌ Mobile init failed:", err);
    }

    console.groupEnd();
}



/* ------------------------------------------
   SHARED HELPERS
------------------------------------------- */

/**
 * Loads header.html & footer.html into containers
 */
async function loadHeaderFooter() {
    const headerContainer = document.getElementById("site-header");
    const footerContainer = document.getElementById("site-footer");

    if (!headerContainer && !footerContainer) return;

    try {
        if (headerContainer) {
            const headerRes = await fetch(resolvePath("/pages/components/header.html"));
            const headerHTML = await headerRes.text();
            headerContainer.innerHTML = headerHTML;

            // ✅ Notify that header HTML is now in the DOM
            document.dispatchEvent(new Event("header-loaded"));
            console.info("[include] ✅ Header loaded + event dispatched");
        }

        if (footerContainer) {
            const footerRes = await fetch(resolvePath("/pages/components/footer.html"));
            const footerHTML = await footerRes.text();
            footerContainer.innerHTML = footerHTML;
        }

    } catch (e) {
        console.error("[include] ❌ Failed to load header/footer:", e);
    }
}


/**
 * Resolves correct path for local dev vs hosted
 */
function resolvePath(path) {
    const isLocal = window.location.protocol === "file:";
    return isLocal ? `..${path}` : path;
}


/**
 * Fixes Home link paths based on directory depth
 */
function fixHomeLinks() {
    try {
        const links = document.querySelectorAll('[data-home]');
        console.debug(`[fixHomeLinks] Found ${links.length} home link(s)`);

        if (!links.length) {
            console.warn("[fixHomeLinks] No elements found with [data-home] attribute");
            return;
        }

        const path = window.location.pathname;
        const depth = path.split("/").filter(Boolean).length - 1;
        const prefix = depth > 0 ? "../".repeat(depth) : "./";

        links.forEach(link => link.setAttribute("href", prefix + "index.html"));
        console.info("[fixHomeLinks] ✅ Home links updated successfully.");
    } catch (err) {
        console.error("[fixHomeLinks] ❌ Error updating home links:", err);
    }
}


function loadFeatherIcons() {
    return new Promise((resolve, reject) => {
        if (window.feather) return resolve(); // Already loaded

        const script = document.createElement("script");
        script.src = "https://unpkg.com/feather-icons";
        script.onload = () => {
            console.info("[core] ✅ Feather Icons loaded");
            resolve();
        };
        script.onerror = () => reject("Failed to load Feather Icons");
        document.head.appendChild(script);
    });
}



async function initUIEffects() {
    await loadFeatherIcons();
    // ✅ Render Feather Icons
    if (window.feather) {
        feather.replace();
    } else {
        console.warn("Feather icons not found. Make sure feather.min.js is loaded.");
    }

    // ✅ Scroll Reveal Animation
    const elementsToReveal = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Reveal once
            }
        });
    }, { threshold: 0.15 });

    elementsToReveal.forEach(el => revealObserver.observe(el));
}