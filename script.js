// Map compounding and payment frequencies to numbers & labels

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

function getPeriodicRate(annualRateDecimal, compoundKey, paymentsPerYear) {
  const compound = compoundConfig[compoundKey];

  if (!compound) return annualRateDecimal / paymentsPerYear;

  if (compound.type === "continuous") {
    // continuous compounding: effective rate over 1/payment year
    return Math.exp(annualRateDecimal / paymentsPerYear) - 1;
  }

  const m = compound.periodsPerYear;
  // Convert nominal APR compounded m times per year
  // into effective rate per payment period
  return Math.pow(1 + annualRateDecimal / m, m / paymentsPerYear) - 1;
}

function calculateLoanPayment() {
  const amount = parseFloat(document.getElementById("loanAmount").value);
  const annualRate = parseFloat(document.getElementById("interestRate").value);
  const years = parseFloat(document.getElementById("loanYears").value);
  const compoundKey = document.getElementById("compoundFrequency").value;
  const paymentKey = document.getElementById("paymentFrequency").value;

  if (
    isNaN(amount) || amount <= 0 ||
    isNaN(annualRate) || annualRate < 0 ||
    isNaN(years) || years <= 0
  ) {
    alert("Please enter valid positive numbers for loan amount, rate and term.");
    return;
  }

  const paymentCfg = paymentConfig[paymentKey];
  const paymentsPerYear = paymentCfg.periodsPerYear;
  const n = years * paymentsPerYear; // total number of payments

  const rAnnualDecimal = annualRate / 100;
  const rPeriod = getPeriodicRate(rAnnualDecimal, compoundKey, paymentsPerYear);

  let paymentPerPeriod;

  if (rPeriod === 0) {
    paymentPerPeriod = amount / n;
  } else {
    // Standard amortization formula with per-period rate and n payments
    paymentPerPeriod =
      amount * (rPeriod * Math.pow(1 + rPeriod, n)) /
      (Math.pow(1 + rPeriod, n) - 1);
  }

  const totalPaid = paymentPerPeriod * n;
  const totalInterest = totalPaid - amount;

  // Update UI
  document.getElementById("paymentLabel").textContent = paymentCfg.label;
  document.getElementById("periodicPayment").textContent =
    paymentPerPeriod.toFixed(2) + " €";
  document.getElementById("numPayments").textContent = n.toFixed(0);
  document.getElementById("totalPaid").textContent = totalPaid.toFixed(2) + " €";
  document.getElementById("totalInterest").textContent = totalInterest.toFixed(2) + " €";
  document.getElementById("results").style.display = "block";
}

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("calcBtn").addEventListener("click", calculateLoanPayment);
});
