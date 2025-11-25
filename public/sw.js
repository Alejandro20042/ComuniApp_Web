const DB_NAME = "comuniapp-db";
const STORE_NAME = "pending-solicitudes";
const API_BASE = "https://localhost:5282";

self.addEventListener("install", (event) => {
    event.waitUntil(caches.open("comuniapp-cache").then((c) => c.addAll(["/"])));
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil((async () => {
        await self.clients.claim();
        await openDB();
        console.log("📁 IndexedDB inicializado");
    })());
});

function openDB() {
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
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).add(solicitud);
}

self.addEventListener("message", async (event) => {
    if (event.data?.type === "QUEUE_SOLICITUD") {
        const payload = { ...event.data.payload, sent: false, createdAt: new Date().toISOString() };
        await saveSolicitudOffline(payload);
        console.log("📦 Solicitud guardada en IndexedDB");
        if (self.registration.sync) {
            await self.registration.sync.register("sync-solicitudes");
            console.log("🔁 Sync solicitudes registrado");
        } else {
            event.waitUntil(enviarSolicitudesPendientes());
        }
    }
});

self.addEventListener("sync", (event) => {
    if (event.tag === "sync-solicitudes") {
        event.waitUntil(enviarSolicitudesPendientes());
    }
});

async function enviarSolicitudesPendientes() {
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
      console.log("✅ Solicitud enviada al servidor:", saved);

      const tx2 = db.transaction(STORE_NAME, "readwrite");
      const store2 = tx2.objectStore(STORE_NAME);
      s.sent = true;
      store2.put(s);

      // notificar al frontend con el objeto completo
      const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of clients) {
        client.postMessage({ type: "SOLICITUD_SYNCED", payload: saved });
      }
    } catch (err) {
      console.error("❌ Error al enviar solicitud offline:", err);
    }
  }
}

