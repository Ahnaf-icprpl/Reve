// In-memory data store for Revé MVP
// Supports state mutations across session and requests

const INITIAL_PRODUCTS = [
  {
    id: "prod-1",
    title: "Patagonia Re-Tool Snap-T Fleece Pullover",
    brand: "Patagonia",
    category: "Outerwear",
    gender: "Unisex",
    size: "M",
    color: "Oatmeal Heather",
    condition: "Like New",
    conditionScore: "9.5/10",
    conditionNotes: "Crisp pile fleece, zero pilling, original snaps intact. Cleaned and ozone sanitized.",
    material: "100% Recycled Polartec Thermal Pro Polyester",
    price: 78,
    tokens: 78, // 1:1 token peg
    originalRetail: 149,
    ecoSavings: {
      waterLiters: 1420,
      co2Kg: 5.8
    },
    image: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=900&q=80",
    source: "Verified Trade-in",
    inStock: true
  },
  {
    id: "prod-2",
    title: "Everlane Oversized Alpaca Crewneck Sweater",
    brand: "Everlane",
    category: "Knitwear",
    gender: "Women",
    size: "S",
    color: "Sage Green",
    condition: "Gently Used",
    conditionScore: "8.5/10",
    conditionNotes: "Light halo wear consistent with natural alpaca fiber. Soft handfeel, no pulls or odors.",
    material: "43% Baby Alpaca, 31% Nylon, 26% Recycled Wool",
    price: 64,
    tokens: 64,
    originalRetail: 138,
    ecoSavings: {
      waterLiters: 1100,
      co2Kg: 4.2
    },
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=80",
    source: "Community Trade-in",
    inStock: true
  },
  {
    id: "prod-3",
    title: "Levi's 501 Original Fit Vintage Selvedge Denim",
    brand: "Levi's",
    category: "Bottoms",
    gender: "Men",
    size: "32x32",
    color: "Indigo Wash",
    condition: "Vintage",
    conditionScore: "8.0/10",
    conditionNotes: "Authentic honeycombs and whiskering at knees. Hem reinforced with chainstitch. True heritage wash.",
    material: "100% Rigid Cotton Denim",
    price: 85,
    tokens: 85,
    originalRetail: 128,
    ecoSavings: {
      waterLiters: 3200,
      co2Kg: 7.9
    },
    image: "https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=900&q=80",
    source: "Curated Upcycle",
    inStock: true
  },
  {
    id: "prod-4",
    title: "A.P.C. Raw Denim Chore Worker Jacket",
    brand: "A.P.C.",
    category: "Outerwear",
    gender: "Men",
    size: "L",
    color: "Raw Indigo",
    condition: "Like New",
    conditionScore: "9.8/10",
    conditionNotes: "Unwashed raw Japanese selvedge. Worn twice indoors. Crisp collar and pristine pocket rivets.",
    material: "100% Japanese Cotton",
    price: 145,
    tokens: 145,
    originalRetail: 295,
    ecoSavings: {
      waterLiters: 2850,
      co2Kg: 9.1
    },
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80",
    source: "Verified Trade-in",
    inStock: true
  },
  {
    id: "prod-5",
    title: "Sézane Charly Linen & Silk Blend Blouse",
    brand: "Sézane",
    category: "Tops",
    gender: "Women",
    size: "M",
    color: "Ecru / Floral Embroidery",
    condition: "Gently Used",
    conditionScore: "9.0/10",
    conditionNotes: "Pristine mother-of-pearl buttons. Delicate embroidery in flawless shape.",
    material: "70% Organic Linen, 30% Mulberry Silk",
    price: 58,
    tokens: 58,
    originalRetail: 125,
    ecoSavings: {
      waterLiters: 890,
      co2Kg: 3.4
    },
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
    source: "Community Trade-in",
    inStock: true
  },
  {
    id: "prod-6",
    title: "COS Relaxed Heavyweight Cotton Overshirt",
    brand: "COS",
    category: "Tops",
    gender: "Unisex",
    size: "M",
    color: "Bone White",
    condition: "Like New",
    conditionScore: "9.2/10",
    conditionNotes: "Heavyweight 280gsm twill weave. No blemishes or collar discoloration.",
    material: "100% Organic Cotton Twill",
    price: 49,
    tokens: 49,
    originalRetail: 99,
    ecoSavings: {
      waterLiters: 1250,
      co2Kg: 4.1
    },
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80",
    source: "Verified Trade-in",
    inStock: true
  },
  {
    id: "prod-7",
    title: "Reformation Juliette High-Slit Midi Dress",
    brand: "Reformation",
    category: "Dresses",
    gender: "Women",
    size: "6 (S/M)",
    color: "Emerald Flora",
    condition: "Like New",
    conditionScore: "9.6/10",
    conditionNotes: "Dry cleaned once, zipper glides smoothly, adjustable straps flawless.",
    material: "100% Eco-Vero Viscose",
    price: 92,
    tokens: 92,
    originalRetail: 218,
    ecoSavings: {
      waterLiters: 1900,
      co2Kg: 6.2
    },
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
    source: "Verified Trade-in",
    inStock: true
  },
  {
    id: "prod-8",
    title: "Fjällräven Kånken Classic Recycled Daypack",
    brand: "Fjällräven",
    category: "Accessories",
    gender: "Unisex",
    size: "16L",
    color: "Forest Ochre",
    condition: "Gently Used",
    conditionScore: "8.7/10",
    conditionNotes: "Vinylon F fabric retains structure and water resistance. Light character marking on base.",
    material: "100% Vinylon F / Recycled SpinDye Polyester",
    price: 42,
    tokens: 42,
    originalRetail: 85,
    ecoSavings: {
      waterLiters: 920,
      co2Kg: 3.1
    },
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
    source: "Verified Trade-in",
    inStock: true
  }
];

