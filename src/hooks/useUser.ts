import { useState, useEffect } from "react";
import type { Usuario } from "../interfaces/Usuario";

export const useUser = () => {
  const [user, setUser] = useState<Usuario | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("usuario");
    if (stored) {
      const parsed: any = JSON.parse(stored);

      if (parsed.id == null) {
        parsed.id = parsed.solicitanteId ?? parsed.voluntarioId ?? parsed.userId ?? null;
      }
      setUser(parsed as Usuario);
    }
  }, []);

  return user;
};