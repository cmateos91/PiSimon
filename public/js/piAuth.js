// Módulo de autenticación con Pi Network
const PiAuth = (function() {
    let currentUser = null;
    const apiUrl = AppConfig.API_URL; // URL de nuestro backend desde config
    
    // Elementos del DOM
    const notAuthenticatedElement = document.getElementById('not-authenticated');
    const authenticatedElement = document.getElementById('authenticated');
    const usernameElement = document.getElementById('username');
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
    const checkPermissionsButton = document.getElementById('check-permissions');

    // Inicializar el módulo
function init() {
    console.log('Inicializando módulo de autenticación Pi');
    
    // Verificar si Pi SDK está disponible
    if (typeof Pi === 'undefined') {
    console.error('SDK de Pi no disponible. Esta aplicación requiere Pi Browser.');
    NotificationSystem.show('Esta aplicación requiere Pi Browser', 'error');
    return;
    }
    
    // Asegurarse de que el SDK esté inicializado correctamente
    try {
        console.log('Iniciando Pi SDK...');
        Pi.init({ version: "2.0" });
        console.log('Pi SDK iniciado con éxito');
    } catch (e) {
        console.warn('El SDK ya podría estar inicializado:', e);
        // No es problema si ya está inicializado
    }
    
    // Verificar si hay una sesión guardada en localStorage
    checkSession();
    
    // Configurar listeners de eventos
    setupEventListeners();
    
    // Verificar si se necesita reautenticación para permisos adicionales
    setTimeout(checkReauthentication, 2000);
}
    
    // Verificar y mostrar estado de permisos
    function checkPermissionsStatus() {
        if (typeof Pi === 'undefined') {
            NotificationSystem.show('SDK de Pi no disponible', 'error');
            return;
        }
        
        // La función hasPermissions no está disponible en esta versión del SDK
        // Mostramos un mensaje informativo
        NotificationSystem.show('Para asegurar que tienes todos los permisos, cierra sesión y vuelve a iniciarla concediendo permisos de pagos.', 'info', 8000);
        
        // Preguntar si desea cerrar sesión y volver a iniciar
        setTimeout(() => {
            if (confirm('Para garantizar que tengas todos los permisos necesarios, ¿quieres cerrar sesión y volver a iniciarla?')) {
                logout(true);
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            }
        }, 1000);
    }
    
    // Verificar si se requiere reautenticación para obtener permisos adicionales
    function checkReauthentication() {
        // Esta función ya no puede verificar permisos porque hasPermissions no está disponible
        // Sólo verificamos si estamos en Pi Browser
        if (typeof Pi === 'undefined' || !isAuthenticated()) {
            return; // No podemos verificar si no está disponible Pi SDK o no estamos autenticados
        }
        
        // Mostrar un pequeño indicador recomendando verificar permisos
        const reauthIndicator = document.createElement('div');
        reauthIndicator.style.cssText = `
            position: absolute;
            top: -8px;
            right: -8px;
            width: 16px;
            height: 16px;
            background-color: #FF5722;
            border-radius: 50%;
            animation: pulse 2s infinite;
            opacity: 0.5;
        `;
        
        // Añadir al botón de usuario
        const userElement = document.querySelector('#authenticated');
        if (userElement && userElement.style.display !== 'none') {
            userElement.style.position = 'relative';
            userElement.appendChild(reauthIndicator);
        }
    }
    
    // Configurar listeners de eventos
    function setupEventListeners() {
        // Botón de login
        if (loginButton) {
            loginButton.addEventListener('click', function(e) {
                e.preventDefault();
                authenticate();
            });
        }
        
        // Botón de logout
        if (logoutButton) {
            logoutButton.addEventListener('click', function(e) {
                e.preventDefault();
                logout();
            });
        }
        
        // Botón de verificación de permisos
        if (checkPermissionsButton) {
            checkPermissionsButton.addEventListener('click', function(e) {
                e.preventDefault();
                checkPermissionsStatus();
            });
        }
    }
    
    // Verificar si hay una sesión activa en localStorage
    function checkSession() {
        const userData = localStorage.getItem('pi_user');
        if (userData) {
            try {
                currentUser = JSON.parse(userData);
                
                // Actualizar UI para mostrar que está autenticado
                updateUI(true);
                
                // Mostrar mensaje de bienvenida
                showWelcomeMessage();
                
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
    
    // Mostrar mensaje de bienvenida con el nombre de usuario
    function showWelcomeMessage() {
        if (!currentUser) return;
        
        setTimeout(() => {
            NotificationSystem.show(`¡Hola ${currentUser.username}! Bienvenido a Simon Pi.`, 'success', 5000);
        }, 500);
    }
    
    // Mostrar indicador de conexión
    function showConnectionStatus() {
        if (!currentUser) return;
        
        // Eliminar status previo si existe
        const existingStatus = document.getElementById('connection-status');
        if (existingStatus) existingStatus.remove();
        
        // Crear elemento de status
        const statusElement = document.createElement('div');
        statusElement.id = 'connection-status';
        statusElement.className = 'connection-status';
        statusElement.innerHTML = `
            <span class="status-icon"><i class="fas fa-check-circle"></i></span>
            <span class="status-text">Conectado a Pi Network como <span class="status-username">${currentUser.username}</span></span>
        `;
        
        // Insertar al inicio del main
        const mainElement = document.querySelector('main');
        if (mainElement && mainElement.firstChild) {
            mainElement.insertBefore(statusElement, mainElement.firstChild);
        }
        
        // Ocultar después de 10 segundos
        setTimeout(() => {
            if (statusElement.parentNode) {
                statusElement.style.opacity = '0';
                statusElement.style.transition = 'opacity 0.5s ease-out';
                setTimeout(() => {
                    if (statusElement.parentNode) {
                        statusElement.parentNode.removeChild(statusElement);
                    }
                }, 500);
            }
        }, 10000);
    }
    
    // Autenticar con Pi Network siguiendo la documentación oficial
function authenticate() {
    console.log('Iniciando autenticación con Pi Network');
    
    // Mostrar notificación
    NotificationSystem.show('Conectando con Pi Network...', 'info');
    
    try {
    // Verificar que Pi esté disponible
    if (typeof Pi === 'undefined') {
    console.error('SDK de Pi no disponible');
    NotificationSystem.show('Esta aplicación requiere Pi Browser', 'error');
    return;
    }
    
    // Asegurarse de que el SDK esté inicializado antes de intentar autenticar
    try {
    Pi.init({ version: "2.0" });
    console.log('Pi SDK inicializado para autenticación');
    } catch (e) {
    console.warn('El SDK ya podría estar inicializado:', e);
    // No es problema si ya está inicializado
    }
    
    // Definir callback para manejar pagos incompletos (requerido por Pi Network)
    const handleIncompletePayment = (payment) => {
        console.log("Se encontró un pago incompleto:", payment);
        return Promise.resolve({
            status: 'CANCELLED',
        memo: payment ? payment.memo : 'Pago cancelado',
        amount: payment ? payment.amount : 0,
        transaction: null
    });
    };
    
    console.log('Solicitando autenticación a Pi Network...');
    // Primero solicitamos solo username para simplificar la autenticación inicial
    Pi.authenticate(['username'], handleIncompletePayment).then(function(auth) {
    console.log('Autenticación exitosa:', auth);
    
    // Construir objeto de usuario
    currentUser = {
        uid: auth.user.uid,
        username: auth.user.username,
        accessToken: auth.accessToken
    };
    
    // Guardar en localStorage
    localStorage.setItem('pi_user', JSON.stringify(currentUser));
    
    // Actualizar interfaz
    updateUI(true);
    
    // Mostrar mensajes de éxito
    NotificationSystem.show(`¡Hola ${currentUser.username}! Tu cuenta de Pi ha sido conectada.`, 'success', 5000);
    
        // Después solicitamos permisos adicionales si se necesitan pagos
    setTimeout(() => {
        if (auth.scope.indexOf('payments') === -1) {
                console.log('Solicitando permisos de pagos adicionalmente...');
                Pi.authenticate(['payments'], handleIncompletePayment)
                        .then(paymentAuth => {
                        console.log('Permisos de pagos obtenidos:', paymentAuth);
                        NotificationSystem.show('Permisos de pagos habilitados', 'success');
                        })
                        .catch(err => {
                            console.warn('No se obtuvieron permisos de pagos:', err);
                        });
                }
            }, 1000);
            
            // Intentar verificar con el backend
            verifyWithBackend(currentUser)
                .then(response => {
                    console.log('Verificación con backend exitosa:', response);
                })
                .catch(error => {
                    console.error('Error al verificar con backend:', error);
                    // El servidor no está disponible, pero podemos continuar
                    NotificationSystem.show('Conectado en modo offline', 'info');
                });
                
        }).catch(function(error) {
            console.error('Error en autenticación Pi:', error);
            NotificationSystem.show('Error al autenticar con Pi Network. Intenta recargar la página.', 'error', 8000);
        });
        
    } catch (e) {
        console.error('Error general en autenticación:', e);
        NotificationSystem.show('Error al conectar con Pi Network', 'error');
    }
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
    function logout(skipConfirm = false) {
        // Confirmar cierre de sesión, a menos que se especifique omitir
        if (skipConfirm || confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            // Eliminar sesión
            localStorage.removeItem('pi_user');
            currentUser = null;
            
            // Actualizar UI
            updateUI(false);
            
            // Notificar
            NotificationSystem.show('Sesión cerrada correctamente', 'info');
        }
    }
    
    // Actualizar UI basado en estado de autenticación
    function updateUI(isAuthenticated) {
        if (isAuthenticated && currentUser) {
            // Ocultar botón de login y mostrar área de usuario autenticado
            notAuthenticatedElement.style.display = 'none';
            
            // Configurar nombre de usuario
            usernameElement.textContent = currentUser.username;
            
            // Mostrar área de usuario autenticado
            authenticatedElement.style.display = '';
            
            // Mostrar indicador de conexión
            showConnectionStatus();
            
            // Mostrar botón de guardar puntuación si corresponde
            const saveScoreButton = document.getElementById('save-score');
            const gameOverScreen = document.getElementById('game-over');
            
            if (saveScoreButton && gameOverScreen && gameOverScreen.style.display !== 'none') {
                saveScoreButton.style.display = '';
            }
            
            // Recargar el ranking para mostrar la posición del usuario
            if (typeof LeaderboardManager !== 'undefined' && LeaderboardManager.loadLeaderboard) {
                LeaderboardManager.loadLeaderboard();
            }
        } else {
            // Ocultar área de usuario autenticado y mostrar botón de login
            authenticatedElement.style.display = 'none';
            notAuthenticatedElement.style.display = '';
            
            // Ocultar botón de guardar puntuación
            const saveScoreButton = document.getElementById('save-score');
            if (saveScoreButton) {
                saveScoreButton.style.display = 'none';
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
    
    // API pública
    return {
        init,
        authenticate,
        logout,
        getCurrentUser,
        isAuthenticated,
        checkPermissionsStatus
    };
})();