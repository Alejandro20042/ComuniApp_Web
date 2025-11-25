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
  }, [navigate]);

  if (!usuario) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 p-6">
      <header className="w-full max-w-6xl mx-auto flex justify-between items-center mb-6 relative">
        <h1 className="text-2xl font-bold text-gray-800">
          👋 Hola, <span className="text-green-600">{usuario.nombre}</span>
        </h1>
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
