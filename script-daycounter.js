/* Helper: Parse "YYYY-MM-DD" string to a Local Date object at midnight */
function parseDateInput(dateString) {
    if (!dateString) return null;
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
}

/* Helper: Format Date object to "YYYY-MM-DD" string */
function formatDateOutput(dateObj) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

// ---------- 1. Days Between Two Dates ----------

function calculateDayCounter() {
    const startInput = document.getElementById("dcStartDate");
    const endInput = document.getElementById("dcEndDate");
    const includeEnd = document.getElementById("dcIncludeEnd").checked;
    const resultsContainer = document.getElementById("dcResults");

    // Reset styles
    startInput.style.borderColor = "";
    endInput.style.borderColor = "";

    if (!startInput.value || !endInput.value) {
        if (!startInput.value) startInput.style.borderColor = "#ef4444";
        if (!endInput.value) endInput.style.borderColor = "#ef4444";
        return;
    }

    let start = parseDateInput(startInput.value);
    let end = parseDateInput(endInput.value);

    // Swap if end is before start
    if (end < start) {
        const temp = start;
        start = end;
        end = temp;
    }

    // Calculate total days (milliseconds -> days)
    const msPerDay = 1000 * 60 * 60 * 24;
    let totalDays = Math.round((end - start) / msPerDay);

    if (includeEnd) {
        totalDays += 1;
    }

    // Count Weekdays vs Weekends
    let weekdays = 0;
    let weekendDays = 0;
    
    // We create a clone to iterate so we do not modify the original start date
    let current = new Date(start);
    
    // Iterate through the exact number of days
    for (let i = 0; i < totalDays; i++) {
        const dayOfWeek = current.getDay(); // 0 = Sunday, 6 = Saturday
        
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            weekendDays++;
        } else {
            weekdays++;
        }
        
        // Move to next day
        current.setDate(current.getDate() + 1);
    }

    // Update DOM
    document.getElementById("dcTotalDays").textContent = totalDays;
    document.getElementById("dcWeekdays").textContent = weekdays;
    document.getElementById("dcWeekendDays").textContent = weekendDays;
    
    resultsContainer.style.display = "block";
}

// ---------- 2. Add or Subtract Days ----------

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function calculateCountFromDate() {
    const startInput = document.getElementById("cfStartDate");
    const direction = document.getElementById("cfDirection").value;
    const daysInput = document.getElementById("cfDays");
    const businessOnly = document.getElementById("cfBusinessOnly").checked;
    const resultsContainer = document.getElementById("cfResults");

    // Reset styles
    startInput.style.borderColor = "";
    daysInput.style.borderColor = "";

    const daysValue = parseInt(daysInput.value, 10);

    if (!startInput.value || isNaN(daysValue)) {
        if (!startInput.value) startInput.style.borderColor = "#ef4444";
        if (isNaN(daysValue)) daysInput.style.borderColor = "#ef4444";
        return;
    }

    let current = parseDateInput(startInput.value);
    let step = direction === "-" ? -1 : 1;
    let remaining = Math.abs(daysValue);

    if (!businessOnly) {
        // Simple calculation
        current.setDate(current.getDate() + (step * remaining));
    } else {
        // Business days logic (skip Sat/Sun)
        while (remaining > 0) {
            current.setDate(current.getDate() + step);
            const day = current.getDay();
            if (day !== 0 && day !== 6) {
                remaining--;
            }
        }
    }

    // Update DOM
    document.getElementById("cfResultDate").textContent = formatDateOutput(current);
    document.getElementById("cfResultDay").textContent = dayNames[current.getDay()];
    
    resultsContainer.style.display = "block";
}

// ---------- Initialization ----------

document.addEventListener("DOMContentLoaded", function () {
    const dcBtn = document.getElementById("dcCalculateBtn");
    if (dcBtn) dcBtn.addEventListener("click", calculateDayCounter);

    const cfBtn = document.getElementById("cfCalculateBtn");
    if (cfBtn) cfBtn.addEventListener("click", calculateCountFromDate);
});
