import express from 'express';
const router = express.Router();
import dotenv from "dotenv";
dotenv.config();
import Stripe from 'stripe';
import Payment from '../models/Payment.js';
import Shop from '../models/shop.js';
import User from '../models/user.js';
import nodemailer from 'nodemailer';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create PaymentIntent
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency, metadata } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount provided' });
    }

    if (!currency) {
      return res.status(400).json({ error: 'Currency is required' });
    }

    const amountInCents = Math.round(Number(amount));
    if (isNaN(amountInCents) || amountInCents < 50) {
      return res.status(400).json({ error: 'Amount must be at least $0.50' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      metadata: metadata || {},
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (err) {
    console.error('Stripe PaymentIntent creation error:', err);

    if (err.type === 'StripeCardError') {
      res.status(400).json({ error: err.message });
    } else if (err.type === 'StripeInvalidRequestError') {
      res.status(400).json({ error: 'Invalid request parameters' });
    } else if (err.type === 'StripeAPIError') {
      res.status(500).json({ error: 'Stripe API error occurred' });
    } else if (err.type === 'StripeConnectionError') {
      res.status(500).json({ error: 'Network error occurred' });
    } else if (err.type === 'StripeAuthenticationError') {
      res.status(401).json({ error: 'Stripe authentication failed' });
    } else {
      res.status(500).json({ error: 'An unexpected error occurred' });
    }
  }
});

// Save Payment + Reduce Stock
router.post('/save-payment', async (req, res) => {
  try {
    const { userId, itemId, quantity, amount, currency, paymentIntentId, status } = req.body;

    if (!userId || !itemId || !amount || !paymentIntentId || !quantity) {
      return res.status(400).json({
        error: 'Missing required fields: userId, itemId, quantity, amount, and paymentIntentId are required'
      });
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ error: 'Invalid amount provided' });
    }

    const numericQty = Number(quantity);
    if (isNaN(numericQty) || numericQty <= 0) {
      return res.status(400).json({ error: 'Invalid quantity provided' });
    }

    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({
          error: 'Payment not completed successfully',
          stripeStatus: paymentIntent.status
        });
      }
    } catch (stripeError) {
      console.error('Error verifying payment with Stripe:', stripeError);
    }

    const existingPayment = await Payment.findOne({ PaymentID: String(paymentIntentId) });
    if (existingPayment) {
      return res.status(409).json({
        error: 'Payment already recorded',
        payment: existingPayment
      });
    }

    const shop = await Shop.findOne({ "items._id": itemId });
    if (!shop) {
      return res.status(404).json({ error: 'Item not found in any shop' });
    }

    const item = shop.items.id(itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (item.availableqty < numericQty) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    item.availableqty -= numericQty;
    await shop.save();

    const payment = new Payment({
      userId,
      itemId,
      quantity: numericQty,
      amount: numericAmount,
      currency: currency || 'usd',
      PaymentID: paymentIntentId,
      status: status || 'succeeded'
    });

    const savedPayment = await payment.save();

    const user = await User.findOne({ firebaseUid: userId });
    console.log('User found:', user ? 'Yes' : 'No');
    console.log('User email:', user?.email);
    
    if (user?.email) {
      await sendPaymentSuccessEmail(user, savedPayment, item);
    } else {
      console.log('❌ User not found or email missing for userId:', userId);
    }

    res.json({
      success: true,
      payment: savedPayment
    });

  } catch (err) {
    console.error('Error saving payment:', err);

    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      res.status(400).json({ error: 'Validation error', details: errors });
    } else if (err.code === 11000) {
      res.status(409).json({ error: 'Payment record already exists' });
    } else {
      res.status(500).json({ error: 'Failed to save payment details' });
    }
  }
});

// Get payment by ID
router.get('/payment/:paymentIntentId', async (req, res) => {
  try {
    const { paymentIntentId } = req.params;

    const payment = await Payment.findOne({ PaymentID: String(paymentIntentId) });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({ payment });

  } catch (err) {
    console.error('Error fetching payment:', err);
    res.status(500).json({ error: 'Failed to fetch payment details' });
  }
});

// Get user payments
router.get('/payments/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, skip = 0 } = req.query;

    const payments = await Payment.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Payment.countDocuments({ userId });

    res.json({
      payments,
      total,
      hasMore: total > parseInt(skip) + parseInt(limit)
    });

  } catch (err) {
    console.error('Error fetching user payments:', err);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
});

