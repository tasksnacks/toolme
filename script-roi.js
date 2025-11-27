/* Helper: Format number as Currency (USD) */
const moneyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
});

function formatMoney(value) {
    return moneyFormatter.format(value);
}

/* Time Mode Logic */
function getTimeMode() {
    const radios = document.querySelectorAll('input[name="timeMode"]');
    for (const r of radios) {
        if (r.checked) return r.value;
    }
    return "length";
}

function switchTimeMode() {
    const mode = getTimeMode();
    const lengthBlock = document.getElementById("timeLengthBlock");
    const datesBlock = document.getElementById("timeDatesBlock");

    if (mode === "length") {
        lengthBlock.style.display = "block";
        datesBlock.style.display = "none";
    } else {
        lengthBlock.style.display = "none";
        datesBlock.style.display = "block";
    }
}

/* Calculation Helpers */
function calculateYearsFromLength() {
    const years = parseFloat(document.getElementById("timeYears").value) || 0;
    const months = parseFloat(document.getElementById("timeMonths").value) || 0;
    return years + months / 12;
}

function calculateYearsFromDates() {
    const startValue = document.getElementById("startDate").value;
    const endValue = document.getElementById("endDate").value;
    const startInput = document.getElementById("startDate");
    const endInput = document.getElementById("endDate");

    startInput.style.borderColor = "";
    endInput.style.borderColor = "";

    if (!startValue || !endValue) return null;

    const start = new Date(startValue);
    const end = new Date(endValue);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
    
    if (end <= start) {
        startInput.style.borderColor = "#ef4444";
        endInput.style.borderColor = "#ef4444";
        return null;
    }

    const diffMs = end - start;
    // Approximation including leap years
    const diffYears = diffMs / (1000 * 60 * 60 * 24 * 365.25); 
    return diffYears;
}

function formatDurationText(years) {
    if (years <= 0) return "N/A";

    if (years < 1) {
        const months = Math.round(years * 12);
        return months + (months === 1 ? " Month" : " Months");
    }

    const fullYears = Math.floor(years);
    const remainingMonths = Math.round((years - fullYears) * 12);

    let parts = [];
    if (fullYears > 0) {
        parts.push(fullYears + (fullYears === 1 ? " Year" : " Years"));
    }
    if (remainingMonths > 0) {
        parts.push(remainingMonths + (remainingMonths === 1 ? " Month" : " Months"));
    }

    return parts.join(", ");
}

/* Main Calculation */
function calculateRoi() {
    // 1. Get Elements
    const elInvested = document.getElementById("amountInvested");
    const elReturned = document.getElementById("amountReturned");
    
    // 2. Parse Values
    const invested = parseFloat(elInvested.value);
    const returned = parseFloat(elReturned.value);
    const mode = getTimeMode();

    // 3. Reset Styles
    elInvested.style.borderColor = "";
    elReturned.style.borderColor = "";

    // 4. Validation
    let isValid = true;
    if (isNaN(invested) || invested <= 0) {
        elInvested.style.borderColor = "#ef4444";
        isValid = false;
    }
    if (isNaN(returned)) {
        elReturned.style.borderColor = "#ef4444";
        isValid = false;
    }

    if (!isValid) return;

    // 5. Basic ROI Calculation
    const gain = returned - invested;
    const roiDecimal = gain / invested;
    const roiPercent = roiDecimal * 100;

    // 6. Time Calculation
    let years = null;
    if (mode === "length") {
        years = calculateYearsFromLength();
    } else {
        years = calculateYearsFromDates();
    }

    // 7. Update DOM Results
    const resultsBlock = document.getElementById("roiResults");
    const roiPercentEl = document.getElementById("roiPercent");
    const roiGainEl = document.getElementById("roiGain");
    const roiYearsTextEl = document.getElementById("roiYearsText");
    const roiAnnualEl = document.getElementById("roiAnnual");

    roiPercentEl.textContent = roiPercent.toFixed(2) + "%";
    roiGainEl.textContent = formatMoney(gain);

    // 8. Annualized Calculation
    let annualText = "-";
    let yearsText = "Unknown Duration";

    if (years !== null && years > 0) {
        yearsText = formatDurationText(years);
        
        // Annualized Formula: (1 + totalROI)^(1/n) - 1
        // We only calculate this if totalROI is logical (> -100%)
        if (roiDecimal >= -1) {
            const annualDecimal = Math.pow(1 + roiDecimal, 1 / years) - 1;
            const annualPercent = annualDecimal * 100;
            annualText = isFinite(annualPercent) ? annualPercent.toFixed(2) + "%" : "-";
        }
    } else if (mode === "dates") {
        yearsText = "Invalid Dates";
    }

    roiYearsTextEl.textContent = yearsText;
    roiAnnualEl.textContent = annualText;

    resultsBlock.style.display = "block";
}

/* Initialization */
document.addEventListener("DOMContentLoaded", function () {
    // Attach toggle listeners
    const radios = document.querySelectorAll('input[name="timeMode"]');
    radios.forEach((r) => {
        r.addEventListener("change", switchTimeMode);
    });
    
    // Initial state check
    switchTimeMode();

    // Calculate button
    const calcBtn = document.getElementById("calcRoiBtn");
    if (calcBtn) {
        calcBtn.addEventListener("click", calculateRoi);
    }
});
