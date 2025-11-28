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

      {/* Botón hamburguesa */}
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

      {/* Sidebar */}
      <div
        className={`bg-gray-800 text-white h-screen w-64 flex flex-col fixed top-0 left-0 z-50 transform transition-transform duration-300 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:static md:flex`}
      >
        <div className="p-6 text-2xl font-bold border-b border-gray-700">
          ComuniApp
        </div>
        <nav className="flex-1 p-4 space-y-4">
          <button
            onClick={() => {
              navigate("/home");
              setOpen(false);
            }}
            className="w-full text-left px-4 py-2 rounded hover:bg-gray-700"
          >
            🏠 Inicio
          </button>
          {/* <button
            onClick={() => {
              navigate("/solicitudes-finalizadas");
              setOpen(false);
            }}
            className="w-full text-left px-4 py-2 rounded hover:bg-gray-700"
          >
            📂 Solicitudes Finalizadas
          </button> */}
          <button
            onClick={() => {
              navigate("/perfil");
              setOpen(false);
            }}
            className="w-full text-left px-4 py-2 rounded hover:bg-gray-700"
          >
            👤 Perfil
          </button>
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 rounded hover:bg-red-600 bg-red-500"
          >
            🚪 Cerrar Sesión
          </button>
        </div>
      </div>
    </>
  );
}
