const express = require("express");
const router = express.Router();
const store = require("../data/store");

// Wallet overview
router.get("/wallet", (req, res) => {
  const wallet = store.getWalletSummary();
  const filterType = req.query.type || "ALL";

  let filteredLedger = [...wallet.ledger];
  if (filterType !== "ALL") {
    filteredLedger = filteredLedger.filter(tx => tx.type === filterType);
  }

  res.render("wallet/index", {
    title: "Digital Token Wallet — Revé",
    wallet,
    ledger: filteredLedger,
    selectedFilter: filterType,
    cart: store.getCart()
  });
});

// Process cash-out withdrawal
router.post("/wallet/withdraw", (req, res) => {
  const { tokenAmount, payoutDestination, accountNumber } = req.body;
  const tokens = parseInt(tokenAmount, 10);

  if (isNaN(tokens) || tokens <= 0) {
    req.session.toast = {
      type: "error",
      message: "Please enter a valid positive token amount to cash out."
    };
    return res.redirect("/wallet");
  }

  const wallet = store.getWalletSummary();
  if (tokens > wallet.balance) {
    req.session.toast = {
      type: "error",
      message: `Cannot cash out ${tokens} CT. Your current balance is ${wallet.balance} CT.`
    };
    return res.redirect("/wallet");
  }

  const destination = payoutDestination || "Bank Account";
  const destinationDetail = accountNumber ? `${destination} (ending in ${accountNumber.slice(-4)})` : destination;

  const result = store.withdrawTokens(tokens, destinationDetail);

  if (!result.success) {
    req.session.toast = {
      type: "error",
      message: result.error || "Withdrawal failed."
    };
    return res.redirect("/wallet");
  }

  req.session.toast = {
    type: "success",
    message: `Cash-out confirmed! Converted ${result.tokensDeducted} CT into $${result.netCash.toFixed(2)} cash ($${result.deductionTokens} deduction applied). Transferred to ${destinationDetail}. Ref: ${result.referenceId}`
  };

  res.redirect("/wallet");
});

// Quick top-up for testing convenience
router.post("/wallet/topup", (req, res) => {
  const { amount } = req.body;
  const tokens = parseInt(amount, 10) || 50;

  store.creditTokens(tokens, `Wallet Demonstration Top-Up (+${tokens} CT)`, "TOPUP-" + Date.now(), "TOPUP");

  req.session.toast = {
    type: "success",
    message: `Added ${tokens} CT to your digital wallet for testing!`
  };

  res.redirect("/wallet");
});

module.exports = router;
