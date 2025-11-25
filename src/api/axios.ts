import axios from "axios";

export const api = axios.create({
  baseURL: "https://localhost:5282/api", 
  
});

export default api;
