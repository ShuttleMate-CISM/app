
import admin from '../firebase/firebaseAdmin.js';

const tokens = new Set();

export const registerToken = (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, message: 'Token is required' });
  }

  tokens.add(token);
  return res.status(200).json({ success: true, message: 'Token registered successfully' });
};

export const getRegisteredTokens = () => [...tokens];

export const sendNotification = async (req, res) => {
  const { token, title, body } = req.body;

  if (!token || !title || !body) {
    return res.status(400).json({
      success: false,
      message: 'Token, title, and body are required.',
    });
  }

  const message = {
    token,
    notification: {
      title,
      body,
    },
  };

  try {
    const response = await admin.messaging().send(message);
    return res.status(200).json({
      success: true,
      message: 'Notification sent successfully',
      response,
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send notification',
      error: error.message,
    });
  }
};
