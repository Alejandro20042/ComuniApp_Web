import React, { useEffect, useState } from "react";
import axios from "axios";
import type { Solicitud } from "../../interfaces/Solicitud";
import { useUser } from "../../hooks/useUser";

const VoluntarioHome: React.FC = () => {
  const [pendientes, setPendientes] = useState<Solicitud[]>([]);
  const [enProgreso, setEnProgreso] = useState<Solicitud[]>([]);
  const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");


  const user = useUser();
  const voluntarioId = user?.id;

  const fetchSolicitudes = async () => {
    try {
      const [resPendientes, resEnProgreso] = await Promise.all([
        
        axios.get<Solicitud[]>("https://localhost:5282/api/solicitudes/pendientes"),
        voluntarioId
          ? axios.get<Solicitud[]>(`https://localhost:5282/api/solicitudes/voluntario/${user?.id}`)
          : Promise.resolve({ data: [] }),
      ]);
      setPendientes(resPendientes.data);
      setEnProgreso(resEnProgreso.data);
    } catch (err) {
      console.error(err);
      setToastMessage("❌ Error al cargar solicitudes");
      setToastType("error");
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  useEffect(() => {
    fetchSolicitudes();
  }, [voluntarioId]);

  const handleTomarSolicitud = (solicitud: Solicitud) => {
    setSelectedSolicitud(solicitud);
    setShowConfirmModal(true);
  };

  const handleAceptarSolicitud = async (solicitud: Solicitud) => {
    if (!solicitud || !user?.id) return;

    try {
      fetchSolicitudes();
    } catch (err) {
      console.error("❌ Error al aceptar solicitud:", err);
    }
  };

  return (
    <div className="w-full max-w-5xl flex flex-col gap-8 mx-auto">
      {/* 🔸 Solicitudes Pendientes */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Solicitudes Disponibles</h2>
        {pendientes.length === 0 ? (
          <p className="text-gray-500">No hay solicitudes disponibles.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pendientes.map(s => (
              <div key={s.id} className="p-4 border rounded-xl bg-white shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg mb-1">{s.titulo}</h3>
                  <p className="text-sm text-gray-600 line-clamp-3">{s.descripcion}</p>
                  <p className="mt-2 text-sm text-yellow-700">Estado: {s.estado}</p>
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
      </section>

      {/* 🔸 Solicitudes en Progreso */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Solicitudes en Progreso</h2>
        {enProgreso.length === 0 ? (
          <p className="text-gray-500">Aún no has tomado ninguna solicitud.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {enProgreso.map(s => (
              <div key={s.id} className="p-4 border rounded-xl bg-blue-50 shadow-sm">
                <h3 className="font-semibold text-gray-800 text-lg mb-1">{s.titulo}</h3>
                <p className="text-sm text-gray-600 line-clamp-3">{s.descripcion}</p>
                <p className="mt-2 text-sm text-blue-700">Estado: {s.estado}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 🔸 Modal */}
      {showConfirmModal && selectedSolicitud && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Aceptar Solicitud</h3>
            <p className="text-gray-700 mb-3">¿Estás seguro de que deseas aceptar esta solicitud?</p>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <p className="text-sm font-semibold text-gray-800 mb-1">{selectedSolicitud.titulo}</p>
              <p className="text-sm text-gray-600">{selectedSolicitud.descripcion}</p>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => { setShowConfirmModal(false); setSelectedSolicitud(null); }}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >Cancelar</button>
              <button
                onClick={() => handleAceptarSolicitud(selectedSolicitud!)}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Tomar solicitud
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔸 Toast */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg text-white ${toastType === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default VoluntarioHome;
