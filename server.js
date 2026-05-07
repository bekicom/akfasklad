require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const bcrypt = require("bcrypt");

const skladRoutes = require("./routes");
const User = require("./modules/Users/User");

const app = express();

/* ======================
   CORS
====================== */
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((s) => s.trim())
  : true;

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ======================
   HTTP SERVER
====================== */
const server = http.createServer(app);

/* ======================
   SOCKET.IO
====================== */
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// 🔥 ENG MUHIM QATOR
app.use((req, res, next) => {
  req.io = io;
  next();
});

/* ======================
   ROUTES
====================== */
app.use("/api", skladRoutes);

/* ======================
   SOCKET EVENTS
====================== */
io.on("connection", (socket) => {
  socket.join("cashiers");
  console.log("🟢 SOCKET CONNECTED:", socket.id);

  socket.emit("socket:ready", { ok: true });

  socket.on("disconnect", (reason) => {
    console.log("🔴 SOCKET DISCONNECT:", socket.id, reason);
  });
});

/* ======================
   MONGODB + START
====================== */
async function ensureDefaultAdmin() {
  const exists = await User.findOne({ login: "admin" });
  if (exists) return;

  const hashedPassword = await bcrypt.hash("0000", 10);
  await User.create({
    name: "Default Admin",
    phone: "0000",
    login: "admin",
    password: hashedPassword,
    role: "ADMIN",
  });

  console.log("Default admin created: admin / 0000");
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected");
    await ensureDefaultAdmin();

    const PORT = process.env.PORT || 8071;
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB error:", err);
  });
