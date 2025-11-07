/*
 * FILE: assets/js/components/page_toc.js
 * ROLE: Floating Page Table of Contents (LUXE-GLASS, POS-L)
 * FEATURES:
 *   ✓ Auto-build TOC from .flashy-section h2
 *   ✓ 28% top-screen highlight trigger (H56 offset applied)
 *   ✓ Soft-Lock: No auto-highlight until user scrolls slightly
 *   ✓ Re-Glow Title → Soft Neutral after section highlight begins
 *   ✓ U2: Allow highlight change on upward scroll
 */

export function initPageTOC() {
    console.groupCollapsed("%c[TOC] Init Floating Page TOC", "color:#4db6ac;font-weight:600;");

    const pageTitleEl = document.querySelector('.page-title');
    const headings = document.querySelectorAll('.flashy-section h2');

    if (!headings.length) {
        console.warn("[TOC] ❌ No .flashy-section h2 elements found — TOC cancelled.");
        console.groupEnd();
        return;
    }

    // Build container
    const toc = document.createElement('nav');
    toc.className = 'page-toc page-toc--left';

    // ---- Header (Page Title) ----
    const header = document.createElement('div');
    header.className = 'page-toc__header';

    const titleDiv = document.createElement('div');
    titleDiv.className = 'page-toc__title';

    if (pageTitleEl) {
        titleDiv.textContent = pageTitleEl.textContent.trim();
        console.info("[TOC] ✅ Title Set:", titleDiv.textContent);
    } else {
        titleDiv.textContent = "Home";
        console.warn("[TOC] ⚠️ No .page-title element found — default title used.");
    }

    header.appendChild(titleDiv);

    const divider = document.createElement('div');
    divider.className = 'page-toc__divider';
    header.appendChild(divider);

    toc.appendChild(header);

    // ---- Build List of Links ----
    const list = document.createElement('ul');
    const tocLinks = [];

    headings.forEach((heading, index) => {
        const text = heading.textContent.trim();
        const slug = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const section = heading.closest('.flashy-section');

        if (!section) return;

        if (!section.id) section.id = slug || `section-${index}`;

        const li = document.createElement('li');
        li.innerHTML = `<a href="#${section.id}">${text}</a>`;
        list.appendChild(li);

        const link = li.querySelector('a');
        tocLinks.push({ link, section });

        // Smooth scroll with 60px offset (header safe)
        link.addEventListener('click', (e) => {
            e.preventDefault();
            console.info(`[TOC] 🧭 Click → ${section.id}`);

            const y = section.getBoundingClientRect().top + window.scrollY - 60;

            window.scrollTo({ top: y, behavior: 'smooth' });

            setActiveLink(link);
            markAsUserScrolled();
        });
    });

    toc.appendChild(list);
    document.body.appendChild(toc);
    console.info("[TOC] ✅ TOC Injected");

    // ---- State Flags ----
    let userHasScrolled = false;
    let titleNeutralized = false;

    function markAsUserScrolled() {
        if (!userHasScrolled) {
            userHasScrolled = true;
            titleDiv.classList.add('soft-active'); // Re-glow
            console.info("[TOC] 🟢 Soft-Lock released — auto-highlight enabled");
            setTimeout(() => {
                titleDiv.classList.remove('soft-active');
                titleDiv.classList.add('neutral');
                console.info("[TOC] 🎨 Title softened (Neutral)");
            }, 900);
        }
    }

    function setActiveLink(activeLink) {
        tocLinks.forEach(item => item.link.classList.remove('active'));
        if (activeLink) activeLink.classList.add('active');
    }

    // ---- On Scroll: Activate Auto-Highlight ----
    window.addEventListener('scroll', () => {
        if (!userHasScrolled && window.scrollY > 60) {
            markAsUserScrolled();
        }
        if (userHasScrolled) runHighlightCheck();
    });

    // ---- Highlight Logic (T2 28% Rule + Upward Allowed) ----
    function runHighlightCheck() {
        const triggerLine = window.innerHeight * 0.28;
        let bestMatch = null;
        let smallestDiff = Infinity;

        tocLinks.forEach(({ link, section }) => {
            const rect = section.getBoundingClientRect();
            const distance = Math.abs(rect.top - triggerLine);

            // Section must be above or near the trigger line
            if (rect.top <= triggerLine) {
                if (distance < smallestDiff) {
                    smallestDiff = distance;
                    bestMatch = link;
                }
            }
        });

        if (bestMatch) {
            setActiveLink(bestMatch);
        }
    }

    console.groupEnd();
}
