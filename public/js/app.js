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
    // Iniciar pantalla de carga
    const hideLoadingScreen = UIManager.showLoadingScreen();
    
    // Inicializar aplicación después de un breve retraso (efecto visual)
    setTimeout(() => {
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
    }, 1500);
});
