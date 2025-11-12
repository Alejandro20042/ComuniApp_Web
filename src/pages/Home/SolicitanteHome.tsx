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

      {/* Modal Crear Solicitud */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
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

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de solicitudes */}
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

              {/* Botones de acción */}
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => {
                    setSelectedSolicitud(s);
                    setChatOpen(false); // 👈 abre solo detalles
                  }}
                  className="px-3 py-1 bg-gray-300 rounded-lg hover:bg-gray-400"
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
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Abrir chat
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de detalles */}
      {selectedSolicitud && !chatOpen && (
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
            </div>

            <div className="border-t p-4 flex justify-between">
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

      {/* Modal de chat */}
      {selectedSolicitud && chatOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-xl">
              <h3 className="text-xl font-semibold text-white">
                Chat de la solicitud: <span className="font-bold">{selectedSolicitud.titulo}</span>
              </h3>
              <button
                onClick={() => {
                  setChatOpen(false);
                  setSelectedSolicitud(null);
                }}
                className="px-3 py-1 bg-white text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                ✖ Cerrar
              </button>
            </div>

            {/* Body */}
            <div className="flex flex-1">
              {/* Columna izquierda: detalles */}
              <div className="w-1/3 p-6 border-r bg-gray-50">
                <h4 className="text-lg font-bold text-gray-800 mb-2">Detalles</h4>
                <p className="text-gray-600 mb-3">{selectedSolicitud.descripcion}</p>
                {selectedSolicitud.ubicacion && (
                  <p className="text-sm text-gray-500 mb-2">📍 {selectedSolicitud.ubicacion}</p>
                )}
                <p className="text-sm">
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
              </div>

              {/* Columna derecha: chat */}
              <div className="w-2/3 flex flex-col bg-gray-100">
                {chatInfo ? (
                  chatLoading ? (
                    <p className="p-4 text-gray-500">Cargando chat...</p>
                  ) : (
                    <div className="flex flex-col flex-1">
                      {/* ChatBox envuelto en un área con scroll */}
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
          className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg text-white ${toastType === "success" ? "bg-green-600" : "bg-red-600"
            }`}
        >
          {toastMessage}
        </div>
      )}
    </div>
  );

};

export default SolicitanteHome;
