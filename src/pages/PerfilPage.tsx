import { useEffect, useState } from "react";
import type { Usuario } from "../interfaces/Usuario";
import Toast from "../components/Toast"; // 👈 importa tu Toast

export default function PerfilPage() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("usuario");
    if (storedUser) {
      setUsuario(JSON.parse(storedUser));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!usuario) return;
    setUsuario({ ...usuario, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (usuario) {
      localStorage.setItem("usuario", JSON.stringify(usuario));
      setToastMessage("✅ Perfil actualizado"); // 👈 en vez de alert
    }
  };

  if (!usuario) return <div>No hay datos de usuario.</div>;

  return (
    <div className="min-h-screen flex justify-center bg-gradient-to-r from-blue-50 to-purple-100">
      <div className="w-full max-w-lg p-6 sm:p-1 bg-white shadow-xl rounded-xl mb-0">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <img
            src={`https://ui-avatars.com/api/?name=${usuario.nombre}&background=0D8ABC&color=fff&size=128`}
            alt="Foto de perfil"
            className="w-24 h-24 rounded-full shadow-lg mb-4 border-4 border-white"
          />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 text-center">
            👤 Perfil de {usuario.nombre}
          </h1>
        </div>

        {/* Campos bloqueados */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="p-3 bg-gray-50 rounded-lg shadow">
            <p className="font-semibold text-gray-700">📧 Email</p>
            <p className="text-gray-500 break-words">{usuario.email}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg shadow">
            <p className="font-semibold text-gray-700">👤 Tipo de Usuario</p>
            <p className="capitalize text-gray-500">{usuario.tipoUsuario}</p>
          </div>
        </div>

        {/* Campos opcionales editables */}
        <div className="space-y-4">
          <div>
            <label className="block font-semibold text-gray-700">📱 Teléfono</label>
            <input
              type="text"
              name="telefono"
              value={usuario.telefono || ""}
              onChange={handleChange}
              placeholder="Agrega tu teléfono"
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700">📍 Ubicación</label>
            <input
              type="text"
              name="ubicacion"
              value={usuario.ubicacion || ""}
              onChange={handleChange}
              placeholder="Ciudad, Estado"
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700">🏢 Organización</label>
            <input
              type="text"
              name="organizacion"
              value={usuario.organizacion || ""}
              onChange={handleChange}
              placeholder="Nombre de tu organización"
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700">📝 Biografía</label>
            <textarea
              name="bio"
              value={usuario.bio || ""}
              onChange={handleChange}
              placeholder="Cuéntanos un poco sobre ti..."
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 h-24 resize-none"
            />
          </div>
        </div>

        {/* Botón guardar */}
        <button
          onClick={handleSave}
          className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition shadow-md"
        >
          💾 Guardar cambios
        </button>
      </div>

      {/* Toast */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}
