const express = require('express');
const router = express.Router();
const Score = require('../models/Score');

// Obtener clasificación de mejores puntuaciones
router.get('/', async (req, res) => {
    try {
        // Obtener los 10 mejores puntajes
        const scores = await Score.find()
            .sort({ score: -1 }) // Ordenar por puntuación descendente
            .limit(10)
            .select('username score createdAt');
        
        res.json(scores);
    } catch (error) {
        console.error('Error al obtener ranking:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor' 
        });
    }
});

// Obtener puntuaciones de un usuario específico
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Obtener los puntajes del usuario
        const scores = await Score.find({ userId })
            .sort({ score: -1 }) // Ordenar por puntuación descendente
            .select('username score createdAt');
        
        res.json(scores);
    } catch (error) {
        console.error('Error al obtener puntuaciones del usuario:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor' 
        });
    }
});

module.exports = router;
