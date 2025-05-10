// Función global de autenticación para asegurar accesibilidad
function authenticateWithPi() {
    console.log('Función authenticateWithPi llamada');
    try {
        // Verificar que Pi SDK está disponible
        if (typeof Pi === 'undefined') {
            console.error('SDK de Pi no disponible');
            NotificationSystem.show('Pi SDK no está disponible. Asegúrate de estar usando Pi Browser.', 'error');
            return;
        }
        
        console.log('SDK de Pi encontrado, intentando autenticar...');
        
        // Inicializar Pi si es necesario
        if (!window.piInitDone) {
            console.log('Inicializando Pi SDK desde authenticateWithPi...');
            try {
                Pi.init({ version: "2.0" });
                window.piInitDone = true;
                console.log('Pi SDK inicializado correctamente');
            } catch (initError) {
                console.error('Error al inicializar Pi SDK:', initError);
                NotificationSystem.show('Error al inicializar Pi SDK: ' + initError.message, 'error');
                return;
            }
        }
        
        // Callback para pagos incompletos
        const handleIncompletePayment = function(payment) {
            console.log("Se encontró un pago incompleto:", payment);
            return Promise.resolve({
                status: 'CANCELLED',
                memo: payment ? payment.memo : 'Pago cancelado',
                amount: payment ? payment.amount : 0,
                transaction: null
            });
        };
        
        // Intentar autenticación
        console.log('Llamando a Pi.authenticate con scope [username]...');
        try {
            const auth = Pi.authenticate(['username'], handleIncompletePayment);
            
            if (auth && typeof auth.then === 'function') {
                // Es una promesa, manejarla
                auth.then(function(authResult) {
                    console.log('Autenticación exitosa (promesa):', authResult);
                    if (PiAuth && typeof PiAuth.handleAuthSuccess === 'function') {
                        PiAuth.handleAuthSuccess(authResult);
                    } else {
                        console.error('PiAuth no disponible para manejar autenticación exitosa');
                        NotificationSystem.show('Error: No se pudo completar la autenticación.', 'error');
                    }
                })
                .catch(function(error) {
                    console.error('Error en Pi.authenticate (promesa):', error);
                    NotificationSystem.show('Error al autenticar: ' + (error.message || 'Error desconocido'), 'error');
                });
            } else if (auth) {
                // Es un resultado directo
                console.log('Autenticación exitosa (directa):', auth);
                if (PiAuth && typeof PiAuth.handleAuthSuccess === 'function') {
                    PiAuth.handleAuthSuccess(auth);
                } else {
                    console.error('PiAuth no disponible para manejar autenticación exitosa');
                    NotificationSystem.show('Error: No se pudo completar la autenticación.', 'error');
                }
            } else {
                console.error('Resultado de autenticación desconocido:', auth);
                NotificationSystem.show('Resultado de autenticación desconocido.', 'error');
            }
        } catch (authError) {
            console.error('Error directo en Pi.authenticate:', authError);
            NotificationSystem.show('Error al autenticar: ' + (authError.message || 'Error desconocido'), 'error');
        }
    } catch (e) {
        console.error('Error general en authenticateWithPi:', e);
        NotificationSystem.show('Error general al autenticar: ' + e.message, 'error');
    }
}