import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    navigate("/");
  };

  return (
        <>
            {/* Overlay en móvil */}
            {open && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Botón hamburguesa (Mantener sin cambios) */}
            <div className="md:hidden p-4 bg-gray-800 text-white flex justify-between items-center z-50 relative">
                <span className="font-bold text-lg">ComuniApp</span>
                <button onClick={() => setOpen(!open)} className="focus:outline-none">
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        {open ? (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        ) : (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        )}
                    </svg>
                </button>
            </div>

            {/* Sidebar con diseño minimalista y botones redondeados */}
            <div
                className={`bg-gray-800 text-white h-screen w-64 flex flex-col fixed top-0 left-0 z-50 transform transition-transform duration-300 md:translate-x-0 shadow-2xl ${
                    open ? "translate-x-0" : "-translate-x-full"
                } md:static md:flex`}
            >
                {/* Header - Marca con Énfasis */}
                <div className="p-6 text-2xl font-black border-b border-gray-700">
                    <span className="text-indigo-400">Comuni</span>App
                </div>
                
                {/* Contenedor de Ítems (Espaciado) */}
                <div className="flex-1 p-4 flex flex-col justify-between">
                    <div className="space-y-2">
                        
                        {/* ÍTEM 1: INICIO */}
                        <button
                            onClick={() => {
                                navigate("/home");
                                setOpen(false);
                            }}
                            // Botón ACTIVO/Destacado
                            className="w-full text-left px-4 py-3 flex items-center space-x-3 rounded-xl bg-gray-700 text-white font-semibold transition hover:bg-gray-700/80"
                        >
                            <span className="text-lg">🏠</span>
                            <span>Inicio</span>
                        </button>
                        
                        {/* ÍTEM 2: PERFIL */}
                        <button
                            onClick={() => {
                                navigate("/perfil");
                                setOpen(false);
                            }}
                            // Botón INACTIVO/Normal
                            className="w-full text-left px-4 py-3 flex items-center space-x-3 rounded-xl text-gray-300 transition hover:bg-gray-700"
                        >
                            <span className="text-lg">👤</span>
                            <span>Perfil</span>
                        </button>
                        
                    </div>
                </div>
                
                {/* Pie - Logout (Destacado) */}
                <div className="p-4 border-t border-gray-700">
                    <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition"
                    >
                        🚪 Cerrar Sesión
                    </button>
                </div>
            </div>
        </>
    );
}
