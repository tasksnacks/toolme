// Helper: normalize dates to midnight
function normalizeDate(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// ---------- 1. Days between two dates ----------

function calculateDayCounter() {
  const startInput = document.getElementById("dcStartDate").value;
  const endInput = document.getElementById("dcEndDate").value;
  const includeEnd = document.getElementById("dcIncludeEnd").checked;

  if (!startInput || !endInput) {
    alert("Please choose both a start date and an end date.");
    return;
  }

  let start = normalizeDate(startInput);
  let end = normalizeDate(endInput);

  // Ensure start <= end
  if (end < start) {
    const tmp = start;
    start = end;
    end = tmp;
  }

  // Base difference in days (exclusive of end)
  const msDiff = end - start;
  let totalDays = msDiff / (1000 * 60 * 60 * 24);

  if (includeEnd) {
    totalDays += 1;
  }

  // Count weekdays vs weekend days
  let weekdays = 0;
  let weekendDays = 0;

  const daysToCount = includeEnd ? totalDays : totalDays;
  // iterate from 0 to totalDays-1 (or to totalDays if includeEnd, but we've already adjusted)
  let current = new Date(start);
  for (let i = 0; i < daysToCount; i++) {
    const day = current.getDay(); // 0 Sun, 6 Sat
    if (day === 0 || day === 6) {
      weekendDays++;
    } else {
      weekdays++;
    }
    current.setDate(current.getDate() + 1);
  }

  document.getElementById("dcTotalDays").textContent = totalDays.toString();
  document.getElementById("dcWeekdays").textContent = weekdays.toString();
  document.getElementById("dcWeekendDays").textContent = weekendDays.toString();
  document.getElementById("dcResults").style.display = "block";
}

// ---------- 2. Count days from a date ----------

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function calculateCountFromDate() {
  const startInput = document.getElementById("cfStartDate").value;
  const direction = document.getElementById("cfDirection").value; // + or -
  const daysValue = parseInt(document.getElementById("cfDays").value, 10);
  const businessOnly = document.getElementById("cfBusinessOnly").checked;

  if (!startInput) {
    alert("Please choose a start date.");
    return;
  }
  if (isNaN(daysValue)) {
    alert("Please enter how many days to add or subtract.");
    return;
  }

  let start = normalizeDate(startInput);
  let step = direction === "-" ? -1 : 1;
  let remaining = Math.abs(daysValue);

  if (!businessOnly) {
    // Simple add/subtract
    start.setDate(start.getDate() + step * remaining);
  } else {
    // Skip weekends
    while (remaining > 0) {
      start.setDate(start.getDate() + step);
      const day = start.getDay();
      if (day !== 0 && day !== 6) {
        // business day
        remaining--;
      }
    }
  }

  const resultDate = start;
  const dayName = dayNames[resultDate.getDay()];

  // Format YYYY-MM-DD for display
  const year = resultDate.getFullYear();
  const month = String(resultDate.getMonth() + 1).padStart(2, "0");
  const day = String(resultDate.getDate()).padStart(2, "0");
  const formatted = `${year}-${month}-${day}`;

  document.getElementById("cfResultDate").textContent = formatted;
  document.getElementById("cfResultDay").textContent = dayName;
  document.getElementById("cfResults").style.display = "block";
}

// ---------- Initialization ----------

document.addEventListener("DOMContentLoaded", function () {
  const dcBtn = document.getElementById("dcCalculateBtn");
  if (dcBtn) dcBtn.addEventListener("click", calculateDayCounter);

  const cfBtn = document.getElementById("cfCalculateBtn");
  if (cfBtn) cfBtn.addEventListener("click", calculateCountFromDate);
});
