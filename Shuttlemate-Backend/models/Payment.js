import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  userId: {
    type:String,
    ref: 'User', 
    required: [true, 'User ID is required']
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item', 
    required: [true, 'Item ID is required']
  },
quantity: {
    type: Number,
    required: [false, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    default: 1
  },
  
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be positive'],
    validate: {
      validator: function(v) {
        return v > 0;
      },
      message: 'Amount must be greater than 0'
    }
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    uppercase: true,
    trim: true,
    minlength: [3, 'Currency code must be 3 characters'],
    maxlength: [3, 'Currency code must be 3 characters'],
    default: 'USD'
  },
  PaymentID: {
    type: String,
    required: [true, 'Payment Intent ID is required'],
    unique: true,
    trim: true,
    index: true
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: {
      values: ['pending', 'succeeded', 'failed', 'canceled', 'refunded'],
      message: '{VALUE} is not a valid payment status'
    },
    default: 'pending'
  },
  metadata: {
    type: Map,
    of: String,
    default: new Map()
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    index: true
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


PaymentSchema.index({ userId: 1, createdAt: -1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ createdAt: -1 });


PaymentSchema.virtual('paymentIntentId').get(function() {
  return this.PaymentID;
});

PaymentSchema.virtual('paymentIntentId').set(function(value) {
  this.PaymentID = value;
});

PaymentSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.currency
  }).format(this.amount);
});

PaymentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to find payments by user with populated data
PaymentSchema.statics.findByUserWithDetails = function(userId, options = {}) {
  const { limit = 10, skip = 0, status } = options;
  
  let query = this.find({ userId });
  
  if (status) {
    query = query.where({ status });
  }
  
  return query
    .populate('userId', 'name email firebaseUid phoneNumber address1 address2 postalCode')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

PaymentSchema.statics.findByUser = function(userId, options = {}) {
  const { limit = 10, skip = 0, status } = options;
  
  let query = this.find({ userId });
  
  if (status) {
    query = query.where({ status });
  }
  
  return query
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

PaymentSchema.statics.getUserStats = function(userId) {
  return this.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);
};

// Static method to get all payments with enriched data
PaymentSchema.statics.findAllWithDetails = async function(options = {}) {
  const { limit = 20, skip = 0, status } = options;
  
  let query = {};
  if (status) {
    query.status = status;
  }

  // Get payments first
  const payments = await this.find(query)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(skip));

  // Import models dynamically to avoid circular dependencies
  const User = mongoose.model('User');
  const Shop = mongoose.model('shops');

  // Enrich payment data
  const enrichedPayments = await Promise.all(
    payments.map(async (payment) => {
      try {
        // Get user data
        const user = await User.findOne({ firebaseUid: payment.userId }).select('name email firebaseUid phoneNumber address1 address2 postalCode');
        
        // Get item data from shop
        const shop = await Shop.findOne(
          { "items._id": payment.itemId },
          { "items.$": 1, ShopName: 1 }
        );
        
        const item = shop?.items?.[0];
        
        return {
          ...payment.toObject(),
          userName: user?.name || 'Unknown User',
          userEmail: user?.email || '',
          itemName: item?.name || 'Unknown Item',
          itemPrice: item?.price || 0,
          shopName: item?.shopName || shop?.ShopName || 'Unknown Shop',
          itemPhoto: item?.itemphoto || ''
        };
      } catch (error) {
        console.error(`Error enriching payment ${payment._id}:`, error);
        return {
          ...payment.toObject(),
          userName: 'Error Loading',
          userEmail: '',
          itemName: 'Error Loading',
          itemPrice: 0,
          shopName: 'Unknown Shop',
          itemPhoto: ''
        };
      }
    })
  );

  return enrichedPayments;
};

PaymentSchema.methods.markAsFailed = function() {
  this.status = 'failed';
  this.updatedAt = new Date();
  return this.save();
};

PaymentSchema.methods.markAsSucceeded = function() {
  this.status = 'succeeded';
  this.updatedAt = new Date();
  return this.save();
};

// Instance method to get enriched payment data
PaymentSchema.methods.getEnrichedData = async function() {
  const User = mongoose.model('User');
  const Shop = mongoose.model('shops');

  try {
    // Get user data
    const user = await User.findOne({ firebaseUid: this.userId }).select('name email firebaseUid phoneNumber address1 address2 postalCode');
    
    // Get item data from shop
    const shop = await Shop.findOne(
      { "items._id": this.itemId },
      { "items.$": 1, ShopName: 1 }
    );
    
    const item = shop?.items?.[0];
    
    return {
      ...this.toObject(),
      userName: user?.name || 'Unknown User',
      userEmail: user?.email || '',
      itemName: item?.name || 'Unknown Item',
      itemPrice: item?.price || 0,
      shopName: item?.shopName || shop?.ShopName || 'Unknown Shop',
      itemPhoto: item?.itemphoto || ''
    };
  } catch (error) {
    console.error(`Error enriching payment ${this._id}:`, error);
    return {
      ...this.toObject(),
      userName: 'Error Loading',
      userEmail: '',
      itemName: 'Error Loading',
      itemPrice: 0,
      shopName: 'Unknown Shop',
      itemPhoto: ''
    };
  }
};

const Payment = mongoose.model('Payment', PaymentSchema);

export default Payment;