class Store {
  constructor() {
    this.products = [...INITIAL_PRODUCTS];
    
    // User wallet state
    // Currency: USD ($). 1 RT = $1 in marketplace; 1 RT = $0.80 cash payout (20% conversion deduction)
    this.wallet = {
      tokenName: "Revé Token",
      tokenSymbol: "RT",
      currencyCode: "USD",
      currencySymbol: "$",
      tokenBalance: 150, // Initial demo balance to test spending or withdrawing
      conversionDeductionRate: 0.20, // 20% conversion deduction on cash-out per spec
      totalEarnedTokens: 210,
      totalSpentTokens: 60,
      totalWithdrawnCash: 0,
      ledger: [
        {
          id: "tx-init-1",
          type: "TRADE_IN_CREDIT",
          title: "Trade-in Accepted: Patagonia Better Sweater",
          date: "2026-10-02T10:15:00Z",
          tokenChange: +65,
          balanceAfter: 65,
          fiatEquivalent: 65,
          status: "Completed",
          referenceId: "TI-9801"
        },
        {
          id: "tx-init-2",
          type: "TRADE_IN_CREDIT",
          title: "Trade-in Accepted: Vintage Woolrich Overshirt",
          date: "2026-10-05T14:30:00Z",
          tokenChange: +85,
          balanceAfter: 150,
          fiatEquivalent: 85,
          status: "Completed",
          referenceId: "TI-9802"
        },
        {
          id: "tx-init-3",
          type: "TRADE_IN_CREDIT",
          title: "Trade-in Accepted: Carhartt WIP Canvas Trousers",
          date: "2026-10-09T09:00:00Z",
          tokenChange: +60,
          balanceAfter: 210,
          fiatEquivalent: 60,
          status: "Completed",
          referenceId: "TI-9803"
        },
        {
          id: "tx-init-4",
          type: "MARKETPLACE_PURCHASE",
          title: "Order #REV-1049: Vintage Levi's Denim Jacket",
          date: "2026-10-10T16:45:00Z",
          tokenChange: -60,
          balanceAfter: 150,
          fiatEquivalent: 60,
          status: "Completed",
          referenceId: "REV-1049"
        }
      ]
    };

    // User cart items: array of { product, quantity }
    this.cart = [];

    // Orders placed
    this.orders = [
      {
        id: "REV-1049",
        date: "2026-10-10T16:45:00Z",
        items: [
          {
            id: "prod-prev-1",
            title: "Vintage Levi's Type III Denim Jacket",
            brand: "Levi's",
            price: 60,
            tokens: 60,
            quantity: 1,
            image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=400&q=80"
          }
        ],
        subtotal: 60,
        shipping: 0,
        totalFiat: 60,
        paidWithTokens: 60,
        paidWithCash: 0,
        paymentMethod: "Revé Tokens (1:1 Value)",
        shippingAddress: {
          fullName: "Alex Rivera",
          street: "742 Evergreen Terrace",
          city: "Portland",
          state: "OR",
          postalCode: "97201"
        },
        status: "Delivered",
        ecoMetrics: {
          waterSaved: 2600,
          co2Avoided: 6.5
        }
      }
    ];

    // Trade-ins submitted by user
    this.tradeIns = [
      {
        id: "TI-9801",
        title: "Patagonia Better Sweater 1/4 Zip",
        brand: "Patagonia",
        category: "Outerwear",
        gender: "Men",
        size: "M",
        material: "100% Recycled Polyester Fleece",
        condition: "Excellent",
        notes: "Light fleece wear on elbows, zipper works perfectly.",
        photoUrl: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=400&q=80",
        submissionDate: "2026-10-01T12:00:00Z",
        assessedValueTokens: 65,
        status: "Credited", // Statuses: 'Submitted', 'Under Review', 'Offer Ready', 'Credited', 'Declined'
        statusMessage: "Accepted and 65 RT credited to wallet on Oct 2, 2026.",
        circularOutcome: "Listed on Marketplace"
      },
      {
        id: "TI-9802",
        title: "Vintage Woolrich Heavyweight Overshirt",
        brand: "Woolrich",
        category: "Outerwear",
        gender: "Men",
        size: "L",
        material: "85% Wool, 15% Nylon",
        condition: "Like New",
        notes: "Classic buffalo check, heavy wool, no moth marks.",
        photoUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=400&q=80",
        submissionDate: "2026-10-04T11:15:00Z",
        assessedValueTokens: 85,
        status: "Credited",
        statusMessage: "Accepted and 85 RT credited to wallet on Oct 5, 2026.",
        circularOutcome: "Listed on Marketplace"
      },
      {
        id: "TI-9804",
        title: "Arc'teryx Atom LT Hoody - Kingfisher",
        brand: "Arc'teryx",
        category: "Outerwear",
        gender: "Unisex",
        size: "L",
        material: "Tyono 20 Nylon, Coreloft 60 Insulation",
        condition: "Like New",
        notes: "Minor scuff on inner cuff. Cinch cords intact, DWR repels water.",
        photoUrl: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=400&q=80",
        submissionDate: "2026-10-11T14:20:00Z",
        assessedValueTokens: 110,
        status: "Offer Ready", // User can click "Accept Offer" to test crediting live!
        statusMessage: "Assessment complete! Offer of 110 RT ($110.00 value) ready for your acceptance.",
        circularOutcome: "Pending User Acceptance"
      }
    ];

    // Donations submitted by user (no tokens or cash returned, circular textile recycling / reuse)
    this.donations = [
      {
        id: "DON-3012",
        title: "Assorted Everyday Tees & Denim",
        itemCount: 8,
        categories: ["Tops", "Bottoms", "Textile Scraps"],
        fabrics: ["Cotton", "Polyester Blend", "Denim"],
        conditionSummary: "Mixed wearable and worn items",
        intendedProgram: "Severely Damaged — Fiber Shredding (Circle Less)",
        dropOffMethod: "Prepaid Eco-Shipping Label",
        trackingNumber: "REV-CIRC-8821948",
        submissionDate: "2026-10-06T11:00:00Z",
        status: "Processed & Recycled",
        impactMetrics: {
          textilesDivertedKg: 4.8,
          waterSavedLiters: 9800,
          landfillDivertedPct: 100
        },
        beneficiaryNotes: "Sorted at Revé Hub Seattle: 5 garments repaired for community clothing drive, 3 shredded into acoustic insulation."
      }
    ];

    // User Badges (supports multiple badges per user)
    this.badges = [
      {
        id: "badge-ceo",
        title: "I AM THE CEO",
        icon: "diamond",
        description: "Chief Executive Officer / Founder Badge"
      }
    ];

    this.userBadges = [
      {
        id: "badge-ceo",
        title: "I AM THE CEO",
        icon: "diamond",
        description: "Chief Executive Officer / Founder Badge"
      }
    ];
  }

