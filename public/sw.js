const DB_NAME = "comuniapp-db";
const STORE_NAME = "pending-solicitudes";
const API_BASE = "https://comuniapp-api-1.onrender.com";
// 🚨 AÑADIDO: Definición del nombre del caché para recursos estáticos.
const CACHE_NAME = "comuniapp-cache"; 


self.addEventListener("install", (event) => {
    // ✅ CORRECTO: Pre-cachea la ruta raíz y la ruta /solicitud
    event.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(["/", "/home"])));
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil((async () => {
        await self.clients.claim();
        await openDB();
        
        // ⚠️ RECOMENDADO: Limpiar cachés viejos al activar
        const cacheNames = await caches.keys();
        await Promise.all(
            cacheNames.map((cacheName) => {
                // Mantiene los cachés esenciales
                if (cacheName !== CACHE_NAME && cacheName !== 'comuniapp-api-cache') {
                    return caches.delete(cacheName);
                }
            })
        );
    })());
});

function openDB() {
// ... (función openDB sin cambios)
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function saveSolicitudOffline(solicitud) {
// ... (función saveSolicitudOffline sin cambios)
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).add(solicitud);
}

self.addEventListener("message", async (event) => {
// ... (listener message sin cambios)
    if (event.data?.type === "QUEUE_SOLICITUD") {
        const payload = { ...event.data.payload, sent: false, createdAt: new Date().toISOString() };
        await saveSolicitudOffline(payload);
        if (self.registration.sync) {
            await self.registration.sync.register("sync-solicitudes");
        } else {
            event.waitUntil(enviarSolicitudesPendientes());
        }
    }
});

self.addEventListener("sync", (event) => {
// ... (listener sync sin cambios)
    if (event.tag === "sync-solicitudes") {
        event.waitUntil(enviarSolicitudesPendientes());
    }
});

async function enviarSolicitudesPendientes() {
// ... (función enviarSolicitudesPendientes sin cambios)
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const all = await store.getAll();

    for (const s of all) {
        if (s.sent) continue;
        try {
            const dto = {
                solicitanteId: s.SolicitanteId ?? s.solicitanteId,
                titulo: s.Titulo ?? s.titulo,
                descripcion: s.Descripcion ?? s.descripcion,
                ubicacion: s.Ubicacion ?? s.ubicacion
            };
            const res = await fetch(`${API_BASE}/api/Solicitudes/offline-send`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dto),
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const saved = await res.json(); 

            const tx2 = db.transaction(STORE_NAME, "readwrite");
            const store2 = tx2.objectStore(STORE_NAME);
            s.sent = true;
            store2.put(s);

            const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
            for (const client of clients) {
                client.postMessage({ type: "SOLICITUD_SYNCED", payload: saved });
            }
        } catch (err) {
            console.error("❌ Error al enviar solicitud offline:", err);
        }
    }
}

// 🚀 AGREGADO: Evento FETCH para manejar las peticiones de red y la caché
self.addEventListener("fetch", (event) => {
    const isApiRequest = event.request.url.startsWith(`${API_BASE}/api/solicitudes`) && event.request.method === "GET";

    // 1. Estrategia Network First (para obtener las solicitudes más recientes o cachear si falla)
    if (isApiRequest) {
        event.respondWith(
            caches.open("comuniapp-api-cache").then(async (cache) => {
                try {
                    const response = await fetch(event.request);
                    // Actualiza la caché
                    cache.put(event.request, response.clone());
                    return response;
                } catch (error) {
                    // Si falla la red (offline), devuelve la caché de la API
                    return cache.match(event.request) || new Response(null, { status: 503, statusText: 'Offline' });
                }
            })
        );
        return;
    }

    // 2. Estrategia Cache First (para recursos estáticos y rutas navegables)
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse; // Devuelve caché si existe

            return fetch(event.request).then((response) => {
                // Cacha la nueva respuesta de red si es OK y no es una extensión de Chrome
                if (response.status === 200 && event.request.method === 'GET' && !event.request.url.startsWith('chrome-extension')) {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return response;
            }).catch(() => {
                // Fallback cuando la red y la caché fallan
                if (event.request.mode === 'navigate') {
                    // Muestra la ruta raíz si el usuario intenta navegar offline
                    return caches.match('/'); 
                }
            });
        })
    );
});