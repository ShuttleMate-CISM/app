

// routes/notificationRoutes.js

import express from 'express';
import {
  registerToken,
  sendNotification,
} from '../controllers/notificationController.js';

const router = express.Router();

router.post('/register-token', registerToken);
router.post('/send-notification', sendNotification);

export default router;
