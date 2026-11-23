import * as service from "../services/banco.service.js";
import { asyncController } from "./asyncController.js";
export const abrirCuenta = asyncController(req => service.abrirCuenta(req.usuarioId), 201);
export const depositar = asyncController(req => service.depositar(req.usuarioId, req.body), 201);
export const misCuentas = asyncController(req => service.misCuentas(req.usuarioId));
export const operacionesDia = asyncController(req => service.operacionesDia(req.usuarioId, req.query.fecha));
export const panelBanco = asyncController(req => service.panelBanco(req.usuarioId));
export const actualizarClienteBanco = asyncController(req => service.actualizarClienteBanco(req.usuarioId, req.params.id, req.body));
