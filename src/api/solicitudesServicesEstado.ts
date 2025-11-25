import api from "./axios";

export async function completarSolicitud(id: number, voluntarioId: number) {
    const res = await api.put(`/solicitudes/${id}/completar`, {VoluntarioId: voluntarioId });
    return res.data;
}

export async function confirmarSolicitud(id: number, solicitanteId: number) {
    const res = await api.put(`/solicitudes/${id}/confirmar`, {SolicitanteId: solicitanteId });
    return res.data;
}