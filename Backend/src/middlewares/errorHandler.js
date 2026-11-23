import { HttpError } from "../utils/HttpError.js";
export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error.type === "entity.too.large") return res.status(413).json({error:"Archivo demasiado grande (maximo 5 MB)"});
  if (error instanceof HttpError) return res.status(error.status).json({ error: error.message });
  if (error.code === "P0001") return res.status(400).json({ error: error.message });
  if (error.code === "23503") return res.status(400).json({error:"El registro relacionado no existe"});
  if (error.code === "23514" || error.code === "22P02") return res.status(400).json({error:"Datos inválidos"});
  if (error.code === "23505") return res.status(409).json({ error: "El registro ya existe (dato duplicado)" });
  console.error("Error API Grupo 7:", error);
  return res.status(500).json({ error: "Error interno del servidor" });
}
