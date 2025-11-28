export interface Solicitud {
  id: number;
  solicitanteId: number;
  titulo: string;
  descripcion: string;
  ubicacion: string;
  estado: "pendiente" | "en progreso" | "completada" | "finalizada";
  fechaCreacion?: string | number;
  voluntarioId?: number;
  solicitanteNombre?: string;
  voluntarioNombre?: string;
}
