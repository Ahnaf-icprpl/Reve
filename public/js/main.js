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

  // 2. Auto-dismiss flash toast after 6 seconds
  const toast = document.getElementById("flashToast");
  if (toast) {
    setTimeout(() => {
      toast.style.transition = "opacity 0.4s ease";
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 400);
    }, 6000);
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

    async function fetchServerEstimate() {
      const brand = (tiBrandInput.value || "").trim();
      if (!brand) {
        tiEstimateDisplay.textContent = "— RT";
        tiEstimateDisplay.style.color = "var(--text-muted)";
        if (tiFiatDisplay) {
          tiFiatDisplay.textContent = "Not defined yet \u2022 Assessed upon intake review";
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
            tiEstimateDisplay.textContent = `~${data.valuationTokens} RT`;
            tiEstimateDisplay.style.color = "var(--token-green-dark)";
            if (tiFiatDisplay) {
              tiFiatDisplay.textContent = `Indicative ~${data.valuationTokens} RT ($${data.fiatValue}.00) \u2022 Condition Grade: ${data.scoreGrade}`;
            }
          }
        }
      } catch (err) {
        // Network error handled gracefully
      }
    }

    function onInputChange() {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(fetchServerEstimate, 250);
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
