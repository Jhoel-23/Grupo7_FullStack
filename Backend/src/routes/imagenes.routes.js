import { Router, raw } from "express";
import { autenticar } from "../middlewares/auth.js";
import { requireRol } from "../middlewares/requireRol.js";
import * as ctl from "../controllers/imagenes.controller.js";
export const router = Router();
router.get("/farmacia/imagenes/estado", autenticar, requireRol("farmacia", ["administrador"]), ctl.estado);
router.get("/farmacia/imagenes", ctl.listar);
router.get("/farmacia/imagenes/:id/archivo", ctl.descargar);
router.post("/farmacia/imagenes", autenticar, requireRol("farmacia", ["administrador"]),
  raw({ type: ["image/png", "image/jpeg", "image/webp"], limit: "5mb" }), ctl.subir);
