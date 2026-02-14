import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import helmet from "helmet";
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
// SECURITY HEADERS (Helmet - Infrastructure Security)
app.use(helmet()); // Sets various HTTP security headers
app.use(helmet.hidePoweredBy()); // Explicitly hide X-Powered-By header
app.use(helmet.frameguard({ action: "deny" })); // Prevent Clickjacking
app.use(cors(corsOptions));
app.use(express.json());

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
