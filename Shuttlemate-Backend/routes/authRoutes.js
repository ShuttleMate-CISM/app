import express from 'express';
import rateLimit from 'express-rate-limit'; // <--- Import this
import {register, login,getUsers, deleteUser} from '../controllers/authController.js'
const router = express.Router();

// DEFINING THE LIMITER
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 5, // Limit each IP to 5 requests per window
  message: {
    success: false,
    message: "Security Alert: Too many login attempts. Try again in 15 minutes."
  },
  standardHeaders: true, 
  legacyHeaders: false,
});

router.post("/register", register);
// APPLYING IT TO THE ROUTE
router.post("/login", loginLimiter, login); // <--- Added loginLimiter middleware
router.get("/users", getUsers);
router.delete("/delete/:id", deleteUser);


export default router;