// Get all payments
router.get('/payments', async (req, res) => {
  try {
    const { limit = 20, skip = 0, status } = req.query;

    let query = {};
    if (status) {
      query.status = status;
    }

    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Payment.countDocuments(query);

    res.json({
      payments,
      total,
      hasMore: total > parseInt(skip) + parseInt(limit)
    });
  } catch (err) {
    console.error('Error fetching all payments:', err);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});



// Update payment status (for admin use)
router.put('/payment/:paymentId/status', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'succeeded', 'failed', 'canceled', 'refunded'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status provided' });
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    payment.status = status;
    await payment.save();

    // Return enriched data
    const enrichedPayment = await payment.getEnrichedData();

    res.json({
      success: true,
      payment: enrichedPayment
    });

  } catch (err) {
    console.error('Error updating payment status:', err);
    res.status(500).json({ error: 'Failed to update payment status' });
  }
});

// Delete payment (for admin use)
router.delete('/payment/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    await Payment.findByIdAndDelete(paymentId);

    res.json({
      success: true,
      message: 'Payment deleted successfully'
    });

  } catch (err) {
    console.error('Error deleting payment:', err);
    res.status(500).json({ error: 'Failed to delete payment' });
  }
});

// Get payment statistics
router.get('/payments/stats/:userId?', async (req, res) => {
  try {
    const { userId } = req.params;

    let matchStage = {};
    if (userId) {
      matchStage = { userId };
    }

    const stats = await Payment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      {
        $group: {
          _id: null,
          statusStats: {
            $push: {
              status: '$_id',
              count: '$count',
              totalAmount: '$totalAmount'
            }
          },
          totalPayments: { $sum: '$count' },
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    const result = stats[0] || {
      statusStats: [],
      totalPayments: 0,
      totalRevenue: 0
    };

    res.json(result);

  } catch (err) {
    console.error('Error fetching payment stats:', err);
    res.status(500).json({ error: 'Failed to fetch payment statistics' });
  }
});

//Email send function
const sendPaymentSuccessEmail = async (user, payment, item) => {
  try {
   
    
    if (!user?.email) {
      console.error('❌ No email address provided for user');
      return;
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ Email credentials not set in environment variables');
      return;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    
    const formatAddress = (user) => {
      const addressParts = [];
      
      if (user.address1) addressParts.push(user.address1);
      if (user.address2) addressParts.push(user.address2);
      if (user.postalCode) addressParts.push(`Postal Code: ${user.postalCode}`);
      
      return addressParts.length > 0 ? addressParts.join('<br>') : 'Address not provided';
    };

    // Format currency amount
    const formatAmount = (amount, currency) => {
      try {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currency.toUpperCase()
        }).format(amount);
      } catch (error) {
        return `${currency.toUpperCase()} ${amount}`;
      }
    };

   

    const mailOptions = {
      from: `"ShuttleMate Shop" <${process.env.EMAIL_USER}>`,
      to: user.email.trim(), 
      subject: 'Payment Confirmation - Thank You!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #28a745; text-align: center;">Payment Successful ✅</h2>
          
          <p>Dear ${user.name || 'Customer'},</p>
          <p>Thank you for your purchase! Your payment has been processed successfully.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Order Details:</h3>
            <p><strong>Item Name:</strong> ${item?.name || 'Item'}</p>
            <p><strong>Amount:</strong> ${formatAmount(payment.amount, payment.currency)}</p>
            <p><strong>Payment ID:</strong> ${payment.PaymentID}</p>
            <p><strong>Transaction Date:</strong> ${new Date(payment.createdAt).toLocaleDateString()}</p>
          </div>
          
          <div style="background-color: #e9ecef; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Delivery Address:</h3>
            <p>${formatAddress(user)}</p>
            ${user.phoneNumber ? `<p><strong>Phone:</strong> ${user.phoneNumber}</p>` : ''}
          </div>
          
          <div style="background-color: #d1ecf1; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #17a2b8;">
            <p style="margin: 0;"><strong>Delivery Information:</strong></p>
            <p style="margin: 5px 0 0 0;">Your order will be delivered within 5 days to the address provided above.</p>
          </div>
          
          <p>We appreciate your business and look forward to serving you again!</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="text-align: center; color: #666; font-size: 14px;">
            If you have any questions about your order, please contact our customer support.
          </p>
        </div>
      `,
    };

    

    const result = await transporter.sendMail(mailOptions);
    

  } catch (error) {
    console.error('❌ Error sending email:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      command: error.command
    });
    console.error('User email:', user?.email);
    console.error('User object keys:', user ? Object.keys(user) : 'No user');
  }
};

export default router;
