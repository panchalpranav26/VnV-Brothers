/*
 * FILE: assets/js/components/nav.js
 * ROLE: Handles desktop navigation accessibility, specifically updating aria-expanded on hover/focus for dropdown buttons.
 * HOW TO MODIFY: Adjust selectors if the main navigation structure changes.
 * EXTENSION POINTS: Add keyboard navigation enhancements (e.g., arrow key support within dropdowns).
 */

/**
 * Handles desktop navigation accessibility: updates aria-expanded on hover/focus
 * for dropdown buttons to ensure screen readers know when menus open.
 */
export function initNav() {
    const desktopMenuButtons = document.querySelectorAll('.menu > li > button.link');

    desktopMenuButtons.forEach((btn) => {
        const li = btn.parentElement;

        // Hover/Mouseenter for visual users
        li.addEventListener('mouseenter', () => {
            btn.setAttribute('aria-expanded', 'true');
        });

        li.addEventListener('mouseleave', () => {
            btn.setAttribute('aria-expanded', 'false');
        });

        // Focus/Blur for keyboard users
        btn.addEventListener('focus', () => {
            btn.setAttribute('aria-expanded', 'true');
        });

        btn.addEventListener('blur', () => {
            // Delay the blur to allow focus to move to the pane content
            setTimeout(() => {
                // Check if the focus is still within the parent li or the pane
                const isFocusInside = li.contains(document.activeElement);
                if (!isFocusInside) {
                    btn.setAttribute('aria-expanded', 'false');
                }
            }, 10);
        });
    });
}
