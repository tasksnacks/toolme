/* Helper: Format number as Currency (USD) */
const moneyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
});

function formatMoney(value) {
    return moneyFormatter.format(value);
}

/* Helper: Get Radio Value */
function getTiming() {
    const radios = document.querySelectorAll('input[name="invTiming"]');
    for (const r of radios) {
        if (r.checked) return r.value;
    }
    return "end";
}

/* Main Calculation Function */
function calculateInvestment() {
    // 1. Get Elements
    const elStart = document.getElementById("invStart");
    const elYears = document.getElementById("invYears");
    const elRate = document.getElementById("invRate");
    const elContrib = document.getElementById("invContribution");
    
    // 2. Parse Values
    const startAmount = parseFloat(elStart.value) || 0;
    const years = parseFloat(elYears.value) || 0;
    const rate = parseFloat(elRate.value) || 0;
    const compound = document.getElementById("invCompound").value;
    const contribAmount = parseFloat(elContrib.value) || 0;
    const contribFreq = document.getElementById("invContributionFreq").value;
    const timing = getTiming();

    // 3. Reset Validations
    [elStart, elYears, elRate].forEach(el => el.style.borderColor = "");

    // 4. Validate Inputs (Highlight Red if invalid)
    let isValid = true;
    if (years <= 0) {
        elYears.style.borderColor = "#ef4444";
        isValid = false;
    }
    if (rate < 0) {
        elRate.style.borderColor = "#ef4444";
        isValid = false;
    }
    if (startAmount <= 0 && contribAmount <= 0) {
        elStart.style.borderColor = "#ef4444";
        isValid = false;
    }

    if (!isValid) return; // Stop if validation fails

    // 5. Setup Calculation Variables
    const annualRate = rate / 100;
    
    // Determine simulation frequency (step size)
    // If either compounding or contribution is monthly, we calculate monthly.
    let periodsPerYear = 1;
    if (compound === "monthly" || contribFreq === "monthly") {
        periodsPerYear = 12;
    }

    const totalPeriods = Math.round(years * periodsPerYear);
    const periodRate = annualRate / periodsPerYear;

    let balance = startAmount;
    let totalContributions = 0; // Tracks additional contributions only
    let totalInterest = 0;

    // For Table Schedule
    const schedule = [];
    let currentYear = 1;
    let yearDeposit = 0;
    let yearInterest = 0;
    
    // Special handling: The "Start Amount" counts as a deposit in Year 1 for the table view
    // but we track it separately from "Additional Contributions"
    let yearStartBalance = startAmount;

    // 6. Calculation Loop
    for (let period = 1; period <= totalPeriods; period++) {
        // Check if we should contribute this period
        const isContributionPeriod = 
            (contribFreq === "monthly" && periodsPerYear === 12) ||
            (contribFreq === "yearly" && (period % periodsPerYear === 1 || periodsPerYear === 1));

        // --- Contribution (Beginning) ---
        if (contribAmount > 0 && isContributionPeriod && timing === "beginning") {
            balance += contribAmount;
            totalContributions += contribAmount;
            yearDeposit += contribAmount;
        }

        // --- Interest Calculation ---
        const interest = balance * periodRate;
        balance += interest;
        totalInterest += interest;
        yearInterest += interest;

        // --- Contribution (End) ---
        if (contribAmount > 0 && isContributionPeriod && timing === "end") {
            balance += contribAmount;
            totalContributions += contribAmount;
            yearDeposit += contribAmount;
        }

        // --- Year End Logic (for Table) ---
        if (period % periodsPerYear === 0 || period === totalPeriods) {
            schedule.push({
                year: currentYear,
                deposit: yearDeposit + (currentYear === 1 ? startAmount : 0), // Include start amount visually in year 1
                interest: yearInterest,
                ending: balance
            });
            currentYear++;
            yearDeposit = 0;
            yearInterest = 0;
        }
    }

    // 7. Update Results Summary
    document.getElementById("invEndBalance").textContent = formatMoney(balance);
    document.getElementById("invStartOut").textContent = formatMoney(startAmount);
    document.getElementById("invTotalContrib").textContent = formatMoney(totalContributions);
    document.getElementById("invTotalInterest").textContent = formatMoney(totalInterest);

    document.getElementById("invResults").style.display = "block";

    // 8. Build Table
    const tbody = document.getElementById("invScheduleTable").querySelector("tbody");
    tbody.innerHTML = "";

    schedule.forEach((row) => {
        const tr = document.createElement("tr");

        const tdYear = document.createElement("td");
        tdYear.textContent = row.year;
        tdYear.style.fontWeight = "600";

        const tdDep = document.createElement("td");
        tdDep.textContent = formatMoney(row.deposit);

        const tdInt = document.createElement("td");
        tdInt.textContent = formatMoney(row.interest);
        tdInt.style.color = "#22c55e"; // Green for interest

        const tdEnd = document.createElement("td");
        tdEnd.textContent = formatMoney(row.ending);
        tdEnd.style.fontWeight = "600";

        tr.appendChild(tdYear);
        tr.appendChild(tdDep);
        tr.appendChild(tdInt);
        tr.appendChild(tdEnd);
        tbody.appendChild(tr);
    });
}

/* Event Listener */
document.addEventListener("DOMContentLoaded", function () {
    const btn = document.getElementById("invCalcBtn");
    if (btn) btn.addEventListener("click", calculateInvestment);
});
