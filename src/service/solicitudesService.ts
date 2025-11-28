import api from "../api/axios";

export async function crearSolicitudOffline(data: any) {
  try {
    // Intento online primero
    const res = await api.post("/solicitudes", data); // 🔹 Usando Axios
    
    return { sent: true, data: res.data };
  } catch {
    // Fallback offline → encolar en Service Worker
    const reg = await navigator.serviceWorker.ready;
    reg.active?.postMessage({ type: "QUEUE_SOLICITUD", payload: data });
    return { queued: true };
  }
}
