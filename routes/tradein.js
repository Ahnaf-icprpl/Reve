const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const store = require("../data/store");

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

// Valuation algorithm based on brand tier, category, and condition
function calculateTradeInValuation(brand, category, condition) {
  let baseValue = 35;

  // Category factor
  const cat = (category || "").toLowerCase();
  if (cat === "outerwear") baseValue = 85;
  else if (cat === "knitwear") baseValue = 55;
  else if (cat === "dresses") baseValue = 65;
  else if (cat === "bottoms") baseValue = 50;
  else if (cat === "tops") baseValue = 38;
  else if (cat === "accessories") baseValue = 35;

  // Brand tier factor
  const b = (brand || "").toLowerCase();
  let brandMultiplier = 1.0;
  if (b.includes("arc'teryx") || b.includes("patagonia") || b.includes("a.p.c.") || b.includes("acne") || b.includes("barbour")) {
    brandMultiplier = 1.6;
  } else if (b.includes("everlane") || b.includes("sezane") || b.includes("sézane") || b.includes("reformation") || b.includes("levi") || b.includes("cos")) {
    brandMultiplier = 1.25;
  } else if (b.includes("zara") || b.includes("h&m") || b.includes("uniqlo") || b.includes("gap")) {
    brandMultiplier = 0.75;
  }

  // Condition factor
  let condMultiplier = 0.8;
  const c = (condition || "").toLowerCase();
  if (c === "like new" || c === "pristine") condMultiplier = 1.0;
  else if (c === "excellent" || c === "gently used") condMultiplier = 0.85;
  else if (c === "good") condMultiplier = 0.7;
  else if (c === "fair") condMultiplier = 0.5;

  const calculated = Math.round(baseValue * brandMultiplier * condMultiplier);
  return Math.max(15, calculated); // minimum 15 RT
}

// Landing & Trade-in Submission Form
router.get("/trade-in", (req, res) => {
  res.render("trade-in/index", {
    title: "Trade-in Unwanted Clothing — Revé",
    wallet: store.getWalletSummary(),
    cart: store.getCart()
  });
});

// Submit Trade-in
router.post("/trade-in", upload.single("photo"), (req, res) => {
  const { title, brand, category, gender, size, material, condition, notes, photoUrlInput } = req.body;

  let photoUrl = "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80";
  if (req.file) {
    photoUrl = `/uploads/${req.file.filename}`;
  } else if (photoUrlInput && photoUrlInput.trim()) {
    photoUrl = photoUrlInput.trim();
  }

  const assessedTokens = calculateTradeInValuation(brand, category, condition);
  const tradeInId = "TI-" + Math.floor(1000 + Math.random() * 9000);

  const newTradeIn = {
    id: tradeInId,
    title: title || `${brand || "Garment"} ${category || "Item"}`,
    brand: brand || "Unspecified Brand",
    category: category || "Apparel",
    gender: gender || "Unisex",
    size: size || "M",
    material: material || "Mixed Textiles",
    condition: condition || "Gently Used",
    notes: notes || "Submitted via Revé web intake portal.",
    photoUrl,
    submissionDate: new Date().toISOString(),
    assessedValueTokens: assessedTokens,
    status: "Offer Ready", // Instant MVP offer ready for immediate acceptance!
    statusMessage: `Assessment complete! Offer of ${assessedTokens} RT ($${assessedTokens}.00 value) ready for your acceptance.`,
    circularOutcome: "Pending User Acceptance"
  };

  store.tradeIns.unshift(newTradeIn);

  req.session.toast = {
    type: "success",
    message: `Trade-in submitted! We've generated an instant offer of ${assessedTokens} RT for your item.`
  };

  res.redirect(`/trade-in/track`);
});

// Tracking list of trade-ins
router.get("/trade-in/track", (req, res) => {
  res.render("trade-in/status", {
    title: "Track Trade-ins — Revé",
    tradeIns: store.tradeIns,
    wallet: store.getWalletSummary(),
    cart: store.getCart()
  });
});

// Single Trade-in view
router.get("/trade-in/:id", (req, res) => {
  const item = store.tradeIns.find(t => t.id === req.params.id);
  if (!item) {
    req.session.toast = { type: "error", message: "Trade-in record not found." };
    return res.redirect("/trade-in/track");
  }

  res.render("trade-in/show", {
    title: `Trade-in #${item.id} — Revé`,
    item,
    wallet: store.getWalletSummary(),
    cart: store.getCart()
  });
});

// Accept Trade-in Offer -> Credits tokens to wallet!
router.post("/trade-in/:id/accept", (req, res) => {
  const item = store.tradeIns.find(t => t.id === req.params.id);
  if (!item) {
    req.session.toast = { type: "error", message: "Trade-in record not found." };
    return res.redirect("/trade-in/track");
  }

  if (item.status === "Credited") {
    req.session.toast = { type: "info", message: "This offer has already been accepted and credited." };
    return res.redirect("/trade-in/track");
  }

  // Credit tokens to user wallet
  const tokens = item.assessedValueTokens;
  store.creditTokens(tokens, `Trade-in Accepted: ${item.title}`, item.id);

  // Update item status
  item.status = "Credited";
  item.statusMessage = `Accepted! ${tokens} RT credited to your digital wallet on ${new Date().toLocaleDateString()}.`;
  item.circularOutcome = "Listed on Circular Marketplace / Hub Intake";

  req.session.toast = {
    type: "success",
    message: `Success! ${tokens} RT has been credited to your account. Spend it 1:1 on clothing in the marketplace.`
  };

  res.redirect("/trade-in/track");
});

// Decline Trade-in Offer
router.post("/trade-in/:id/decline", (req, res) => {
  const item = store.tradeIns.find(t => t.id === req.params.id);
  if (item && item.status !== "Credited") {
    item.status = "Declined";
    item.statusMessage = "Offer declined by user. Item will be returned or donated per preference.";
    req.session.toast = { type: "info", message: "Trade-in offer declined." };
  }
  res.redirect("/trade-in/track");
});

module.exports = router;
