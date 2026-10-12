const express = require("express");
const router = express.Router();
const db = require("../services/db");
const scoring = require("../services/scoring");

// Donation intake form & circular process explanation
router.get("/donate", async (req, res, next) => {
  try {
    const userId = res.locals.currentUser.id;
    const [wallet, cart] = await Promise.all([
      db.getWalletSummary(userId),
      db.getCart(userId, req.sessionID)
    ]);

    res.render("donate/index", {
      title: "Donate Textiles & Clothing — Revé",
      wallet,
      cart
    });
  } catch (err) {
    next(err);
  }
});

// Process donation submission
router.post("/donate", async (req, res, next) => {
  try {
    const userId = res.locals.currentUser.id;
    const { title, itemCount, categories, fabrics, conditionSummary, intendedProgram, dropOffMethod } = req.body;

    const count = parseInt(itemCount, 10) || 1;
    const displayCount = (itemCount && typeof itemCount === "string" && itemCount.trim()) ? itemCount.trim() : `${count} Garments`;
    const cats = Array.isArray(categories) ? categories : (categories ? [categories] : ["Mixed Apparel"]);
    const fabArray = Array.isArray(fabrics) ? fabrics : (fabrics ? [fabrics] : ["Cotton & Mixed Fibers"]);

    const donationId = "DON-" + Math.floor(1000 + Math.random() * 9000);
    const trackingNumber = "REV-CIRC-" + Math.floor(1000000 + Math.random() * 9000000);
    const QRCode = require("qrcode");
    const qrCode = await QRCode.toString(trackingNumber, { type: "svg", margin: 1, width: 120 });

    const impact = scoring.calculateDonationImpact({
      itemCount: count,
      categories: cats,
      fabrics: fabArray,
      damageAssessment: intendedProgram
    });
    await db.createDonation({
      id: donationId,
      userId,
      title: title || `${displayCount} Textile & Garment Donation`,
      itemCountLabel: displayCount,
      itemCountNumeric: count,
      damageAssessment: intendedProgram || "Zero-Landfill Circular Recycling",
      dropOffMethod: dropOffMethod || "Prepaid Eco-Shipping Label",
      trackingNumber,
      categories: cats,
      textilesDivertedKg: impact.textilesDivertedKg,
      waterSavedLiters: impact.waterSavedLiters,
      landfillDivertedPct: impact.landfillDivertedPct,
      beneficiaryNotes: `Designated for ${intendedProgram || "Zero-Landfill Circular Recycling"}. Drop off using your QR pass or attach the prepaid label.`,
      qrCode
    });

    req.session.toast = {
      type: "success",
      message: `Thank you for contributing to circular fashion! Donation pass #${donationId} generated.`
    };

    res.redirect(`/donate/${donationId}`);
  } catch (err) {
    next(err);
  }
});

// Track donation history & circular impact
router.get("/donate/track", async (req, res, next) => {
  try {
    const userId = res.locals.currentUser.id;
    const [donations, wallet, cart] = await Promise.all([
      db.getDonations(userId),
      db.getWalletSummary(userId),
      db.getCart(userId, req.sessionID)
    ]);

    let totalKg = 0;
    let totalWater = 0;
    let totalItems = 0;

    donations.forEach(d => {
      totalItems += parseInt(d.itemCount, 10) || 1;
      totalKg += d.impactMetrics?.textilesDivertedKg || 0;
      totalWater += d.impactMetrics?.waterSavedLiters || 0;
    });

    res.render("donate/status", {
      title: "Donation Impact & Tracking — Revé",
      donations,
      totalKg: Number(totalKg.toFixed(1)),
      totalWater,
      totalItems,
      wallet,
      cart
    });
  } catch (err) {
    next(err);
  }
});

// Single donation pass & details
router.get("/donate/:id", async (req, res, next) => {
  try {
    const userId = res.locals.currentUser.id;
    const [donation, wallet, cart] = await Promise.all([
      db.getDonationById(req.params.id),
      db.getWalletSummary(userId),
      db.getCart(userId, req.sessionID)
    ]);

    if (!donation) {
      req.session.toast = { type: "error", message: "Donation record not found." };
      return res.redirect("/donate/track");
    }

    res.render("donate/show", {
      title: `Donation Pass #${donation.id} — Revé`,
      donation,
      wallet,
      cart
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
