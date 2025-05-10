const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        ref: 'User'
    },
    username: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    payment: {
        paymentId: String,
        amount: Number,
        status: String,
        completedAt: Date
    }
}, { timestamps: true });

// Índice para buscar rápidamente los mejores puntajes
scoreSchema.index({ score: -1 });

module.exports = mongoose.model('Score', scoreSchema);
