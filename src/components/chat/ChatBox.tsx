import React, { useState, useEffect } from "react";

interface ChatBoxProps {
  toUserId: number;
  solicitudId: number;
  chatService: any;
}

const ChatBox: React.FC<ChatBoxProps> = ({ toUserId, solicitudId, chatService }) => {
  const [mensaje, setMensaje] = useState("");
  const [mensajes, setMensajes] = useState<{ from: string; text: string }[]>([]);

  // 📩 Escuchar mensajes entrantes
  useEffect(() => {
    if (!chatService?.hubConnection) return;

    const handleReceiveMessage = (data: any) => {
      setMensajes((prev) => [
        ...prev,
        { from: data.fromUserId === toUserId ? `Usuario ${data.fromUserId}` : "Tú", text: data.message },
      ]);
    };

    chatService.hubConnection.on("ReceiveMessage", handleReceiveMessage);

    return () => {
      chatService.hubConnection.off("ReceiveMessage", handleReceiveMessage);
    };
  }, [chatService, toUserId]);

  // 🚀 Enviar mensaje
  const handleEnviar = async () => {
    if (!mensaje.trim()) return;

    console.log("ChatBox handleEnviar:", { toUserId, solicitudId, mensaje });
    await chatService.sendMessage(toUserId, solicitudId, mensaje);
    setMensajes((prev) => [...prev, { from: "Tú", text: mensaje }]);
    setMensaje("");
  };

  // 🧩 Permitir enviar con Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleEnviar();
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-100 mt-4">
      {/* Mensajes */}
      <div className="h-48 overflow-y-auto mb-3 bg-white p-3 rounded shadow-inner">
        {mensajes.length === 0 ? (
          <p className="text-gray-400 text-center mt-10">No hay mensajes aún</p>
        ) : (
          mensajes.map((m, i) => (
            <p
              key={i}
              className={`mb-1 ${
                m.from === "Tú" ? "text-right text-blue-600" : "text-left text-gray-800"
              }`}
            >
              <strong>{m.from}:</strong> {m.text}
            </p>
          ))
        )}
      </div>

      {/* Input + Botón responsivo */}
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
