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
    
// Fijónate en la parte del código donde asignamos el evento al botón de login
    // Asegurarse que el botón de login principal tenga el evento correcto
    const loginButton = document.getElementById('login-button');
    if (loginButton) {
        console.log('Encontrado botón de login, configurando evento...');

        // Eliminar todos los eventos previos para evitar duplicidad
        const newLoginButton = loginButton.cloneNode(true);
        if (loginButton.parentNode) {
            loginButton.parentNode.replaceChild(newLoginButton, loginButton);
            
            // Agregar evento de click explícito y directo
            newLoginButton.addEventListener('click', function(event) {
                console.log('Botón de login clickeado');
                event.preventDefault();
                event.stopPropagation();
                
                // Llamar directamente a la función de autenticación
                if (typeof PiAuth !== 'undefined') {
                    console.log('Llamando a PiAuth.authenticate() desde event listener');
                    PiAuth.authenticate();
                } else {
                    console.error('PiAuth no está disponible');
                    alert('Error: sistema de autenticación no disponible. Intenta recargar la página.');
                }
                
                return false;
            });
            
            console.log('Evento click asignado correctamente al botón de login');
        } else {
            console.error('Botón de login no tiene parentNode');
        }
    } else {
        console.error('No se pudo encontrar el botón de login en el DOM');
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