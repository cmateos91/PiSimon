// Configuración global de la aplicación
const AppConfig = {
    // Modo desarrollo: true para desarrollo local, false para producción con Pi Network
    DEV_MODE: true,
    
    // URL de la API backend
    API_URL: 'http://localhost:3000',
    
    // Información del juego
    GAME_INFO: {
        version: '1.0.0',
        name: 'Simon Pi'
    },
    
    // Configuración de los modos de autenticación
    AUTH: {
        // Datos del usuario de prueba para desarrollo
        TEST_USER: {
            uid: 'test_user_' + Math.floor(Math.random() * 10000),
            username: 'PioneerTest',
            accessToken: 'dev_token_' + Date.now()
        }
    },
    
    // Mensajes para el usuario
    MESSAGES: {
        DEV_MODE: 'Ejecutando en modo desarrollo local. La autenticación y pagos son simulados.',
        LOGIN_SUCCESS: 'Has iniciado sesión correctamente',
        LOGIN_ERROR: 'Error al iniciar sesión',
        PAYMENT_SUCCESS: 'Pago completado correctamente',
        PAYMENT_ERROR: 'Error al procesar el pago',
        SCORE_SAVED: 'Puntuación guardada correctamente'
    }
};

// No modificar este código - Verificador de entorno
(function() {
    // Añadir un indicador visual de que estamos en modo desarrollo
    if (AppConfig.DEV_MODE) {
        // Añadir el indicador de modo desarrollo una vez que el DOM esté cargado
        document.addEventListener('DOMContentLoaded', function() {
            // Crear un indicador de modo desarrollo
            const devIndicator = document.createElement('div');
            devIndicator.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                background-color: #FF5722;
                color: white;
                padding: 5px 10px;
                font-size: 12px;
                font-weight: bold;
                z-index: 9999;
                border-bottom-right-radius: 5px;
            `;
            devIndicator.textContent = '🚧 DESARROLLO LOCAL';
            document.body.appendChild(devIndicator);
        });
        
        // Advertencia en consola
        console.warn('🚧 APLICACIÓN EN MODO DESARROLLO - La autenticación y pagos son simulados');
    }
})();
