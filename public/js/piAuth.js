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
        // Verificar si ya hay una sesión activa
        const existingSession = checkSession();
        
        // Verificar si estamos en modo desarrollo
        if (AppConfig.DEV_MODE) {
            console.log('Iniciando en modo desarrollo - No se usará el SDK de Pi');
            
            // Si no hay sesión, conectar automáticamente en modo desarrollo
            if (!existingSession && !authInProgress) {
                console.log('Autenticando automáticamente en modo desarrollo');
                setTimeout(() => {
                    authenticate();
                }, 1500);
            }
            
            // Añadir manejadores de eventos para los botones
            loginButton.addEventListener('click', authenticate);
            logoutButton.addEventListener('click', logout);
            return;
        }
        
        // Verificar si estamos en Pi Browser
        if (!checkPiEnvironment()) {
            console.warn('No se detectó Pi Browser. La funcionalidad de autenticación puede no estar disponible.');
            return;
        }
        
        // Inicializar Pi SDK
        Pi.init({ 
            version: "2.0"
            // No especificamos sandbox para adaptarnos al entorno actual
        });
        
        // Configurar eventos de los botones
        loginButton.addEventListener('click', authenticate);
        logoutButton.addEventListener('click', logout);
        
        // Si no hay sesión activa, iniciar autenticación automática
        if (!existingSession && !authInProgress) {
            console.log('Iniciando autenticación automática con Pi Network');
            setTimeout(() => {
                authenticate();
            }, 1500); // Breve retraso para permitir que la interfaz se cargue
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

    // Autenticar con Pi Network
    function authenticate() {
        // Evitar múltiples intentos de autenticación simultáneos
        if (authInProgress) {
            console.log('Proceso de autenticación ya en curso');
            return;
        }
        
        authInProgress = true;
        
        // Mostrar estado de conexión en la interfaz
        DOMAnimations.fadeOut(notAuthenticatedElement);
        setTimeout(() => {
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
        
        Pi.authenticate(
            // Callback de autenticación exitosa
            function(auth) {
                console.log('Autenticación exitosa:', auth);
                currentUser = {
                    uid: auth.user.uid,
                    username: auth.user.username,
                    accessToken: auth.accessToken
                };

                // Guardar en localStorage para persistencia
                localStorage.setItem('pi_user', JSON.stringify(currentUser));
                
                // Actualizar UI mientras se verifica con el backend
                usernameElement.textContent = currentUser.username;
                
                // Eliminar elemento de conexión
                const connectingElement = document.getElementById('connecting-status');
                if (connectingElement) {
                    connectingElement.remove();
                }
                
                // Verificar con nuestro backend
                verifyWithBackend(currentUser)
                    .then(response => {
                        console.log('Verificación con backend exitosa:', response);
                        updateUI(true);
                        
                        // Notificar éxito
                        NotificationSystem.show(`¡Bienvenido, ${currentUser.username}!`, 'success');
                        
                        // Efectos visuales
                        VisualEffects.pulse(authenticatedElement);
                        authInProgress = false;
                    })
                    .catch(error => {
                        console.error('Error al verificar con backend:', error);
                        logout();
                        
                        // Notificar error
                        NotificationSystem.show('Error de autenticación. Por favor, intenta de nuevo.', 'error');
                        
                        // Mostrar de nuevo el mensaje de no autenticado
                        DOMAnimations.fadeIn(notAuthenticatedElement);
                        authInProgress = false;
                    });
            },
            // Callback de error
            function(error) {
                console.error('Error de autenticación Pi:', error);
                console.error('Tipo de error:', typeof error);
                console.error('Detalles completos:', JSON.stringify(error, null, 2));
                
                // Eliminar elemento de conexión
                const connectingElement = document.getElementById('connecting-status');
                if (connectingElement) {
                    connectingElement.remove();
                }
                
                // Mostrar mensaje de no autenticado nuevamente
                DOMAnimations.fadeIn(notAuthenticatedElement);
                
                // Mostrar notificación más informativa
                NotificationSystem.show(
                    'Error al conectar con Pi Network. Asegúrate de estar usando el Pi Browser.', 
                    'error', 
                    8000
                );
                
                authInProgress = false;
            }
        );
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
                
                // Iniciar autenticación automática después de un breve período
                setTimeout(() => {
                    authenticate();
                }, 1000);
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
        isAuthenticated
    };
})();
