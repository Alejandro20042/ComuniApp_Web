import React, { useState } from "react";
import type { Solicitud } from "../interfaces/Solicitud";

interface Props {
    solicitudes: Solicitud[];
    setSelectedSolicitud: (s: Solicitud) => void;
    fetchChatInfo: (id: number) => void;
    setChatOpen: (v: boolean) => void;
}

const SolicitudesLista: React.FC<Props> = ({
    solicitudes,
    setSelectedSolicitud,
    fetchChatInfo,
    setChatOpen,
}) => {
    const [tab, setTab] = useState<"pendientes" | "finalizadas" | "completada" | "en progreso">("pendientes");
    const [page, setPage] = useState(1);

    const perPage = 6;

    const filtradas =
        tab === "pendientes"
            ? solicitudes.filter((s) => s.estado?.toLowerCase().trim() === "pendiente")
            : tab === "en progreso"
                ? solicitudes.filter((s) => s.estado?.toLowerCase().trim() === "en progreso")
                : tab === "completada"
                    ? solicitudes.filter((s) => s.estado?.toLowerCase().trim() === "completada")
                    : solicitudes.filter((s) => s.estado?.toLowerCase().trim() === "finalizada");

    const totalPages = Math.ceil(filtradas.length / perPage);

    const paginated = filtradas.slice(
        (page - 1) * perPage,
        page * perPage
    );

    return (
        <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto px-4">
            <div className="flex justify-center">
                <div className="flex flex-wrap gap-2 bg-gray-200 rounded-full p-2 shadow-inner w-full sm:w-auto justify-center">
                    <button
                        onClick={() => {
                            setTab("pendientes");
                            setPage(1);
                        }}
                        className={`flex-1 sm:flex-none px-3 sm:px-5 py-2 rounded-full font-medium transition text-sm sm:text-base ${tab === "pendientes"
                                ? "bg-white shadow text-blue-600"
                                : "text-gray-600 hover:text-gray-800"
                            }`}
                    >
                        Pendientes
                    </button>

                    <button
                        onClick={() => {
                            setTab("en progreso");
                            setPage(1);
                        }}
                        className={`flex-1 sm:flex-none px-3 sm:px-5 py-2 rounded-full font-medium transition text-sm sm:text-base ${tab === "en progreso"
                                ? "bg-white shadow text-blue-600"
                                : "text-gray-600 hover:text-gray-800"
                            }`}
                    >
                        En Progreso
                    </button>

                    <button
                        onClick={() => {
                            setTab("completada");
                            setPage(1);
                        }}
                        className={`flex-1 sm:flex-none px-3 sm:px-5 py-2 rounded-full font-medium transition text-sm sm:text-base ${tab === "completada"
                                ? "bg-white shadow text-blue-600"
                                : "text-gray-600 hover:text-green-800"
                            }`}
                    >
                        Completadas
                    </button>

                    <button
                        onClick={() => {
                            setTab("finalizadas");
                            setPage(1);
                        }}
                        className={`flex-1 sm:flex-none px-3 sm:px-5 py-2 rounded-full font-medium transition text-sm sm:text-base ${tab === "finalizadas"
                                ? "bg-white shadow text-blue-600"
                                : "text-gray-600 hover:text-gray-800"
                            }`}
                    >
                        Finalizadas
                    </button>
                </div>
            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
                {paginated.map((s) => (
                    <div
                        key={s.id}
                        className="p-5 bg-white rounded-2xl shadow hover:shadow-lg transition flex flex-col justify-between w-full"
                    >
                        <div>
                            <h3 className="font-semibold text-gray-800 text-lg sm:text-xl mb-2">
                                {s.titulo}
                            </h3>

                            <p className="text-sm sm:text-base text-gray-500 line-clamp-3">
                                {s.descripcion}
                            </p>

                            {s.ubicacion && (
                                <p className="text-sm text-gray-500 mt-2">
                                    📍 {s.ubicacion}
                                </p>
                            )}

                            <p className="text-sm mt-2">
                                Estado:{" "}
                                <span
                                    className={
                                        s.estado === "pendiente"
                                            ? "text-yellow-600"
                                            : s.estado === "en progreso"
                                                ? "text-blue-600"
                                                : s.estado === "completada"
                                                    ? "text-green-600"
                                                    : s.estado === "finalizada"
                                                        ? "text-gray-600"
                                                        : "text-gray-600"
                                    }
                                >
                                    {s.estado}
                                </span>
                            </p>
                        </div>

                        <div className="flex justify-between items-center mt-5">
                            <button
                                onClick={() => {
                                    setSelectedSolicitud(s);
                                    setChatOpen(false);
                                }}
                                className="px-4 py-2 text-sm bg-gray-300 rounded-lg hover:bg-gray-400 transition"
                            >
                                Ver detalles
                            </button>

                            {s.estado === "en progreso" && (
                                <button
                                    onClick={() => {
                                        setSelectedSolicitud(s);
                                        fetchChatInfo(s.id);
                                        setChatOpen(true);
                                    }}
                                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    Abrir chat
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {totalPages > 1 && (
                <div className="flex gap-2 justify-center mt-4">
                    {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setPage(i + 1)}
                            className={`px-3 py-1 rounded-lg border text-sm sm:text-base ${page === i + 1
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                                }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );

};

export default SolicitudesLista;
