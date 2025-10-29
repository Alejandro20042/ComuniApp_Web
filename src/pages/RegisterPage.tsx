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
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form
                onSubmit={sendSubmit}
                className="bg-white p-8 rounded-2xl shadow-md w-96"
            >
                <h2 className="text-2xl font-bold mb-6 text-center text-green-600">
                    Crear cuenta
                </h2>

                <label className="block mb-2 font-medium">Nombre de Usuario</label>
                <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full border p-2 rounded mb-4"
                    required
                />

                <label className="block mb-2 font-medium">Correo Electronico</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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

                <label className="block mb-2 font-medium">Confirmar contraseña</label>
                <input
                    type="password"
                    value={confirmarContraseña}
                    onChange={(e) => setConfirmarContraseña(e.target.value)}
                    className="w-full border p-2 rounded mb-4"
                    required
                />

                <div className="mb-4 flex flex-col gap-2">
                    <label>
                        <input
                            type="checkbox"
                            checked={esVoluntario}
                            onChange={(e) => setEsVoluntario(e.target.checked)}
                        />{" "}
                        Quiero ser voluntario
                    </label>

                    <label>
                        <input
                            type="checkbox"
                            checked={esSolicitante}
                            onChange={(e) => setEsSolicitante(e.target.checked)}
                        />{" "}
                        Quiero ser solicitante
                    </label>
                </div>

                <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                >
                    Registrarse
                </button>

                <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="w-full mt-2 bg-gray-300 text-black py-2 rounded hover:bg-gray-400"
                >
                    Iniciar Sesion
                </button>

                {mensaje && <p className="mt-4 text-center text-gray-700">{mensaje}</p>}
            </form>
        </div>
    );
}
