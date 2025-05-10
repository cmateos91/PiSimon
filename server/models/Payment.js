const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    paymentId: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: String,
        required: true,
        ref: 'User'
    },
    amount: {
        type: Number,
        required: true
    },
    memo: String,
    metadata: mongoose.Schema.Types.Mixed,
    status: {
        type: String,
        enum: ['created', 'approved', 'completed', 'cancelled', 'error'],
        default: 'created'
    },
    completedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
