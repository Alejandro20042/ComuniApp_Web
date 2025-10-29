export interface Usuario {
     id: number;
    nombre: string;
    tipoUsuario: "voluntario" | "solicitante";
    email: string;
}