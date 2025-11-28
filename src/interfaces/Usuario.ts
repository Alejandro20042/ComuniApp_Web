export interface Usuario {
    id: number;
    nombre: string;
    tipoUsuario: "voluntario" | "solicitante";
    email: string;
    voluntarioId: number | null;
    bio?: string;
    telefono?: string;
    ubicacion?: string;
    organizacion?: string;
}

