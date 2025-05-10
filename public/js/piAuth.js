// Módulo de autenticación con Pi Network
const PiAuth = (function() {
    let currentUser = null;
    const apiUrl = 'http://localhost:3000'; // URL de nuestro backend para desarrollo
    
    // Elementos del DOM
    const notAuthenticatedElement = document.getElementById('not-authenticated');
    const authenticatedElement = document.getElementById('authenticated');
    const usernameElement = document.getElementById('username');
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');

    // Inicializar el SDK de Pi
    function init() {
        // Inicializar Pi SDK
        Pi.init({ version: "2.0" });
        
        // Añadir clase de carga durante la inicialización
        loginButton.classList.add('loading');
        loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Conectando...';
        
        // Comprobar si hay una sesión activa
        setTimeout(() => {
            checkSession();
            
            // Eliminar clase de carga
            loginButton.classList.remove('loading');
            loginButton.innerHTML = '<img src="img/pi3d.png" alt="Pi" class="pi-logo-button"> Iniciar sesión con Pi';
        }, 1000);
        
        // Configurar eventos de los botones
        loginButton.addEventListener('click', authenticate);
        logoutButton.addEventListener('click', logout);
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
            } catch (error) {
                console.error('Error al recuperar la sesión del usuario:', error);
                localStorage.removeItem('pi_user');
                
                // Notificar error
                NotificationSystem.show('Error al recuperar la sesión. Inicia sesión de nuevo.', 'error');
            }
        }
    }

    // Autenticar con Pi Network
    function authenticate() {
        // Añadir efecto de carga
        loginButton.disabled = true;
        loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Conectando...';
        
        NotificationSystem.show('Conectando con Pi Network...', 'info');
        
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
                
                // Verificar con nuestro backend
                verifyWithBackend(currentUser)
                    .then(response => {
                        console.log('Verificación con backend exitosa:', response);
                        updateUI(true);
                        
                        // Notificar éxito
                        NotificationSystem.show(`¡Bienvenido, ${currentUser.username}!`, 'success');
                        
                        // Efectos visuales
                        VisualEffects.pulse(authenticatedElement);
                    })
                    .catch(error => {
                        console.error('Error al verificar con backend:', error);
                        logout();
                        
                        // Notificar error
                        NotificationSystem.show('Error de autenticación. Por favor, intenta de nuevo.', 'error');
                        
                        // Resetear botón
                        loginButton.disabled = false;
                        loginButton.innerHTML = '<img src="img/pi3d.png" alt="Pi" class="pi-logo-button"> Iniciar sesión con Pi';
                    });
            },
            // Callback de error
            function(error) {
                console.error('Error de autenticación Pi:', error);
                
                // Notificar error
                NotificationSystem.show('Error al conectar con Pi Network', 'error');
                
                // Resetear botón
                loginButton.disabled = false;
                loginButton.innerHTML = '<img src="img/pi3d.png" alt="Pi" class="pi-logo-button"> Iniciar sesión con Pi';
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
        // Añadir efecto de carga
        logoutButton.disabled = true;
        logoutButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cerrando...';
        
        // Pequeña demora para mostrar la animación
        setTimeout(() => {
            currentUser = null;
            localStorage.removeItem('pi_user');
            updateUI(false);
            
            // Notificar cierre de sesión
            NotificationSystem.show('Sesión cerrada correctamente', 'info');
            
            // Resetear botón
            logoutButton.disabled = false;
            logoutButton.textContent = 'Cerrar sesión';
        }, 800);
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
