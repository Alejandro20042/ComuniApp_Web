import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import type { Solicitud } from "../../interfaces/Solicitud";
import ChatBox from "../../components/chat/ChatBox";
import { ChatService } from "../../api/chatService";
import { useUser } from "../../hooks/useUser";

const SolicitanteHome: React.FC = () => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(null);
  const [chatInfo, setChatInfo] = useState<{
    solicitudId: number;
    solicitanteId: number;
    voluntarioId: number;
  } | null>(null);
  const [chatLoading, setChatLoading] = useState(false);

  const user = useUser();
  const chatRef = useRef<ChatService | null>(null);
  if (!chatRef.current) chatRef.current = new ChatService();

  // 🔹 Conexión a SignalR
  useEffect(() => {
    if (!user) return;
    const chat = chatRef.current!;
    chat.connect(user.id);
    return () => chat.disconnect();
  }, [user]);

  // 🔹 Cargar solicitudes
  useEffect(() => {
    fetchSolicitudes();
  }, []);

  const fetchSolicitudes = async () => {
    try {
      setLoading(true);
      const res = await axios.get<Solicitud[]>("https://localhost:5282/api/solicitudes");
      setSolicitudes(res.data);
    } catch {
      setError("Error al cargar las solicitudes");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Obtener info del chat si está en progreso
  const fetchChatInfo = async (solicitudId: number) => {
    try {
      setChatLoading(true);
      const res = await axios.get(`https://localhost:5282/api/mensajes/chat-info/${solicitudId}`);
      setChatInfo(res.data);
    } catch (err) {
      console.error("Error obteniendo info del chat:", err);
      setChatInfo(null);
    } finally {
      setChatLoading(false);
    }
  };

  const handleCrearSolicitud = async (e: React.FormEvent) => {
    e.preventDefault();
    const storedUser = localStorage.getItem("usuario");
    if (!storedUser) return;

    const usuario = JSON.parse(storedUser);
    try {
      const response = await axios.post("https://localhost:5282/api/solicitudes", {
        Titulo: titulo,
        Descripcion: descripcion,
        Ubicacion: ubicacion,
        Estado: "pendiente",
        FechaCreacion: new Date().toISOString(),
        SolicitanteId: usuario.solicitanteId,
      });

      setSolicitudes([response.data, ...solicitudes]);
      setShowModal(false);
      setTitulo("");
      setDescripcion("");
      setUbicacion("");
      setToastType("success");
      setToastMessage("✅ Solicitud creada correctamente.");
    } catch {
      setToastType("error");
      setToastMessage("❌ Error al crear la solicitud.");
    }
  };

  const handleDeleteSolicitud = async (id: number) => {
    try {
      await fetch(`https://localhost:5282/api/solicitudes/${id}`, { method: "DELETE" });
      setSelectedSolicitud(null);
      fetchSolicitudes();
      setToastType("success");
      setToastMessage("🗑️ Solicitud eliminada correctamente.");
    } catch (error) {
      console.error("Error al eliminar:", error);
      setToastType("error");
      setToastMessage("❌ Hubo un error al eliminar la solicitud.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Mis solicitudes</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700"
        >
          + Nueva
        </button>
      </div>

      {/* Lista */}
      {loading ? (
        <p>Cargando...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : solicitudes.length === 0 ? (
        <p className="text-gray-500">No tienes solicitudes aún.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {solicitudes.map((s) => (
            <div
              key={s.id}
              onClick={() => {
                setSelectedSolicitud(s);
                if (s.estado === "en progreso") fetchChatInfo(s.id);
              }}
              className="p-4 bg-white rounded-xl shadow hover:shadow-md cursor-pointer transition"
            >
              <h3 className="font-semibold text-gray-800 truncate">{s.titulo}</h3>
              <p className="text-sm text-gray-500 line-clamp-3">{s.descripcion}</p>
              {s.ubicacion && (
                <p className="text-sm text-gray-500 mt-1">📍 {s.ubicacion}</p>
              )}
              <p className="text-sm mt-1">
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
            </div>
          ))}
        </div>
      )}

      {/* Modal de detalles */}
      {selectedSolicitud && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg h-[85vh] flex flex-col">
            <div className="flex-1 p-6 overflow-y-auto">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {selectedSolicitud.titulo}
              </h3>

              <p className="text-gray-600 whitespace-pre-wrap break-words mb-3">
                {selectedSolicitud.descripcion}
              </p>

              {selectedSolicitud.ubicacion && (
                <p className="text-sm text-gray-500 mb-2">
                  📍 {selectedSolicitud.ubicacion}
                </p>
              )}

              <p className="text-sm mb-2">
                Estado:{" "}
                <span
                  className={
                    selectedSolicitud.estado === "pendiente"
                      ? "text-yellow-600"
                      : selectedSolicitud.estado === "en progreso"
                      ? "text-blue-600"
                      : "text-green-600"
                  }
                >
                  {selectedSolicitud.estado}
                </span>
              </p>

              {/* 🟢 Mostrar Chat si está en progreso */}
              {selectedSolicitud.estado === "en progreso" && (
                <div className="mt-6">
                  {chatLoading ? (
                    <p className="text-gray-500">Cargando chat...</p>
                  ) : chatInfo ? (
                    <>
                      <h4 className="text-lg font-semibold text-gray-700 mb-2">
                        Chat con el voluntario (ID: {chatInfo.voluntarioId})
                      </h4>
                      <ChatBox
                        toUserId={chatInfo.voluntarioId}
                        chatService={chatRef.current}
                      />
                    </>
                  ) : (
                    <p className="text-gray-400">
                      No se pudo cargar la información del chat.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-between p-4 border-t border-gray-200">
              <button
                onClick={() => handleDeleteSolicitud(selectedSolicitud.id)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-red-700 hover:shadow transition"
              >
                Eliminar
              </button>

              <button
                onClick={() => setSelectedSolicitud(null)}
                className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-400 shadow-sm hover:bg-gray-100 hover:shadow transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg text-white ${
            toastType === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default SolicitanteHome;
