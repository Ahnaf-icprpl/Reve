// Revé — Circular Fashion MVP Client Script

document.addEventListener("DOMContentLoaded", function () {
  // 1. Mobile Menu Toggle
  const mobileBtn = document.getElementById("mobileMenuBtn");
  const navLinks = document.getElementById("navLinks");
  if (mobileBtn && navLinks) {
    mobileBtn.addEventListener("click", function () {
      navLinks.classList.toggle("open");
    });
  }

  // 2. Auto-dismiss flash toast using duration configured in data attribute
  const toast = document.getElementById("flashToast");
  if (toast) {
    const dismissDuration = parseInt(toast.dataset.dismissDuration, 10);
    const fadeDuration = parseInt(toast.dataset.fadeDuration, 10) || 400;
    if (!isNaN(dismissDuration) && dismissDuration > 0) {
      setTimeout(() => {
        toast.style.transition = `opacity ${fadeDuration / 1000}s ease`;
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), fadeDuration);
      }, dismissDuration);
    }
  }

  // Interactive Trade-In Server-Side Valuation Preview (No client-side hardcoding)
  const tiBrandInput = document.getElementById("tiBrand");
  const tiCategorySelect = document.getElementById("tiCategory");
  const tiConditionSelect = document.getElementById("tiCondition");
  const tiMaterialInput = document.getElementById("tiMaterial");
  const tiEstimateDisplay = document.getElementById("tiEstimateDisplay");
  const tiFiatDisplay = document.getElementById("tiFiatDisplay");

  if (tiBrandInput && tiCategorySelect && tiConditionSelect && tiEstimateDisplay) {
    let debounceTimer = null;
    const defaultEstimatePlaceholder = tiEstimateDisplay.dataset.placeholder || tiEstimateDisplay.textContent.trim();
    const defaultFiatPlaceholder = tiFiatDisplay ? (tiFiatDisplay.dataset.placeholder || tiFiatDisplay.textContent.trim()) : "";
    const debounceDelay = parseInt(tiBrandInput.dataset.debounceMs, 10);

    async function fetchServerEstimate() {
      const brand = (tiBrandInput.value || "").trim();
      if (!brand) {
        tiEstimateDisplay.textContent = defaultEstimatePlaceholder;
        tiEstimateDisplay.style.color = "var(--text-muted)";
        if (tiFiatDisplay) {
          tiFiatDisplay.textContent = defaultFiatPlaceholder;
        }
        return;
      }

      try {
        const payload = {
          brand,
          category: tiCategorySelect.value || "",
          condition: tiConditionSelect.value || "",
          material: tiMaterialInput ? tiMaterialInput.value : ""
        };

        const res = await fetch("/api/trade-in/estimate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const data = await res.json();
          if (data && data.isValid) {
            tiEstimateDisplay.textContent = data.displayTokens || "";
            tiEstimateDisplay.style.color = "var(--token-green-dark)";
            if (tiFiatDisplay) {
              tiFiatDisplay.textContent = data.displaySummary || "";
            }
          } else if (data && !data.isValid) {
            tiEstimateDisplay.textContent = data.placeholderEstimate || defaultEstimatePlaceholder;
            tiEstimateDisplay.style.color = "var(--text-muted)";
            if (tiFiatDisplay) {
              tiFiatDisplay.textContent = data.placeholderSummary || defaultFiatPlaceholder;
            }
          }
        }
      } catch (err) {
        // Network error handled gracefully
      }
    }

    function onInputChange() {
      clearTimeout(debounceTimer);
      if (!isNaN(debounceDelay) && debounceDelay >= 0) {
        debounceTimer = setTimeout(fetchServerEstimate, debounceDelay);
      } else {
        fetchServerEstimate();
      }
    }

    tiBrandInput.addEventListener("input", onInputChange);
    tiCategorySelect.addEventListener("change", onInputChange);
    tiConditionSelect.addEventListener("change", onInputChange);
    if (tiMaterialInput) tiMaterialInput.addEventListener("input", onInputChange);
  }


  // 5. Checkout Payment Selection Breakdown
  const paymentMethodRadios = document.querySelectorAll('input[name="paymentMethod"]');
  const tokenBreakdownSection = document.getElementById("tokenBreakdownSection");
  if (paymentMethodRadios.length && tokenBreakdownSection) {
    paymentMethodRadios.forEach(radio => {
      radio.addEventListener("change", function () {
        if (this.value === "tokens") {
          tokenBreakdownSection.style.display = "block";
        } else {
          tokenBreakdownSection.style.display = "none";
        }
      });
    });
  }
});
