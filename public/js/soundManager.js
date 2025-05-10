// Módulo para gestionar los sonidos del juego de forma optimizada para navegadores lentos como Pi Browser
const SoundManager = (function() {
    // Colección de sonidos
    const sounds = {};
    
    // Estado de carga
    let allSoundsLoaded = false;
    let soundsEnabled = true;
    let soundsInitialized = false;
    let audioContext = null;
    
    // Caché de buffers para la Web Audio API
    const audioBuffers = {};
    
    // Sonidos generados por Web Audio API (más eficientes que archivos MP3)
    const soundFrequencies = {
        green: 415.3, // G#4
        red: 310.0,   // D#4
        yellow: 252.0, // B3
        blue: 209.0,   // G#3
        wrong: [130.8, 123.5], // Alternando entre C3 y B2
        success: [783.99, 1046.5], // G5 a C6
        levelup: [523.25, 659.25, 783.99] // C5, E5, G5 (acorde mayor)
    };
    
    // Duración máxima de efectos de sonido (ms)
    const MAX_SOUND_DURATION = 300;
    
    // Inicializar el sistema de sonido (lazy loading)
    function init() {
        // Verificar si los sonidos estaban silenciados en una sesión anterior
        const muted = localStorage.getItem('soundMuted') === 'true';
        if (muted) {
            soundsEnabled = false;
        }
        
        // No inicializamos los sonidos hasta que sean necesarios
        console.log(`Sistema de sonido inicializado. Sonidos ${soundsEnabled ? 'activados' : 'silenciados'}.`);
    }
    
    // Inicializar AudioContext bajo demanda
    function initializeAudioContext() {
        if (soundsInitialized) return;
        
        try {
            // Crear AudioContext solo cuando se necesite (lazy initialization)
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            audioContext = new AudioContextClass();
            
            // Generar sonidos en lugar de cargarlos
            generateSoundBuffers();
            
            soundsInitialized = true;
            console.log('AudioContext inicializado correctamente');
        } catch (error) {
            console.error('Error al inicializar AudioContext:', error);
            // Fallback a la implementación antigua si falla
            preloadSounds();
        }
    }
    
    // Generar sonidos en lugar de cargarlos (mucho más eficiente en rendimiento)
    function generateSoundBuffers() {
        for (const [key, frequency] of Object.entries(soundFrequencies)) {
            if (Array.isArray(frequency)) {
                // Para sonidos complejos (secuencias o acordes)
                generateComplexTone(key, frequency);
            } else {
                // Para sonidos simples (una sola frecuencia)
                generateSimpleTone(key, frequency);
            }
        }
        
        allSoundsLoaded = true;
    }
    
    // Generar un tono simple
    function generateSimpleTone(key, frequency) {
        try {
            // Duración corta para mejor rendimiento
            const duration = (key === 'wrong' ? 0.3 : 0.2);
            
            // Crear buffer
            const sampleRate = audioContext.sampleRate;
            const bufferSize = sampleRate * duration;
            const buffer = audioContext.createBuffer(1, bufferSize, sampleRate);
            const data = buffer.getChannelData(0);
            
            // Función más eficiente para generar la forma de onda
            const decay = key === 'wrong' ? 1 : 3; // Más rápido para errores
            
            for (let i = 0; i < bufferSize; i++) {
                // Usar seno para una onda más suave (menos costosa computacionalmente)
                const t = i / sampleRate;
                // Aplicar envolvente ADSR simplificada para mejor calidad de sonido
                const envelope = Math.min(1, 10 * t) * Math.exp(-decay * t);
                data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope;
            }
            
            // Guardar en caché
            audioBuffers[key] = buffer;
        } catch (error) {
            console.error(`Error al generar tono ${key}:`, error);
        }
    }
    
    // Generar un tono complejo (secuencia o acorde)
    function generateComplexTone(key, frequencies) {
        try {
            // Duración adaptada al tipo de sonido
            const duration = (key === 'success' || key === 'levelup') ? 0.4 : 0.3;
            
            // Crear buffer
            const sampleRate = audioContext.sampleRate;
            const bufferSize = sampleRate * duration;
            const buffer = audioContext.createBuffer(1, bufferSize, sampleRate);
            const data = buffer.getChannelData(0);
            
            // Parámetros según el tipo de sonido
            const isChord = key === 'levelup';
            const decay = (key === 'wrong') ? 4 : 2;
            
            for (let i = 0; i < bufferSize; i++) {
                const t = i / sampleRate;
                let val = 0;
                
                // Acorde (todas las frecuencias a la vez)
                if (isChord) {
                    for (let j = 0; j < frequencies.length; j++) {
                        // Diferentes amplitudes para un sonido más armonioso
                        const amp = 1.0 / (j + 1) * 0.7;
                        val += Math.sin(2 * Math.PI * frequencies[j] * t) * amp;
                    }
                    // Normalizar para evitar distorsión
                    val = val / frequencies.length;
                } 
                // Secuencia (alternando frecuencias)
                else if (key === 'success') {
                    const segment = duration / frequencies.length;
                    const currentSegment = Math.floor(t / segment);
                    
                    if (currentSegment < frequencies.length) {
                        const segmentT = t - (currentSegment * segment);
                        const freq = frequencies[currentSegment];
                        const envStart = 10 * segmentT;
                        const env = Math.min(1, envStart) * Math.exp(-decay * segmentT);
                        val = Math.sin(2 * Math.PI * freq * t) * env;
                    }
                }
                // Alternancia rápida (para sonido 'wrong')
                else {
                    const currentFreq = frequencies[Math.floor(t * 10) % frequencies.length];
                    val = Math.sin(2 * Math.PI * currentFreq * t);
                }
                
                // Aplicar envolvente global
                const envelope = Math.min(1, 10 * t) * Math.exp(-decay * t);
                data[i] = val * envelope;
            }
            
            // Guardar en caché
            audioBuffers[key] = buffer;
        } catch (error) {
            console.error(`Error al generar tono complejo ${key}:`, error);
        }
    }
    
    // Fallback: Precargar sonidos (sólo si Web Audio API falla)
    function preloadSounds() {
        // URLs de los sonidos (locales para evitar latencia de red)
        const soundUrls = {
            green: 'sound/green.mp3',
            red: 'sound/red.mp3',
            yellow: 'sound/yellow.mp3',
            blue: 'sound/blue.mp3',
            wrong: 'sound/wrong.mp3',
            success: 'sound/success.mp3',
            levelup: 'sound/levelup.mp3'
        };
        
        let loadedCount = 0;
        const totalSounds = Object.keys(soundUrls).length;
        
        for (const [key, url] of Object.entries(soundUrls)) {
            fetchAndDecodeAudio(key, url, () => {
                loadedCount++;
                if (loadedCount === totalSounds) {
                    allSoundsLoaded = true;
                    console.log('Todos los sonidos precargados correctamente');
                }
            });
        }
    }
    
    // Cargar y decodificar audio de forma más eficiente
    function fetchAndDecodeAudio(key, url, callback) {
        // Usar fetch API (más eficiente que XMLHttpRequest)
        fetch(url)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => {
                // Implementar audio basado en AudioContext si está disponible
                if (window.AudioContext || window.webkitAudioContext) {
                    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                    
                    if (!audioContext) {
                        audioContext = new AudioContextClass();
                    }
                    
                    return audioContext.decodeAudioData(arrayBuffer);
                } else {
                    // Fallback para navegadores antiguos
                    const audio = new Audio();
                    audio.src = url;
                    sounds[key] = audio;
                    
                    return new Promise(resolve => {
                        audio.addEventListener('canplaythrough', () => resolve(null), { once: true });
                    });
                }
            })
            .then(audioBuffer => {
                if (audioBuffer) {
                    audioBuffers[key] = audioBuffer;
                }
                callback();
            })
            .catch(error => {
                console.error(`Error al cargar sonido ${key}:`, error);
                callback();
            });
    }
    
    // Reproducir un sonido específico
    function play(soundId) {
        if (!soundsEnabled) return;
        
        // Inicializar AudioContext bajo demanda (evita problemas en navegadores móviles)
        if (!soundsInitialized) {
            // En navegadores móviles, la inicialización del audio 
            // debe ocurrir después de la interacción del usuario
            initializeAudioContext();
        }
        
        try {
            // Si usamos Web Audio API
            if (audioContext && audioBuffers[soundId]) {
                playWithAudioContext(soundId);
            } 
            // Fallback para reproducción tradicional
            else if (sounds[soundId]) {
                playWithAudioElement(soundId);
            } else {
                // Silencio controlado para evitar errores
                console.log(`Sonido no disponible: ${soundId}`);
            }
        } catch (error) {
            console.warn('Error al reproducir sonido:', error);
        }
    }
    
    // Reproducir usando Web Audio API (mejor rendimiento)
    function playWithAudioContext(soundId) {
        // Reanudar contexto de audio si está suspendido
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        
        // Crear source a partir del buffer
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffers[soundId];
        
        // Ajuste de volumen
        const gainNode = audioContext.createGain();
        gainNode.gain.value = getVolumeForSound(soundId);
        
        // Conectar nodos
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Reproducir sonido
        source.start(0);
        
        // Limitar duración para ahorrar recursos (importante en navegadores lentos)
        setTimeout(() => {
            try {
                source.stop();
                source.disconnect();
                gainNode.disconnect();
            } catch (e) {
                // Ignorar errores de stop ya que el sonido podría haber terminado
            }
        }, MAX_SOUND_DURATION);
    }
    
    // Fallback: reproducir con elemento Audio (menos eficiente)
    function playWithAudioElement(soundId) {
        try {
            // Para mejor rendimiento, clonar el sonido en vez de resetear el tiempo
            const soundClone = sounds[soundId].cloneNode(false);
            soundClone.volume = getVolumeForSound(soundId);
            
            // Reproducir con promesa
            const playPromise = soundClone.play();
            
            // Manejar errores de reproducción
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn('Error al reproducir sonido:', error);
                });
            }
            
            // Liberar memoria cuando termine
            soundClone.addEventListener('ended', () => {
                soundClone.remove();
            }, { once: true });
            
            // Limitar duración para ahorrar recursos
            setTimeout(() => {
                try {
                    soundClone.pause();
                    soundClone.remove();
                } catch (e) {
                    // Ignorar errores
                }
            }, MAX_SOUND_DURATION);
        } catch (error) {
            console.error('Error al reproducir sonido:', error);
        }
    }
    
    // Volúmenes personalizados para cada sonido
    function getVolumeForSound(soundId) {
        const volumes = {
            green: 0.5,
            red: 0.5,
            yellow: 0.5,
            blue: 0.5,
            wrong: 0.4,
            success: 0.6,
            levelup: 0.4
        };
        
        return volumes[soundId] || 0.5;
    }
    
    // Alternar sonidos
    function toggleMute() {
        soundsEnabled = !soundsEnabled;
        localStorage.setItem('soundMuted', !soundsEnabled);
        return !soundsEnabled; // Devuelve true si está silenciado
    }
    
    // Comprobar si los sonidos están silenciados
    function isMuted() {
        return !soundsEnabled;
    }
    
    // Comprobar si todos los sonidos están cargados
    function areAllSoundsLoaded() {
        return allSoundsLoaded;
    }
    
    // Suspender AudioContext cuando no se usa (ahorra batería)
    function suspend() {
        if (audioContext && audioContext.state === 'running') {
            audioContext.suspend().catch(e => console.log('Error al suspender AudioContext:', e));
        }
    }
    
    // Reanudar AudioContext
    function resume() {
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume().catch(e => console.log('Error al reanudar AudioContext:', e));
        }
    }
    
    // Liberar recursos para ahorrar memoria
    function cleanup() {
        if (audioContext) {
            audioContext.close().then(() => {
                audioContext = null;
                soundsInitialized = false;
                console.log('AudioContext liberado');
            }).catch(e => console.error('Error al liberar AudioContext:', e));
        }
    }
    
    // Exponer métodos públicos
    return {
        init,
        play,
        toggleMute,
        isMuted,
        areAllSoundsLoaded,
        suspend,
        resume,
        cleanup
    };
})();