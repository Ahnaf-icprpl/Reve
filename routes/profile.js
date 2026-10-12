const express = require("express");
const router = express.Router();
const store = require("../data/store");
const scoring = require("../services/scoring");

// User Profile Page
router.get("/profile", (req, res) => {
  const wallet = store.getWalletSummary();
  const cart = store.getCart();
  const orders = store.orders;
  const tradeIns = store.tradeIns;
  const donations = store.donations;

  // Compute user's personal circular sustainability impact
  let personalWaterSaved = 0;
  let personalCo2Saved = 0;
  let personalGarmentsRecirculated = 0;

  // From orders
  orders.forEach(o => {
    personalWaterSaved += (o.ecoMetrics && o.ecoMetrics.waterSaved) || 0;
    personalCo2Saved += (o.ecoMetrics && o.ecoMetrics.co2Avoided) || 0;
    personalGarmentsRecirculated += o.items ? o.items.reduce((s, i) => s + (i.quantity || 1), 0) : 1;
  });

  // From trade-ins
  tradeIns.forEach(t => {
    if (t.status === "Credited" || t.status === "Offer Ready") {
      personalGarmentsRecirculated += 1;
      personalWaterSaved += (t.assessedValueTokens || 0) * 25;
      personalCo2Saved += Number(((t.assessedValueTokens || 0) * 0.08).toFixed(1));
    }
  });

  // From donations
  donations.forEach(d => {
    personalWaterSaved += (d.impactMetrics && d.impactMetrics.waterSavedLiters) || 0;
    personalGarmentsRecirculated += parseInt(d.itemCount, 10) || 1;
  });

  res.render("profile/index", {
    title: "My Circular Profile — Revé",
    wallet,
    cart,
    orders,
    tradeIns,
    donations,
    impact: {
      waterSavedLiters: personalWaterSaved.toLocaleString(),
      co2AvoidedKg: Number(personalCo2Saved.toFixed(1)),
      garmentsRecirculated: personalGarmentsRecirculated
    }
  });
});

module.exports = router;
