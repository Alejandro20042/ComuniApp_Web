import { useEffect, useState } from "react";
import axios from "axios";
import type { Solicitud } from "../interfaces/Solicitud";

export default function SolicitudesFinalizadas() {
    const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSolicitudesFinalizadas = async () => {
        try {
            const storedUser = localStorage.getItem("usuario");
            const usuario = storedUser ? JSON.parse(storedUser) : null;

            const res = await axios.get("https://localhost:5282/api/solicitudes");

            const finalizadas = res.data.filter((s: Solicitud) => {
                const estadoFinalizada = s.estado?.toLowerCase() === "finalizada";
                if (!estadoFinalizada) return false;

                if (usuario?.tipoUsuario === "solicitante") {
                    return s.solicitanteId === usuario.id;
                }

                if (usuario?.tipoUsuario === "voluntario") {
                    return s.voluntarioId === usuario.voluntarioId;
                }

                return false;
            });

            setSolicitudes(finalizadas);
        } catch (err) {
            console.error("❌ Error al cargar solicitudes finalizadas:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSolicitudesFinalizadas();
    }, []);

    if (loading) return <div className="p-4 sm:p-6">Cargando solicitudes...</div>;

    return (
        <div className="p-4 sm:p-6 bg-white shadow rounded">
            <h1 className="text-xl sm:text-2xl font-bold mb-4">📂 Solicitudes Finalizadas</h1>
            {solicitudes.length === 0 ? (
                <p className="text-sm sm:text-base">No hay solicitudes finalizadas.</p>
            ) : (
                <ul className="space-y-4">
                    {solicitudes.map((s) => (
                        <li
                            key={s.id}
                            className="border p-3 sm:p-4 rounded bg-gray-50 hover:bg-gray-100 transition"
                        >
                            <h2 className="text-base sm:text-lg font-semibold">{s.titulo}</h2>
                            <p className="text-sm sm:text-base">{s.descripcion}</p>
                            <p className="text-xs sm:text-sm text-gray-600">
                                Estado: <span className="text-green-600">{s.estado}</span>
                            </p>
                            Fecha:{" "}
                            {s.fechaCreacion
                                ? new Date(s.fechaCreacion).toLocaleDateString("es-MX", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })
                                : "N/A"}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
