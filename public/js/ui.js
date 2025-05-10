// Módulo para gestionar la interfaz de usuario y componentes interactivos
const UIManager = (function() {
    // Elemento del botón de configuración
    let configButton = null;
    
    // Inicializar componentes de UI
    function init() {
        // Crear botón flotante de configuración
        createConfigButton();
        
        // Registrar manejadores de eventos para ciclo de vida del audio
        setupAudioLifecycle();
    }
    
    // Configurar eventos para manejo de ciclo de vida del audio
    function setupAudioLifecycle() {
        // Suspender audio cuando la aplicación pierde el foco
        window.addEventListener('blur', function() {
            if (SoundManager && typeof SoundManager.suspend === 'function') {
                SoundManager.suspend();
            }
        });
        
        // Reanudar audio cuando la aplicación recupera el foco
        window.addEventListener('focus', function() {
            if (SoundManager && typeof SoundManager.resume === 'function') {
                SoundManager.resume();
            }
        });
        
        // Manejar visibilidad del documento
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                // La página está oculta, suspender audio
                if (SoundManager && typeof SoundManager.suspend === 'function') {
                    SoundManager.suspend();
                }
            } else {
                // La página está visible, reanudar audio
                if (SoundManager && typeof SoundManager.resume === 'function') {
                    SoundManager.resume();
                }
            }
        });
        
        // Liberar recursos al cerrar la página
        window.addEventListener('beforeunload', function() {
            if (SoundManager && typeof SoundManager.cleanup === 'function') {
                SoundManager.cleanup();
            }
        });
    }
    
    // Crear botón flotante de configuración
    function createConfigButton() {
        configButton = document.createElement('button');
        configButton.className = 'floating-controls';
        configButton.innerHTML = '<i class="fas fa-cog"></i>';
        configButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background: var(--pi-purple);
            color: white;
            border: none;
            box-shadow: 0 4px 12px rgba(138, 43, 226, 0.5);
            z-index: 100;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.4rem;
            cursor: pointer;
            transition: transform 0.3s, background-color 0.3s, box-shadow 0.3s;
        `;
        
        // Efectos de hover
        configButton.addEventListener('mouseover', () => {
            configButton.style.transform = 'scale(1.1)';
            configButton.style.boxShadow = '0 6px 16px rgba(138, 43, 226, 0.7)';
        });
        
        configButton.addEventListener('mouseout', () => {
            configButton.style.transform = 'scale(1)';
            configButton.style.boxShadow = '0 4px 12px rgba(138, 43, 226, 0.5)';
        });
        
        // Mostrar/ocultar menú al hacer clic
        configButton.addEventListener('click', () => {
            // Mostrar/ocultar menú de controles
            const existingMenu = document.querySelector('.controls-menu');
            if (existingMenu) {
                existingMenu.remove();
                // Restaurar apariencia normal del botón
                resetConfigButtonAppearance();
            } else {
                // Cambiar apariencia cuando el menú está activo
                configButton.style.backgroundColor = 'var(--pi-purple-dark)';
                configButton.innerHTML = '<i class="fas fa-times"></i>';
                showControlsMenu();
            }
        });
        
        document.body.appendChild(configButton);
    }
    
    // Restaurar apariencia normal del botón de configuración
    function resetConfigButtonAppearance() {
        if (configButton) {
            configButton.style.backgroundColor = 'var(--pi-purple)';
            configButton.style.transform = 'scale(1)';
            configButton.innerHTML = '<i class="fas fa-cog"></i>';
        }
    }
    
    // Mostrar menú de configuración
    function showControlsMenu() {
        let activeMenu = document.createElement('div');
        activeMenu.className = 'controls-menu';
        activeMenu.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            background: rgba(50, 50, 50, 0.95);
            border-radius: 10px;
            box-shadow: 0 3px 15px rgba(0,0,0,0.3);
            padding: 15px;
            z-index: 99;
            display: flex;
            flex-direction: column;
            gap: 10px;
            transform: translateY(20px);
            opacity: 0;
            transition: transform 0.3s, opacity 0.3s;
            border: 1px solid rgba(138, 43, 226, 0.5);
        `;
        
        // Crear botones de configuración
        const themeButton = createMenuButton(
            '<i class="fas fa-moon"></i> Modo oscuro',
            (e) => {
                e.stopPropagation();
                const newTheme = ThemeManager.toggleTheme();
                themeButton.innerHTML = newTheme === 'dark' ? 
                    '<i class="fas fa-sun"></i> Modo claro' : 
                    '<i class="fas fa-moon"></i> Modo oscuro';
                
                // Feedback visual
                applyButtonFeedback(themeButton);
            }
        );
        
        const soundButton = createMenuButton(
            SoundEffects.isSoundMuted() ? 
            '<i class="fas fa-volume-mute"></i> Activar sonido' : 
            '<i class="fas fa-volume-up"></i> Silenciar',
            (e) => {
                e.stopPropagation();
                const isMuted = SoundEffects.toggleMute();
                soundButton.innerHTML = isMuted ? 
                    '<i class="fas fa-volume-mute"></i> Activar sonido' : 
                    '<i class="fas fa-volume-up"></i> Silenciar';
                
                // Feedback visual
                applyButtonFeedback(soundButton);
            }
        );
        
        const infoButton = createMenuButton(
            '<i class="fas fa-info-circle"></i> Acerca de',
            (e) => {
                e.stopPropagation();
                
                // Cerramos el menú y mostramos el modal
                activeMenu.remove();
                resetConfigButtonAppearance();
                
                // Mostrar modal de información
                showAboutModal();
                
                // Feedback visual
                applyButtonFeedback(infoButton);
            }
        );
        
        // Añadir botones al menú
        activeMenu.appendChild(themeButton);
        activeMenu.appendChild(soundButton);
        activeMenu.appendChild(infoButton);
        
        // Añadir efectos hover a los botones
        [themeButton, soundButton, infoButton].forEach(addHoverEffect);
        
        // Añadir menú al documento
        document.body.appendChild(activeMenu);
        
        // Mostrar con animación
        setTimeout(() => {
            activeMenu.style.transform = 'translateY(0)';
            activeMenu.style.opacity = '1';
        }, 10);
        
        // Cerrar al hacer clic fuera
        document.addEventListener('click', function closeMenu(e) {
            // Solo cerramos si el clic fue fuera del menú y fuera del botón de control
            if (activeMenu && !activeMenu.contains(e.target) && e.target !== configButton && !configButton.contains(e.target)) {
                activeMenu.style.transform = 'translateY(20px)';
                activeMenu.style.opacity = '0';
                
                // Restaurar apariencia normal del botón
                resetConfigButtonAppearance();
                
                setTimeout(() => {
                    if (activeMenu && activeMenu.parentNode) {
                        activeMenu.remove();
                    }
                }, 300);
                
                document.removeEventListener('click', closeMenu);
            }
        });
    }
    
    // Crear un botón para el menú de configuración
    function createMenuButton(innerHTML, clickHandler) {
        const button = document.createElement('button');
        button.innerHTML = innerHTML;
        button.style.cssText = `
            background: rgba(255, 255, 255, 0.15);
            color: white;
            border: none;
            border-radius: 5px;
            padding: 10px 15px;
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
            transition: background-color 0.3s;
            font-size: 0.9rem;
        `;
        
        button.addEventListener('click', clickHandler);
        
        return button;
    }
    
    // Añadir efecto hover a un botón
    function addHoverEffect(button) {
        button.addEventListener('mouseover', () => {
            button.style.backgroundColor = 'rgba(138, 43, 226, 0.3)';
        });
        button.addEventListener('mouseout', () => {
            button.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
        });
    }
    
    // Aplicar feedback visual al botón al hacer clic
    function applyButtonFeedback(button) {
        button.style.backgroundColor = 'rgba(138, 43, 226, 0.3)';
        setTimeout(() => {
            button.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
        }, 300);
    }
    
    // Mostrar modal de información "Acerca de"
    function showAboutModal() {
        const modal = document.createElement('div');
        modal.className = 'about-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: #222;
            color: white;
            border-radius: 10px;
            padding: 30px;
            max-width: 500px;
            width: 90%;
            transform: translateY(-20px);
            transition: transform 0.3s;
            position: relative;
            border: 1px solid rgba(138, 43, 226, 0.5);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
        `;
        
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '&times;';
        closeButton.style.cssText = `
            position: absolute;
            top: 10px;
            right: 15px;
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #aaa;
        `;
        
        closeButton.addEventListener('click', () => {
            modalContent.style.transform = 'translateY(-20px)';
            modal.style.opacity = '0';
            
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        });
        
        modalContent.innerHTML = `
            <h2 style="color: var(--pi-purple); margin-bottom: 15px;">Acerca de Simon Pi</h2>
            <p style="margin-bottom: 15px; color: #ddd;">Simon Pi es una adaptación del clásico juego de memoria Simon para la red Pi Network.</p>
            <p style="margin-bottom: 15px; color: #ddd;">Desarrollado como demo para mostrar las capacidades de integración con Pi Network, incluyendo autenticación de usuarios y pagos.</p>
            <p style="margin-bottom: 15px; color: #ddd;">Versión: 1.0.0</p>
            <p style="margin-bottom: 15px; color: #ddd;">©2025 - Todos los derechos reservados.</p>
            <p style="color: #ddd;">¡Gracias por jugar! <i class="fas fa-heart" style="color: #FF4081;"></i></p>
        `;
        
        modalContent.appendChild(closeButton);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Mostrar con animación
        setTimeout(() => {
            modal.style.opacity = '1';
            modalContent.style.transform = 'translateY(0)';
        }, 10);
    }
    
    // Mostrar pantalla de carga inicial
    function showLoadingScreen() {
        const loadingElement = document.createElement('div');
        loadingElement.className = 'loading-screen';
        loadingElement.innerHTML = `
            <div class="loading-content">
                <h1>Simon Pi</h1>
                <div class="spinner"></div>
                <p>Cargando juego...</p>
            </div>
        `;
        document.body.appendChild(loadingElement);
        
        // Crear estilos para la pantalla de carga
        const style = document.createElement('style');
        style.textContent = `
            .loading-screen {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: var(--pi-purple);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                transition: opacity 0.5s, visibility 0.5s;
            }
            .loading-content {
                text-align: center;
                color: white;
            }
            .loading-content h1 {
                font-size: 3rem;
                margin-bottom: 20px;
                animation: pulse 2s infinite;
            }
            .spinner {
                width: 50px;
                height: 50px;
                border: 5px solid rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                border-top-color: white;
                margin: 0 auto 20px;
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        
        // Devolver una función para ocultar la pantalla de carga
        return function hideLoadingScreen() {
            loadingElement.style.opacity = '0';
            setTimeout(() => {
                loadingElement.style.visibility = 'hidden';
                document.body.removeChild(loadingElement);
            }, 500);
        };
    }
    
    // Detectar si es un dispositivo móvil
    function isMobileDevice() {
        return (window.innerWidth <= 768) || 
               ('ontouchstart' in window) || 
               (navigator.maxTouchPoints > 0) ||
               (navigator.msMaxTouchPoints > 0);
    }
    
    // Aplicar optimizaciones para dispositivos móviles
    function applyMobileOptimizations() {
        if (isMobileDevice()) {
            document.body.classList.add('mobile-device');
            
            // Prevenir zoom en doble toque para dispositivos táctiles
            document.addEventListener('touchstart', function(e) {
                if (e.touches.length > 1) {
                    e.preventDefault();
                }
            }, { passive: false });
            
            // Prevenir zoom en gestos de pellizco
            document.addEventListener('touchmove', function(e) {
                if (e.touches.length > 1) {
                    e.preventDefault();
                }
            }, { passive: false });
        }
    }
    
    // Exponer métodos públicos
    return {
        init,
        showLoadingScreen,
        showAboutModal,
        applyMobileOptimizations,
        isMobileDevice
    };
})();
