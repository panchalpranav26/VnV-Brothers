/*
 * FILE: assets/js/components/nav.js
 * ROLE: Controls navigation dropdown behavior for desktop & mobile.
 * DESIGN ALIGNMENT:
 *   - Matches updated nav.css + dropdown-pane.css structure
 *   - Works with .nav-item--has-dropdown, .caret-toggle, .dropdown-pane
 * UX RULES (as requested):
 *   ✔ Desktop: Hover opens, hover-out closes
 *   ✔ Desktop: Caret click toggles as well
 *   ✔ Mobile: Caret click toggles only (no hover)
 *   ✔ Auto-close all other dropdowns when one opens
 * ACCESSIBILITY:
 *   - Manages aria-expanded for screen readers
 *   - Keyboard focus opens dropdown, blur closes when leaving
 */

export function initNav() {
    console.info("[nav] Initializing navigation dropdown behavior…");

    const navItems = document.querySelectorAll(".nav-item--has-dropdown");

    if (!navItems.length) {
        console.warn("[nav] No dropdown nav items found. Check markup?");
        return;
    }

    // Media query to detect desktop vs mobile
    const desktopQuery = window.matchMedia("(min-width: 981px)");

    /**
     * Utility: Close all dropdowns
     */
    function closeAllDropdowns() {
        navItems.forEach(item => {
            const caretBtn = item.querySelector(".caret-toggle");
            const pane = item.querySelector(".dropdown-pane");

            if (caretBtn) caretBtn.setAttribute("aria-expanded", "false");
            if (pane) pane.classList.remove("open");
        });
    }

    /**
     * Desktop: Hover handlers
     */
    function enableDesktopBehavior() {
        navItems.forEach(item => {
            const caretBtn = item.querySelector(".caret-toggle");
            const pane = item.querySelector(".dropdown-pane");

            if (!caretBtn || !pane) return;

            // Hover-in: open pane
            item.addEventListener("mouseenter", () => {
                closeAllDropdowns();
                caretBtn.setAttribute("aria-expanded", "true");
                pane.classList.add("open");
            });

            // Hover-out: close pane
            item.addEventListener("mouseleave", () => {
                caretBtn.setAttribute("aria-expanded", "false");
                pane.classList.remove("open");
            });

            // Caret click (Desktop): toggle open/close
            caretBtn.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();

                const isOpen = caretBtn.getAttribute("aria-expanded") === "true";

                // Toggle current, but auto-close others
                closeAllDropdowns();
                caretBtn.setAttribute("aria-expanded", String(!isOpen));
                pane.classList.toggle("open", !isOpen);
            });
        });
    }

    /**
     * Mobile: Click-only behavior
     */
    function enableMobileBehavior() {
        navItems.forEach(item => {
            const caretBtn = item.querySelector(".caret-toggle");
            const pane = item.querySelector(".dropdown-pane");

            if (!caretBtn || !pane) return;

            caretBtn.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();

                const isOpen = caretBtn.getAttribute("aria-expanded") === "true";

                // Toggle current, but auto-close others
                closeAllDropdowns();
                caretBtn.setAttribute("aria-expanded", String(!isOpen));
                pane.classList.toggle("open", !isOpen);
            });
        });
    }

    /**
     * Desktop/ Mobile Switcher
     * Ensures correct behavior when resizing (optional but recommended)
     */
    function applyBehavior(e) {
        // Clear all dropdown states before switching mode
        closeAllDropdowns();

        if (e.matches) {
            console.info("[nav] Desktop mode enabled");
            enableDesktopBehavior();
        } else {
            console.info("[nav] Mobile mode enabled");
            enableMobileBehavior();
        }
    }

    // Initial run
    applyBehavior(desktopQuery);

    // Listen for viewport changes
    desktopQuery.addEventListener("change", applyBehavior);

    console.info("[nav] ✅ Navigation initialized");
}
