/* Helper: Format number as Currency (USD) */
const moneyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
});

function formatMoney(value) {
    return moneyFormatter.format(value);
}

// ---- Configuration for Compounding and Payments ----
const compoundConfig = {
    annually: { type: "discrete", periodsPerYear: 1 },
    semiannually: { type: "discrete", periodsPerYear: 2 },
    quarterly: { type: "discrete", periodsPerYear: 4 },
    monthly: { type: "discrete", periodsPerYear: 12 },
    semimonthly: { type: "discrete", periodsPerYear: 24 },
    biweekly: { type: "discrete", periodsPerYear: 26 },
    weekly: { type: "discrete", periodsPerYear: 52 },
    daily: { type: "discrete", periodsPerYear: 365 },
    continuously: { type: "continuous" }
};

const paymentConfig = {
    every_day: { periodsPerYear: 365, label: "Day" },
    every_week: { periodsPerYear: 52, label: "Week" },
    every_2_weeks: { periodsPerYear: 26, label: "2 Weeks" },
    every_half_month: { periodsPerYear: 24, label: "Half Month" },
    every_month: { periodsPerYear: 12, label: "Month" },
    every_quarter: { periodsPerYear: 4, label: "Quarter" },
    every_6_months: { periodsPerYear: 2, label: "6 Months" },
    every_year: { periodsPerYear: 1, label: "Year" }
};

/* Math Helpers */
function getPeriodicRate(annualRateDecimal, compoundKey, paymentsPerYear) {
    const compound = compoundConfig[compoundKey];
    if (!compound) return annualRateDecimal / paymentsPerYear;

    if (compound.type === "continuous") {
        return Math.exp(annualRateDecimal / paymentsPerYear) - 1;
    }

    const m = compound.periodsPerYear;
    return Math.pow(1 + annualRateDecimal / m, m / paymentsPerYear) - 1;
}

function growthFactor(annualRateDecimal, compoundKey, years) {
    const compound = compoundConfig[compoundKey];
    if (!compound) return 1 + annualRateDecimal * years;

    if (compound.type === "continuous") {
        return Math.exp(annualRateDecimal * years);
    }

    const m = compound.periodsPerYear;
    return Math.pow(1 + annualRateDecimal / m, m * years);
}

/* UI Logic */
function hideAllResults() {
    document.getElementById("results-amortized").style.display = "none";
    document.getElementById("results-deferred").style.display = "none";
    document.getElementById("results-bond").style.display = "none";
}

function onLoanTypeChange() {
    const type = document.getElementById("loanType").value;
    const description = document.getElementById("loanTypeDescription");
    const amountLabel = document.getElementById("amountLabel");
    const paybackRow = document.getElementById("paybackRow");

    hideAllResults();

    if (type === "amortized") {
        description.textContent = "Amortized loan: Pay back a fixed amount regularly until the loan is fully repaid.";
        amountLabel.textContent = "Loan Amount ($)";
        paybackRow.style.display = "block";
    } else if (type === "deferred") {
        description.textContent = "Deferred payment loan: Interest builds up and you pay everything in one lump sum at the end.";
        amountLabel.textContent = "Loan Amount ($)";
        paybackRow.style.display = "none";
    } else if (type === "bond") {
        description.textContent = "Bond: Find how much money you receive today for a fixed amount you must pay back at maturity.";
        amountLabel.textContent = "Predetermined Due Amount ($)";
        paybackRow.style.display = "none";
    }
}

function calculateLoan() {
    // 1. Get Elements
    const elAmount = document.getElementById("loanAmount");
    const elRate = document.getElementById("interestRate");
    const elYears = document.getElementById("loanYears");
    const elMonths = document.getElementById("loanMonths");

    const loanType = document.getElementById("loanType").value;
    const compoundKey = document.getElementById("compoundFrequency").value;

    // 2. Parse Values
    const amount = parseFloat(elAmount.value);
    const annualRate = parseFloat(elRate.value);
    const years = parseFloat(elYears.value) || 0;
    const months = parseFloat(elMonths.value) || 0;
    const totalYears = years + months / 12;

    // 3. Reset Styles
    [elAmount, elRate, elYears].forEach(el => el.style.borderColor = "");

    // 4. Validation
    let isValid = true;
    if (isNaN(amount) || amount <= 0) {
        elAmount.style.borderColor = "#ef4444";
        isValid = false;
    }
    if (isNaN(annualRate) || annualRate < 0) {
        elRate.style.borderColor = "#ef4444";
        isValid = false;
    }
    if (totalYears <= 0) {
        elYears.style.borderColor = "#ef4444";
        isValid = false;
    }

    if (!isValid) return;

    const rAnnualDecimal = annualRate / 100;
    hideAllResults();

    // 5. Calculation Logic
    if (loanType === "amortized") {
        const paymentKey = document.getElementById("paymentFrequency").value;
        const paymentCfg = paymentConfig[paymentKey];
        const paymentsPerYear = paymentCfg.periodsPerYear;
        const n = totalYears * paymentsPerYear;

        const rPeriod = getPeriodicRate(rAnnualDecimal, compoundKey, paymentsPerYear);

        let paymentPerPeriod;
        if (rPeriod === 0) {
            paymentPerPeriod = amount / n;
        } else {
            paymentPerPeriod = (amount * rPeriod * Math.pow(1 + rPeriod, n)) / (Math.pow(1 + rPeriod, n) - 1);
        }

        const totalPaid = paymentPerPeriod * n;
        const totalInterest = totalPaid - amount;

        document.getElementById("paymentLabel").textContent = paymentCfg.label;
        document.getElementById("periodicPayment").textContent = formatMoney(paymentPerPeriod);
        document.getElementById("numPayments").textContent = Math.ceil(n);
        document.getElementById("totalPaid").textContent = formatMoney(totalPaid);
        document.getElementById("totalInterest").textContent = formatMoney(totalInterest);

        document.getElementById("results-amortized").style.display = "block";

    } else if (loanType === "deferred") {
        let amountDue, totalInterest;
        if (rAnnualDecimal === 0) {
            amountDue = amount;
            totalInterest = 0;
        } else {
            const factor = growthFactor(rAnnualDecimal, compoundKey, totalYears);
            amountDue = amount * factor;
            totalInterest = amountDue - amount;
        }

        document.getElementById("deferredAmountDue").textContent = formatMoney(amountDue);
        document.getElementById("deferredTotalInterest").textContent = formatMoney(totalInterest);

        document.getElementById("results-deferred").style.display = "block";

    } else if (loanType === "bond") {
        let presentValue, totalInterest;
        if (rAnnualDecimal === 0) {
            presentValue = amount;
            totalInterest = 0;
        } else {
            const factor = growthFactor(rAnnualDecimal, compoundKey, totalYears);
            presentValue = amount / factor;
            totalInterest = amount - presentValue;
        }

        document.getElementById("bondPresentValue").textContent = formatMoney(presentValue);
        document.getElementById("bondTotalInterest").textContent = formatMoney(totalInterest);

        document.getElementById("results-bond").style.display = "block";
    }
}

// Attach events once DOM is ready
document.addEventListener("DOMContentLoaded", function () {
    const typeSelect = document.getElementById("loanType");
    if (typeSelect) {
        typeSelect.addEventListener("change", onLoanTypeChange);
    }

    const calcBtn = document.getElementById("calcBtn");
    if (calcBtn) {
        calcBtn.addEventListener("click", calculateLoan);
    }

    // Initialize UI state
    onLoanTypeChange();
});
