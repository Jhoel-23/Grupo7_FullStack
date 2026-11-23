import { query } from "../config/db.js";
export async function listarImagenes() {
  const r = await query("SELECT id, nombre, mime_type, tamano_bytes, fecha FROM farmacia_imagenes ORDER BY fecha DESC, id DESC LIMIT 60");
  return r.rows;
}
export async function obtenerImagen(id) {
  const r = await query("SELECT id, objeto_key, mime_type FROM farmacia_imagenes WHERE id=$1", [id]);
  return r.rows[0];
}
export async function guardarImagen({ key, nombre, tipo, tamano, usuarioId }) {
  const r = await query("INSERT INTO farmacia_imagenes (objeto_key,nombre,mime_type,tamano_bytes,usuario_id) VALUES ($1,$2,$3,$4,$5) RETURNING id, nombre, mime_type, fecha", [key,nombre,tipo,tamano,usuarioId]);
  return r.rows[0];
}
