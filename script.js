function calculateLoanPayment() {
  const amount = parseFloat(document.getElementById("loanAmount").value);
  const annualRate = parseFloat(document.getElementById("interestRate").value);
  const years = parseFloat(document.getElementById("loanYears").value);

  if (isNaN(amount) || isNaN(annualRate) || isNaN(years) || amount <= 0 || years <= 0) {
    alert("Please enter valid positive numbers for all fields.");
    return;
  }

  const monthlyRate = annualRate / 100 / 12; // convert to monthly decimal
  const n = years * 12; // number of payments

  let monthlyPayment;

  if (monthlyRate === 0) {
    // no interest case
    monthlyPayment = amount / n;
  } else {
    // standard amortization formula
    const r = monthlyRate;
    monthlyPayment = amount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }

  const totalPaid = monthlyPayment * n;
  const totalInterest = totalPaid - amount;

  document.getElementById("monthlyPayment").textContent = monthlyPayment.toFixed(2) + " €";
  document.getElementById("totalPaid").textContent = totalPaid.toFixed(2) + " €";
  document.getElementById("totalInterest").textContent = totalInterest.toFixed(2) + " €";

  document.getElementById("results").style.display = "block";
}

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("calcBtn").addEventListener("click", calculateLoanPayment);
});
