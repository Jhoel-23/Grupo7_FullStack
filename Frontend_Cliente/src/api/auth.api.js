import { apiRequest } from "./client.js";
export const iniciarSesionNeon = (correo, password) => apiRequest("/login", {method:"POST",body:{correo,password}});
export const verificarConexionNeon = () => apiRequest("/health");
