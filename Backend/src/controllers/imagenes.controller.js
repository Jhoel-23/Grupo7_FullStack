import { Readable } from "node:stream";
import * as service from "../services/imagenes.service.js";
import { HttpError } from "../utils/HttpError.js";

export const estado = (req,res) => res.json(service.estadoStorage());
export async function listar(req,res,next) {
  try { res.json({ imagenes: await service.listar() }); } catch (e) { next(e); }
}
export async function subir(req,res,next) {
  try {
    const name = req.get("x-file-name") || "imagen";
    // El cliente envia encodeURIComponent(nombre) porque el header debe ser ASCII.
    let nombre = name;
    try { nombre = decodeURIComponent(name); } catch { /* no confiar en headers invalidos */ }
    const imagen = await service.subir(req.get("content-type")?.split(";")[0], req.body, nombre, req.usuarioId);
    res.status(201).json({ imagen, mensaje: "Imagen guardada en Object Storage" });
  } catch (error) { next(error); }
}
export async function descargar(req,res,next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1) throw new HttpError(400,"ID de imagen no valido");
    const { response, tipo } = await service.contenidoImagen(id);
    res.set("Content-Type",tipo);
    res.set("X-Content-Type-Options","nosniff");
    res.set("Cache-Control","public, max-age=300");
    if (!response.body) throw new HttpError(502,"Object Storage devolvio un archivo vacio");
    const stream = Readable.fromWeb(response.body);
    stream.on("error", error => { if (!res.headersSent) next(error); else res.destroy(error); });
    stream.pipe(res);
  } catch (e) { next(e); }
}
