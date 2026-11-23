import * as repository from "../repositories/comun.repository.js";
import bcrypt from "bcryptjs";
import { exigir } from "../utils/HttpError.js";
export async function registrarCliente(usuarioId, modulo, { nombre, apellido, dni, correo, password } = {}) {
  exigir(["farmacia","banco"].includes(modulo), 400, "Módulo no válido");
  const permisos = await repository.verificarAdministradorModulo(usuarioId, modulo);
  exigir(permisos.length>0,403,"No tiene permisos para registrar clientes");
  exigir(typeof nombre === "string" && typeof apellido === "string" &&
    typeof dni === "string" && typeof correo === "string" && typeof password === "string" &&
    nombre.trim().length >= 2 && apellido.trim().length >= 2 &&
    nombre.trim().length <= 100 && apellido.trim().length <= 100 &&
    /^\d{8}$/.test(dni) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo) && password.length >= 6,
    400,"Verifique los datos del cliente");
  const correoNormalizado=correo.trim().toLowerCase();
  const hash=await bcrypt.hash(password,12);
  const resultado=await repository.crearClienteConRol(nombre.trim(), apellido.trim(), dni, correoNormalizado, hash, correoNormalizado, dni, modulo);
  exigir(resultado.length>0,409,"El usuario ya existe, tiene datos distintos o posee un rol en este módulo");
  return { mensaje:"Cliente registrado correctamente", cliente:{...resultado[0], modulo,rol:"cliente"} };
}
