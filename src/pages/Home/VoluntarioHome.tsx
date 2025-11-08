// src/pages/Home/VoluntarioHome.tsx
import React, { useEffect, useState } from "react";
import type { Solicitud } from "../../interfaces/Solicitud";
import axios from "axios";

const VoluntarioHome: React.FC = () => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        const res = await axios.get<Solicitud[]>("https://localhost:5282/api/solicitudes");
        setSolicitudes(res.data);
      } catch (err) {
        console.error(err);
        setToastMessage("❌ Error al cargar solicitudes");
        setToastType("error");
        setTimeout(() => setToastMessage(null), 3000);
      }
    };
    fetchSolicitudes();
  }, []);

  const handleTomarSolicitud = (solicitud: Solicitud) => {
    setSelectedSolicitud(solicitud);
    setShowConfirmModal(true);
  };

  const handleAceptarSolicitud = async () => {
    if (!selectedSolicitud) return;

    try {
      const updated = {
        titulo: selectedSolicitud.titulo,
        descripcion: selectedSolicitud.descripcion,
        ubicacion: selectedSolicitud.ubicacion,
        estado: "en progreso",
      };

      console.log("📦 Enviando al backend:", updated);

      await axios.put(
        `https://localhost:5282/api/solicitudes/${selectedSolicitud.id}`,
        updated,
        { headers: { "Content-Type": "application/json" } }
      );

      setSolicitudes((prev) =>
        prev.map((s) =>
          s.id === selectedSolicitud.id ? { ...s, estado: "en progreso" } : s
        )
      );

      setShowConfirmModal(false);
      setSelectedSolicitud(null);
      setToastMessage("✅ Solicitud aceptada correctamente");
      setToastType("success");
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error("❌ Error en handleAceptarSolicitud:", err);
      setToastMessage("❌ Error al aceptar la solicitud");
      setToastType("error");
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return (
    <div className="w-full max-w-4xl flex flex-col gap-6 mx-auto">
      <h2 className="text-2xl font-bold text-gray-800">Solicitudes Disponibles</h2>

      {solicitudes.length === 0 ? (
        <p className="text-gray-500">No hay solicitudes disponibles.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {solicitudes.map((s) => (
            <div
              key={s.id}
              className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="overflow-hidden">
                <h3 className="font-semibold text-gray-800 text-lg mb-1 truncate">
                  {s.titulo}
                </h3>
                <p className="text-sm text-gray-600 break-words line-clamp-3 overflow-hidden">
                  {s.descripcion}
                </p>
                <p className="mt-2 text-sm">
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
                <p className="text-xs text-gray-400 mt-1">
                  Creada: {new Date(s.fechaCreacion).toLocaleDateString()}
                </p>
              </div>

              <button
                onClick={() => handleTomarSolicitud(s)}
                className="mt-3 bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Tomar Solicitud
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal de confirmación */}
      {showConfirmModal && selectedSolicitud && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col animate-fade-in">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Aceptar Solicitud</h3>

            <div className="max-h-[50vh] overflow-y-auto mb-4">
              <p className="text-gray-700 mb-3">
                ¿Estás seguro de que deseas aceptar esta solicitud?
              </p>

              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p className="text-sm font-semibold text-gray-800 mb-1">
                  {selectedSolicitud.titulo}
                </p>
                <p className="text-sm text-gray-600 whitespace-pre-wrap break-words">
                  {selectedSolicitud.descripcion}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedSolicitud(null);
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleAceptarSolicitud}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg text-white transition-all duration-300 ${toastType === "success" ? "bg-green-600" : "bg-red-600"
            }`}
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default VoluntarioHome;
