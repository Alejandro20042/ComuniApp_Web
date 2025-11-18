import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ChatService } from "../../api/chatService";
import { useUser } from "../../hooks/useUser";
import type { Solicitud } from "../../interfaces/Solicitud";
import type { ChatInfo } from "../../interfaces/ChatInfo";
import ChatBox from "../../components/chat/ChatBox";

const SolicitanteHome: React.FC = () => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(null);
  const [chatInfo, setChatInfo] = useState<ChatInfo | null>(null);
  const [chatLoading, setChatLoading] = useState(false);

  const user = useUser();
  const chatRef = useRef<ChatService | null>(null);
  if (!chatRef.current) chatRef.current = new ChatService();

  useEffect(() => {
    if (!user) return;
    const chat = chatRef.current!;
    chat.connect(user.id);
    return () => chat.disconnect();
  }, [user]);

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
    <div className="max-w-6xl mx-auto relative px-3 sm:px-4 md:px-6">

      {/* Título + botón */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Mis solicitudes</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 text-white w-full sm:w-auto px-5 py-2.5 rounded-full hover:bg-green-700 transition"
        >
          + Nueva
        </button>
      </div>

      {/* Modal Crear Solicitud */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-3 sm:p-6 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Crear nueva solicitud</h3>

            <form onSubmit={handleCrearSolicitud} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Título"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="border rounded-lg px-3 py-2"
                required
              />
              <textarea
                placeholder="Descripción"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="border rounded-lg px-3 py-2"
                required
              />
              <input
                type="text"
                placeholder="Ubicación"
                value={ubicacion}
                onChange={(e) => setUbicacion(e.target.value)}
                className="border rounded-lg px-3 py-2"
              />

              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 w-full sm:w-auto bg-gray-300 rounded-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 w-full sm:w-auto bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Listado */}
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
              className="p-4 bg-white rounded-xl shadow hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <h3 className="font-semibold text-gray-800 truncate text-lg">{s.titulo}</h3>
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

              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => {
                    setSelectedSolicitud(s);
                    setChatOpen(false);
                  }}
                  className="px-3 py-1 text-sm bg-gray-300 rounded-lg hover:bg-gray-400"
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
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Abrir chat
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Detalles */}
      {selectedSolicitud && !chatOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-3 sm:p-5 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-2 break-words">
              {selectedSolicitud.titulo}
            </h3>

            <p className="text-gray-600 whitespace-pre-wrap break-words mb-3">
              {selectedSolicitud.descripcion}
            </p>

            {selectedSolicitud.ubicacion && (
              <p className="text-sm text-gray-500 mb-2">📍 {selectedSolicitud.ubicacion}</p>
            )}

            <p className="text-sm mb-4">
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

            <div className="flex flex-col sm:flex-row justify-between gap-3 border-t pt-4">
              <button
                onClick={() => setSelectedSolicitud(null)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Cerrar
              </button>
              <button
                onClick={() => handleDeleteSolicitud(selectedSolicitud.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Chat */}
      {selectedSolicitud && chatOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[92vh] flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-xl">
              <h3 className="text-lg sm:text-xl font-semibold text-white break-words">
                Chat: <span className="font-bold">{selectedSolicitud.titulo}</span>
              </h3>
              <button
                onClick={() => {
                  setChatOpen(false);
                  setSelectedSolicitud(null);
                }}
                className="px-3 py-1 bg-white text-gray-700 rounded-lg hover:bg-gray-200"
              >
                ✖
              </button>
            </div>

            <div className="flex flex-col md:flex-row flex-1">

              <div className="w-full md:w-1/1 flex flex-col bg-gray-100">
                {chatInfo ? (
                  chatLoading ? (
                    <p className="p-4 text-gray-500">Cargando chat...</p>
                  ) : (
                    <div className="flex flex-col flex-1">
                      <div className="flex-1 overflow-y-auto p-4">
                        <ChatBox
                          toUserId={chatInfo.voluntarioUsuarioId}
                          solicitudId={chatInfo.solicitudId}
                          chatService={chatRef.current}
                        />
                      </div>
                    </div>
                  )
                ) : (
                  <p className="p-4 text-gray-500">
                    El chat estará disponible cuando la solicitud esté en progreso.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg text-white text-sm sm:text-base ${toastType === "success" ? "bg-green-600" : "bg-red-600"
            }`}
        >
          {toastMessage}
        </div>
      )}
    </div>
  );


};

export default SolicitanteHome;
