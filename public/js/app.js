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

// Función para inicializar la aplicación
function initApplication() {
    console.log('Iniciando módulos principales de la aplicación...');
    
    // Verificar si estamos en Pi Browser
    const isPiBrowser = navigator.userAgent.includes('PiBrowser');
    console.log('¿Estamos en Pi Browser?', isPiBrowser);

    // Verificar que Pi SDK esté disponible
    if (typeof Pi === 'undefined') {
        console.error('SDK de Pi no disponible. Esperando...');
        setTimeout(initApplication, 500); // Reintento en 500ms
        return;
    }
    
    // Inicializar Pi SDK explícitamente
    try {
        console.log('Inicializando Pi SDK...');
        Pi.init({ version: "2.0" });
        console.log('Pi SDK inicializado correctamente');
    } catch (e) {
        console.warn('El SDK Pi ya podría estar inicializado:', e);
        // No es problema si ya está inicializado
    }
    
    // Inicializar sistema de sonidos
    SoundManager.init();
    
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
    
    // Asegurarse que el botón de login tenga el evento correcto
    const loginButton = document.getElementById('login-button');
    if (loginButton) {
        // Eliminar todos los eventos previos por si acaso
        const newLoginButton = loginButton.cloneNode(true);
        loginButton.parentNode.replaceChild(newLoginButton, loginButton);
        
        // Agregar evento de click explícito
        newLoginButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Botón de login clickeado, iniciando autenticación directamente...');
            PiAuth.authenticate();
            return false;
        });
        
        console.log('Evento de login asignado correctamente al botón');
    } else {
        console.error('No se encontró el botón de login en el DOM');
    }
    
    // Mostrar mensaje de bienvenida
    setTimeout(() => {
        NotificationSystem.show('¡Bienvenido a Simon Pi! El juego de memoria para la red Pi Network.', 'info', 5000);
    }, 500);
    
    console.log('Simon Pi Game inicializado correctamente.');
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('Evento DOMContentLoaded disparado - Iniciando aplicación');
    
    // Iniciar pantalla de carga
    const hideLoadingScreen = UIManager.showLoadingScreen();
    
    // Inicializar aplicación después de un breve retraso (efecto visual)
    setTimeout(() => {
        // Iniciar la aplicación
        initApplication();
        
        // Ocultar pantalla de carga
        hideLoadingScreen();
    }, 1500);
});