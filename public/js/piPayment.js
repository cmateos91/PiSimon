// Módulo de pagos con Pi Network
const PiPayment = (function() {
    const apiUrl = 'http://localhost:3000'; // URL de nuestro backend para desarrollo
    
    // Simular un pago para desarrollo (cuando no está disponible Pi Browser)
    function simulatePayment(score) {
        return new Promise((resolve) => {
            console.log('Simulando pago para puntuación:', score);
            
            // Obtener el botón de guardar puntuación
            const saveScoreButton = document.getElementById('save-score');
            if (saveScoreButton) {
                saveScoreButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando pago simulado...';
                saveScoreButton.disabled = true;
            }
            
            // Mostrar diálogo simulado de pago
            showSimulatedPaymentDialog(score);
            
            // Simular retraso de procesamiento
            setTimeout(() => {
                const simulatedPaymentId = 'sim_payment_' + Date.now();
                
                // Restaurar botón
                if (saveScoreButton) {
                    saveScoreButton.innerHTML = '<img src="img/pi3d.png" alt="Pi" class="pi-logo-button"> Guardar puntuación (1 Pi)';
                    saveScoreButton.disabled = false;
                }
                
                // Simular éxito de pago
                resolve({ 
                    success: true,
                    message: 'Pago simulado exitosamente',
                    data: {
                        payment: {
                            paymentId: simulatedPaymentId,
                            amount: 1,
                            status: 'completed',
                            completedAt: new Date()
                        },
                        score: {
                            userId: PiAuth.getCurrentUser().uid,
                            username: PiAuth.getCurrentUser().username,
                            score: score
                        }
                    }
                });
            }, 3000);
        });
    }
    
    // Mostrar diálogo simulado de pago
    function showSimulatedPaymentDialog(score) {
        // Crear el fondo del diálogo
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        // Crear el contenido del diálogo
        const content = document.createElement('div');
        content.style.cssText = `
            background-color: white;
            border-radius: 12px;
            padding: 20px;
            max-width: 320px;
            width: 90%;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        `;
        
        // Contenido del diálogo
        content.innerHTML = `
            <h3 style="color: #8a2be2; margin-bottom: 15px; font-size: 1.3rem;">Confirmación de Pago Simulado</h3>
            <p style="color: #333; margin-bottom: 20px;">Estás a punto de pagar <strong>1 Pi</strong> para guardar tu puntuación de <strong>${score} puntos</strong>.</p>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button id="cancel-payment" style="background-color: #f44336; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer;">Cancelar</button>
                <button id="confirm-payment" style="background-color: #4CAF50; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer;">Confirmar Pago</button>
            </div>
            <p style="font-size: 0.8rem; margin-top: 15px; color: #777;">Esto es una simulación para desarrollo. No se realizará ningún pago real.</p>
        `;
        
        // Añadir el contenido al diálogo
        dialog.appendChild(content);
        document.body.appendChild(dialog);
        
        // Añadir eventos a los botones
        const cancelButton = content.querySelector('#cancel-payment');
        const confirmButton = content.querySelector('#confirm-payment');
        
        // Botón de cancelar
        cancelButton.addEventListener('click', () => {
            // Cerrar el diálogo
            document.body.removeChild(dialog);
            
            // Restaurar botón de guardar puntuación
            const saveScoreButton = document.getElementById('save-score');
            if (saveScoreButton) {
                saveScoreButton.innerHTML = '<img src="img/pi3d.png" alt="Pi" class="pi-logo-button"> Guardar puntuación (1 Pi)';
                saveScoreButton.disabled = false;
            }
            
            // Mostrar notificación
            NotificationSystem.show('Pago cancelado', 'error');
        });
        
        // Botón de confirmar
        confirmButton.addEventListener('click', () => {
            // Actualizar la interfaz del diálogo
            content.innerHTML = `
                <h3 style="color: #8a2be2; margin-bottom: 15px; font-size: 1.3rem;">Procesando Pago</h3>
                <div style="margin: 20px 0;">
                    <div style="border: 4px solid #f3f3f3; border-top: 4px solid #8a2be2; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto;"></div>
                </div>
                <p style="color: #333;">Por favor espera mientras procesamos tu pago...</p>
                <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            `;
            
            // Cerrar el diálogo después de un tiempo
            setTimeout(() => {
                content.innerHTML = `
                    <h3 style="color: #4CAF50; margin-bottom: 15px; font-size: 1.3rem;">¡Pago Completado!</h3>
                    <p style="color: #333; margin-bottom: 20px;">Tu puntuación ha sido guardada exitosamente.</p>
                    <button id="close-dialog" style="background-color: #8a2be2; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer;">Cerrar</button>
                `;
                
                const closeButton = content.querySelector('#close-dialog');
                closeButton.addEventListener('click', () => {
                    document.body.removeChild(dialog);
                });
                
                // Cerrar automáticamente después de un tiempo
                setTimeout(() => {
                    if (document.body.contains(dialog)) {
                        document.body.removeChild(dialog);
                    }
                }, 2000);
            }, 2000);
        });
    }
    
    // Crear y procesar un pago de 1 Pi para guardar la puntuación
    async function saveScore(score) {
        if (!PiAuth.isAuthenticated()) {
            NotificationSystem.show('Debes iniciar sesión para guardar tu puntuación', 'error');
            return { success: false, error: 'No autenticado' };
        }

        try {
            // Mostrar notificación de inicio de pago
            NotificationSystem.show('Preparando transacción de 1 Pi...', 'info');
            
            // En modo desarrollo, siempre usar simulación
            if (AppConfig.DEV_MODE) {
                console.log('Modo desarrollo activo - Usando simulación de pago');
                return await simulatePayment(score);
            }
            
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
            VisualEffects.createConfetti(30);
            
            return {
                success: true,
                message: 'Puntuación guardada exitosamente',
                data: completionResult
            };
        } catch (error) {
            console.error('Error en el proceso de pago:', error);
            return {
                success: false,
                error: error.message || 'Error desconocido durante el pago'
            };
        }
    }

    // Crear un pago utilizando el SDK de Pi
    function createPayment(score) {
        return new Promise((resolve, reject) => {
            // Datos del pago
            const paymentData = {
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
            };
            
            // Crear animación de carga mientras se procesa el pago
            const saveScoreButton = document.getElementById('save-score');
            if (saveScoreButton) {
                saveScoreButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando pago...';
                saveScoreButton.disabled = true;
            }

            // Crear pago con el SDK de Pi
            Pi.createPayment(paymentData, {
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
                // Callback de error
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
            
            // Reproducir sonido de éxito
            SoundEffects.play('success');

            return await response.json();
        } catch (error) {
            console.error('Error al completar el pago con el backend:', error);
            
            // Restaurar botón
            const saveScoreButton = document.getElementById('save-score');
            if (saveScoreButton) {
                saveScoreButton.innerHTML = 'Guardar puntuación (1 Pi)';
                saveScoreButton.disabled = false;
            }
            
            throw error;
        }
    }

    // Exponer métodos públicos
    return {
        saveScore,
        simulatePayment
    };
})();
