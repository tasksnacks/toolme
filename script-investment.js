function getTiming() {
  const radios = document.querySelectorAll('input[name="invTiming"]');
  for (const r of radios) {
    if (r.checked) return r.value;
  }
  return "end";
}

function formatMoney(value) {
  return value.toFixed(2) + " €";
}

function calculateInvestment() {
  const startAmount = parseFloat(document.getElementById("invStart").value) || 0;
  const years = parseFloat(document.getElementById("invYears").value) || 0;
  const rate = parseFloat(document.getElementById("invRate").value) || 0;
  const compound = document.getElementById("invCompound").value;
  const contribAmount = parseFloat(
    document.getElementById("invContribution").value
  ) || 0;
  const contribFreq = document.getElementById("invContributionFreq").value;
  const timing = getTiming();

  if (years <= 0) {
    alert("Please enter a positive investment length in years.");
    return;
  }
  if (rate < 0) {
    alert("Please enter a non-negative return rate.");
    return;
  }
  if (startAmount <= 0 && contribAmount <= 0) {
    alert("Please enter a starting amount or a contribution amount.");
    return;
  }

  const annualRate = rate / 100;

  // Decide simulation frequency
  let periodsPerYear = 1;
  if (compound === "monthly" || contribFreq === "monthly") {
    periodsPerYear = 12;
  }

  const totalPeriods = Math.round(years * periodsPerYear);
  const periodRate = annualRate / periodsPerYear;

  let balance = startAmount;
  let totalContributions = startAmount;
  let totalInterest = 0;

  // For yearly schedule
  const schedule = [];
  let currentYear = 1;
  let yearDeposit = startAmount;
  let yearInterest = 0;

  for (let period = 1; period <= totalPeriods; period++) {
    const isContributionPeriod =
      (contribFreq === "monthly" && periodsPerYear === 12) ||
      (contribFreq === "yearly" &&
        (period % periodsPerYear === 1 || periodsPerYear === 1));

    // Contribution at beginning
    if (contribAmount > 0 && isContributionPeriod && timing === "beginning") {
      balance += contribAmount;
      totalContributions += contribAmount;
      yearDeposit += contribAmount;
    }

    // Interest
    const interest = balance * periodRate;
    balance += interest;
    totalInterest += interest;
    yearInterest += interest;

    // Contribution at end
    if (contribAmount > 0 && isContributionPeriod && timing === "end") {
      balance += contribAmount;
      totalContributions += contribAmount;
      yearDeposit += contribAmount;
    }

    // End of a year? record schedule row
    if (period % periodsPerYear === 0 || period === totalPeriods) {
      schedule.push({
        year: currentYear,
        deposit: yearDeposit,
        interest: yearInterest,
        ending: balance
      });
      currentYear++;
      yearDeposit = 0;
      yearInterest = 0;
    }
  }

  // Update result fields
  document.getElementById("invEndBalance").textContent = formatMoney(balance);
  document.getElementById("invStartOut").textContent =
    formatMoney(startAmount);
  document.getElementById("invTotalContrib").textContent =
    formatMoney(totalContributions - startAmount); // contributions after start
  document.getElementById("invTotalInterest").textContent =
    formatMoney(totalInterest);

  document.getElementById("invResults").style.display = "block";

  // Build schedule table
  const tbody = document
    .getElementById("invScheduleTable")
    .querySelector("tbody");
  tbody.innerHTML = "";

  schedule.forEach((row) => {
    const tr = document.createElement("tr");

    const tdYear = document.createElement("td");
    tdYear.textContent = row.year;

    const tdDep = document.createElement("td");
    tdDep.textContent = formatMoney(row.deposit);

    const tdInt = document.createElement("td");
    tdInt.textContent = formatMoney(row.interest);

    const tdEnd = document.createElement("td");
    tdEnd.textContent = formatMoney(row.ending);

    tr.appendChild(tdYear);
    tr.appendChild(tdDep);
    tr.appendChild(tdInt);
    tr.appendChild(tdEnd);
    tbody.appendChild(tr);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("invCalcBtn");
  if (btn) btn.addEventListener("click", calculateInvestment);
});
