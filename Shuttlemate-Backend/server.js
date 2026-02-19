import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import { connectDB } from "./config/db.js";
import videoRoutes from "./routes/video.js";
import CoachRoutes from "./routes/Coachers.js";
import CourtRoutes from "./routes/Courts.js";
import ShopRoutes from "./routes/shops.js";
import itemRoutes from "./routes/Item.js";
import MatchesRoute from "./routes/Matches.js";
import user from "./routes/user.js";
import Availability from "./routes/Availabilty.js";
import Booking from "./routes/Booking.js";
import CourtAvailability from "./routes/CourtAvailability.js";
import CourtBooking from "./routes/CourtBooking.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import notificationRoutes from "./routes/Notification.js";
import paymentRoutes from "./routes/payment.js";
import NewsRoute from "./routes/news.js";

// Express App
const app = express();
const port = process.env.PORT || 5001;

// CORS Configuration
const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.disable("x-powered-by");
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; frame-ancestors 'none'; form-action 'self'; base-uri 'self'; object-src 'none'",
  );
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  next();
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Routes
app.use("/api/videos", videoRoutes);
app.use("/api/coachers", CoachRoutes);
app.use("/api/courts", CourtRoutes);
app.use("/api/shops", ShopRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/matches", MatchesRoute);
app.use("/api/user", user);
app.use("/api/coachers", Availability);
app.use("/api/coachers", Booking);
app.use("/api/courts", CourtAvailability);
app.use("/api/courts", CourtBooking);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/payment", paymentRoutes.default || paymentRoutes);
app.use("/api/news", NewsRoute);

app.listen(port, () => {
  // connect to DB
  connectDB();
  console.log("Server started listening on port", port);
});
