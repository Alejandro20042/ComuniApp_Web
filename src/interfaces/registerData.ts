export interface RegisterData {
  nombre: string;
  email: string;
  contraseña: string;
  tipoUsuario: "voluntario" | "solicitante";
}