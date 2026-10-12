const express = require("express");
const router = express.Router();
const db = require("../services/db");

// Homepage
router.get("/", async (req, res, next) => {
  try {
    const userId = (req.session.user && req.session.user.id) || "usr-ahnaf-ceo";
    const [featuredProducts, stats, wallet, cart] = await Promise.all([
      db.getFeaturedProducts(4),
      db.getPlatformMetrics(),
      db.getWalletSummary(userId),
      db.getCart(userId, req.sessionID)
    ]);

    res.render("index", {
      title: "Revé — Circular Clothing Marketplace & Token Economy",
      featuredProducts,
      stats,
      wallet,
      cart
    });
  } catch (err) {
    next(err);
  }
});

// About page
router.get("/about", async (req, res, next) => {
  try {
    const userId = (req.session.user && req.session.user.id) || "usr-ahnaf-ceo";
    const [wallet, cart] = await Promise.all([
      db.getWalletSummary(userId),
      db.getCart(userId, req.sessionID)
    ]);

    res.render("about/index", {
      title: "About Revé — Revé",
      wallet,
      cart
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
