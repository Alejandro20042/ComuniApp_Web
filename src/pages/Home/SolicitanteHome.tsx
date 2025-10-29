// src/pages/Home/SolicitanteHome.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import type { Solicitud } from "../../interfaces/Solicitud";

const SolicitanteHome: React.FC = () => {
    const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Formulario para nueva solicitud
    const [titulo, setTitulo] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [ubicacion, setUbicacion] = useState("");

    useEffect(() => {
        fetchSolicitudes();
    }, []);

    const fetchSolicitudes = async () => {
        try {
            setLoading(true);
            const response = await axios.get<Solicitud[]>(
                "https://localhost:5282/api/solicitudes"
            );
            // Filtrar solo solicitudes del usuario actual si quieres
            setSolicitudes(response.data);
        } catch (err: any) {
            console.error(err);
            setError("Error al cargar las solicitudes");
        } finally {
            setLoading(false);
        }
    };

    const handleCrearSolicitud = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!titulo || !descripcion) return;

        const storedUser = localStorage.getItem("usuario");
        if (!storedUser) return;

        const usuario = JSON.parse(storedUser);
        console.log(usuario)

        if (!usuario.solicitanteId) {
            alert("Usuario no tiene un registro de solicitante válido");
            return;
        }

        try {
            const response = await axios.post("https://localhost:5282/api/solicitudes", {
                titulo,
                descripcion,
                ubicacion,
                solicitanteId: usuario.solicitanteId,
            });

            setSolicitudes([response.data, ...solicitudes]);
            setTitulo("");
            setDescripcion("");
            setUbicacion("");
        } catch (err) {
            console.error(err);
            alert("Error al crear la solicitud");
        }
    };


    return (
        <div className="w-full max-w-4xl flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-gray-800">Crear nueva solicitud</h2>
            <form
                onSubmit={handleCrearSolicitud}
                className="bg-white p-6 rounded-xl shadow-md flex flex-col gap-4"
            >
                <input
                    type="text"
                    placeholder="Título"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    className="border p-2 rounded"
                    required
                />
                <textarea
                    placeholder="Descripción"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    className="border p-2 rounded"
                    required
                />
                <input
                    type="text"
                    placeholder="Ubicación (opcional)"
                    value={ubicacion}
                    onChange={(e) => setUbicacion(e.target.value)}
                    className="border p-2 rounded"
                />
                <button
                    type="submit"
                    className="bg-green-600 text-white py-2 rounded hover:bg-green-700"
                >
                    Crear Solicitud
                </button>
            </form>

            <h2 className="text-2xl font-bold text-gray-800">Mis solicitudes</h2>

            {loading ? (
                <p>Cargando solicitudes...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : solicitudes.length === 0 ? (
                <p className="text-gray-500">No tienes solicitudes aún.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {solicitudes.map((s) => (
                        <div
                            key={s.id}
                            className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
                        >
                            <h3 className="font-semibold text-gray-800">{s.titulo}</h3>
                            <p className="text-sm text-gray-500">{s.descripcion}</p>
                            {s.ubicacion && <p className="text-sm text-gray-500">Ubicación: {s.ubicacion}</p>}
                            <p className="mt-1 text-sm">
                                Estado:{" "}
                                <span
                                    className={
                                        s.estado === "pendiente"
                                            ? "text-yellow-600"
                                            : s.estado === "en progreso"
                                                ? "text-blue-600"
                                                : "text-green-600"
                                    }
                                >
                                    {s.estado}
                                </span>
                            </p>
                            <p className="text-xs text-gray-400">
                                Creada: {new Date(s.fechaCreacion).toLocaleDateString()}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SolicitanteHome;
