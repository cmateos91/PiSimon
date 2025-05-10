// Utilidades para mejorar la experiencia de usuario

// Sistema de notificaciones
const NotificationSystem = (function() {
    const notification = document.getElementById('notification');
    let timeoutId = null;
    
    // Mostrar notificación
    function show(message, type = 'info', duration = 3000) {
        // Limpiar cualquier timeout anterior
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        
        // Configurar el contenido y tipo
        notification.textContent = message;
        notification.className = 'notification';
        notification.classList.add(type);
        
        // Añadir ícono según el tipo
        let icon;
        switch (type) {
            case 'success':
                icon = '<i class="fas fa-check-circle"></i>';
                break;
            case 'error':
                icon = '<i class="fas fa-exclamation-circle"></i>';
                break;
            default:
                icon = '<i class="fas fa-info-circle"></i>';
        }
        
        notification.innerHTML = icon + message;
        
        // Mostrar la notificación
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Ocultar después del tiempo especificado
        timeoutId = setTimeout(() => {
            notification.classList.remove('show');
        }, duration);
    }
    
    // Exponer métodos públicos
    return {
        show
    };
})();

// Efectos visuales
const VisualEffects = (function() {
    // Crear efecto de confeti
    function createConfetti(amount = 50) {
        const container = document.body;
        
        for (let i = 0; i < amount; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            
            // Posición aleatoria
            confetti.style.left = Math.random() * 100 + 'vw';
            
            // Retraso aleatorio
            confetti.style.animationDelay = Math.random() * 3 + 's';
            
            // Colores aleatorios
            const colors = ['#f2d74e', '#95c3de', '#ff9a91', '#f2b8c6', '#88fb98'];
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            
            // Tamaño aleatorio
            const size = Math.random() * 10 + 5;
            confetti.style.width = size + 'px';
            confetti.style.height = size + 'px';
            
            // Rotación aleatoria
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            
            // Añadir al DOM
            container.appendChild(confetti);
            
            // Eliminar después de la animación
            setTimeout(() => {
                confetti.remove();
            }, 3000);
        }
    }
    
    // Efecto de shake para elementos
    function shake(element) {
        element.classList.add('shake');
        
        setTimeout(() => {
            element.classList.remove('shake');
        }, 500);
    }
    
    // Efecto de pulsación para elementos
    function pulse(element) {
        element.classList.add('celebrate');
        
        setTimeout(() => {
            element.classList.remove('celebrate');
        }, 500);
    }
    
    // Exponer métodos públicos
    return {
        createConfetti,
        shake,
        pulse
    };
})();

// Animaciones para el DOM
const DOMAnimations = (function() {
    // Mostrar elemento con animación de fadeIn
    function fadeIn(element, duration = 500) {
        element.style.opacity = 0;
        element.style.display = 'block';
        
        let start = null;
        
        function animate(timestamp) {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            
            element.style.opacity = Math.min(progress / duration, 1);
            
            if (progress < duration) {
                window.requestAnimationFrame(animate);
            }
        }
        
        window.requestAnimationFrame(animate);
    }
    
    // Ocultar elemento con animación de fadeOut
    function fadeOut(element, duration = 500) {
        let start = null;
        
        function animate(timestamp) {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            
            element.style.opacity = Math.max(1 - (progress / duration), 0);
            
            if (progress < duration) {
                window.requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
            }
        }
        
        window.requestAnimationFrame(animate);
    }
    
    // Animación de número contador
    function animateCounter(element, target, duration = 1000) {
        const start = parseInt(element.textContent) || 0;
        const difference = target - start;
        let startTime = null;
        
        function animate(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            
            if (progress < duration) {
                const value = Math.floor(start + (difference * (progress / duration)));
                element.textContent = value;
                window.requestAnimationFrame(animate);
            } else {
                element.textContent = target;
            }
        }
        
        window.requestAnimationFrame(animate);
    }
    
    // Exponer métodos públicos
    return {
        fadeIn,
        fadeOut,
        animateCounter
    };
})();

// Tema oscuro/claro
const ThemeManager = (function() {
    const THEMES = {
        LIGHT: 'light',
        DARK: 'dark'
    };
    
    let currentTheme = localStorage.getItem('theme') || THEMES.LIGHT;
    
    // Aplicar tema
    function applyTheme(theme) {
        document.body.classList.remove(THEMES.LIGHT, THEMES.DARK);
        document.body.classList.add(theme);
        localStorage.setItem('theme', theme);
        currentTheme = theme;
    }
    
    // Alternar tema
    function toggleTheme() {
        const newTheme = currentTheme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
        applyTheme(newTheme);
        return newTheme;
    }
    
    // Obtener tema actual
    function getCurrentTheme() {
        return currentTheme;
    }
    
    // Inicializar tema
    function init() {
        applyTheme(currentTheme);
    }
    
    // Exponer métodos públicos
    return {
        init,
        toggleTheme,
        getCurrentTheme,
        THEMES
    };
})();

// Efectos de sonido mejorados con optimizaciones para Pi Browser
const SoundEffects = {
    play: function(soundId) {
        // Mapear nombres de sonidos para que coincidan con los nuevos nombres
        const soundMap = {
            'wrong': 'wrong',
            'success': 'success',
            'levelup': 'levelup'
        };
        
        // Reproducir sonido, usando el mapeo si existe
        SoundManager.play(soundMap[soundId] || soundId);
    },
    
    toggleMute: function() {
        return SoundManager.toggleMute();
    },
    
    isSoundMuted: function() {
        return SoundManager.isMuted();
    },
    
    // Métodos adicionales para manejo del ciclo de vida
    suspend: function() {
        if (typeof SoundManager.suspend === 'function') {
            SoundManager.suspend();
        }
    },
    
    resume: function() {
        if (typeof SoundManager.resume === 'function') {
            SoundManager.resume();
        }
    },
    
    cleanup: function() {
        if (typeof SoundManager.cleanup === 'function') {
            SoundManager.cleanup();
        }
    }
};
