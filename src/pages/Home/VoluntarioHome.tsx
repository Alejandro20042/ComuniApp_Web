// src/pages/Home/VoluntarioHome.tsx
import React, { useEffect, useState } from "react";
import type { Solicitud } from "../../interfaces/Solicitud";
import axios from "axios";

const VoluntarioHome: React.FC = () => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);


  useEffect(() => {
  const fetchSolicitudes = async () => {
    try {
      const res = await axios.get<Solicitud[]>('https://localhost:5282/api/solicitudes');
      setSolicitudes(res.data);
    } catch (err) {
      console.error(err);
      alert("Error al cargar solicitudes");
    }
  };

  fetchSolicitudes();
}, []);

  return (
    <div className="w-full max-w-4xl flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-gray-800">Solicitudes Disponibles</h2>
      {solicitudes.length === 0 ? (
        <p className="text-gray-500">No hay solicitudes disponibles.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {solicitudes.map((s) => (
            <div
              key={s.id}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
            >
              <h3 className="font-semibold text-gray-800">{s.titulo}</h3>
              <p className="text-sm text-gray-500">{s.descripcion}</p>
              <p className="mt-1 text-sm">
                                Estado:{" "}
                                <span
                                    className={
                                        s.estado === "pendiente"
                                            ? "text-yellow-600"
                                            : s.estado === "en progreso"
                                                ? "text-blue-600"
                                                : "text-green-600"
                                    }
                                >
                                    {s.estado}
                                </span>
                            </p>
              <p className="text-xs text-gray-400">Creada: {new Date(s.fechaCreacion).toLocaleDateString()}</p>
              <button className="mt-2 bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700">
                Tomar Solicitud
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VoluntarioHome;
