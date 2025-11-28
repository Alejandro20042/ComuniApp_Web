import { useEffect, useState } from "react";
import Toast from "./Toast";

export default function OfflineDetector() {
  const [status, setStatus] = useState<"online" | "offline" | null>(null);

  useEffect(() => {
    const handleOffline = () => setStatus("offline");
    const handleOnline = () => setStatus("online");

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return (
    <>
      {status === "offline" && (
        <Toast
          message="⚠️ Estás sin conexión. Tus solicitudes se guardarán offline."
          type="error"
          onClose={() => setStatus(null)}
        />
      )}

      {status === "online" && (
        <Toast
          message="✅ Te has reconectado. Ahora estás en línea."
          type="success"
          onClose={() => setStatus(null)}
        />
      )}
    </>
  );
}
