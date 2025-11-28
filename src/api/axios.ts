import axios from "axios";

export const api = axios.create({
  baseURL: "https://comuniapp-api-1.onrender.com", 
  
});

export default api;
