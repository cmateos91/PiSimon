// Este archivo ya no es necesario y se mantiene solo por compatibilidad.
// La aplicación ahora está optimizada para funcionar exclusivamente en Pi Browser.

console.error("Esta aplicación solo funciona en Pi Browser. Por favor, accede desde Pi Browser.");

// Simulación mínima para evitar errores en caso de que alguien intente cargar la aplicación fuera de Pi Browser
window.Pi = {
    init: function() {
        console.error("SDK no disponible: Esta aplicación requiere Pi Browser");
        return false;
    },
    authenticate: function() {
        console.error("SDK no disponible: Esta aplicación requiere Pi Browser");
        return null;
    },
    createPayment: function() {
        console.error("SDK no disponible: Esta aplicación requiere Pi Browser");
        return null;
    }
};

// Mostrar un mensaje de error al usuario
document.addEventListener("DOMContentLoaded", function() {
    // Solo mostrar el mensaje si realmente no estamos en el entorno de Pi
    if (typeof Pi === 'object' && Pi.init === window.Pi.init) {
        const errorElement = document.createElement('div');
        errorElement.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.9);
            color: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            text-align: center;
            padding: 20px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        `;
        
        errorElement.innerHTML = `
            <img src="img/pi3d.png" alt="Pi" style="width: 80px; height: 80px; margin-bottom: 20px;">
            <h1 style="margin: 0 0 20px 0; color: #8b50f5;">Error de Entorno</h1>
            <p style="margin: 0 0 15px 0; font-size: 18px; max-width: 500px;">
                Esta aplicación está diseñada para funcionar exclusivamente en <strong>Pi Browser</strong>.
            </p>
            <p style="margin: 0 0 30px 0; font-size: 16px; max-width: 450px; color: #ccc;">
                Por favor, accede a esta aplicación desde Pi Browser para disfrutar de la experiencia completa.
            </p>
            <a href="https://minepi.com/download" style="
                background-color: #8b50f5;
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: bold;
                font-size: 16px;
                margin-top: 10px;
            ">Descargar Pi Browser</a>
        `;
        
        document.body.appendChild(errorElement);
    }
});