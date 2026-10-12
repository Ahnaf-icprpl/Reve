const express = require("express");
const router = express.Router();
const multer = require("multer");
const db = require("../services/db");
const scoring = require("../services/scoring");
const { uploadMedia } = require("../services/cloudinary");

// Memory storage for streaming directly to Cloudinary
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Server-side Trade-in Valuation API Endpoint
router.post("/api/trade-in/estimate", (req, res) => {
  const calculation = scoring.calculateTradeInValuation(req.body || {});
  res.json(calculation);
});

router.get("/api/trade-in/estimate", (req, res) => {
  const calculation = scoring.calculateTradeInValuation(req.query || {});
  res.json(calculation);
});

// Landing & Trade-in Submission Form
router.get("/trade-in", async (req, res, next) => {
  try {
    const userId = res.locals.currentUser.id;
    const [wallet, cart] = await Promise.all([
      db.getWalletSummary(userId),
      db.getCart(userId, req.sessionID)
    ]);

    res.render("trade-in/index", {
      title: "Trade-in Unwanted Clothing — Revé",
      wallet,
      cart
    });
  } catch (err) {
    next(err);
  }
});

// Submit Trade-in
router.post("/trade-in", upload.single("photo"), async (req, res, next) => {
  try {
    const userId = res.locals.currentUser.id;
    const { title, brand, category, gender, size, material, condition, notes, photoUrlInput } = req.body;

    if (!brand || !brand.trim()) {
      req.session.toast = { type: "error", message: "Brand is required for trade-in assessment." };
      return res.redirect("/trade-in");
    }

    let photoUrl = null;
    if (req.file) {
      const uploadResult = await uploadMedia(req.file.buffer, {
        folder: "reve/trade-ins",
        public_id: `tradein-${Date.now()}`
      });
      photoUrl = uploadResult.secure_url;
    } else if (photoUrlInput && photoUrlInput.trim()) {
      photoUrl = photoUrlInput.trim();
    }

    const valuation = scoring.calculateTradeInValuation({ brand, category, condition, material });
    const assessedTokens = valuation.valuationTokens;
    const tradeInId = "TI-" + Math.floor(1000 + Math.random() * 9000);

    await db.createTradeIn({
      id: tradeInId,
      userId,
      title: (title && title.trim()) || `${brand.trim()} ${category || "Garment"}`,
      brand: brand.trim(),
      category: category || "Apparel",
      gender: gender || "Unisex",
      size: size || "Standard",
      material: material || "Textile",
      condition: condition || "Inspected",
      notes: notes || "",
      photoUrl,
      assessedValueTokens: assessedTokens
    });

    req.session.toast = {
      type: "success",
      message: `Trade-in submitted! We've generated an instant offer of ${assessedTokens} RT for your item.`
    };

    res.redirect(`/trade-in/track`);
  } catch (err) {
    next(err);
  }
});

// Tracking list of trade-ins
router.get("/trade-in/track", async (req, res, next) => {
  try {
    const userId = res.locals.currentUser.id;
    const [tradeIns, wallet, cart] = await Promise.all([
      db.getTradeIns(userId),
      db.getWalletSummary(userId),
      db.getCart(userId, req.sessionID)
    ]);

    res.render("trade-in/status", {
      title: "Track Trade-ins — Revé",
      tradeIns,
      wallet,
      cart
    });
  } catch (err) {
    next(err);
  }
});

// Single Trade-in view
router.get("/trade-in/:id", async (req, res, next) => {
  try {
    const userId = res.locals.currentUser.id;
    const [item, wallet, cart] = await Promise.all([
      db.getTradeInById(req.params.id),
      db.getWalletSummary(userId),
      db.getCart(userId, req.sessionID)
    ]);

    if (!item) {
      req.session.toast = { type: "error", message: "Trade-in record not found." };
      return res.redirect("/trade-in/track");
    }

    res.render("trade-in/show", {
      title: `Trade-in #${item.id} — Revé`,
      item,
      wallet,
      cart
    });
  } catch (err) {
    next(err);
  }
});

// Accept Trade-in Offer -> Credits tokens to wallet!
router.post("/trade-in/:id/accept", async (req, res, next) => {
  try {
    const userId = res.locals.currentUser.id;
    const { tokens } = await db.acceptTradeIn(req.params.id, userId);

    req.session.toast = {
      type: "success",
      message: `Success! ${tokens} RT has been credited to your account. Spend it 1:1 on clothing in the marketplace.`
    };

    res.redirect("/trade-in/track");
  } catch (err) {
    req.session.toast = { type: "error", message: err.message };
    res.redirect("/trade-in/track");
  }
});

// Decline Trade-in Offer
router.post("/trade-in/:id/decline", async (req, res, next) => {
  try {
    await db.declineTradeIn(req.params.id);
    req.session.toast = { type: "info", message: "Trade-in offer declined." };
    res.redirect("/trade-in/track");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
