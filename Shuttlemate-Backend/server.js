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
import fs from "fs"; 
import https from "https"; 

// Express App
const app = express();
const port = process.env.PORT || 5001;

// CORS Configuration
const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:3000", "https://localhost:5173", "https://localhost:5174"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
};
app.use(helmet()); 
app.use(helmet.hidePoweredBy());
app.use(helmet.frameguard({ action: "deny" }));
app.use(cors(corsOptions));
app.use(express.json());

app.use(helmet.hsts({
  maxAge: 31536000,         
  includeSubDomains: true,   
  preload: true              
}));

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


const sslOptions = {
  key: fs.readFileSync('./ssl/server.key'),
  cert: fs.readFileSync('./ssl/server.crt')
};

https.createServer(sslOptions, app).listen(port, () => {
  connectDB();
  console.log(`✅ Secure HTTPS server running on https://localhost:${port}`);
});
