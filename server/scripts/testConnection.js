/**
 * Script para probar la conexión a MongoDB
 * Para ejecutar: node scripts/testConnection.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
    try {
        console.log('Intentando conectar a MongoDB...');
        console.log(`URL de conexión: ${process.env.MONGO_URI}`);
        
        await mongoose.connect(process.env.MONGO_URI);
        
        console.log('¡Conexión exitosa a MongoDB!');
        console.log('Información del servidor:', mongoose.connection.host);
        
        // Listar las colecciones existentes
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Colecciones en la base de datos:');
        collections.forEach(collection => {
            console.log(`- ${collection.name}`);
        });
        
    } catch (error) {
        console.error('Error al conectar a MongoDB:', error.message);
        console.error('Detalles completos del error:', error);
    } finally {
        // Cerrar conexión
        await mongoose.connection.close();
        console.log('Conexión a MongoDB cerrada');
    }
}

// Ejecutar la función
testConnection();
