import { query, pool } from "../config/db.js";
import { HttpError } from "../utils/HttpError.js";

const columnas = `p.id,p.sku,p.nombre,p.descripcion,p.precio,p.stock,p.activo,
 p.imagen_id,p.fecha_creacion,p.fecha_actualizacion`;
export async function listarProductos({ incluirInactivos = false } = {}) {
  const r = await query(`SELECT ${columnas} FROM farmacia_productos p
    WHERE ($1::boolean = TRUE OR p.activo = TRUE)
    ORDER BY p.nombre ASC,p.id ASC`, [incluirInactivos]);
  return r.rows;
}
export async function crearProducto({ sku,nombre,descripcion,precio,stock,activo,imagenId }) {
  const r = await query(`INSERT INTO farmacia_productos
      (sku,nombre,descripcion,precio,stock,activo,imagen_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *`,[sku,nombre,descripcion,precio,stock,activo,imagenId]);
  return r.rows[0];
}
export async function modificarProducto(id,{ sku,nombre,descripcion,precio,stock,activo,imagenId }) {
  const r = await query(`UPDATE farmacia_productos SET
      sku=$2,nombre=$3,descripcion=$4,precio=$5,stock=$6,activo=$7,imagen_id=$8,
      fecha_actualizacion=NOW()
      WHERE id=$1 RETURNING *`,[id,sku,nombre,descripcion,precio,stock,activo,imagenId]);
  return r.rows[0];
}
export async function crearPedidoConInventario(usuarioId,{productoId,cantidad,direccion}) {
  const client=await pool.connect();
  try {
    await client.query("BEGIN");
    // Serializa los pedidos del mismo cliente y evita reservas duplicadas.
    await client.query("SELECT pg_advisory_xact_lock(717, $1)",[usuarioId]);
    const pendiente=await client.query(`SELECT codigo FROM pedidos_delivery_farmacia
      WHERE id_usuario=$1 AND estado='pendiente' LIMIT 1`,[usuarioId]);
    if(pendiente.rowCount) throw new HttpError(409,`Tienes un pedido pendiente (${pendiente.rows[0].codigo}). Págalo o cancélalo antes de crear otro.`);
    const encontrado=await client.query(`SELECT id,nombre,precio,stock,activo
      FROM farmacia_productos WHERE id=$1 FOR UPDATE`,[productoId]);
    if(!encontrado.rowCount||!encontrado.rows[0].activo) throw new HttpError(404,"El medicamento no está disponible");
    const prod=encontrado.rows[0];
    if(prod.stock<cantidad) throw new HttpError(409,`Stock insuficiente. Disponible: ${prod.stock}`);
    await client.query("UPDATE farmacia_productos SET stock=stock-$2,fecha_actualizacion=NOW() WHERE id=$1",[productoId,cantidad]);
    const sec=await client.query(`SELECT nextval(pg_get_serial_sequence('public.pedidos_delivery_farmacia','id')) AS id`);
    const id=sec.rows[0].id;
    const r=await client.query(`INSERT INTO pedidos_delivery_farmacia
      (id,id_usuario,codigo,producto,producto_id,cantidad,precio_unitario,direccion,total,estado)
      VALUES ($1,$2,'PDF-'||LPAD($1::text,5,'0'),$3,$4,$6,$5,$7,$6*$5,'pendiente')
      RETURNING id,codigo,producto,producto_id,cantidad,precio_unitario,direccion,total,estado`,
      [id,usuarioId,prod.nombre,productoId,prod.precio,cantidad,direccion]);
    await client.query("COMMIT");
    return r.rows[0];
  } catch(error) { await client.query("ROLLBACK"); throw error; }
  finally {client.release();}
}
export async function cancelarPedidoPendiente(usuarioId,id) {
  const client=await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(717, $1)",[usuarioId]);
    const r=await client.query(`SELECT id,codigo,producto_id,cantidad FROM pedidos_delivery_farmacia
      WHERE id=$1 AND id_usuario=$2 AND estado='pendiente' FOR UPDATE`,[id,usuarioId]);
    if(!r.rowCount) throw new HttpError(409,"El pedido no existe, ya se pagó o no se puede cancelar");
    const pedido=r.rows[0];
    if(pedido.producto_id && pedido.cantidad) await client.query(`UPDATE farmacia_productos
      SET stock=stock+$2,fecha_actualizacion=NOW() WHERE id=$1`,[pedido.producto_id,pedido.cantidad]);
    const actualizado=await client.query(`UPDATE pedidos_delivery_farmacia
      SET estado='cancelado', modificado_por=$2 WHERE id=$1 RETURNING id,codigo,estado`,[id,usuarioId]);
    await client.query("COMMIT");
    return actualizado.rows[0];
  } catch(error) { await client.query("ROLLBACK"); throw error; }
  finally {client.release();}
}
