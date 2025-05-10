const express = require('express');
const router = express.Router();
const axios = require('axios');
const User = require('../models/User');

// Verificar autenticación de usuario Pi
router.post('/verify', async (req, res) => {
    try {
        const { uid, accessToken } = req.body;

        if (!uid || !accessToken) {
            return res.status(400).json({ 
                success: false, 
                message: 'UID y accessToken son requeridos' 
            });
        }

        // Verificar con la API de Pi
        try {
            // En un entorno de producción, aquí verificaríamos el token con la API de Pi
            // Esto es una simulación para el entorno de desarrollo
            console.log('Verificando token con Pi Network API:', accessToken);
            
            // En producción, usaríamos algo como:
            // const piResponse = await axios.post('https://api.minepi.com/v2/me', {}, {
            //     headers: { 'Authorization': `Bearer ${accessToken}` }
            // });
            
            // Crear o actualizar usuario en la base de datos
            let user = await User.findOne({ uid });
            
            if (!user) {
                user = new User({
                    uid,
                    username: req.body.username || 'Pioneer_' + uid.substring(0, 5)
                });
            }
            
            user.lastLogin = Date.now();
            await user.save();
            
            return res.json({
                success: true,
                message: 'Autenticación verificada',
                user: {
                    uid: user.uid,
                    username: user.username
                }
            });
        } catch (error) {
            console.error('Error al verificar con Pi API:', error);
            return res.status(401).json({ 
                success: false, 
                message: 'Token inválido o expirado' 
            });
        }
    } catch (error) {
        console.error('Error en verificación de autenticación:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor' 
        });
    }
});

module.exports = router;
