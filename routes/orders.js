const express = require("express");
const router = express.Router();
const db = require("../services/db");

// Orders list
router.get("/orders", async (req, res, next) => {
  try {
    const userId = (req.session.user && req.session.user.id) || "usr-ahnaf-ceo";
    const [orders, wallet, cart] = await Promise.all([
      db.getOrders(userId),
      db.getWalletSummary(userId),
      db.getCart(userId, req.sessionID)
    ]);

    res.render("orders/index", {
      title: "Order History — Revé",
      orders,
      wallet,
      cart
    });
  } catch (err) {
    next(err);
  }
});

// Single order receipt
router.get("/orders/:id", async (req, res, next) => {
  try {
    const userId = (req.session.user && req.session.user.id) || "usr-ahnaf-ceo";
    const [order, wallet, cart] = await Promise.all([
      db.getOrderById(req.params.id, userId),
      db.getWalletSummary(userId),
      db.getCart(userId, req.sessionID)
    ]);

    if (!order) {
      req.session.toast = { type: "error", message: "Order not found." };
      return res.redirect("/orders");
    }

    res.render("orders/show", {
      title: `Order #${order.id} Receipt — Revé`,
      order,
      wallet,
      cart
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
