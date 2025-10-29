export interface Solicitud {
  id: number;
  titulo: string;
  descripcion: string;
  ubicacion: string;
  estado: "pendiente" | "en progreso" | "completada";
  fechaCreacion: string;
}
