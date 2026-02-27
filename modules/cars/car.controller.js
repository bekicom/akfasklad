const mongoose = require("mongoose");
const Car = require("./Car");

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

exports.createCar = async (req, res) => {
  try {
    const { name, model, year, mileage } = req.body || {};

    if (!name || !String(name).trim()) {
      return res.status(400).json({ ok: false, message: "name majburiy" });
    }

    if (!model || !String(model).trim()) {
      return res.status(400).json({ ok: false, message: "model majburiy" });
    }

    const parsedYear = toNumber(year);
    if (!parsedYear || parsedYear < 1886 || parsedYear > 2100) {
      return res.status(400).json({
        ok: false,
        message: "year 1886 va 2100 oralig'ida bo'lishi kerak",
      });
    }

    const parsedMileage = toNumber(mileage);
    if (parsedMileage === null || parsedMileage < 0) {
      return res.status(400).json({
        ok: false,
        message: "mileage 0 yoki undan katta bo'lishi kerak",
      });
    }

    const car = await Car.create({
      name: String(name).trim(),
      model: String(model).trim(),
      year: parsedYear,
      mileage: parsedMileage,
    });

    return res.status(201).json({
      ok: true,
      message: "Mashina qo'shildi",
      data: car,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Server xatoligi",
      error: error.message,
    });
  }
};

exports.getCars = async (_req, res) => {
  try {
    const cars = await Car.find().sort({ createdAt: -1 }).lean();

    return res.json({
      ok: true,
      total: cars.length,
      items: cars,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Server xatoligi",
      error: error.message,
    });
  }
};

exports.getCarById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ ok: false, message: "id noto'g'ri" });
    }

    const car = await Car.findById(id).lean();
    if (!car) {
      return res.status(404).json({ ok: false, message: "Mashina topilmadi" });
    }

    return res.json({ ok: true, data: car });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Server xatoligi",
      error: error.message,
    });
  }
};

exports.updateCar = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ ok: false, message: "id noto'g'ri" });
    }

    const car = await Car.findById(id);
    if (!car) {
      return res.status(404).json({ ok: false, message: "Mashina topilmadi" });
    }

    const { name, model, year, mileage } = req.body || {};

    if (name !== undefined) {
      if (!String(name).trim()) {
        return res
          .status(400)
          .json({ ok: false, message: "name bo'sh bo'lmasin" });
      }
      car.name = String(name).trim();
    }

    if (model !== undefined) {
      if (!String(model).trim()) {
        return res
          .status(400)
          .json({ ok: false, message: "model bo'sh bo'lmasin" });
      }
      car.model = String(model).trim();
    }

    if (year !== undefined) {
      const parsedYear = toNumber(year);
      if (!parsedYear || parsedYear < 1886 || parsedYear > 2100) {
        return res.status(400).json({
          ok: false,
          message: "year 1886 va 2100 oralig'ida bo'lishi kerak",
        });
      }
      car.year = parsedYear;
    }

    if (mileage !== undefined) {
      const parsedMileage = toNumber(mileage);
      if (parsedMileage === null || parsedMileage < 0) {
        return res.status(400).json({
          ok: false,
          message: "mileage 0 yoki undan katta bo'lishi kerak",
        });
      }
      car.mileage = parsedMileage;
    }

    await car.save();

    return res.json({
      ok: true,
      message: "Mashina yangilandi",
      data: car,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Server xatoligi",
      error: error.message,
    });
  }
};

exports.deleteCar = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ ok: false, message: "id noto'g'ri" });
    }

    const deleted = await Car.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ ok: false, message: "Mashina topilmadi" });
    }

    return res.json({
      ok: true,
      message: "Mashina o'chirildi",
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Server xatoligi",
      error: error.message,
    });
  }
};
