function safeNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function roundMoney(value) {
  return +safeNumber(value).toFixed(2);
}

function createMoneyBag() {
  return { UZS: 0, USD: 0 };
}

function ensureCustomerCashback(customer) {
  if (!customer.cashback_balance) customer.cashback_balance = createMoneyBag();
  if (!customer.cashback_total_earned) {
    customer.cashback_total_earned = createMoneyBag();
  }
  if (!customer.cashback_total_paid) customer.cashback_total_paid = createMoneyBag();
  if (!Array.isArray(customer.cashback_history)) customer.cashback_history = [];

  for (const currency of ["UZS", "USD"]) {
    customer.cashback_balance[currency] = roundMoney(
      customer.cashback_balance[currency],
    );
    customer.cashback_total_earned[currency] = roundMoney(
      customer.cashback_total_earned[currency],
    );
    customer.cashback_total_paid[currency] = roundMoney(
      customer.cashback_total_paid[currency],
    );
  }

  return customer;
}

function calculateLineCashback({ subtotal, cashbackPercent }) {
  const percent = Math.max(0, safeNumber(cashbackPercent));
  const lineSubtotal = Math.max(0, safeNumber(subtotal));

  return {
    cashbackPercent: percent,
    cashbackAmount: roundMoney((lineSubtotal * percent) / 100),
  };
}

function buildCashbackSummaryFromItems(items = []) {
  const summary = {
    UZS: { earned: 0, used: 0 },
    USD: { earned: 0, used: 0 },
  };

  for (const item of items) {
    const currency = item.currency === "USD" ? "USD" : "UZS";
    summary[currency].earned = roundMoney(
      summary[currency].earned + safeNumber(item.cashbackAmount),
    );
  }

  return summary;
}

function applyUsedCashback(customer, sale, note = "") {
  ensureCustomerCashback(customer);

  for (const currency of ["UZS", "USD"]) {
    const amount = roundMoney(sale?.cashback?.[currency]?.used || 0);
    if (amount <= 0) continue;

    customer.cashback_balance[currency] = roundMoney(
      Math.max(0, customer.cashback_balance[currency] - amount),
    );
    customer.cashback_total_paid[currency] = roundMoney(
      customer.cashback_total_paid[currency] + amount,
    );

    pushCashbackHistory(customer, {
      type: "USE",
      currency,
      amount,
      source: "SALE",
      saleId: sale?._id,
      note: note || `Sale ${sale?.invoiceNo || ""} cashback ishlatildi`,
    });
  }
}

function rollbackUsedCashback(customer, sale, note = "") {
  ensureCustomerCashback(customer);

  for (const currency of ["UZS", "USD"]) {
    const amount = roundMoney(sale?.cashback?.[currency]?.used || 0);
    if (amount <= 0) continue;

    customer.cashback_balance[currency] = roundMoney(
      customer.cashback_balance[currency] + amount,
    );
    customer.cashback_total_paid[currency] = roundMoney(
      Math.max(0, customer.cashback_total_paid[currency] - amount),
    );

    pushCashbackHistory(customer, {
      type: "ROLLBACK",
      currency,
      amount,
      source: "SALE",
      saleId: sale?._id,
      note: note || `Sale ${sale?.invoiceNo || ""} ishlatilgan cashback qaytarildi`,
    });
  }
}

function pushCashbackHistory(customer, entry) {
  ensureCustomerCashback(customer);
  customer.cashback_history.push({
    type: entry.type,
    currency: entry.currency,
    amount: roundMoney(entry.amount),
    source: entry.source || "ADMIN",
    saleId: entry.saleId || null,
    note: entry.note || "",
    date: entry.date || new Date(),
  });
}

function applyEarnedCashback(customer, sale, note = "") {
  ensureCustomerCashback(customer);

  for (const currency of ["UZS", "USD"]) {
    const amount = roundMoney(sale?.cashback?.[currency]?.earned || 0);
    if (amount <= 0) continue;

    customer.cashback_balance[currency] = roundMoney(
      customer.cashback_balance[currency] + amount,
    );
    customer.cashback_total_earned[currency] = roundMoney(
      customer.cashback_total_earned[currency] + amount,
    );

    pushCashbackHistory(customer, {
      type: "EARN",
      currency,
      amount,
      source: "SALE",
      saleId: sale?._id,
      note: note || `Sale ${sale?.invoiceNo || ""} cashback`,
    });
  }
}

function rollbackEarnedCashback(customer, sale, note = "") {
  ensureCustomerCashback(customer);

  for (const currency of ["UZS", "USD"]) {
    const amount = roundMoney(sale?.cashback?.[currency]?.earned || 0);
    if (amount <= 0) continue;

    customer.cashback_balance[currency] = roundMoney(
      Math.max(0, customer.cashback_balance[currency] - amount),
    );

    pushCashbackHistory(customer, {
      type: "ROLLBACK",
      currency,
      amount,
      source: "SALE",
      saleId: sale?._id,
      note: note || `Sale ${sale?.invoiceNo || ""} cashback rollback`,
    });
  }
}

module.exports = {
  safeNumber,
  roundMoney,
  createMoneyBag,
  ensureCustomerCashback,
  calculateLineCashback,
  buildCashbackSummaryFromItems,
  pushCashbackHistory,
  applyEarnedCashback,
  applyUsedCashback,
  rollbackEarnedCashback,
  rollbackUsedCashback,
};
