// Servidor para el juego Simon Pi
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Importar rutas
const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payments');
const leaderboardRoutes = require('./routes/leaderboard');

// Inicializar la aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos desde la carpeta public
app.use(express.static('../public'));

// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error('Error al conectar a MongoDB', err));

// Rutas
app.use('/auth', authRoutes);
app.use('/payments', paymentRoutes);
app.use('/leaderboard', leaderboardRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('API de Simon Pi funcionando');
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
