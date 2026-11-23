import { apiRequest } from "./client.js";
export function registrarClienteAdminNeon(token,modulo,cliente) {
 if(!["banco","farmacia"].includes(modulo)) throw new Error("Módulo no válido");
 return apiRequest(`/${modulo}/admin/clientes`,{method:"POST",token,body:cliente});
}
