const express = require('express');
const router = express.Router();
const axios = require('axios');
const Payment = require('../models/Payment');
const Score = require('../models/Score');

// Completar un pago y guardar puntuación
router.post('/complete', async (req, res) => {
    try {
        const { paymentId, userId, username, score } = req.body;

        if (!paymentId || !userId || !username || score === undefined) {
            return res.status(400).json({ 
                success: false, 
                message: 'Todos los campos son requeridos' 
            });
        }

        // Verificar si el pago ya existe
        let payment = await Payment.findOne({ paymentId });

        if (payment) {
            // Si el pago ya está completado, devolver éxito
            if (payment.status === 'completed') {
                return res.json({
                    success: true,
                    message: 'Pago ya procesado anteriormente',
                    payment
                });
            }
        } else {
            // Crear nuevo registro de pago
            payment = new Payment({
                paymentId,
                userId,
                amount: 1, // 1 Pi para guardar puntuación
                memo: `Guardar puntuación: ${score} puntos - Simon Pi Game`,
                metadata: { score },
                status: 'created'
            });
            await payment.save();
        }

        // En producción, aquí verificaríamos el estado del pago con la API de Pi
        try {
            // Simulación para entorno de desarrollo
            console.log('Completando pago con Pi Network API:', paymentId);
            
            // En producción, usaríamos algo como:
            // const piResponse = await axios.post(
            //     `https://api.minepi.com/v2/payments/${paymentId}/complete`,
            //     { txid: 'blockchain_txid_here' },
            //     { headers: { 'Authorization': `Key ${process.env.PI_API_KEY}` }}
            // );
            
            // Actualizar estado del pago a completado
            payment.status = 'completed';
            payment.completedAt = Date.now();
            await payment.save();
            
            // Guardar la puntuación
            const newScore = new Score({
                userId,
                username,
                score,
                payment: {
                    paymentId,
                    amount: 1,
                    status: 'completed',
                    completedAt: new Date()
                }
            });
            await newScore.save();
            
            return res.json({
                success: true,
                message: 'Pago completado y puntuación guardada',
                payment,
                score: newScore
            });
        } catch (error) {
            console.error('Error al completar pago con Pi API:', error);
            
            // Actualizar estado del pago a error
            payment.status = 'error';
            await payment.save();
            
            return res.status(500).json({ 
                success: false, 
                message: 'Error al procesar el pago' 
            });
        }
    } catch (error) {
        console.error('Error en procesamiento de pago:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor' 
        });
    }
});

// Obtener información de un pago
router.get('/:paymentId', async (req, res) => {
    try {
        const { paymentId } = req.params;
        const payment = await Payment.findOne({ paymentId });
        
        if (!payment) {
            return res.status(404).json({ 
                success: false, 
                message: 'Pago no encontrado' 
            });
        }
        
        res.json({
            success: true,
            payment
        });
    } catch (error) {
        console.error('Error al obtener información del pago:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor' 
        });
    }
});

module.exports = router;
