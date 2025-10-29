import type { Solicitud } from "../interfaces/Solicitud";
import api from "./axios";

export const getSolicitudes = async (): Promise<Solicitud[]> => {
  const res = await api.get<Solicitud[]>("/solicitudes");
  return res.data;
};
