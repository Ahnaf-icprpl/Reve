const express = require("express");
const router = express.Router();
const store = require("../data/store");

// Orders list
router.get("/orders", (req, res) => {
  res.render("orders/index", {
    title: "Order History — Revé",
    orders: store.orders,
    wallet: store.getWalletSummary(),
    cart: store.getCart()
  });
});

// Single order receipt
router.get("/orders/:id", (req, res) => {
  const order = store.orders.find(o => o.id === req.params.id);
  if (!order) {
    req.session.toast = { type: "error", message: "Order not found." };
    return res.redirect("/orders");
  }

  res.render("orders/show", {
    title: `Order #${order.id} Receipt — Revé`,
    order,
    wallet: store.getWalletSummary(),
    cart: store.getCart()
  });
});

module.exports = router;
