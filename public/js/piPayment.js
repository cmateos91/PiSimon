// Módulo de pagos con Pi Network
const PiPayment = (function() {
    const apiUrl = AppConfig.API_URL; // URL de nuestro backend
    
    // Crear y procesar un pago de 1 Pi para guardar la puntuación
    async function saveScore(score) {
        if (!PiAuth.isAuthenticated()) {
            NotificationSystem.show('Debes iniciar sesión para guardar tu puntuación', 'error');
            return { success: false, error: 'No autenticado' };
        }

        try {
            // La verificación de permisos ya no es posible con hasPermissions
            // Intentaremos el pago directamente y manejaremos cualquier error de permisos
            
            // Mostrar notificación de inicio de pago
            NotificationSystem.show('Preparando transacción de 1 Pi...', 'info');
            
            // 1. Crear un pago desde el cliente
            const paymentData = await createPayment(score);
            if (!paymentData || !paymentData.paymentId) {
                throw new Error('Error al crear el pago');
            }
            
            // Notificar progreso
            NotificationSystem.show('Transacción creada. Confirmando pago...', 'info');

            // 2. El servidor completa el pago
            const completionResult = await completePayment(paymentData.paymentId, score);
            
            // Mostrar efecto de confeti para celebrar
            if (typeof VisualEffects !== 'undefined' && VisualEffects.createConfetti) {
                VisualEffects.createConfetti(30);
            }
            
            return {
                success: true,
                message: 'Puntuación guardada exitosamente',
                data: completionResult
            };
        } catch (error) {
            console.error('Error en el proceso de pago:', error);
            
            // Restaurar botón de guardar puntuación
            const saveScoreButton = document.getElementById('save-score');
            if (saveScoreButton) {
                saveScoreButton.innerHTML = '<img src="img/pi3d.png" alt="Pi" class="pi-logo-button"> Guardar puntuación (1 Pi)';
                saveScoreButton.disabled = false;
            }
            
            // Mostrar mensaje de error apropiado
            let errorMessage = error.message || 'Error desconocido durante el pago';
            
            // Manejar específicamente el error de falta de permisos
            if (errorMessage.includes('permissions') || errorMessage.includes('scope') || errorMessage.includes('callback')) {
                errorMessage = 'Se requieren permisos adicionales para realizar pagos. Por favor, vuelve a iniciar sesión.';
                
                // Preguntar si desea volver a autenticarse para obtener los permisos
                setTimeout(() => {
                    if (confirm('Para poder realizar pagos, necesitas iniciar sesión nuevamente y conceder los permisos necesarios. ¿Quieres hacerlo ahora?')) {
                        // Cerrar sesión y recargar la página
                        localStorage.removeItem('pi_user');
                        window.location.reload();
                    }
                }, 1000);
            }
            
            NotificationSystem.show(`Error al guardar: ${errorMessage}`, 'error', 5000);
            
            return {
                success: false,
                error: errorMessage
            };
        }
    }

    // Crear un pago utilizando el SDK de Pi
    function createPayment(score) {
        return new Promise((resolve, reject) => {
            // Verificar que Pi SDK esté disponible
            if (typeof Pi === 'undefined') {
                reject(new Error('SDK de Pi no disponible. Esta aplicación requiere Pi Browser.'));
                return;
            }
            
            // Intentar crear el pago directamente, ya que hasPermissions no está disponible
            // Si no tiene permisos, Pi.createPayment fallará y lo capturaremos en el error
            
            // Actualizar la interfaz para mostrar que se está procesando el pago
            const saveScoreButton = document.getElementById('save-score');
            if (saveScoreButton) {
                saveScoreButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando pago...';
                saveScoreButton.disabled = true;
            }
            
            // Crear pago con el SDK de Pi
            Pi.createPayment({
                // Datos del pago
                amount: 1, // 1 Pi
                memo: `Simon Pi Game: Guardar puntuación ${score} puntos`,
                metadata: { 
                    type: 'score_save',
                    score: score,
                    userId: PiAuth.getCurrentUser().uid,
                    username: PiAuth.getCurrentUser().username,
                    timestamp: new Date().toISOString(),
                    gameId: 'simon-pi'
                }
            }, {
                // Callback de pago completado
                onReadyForServerApproval: function(paymentId) {
                    console.log('Pago listo para aprobación del servidor:', paymentId);
                    
                    // Mostrar notificación
                    NotificationSystem.show('Pago en proceso, esperando aprobación...', 'info');
                    
                    resolve({ 
                        paymentId,
                        status: 'ready_for_server_approval'
                    });
                },
                // Callback de pago cancelado
                onCancel: function(paymentId) {
                    console.log('Pago cancelado:', paymentId);
                    
                    // Restaurar botón
                    if (saveScoreButton) {
                        saveScoreButton.innerHTML = '<img src="img/pi3d.png" alt="Pi" class="pi-logo-button"> Guardar puntuación (1 Pi)';
                        saveScoreButton.disabled = false;
                    }
                    
                    // Mostrar notificación
                    NotificationSystem.show('Pago cancelado por el usuario', 'error');
                    
                    reject(new Error('Pago cancelado por el usuario'));
                },
                // Callback de error de pago
                onError: function(error, payment) {
                    console.error('Error en el pago:', error, payment);
                    
                    // Restaurar botón
                    if (saveScoreButton) {
                        saveScoreButton.innerHTML = '<img src="img/pi3d.png" alt="Pi" class="pi-logo-button"> Guardar puntuación (1 Pi)';
                        saveScoreButton.disabled = false;
                    }
                    
                    // Mostrar notificación
                    NotificationSystem.show(`Error en el pago: ${error}`, 'error');
                    
                    reject(new Error(`Error en el pago: ${error}`));
                },
                // IMPORTANTE: Agregar el callback onIncompletePaymentFound
                onIncompletePaymentFound: function(payment) {
                    console.log("Se encontró un pago incompleto:", payment);
                    
                    // Notificar al usuario
                    NotificationSystem.show('Se encontró un pago pendiente. Procesando...', 'info');
                    
                    // Resolver con el pago cancelado si es necesario
                    return Promise.resolve({
                        status: 'CANCELLED',
                        memo: payment ? payment.memo : 'Pago cancelado',
                        amount: payment ? payment.amount : 0,
                        transaction: null
                    });
                }
            });
        });
    }

    // Completar el pago a través de nuestro backend
    async function completePayment(paymentId, score) {
        try {
            const currentUser = PiAuth.getCurrentUser();
            
            // Notificar que se está verificando el pago
            NotificationSystem.show('Verificando pago con el servidor...', 'info');
            
            const response = await fetch(`${apiUrl}/payments/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.accessToken}`
                },
                body: JSON.stringify({
                    paymentId: paymentId,
                    userId: currentUser.uid,
                    username: currentUser.username,
                    score: score
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                
                // Notificar error
                NotificationSystem.show(errorData.message || 'Error al completar el pago', 'error');
                
                throw new Error(errorData.message || 'Error al completar el pago');
            }
            
            // Notificar éxito
            NotificationSystem.show('¡Pago completado con éxito!', 'success');
            
            // Reproducir sonido de éxito si está disponible
            if (typeof SoundEffects !== 'undefined' && SoundEffects.play) {
                SoundEffects.play('success');
            }

            return await response.json();
        } catch (error) {
            console.error('Error al completar el pago con el backend:', error);
            
            // Restaurar botón
            const saveScoreButton = document.getElementById('save-score');
            if (saveScoreButton) {
                saveScoreButton.innerHTML = '<img src="img/pi3d.png" alt="Pi" class="pi-logo-button"> Guardar puntuación (1 Pi)';
                saveScoreButton.disabled = false;
            }
            
            throw error;
        }
    }

    // Exponer métodos públicos
    return {
        saveScore
    };
})();