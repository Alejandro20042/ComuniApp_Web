import { useState, type FormEvent } from "react";
import { login } from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [usuario, setUsuario] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

  const sendSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await login({ usuario, contraseña });

      localStorage.setItem("usuario", JSON.stringify(res));
      console.log(res)

      navigate("/home");
      setMensaje(`Bienvenido ${res.nombre || usuario}`);

    } catch {
      setMensaje("Error: usuario o contraseña incorrectos");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">


      <img src={"assets/images/people.png"} alt="Logo" className="w-32 h-32 mb-6" />


      <form
        onSubmit={sendSubmit}
        className="bg-white p-8 rounded-2xl shadow-md w-96 flex flex-col items-center"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
          Iniciar Sesión
        </h2>

        <label className="block mb-2 font-medium w-full">Usuario</label>
        <input
          type="text"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          className="w-full border p-2 rounded mb-4"
          required
        />

        <label className="block mb-2 font-medium w-full">Contraseña</label>
        <input
          type="password"
          value={contraseña}
          onChange={(e) => setContraseña(e.target.value)}
          className="w-full border p-2 rounded mb-4"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 mb-2"
        >
          Entrar
        </button>

        <button
          type="button"
          onClick={() => navigate("/register")}
          className="w-full bg-gray-300 text-black py-2 rounded hover:bg-gray-400"
        >
          Crear nueva cuenta
        </button>

        {mensaje && <p className="mt-4 text-center text-gray-700">{mensaje}</p>}
      </form>
    </div>
  );
}

