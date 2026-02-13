import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import { connectDB } from "./config/db.js";
import videoRoutes from "./routes/video.js";
import CoachRoutes from "./routes/Coachers.js"
import CourtRoutes from "./routes/Courts.js";
import ShopRoutes from "./routes/shops.js";
import itemRoutes from "./routes/Item.js";
import MatchesRoute from  "./routes/Matches.js"
import user from "./routes/user.js"
import Availability from './routes/Availabilty.js'
import Booking from './routes/Booking.js'
import CourtAvailability from './routes/CourtAvailability.js'
import CourtBooking from './routes/CourtBooking.js'
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import notificationRoutes from './routes/Notification.js';
import paymentRoutes from './routes/payment.js';
import NewsRoute from './routes/news.js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Express App
const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());

// STRIPE WEBHOOK ROUTE (Must be before express.json() for raw body parsing)
app.post('/api/payment/webhook', express.raw({type: 'application/json'}), (request, response) => {
  const sig = request.headers['stripe-signature'];
  let event;

  try {
    // SECURITY CHECK: Verify the signature
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook Signature Verification Failed: ${err.message}`);
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    console.log('Payment captured verified:', paymentIntent.id);
    // TODO: Update your Booking Status in Database here
  }

  response.send();
});

app.use(express.json());

// Routes
app.use("/api/videos", videoRoutes);
app.use("/api/coachers",CoachRoutes);
app.use("/api/courts",CourtRoutes);
app.use("/api/shops",ShopRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/matches",MatchesRoute);
app.use("/api/user", user);
app.use("/api/coachers", Availability);
app.use("/api/coachers", Booking);
app.use("/api/courts",CourtAvailability);
app.use("/api/courts",CourtBooking);
app.use("/api/auth",authRoutes);
app.use("/api/users",userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/payment", paymentRoutes.default || paymentRoutes);
app.use("/api/news", NewsRoute);


app.listen(port, () => {
  // connect to DB
  connectDB();
  console.log("Server started listening on port", port);
});