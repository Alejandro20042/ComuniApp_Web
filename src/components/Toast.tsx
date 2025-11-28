import React, { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error";
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type = "success", onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Mostrar con animación
    setVisible(true);

    // Ocultar después de 3s
    const timer = setTimeout(() => {
      setVisible(false);
      // Esperar la animación de salida antes de desmontar
      setTimeout(onClose, 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg text-white transform transition-all duration-300
      ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
      ${type === "success" ? "bg-green-600" : "bg-red-600"}
      `}
    >
      {message}
    </div>
  );
};

export default Toast;
