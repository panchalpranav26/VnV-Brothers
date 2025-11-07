/*
 * FILE: assets/js/components/mobile_nav.js
 * ROLE: Handles Mobile Navigation (Accordion Drawer)
 *
 * FEATURES:
 *  ✅ Clones desktop menu into mobile drawer
 *  ✅ Accordion-style submenus (auto-collapse siblings)
 *  ✅ Text link navigates, caret expands submenu
 *  ✅ Slide + fade animation supported (CSS in Part 2)
 *  ✅ Debug mode toggle for verbose logging
 *
 * EXPORTS:
 *  initMobileNav() -> returns API with { closeAll, resetDesktop }
 */

export function initMobileNav() {
    const MOBILE_NAV_DEBUG = true;

    const log = (...args) => {
        if (MOBILE_NAV_DEBUG) console.log("[mobile-nav]", ...args);
    };

    log("Initializing Mobile Navigation…");

    // Elements
    const toggleBtn = document.querySelector("#mobile-nav-toggle");
    const mainPanel = document.querySelector("#mobile-nav-panel");
    const overlay = document.querySelector("#mobile-nav-overlay");
    if (!overlay) {
        log("⛔ overlay not found yet — delaying initMobileNav by 1 frame");
        requestAnimationFrame(() => initMobileNav());
        return;
    }
    const mobileMenu = document.querySelector(".mobile-menu");

    if (!toggleBtn || !mainPanel || !overlay || !mobileMenu) {
        console.warn("[mobile-nav] Missing required elements. Init skipped.");
        return;
    }

    let initialized = false;

    /* --------------------------------------------------------------------
       STEP 1: Clone Desktop Menu into Mobile (Run Once)
    -------------------------------------------------------------------- */
    function cloneDesktopMenu() {
        if (initialized) {
            log("Clone skipped (already initialized).");
            return;
        }

        const desktopMenu = document.querySelector(".menu");

        if (!desktopMenu) {
            console.warn("[mobile-nav] Desktop menu not found. Cannot clone.");
            return;
        }

        mobileMenu.innerHTML = desktopMenu.innerHTML;
        initialized = true;
        log(`✅ Cloned ${mobileMenu.children.length} desktop menu item(s) into mobile drawer.`);
    }

    /* --------------------------------------------------------------------
       STEP 2: Transform Parents into Accordion Groups
       Automatically detects <li> items that contain a nested <ul>
    -------------------------------------------------------------------- */
    function setupAccordion() {
        const items = mobileMenu.querySelectorAll("li");

        items.forEach((li) => {
            const submenu = li.querySelector("ul");
            if (!submenu) return; // not a parent item

            // Wrap existing link text, insert caret button
            const link = li.querySelector("a");
            if (!link) return;

            // Create caret button
            const caretBtn = document.createElement("button");
            caretBtn.className = "mobile-caret";
            caretBtn.setAttribute("aria-expanded", "false");
            caretBtn.innerHTML = "▸"; // Chevron Right

            // Insert caret after the link
            link.after(caretBtn);

            // Hide submenu initially
            //submenu.style.display = "none";
            li.classList.add("has-submenu");

            // Caret click expands/collapses
            caretBtn.addEventListener("click", (e) => {
                e.preventDefault();
                const isOpen = caretBtn.getAttribute("aria-expanded") === "true";
                toggleAccordion(li, !isOpen);
            });

            log(`Accordion parent detected: ${link.textContent.trim()}`);
        });

        log("Accordion setup complete.");
    }

    /* --------------------------------------------------------------------
       STEP 3: Accordion Toggle Logic with Auto-Collapse
    -------------------------------------------------------------------- */
    function toggleAccordion(li, open) {
        const caretBtn = li.querySelector(".mobile-caret");
        const submenu = li.querySelector(".dropdown-pane, ul");

        if (!caretBtn || !submenu) return;

        if (open) {
            // Auto-close siblings
            const siblings = li.parentElement.querySelectorAll(".has-submenu");
            siblings.forEach((sib) => {
                if (sib !== li) toggleAccordion(sib, false);
            });

            caretBtn.setAttribute("aria-expanded", "true");
            submenu.classList.add("open");

            log(`📂 Opened: ${li.querySelector("a")?.textContent.trim()}`);
        } else {
            caretBtn.setAttribute("aria-expanded", "false");
            submenu.classList.remove("open");

            log(`📁 Closed: ${li.querySelector("a")?.textContent.trim()}`);
        }
    }



    /* --------------------------------------------------------------------
       STEP 4: Main Drawer Open/Close
    -------------------------------------------------------------------- */
    function openMainDrawer() {
        document.body.classList.add("mobile-nav-open");
        toggleBtn.classList.add("active");
        mainPanel.classList.add("active");
        overlay.classList.add("active");
        log("📱 Drawer opened");
    }

    function closeMainDrawer() {
        document.body.classList.remove("mobile-nav-open");
        toggleBtn.classList.remove("active");
        mainPanel.classList.remove("active");
        overlay.classList.remove("active");

        // Collapse all accordions on close
        const openItems = mobileMenu.querySelectorAll(".has-submenu");
        openItems.forEach((li) => toggleAccordion(li, false));

        log("📱 Drawer closed + accordions reset");
    }

    toggleBtn.addEventListener("click", () => {
        const isOpen = mainPanel.classList.contains("active");
        isOpen ? closeMainDrawer() : openMainDrawer();
    });

    overlay.addEventListener("click", closeMainDrawer);

    /* --------------------------------------------------------------------
       STEP 5: Desktop Reset (Called by core.js when switching modes)
    -------------------------------------------------------------------- */
    function resetDesktop() {
        log("🔄 Resetting for desktop mode");
        closeMainDrawer();
    }

    /* --------------------------------------------------------------------
       PUBLIC API
    -------------------------------------------------------------------- */
    return {
        initMobileMenu: () => {
            cloneDesktopMenu();
            setupAccordion();
        },
        closeAll: closeMainDrawer,
        resetDesktop
    };
}
