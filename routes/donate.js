const express = require("express");
const router = express.Router();
const store = require("../data/store");
const scoring = require("../services/scoring");
// Donation intake form & circular process explanation
router.get("/donate", (req, res) => {
  res.render("donate/index", {
    title: "Donate Textiles & Clothing — Revé",
    wallet: store.getWalletSummary(),
    cart: store.getCart()
  });
});

// Process donation submission
router.post("/donate", (req, res) => {
  const { title, itemCount, categories, fabrics, conditionSummary, intendedProgram, dropOffMethod } = req.body;

  const count = parseInt(itemCount, 10) || 1;
  const displayCount = (itemCount && typeof itemCount === 'string' && itemCount.trim()) ? itemCount.trim() : `${count} Garments`;
  const cats = Array.isArray(categories) ? categories : (categories ? [categories] : ["Mixed Apparel"]);
  const fabArray = Array.isArray(fabrics) ? fabrics : (fabrics ? [fabrics] : ["Cotton & Mixed Fibers"]);

  const donationId = "DON-" + Math.floor(1000 + Math.random() * 9000);
  const trackingNumber = "REV-CIRC-" + Math.floor(1000000 + Math.random() * 9000000);

  // Server-side environmental impact calculation
  const impact = scoring.calculateDonationImpact({
    itemCount: count,
    categories: cats,
    fabrics: fabArray,
    damageAssessment: intendedProgram
  });

  const newDonation = {
    id: donationId,
    title: title || `${displayCount} Textile & Garment Donation`,
    itemCount: displayCount,
    categories: cats,
    fabrics: fabArray,
    conditionSummary: conditionSummary || "Clean textile donation",
    intendedProgram: intendedProgram || "Zero-Landfill Circular Recycling",
    dropOffMethod: dropOffMethod || "Prepaid Eco-Shipping Label",
    trackingNumber: trackingNumber,
    submissionDate: new Date().toISOString(),
    status: "Pass Generated",
    impactMetrics: {
      textilesDivertedKg: impact.textilesDivertedKg,
      waterSavedLiters: impact.waterSavedLiters,
      landfillDivertedPct: impact.landfillDivertedPct
    },
    beneficiaryNotes: `Designated for ${intendedProgram || "Zero-Landfill Circular Recycling"}. Drop off using your QR pass or attach the prepaid label.`
  };

  store.donations.unshift(newDonation);

  req.session.toast = {
    type: "success",
    message: `Thank you for contributing to circular fashion! Donation pass #${donationId} generated.`
  };

  res.redirect(`/donate/${donationId}`);
});

// Track donation history & circular impact
router.get("/donate/track", (req, res) => {
  // Aggregate total impact
  let totalKg = 0;
  let totalWater = 0;
  let totalItems = 0;

  store.donations.forEach(d => {
    totalItems += parseInt(d.itemCount, 10) || 1;
    totalKg += d.impactMetrics?.textilesDivertedKg || 0;
    totalWater += d.impactMetrics?.waterSavedLiters || 0;
  });

  res.render("donate/status", {
    title: "Donation Impact & Tracking — Revé",
    donations: store.donations,
    totalKg: Number(totalKg.toFixed(1)),
    totalWater,
    totalItems,
    wallet: store.getWalletSummary(),
    cart: store.getCart()
  });
});

// Single donation pass & details
router.get("/donate/:id", (req, res) => {
  const donation = store.donations.find(d => d.id === req.params.id);
  if (!donation) {
    req.session.toast = { type: "error", message: "Donation record not found." };
    return res.redirect("/donate/track");
  }

  res.render("donate/show", {
    title: `Donation Pass #${donation.id} — Revé`,
    donation,
    wallet: store.getWalletSummary(),
    cart: store.getCart()
  });
});

module.exports = router;
