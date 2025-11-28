import api from "../api/axios";

export async function crearSolicitudOffline(data: any) {
  try {
    // Intento online primero
    const res = await fetch(`${api}/api/solicitudes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      return { sent: true, data: await res.json() };
    }
    throw new Error("Error HTTP");
  } catch {
    // Fallback offline → encolar en SW
    const reg = await navigator.serviceWorker.ready;
    reg.active?.postMessage({ type: "QUEUE_SOLICITUD", payload: data });
    return { queued: true };
  }
}
