import { randomUUID } from "node:crypto";
import { HttpError } from "../utils/HttpError.js";
import { objectRequest, storageConfigurado } from "../config/storage.js";
import * as repositorio from "../repositories/imagenes.repository.js";

const extensions = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };
export function validarImagen(tipo, buffer) {
  if (!extensions[tipo]) throw new HttpError(415, "Se permiten solo imagenes PNG, JPG o WebP");
  if (!Buffer.isBuffer(buffer) || !buffer.length || buffer.length > 5 * 1024 * 1024) throw new HttpError(413, "La imagen debe tener entre 1 byte y 5 MB");
  const png = tipo === "image/png" && buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  const jpg = tipo === "image/jpeg" && buffer.subarray(0,3).equals(Buffer.from([255,216,255]));
  const webp = tipo === "image/webp" && buffer.subarray(0,4).toString() === "RIFF" && buffer.subarray(8,12).toString() === "WEBP";
  if (!(png || jpg || webp)) throw new HttpError(415, "El contenido no corresponde al tipo de imagen declarado");
}
export const estadoStorage = () => ({ configurado: storageConfigurado() });
export async function listar() { return repositorio.listarImagenes(); }
export async function subir(tipo, contenido, nombre, usuarioId) {
  validarImagen(tipo, contenido);
  if (!storageConfigurado()) throw new HttpError(503,"Object Storage no configurado");
  const key = `farmacia/${randomUUID()}.${extensions[tipo]}`;
  await objectRequest("PUT", key, { data: contenido, contentType: tipo });
  // Registrar la referencia en Neon, sin guardar bytes de imagen en Postgres.
  // Si Postgres falla, eliminar el objeto recien subido para evitar huérfanos.
  try {
    return await repositorio.guardarImagen({ key, nombre: String(nombre || "Imagen de farmacia").slice(0,120), tipo, tamano: contenido.length, usuarioId });
  } catch (error) {
    try { await objectRequest("DELETE", key); } catch (cleanupError) { console.error("No se pudo revertir imagen", cleanupError.message); }
    throw error;
  }
}
export async function contenidoImagen(id) {
  const item = await repositorio.obtenerImagen(id);
  if (!item) throw new HttpError(404,"Imagen no encontrada");
  const response = await objectRequest("GET", item.objeto_key);
  return { response, tipo: item.mime_type };
}
