const express = require("express");
const router = express.Router();
const store = require("../data/store");

// Homepage
router.get("/", (req, res) => {
  const featuredProducts = store.products.slice(0, 4);
  const wallet = store.getWalletSummary();
  const cart = store.getCart();

  // Circular marketplace aggregate stats
  const stats = {
    garmentsRecirculated: "14,820",
    waterSavedLiters: "18.4M",
    tokensEarnedByCommunity: "840,000",
    landfillDivertedKg: "12,400"
  };

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
    title: "About the Revé Circular Economy — Revé",
    wallet: store.getWalletSummary(),
    cart: store.getCart()
  });
});

module.exports = router;
