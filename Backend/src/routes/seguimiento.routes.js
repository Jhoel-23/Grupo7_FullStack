import { Router } from "express";
import { autenticar } from "../middlewares/auth.js";
import { seguimiento } from "../controllers/seguimiento.controller.js";
export const router=Router();
router.get("/farmacia/seguimiento/:codigo",autenticar,seguimiento);
