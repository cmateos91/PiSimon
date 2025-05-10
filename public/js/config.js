// Configuración global de la aplicación
const AppConfig = {
    // URL de la API backend (configuración para Pi Network)
    // Como la app está completamente desplegada en Vercel, usamos la misma URL base
    API_URL: 'https://pi-simon.vercel.app/api',  // Asegúrate que tus rutas API existan en /api/*
    
    // Información del juego
    GAME_INFO: {
        version: '1.0.0',
        name: 'Simon Pi'
    },
    
    // Configuración de la aplicación en Pi Network
    AUTH: {
        // ID de la aplicación en Pi Network
        APP_ID: 'pi-simon' // Debe coincidir exactamente con el ID en el Developer Portal
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