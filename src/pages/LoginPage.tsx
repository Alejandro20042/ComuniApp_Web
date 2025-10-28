import { useState, type FormEvent } from "react";
import { login } from "../api/auth";

export default function LoginPage() {
  const [usuario, setUsuario] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [mensaje, setMensaje] = useState("");

  const sendSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await login({ usuario, contraseña });
      setMensaje(`Bienvenido ${res.nombre || usuario}`);
    } catch {
      setMensaje("Error: usuario o contraseña incorrectos");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={sendSubmit}
        className="bg-white p-8 rounded-2xl shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
          Iniciar Sesión
        </h2>

        <label className="block mb-2 font-medium">Usuario</label>
        <input
          type="text"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          className="w-full border p-2 rounded mb-4"
          required
        />

        <label className="block mb-2 font-medium">Contraseña</label>
        <input
          type="password"
          value={contraseña}
          onChange={(e) => setContraseña(e.target.value)}
          className="w-full border p-2 rounded mb-4"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Entrar
        </button>

        {mensaje && <p className="mt-4 text-center text-gray-700">{mensaje}</p>}
      </form>
    </div>
  );
}
