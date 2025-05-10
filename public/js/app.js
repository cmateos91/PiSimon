// Archivo principal de la aplicación
document.addEventListener('DOMContentLoaded', function() {
    // Iniciar pantalla de carga
    const hideLoadingScreen = UIManager.showLoadingScreen();
    
    // Inicializar aplicación después de un breve retraso (efecto visual)
    setTimeout(() => {
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
