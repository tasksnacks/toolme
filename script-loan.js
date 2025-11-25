// ---- configuration for compounding and payments ----
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
  every_day: { periodsPerYear: 365, label: "day" },
  every_week: { periodsPerYear: 52, label: "week" },
  every_2_weeks: { periodsPerYear: 26, label: "2 weeks" },
  every_half_month: { periodsPerYear: 24, label: "half month" },
  every_month: { periodsPerYear: 12, label: "month" },
  every_quarter: { periodsPerYear: 4, label: "quarter" },
  every_6_months: { periodsPerYear: 2, label: "6 months" },
  every_year: { periodsPerYear: 1, label: "year" }
};

// per-payment-period interest rate
function getPeriodicRate(annualRateDecimal, compoundKey, paymentsPerYear) {
  const compound = compoundConfig[compoundKey];
  if (!compound) return annualRateDecimal / paymentsPerYear;

  if (compound.type === "continuous") {
    return Math.exp(annualRateDecimal / paymentsPerYear) - 1;
  }

  const m = compound.periodsPerYear;
  return Math.pow(1 + annualRateDecimal / m, m / paymentsPerYear) - 1;
}

// growth factor over given years (for deferred/bond)
function growthFactor(annualRateDecimal, compoundKey, years) {
  const compound = compoundConfig[compoundKey];
  if (!compound) return 1 + annualRateDecimal * years;

  if (compound.type === "continuous") {
    return Math.exp(annualRateDecimal * years);
  }

  const m = compound.periodsPerYear;
  return Math.pow(1 + annualRateDecimal / m, m * years);
}

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
    description.textContent =
      "Amortized loan: pay back a fixed amount regularly until the loan is fully repaid.";
    amountLabel.firstChild.textContent = "Loan Amount (€)";
    paybackRow.style.display = "block";
  } else if (type === "deferred") {
    description.textContent =
      "Deferred payment loan: interest builds up and you pay everything in one lump sum at the end.";
    amountLabel.firstChild.textContent = "Loan Amount (€)";
    paybackRow.style.display = "none";
  } else if (type === "bond") {
    description.textContent =
      "Bond: find how much money you receive today for a fixed amount you must pay back at maturity.";
    amountLabel.firstChild.textContent = "Predetermined Due Amount (€)";
    paybackRow.style.display = "none";
  }
}

function calculateLoan() {
  const loanType = document.getElementById("loanType").value;

  const amount = parseFloat(document.getElementById("loanAmount").value);
  const annualRate = parseFloat(document.getElementById("interestRate").value);
  const years = parseFloat(document.getElementById("loanYears").value) || 0;
  const months = parseFloat(document.getElementById("loanMonths").value) || 0;
  const compoundKey = document.getElementById("compoundFrequency").value;

  const totalYears = years + months / 12;

  if (
    isNaN(amount) ||
    amount <= 0 ||
    isNaN(annualRate) ||
    annualRate < 0 ||
    totalYears <= 0
  ) {
    alert(
      "Please enter positive numbers for the amount, interest rate and loan term."
    );
    return;
  }

  const rAnnualDecimal = annualRate / 100;
  hideAllResults();

  if (loanType === "amortized") {
    const paymentKey = document.getElementById("paymentFrequency").value;
    const paymentCfg = paymentConfig[paymentKey];
    const paymentsPerYear = paymentCfg.periodsPerYear;
    const n = totalYears * paymentsPerYear;

    const rPeriod = getPeriodicRate(
      rAnnualDecimal,
      compoundKey,
      paymentsPerYear
    );

    let paymentPerPeriod;
    if (rPeriod === 0) {
      paymentPerPeriod = amount / n;
    } else {
      paymentPerPeriod =
        (amount * rPeriod * Math.pow(1 + rPeriod, n)) /
        (Math.pow(1 + rPeriod, n) - 1);
    }

    const totalPaid = paymentPerPeriod * n;
    const totalInterest = totalPaid - amount;

    document.getElementById("paymentLabel").textContent = paymentCfg.label;
    document.getElementById("periodicPayment").textContent =
      paymentPerPeriod.toFixed(2) + " €";
    document.getElementById("numPayments").textContent = n.toFixed(0);
    document.getElementById("totalPaid").textContent =
      totalPaid.toFixed(2) + " €";
    document.getElementById("totalInterest").textContent =
      totalInterest.toFixed(2) + " €";

    document.getElementById("results-amortized").style.display = "block";
  } else if (loanType === "deferred") {
    if (rAnnualDecimal === 0) {
      document.getElementById("deferredAmountDue").textContent =
        amount.toFixed(2) + " €";
      document.getElementById("deferredTotalInterest").textContent = "0.00 €";
    } else {
      const factor = growthFactor(rAnnualDecimal, compoundKey, totalYears);
      const amountDue = amount * factor;
      const totalInterest = amountDue - amount;

      document.getElementById("deferredAmountDue").textContent =
        amountDue.toFixed(2) + " €";
      document.getElementById("deferredTotalInterest").textContent =
        totalInterest.toFixed(2) + " €";
    }

    document.getElementById("results-deferred").style.display = "block";
  } else if (loanType === "bond") {
    if (rAnnualDecimal === 0) {
      document.getElementById("bondPresentValue").textContent =
        amount.toFixed(2) + " €";
      document.getElementById("bondTotalInterest").textContent = "0.00 €";
    } else {
      const factor = growthFactor(rAnnualDecimal, compoundKey, totalYears);
      const presentValue = amount / factor;
      const totalInterest = amount - presentValue;

      document.getElementById("bondPresentValue").textContent =
        presentValue.toFixed(2) + " €";
      document.getElementById("bondTotalInterest").textContent =
        totalInterest.toFixed(2) + " €";
    }

    document.getElementById("results-bond").style.display = "block";
  }
}

// attach events once DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  const typeSelect = document.getElementById("loanType");
  if (typeSelect) {
    typeSelect.addEventListener("change", onLoanTypeChange);
  }

  const calcBtn = document.getElementById("calcBtn");
  if (calcBtn) {
    calcBtn.addEventListener("click", calculateLoan);
  }

  onLoanTypeChange();
});
