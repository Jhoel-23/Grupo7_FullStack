import { buscarPedidoPorCodigo, buscarHistorial } from "../repositories/pedidos.repository.js";
import { rolesDeUsuario } from "../repositories/usuarios.repository.js";
export async function consultar(codigo,usuarioId){
 if(typeof codigo!=="string"|| !/^PDF-\d{1,10}$/.test(codigo)) return {error:"Código de pedido inválido",status:400};
 const pedido=await buscarPedidoPorCodigo(codigo);
 if(!pedido) return {error:"Pedido no encontrado",status:404};
 const roles=await rolesDeUsuario(usuarioId);
 const personalFarmacia=roles.some(r=>r.modulo==="farmacia"&&["administrador","empleado"].includes(r.rol));
 if(pedido.id_usuario!==usuarioId&&!personalFarmacia) return {error:"No tiene permiso para consultar este pedido",status:403};
 return {pedido,historial:await buscarHistorial(pedido.id)};
}
