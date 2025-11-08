import React, { useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error";
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000); // se cierra solo a los 3s
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg text-white transition-all duration-300
      ${type === "success" ? "bg-green-600" : "bg-red-600"}
      `}
    >
      {message}
    </div>
  );
};

export default Toast;
