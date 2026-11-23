import { Router } from "express";
import { autenticar } from "../middlewares/auth.js";
import * as controller from "../controllers/comun.controller.js";
export const router=Router();
router.post("/:modulo/admin/clientes",autenticar,controller.registrarCliente);
