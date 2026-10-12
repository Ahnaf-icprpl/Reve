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

  // 3. Interactive Cash-Out Withdrawal Calculator in Wallet
  const tokenAmountInput = document.getElementById("withdrawTokenAmount");
  const calcTokensDisplay = document.getElementById("calcTokensDisplay");
  const calcGrossDisplay = document.getElementById("calcGrossDisplay");
  const calcDeductionDisplay = document.getElementById("calcDeductionDisplay");
  const calcPayoutDisplay = document.getElementById("calcPayoutDisplay");

  if (tokenAmountInput) {
    function updateCashoutCalc() {
      const tokens = parseFloat(tokenAmountInput.value) || 0;
      const deductionRate = 0.20; // 20% conversion deduction per product spec
      const grossFiat = tokens; // 1:1 nominal
      const deductionAmount = tokens * deductionRate;
      const netPayout = Math.max(0, tokens - deductionAmount);

      if (calcTokensDisplay) calcTokensDisplay.textContent = tokens + " CT";
      if (calcGrossDisplay) calcGrossDisplay.textContent = "$" + grossFiat.toFixed(2);
      if (calcDeductionDisplay) calcDeductionDisplay.textContent = "-$" + deductionAmount.toFixed(2);
      if (calcPayoutDisplay) calcPayoutDisplay.textContent = "$" + netPayout.toFixed(2);
    }

    tokenAmountInput.addEventListener("input", updateCashoutCalc);
    updateCashoutCalc(); // initial calculation
  }

  // 4. Interactive Trade-In Instant Estimate Calculator on Form
  const tiBrandInput = document.getElementById("tiBrand");
  const tiCategorySelect = document.getElementById("tiCategory");
  const tiConditionSelect = document.getElementById("tiCondition");
  const tiEstimateDisplay = document.getElementById("tiEstimateDisplay");
  const tiFiatDisplay = document.getElementById("tiFiatDisplay");

  if (tiBrandInput && tiCategorySelect && tiConditionSelect && tiEstimateDisplay) {
    function calculateInstantEstimate() {
      let baseValue = 35;
      const cat = (tiCategorySelect.value || "").toLowerCase();
      if (cat === "outerwear") baseValue = 85;
      else if (cat === "knitwear") baseValue = 55;
      else if (cat === "dresses") baseValue = 65;
      else if (cat === "bottoms") baseValue = 50;
      else if (cat === "tops") baseValue = 38;
      else if (cat === "accessories") baseValue = 35;

      const brand = (tiBrandInput.value || "").toLowerCase();
      let brandMultiplier = 1.0;
      if (brand.includes("arc'teryx") || brand.includes("patagonia") || brand.includes("a.p.c.") || brand.includes("acne") || brand.includes("barbour")) {
        brandMultiplier = 1.6;
      } else if (brand.includes("everlane") || brand.includes("sezane") || brand.includes("sézane") || brand.includes("reformation") || brand.includes("levi") || brand.includes("cos")) {
        brandMultiplier = 1.25;
      } else if (brand.includes("zara") || brand.includes("h&m") || brand.includes("uniqlo") || brand.includes("gap")) {
        brandMultiplier = 0.75;
      }

      const cond = (tiConditionSelect.value || "").toLowerCase();
      let condMultiplier = 0.8;
      if (cond.includes("like new") || cond.includes("pristine")) condMultiplier = 1.0;
      else if (cond.includes("excellent") || cond.includes("gently used")) condMultiplier = 0.85;
      else if (cond.includes("good")) condMultiplier = 0.7;
      else if (cond.includes("fair")) condMultiplier = 0.5;

      const estimate = Math.max(15, Math.round(baseValue * brandMultiplier * condMultiplier));
      tiEstimateDisplay.textContent = estimate + " CT";
      if (tiFiatDisplay) tiFiatDisplay.textContent = "$" + estimate + ".00 Marketplace Value";
    }

    tiBrandInput.addEventListener("input", calculateInstantEstimate);
    tiCategorySelect.addEventListener("change", calculateInstantEstimate);
    tiConditionSelect.addEventListener("change", calculateInstantEstimate);
    calculateInstantEstimate();
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
