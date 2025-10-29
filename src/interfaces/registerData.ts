export interface RegisterData {
  Nombre: string;
  Email: string;
  Contraseña: string;
  TipoUsuario: "voluntario" | "solicitante";
}