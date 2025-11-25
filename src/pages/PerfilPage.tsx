import { useEffect, useState } from "react";

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  tipoUsuario: "voluntario" | "solicitante";
  voluntarioId?: number | null;
  solicitanteId?: number | null;
}

export default function PerfilPage() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("usuario");
    if (storedUser) {
      setUsuario(JSON.parse(storedUser));
    }
  }, []);

  if (!usuario) {
    return <div className="p-4 sm:p-6">No hay datos de usuario.</div>;
  }

  return (
    <div className="p-4 sm:p-6 bg-white shadow rounded max-w-xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold mb-4">👤 Perfil</h1>
      <div className="space-y-2 text-sm sm:text-base">
        <p><strong>Nombre:</strong> {usuario.nombre}</p>
        <p><strong>Email:</strong> {usuario.email}</p>
        <p><strong>Tipo de Usuario:</strong> {usuario.tipoUsuario}</p>
        {usuario.voluntarioId && (
          <p><strong>Voluntario ID:</strong> {usuario.voluntarioId}</p>
        )}
        {usuario.solicitanteId && (
          <p><strong>Solicitante ID:</strong> {usuario.solicitanteId}</p>
        )}
      </div>
    </div>
  );
}
