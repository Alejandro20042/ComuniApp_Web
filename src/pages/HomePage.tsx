// src/pages/HomePage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SolicitanteHome from "./Home/SolicitanteHome";
import VoluntarioHome from "./Home/VoluntarioHome";
import type { Usuario } from "../interfaces/Usuario";


const HomePage: React.FC = () => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("usuario");
    if (!storedUser) {
      navigate("/");
      return;
    }

    setUsuario(JSON.parse(storedUser));
    console.log(storedUser)
  }, [navigate]);

  if (!usuario) return null; 
  console.log(usuario.nombre)

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="w-full max-w-6xl mx-auto flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          👋 Hola, {usuario.nombre}
        </h1>
        <img
          src="/logo.png"
          alt="Logo"
          className="w-12 h-12 rounded-full border border-gray-300"
        />
      </header>

      <main className="w-full max-w-6xl mx-auto">
        {usuario.tipoUsuario === "solicitante" ? (
          <SolicitanteHome />
        ) : (
          <VoluntarioHome />
        )}
      </main>
    </div>
  );
};

export default HomePage;

