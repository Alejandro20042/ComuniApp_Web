// ...existing code...
import { useState, useEffect } from "react";
import type { Usuario } from "../interfaces/Usuario";

export const useUser = () => {
  const [user, setUser] = useState<Usuario | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("usuario");
    if (stored) {
      const parsed: any = JSON.parse(stored);

      // Normalizar: asegurar que exista `id` (fallback a solicitanteId / voluntarioId / userId)
      if (parsed.id == null) {
        parsed.id = parsed.solicitanteId ?? parsed.voluntarioId ?? parsed.userId ?? null;
      }

      // Si no hay id después de normalizar, sigue siendo null — ayudará a detectar el problema.
      setUser(parsed as Usuario);
    }
  }, []);

  return user;
};