  // --- Wallet Helpers ---
  getWalletSummary() {
    const balance = this.wallet.tokenBalance;
    const deductionRate = this.wallet.conversionDeductionRate; // e.g. 0.20
    const cashOutValue = Math.max(0, balance * (1 - deductionRate));
    const deductionAmount = balance * deductionRate;

    return {
      balance,
      symbol: this.wallet.tokenSymbol,
      name: this.wallet.tokenName,
      currencyCode: this.wallet.currencyCode,
      currencySymbol: this.wallet.currencySymbol,
      marketplacePower: balance, // 1:1
      cashOutValue: Number(cashOutValue.toFixed(2)),
      deductionRatePct: Math.round(deductionRate * 100),
      deductionAmount: Number(deductionAmount.toFixed(2)),
      ledger: this.wallet.ledger
    };
  }

  getUserBadges() {
    return this.userBadges || [];
  }

  getPlatformMetrics() {
    const scoring = require("../services/scoring");
    return scoring.calculatePlatformMetrics(this);
  }

  creditTokens(amount, title, referenceId, type = "TRADE_IN_CREDIT") {
    const num = Math.round(Number(amount));
    if (num <= 0) return false;
    this.wallet.tokenBalance += num;
    this.wallet.totalEarnedTokens += num;
    this.wallet.ledger.unshift({
      id: "tx-" + Date.now(),
      type,
      title,
      date: new Date().toISOString(),
      tokenChange: +num,
      balanceAfter: this.wallet.tokenBalance,
      fiatEquivalent: num,
      status: "Completed",
      referenceId
    });
    return true;
  }

