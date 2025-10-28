import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:5282/api", 
  
});

export default api;
