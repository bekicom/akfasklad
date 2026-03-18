const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    supplier_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
      index: true,
    },

    // 🔥 ARCHIVE FLAG
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    model: {
      type: String,
      default: null,
      trim: true,
    },

    images: {
      type: [String],
      default: [],
    },

    color: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      default: "",
      trim: true,
    },

    unit: {
      type: String,
      enum: ["DONA", "PACHKA", "KG"],
      required: true,
    },

    warehouse_currency: {
      type: String,
      enum: ["UZS", "USD"],
      required: true,
      index: true,
    },

    qty: {
      type: Number,
      default: 0,
      min: 0,
    },

    buy_price: {
      type: Number,
      required: true,
      min: 0,
    },

    sell_price: {
      type: Number,
      required: true,
      min: 0,
    },

    cashback_percent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true },
);

/**
 * 🔒 UNIQUE ACTIVE PRODUCT
 * isActive = true bo‘lganda
 * agar shu maydonlardan bittasi o‘zgarsa → YANGI PRODUCT
 */
productSchema.index(
  {
    supplier_id: 1,
    name: 1,
    model: 1,
    color: 1,
    warehouse_currency: 1,
    buy_price: 1,
    sell_price: 1,
    unit: 1,
  },
  {
    unique: true,
    partialFilterExpression: { isActive: true },
  },
);

module.exports = mongoose.model("Product", productSchema);
