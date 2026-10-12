const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const db = require("../services/db");
const scoring = require("../services/scoring");

// Multer setup for mock trade-in image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "tradein-" + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
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
    const userId = (req.session.user && req.session.user.id) || "usr-ahnaf-ceo";
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
    const userId = (req.session.user && req.session.user.id) || "usr-ahnaf-ceo";
    const { title, brand, category, gender, size, material, condition, notes, photoUrlInput } = req.body;

    let photoUrl = "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80";
    if (req.file) {
      photoUrl = `/uploads/${req.file.filename}`;
    } else if (photoUrlInput && photoUrlInput.trim()) {
      photoUrl = photoUrlInput.trim();
    }

    const valuation = scoring.calculateTradeInValuation({ brand, category, condition, material });
    const assessedTokens = valuation.valuationTokens;
    const tradeInId = "TI-" + Math.floor(1000 + Math.random() * 9000);

    await db.createTradeIn({
      id: tradeInId,
      userId,
      title: (title && title.trim()) || `${brand || "Garment"} ${category || "Item"}`,
      brand: (brand && brand.trim()) || "Unspecified Brand",
      category: category || "Apparel",
      gender: gender || "Unisex",
      size: (size && size.trim()) || "Standard",
      material: (material && material.trim()) || "Mixed Textiles",
      condition: condition || "Gently Used",
      notes: (notes && notes.trim()) || "Submitted via Revé intake portal",
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
    const userId = (req.session.user && req.session.user.id) || "usr-ahnaf-ceo";
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
    const userId = (req.session.user && req.session.user.id) || "usr-ahnaf-ceo";
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
    const userId = (req.session.user && req.session.user.id) || "usr-ahnaf-ceo";
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
