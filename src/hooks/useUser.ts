// src/hooks/useUser.ts
import { useState, useEffect } from "react";

export interface User {
  id: number;
  nombre: string;
  tipo_usuario: "voluntario" | "solicitante";
}

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("usuario");
    
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);
  return user;
};
