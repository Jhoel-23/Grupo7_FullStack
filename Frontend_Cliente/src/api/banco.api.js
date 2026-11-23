import { apiRequest } from "./client.js";
export const abrirCuentaNeon = token => apiRequest("/banco/abrir-cuenta",{method:"POST",token});
export const registrarDepositoNeon = (token, numero, monto) => apiRequest("/banco/depositar",{method:"POST",token,body:{numero,monto}});
export const consultarCuentasNeon = token => apiRequest("/banco/mis-cuentas",{token});
export const consultarOperacionesDiaNeon = (token,fecha) => apiRequest(`/banco/operaciones-dia?fecha=${encodeURIComponent(fecha)}`,{token});
export const consultarPanelBancoNeon = token => apiRequest("/banco/admin/panel",{token});
export const actualizarClienteBancoNeon = (token,id,nombre,apellido) => apiRequest(`/banco/admin/clientes/${encodeURIComponent(id)}`,{method:"PATCH",token,body:{nombre,apellido}});
