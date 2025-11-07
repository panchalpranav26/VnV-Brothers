/**
 * 50/30/20 Budget Calculator
 * @param {string} incomeId - ID of the income input field
 * @param {string} calcBtnId - ID of the calculate button
 * @param {string} needsId - ID of the "Needs" output element
 * @param {string} wantsId - ID of the "Wants" output element
 * @param {string} savingsId - ID of the "Savings" output element
 * @param {string} resultsId - ID of the results container
 */

export function initBudgetCalculator(incomeId, calcBtnId, needsId, wantsId, savingsId, resultsId) {
    const incomeInput = document.getElementById(incomeId);
    const calcBtn = document.getElementById(calcBtnId);
    const needsAmt = document.getElementById(needsId);
    const wantsAmt = document.getElementById(wantsId);
    const savingsAmt = document.getElementById(savingsId);
    const results = document.getElementById(resultsId);

    if (!incomeInput || !calcBtn || !needsAmt || !wantsAmt || !savingsAmt || !results) {
        console.error('Budget calculator: One or more elements not found.');
        return;
    }

    const calculate = () => {
        const income = parseFloat(incomeInput.value) || 0;
        if (income <= 0) {
            results.classList.remove('show');
            return;
        }

        needsAmt.textContent = (income * 0.5).toFixed(2);
        wantsAmt.textContent = (income * 0.3).toFixed(2);
        savingsAmt.textContent = (income * 0.2).toFixed(2);

        results.classList.add('show');
    };

    // Click to calculate
    calcBtn.addEventListener('click', calculate);

    // Press Enter to calculate
    incomeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            calculate();
        }
    });

    // Optional: Recalculate on input change (debounced)
    let timeout;
    incomeInput.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(calculate, 500);
    });
}