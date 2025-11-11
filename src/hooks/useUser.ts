// src/hooks/useUser.ts
import { useState, useEffect } from "react";
import type { Usuario } from "../interfaces/Usuario";

export const useUser = () => {
  const [user, setUser] = useState<Usuario | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("usuario");
    
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);
  return user;
};
