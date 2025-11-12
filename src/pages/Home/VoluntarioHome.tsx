import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import type { Solicitud } from "../../interfaces/Solicitud";
import { useUser } from "../../hooks/useUser";
import { ChatService } from "../../api/chatService";
import ChatBox from "../../components/chat/ChatBox";

// Tipo para la respuesta del backend
interface ChatInfo {
  solicitudId: number;
  solicitanteId: number;
  voluntarioId: number;
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

  // Chat
  const [chatInfo, setChatInfo] = useState<ChatInfo | null>(null);

  // Conexión a SignalR
  useEffect(() => {
    if (!user) return;
    const chat = chatRef.current!;
    chat.connect(user.id);

    return () => {
      chat.disconnect();
    };
  }, [user]);

  // Cargar solicitudes
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

  // ✅ Obtener info del chat después de aceptar solicitud
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

  // ✅ Abrir chat dentro de la tarjeta
  const handleAbrirChat = async (solicitud: Solicitud) => {
    if (selectedSolicitud?.id === solicitud.id) {
      // cerrar chat si ya estaba abierto
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
              <div
                key={s.id}
                className="p-4 border rounded-xl bg-white shadow-sm flex flex-col justify-between"
              >
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
        {enProgreso.map(s => (
          <div key={s.id} className="p-4 border rounded-xl bg-blue-50 shadow-sm">
            <h3 className="font-semibold text-gray-800 text-lg mb-1">{s.titulo}</h3>
            <p className="text-sm text-gray-600 line-clamp-3">{s.descripcion}</p>
            <p className="mt-2 text-sm text-blue-700">Estado: {s.estado}</p>

            <button
              onClick={() => handleAbrirChat(s)}
              className="mt-3 bg-green-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              {selectedSolicitud?.id === s.id ? "Cerrar Chat" : "Abrir Chat"}
            </button>

            {/* Chat embebido en la tarjeta */}
            {selectedSolicitud?.id === s.id && chatInfo && (
              <ChatBox
                toUserId={user?.tipoUsuario === "voluntario" ? chatInfo.solicitanteId : chatInfo.voluntarioId}
                chatService={chatRef.current}
              />
            )}
          </div>
        ))}
      </section>

      {/* 🔸 Modal */}
      {showConfirmModal && selectedSolicitud && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Aceptar Solicitud</h3>
            <p className="text-gray-700 mb-3">¿Estás seguro de que deseas aceptar esta solicitud?</p>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <p className="text-sm font-semibold text-gray-800 mb-1">
                {selectedSolicitud.titulo}
              </p>
              <p className="text-sm text-gray-600">{selectedSolicitud.descripcion}</p>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedSolicitud(null);
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancelar
              </button>
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
