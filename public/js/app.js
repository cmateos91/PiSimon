// Archivo principal de la aplicación

// Registrar Service Worker para mejor rendimiento y funcionamiento offline
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/serviceWorker.js')
        .then(registration => {
            console.log('Service Worker registrado correctamente:', registration);
        })
        .catch(error => {
            console.error('Error al registrar Service Worker:', error);
        });
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('Evento DOMContentLoaded disparado - Iniciando aplicación');
    
    // Iniciar pantalla de carga
    const hideLoadingScreen = UIManager.showLoadingScreen();
    
    // Verificar si Pi SDK está disponible
    if (!AppConfig.DEV_MODE && typeof Pi !== 'undefined') {
        console.log('SDK de Pi detectado, asegurando inicialización...');
        try {
            // Asegurar que Pi está inicializado
            if (!Pi._instance) {
                console.log('Inicializando SDK de Pi desde app.js...');
                // Forzar modo sandbox para desarrollo local
                Pi.init({ version: "2.0", sandbox: true });
                console.log('SDK de Pi inicializado en modo SANDBOX');
                window.piInitDone = true;
            } else {
                console.log('SDK de Pi ya inicializado anteriormente');
            }
        } catch (e) {
            console.error('Error al verificar/inicializar Pi SDK:', e);
        }
    }
    
    // Inicializar aplicación después de un breve retraso (efecto visual)
    setTimeout(() => {
        console.log('Iniciando módulos principales de la aplicación...');
        
        // Inicializar sistema de sonidos
        SoundManager.init();
        
        // Inicializar tema
        ThemeManager.init();
        
        // Inicializar módulo de autenticación Pi
        PiAuth.init();
        
        // Inicializar el juego
        SimonGame.init();
        
        // Cargar el ranking
        LeaderboardManager.loadLeaderboard();
        
        // Inicializar componentes de la interfaz de usuario
        UIManager.init();
        
        // Aplicar optimizaciones para dispositivos móviles
        UIManager.applyMobileOptimizations();
        
        // Ocultar pantalla de carga
        hideLoadingScreen();
        
        // Mostrar mensaje de bienvenida
        setTimeout(() => {
            NotificationSystem.show('¡Bienvenido a Simon Pi! El juego de memoria para la red Pi Network.', 'info', 5000);
        }, 500);
        
        console.log('Simon Pi Game inicializado correctamente.');
        
        // Hacer clic en el botón de login después de inicializar todo (solo en desarrollo)
        if (AppConfig.DEV_MODE) {
            setTimeout(() => {
                console.log('Modo desarrollo - Simulando clic en botón de login...');
                document.getElementById('login-button').click();
            }, 2000);
        }
    }, 1500);
});

// Asegurar la inicialización correcta del SDK de Pi cuando la página esté completamente cargada
window.addEventListener('load', function() {
    console.log('Evento load disparado - Página completamente cargada');
    
    // Verificar nuevamente SDK de Pi cuando todo esté cargado
    if (!AppConfig.DEV_MODE && typeof Pi !== 'undefined') {
        console.log('Verificando SDK de Pi en evento load...');
        if (!Pi._instance) {
            console.log('Inicializando SDK de Pi desde evento load...');
            try {
                // Forzar modo sandbox para desarrollo local
                Pi.init({ version: "2.0", sandbox: true });
                window.piInitDone = true;
                console.log('SDK de Pi inicializado en modo SANDBOX desde load');
            } catch (e) {
                console.error('Error al inicializar Pi SDK en load:', e);
            }
        } else {
            console.log('SDK de Pi ya estaba inicializado - OK');
        }
    }
});

