import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import type { Solicitud } from "../../interfaces/Solicitud";
import { useUser } from "../../hooks/useUser";
import { ChatService } from "../../api/chatService";
import ChatBox from "../../components/chat/ChatBox";

interface ChatInfo {
  solicitudId: number;
  solicitanteUsuarioId: number;
  voluntarioUsuarioId: number;
}

const VoluntarioHome: React.FC = () => {
  const user = useUser();
  const chatRef = useRef<ChatService | null>(null);
  const voluntarioId = user?.id;

  if (!chatRef.current) chatRef.current = new ChatService();

  const [pendientes, setPendientes] = useState<Solicitud[]>([]);
  const [enProgreso, setEnProgreso] = useState<Solicitud[]>([]);
  const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const [chatInfo, setChatInfo] = useState<ChatInfo | null>(null);

  useEffect(() => {
    if (!user) return;
    const chat = chatRef.current!;
    chat.connect(user.id);

    return () => {
      chat.disconnect();
    };
  }, [user]);

  useEffect(() => {
    fetchSolicitudes();
  }, [voluntarioId]);

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

  const handleTomarSolicitud = (solicitud: Solicitud) => {
    setSelectedSolicitud(solicitud);
    setShowConfirmModal(true);
  };

  const handleAceptarSolicitud = async (solicitud: Solicitud) => {
    if (!solicitud || !user?.id) return;

    try {
      await axios.put(`https://localhost:5282/api/solicitudes/${solicitud.id}/aceptar`, {
        voluntarioId: user?.id,
      });

      const res = await axios.get<ChatInfo>(
        `https://localhost:5282/api/mensajes/chat-info/${solicitud.id}`
      );
      console.log("chat-info raw:", res.data);

      setChatInfo(res.data);
      setShowConfirmModal(false);

      setToastMessage("✅ Solicitud aceptada y chat listo para iniciar.");
      setToastType("success");
      setTimeout(() => setToastMessage(null), 3000);
      fetchSolicitudes();
    } catch (err) {
      console.error("❌ Error al aceptar solicitud:", err);
      setToastMessage("❌ Error al obtener datos del chat.");
      setToastType("error");
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleAbrirChat = async (solicitud: Solicitud) => {
    if (selectedSolicitud?.id === solicitud.id) {
      setSelectedSolicitud(null);
      setChatInfo(null);
    } else {
      setSelectedSolicitud(solicitud);
      try {
        const res = await axios.get<ChatInfo>(
          `https://localhost:5282/api/mensajes/chat-info/${solicitud.id}`
        );
        setChatInfo(res.data);
      } catch (err) {
        console.error("❌ Error al obtener chat-info:", err);
      }
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "pendiente":
        return "text-yellow-600";
      case "en progreso":
        return "text-orange-600";
      case "completada":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  return (

    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 px-4 py-6 sm:py-10">
      <div className="w-full max-w-5xl mx-auto space-y-10">
        {/* Solicitudes disponibles */}
        <section className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 p-5">
          <h2 className="text-xl font-bold text-brown-700 mb-4">Solicitudes Disponibles</h2>
          {pendientes.length === 0 ? (
            <p className="text-brown-500">No hay solicitudes disponibles.</p>
          ) : (
            <div className="divide-y divide-yellow-100 space-y-4">
              {pendientes.map(s => (
                <div key={s.id} className="flex flex-col gap-4 py-4 sm:flex-row sm:items-start sm:gap-6">
                  {/* icono/avatar */}
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-yellow-100 text-yellow-700 font-bold">
                    📄
                  </div>

                  {/* contenido */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <h3 className="font-semibold text-brown-700 text-base">{s.titulo}</h3>
                    <p
                      className={`text-sm text-brown-600 transition-all duration-300 overflow-hidden break-words whitespace-pre-wrap ${selectedSolicitud?.id === s.id ? "" : "line-clamp-2"
                        }`}
                    >
                      {s.descripcion.length > 30
                        ? s.descripcion.slice(0, 95) + "..."
                        : s.descripcion}
                    </p>
                    <p className="text-xs">📍 Ubicación: {s.ubicacion}</p>
                    <p className="text-xs">
                      Estado:{" "}
                      <span className={`font-semibold ${getEstadoColor(s.estado)}`}>{s.estado}</span>
                    </p>
                  </div>

                  {/* botón */}
                  <div className="sm:self-start sm:ml-auto w-full sm:w-auto">
                    <button
                      onClick={() => handleTomarSolicitud(s)}
                      className="px-3 py-1.5 w-full sm:w-auto rounded-md bg-gradient-to-r from-yellow-300 to-orange-300 text-brown-700 text-sm font-medium shadow hover:shadow-md transition"
                    >
                      Tomar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Solicitudes en progreso */}
        <section className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 p-5">
          <h2 className="text-xl font-bold text-brown-700 mb-4">Solicitudes en Progreso</h2>
          {enProgreso.length === 0 ? (
            <p className="text-brown-500">No tienes solicitudes en progreso.</p>
          ) : (
            <div className="divide-y divide-orange-100 space-y-4">
              {enProgreso.map(s => (
                <div key={s.id} className="flex flex-col gap-4 py-4 sm:flex-row sm:items-start sm:gap-6">
                  {/* icono */}
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-orange-100 text-orange-700 font-bold">
                    🔔
                  </div>

                  {/* contenido */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <h3 className="font-semibold text-brown-700 text-base">{s.titulo}</h3>
                    <p className="text-sm text-brown-600 break-words line-clamp-2">{s.descripcion}</p>
                    <p className="text-xs">
                      Estado:{" "}
                      <span className={`font-semibold ${getEstadoColor(s.estado)}`}>{s.estado}</span>
                    </p>

                    {/* detalles extra */}
                    <div className="bg-orange-50 p-3 rounded-lg border border-orange-200 space-y-2">
                      <p className="text-sm text-brown-700">📍 Ubicación: {s.ubicacion}</p>
                      <p className="text-sm text-brown-700">
                        📅 Fecha:{" "}
                        {s.fechaCreacion
                          ? new Date(s.fechaCreacion).toLocaleDateString("es-MX", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                          : "N/A"}
                      </p>
                    </div>

                    {/* botón */}
                    <div className="flex justify-end sm:justify-start">
                      <button
                        onClick={() => handleAbrirChat(s)}
                        className="px-3 py-1.5 w-full sm:w-auto rounded-md bg-gradient-to-r from-green-300 to-green-500 text-brown-700 text-sm font-medium shadow hover:shadow-md transition"
                      >
                        {selectedSolicitud?.id === s.id ? "Cerrar Chat" : "Abrir Chat"}
                      </button>
                    </div>

                    {/* chat */}
                    {selectedSolicitud?.id === s.id && chatInfo && (
                      <div className="mt-4">
                        <ChatBox
                          toUserId={
                            user?.tipoUsuario === "voluntario"
                              ? chatInfo.solicitanteUsuarioId
                              : chatInfo.voluntarioUsuarioId
                          }
                          solicitudId={chatInfo.solicitudId}
                          chatService={chatRef.current}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Modal */}
      {showConfirmModal && selectedSolicitud && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 px-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col overflow-x-hidden">
            <h3 className="text-xl font-bold text-brown-700 mb-4">Aceptar Solicitud</h3>
            <p className="text-brown-700 mb-3">¿Estás seguro de que deseas aceptar esta solicitud?</p>

            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 max-h-60 overflow-y-auto overflow-x-hidden space-y-2">
              <p className="text-sm font-semibold text-brown-700">{selectedSolicitud.titulo}</p>
              <p className="text-sm text-brown-600 whitespace-pre-wrap break-words">{selectedSolicitud.descripcion}</p>
              <p className="text-sm text-brown-700">
                📅 Fecha de creación:{" "}
                {selectedSolicitud.fechaCreacion
                  ? new Date(selectedSolicitud.fechaCreacion).toLocaleDateString("es-MX", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                  : "N/A"}
              </p>
              <p className="text-sm text-brown-700">📍 Ubicación: {selectedSolicitud.ubicacion}</p>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedSolicitud(null);
                }}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 w-full sm:w-auto"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleAceptarSolicitud(selectedSolicitud!)}
                className="px-4 py-2 rounded-md bg-gradient-to-r from-yellow-300 to-orange-300 text-brown-700 font-semibold shadow hover:shadow-md transition w-full sm:w-auto"
              >
                Aceptar solicitud
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg text-white ${toastType === "success" ? "bg-green-600" : "bg-red-600"
            }`}
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default VoluntarioHome;
