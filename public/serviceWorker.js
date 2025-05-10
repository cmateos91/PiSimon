// Service Worker para Simon Pi Game
// Mejora el rendimiento cacheando recursos estáticos

const CACHE_NAME = 'simon-pi-cache-v1';
const CACHED_ASSETS = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/css/theme.css',
    '/js/app.js',
    '/js/config.js',
    '/js/game.js',
    '/js/piAuth.js',
    '/js/piPayment.js',
    '/js/piSdkMock.js',
    '/js/soundManager.js',
    '/js/ui.js',
    '/js/utils.js',
    '/img/pi3d.png',
    // URLs para sonidos de fallback
    '/sound/green.mp3',
    '/sound/red.mp3',
    '/sound/yellow.mp3',
    '/sound/blue.mp3',
    '/sound/wrong.mp3',
    '/sound/success.mp3',
    '/sound/levelup.mp3'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
    // Cachear recursos en la instalación
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Cacheando archivos');
                return cache.addAll(CACHED_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activar Service Worker
self.addEventListener('activate', (event) => {
    // Eliminar cachés antiguos
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('Service Worker: Limpiando caché antigua');
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Estrategia de caché: Cache-First con fallback a red
self.addEventListener('fetch', (event) => {
    // Solo cachear solicitudes GET
    if (event.request.method !== 'GET') return;
    
    // Excluir solicitudes a la API para que siempre vayan a la red
    if (event.request.url.includes('/api/')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // Si está en caché, devolver desde caché
                if (cachedResponse) {
                    return cachedResponse;
                }
                
                // Si no está en caché, buscar en la red
                return fetch(event.request)
                    .then((networkResponse) => {
                        // Si la red responde bien, cachear para la próxima vez
                        if (networkResponse && networkResponse.status === 200) {
                            const responseToCache = networkResponse.clone();
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request, responseToCache);
                                });
                        }
                        return networkResponse;
                    })
                    .catch(() => {
                        // Si hay error de red y es una solicitud de página
                        if (event.request.headers.get('accept').includes('text/html')) {
                            // Devolver página offline
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});