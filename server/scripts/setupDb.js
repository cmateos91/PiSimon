/**
 * Script para inicializar la base de datos con colecciones y algunos datos de prueba
 * Para ejecutar: node scripts/setupDb.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Score = require('../models/Score');
const Payment = require('../models/Payment');

async function setupDatabase() {
    try {
        // Conectar a MongoDB
        console.log('Conectando a MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Conexión exitosa a MongoDB');

        // Limpiar colecciones existentes (opcional - cuidado en producción)
        if (process.argv.includes('--reset')) {
            console.log('Limpiando colecciones existentes...');
            await User.deleteMany({});
            await Score.deleteMany({});
            await Payment.deleteMany({});
            console.log('Colecciones limpiadas');
        }

        // Crear usuario de ejemplo (opcional)
        if (process.argv.includes('--sample-data')) {
            console.log('Creando datos de ejemplo...');
            
            // Usuario de ejemplo
            const sampleUser = new User({
                uid: 'sample_user_123',
                username: 'JugadorPi',
                lastLogin: new Date()
            });
            await sampleUser.save();
            
            // Pago de ejemplo
            const samplePayment = new Payment({
                paymentId: 'pi_payment_id_123',
                userId: sampleUser.uid,
                amount: 1,
                memo: 'Guardar puntuación: 10 puntos - Simon Pi Game',
                metadata: { score: 10, type: 'score_save' },
                status: 'completed',
                completedAt: new Date()
            });
            await samplePayment.save();
            
            // Puntuación de ejemplo
            const sampleScore = new Score({
                userId: sampleUser.uid,
                username: sampleUser.username,
                score: 10,
                payment: {
                    paymentId: samplePayment.paymentId,
                    amount: 1,
                    status: 'completed',
                    completedAt: new Date()
                }
            });
            await sampleScore.save();
            
            console.log('Datos de ejemplo creados');
        }

        console.log('Inicialización de la base de datos completada');
    } catch (error) {
        console.error('Error durante la configuración de la base de datos:', error);
    } finally {
        // Cerrar conexión
        mongoose.connection.close();
        console.log('Conexión a MongoDB cerrada');
    }
}

// Ejecutar la función
setupDatabase();
