import * as repository from "../repositories/banco.repository.js";
import { exigir, idValido } from "../utils/HttpError.js";

async function permiso(consulta, usuarioId, mensaje) {
  const filas = await consulta(usuarioId);
  exigir(filas.length > 0, 403, mensaje);
}
export async function abrirCuenta(usuarioId) {
  await permiso(repository.verificarRolCliente, usuarioId, "No tiene permiso para abrir cuentas");
  const existentes = await repository.buscarCuentaAhorros(usuarioId);
  exigir(existentes.length === 0, 409, "Ya tiene una cuenta de ahorros registrada");
  const cuentas = await repository.crearCuentaAhorros(usuarioId);
  return { mensaje: "Cuenta abierta correctamente", cuenta: cuentas[0] };
}
export async function depositar(usuarioId, { numero, monto } = {}) {
  await permiso(repository.verificarRolCajero, usuarioId, "No tiene permiso para registrar depósitos");
  exigir(typeof numero === "string" && numero.trim().length > 0 && typeof monto === "string" && /^\d{1,9}(\.\d{1,2})?$/.test(monto) && Number(monto) > 0,
    400, "Ingrese una cuenta y un monto válido");
  const operaciones = await repository.registrarDepositoAtomico(monto, numero.trim(), monto);
  exigir(operaciones.length > 0, 404, "La cuenta bancaria no existe");
  return { mensaje: "Depósito registrado correctamente", operacion: operaciones[0] };
}
export async function misCuentas(usuarioId) {
  await permiso(repository.verificarClienteCuentas, usuarioId, "No tiene permiso para consultar cuentas");
  const [cuentas, movimientos] = await Promise.all([
    repository.listarCuentasDeUsuario(usuarioId), repository.listarMovimientosDeUsuario(usuarioId)
  ]);
  return { cuentas, movimientos };
}
export async function operacionesDia(usuarioId, fecha) {
  await permiso(repository.verificarCajeroOperaciones, usuarioId, "No tiene permiso para consultar operaciones");
  exigir(typeof fecha === "string" && /^\d{4}-\d{2}-\d{2}$/.test(fecha) && !Number.isNaN(Date.parse(`${fecha}T00:00:00Z`)) && new Date(`${fecha}T00:00:00Z`).toISOString().slice(0,10) === fecha,
    400, "Ingrese una fecha válida");
  const [operaciones, resumen] = await Promise.all([
    repository.listarOperacionesPorDia(fecha), repository.resumenOperacionesPorDia(fecha)
  ]);
  return { fecha, operaciones, resumen: resumen[0] };
}
export async function panelBanco(usuarioId) {
  await permiso(repository.verificarAdministradorBanco, usuarioId, "No tiene permiso para administrar el banco");
  const [clientes, cuentas, operaciones, resumen] = await Promise.all([
    repository.listarClientesBanco(), repository.listarCuentasBanco(), repository.listarOperacionesBanco(), repository.resumenGeneralBanco()
  ]);
  return { clientes, cuentas, operaciones, resumen: {
    totalClientes: clientes.length, totalCuentas: cuentas.length,
    saldoTotal: cuentas.reduce((total, cuenta) => total + Number(cuenta.saldo),0),
    cantidadOperaciones: resumen[0].cantidad_operaciones, depositos: resumen[0].depositos,
    pagos: resumen[0].pagos, abonos: resumen[0].abonos
  }};
}
export async function actualizarClienteBanco(usuarioId, id, { nombre, apellido } = {}) {
  exigir(idValido(id), 400, "Identificador de cliente inválido");
  exigir(typeof nombre === "string" && typeof apellido === "string" &&
    nombre.trim().length >= 2 && apellido.trim().length >= 2 &&
    nombre.trim().length <= 100 && apellido.trim().length <= 100,
    400, "Ingrese nombres y apellidos válidos");
  await permiso(repository.verificarAdministradorEditar, usuarioId, "No tiene permiso para actualizar clientes");
  const clientes = await repository.actualizarDatosCliente(nombre.trim(), apellido.trim(), Number(id), Number(id));
  exigir(clientes.length > 0, 404, "Cliente bancario no encontrado");
  return { mensaje: "Cliente actualizado correctamente", cliente: clientes[0] };
}
