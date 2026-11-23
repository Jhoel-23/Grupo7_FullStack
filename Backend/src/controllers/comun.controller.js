import { registrarCliente as registrar } from "../services/comun.service.js";
import { asyncController } from "./asyncController.js";
export const registrarCliente = asyncController(req => registrar(req.usuarioId, req.params.modulo, req.body), 201);
