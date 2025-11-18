import { useState, type FormEvent } from "react";
import { register } from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [contraseña, setContraseña] = useState("");
    const [confirmarContraseña, setConfirmarContraseña] = useState("");
    const [esVoluntario, setEsVoluntario] = useState(false);
    const [esSolicitante, setEsSolicitante] = useState(false);
    const [mensaje, setMensaje] = useState("");
    const navigate = useNavigate();

    const sendSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (contraseña !== confirmarContraseña) {
            setMensaje("Las contraseñas no coinciden");
            return;
        }

        let tipoUsuario: "voluntario" | "solicitante";
        if (esVoluntario && !esSolicitante) {
            tipoUsuario = "voluntario";
        } else if (!esVoluntario && esSolicitante) {
            tipoUsuario = "solicitante";
        } else {
            setMensaje("Debes seleccionar solo un tipo de usuario");
            return;
        }

        try {
            const res = await register({
                Nombre: nombre,
                Contraseña: contraseña,
                TipoUsuario: tipoUsuario,
                Email: email,
            });

            setMensaje("Registro exitoso ✅");
            console.log(res);
        } catch (err) {
            console.error(err);
            setMensaje("Error al registrar usuario ❌");
        }
    };

    return (
        <div className="relative h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 overflow-y-auto md:overflow-hidden px-4 py-10 md:py-0">
            <form
                onSubmit={sendSubmit}
                className="mx-auto bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 w-full max-w-md p-8 sm:p-10"
            >
                <div className="flex flex-col items-center mb-6">
                    <img
                        src={"/assets/images/people.png"}
                        alt="Logo ComuniApp"
                        className="w-16 h-16 sm:w-20 sm:h-20 mb-4 drop-shadow-md"
                    />
                    <h2 className="text-xl sm:text-2xl font-semibold text-brown-700 text-center">
                        Crear cuenta
                    </h2>
                    <p className="text-sm text-brown-500 text-center">
                        Únete a tu espacio tranquilo
                    </p>
                </div>
                <div className="relative mb-4">
                    <input
                        id="nombre"
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                        placeholder="Nombre de Usuario"
                        className="peer w-full px-4 pt-5 pb-2 border border-yellow-200/50 rounded-xl bg-white/60 text-brown-700 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-300"
                    />
                    <label
                        htmlFor="nombre"
                        className="absolute left-4 top-2 text-sm text-brown-500 transition-all
            peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-brown-400
            peer-focus:top-2 peer-focus:text-sm peer-focus:text-brown-700"
                    >
                        Nombre de Usuario
                    </label>
                </div>

                <div className="relative mb-4">
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="Correo Electrónico"
                        className="peer w-full px-4 pt-5 pb-2 border border-yellow-200/50 rounded-xl bg-white/60 text-brown-700 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-300"
                    />
                    <label
                        htmlFor="email"
                        className="absolute left-4 top-2 text-sm text-brown-500 transition-all
            peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-brown-400
            peer-focus:top-2 peer-focus:text-sm peer-focus:text-brown-700"
                    >
                        Correo Electrónico
                    </label>
                </div>

                <div className="relative mb-4">
                    <input
                        id="contraseña"
                        type="password"
                        value={contraseña}
                        onChange={(e) => setContraseña(e.target.value)}
                        required
                        placeholder="Contraseña"
                        className="peer w-full px-4 pt-5 pb-2 border border-yellow-200/50 rounded-xl bg-white/60 text-brown-700 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-300"
                    />
                    <label
                        htmlFor="contraseña"
                        className="absolute left-4 top-2 text-sm text-brown-500 transition-all
            peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-brown-400
            peer-focus:top-2 peer-focus:text-sm peer-focus:text-brown-700"
                    >
                        Contraseña
                    </label>
                </div>

                <div className="relative mb-4">
                    <input
                        id="confirmarContraseña"
                        type="password"
                        value={confirmarContraseña}
                        onChange={(e) => setConfirmarContraseña(e.target.value)}
                        required
                        placeholder="Confirmar Contraseña"
                        className="peer w-full px-4 pt-5 pb-2 border border-yellow-200/50 rounded-xl bg-white/60 text-brown-700 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-300"
                    />
                    <label
                        htmlFor="confirmarContraseña"
                        className="absolute left-4 top-2 text-sm text-brown-500 transition-all
            peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-brown-400
            peer-focus:top-2 peer-focus:text-sm peer-focus:text-brown-700"
                    >
                        Confirmar Contraseña
                    </label>
                </div>

                <div className="mb-4 flex flex-col gap-2 text-sm text-brown-700">
                    <label htmlFor="voluntario" className="flex items-center gap-2 cursor-pointer">
                        <input
                            id="voluntario"
                            type="checkbox"
                            checked={esVoluntario}
                            onChange={(e) => setEsVoluntario(e.target.checked)}
                            className="accent-yellow-400"
                        />
                        Quiero ser voluntario
                    </label>

                    <label htmlFor="solicitante" className="flex items-center gap-2 cursor-pointer">
                        <input
                            id="solicitante"
                            type="checkbox"
                            checked={esSolicitante}
                            onChange={(e) => setEsSolicitante(e.target.checked)}
                            className="accent-yellow-400"
                        />
                        Quiero ser solicitante
                    </label>
                </div>

                <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-300 to-orange-300 text-brown-700 font-semibold shadow-lg hover:shadow-xl transition"
                >
                    Registrarse
                </button>

                <div className="text-center text-sm text-brown-600 mt-3">
                    ¿Ya tienes cuenta?{" "}
                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="text-brown-700 font-semibold hover:underline"
                    >
                        Inicia sesión
                    </button>
                </div>

                {mensaje && (
                    <p className="mt-4 text-center text-sm text-brown-600">{mensaje}</p>
                )}
            </form>
        </div>
    );
}