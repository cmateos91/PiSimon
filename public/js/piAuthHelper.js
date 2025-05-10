// Función global de autenticación para asegurar accesibilidad
function authenticateWithPi() {
    console.log('Función authenticateWithPi llamada');
    try {
        // Asegurarse que Pi está inicializado
        if (typeof Pi !== 'undefined') {
            console.log('SDK de Pi encontrado, intentando autenticar...');
            try {
                // Inicializar Pi si es necesario
                if (!window.piInitDone) {
                    console.log('Inicializando Pi SDK desde authenticateWithPi...');
                    try {
                        // Inicializar Pi SDK en modo producción
                        Pi.init({ version: "2.0", sandbox: false });
                        window.piInitDone = true;
                        console.log('Pi SDK inicializado correctamente desde authenticateWithPi');
                        console.log('Estado del Pi SDK:', Pi);
                    } catch (initError) {
                        console.error('Error crítico al inicializar Pi SDK:', initError);
                        alert('Error al inicializar Pi SDK: ' + initError.message);
                        return; // Salir para evitar errores adicionales
                    }
                } else {
                    console.log('Pi SDK ya estaba inicializado. Estado:', Pi);
                }
                
                // Definir callbacks para pagos incompletos
                const handleIncompletePayment = function(payment) {
                    console.log("Se encontró un pago incompleto:", payment);
                    return Promise.resolve({
                        status: 'CANCELLED',
                        memo: payment ? payment.memo : 'Pago cancelado',
                        amount: payment ? payment.amount : 0,
                        transaction: null
                    });
                };
                
                // Forzar uso directo de Pi.authenticate para maximizar compatibilidad
                try {
                    console.log('Llamando a Pi.authenticate con scope [username]...');
                    // Debido a que el SDK de Pi puede tener diferentes versiones y comportamientos,
                    // usamos un enfoque directo que funciona en todas las versiones
                    if (typeof Pi.authenticate === 'function') {
                        const auth = Pi.authenticate(['username'], handleIncompletePayment);
                        
                        if (auth && typeof auth.then === 'function') {
                            // Es una promesa, manejarla normalmente
                            auth.then(function(authResult) {
                                console.log('Autenticación exitosa (promesa):', authResult);
                                if (PiAuth && typeof PiAuth.handleAuthSuccess === 'function') {
                                    PiAuth.handleAuthSuccess(authResult);
                                } else {
                                    console.error('PiAuth no disponible para manejar autenticación exitosa');
                                    alert('Autenticación exitosa con Pi, pero el manejador no está disponible.');
                                }
                            })
                            .catch(function(error) {
                                console.error('Error en Pi.authenticate (promesa):', error);
                                alert('Error al autenticar con Pi: ' + (error.message || 'Error desconocido'));
                            });
                        } else if (auth) {
                            // Es un resultado directo, pasar al manejador
                            console.log('Autenticación exitosa (directa):', auth);
                            if (PiAuth && typeof PiAuth.handleAuthSuccess === 'function') {
                                PiAuth.handleAuthSuccess(auth);
                            } else {
                                console.error('PiAuth no disponible para manejar autenticación exitosa');
                                alert('Autenticación exitosa con Pi, pero el manejador no está disponible.');
                            }
                        } else {
                            console.error('Resultado de autenticación desconocido:', auth);
                            alert('Resultado de autenticación desconocido. Contacta al soporte.');
                        }
                    } else {
                        console.error('Pi.authenticate no es una función');
                        alert('Error: Pi.authenticate no es una función. Asegúrate de estar usando el Pi Browser.');
                    }
                } catch (authError) {
                    console.error('Error directo en Pi.authenticate:', authError);
                    alert('Error directo al autenticar: ' + (authError.message || 'Error desconocido'));
                }
            } catch (e) {
                console.error('Error al inicializar o autenticar Pi:', e);
                alert('Error al inicializar o autenticar Pi: ' + e.message);
            }
        } else {
            console.error('SDK de Pi no disponible');
            alert('Pi SDK no está disponible. Asegúrate de estar usando Pi Browser.');
        }
    } catch (e) {
        console.error('Error general en authenticateWithPi:', e);
        alert('Error general al autenticar: ' + e.message);
    }
}