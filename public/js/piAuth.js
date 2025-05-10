// Módulo de autenticación con Pi Network
const PiAuth = (function() {
    let currentUser = null;
    const apiUrl = AppConfig.API_URL; // URL de nuestro backend desde config

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
        
        // Verificar los permisos almacenados
        if (currentUser && currentUser.scope) {
            const hasUsername = currentUser.scope.includes('username');
            const hasPayments = currentUser.scope.includes('payments');
            
            if (hasUsername && hasPayments) {
                NotificationSystem.show('Tienes todos los permisos necesarios para usar la aplicación', 'success');
                return;
            }
            
            // Listar los permisos faltantes
            const missingPermissions = [];
            if (!hasUsername) missingPermissions.push('username');
            if (!hasPayments) missingPermissions.push('payments');
            
            NotificationSystem.show(`Faltan permisos: ${missingPermissions.join(', ')}. ¿Deseas volver a autenticarte?`, 'warning', 8000);
        } else {
            NotificationSystem.show('No se pudieron verificar los permisos. Intenta iniciar sesión nuevamente.', 'error');
        }
        
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
        // Verificamos si tenemos los permisos necesarios basados en lo que tenemos guardado
        if (!isAuthenticated()) {
            return; // No podemos verificar si no estamos autenticados
        }
        
        // Verificar si tenemos ambos permisos
        const hasPaymentsPermission = currentUser.scope && 
                                     Array.isArray(currentUser.scope) && 
                                     currentUser.scope.includes('payments');
        
        if (!hasPaymentsPermission) {
            console.warn('Falta el permiso de pagos - Se necesita reautenticación');
            
            // Mostrar indicador rojo
            showPermissionsIndicator();
        } else {
            console.log('Todos los permisos verificados correctamente');
        }
    }
    
    // Mostrar indicador de que faltan permisos
    function showPermissionsIndicator() {
        // Crear indicador 
        const reauthIndicator = document.createElement('div');
        reauthIndicator.id = 'permissions-indicator';
        reauthIndicator.style.cssText = `
            position: absolute;
            top: -4px;
            right: -4px;
            width: 12px;
            height: 12px;
            background-color: #FF5722;
            border-radius: 50%;
            animation: pulse 2s infinite;
            opacity: 0.9;
            z-index: 100;
        `;
        
        // Añadir al botón de usuario
        const userElement = document.getElementById('authenticated');
        if (userElement && userElement.style.display !== 'none') {
            userElement.style.position = 'relative';
            
            // Eliminar indicador previo si existe
            const existingIndicator = document.getElementById('permissions-indicator');
            if (existingIndicator) {
                existingIndicator.remove();
            }
            
            userElement.appendChild(reauthIndicator);
        }
    }
    
    // Configurar listeners de eventos
    function setupEventListeners() {
        console.log('Configurando event listeners para Pi Auth');
        
        // Botón de login
        const loginButton = document.getElementById('login-button');
        if (loginButton) {
            console.log('Configurando evento para botón de login');
            // Clone node para eliminar handlers previos
            const newLoginButton = loginButton.cloneNode(true);
            if (loginButton.parentNode) {
                loginButton.parentNode.replaceChild(newLoginButton, loginButton);
                
                // Agregar nuevo evento
                newLoginButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Botón de login clickeado directamente');
                    authenticate();
                    return false;
                });
                
                console.log('Evento de login asignado correctamente');
            }
        } else {
            console.warn('Botón de login no encontrado en el DOM');
        }
        
        // Botón de logout
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            console.log('Configurando evento para botón de logout');
            // Clone node para eliminar handlers previos
            const newLogoutButton = logoutButton.cloneNode(true);
            if (logoutButton.parentNode) {
                logoutButton.parentNode.replaceChild(newLogoutButton, logoutButton);
                
                // Agregar nuevo evento
                newLogoutButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Botón de logout clickeado directamente');
                    logout();
                    return false;
                });
                
                console.log('Evento de logout asignado correctamente');
            }
        }
        
        // Botón de verificación de permisos
        const checkPermissionsButton = document.getElementById('check-permissions');
        if (checkPermissionsButton) {
            console.log('Configurando evento para botón de verificación de permisos');
            // Clone node para eliminar handlers previos
            const newCheckPermissionsButton = checkPermissionsButton.cloneNode(true);
            if (checkPermissionsButton.parentNode) {
                checkPermissionsButton.parentNode.replaceChild(newCheckPermissionsButton, checkPermissionsButton);
                
                // Agregar nuevo evento
                newCheckPermissionsButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Botón de verificación de permisos clickeado directamente');
                    checkPermissionsStatus();
                    return false;
                });
                
                console.log('Evento de verificación de permisos asignado correctamente');
            }
        }
    }
    
    // Verificar si hay una sesión activa en localStorage
    function checkSession() {
        const userData = localStorage.getItem('pi_user');
        if (userData) {
            try {
                currentUser = JSON.parse(userData);
                
                // Asegurarnos de que el objeto de usuario tenga la estructura esperada
                if (!currentUser.uid || !currentUser.username || !currentUser.accessToken) {
                    console.error('Sesión de usuario incompleta');
                    localStorage.removeItem('pi_user');
                    NotificationSystem.show('Error con la sesión guardada. Por favor, inicia sesión de nuevo.', 'error');
                    return false;
                }
                
                // Asegurarnos de que exista la propiedad 'scope' como array
                if (!currentUser.scope) {
                    currentUser.scope = [];
                    localStorage.setItem('pi_user', JSON.stringify(currentUser));
                    console.warn('Se agregó la propiedad scope al objeto de usuario');
                }
                
                // Actualizar UI para mostrar que está autenticado
                updateUI(true);
                
                // Mostrar mensaje de bienvenida
                showWelcomeMessage();
                
                console.log('Sesión recuperada:', currentUser.username, 'Permisos:', currentUser.scope);
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
    
    // Autenticar con Pi Network siguiendo el ejemplo que funciona
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
        
        // Solicitar ambos permisos juntos como en el ejemplo
        const scopes = ['payments', 'username'];
        console.log('Solicitando autenticación con permisos:', scopes);
        
        Pi.authenticate(scopes, handleIncompletePayment).then(function(auth) {
            console.log('Autenticación completa:', auth);
            
            // Construir objeto de usuario siguiendo el ejemplo que funciona
            currentUser = {
                uid: auth.user.uid,
                username: auth.user.username,
                accessToken: auth.accessToken,
                scope: auth.scope || []
            };
            
            // Log detallado de los permisos para depuración
            if (auth.scope) {
                console.log('Permisos concedidos:', auth.scope);
                console.log('¿Tiene permiso de pagos?', auth.scope.includes('payments'));
            } else {
                console.warn('No se recibieron permisos en la respuesta de autenticación');
            }
            
            // Guardar en localStorage
            localStorage.setItem('pi_user', JSON.stringify(currentUser));
            
            // Actualizar interfaz
            updateUI(true);
            
            // Mostrar mensaje de éxito
            NotificationSystem.show(`¡Hola ${currentUser.username}! Tu cuenta ha sido conectada.`, 'success');
            
            // Verificar backend
            verifyWithBackend(currentUser)
                .then(response => {
                    console.log('Verificación backend OK:', response);
                })
                .catch(error => {
                    console.warn('Error al verificar con backend:', error);
                    NotificationSystem.show('Conectado en modo offline', 'info');
                });
        }).catch(function(error) {
            console.error('Error de autenticación:', error);
            NotificationSystem.show(`Error al autenticar: ${error.message || error}`, 'error');
        });
    } catch (e) {
        console.error('Error inesperado en autenticación:', e);
        NotificationSystem.show(`Error: ${e.message || e}`, 'error');
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
        // Obtener elementos del DOM en el momento de actualización
        const notAuthenticatedElement = document.getElementById('not-authenticated');
        const authenticatedElement = document.getElementById('authenticated');
        const usernameElement = document.getElementById('username');

        if (isAuthenticated && currentUser) {
            console.log('Actualizando UI para usuario autenticado:', currentUser.username);

            // Ocultar botón de login y mostrar área de usuario autenticado
            if (notAuthenticatedElement) {
                notAuthenticatedElement.style.display = 'none';
            } else {
                console.warn('Elemento #not-authenticated no encontrado en el DOM');
            }
            
            // Configurar nombre de usuario
            if (usernameElement) {
                usernameElement.textContent = currentUser.username;
            } else {
                console.warn('Elemento #username no encontrado en el DOM');
            }
            
            // Mostrar área de usuario autenticado
            if (authenticatedElement) {
                authenticatedElement.style.display = '';
            } else {
                console.warn('Elemento #authenticated no encontrado en el DOM');
            }
            
            // Mostrar indicador de conexión
            showConnectionStatus();
            
            // Mostrar botón de guardar puntuación si corresponde
            const saveScoreButton = document.getElementById('save-score');
            const gameOverScreen = document.getElementById('game-over');
            
            if (saveScoreButton && gameOverScreen && gameOverScreen.style.display !== 'none') {
                saveScoreButton.style.display = '';
            }
            
            // Verificar permisos y mostrar indicador si es necesario
            setTimeout(checkReauthentication, 1000);
            
            // Recargar el ranking para mostrar la posición del usuario
            if (typeof LeaderboardManager !== 'undefined' && LeaderboardManager.loadLeaderboard) {
                LeaderboardManager.loadLeaderboard();
            }
        } else {
            console.log('Actualizando UI para usuario no autenticado');

            // Ocultar área de usuario autenticado y mostrar botón de login
            if (authenticatedElement) {
                authenticatedElement.style.display = 'none';
            }
            
            if (notAuthenticatedElement) {
                notAuthenticatedElement.style.display = '';
            }
            
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