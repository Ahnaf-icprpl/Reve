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

  // 4. Interactive Trade-In Instant Estimate Calculator on Form
  const tiBrandInput = document.getElementById("tiBrand");
  const tiCategorySelect = document.getElementById("tiCategory");
  const tiConditionSelect = document.getElementById("tiCondition");
  const tiEstimateDisplay = document.getElementById("tiEstimateDisplay");
  const tiFiatDisplay = document.getElementById("tiFiatDisplay");

  if (tiBrandInput && tiCategorySelect && tiConditionSelect && tiEstimateDisplay) {
    function calculateInstantEstimate() {
      const brand = (tiBrandInput.value || "").trim();
      if (!brand) {
        tiEstimateDisplay.textContent = "— RT";
        tiEstimateDisplay.style.color = "var(--text-muted)";
        if (tiFiatDisplay) {
          tiFiatDisplay.textContent = "Not defined yet \u2022 Assessed upon intake review";
        }
        return;
      }

      let baseValue = 35;
      const cat = (tiCategorySelect.value || "").toLowerCase();
      if (cat === "outerwear") baseValue = 85;
      else if (cat === "knitwear") baseValue = 55;
      else if (cat === "dresses") baseValue = 65;
      else if (cat === "bottoms") baseValue = 50;
      else if (cat === "tops") baseValue = 38;
      else if (cat === "accessories") baseValue = 35;

      let brandMultiplier = 1.0;
      const b = brand.toLowerCase();
      if (b.includes("arc'teryx") || b.includes("patagonia") || b.includes("a.p.c.") || b.includes("acne") || b.includes("barbour")) {
        brandMultiplier = 1.6;
      } else if (b.includes("everlane") || b.includes("sezane") || b.includes("sézane") || b.includes("reformation") || b.includes("levi") || b.includes("cos")) {
        brandMultiplier = 1.25;
      } else if (b.includes("zara") || b.includes("h&m") || b.includes("uniqlo") || b.includes("gap")) {
        brandMultiplier = 0.75;
      }

      const cond = (tiConditionSelect.value || "").toLowerCase();
      let condMultiplier = 0.8;
      if (cond.includes("like new") || cond.includes("pristine")) condMultiplier = 1.0;
      else if (cond.includes("excellent") || cond.includes("gently used")) condMultiplier = 0.85;
      else if (cond.includes("good")) condMultiplier = 0.7;
      else if (cond.includes("fair")) condMultiplier = 0.5;

      const estimate = Math.max(15, Math.round(baseValue * brandMultiplier * condMultiplier));
      tiEstimateDisplay.textContent = `~${estimate} RT`;
      tiEstimateDisplay.style.color = "var(--token-green-dark)";
      if (tiFiatDisplay) tiFiatDisplay.textContent = `Indicative ~${estimate} RT ($${estimate}.00) \u2022 Subject to intake inspection`;
    }

    tiBrandInput.addEventListener("input", calculateInstantEstimate);
    tiCategorySelect.addEventListener("change", calculateInstantEstimate);
    tiConditionSelect.addEventListener("change", calculateInstantEstimate);
  }

    // Quick brand chips selection
    const brandChips = document.querySelectorAll(".brand-chip");
    brandChips.forEach(chip => {
      chip.addEventListener("click", function () {
        tiBrandInput.value = this.getAttribute("data-brand") || this.textContent.trim();
        tiBrandInput.dispatchEvent(new Event("input"));
      });
    });

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
