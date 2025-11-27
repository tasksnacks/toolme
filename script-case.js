/* Case Conversion Logic */
function toSentenceCase(text) {
  return text
    .toLowerCase()
    .replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
}

function toCapitalizedCase(text) {
  return text
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());
}

function toAlternatingCase(text) {
  return text
    .split("")
    .map((c, i) => (i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()))
    .join("");
}

function toTitleCase(text) {
  // Simple Title Case (capitalizes every word)
  return text
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());
}

function toInverseCase(text) {
  return text
    .split("")
    .map(c => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()))
    .join("");
}

/* DOM Interaction */
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("textInput");
  const copyBtn = document.getElementById("copyBtn");
  const clearBtn = document.getElementById("clearBtn");

  // Select buttons by their data attribute instead of the old class name
  const caseButtons = document.querySelectorAll("button[data-case]");

  caseButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const type = btn.dataset.case;
      let text = input.value;

      if (!text) return; // Don't process empty text

      switch (type) {
        case "sentence": text = toSentenceCase(text); break;
        case "lower": text = text.toLowerCase(); break;
        case "upper": text = text.toUpperCase(); break;
        case "capitalized": text = toCapitalizedCase(text); break;
        case "alternating": text = toAlternatingCase(text); break;
        case "title": text = toTitleCase(text); break;
        case "inverse": text = toInverseCase(text); break;
      }

      input.value = text;
    });
  });

  // Modern Copy to Clipboard with Visual Feedback
  copyBtn.addEventListener("click", () => {
    if (!input.value) return;

    navigator.clipboard.writeText(input.value).then(() => {
      const originalText = copyBtn.innerText;
      
      // Visual feedback
      copyBtn.innerText = "✅ Copied!";
      copyBtn.style.background = "#22c55e"; // Green color
      copyBtn.style.color = "white";

      // Reset after 2 seconds
      setTimeout(() => {
        copyBtn.innerText = originalText;
        copyBtn.style.background = ""; // Revert to CSS default
        copyBtn.style.color = "";
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  });

  // Clear Button
  clearBtn.addEventListener("click", () => {
    input.value = "";
    input.focus();
  });
});
