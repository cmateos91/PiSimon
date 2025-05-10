// Configuración global de la aplicación
const AppConfig = {
    // URL de la API backend (configuración para Pi Network)
    API_URL: 'https://tu-backend-para-sandbox.ejemplo.com',  // Cambia esto a tu backend real
    
    // Información del juego
    GAME_INFO: {
        version: '1.0.0',
        name: 'Simon Pi'
    },
    
    // Configuración de la aplicación en Pi Network
    AUTH: {
        // ID de la aplicación en Pi Network
        APP_ID: 'simon-pi-game' // Reemplaza con tu ID real
    },
    
    // Mensajes para el usuario
    MESSAGES: {
        LOGIN_SUCCESS: 'Has iniciado sesión correctamente',
        LOGIN_ERROR: 'Error al iniciar sesión',
        PAYMENT_SUCCESS: 'Pago completado correctamente',
        PAYMENT_ERROR: 'Error al procesar el pago',
        SCORE_SAVED: 'Puntuación guardada correctamente'
    }
};