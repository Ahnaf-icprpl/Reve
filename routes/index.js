const express = require("express");
const router = express.Router();
const store = require("../data/store");
const scoring = require("../services/scoring");
// Homepage
router.get("/", (req, res) => {
  const featuredProducts = store.products.slice(0, 4);
  const wallet = store.getWalletSummary();
  const cart = store.getCart();

  // Server-side dynamically aggregated circular metrics
  const stats = store.getPlatformMetrics();
  res.render("index", {
    title: "Revé — Circular Clothing Marketplace & Token Economy",
    featuredProducts,
    stats,
    wallet,
    cart
  });
});

// About page
router.get("/about", (req, res) => {
  res.render("about/index", {
    title: "About Revé — Revé",
    wallet: store.getWalletSummary(),
    cart: store.getCart()
  });
});

module.exports = router;
