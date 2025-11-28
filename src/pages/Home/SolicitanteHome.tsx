import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ChatService } from "../../api/chatService";
import { useUser } from "../../hooks/useUser";
import type { Solicitud } from "../../interfaces/Solicitud";
import type { ChatInfo } from "../../interfaces/ChatInfo";
import ChatBox from "../../components/chat/ChatBox";
import { crearSolicitudOffline } from "../../service/solicitudesService";
import OfflineDetector from "../../components/ToastOffline";
import SolicitudesLista from "../../components/SolicitudesLista";
import api from "../../api/axios";

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
  const didRun = useRef(false);


  if (!chatRef.current) chatRef.current = new ChatService();

  useEffect(() => {
    if (!user) return;
    const chat = chatRef.current!;
    chat.connect(user.id);
    return () => chat.disconnect();
  }, [user]);

  useEffect(() => {
    if (didRun.current) return;

    didRun.current = true;
    fetchSolicitudes();
  }, []);


  const fetchSolicitudes = async () => {
    try {
      //hacer sycrono
      //poner validacion
      setLoading(true);
      await getSolicitudesOffline();
      const res = await axios.get<Solicitud[]>(`/solicitudes`);
      setSolicitudes(res.data);
    } catch {
      setError("Error al cargar las solicitudes");
    } finally {
      setLoading(false);
    }
  };

  function getSolicitudesOffline() {
    const request = indexedDB.open("comuniapp-db", 1);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction("pending-solicitudes", "readonly");
      const store = tx.objectStore("pending-solicitudes");

      const getAll = store.getAll();
      getAll.onsuccess = () => {
        for (const s of getAll.result) {
          crearSolicitudOffline(s);
          // Opcional: eliminar de IndexedDB tras intentar enviar
          const delTx = db.transaction("pending-solicitudes", "readwrite");
          const delStore = delTx.objectStore("pending-solicitudes");
          delStore.delete(s.id);
        }
      };
      getAll.onerror = () => {
        console.error("Error al obtener solicitudes offline:", getAll.error);
      };
    };
    request.onerror = () => {
      console.error("Error al abrir IndexedDB:", request.error);
    };
  }

  const fetchChatInfo = async (solicitudId: number) => {
    try {
      setChatLoading(true);
      const res = await api.get(`/mensajes/chat-info/${solicitudId}`);
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
    const nuevaSolicitud = {
      Titulo: titulo,
      Descripcion: descripcion,
      Ubicacion: ubicacion,
      Estado: "pendiente",
      FechaCreacion: new Date().toISOString(),
      SolicitanteId: usuario.solicitanteId,
    };

    const result = await crearSolicitudOffline(nuevaSolicitud);

    if (result.sent) {
      //const estadoServer = (result.data?.estado ?? result.data?.Estado ?? "").toString().trim().toLowerCase();
      setSolicitudes((prev) => [result.data, ...prev]);
      setToastType("success");
      setToastMessage("✅ Solicitud creada correctamente.");
    } else if (result.queued) {
      setToastType("success");
      setToastMessage("📦 Solicitud guardada offline, se enviará al reconectar.");
    } else {
      setToastType("error");
      setToastMessage("❌ Error al crear la solicitud.");
    }

    setShowModal(false);
    setTitulo("");
    setDescripcion("");
    setUbicacion("");
  };

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const handler = (event: MessageEvent) => {
        if (event.data?.type === "SOLICITUD_SYNCED") {
          const nuevaSolicitud = event.data.payload;
          const estado = (nuevaSolicitud?.estado ?? nuevaSolicitud?.Estado ?? "")
            .toString()
            .trim()
            .toLowerCase();

          if (estado === "en progreso" || estado === "pendiente") {
            setSolicitudes((prev) => {
              // Buscar si ya existe en la lista (por id)
              const existe = prev.find((s) => s.id === nuevaSolicitud.id);
              if (existe) {
                // Reemplazar la solicitud existente
                return prev.map((s) =>
                  s.id === nuevaSolicitud.id ? nuevaSolicitud : s
                );
              } else {
                // Insertar si no estaba
                return [nuevaSolicitud, ...prev];
              }
            });

            setToastType("success");
            setToastMessage("✅ Solicitud sincronizada con el servidor.");
          } else {
            console.log(
              "Solicitud sincronizada pero no 'en progreso/pendiente', no se añade:",
              nuevaSolicitud
            );
          }
        }
      };
      navigator.serviceWorker.addEventListener("message", handler);
      return () => {
        navigator.serviceWorker.removeEventListener("message", handler);
      };
    }
  }, []);


  const handleConfirmarSolicitud = async (solicitud: Solicitud) => {
    const storedUser = localStorage.getItem("usuario");
    if (!storedUser) return;
    const usuario = storedUser ? JSON.parse(storedUser) : null;
    try {
      await api.put(`/solicitudes/${solicitud.id}/confirmar`, {
        SolicitanteId: usuario?.solicitanteId,
      });

      setToastType("success");
      setToastMessage("✅ Solicitud confirmada y cerrada.");
      setTimeout(() => setToastMessage(null), 3000);
      fetchSolicitudes();
      setSelectedSolicitud(null);
    } catch (err) {
      console.error("❌ Error al confirmar solicitud:", err);
      setToastType("error");
      setToastMessage("❌ Error al confirmar solicitud.");
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleDeleteSolicitud = async (id: number) => {
    try {
      await fetch(`https://comuniapp-api-1.onrender.com/api/solicitudes/${id}`, { method: "DELETE" });
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
        <div className="space-y-8">
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1">
              <SolicitudesLista
                solicitudes={solicitudes.filter(
                  (s) => s.estado === "pendiente" || s.estado === "finalizada" || s.estado === "completada" || s.estado === "en progreso"
                )}
                setSelectedSolicitud={setSelectedSolicitud}
                fetchChatInfo={fetchChatInfo}
                setChatOpen={setChatOpen}
              />
            </div>
          </div>
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

              {selectedSolicitud.estado === "completada" && (
                <button
                  onClick={() => handleConfirmarSolicitud(selectedSolicitud)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-300 to-purple-500 text-brown-700 font-semibold rounded-lg hover:shadow-md transition"
                >
                  Confirmar finalización
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Chat */}
      {selectedSolicitud && chatOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-2 sm:p-4 z-50 ">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex-col ">

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

            <div className="flex flex-col">
              <div className=" flex flex-col bg-gray-100 ">
                {chatInfo ? (
                  chatLoading ? (
                    <p className="p-4 text-gray-500">Cargando chat...</p>
                  ) : (
                    <div className="flex flex-col flex-1  ">
                      <div className="flex-1 overflow-y-auto p-4 ">
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
      <OfflineDetector />
    </div>
  );


};

export default SolicitanteHome;
