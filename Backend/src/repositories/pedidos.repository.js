import { query } from "../config/db.js";
export async function buscarPedidoPorCodigo(codigo){
 const r=await query(`SELECT id,id_usuario,codigo,producto,producto_id,cantidad,precio_unitario,direccion,total,estado,fecha,id_operacion
 FROM pedidos_delivery_farmacia WHERE codigo=$1 LIMIT 1`,[codigo]);
 return r.rows[0];
}
export async function buscarHistorial(pedidoId){
 const r=await query(`SELECT h.id,h.estado_anterior,h.estado,h.detalle,h.fecha,
  concat_ws(' ',u.nombre,u.apellido) AS actor FROM pedido_estados h
 LEFT JOIN usuarios u ON u.id=h.actor_usuario_id WHERE h.pedido_id=$1 ORDER BY h.fecha ASC,h.id ASC`,[pedidoId]);
 return r.rows;
}
