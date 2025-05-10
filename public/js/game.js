// Módulo del juego Simon
const SimonGame = (function() {
    // Elementos del DOM
    const gameBoard = document.getElementById('game-board');
    const startScreen = document.getElementById('start-screen');
    const gameOverScreen = document.getElementById('game-over');
    const startButton = document.getElementById('start-button');
    const playAgainButton = document.getElementById('play-again');
    const saveScoreButton = document.getElementById('save-score');
    const scoreElement = document.getElementById('score');
    const finalScoreElement = document.getElementById('final-score');
    const simonContainer = document.querySelector('.simon-container');
    
    // Botones y sonidos del juego
    const buttons = {
        green: document.getElementById('green'),
        red: document.getElementById('red'),
        yellow: document.getElementById('yellow'),
        blue: document.getElementById('blue')
    };
    
    // Variables del juego
    let sequence = [];
    let playerSequence = [];
    let round = 0;
    let score = 0;
    let isPlaying = false;
    let canPlay = false;
    let speed = 800; // velocidad inicial para mostrar la secuencia (ms)
    let highScore = localStorage.getItem('simonHighScore') || 0;
    
    // Inicializar eventos
    function init() {
        startButton.addEventListener('click', startGame);
        playAgainButton.addEventListener('click', startGame);
        saveScoreButton.addEventListener('click', saveScore);
        
        // Añadir eventos de clic a los botones
        Object.keys(buttons).forEach(color => {
            buttons[color].addEventListener('click', () => handleButtonClick(color));
            
            // Añadir eventos táctiles para dispositivos móviles
            buttons[color].addEventListener('touchstart', (e) => {
                e.preventDefault(); // Prevenir el comportamiento por defecto
                handleButtonClick(color);
            });
        });
        
        // Mostrar la puntuación máxima si existe
        if (highScore > 0) {
            NotificationSystem.show(`Tu mejor puntuación: ${highScore}`, 'info', 3000);
        }
    }
    
    // Iniciar el juego
    function startGame() {
        sequence = [];
        playerSequence = [];
        round = 0;
        score = 0;
        isPlaying = true;
        speed = 800; // Resetear velocidad
        
        updateScore(0);
        showGameBoard();
        
        // Efecto de inicio mejorado con animación más sutil
        simonContainer.classList.add('success-animation');
        
        // Animar los botones secuencialmente
        const buttonKeys = Object.keys(buttons);
        
        // Animar cada botón con un pequeño retraso
        buttonKeys.forEach((color, index) => {
            setTimeout(() => {
                buttons[color].classList.add('success');
                setTimeout(() => {
                    buttons[color].classList.remove('success');
                }, 400);
            }, index * 120);
        });
        
        setTimeout(() => {
            simonContainer.classList.remove('success-animation');
            nextRound();
        }, 800);
        
        // Notificación
        NotificationSystem.show('¡Juego iniciado! Observa la secuencia y repítela.', 'info');
    }
    
    // Siguiente ronda
    function nextRound() {
        round += 1;
        canPlay = false;
        playerSequence = [];
        
        // Aumentar la velocidad ligeramente en cada ronda
        if (round > 3) {
            speed = Math.max(800 - (round * 20), 300); // No más rápido que 300ms
        }
        
        // Añadir un nuevo color a la secuencia
        addRandomColor();
        
        // Mostrar número de ronda
        NotificationSystem.show(`Ronda ${round}`, 'info', 1500);
        
        // Esperar un momento y luego mostrar la secuencia
        setTimeout(() => {
            playSequence();
        }, 1500);
    }
    
    // Añadir un color aleatorio a la secuencia
    function addRandomColor() {
        const colors = Object.keys(buttons);
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        sequence.push(randomColor);
    }
    
    // Reproducir la secuencia actual
    function playSequence() {
        let i = 0;
        
        // Efecto visual para indicar que se está mostrando la secuencia
        simonContainer.style.opacity = '1';
        
        const interval = setInterval(() => {
            const color = sequence[i];
            flashButton(color);
            i++;
            
            if (i >= sequence.length) {
                clearInterval(interval);
                setTimeout(() => {
                    // Indicar que el jugador puede comenzar
                    canPlay = true;
                    NotificationSystem.show('¡Tu turno!', 'info', 1000);
                }, speed);
            }
        }, speed);
    }
    
    // Manejar el clic en un botón
    function handleButtonClick(color) {
        if (!isPlaying || !canPlay) return;
        
        flashButton(color);
        playerSequence.push(color);
        
        // Verificar respuesta
        checkPlayerInput();
    }
    
    // Verificar la entrada del jugador
    function checkPlayerInput() {
        const index = playerSequence.length - 1;
        
        // Si el jugador selecciona el color incorrecto
        if (playerSequence[index] !== sequence[index]) {
            SoundEffects.play('wrong');
            VisualEffects.shake(simonContainer);
            gameOver();
            return;
        }
        
        // Reproducir sonido de éxito para cada coincidencia correcta
        SoundEffects.play(playerSequence[index]);
        
        // Si el jugador completó la secuencia correctamente
        if (playerSequence.length === sequence.length) {
            // Aumentar puntuación
            const newScore = score + round;
            
            // Animar cambio de puntuación
            DOMAnimations.animateCounter(scoreElement, newScore, 600);
            updateScore(newScore);
            
            // Sonido y efectos de éxito
            SoundEffects.play('levelup');
            
            // Reemplazar el efecto de giro por una animación más sutil
            simonContainer.classList.add('success-animation');
            
            // Añadir efecto de brillo a todos los botones
            Object.values(buttons).forEach(button => {
                button.classList.add('success');
                setTimeout(() => {
                    button.classList.remove('success');
                }, 800);
            });
            
            setTimeout(() => {
                simonContainer.classList.remove('success-animation');
            }, 800);
            
            // Notificación
            NotificationSystem.show('¡Secuencia correcta! Siguiente ronda...', 'success', 1500);
            
            // Pasar a la siguiente ronda
            setTimeout(() => {
                nextRound();
            }, 1500);
        }
    }
    
    // Resaltar un botón y reproducir su sonido
    function flashButton(color) {
        buttons[color].classList.add('active');
        SoundEffects.play(color);
        
        setTimeout(() => {
            buttons[color].classList.remove('active');
        }, speed / 2);
    }
    
    // Finalizar el juego
    function gameOver() {
        isPlaying = false;
        canPlay = false;
        
        // Reproducir sonido de error
        SoundEffects.play('wrong');
        
        // Mostrar pantalla de game over con animación
        gameBoard.style.display = 'none';
        DOMAnimations.fadeIn(gameOverScreen);
        
        // Actualizar puntuación final
        finalScoreElement.textContent = score;
        
        // Comprobar si es una nueva puntuación máxima
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('simonHighScore', highScore);
            
            // Celebrar la puntuación máxima
            setTimeout(() => {
                VisualEffects.createConfetti(100);
                SoundEffects.play('success');
                NotificationSystem.show('¡Nueva puntuación máxima!', 'success', 5000);
            }, 1000);
        }
        
        // Mostrar botón de guardar puntuación si el usuario está autenticado
        if (PiAuth.isAuthenticated()) {
            saveScoreButton.style.display = 'inline-block';
        } else {
            saveScoreButton.style.display = 'none';
            // Sugerir iniciar sesión si la puntuación es buena
            if (score > 5) {
                NotificationSystem.show('Inicia sesión para guardar tu puntuación en el ranking', 'info', 5000);
            }
        }
    }
    
    // Actualizar puntuación
    function updateScore(newScore) {
        score = newScore;
        scoreElement.textContent = score;
        finalScoreElement.textContent = score;
    }
    
    // Guardar puntuación
    async function saveScore() {
        // Desactivar botón mientras se procesa
        saveScoreButton.disabled = true;
        saveScoreButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        
        try {
            // Notificación
            NotificationSystem.show('Procesando pago de 1 Pi...', 'info');
            
            const result = await PiPayment.saveScore(score);
            
            if (result.success) {
                // Efectos de éxito
                VisualEffects.createConfetti(50);
                SoundEffects.play('success');
                
                // Notificar éxito
                NotificationSystem.show('¡Puntuación guardada exitosamente!', 'success', 5000);
                
                // Recargar el ranking con animación
                document.getElementById('leaderboard-loading').style.display = 'block';
                document.getElementById('scores-table').style.display = 'none';
                
                // Recargar el ranking
                LeaderboardManager.loadLeaderboard();
                
                // Ocultar botón de guardar (ya se ha guardado)
                saveScoreButton.style.display = 'none';
            } else {
                // Notificar error
                NotificationSystem.show(`Error al guardar: ${result.error}`, 'error', 5000);
                VisualEffects.shake(saveScoreButton);
            }
        } catch (error) {
            console.error('Error al guardar la puntuación:', error);
            NotificationSystem.show('Error al guardar la puntuación. Inténtalo más tarde.', 'error');
            VisualEffects.shake(saveScoreButton);
        } finally {
            // Restaurar botón
            saveScoreButton.disabled = false;
            saveScoreButton.innerHTML = '<img src="img/pi3d.png" alt="Pi" class="pi-logo-button"> Guardar puntuación (1 Pi)';
        }
    }
    
    // Mostrar el tablero de juego
    function showGameBoard() {
        startScreen.style.display = 'none';
        gameOverScreen.style.display = 'none';
        gameBoard.style.display = 'block';
    }
    
    // Obtener la puntuación actual
    function getScore() {
        return score;
    }
    
    // Exponer métodos públicos
    return {
        init,
        startGame,
        getScore
    };
})();