  spendTokens(amount, title, referenceId) {
    const num = Math.round(Number(amount));
    if (num <= 0 || num > this.wallet.tokenBalance) return false;
    this.wallet.tokenBalance -= num;
    this.wallet.totalSpentTokens += num;
    this.wallet.ledger.unshift({
      id: "tx-" + Date.now(),
      type: "MARKETPLACE_PURCHASE",
      title,
      date: new Date().toISOString(),
      tokenChange: -num,
      balanceAfter: this.wallet.tokenBalance,
      fiatEquivalent: num,
      status: "Completed",
      referenceId
    });
    return true;
  }

  withdrawTokens(tokenAmount, payoutDestination) {
    const tokens = Math.round(Number(tokenAmount));
    if (tokens <= 0 || tokens > this.wallet.tokenBalance) {
      return { success: false, error: "Insufficient token balance" };
    }
    const deductionRate = this.wallet.conversionDeductionRate;
    const deductionTokens = Math.round(tokens * deductionRate);
    const netCash = Number((tokens - deductionTokens).toFixed(2));

    this.wallet.tokenBalance -= tokens;
    this.wallet.totalWithdrawnCash += netCash;

    const refId = "WD-" + Math.floor(100000 + Math.random() * 900000);
    this.wallet.ledger.unshift({
      id: "tx-" + Date.now(),
      type: "CASH_CONVERSION_WITHDRAWAL",
      title: `Cash-out to ${payoutDestination} (${this.wallet.currencySymbol}${netCash} after ${Math.round(deductionRate * 100)}% deduction)`,
      date: new Date().toISOString(),
      tokenChange: -tokens,
      balanceAfter: this.wallet.tokenBalance,
      fiatEquivalent: netCash,
      deductionTokens,
      payoutDestination,
      status: "Completed",
      referenceId: refId
    });

    return {
      success: true,
      tokensDeducted: tokens,
      deductionTokens,
      netCash,
      referenceId: refId,
      remainingBalance: this.wallet.tokenBalance
    };
  }

  // --- Cart Helpers ---
  getCart() {
    let subtotal = 0;
    let totalWaterSaved = 0;
    let totalCo2Saved = 0;

    const items = this.cart.map(item => {
      const itemSubtotal = item.product.price * item.quantity;
      subtotal += itemSubtotal;
      totalWaterSaved += (item.product.ecoSavings?.waterLiters || 0) * item.quantity;
      totalCo2Saved += (item.product.ecoSavings?.co2Kg || 0) * item.quantity;
      return {
        ...item,
        subtotal: itemSubtotal
      };
    });

    return {
      items,
      count: this.cart.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      tokenSubtotal: subtotal, // 1:1
      totalWaterSaved,
      totalCo2Saved: Number(totalCo2Saved.toFixed(1))
    };
  }

  addToCart(productId, quantity = 1) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return false;

    const existing = this.cart.find(c => c.product.id === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.cart.push({
        product,
        quantity
      });
    }
    return true;
  }

  removeFromCart(productId) {
    this.cart = this.cart.filter(item => item.product.id !== productId);
  }

  clearCart() {
    this.cart = [];
  }
}

// Export singleton instance
module.exports = new Store();
