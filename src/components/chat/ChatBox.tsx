import axios from "axios";
import React, { useState, useEffect } from "react";
import api from "../../api/axios";

interface ChatBoxProps {
  toUserId: number;
  solicitudId: number;
  chatService: any;
}

const ChatBox: React.FC<ChatBoxProps> = ({ toUserId, solicitudId, chatService }) => {
  const [mensaje, setMensaje] = useState("");
  const [mensajes, setMensajes] = useState<{ from: string; text: string }[]>([]);
  const [userMap, setUserMap] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    if (!chatService?.hubConnection) return;
    const handleReceiveMessage = (data: any) => {
      setMensajes((prev) => [
        ...prev,
        {
          from:
            data.fromUserId === toUserId
              ? userMap[data.fromUserId] || `Usuario ${data.fromUserId}`
              : "Tú",
          text: data.message,
        },
      ]);
    };

    chatService.hubConnection.on("ReceiveMessage", handleReceiveMessage);

    return () => {
      chatService.hubConnection.off("ReceiveMessage", handleReceiveMessage);
    };
  }, [chatService, toUserId]);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const res = await api.get("/usuarios");
        const usuarios = res.data;
        const map: { [key: number]: string } = {};
        usuarios.forEach((u: any) => {
          map[u.id] = u.nombre;
        });
        setUserMap(map);
      } catch (err) {
        console.error("❌ Error al cargar usuarios:", err);
      }
    };

    fetchUsuarios();
  }, []);
  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        const res = await api.get(`/mensajes/historial/${solicitudId}`);
        const data = res.data.map((m: any) => ({
          from: m.emisorId === toUserId ? userMap[m.emisorId] || `Usuario ${m.emisorId}` : "Tú",
          text: m.contenido
        }));
        setMensajes(data);
      } catch (err) {
        console.error("❌ Error al cargar historial:", err);
      }
    };

    if (solicitudId) fetchHistorial();
  }, [solicitudId, toUserId, userMap]);

  const handleEnviar = async () => {
    if (!mensaje.trim()) return;
    await chatService.sendMessage(toUserId, solicitudId, mensaje);
    setMensajes((prev) => [...prev, { from: "Tú", text: mensaje }]);
    setMensaje("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleEnviar();
  };

  return (
    <div className="w-full md:w-[700px] p-3 border rounded-lg bg-gray-100 mt-4 ">
      <div className="h-66 overflow-y-auto mb-5 bg-white p-3 rounded shadow-inner space-y-2">
        {mensajes.length === 0 ? (
          <p className="text-gray-400 text-center mt-10">No hay mensajes aún</p>
        ) : (
          mensajes.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.from === "Tú" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`inline-block max-w-[80%] px-3 py-2 rounded-lg text-sm break-words whitespace-pre-wrap ${m.from === "Tú"
                  ? "bg-blue-600 text-white text-right"
                  : "bg-gray-200 text-gray-800 text-left"
                  }`}
              >
                <strong>{m.from}:</strong> {m.text}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Escribe un mensaje..."
          className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={handleEnviar}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition w-full sm:w-auto"
        >
          Enviar
        </button>
      </div>
    </div>
  );

};

export default ChatBox;