// Módulo para gestionar el ranking
const LeaderboardManager = (function() {
    const apiUrl = 'http://localhost:3000';
    const leaderboardLoading = document.getElementById('leaderboard-loading');
    const scoresTable = document.getElementById('scores-table');
    const scoresBody = document.getElementById('scores-body');
    
    // Cargar el ranking de puntuaciones
    async function loadLeaderboard() {
        try {
            // Mostrar estado de carga
            DOMAnimations.fadeIn(leaderboardLoading);
            
            if (scoresTable.style.display !== 'none') {
                DOMAnimations.fadeOut(scoresTable);
            }
            
            const response = await fetch(`${apiUrl}/leaderboard`);
            
            if (!response.ok) {
                throw new Error('Error al cargar el ranking');
            }
            
            const scores = await response.json();
            
            // Pequeña demora para mostrar la animación de carga
            setTimeout(() => {
                displayLeaderboard(scores);
            }, 600);
            
        } catch (error) {
            console.error('Error al cargar el ranking:', error);
            leaderboardLoading.textContent = 'Error al cargar el ranking. Intenta de nuevo más tarde.';
            NotificationSystem.show('No se pudo cargar el ranking', 'error');
        }
    }
    
    // Mostrar el ranking en la tabla
    function displayLeaderboard(scores) {
        // Limpiar tabla
        scoresBody.innerHTML = '';
        
        if (scores.length === 0) {
            leaderboardLoading.textContent = 'Aún no hay puntuaciones registradas.';
            return;
        }
        
        // Añadir cada puntuación a la tabla
        scores.forEach((score, index) => {
            const row = document.createElement('tr');
            
            // Añadir clase para animación escalonada
            row.style.opacity = '0';
            row.style.animation = `fadeIn 0.3s forwards ${index * 0.1}s`;
            
            // Posición
            const positionCell = document.createElement('td');
            positionCell.textContent = index + 1;
            row.appendChild(positionCell);
            
            // Usuario
            const userCell = document.createElement('td');
            userCell.textContent = score.username;
            row.appendChild(userCell);
            
            // Puntuación
            const scoreCell = document.createElement('td');
            scoreCell.textContent = score.score;
            row.appendChild(scoreCell);
            
            // Destacar al usuario actual
            const currentUser = PiAuth.getCurrentUser();
            if (currentUser && score.userId === currentUser.uid) {
                row.classList.add('current-user');
                row.style.fontWeight = 'bold';
                row.style.backgroundColor = 'rgba(138, 43, 226, 0.1)';
            }
            
            scoresBody.appendChild(row);
        });
        
        // Mostrar tabla y ocultar mensaje de carga
        DOMAnimations.fadeOut(leaderboardLoading);
        setTimeout(() => {
            DOMAnimations.fadeIn(scoresTable);
        }, 300);
    }
    
    // Exponer métodos públicos
    return {
        loadLeaderboard
    };
})();
