// Módulo de autenticación con Pi Network
const PiAuth = (function() {
    let currentUser = null;
    const apiUrl = 'http://localhost:3000'; // URL de nuestro backend para desarrollo
    let authInProgress = false;
    
    // Elementos del DOM
    const notAuthenticatedElement = document.getElementById('not-authenticated');
    const authenticatedElement = document.getElementById('authenticated');
    const usernameElement = document.getElementById('username');
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');

    // Modo de prueba para desarrollo (cuando no está disponible Pi Browser)
    function authenticateTestMode() {
        console.log('Usando modo de prueba para autenticación');
        
        // Usar el usuario de prueba definido en la configuración
        const testUser = AppConfig.AUTH.TEST_USER;
        
        // Guardar en localStorage
        localStorage.setItem('pi_user', JSON.stringify(testUser));
        currentUser = testUser;
        
        // Actualizar UI
        updateUI(true);
        
        // Mostrar notificación
        NotificationSystem.show(
            AppConfig.DEV_MODE ? 'Autenticado en modo de desarrollo (simulado)' : 'Autenticado en modo de prueba', 
            'info', 
            3000
        );
    }

    // Verificar si estamos en el entorno correcto de Pi
    function checkPiEnvironment() {
        // En modo desarrollo, no necesitamos Pi SDK real
        if (AppConfig.DEV_MODE) {
            console.info('Ejecutando en modo desarrollo. No se requiere Pi SDK.');
            return false;
        }
        
        // Verificar si el SDK de Pi está disponible
        if (typeof Pi === 'undefined') {
            console.warn('SDK de Pi no detectado. Es posible que no estés usando Pi Browser.');
            return false;
        }
        
        return true;
    }

    // Inicializar el SDK de Pi
    function init() {
        console.log('Inicializando módulo de autenticación Pi');
        
        // Verificar si ya hay una sesión activa (sin iniciar autenticación automática)
        const existingSession = checkSession();
        
        // Si estamos en modo desarrollo, podemos habilitar la autenticación automática
        if (AppConfig.DEV_MODE) {
            console.log('Iniciando en modo desarrollo - usando SDK simulado de Pi');
            
            // Si no hay sesión, conectar automáticamente en modo desarrollo
            if (!existingSession && !authInProgress) {
                console.log('Autenticando automáticamente en modo desarrollo');
                // Nota: El clic se simula ahora desde app.js
            }
        }
        
        // Siempre mostrar UI de autenticación inicial si no hay sesión activa
        if (!existingSession) {
            console.log('No hay sesión activa, mostrando UI de login');
            // Mostrar mensaje y botón de login
            DOMAnimations.fadeIn(notAuthenticatedElement);
        } else {
            console.log('Sesión activa recuperada para:', currentUser.username);
        }
    }
    
    // Verificar si hay una sesión activa
    function checkSession() {
        const userData = localStorage.getItem('pi_user');
        if (userData) {
            try {
                currentUser = JSON.parse(userData);
                updateUI(true);
                
                // Notificar silenciosamente
                console.log('Sesión recuperada:', currentUser.username);
                return true;
            } catch (error) {
                console.error('Error al recuperar la sesión del usuario:', error);
                localStorage.removeItem('pi_user');
                
                // Notificar error
                NotificationSystem.show('Error al recuperar la sesión. Inicia sesión de nuevo.', 'error');
            }
        }
        return false;
    }
    
    // Manejar el éxito de autenticación (llamado desde authenticateWithPi en HTML)
    function handleAuthSuccess(auth) {
        console.log('handleAuthSuccess llamado con:', auth);
        if (!auth) {
            console.error('Auth recibido es null o undefined');
            return;
        }
        
        try {
            // Actualizar estado de autenticación
            currentUser = {
                uid: auth.user.uid,
                username: auth.user.username,
                accessToken: auth.accessToken
            };
            
            // Guardar en localStorage para persistencia
            localStorage.setItem('pi_user', JSON.stringify(currentUser));
            
            // Actualizar UI
            usernameElement.textContent = currentUser.username;
            
            // Eliminar elemento de conexión si existe
            const connectingElement = document.getElementById('connecting-status');
            if (connectingElement) {
                connectingElement.remove();
            }
            
            // Actualizar interfaz de usuario
            updateUI(true);
            
            // Notificar éxito
            NotificationSystem.show(`¡Bienvenido, ${currentUser.username}!`, 'success');
            
            // Efectos visuales
            VisualEffects.pulse(authenticatedElement);
            
            // Resetear flag de autenticación en progreso
            authInProgress = false;
            
            // Intentar verificar con backend si está disponible
            try {
                verifyWithBackend(currentUser)
                    .then(response => {
                        console.log('Verificación con backend exitosa:', response);
                    })
                    .catch(error => {
                        console.error('Error al verificar con backend:', error);
                    });
            } catch (e) {
                console.error('Error al iniciar verificación con backend:', e);
            }
        } catch (e) {
            console.error('Error en handleAuthSuccess:', e);
            authInProgress = false;
        }
    }

    // Autenticar con Pi Network
    function authenticate() {
        console.log('========================================');
        console.log('INICIO PROCESO DE AUTENTICACIÓN');
        console.log('========================================');
        
        // Evitar múltiples intentos de autenticación simultáneos
        if (authInProgress) {
            console.log('Proceso de autenticación ya en curso');
            return;
        }
        
        console.log('Estableciendo authInProgress = true');
        authInProgress = true;
        
        // Mostrar estado de conexión en la interfaz
        console.log('Ocultando elemento not-authenticated');
        DOMAnimations.fadeOut(notAuthenticatedElement);
        setTimeout(() => {
            console.log('Creando y mostrando estado de conexión');
            // Crear y mostrar estado de conexión
            const connectingElement = document.createElement('div');
            connectingElement.id = 'connecting-status';
            connectingElement.innerHTML = `
                <div class="connecting-animation">
                    <img src="img/pi3d.png" alt="Pi" class="pi-logo-connecting">
                    <div class="connecting-spinner"></div>
                </div>
                <p>Conectando con Pi Network...</p>
            `;
            
            // Estilos inline para no depender de CSS externo
            connectingElement.style.cssText = `
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            
            // Añadir al DOM
            const userInfo = document.getElementById('user-info');
            userInfo.appendChild(connectingElement);
            
            // Mostrar con animación
            setTimeout(() => {
                connectingElement.style.opacity = '1';
            }, 10);
        }, 300);
        
        // Notificar estado de conexión
        console.log('Mostrando notificación de conexión');
        NotificationSystem.show('Conectando con Pi Network...', 'info');
        
        // En modo desarrollo, siempre usamos autenticación simulada
        if (AppConfig.DEV_MODE) {
            console.log('Modo desarrollo activo - Usando autenticación simulada');
            
            // Simular retraso para mejor experiencia de usuario
            setTimeout(() => {
                authenticateTestMode();
                authInProgress = false;
                
                // Eliminar elemento de conexión
                const connectingElement = document.getElementById('connecting-status');
                if (connectingElement) {
                    connectingElement.remove();
                }
            }, 2000);
            return;
        }
        
        // Verificar si estamos en Pi Browser
        if (typeof Pi === 'undefined') {
            console.warn('SDK de Pi no encontrado. Usando modo de prueba.');
            setTimeout(() => {
                authenticateTestMode();
                authInProgress = false;
                
                // Eliminar elemento de conexión
                const connectingElement = document.getElementById('connecting-status');
                if (connectingElement) {
                    connectingElement.remove();
                }
            }, 2000);
            return;
        }
        
        try {
            console.log('VERIFICANDO EL ESTADO DEL SDK DE PI');
            console.log('SDK de Pi detectado:', typeof Pi);
            
            // Utilizar la función global authenticateWithPi para una mejor compatibilidad
            if (typeof authenticateWithPi === 'function') {
                console.log('Utilizando función authenticateWithPi global...');
                authenticateWithPi();
            } else {
                console.error('Función authenticateWithPi no disponible');
                // Mostrar de nuevo el mensaje de no autenticado
                DOMAnimations.fadeIn(notAuthenticatedElement);
                authInProgress = false;
                
                // Mostrar notificación informativa
                NotificationSystem.show(
                    'Error inesperado al conectar con Pi Network. Inténtalo más tarde.', 
                    'error', 
                    8000
                );
            }
        } catch (error) {
            console.error('ERROR GRAVE AL AUTENTICAR:', error);
            // Eliminar elemento de conexión
            const connectingElement = document.getElementById('connecting-status');
            if (connectingElement) {
                connectingElement.remove();
            }
            
            // Mostrar mensaje de no autenticado nuevamente
            DOMAnimations.fadeIn(notAuthenticatedElement);
            authInProgress = false;
            
            // Mostrar notificación más informativa
            NotificationSystem.show(
                'Error inesperado al conectar con Pi Network. Inténtalo más tarde.', 
                'error', 
                8000
            );
        }
    }
    
    // Función para manejar pagos incompletos (requerida por Pi SDK)
    function onIncompletePaymentFound(payment) {
        console.log("Se encontró un pago incompleto:", payment);
        // Por ahora, solo devolvemos una promesa resuelta
        // con un objeto que simula un resultado de cancelación
        if (!payment) {
            console.log("No se encontraron pagos incompletos");
            return Promise.resolve(null);
        }
        
        // En una implementación real, esto debería verificar el estado del pago con tu backend
        return Promise.resolve({
            status: 'CANCELLED',
            memo: payment.memo || 'Pago cancelado',
            amount: payment.amount || 0,
            transaction: null
        });
    }

    // Verificar con nuestro backend
    async function verifyWithBackend(user) {
        try {
            const response = await fetch(`${apiUrl}/auth/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    uid: user.uid,
                    username: user.username,
                    accessToken: user.accessToken
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Verificación fallida');
            }

            return await response.json();
        } catch (error) {
            console.error('Error al verificar con backend:', error);
            throw error;
        }
    }

    // Cerrar sesión
    function logout() {
        // Evitar operaciones si hay una autenticación en curso
        if (authInProgress) {
            console.log('No se puede cerrar sesión durante la autenticación');
            return;
        }
        
        // Añadir efecto de carga
        DOMAnimations.fadeOut(authenticatedElement);
        
        // Crear animación temporal de cierre de sesión
        setTimeout(() => {
            const userInfo = document.getElementById('user-info');
            const logoutAnimation = document.createElement('div');
            logoutAnimation.id = 'logout-animation';
            logoutAnimation.innerHTML = `
                <div class="logout-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                </div>
                <p>Cerrando sesión...</p>
            `;
            
            // Estilos inline para no depender de CSS externo
            logoutAnimation.style.cssText = `
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            
            // Añadir al DOM
            userInfo.appendChild(logoutAnimation);
            
            // Mostrar con animación
            setTimeout(() => {
                logoutAnimation.style.opacity = '1';
            }, 10);
            
            // Pequeña demora para mostrar la animación
            setTimeout(() => {
                currentUser = null;
                localStorage.removeItem('pi_user');
                
                // Eliminar animación de cierre
                logoutAnimation.style.opacity = '0';
                setTimeout(() => {
                    if (logoutAnimation.parentNode) {
                        logoutAnimation.parentNode.removeChild(logoutAnimation);
                    }
                    // Actualizar UI
                    updateUI(false);
                }, 300);
                
                // Notificar cierre de sesión
                NotificationSystem.show('Sesión cerrada correctamente', 'info');
            }, 800);
        }, 300);
    }

    // Actualizar UI según estado de autenticación
    function updateUI(isAuthenticated) {
        if (isAuthenticated && currentUser) {
            // Transiciones suaves
            DOMAnimations.fadeOut(notAuthenticatedElement);
            
            setTimeout(() => {
                usernameElement.textContent = currentUser.username;
                DOMAnimations.fadeIn(authenticatedElement);
            }, 300);
            
            // Mostrar botón de guardar puntuación si corresponde
            const saveScoreButton = document.getElementById('save-score');
            const gameOverScreen = document.getElementById('game-over');
            
            if (saveScoreButton && gameOverScreen.style.display !== 'none') {
                DOMAnimations.fadeIn(saveScoreButton);
            }
            
            // Recargar el ranking para mostrar la posición del usuario
            if (LeaderboardManager) {
                LeaderboardManager.loadLeaderboard();
            }
        } else {
            // Transiciones suaves
            DOMAnimations.fadeOut(authenticatedElement);
            
            setTimeout(() => {
                DOMAnimations.fadeIn(notAuthenticatedElement);
            }, 300);
            
            // Ocultar botón de guardar puntuación
            const saveScoreButton = document.getElementById('save-score');
            if (saveScoreButton) {
                DOMAnimations.fadeOut(saveScoreButton);
            }
        }
    }

    // Obtener el usuario actual
    function getCurrentUser() {
        return currentUser;
    }

    // Verificar si el usuario está autenticado
    function isAuthenticated() {
        return currentUser !== null;
    }

    // Exponer métodos públicos
    return {
        init,
        authenticate,
        logout,
        getCurrentUser,
        isAuthenticated,
        handleAuthSuccess // Exponemos este método para que pueda ser llamado desde la función global
    };
})();