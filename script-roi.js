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

function calculateYearsFromLength() {
  const years = parseFloat(document.getElementById("timeYears").value) || 0;
  const months = parseFloat(document.getElementById("timeMonths").value) || 0;
  return years + months / 12;
}

function calculateYearsFromDates() {
  const startValue = document.getElementById("startDate").value;
  const endValue = document.getElementById("endDate").value;

  if (!startValue || !endValue) return null;

  const start = new Date(startValue);
  const end = new Date(endValue);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
  if (end <= start) return null;

  const diffMs = end - start;
  const diffYears = diffMs / (1000 * 60 * 60 * 24 * 365.25); // approx
  return diffYears;
}

function formatYears(years) {
  if (years <= 0) return "N/A";

  if (years < 1) {
    const months = Math.round(years * 12);
    return months + (months === 1 ? " month" : " months");
  }

  const fullYears = Math.floor(years);
  const remainingMonths = Math.round((years - fullYears) * 12);

  let parts = [];
  if (fullYears > 0) {
    parts.push(fullYears + (fullYears === 1 ? " year" : " years"));
  }
  if (remainingMonths > 0) {
    parts.push(remainingMonths + (remainingMonths === 1 ? " month" : " months"));
  }

  return parts.join(" ");
}

function calculateRoi() {
  const invested = parseFloat(document.getElementById("amountInvested").value);
  const returned = parseFloat(document.getElementById("amountReturned").value);
  const mode = getTimeMode();

  if (isNaN(invested) || invested <= 0) {
    alert("Please enter a positive amount invested.");
    return;
  }
  if (isNaN(returned)) {
    alert("Please enter the amount returned.");
    return;
  }

  // ROI
  const gain = returned - invested;
  const roiDecimal = gain / invested;
  const roiPercent = roiDecimal * 100;

  // Time
  let years = null;
  if (mode === "length") {
    years = calculateYearsFromLength();
  } else {
    years = calculateYearsFromDates();
  }

  const resultsBlock = document.getElementById("roiResults");
  const roiPercentEl = document.getElementById("roiPercent");
  const roiGainEl = document.getElementById("roiGain");
  const roiYearsTextEl = document.getElementById("roiYearsText");
  const roiAnnualEl = document.getElementById("roiAnnual");

  roiPercentEl.textContent = roiPercent.toFixed(2) + " %";
  roiGainEl.textContent = gain.toFixed(2) + " €";

  let annualText = "N/A";
  let yearsText = "N/A";

  if (years !== null && years > 0) {
    yearsText = formatYears(years);
    const annualDecimal = Math.pow(1 + roiDecimal, 1 / years) - 1;
    const annualPercent = annualDecimal * 100;
    annualText = isFinite(annualPercent) ? annualPercent.toFixed(2) + " %" : "N/A";
  }

  roiYearsTextEl.textContent = yearsText;
  roiAnnualEl.textContent = annualText;

  resultsBlock.style.display = "block";
}

document.addEventListener("DOMContentLoaded", function () {
  // Time mode toggle behavior
  const radios = document.querySelectorAll('input[name="timeMode"]');
  radios.forEach((r) => {
    r.addEventListener("change", switchTimeMode);
  });
  switchTimeMode();

  // Calculate button
  document.getElementById("calcRoiBtn").addEventListener("click", calculateRoi);
});
