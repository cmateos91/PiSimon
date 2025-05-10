// Simulación del SDK de Pi para desarrollo local
// Este archivo simula las funciones básicas del SDK de Pi para desarrollo

console.log("🚀 Cargando simulación del SDK de Pi para desarrollo");

// Definir objeto global Pi
window.Pi = (function() {
    let isInitialized = false;
    let authenticateCallback = null;
    let paymentCallbacks = {};
    
    // Simulación de usuario de prueba
    const testUser = {
        uid: 'test_user_' + Math.floor(Math.random() * 10000),
        username: 'PioneerTest',
    };
    
    return {
        // Inicialización del SDK
        init: function(options) {
            console.log("🔧 SDK de Pi simulado inicializado con opciones:", options);
            isInitialized = true;
            return true;
        },
        
        // Autenticación de usuario
        authenticate: function(onSuccess, onError) {
            console.log("🔑 Simulando autenticación de Pi");
            
            if (!isInitialized) {
                console.error("❌ SDK no inicializado. Llama a Pi.init primero.");
                if (onError) onError("NOT_INITIALIZED");
                return;
            }
            
            // Simular un pequeño retraso para la autenticación
            setTimeout(() => {
                // Generar datos de autenticación simulados
                const auth = {
                    user: testUser,
                    accessToken: 'test_access_token_' + Date.now()
                };
                
                console.log("✅ Autenticación simulada exitosa:", auth);
                
                if (onSuccess) onSuccess(auth);
            }, 800);
        },
        
        // Creación de pago
        createPayment: function(paymentData, callbacks) {
            console.log("💰 Simulando creación de pago:", paymentData);
            
            if (!isInitialized) {
                console.error("❌ SDK no inicializado. Llama a Pi.init primero.");
                if (callbacks.onError) callbacks.onError("NOT_INITIALIZED");
                return;
            }
            
            // Guardar callbacks para usar después
            paymentCallbacks = callbacks;
            
            // Mostrar diálogo simulado de pago después de un retraso
            setTimeout(() => {
                showPaymentDialog(paymentData, callbacks);
            }, 500);
        }
    };
})();

// Simulación de diálogo de pago
function showPaymentDialog(paymentData, callbacks) {
    // Crear un diálogo de pago simulado
    const dialog = document.createElement('div');
    dialog.className = 'payment-dialog-mock';
    dialog.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgba(0, 0, 0, 0.7);
        z-index: 10000;
    `;
    
    // Contenido del diálogo
    const content = document.createElement('div');
    content.style.cssText = `
        background-color: white;
        border-radius: 12px;
        padding: 20px;
        width: 90%;
        max-width: 400px;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
        text-align: center;
    `;
    
    content.innerHTML = `
        <div style="font-size: 1.5rem; color: #8a2be2; margin-bottom: 15px; font-weight: bold;">
            Confirmación de Pago
        </div>
        <div style="margin-bottom: 20px; color: #333;">
            <p style="margin-bottom: 10px;">
                Estás a punto de pagar:
            </p>
            <p style="font-size: 1.8rem; font-weight: bold; color: #8a2be2; margin-bottom: 10px;">
                ${paymentData.amount} π
            </p>
            <p style="color: #666; font-size: 0.9rem;">
                ${paymentData.memo || 'No se proporcionó descripción'}
            </p>
        </div>
        <div style="display: flex; flex-direction: column; gap: 10px;">
            <button id="approve-payment" style="
                background-color: #8a2be2;
                color: white;
                border: none;
                padding: 12px;
                border-radius: 8px;
                font-weight: bold;
                cursor: pointer;
                transition: background-color 0.3s;
            ">Aprobar Pago</button>
            <button id="cancel-payment" style="
                background-color: #f5f5f5;
                color: #333;
                border: none;
                padding: 12px;
                border-radius: 8px;
                font-weight: bold;
                cursor: pointer;
                transition: background-color 0.3s;
            ">Cancelar</button>
        </div>
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee; color: #999; font-size: 0.8rem;">
            ⚠️ Este es un diálogo de pago simulado para desarrollo. No se está realizando ningún pago real.
        </div>
    `;
    
    // Añadir el diálogo al DOM
    document.body.appendChild(dialog);
    
    // Manejar eventos de los botones
    const approveButton = content.querySelector('#approve-payment');
    const cancelButton = content.querySelector('#cancel-payment');
    
    // Generar un ID de pago simulado
    const paymentId = 'simulated_payment_' + Date.now();
    
    // Evento de aprobación
    approveButton.addEventListener('click', function() {
        // Actualizar la interfaz para mostrar el progreso
        content.innerHTML = `
            <div style="font-size: 1.5rem; color: #8a2be2; margin-bottom: 20px; font-weight: bold;">
                Procesando Pago
            </div>
            <div style="margin-bottom: 25px;">
                <div style="
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #8a2be2;
                    border-radius: 50%;
                    width: 50px;
                    height: 50px;
                    animation: spin 1s linear infinite;
                    margin: 0 auto;
                "></div>
                <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            </div>
            <div style="color: #666;">
                Por favor espera mientras procesamos tu pago...
            </div>
        `;
        
        // Simular un retraso para el procesamiento
        setTimeout(function() {
            // Llamar al callback de pago listo para aprobación del servidor
            if (callbacks && callbacks.onReadyForServerApproval) {
                callbacks.onReadyForServerApproval(paymentId);
            }
            
            // Cerrar el diálogo después de la aprobación
            setTimeout(function() {
                document.body.removeChild(dialog);
            }, 1000);
        }, 2000);
    });
    
    // Evento de cancelación
    cancelButton.addEventListener('click', function() {
        // Llamar al callback de cancelación
        if (callbacks && callbacks.onCancel) {
            callbacks.onCancel(paymentId);
        }
        
        // Cerrar el diálogo
        document.body.removeChild(dialog);
    });
    
    // Añadir el contenido al diálogo
    dialog.appendChild(content);
}
