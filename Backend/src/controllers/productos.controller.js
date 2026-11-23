import * as service from "../services/productos.service.js";
import { asyncController } from "./asyncController.js";
export const listar = asyncController(()=>service.listarPublicos());
export const listarAdmin = asyncController(()=>service.listarAdministracion());
export const crear = asyncController(req=>service.crear(req.body),201);
export const modificar = asyncController(req=>service.modificar(req.params.id,req.body));
