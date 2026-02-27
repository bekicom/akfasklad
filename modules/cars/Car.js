const mongoose = require("mongoose");

const CarSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    model: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
      min: 1886,
      max: 2100,
    },
    mileage: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.models.Car || mongoose.model("Car", CarSchema);
