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

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("textInput");

  document.querySelectorAll(".case-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const type = btn.dataset.case;
      let text = input.value;

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

  document.getElementById("copyBtn").addEventListener("click", () => {
    input.select();
    document.execCommand("copy");
  });

  document.getElementById("clearBtn").addEventListener("click", () => {
    input.value = "";
  });
});
