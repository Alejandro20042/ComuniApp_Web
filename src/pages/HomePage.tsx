import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SolicitanteHome from "./Home/SolicitanteHome";
import VoluntarioHome from "./Home/VoluntarioHome";
import type { Usuario } from "../interfaces/Usuario";

const HomePage: React.FC = () => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("usuario");
    if (!storedUser) {
      navigate("/");
      return;
    }
    setUsuario(JSON.parse(storedUser));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    navigate("/");
  };

  if (!usuario) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 p-6">
      <header className="w-full max-w-6xl mx-auto flex justify-between items-center mb-6 relative">
        <h1 className="text-2xl font-bold text-gray-800">
          👋 Hola, <span className="text-green-600">{usuario.nombre}</span>
        </h1>

        {/* Logo con menú */}
        <div className="relative">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-12 h-12 rounded-full border-2 border-orange-300 shadow cursor-pointer hover:scale-105 transition"
            onClick={() => setMenuOpen(!menuOpen)}
          />

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white/90 backdrop-blur-md rounded-lg shadow-lg border border-gray-200 z-50">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                𒌋 Cerrar sesión
              </button>
            </div>
          )}
        </div>
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
