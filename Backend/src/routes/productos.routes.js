import { Router } from "express";
import { autenticar } from "../middlewares/auth.js";
import { requireRol } from "../middlewares/requireRol.js";
import * as ctl from "../controllers/productos.controller.js";
export const router=Router();
router.get("/farmacia/productos",ctl.listar);
router.get("/farmacia/admin/productos",autenticar,requireRol("farmacia",["administrador"]),ctl.listarAdmin);
router.post("/farmacia/admin/productos",autenticar,requireRol("farmacia",["administrador"]),ctl.crear);
router.put("/farmacia/admin/productos/:id",autenticar,requireRol("farmacia",["administrador"]),ctl.modificar);
