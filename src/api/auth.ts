import type { LoginData } from "../interfaces/loginData";
import type { RegisterData } from "../interfaces/registerData";
import api from "./axios";

export const login = async (data: LoginData) => {
  const res = await api.post("/login", data);
  return res.data;
};

export const register = async (data: RegisterData) => {
  const res = await api.post("/registro", data);
  return res.data;
};
