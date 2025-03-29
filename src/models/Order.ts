import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    price: {
        type: Number,
        required: true,
    },
});

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'payment_uploaded', 'verified', 'completed', 'cancelled'],
        default: 'pending',
    },
    paymentProof: {
        type: String, // URL to the payment proof image
    },
    paymentDetails: {
        bankName: String,
        accountNumber: String,
        accountName: String,
    },
    notes: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Update the updatedAt timestamp before saving
orderSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order; 