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
      navigate("/home");
      setMensaje(`Bienvenido ${res.nombre || usuario}`);
    } catch {
      setMensaje("Error: usuario o contraseña incorrectos");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 overflow-hidden px-4">
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 w-full max-w-md p-8 sm:p-10">
        <div className="flex flex-col items-center mb-6">
          <img
            src={"/assets/images/people.png"}
            alt="Logo ComuniApp"
            className="w-16 h-16 sm:w-20 sm:h-20 mb-4 drop-shadow-md"
          />
          <h1 className="text-xl sm:text-2xl font-semibold text-brown-700 text-center">
            Bienvenido de nuevo
          </h1>
          <p className="text-sm text-brown-500 text-center">
            Accede a tu espacio tranquilo
          </p>
        </div>

        <form onSubmit={sendSubmit} className="space-y-5">
          <div className="relative">
            <input
              type="text"
              id="usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
              placeholder="Usuario"
              className="peer w-full px-4 pt-5 pb-2 border border-yellow-200/50 rounded-xl bg-white/60 text-brown-700 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-300"
            />
            <label
              htmlFor="usuario"
              className="absolute left-4 top-2 text-sm text-brown-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-brown-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-brown-700"
            >
              Usuario
            </label>
          </div>

          <div className="relative">
            <input
              type="password"
              id="contraseña"
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
              required
              placeholder="Contraseña"
              className="peer w-full px-4 pt-5 pb-2 border border-yellow-200/50 rounded-xl bg-white/60 text-brown-700 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-300"
            />
            <label
              htmlFor="contraseña"
              className="absolute left-4 top-2 text-sm text-brown-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-brown-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-brown-700"
            >
              Contraseña
            </label>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-brown-600 gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="accent-yellow-400" />
              Recordarme
            </label>
            <a href="#" className="hover:underline text-brown-500">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-300 to-orange-300 text-brown-700 font-semibold shadow-lg hover:shadow-xl transition"
          >
            Entrar
          </button>
        </form>

        {mensaje && (
          <p className="mt-4 text-center text-sm text-brown-600">{mensaje}</p>
        )}

        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-yellow-300 to-transparent"></div>
          <span className="text-xs text-brown-500">o continuar con</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-yellow-300 to-transparent"></div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button className="flex-1 py-2 rounded-lg border border-yellow-200/50 bg-white/60 text-brown-700 hover:bg-yellow-100 transition">
            Google
          </button>
        </div>

        <div className="text-center mt-6 text-sm text-brown-600">
          ¿No tienes cuenta?{" "}
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="text-brown-700 font-semibold hover:underline"
          >
            Regístrate
          </button>
        </div>
      </div>
    </div>
  );
}
