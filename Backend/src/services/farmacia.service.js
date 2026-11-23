import * as repository from "../repositories/farmacia.repository.js";
import { exigir, idValido } from "../utils/HttpError.js";
import * as productos from "./productos.service.js";

async function permiso(consulta, usuarioId, mensaje) {
  const filas = await consulta(usuarioId);
  exigir(filas.length > 0, 403, mensaje);
}
function direccionValida(direccion) {
  return typeof direccion === "string" && direccion.trim().length >= 5 && direccion.trim().length <= 500;
}
export async function crearPedido(usuarioId, datos = {}) {
  await permiso(repository.verificarClienteFarmacia, usuarioId, "No tiene permiso para registrar pedidos");
  const pedido = await productos.crearPedido(usuarioId, datos);
  return { mensaje: "Pedido registrado correctamente", pedido };
}
export async function cancelarPedido(usuarioId,id){
  await permiso(repository.verificarClienteFarmacia,usuarioId,"No tiene permiso para cancelar pedidos");
  const pedido=await productos.cancelarPedido(usuarioId,id);
  return {mensaje:"Pedido cancelado. Stock liberado cuando corresponda.",pedido};
}
export async function pagarDelivery(usuarioId, { pedidoId } = {}) {
  exigir(idValido(pedidoId), 400, "El identificador del pedido no es válido");
  const permisos = await repository.listarRolesParaPago(usuarioId);
  exigir(permisos.some(p=>p.modulo==="farmacia"&&p.rol==="cliente") && permisos.some(p=>p.modulo==="banco"&&p.rol==="cliente"),
    403,"No tiene permisos para realizar el pago");
  // El procedimiento PostgreSQL mantiene descuento, abono y estado en una transacción atómica.
  const resultado = await repository.procesarPagoBancario(Number(pedidoId), usuarioId);
  return { mensaje: "Pago realizado correctamente", pago: resultado[0].pago };
}
export async function pedidoPendiente(usuarioId) {
  await permiso(repository.verificarClienteFarmacia, usuarioId, "No tiene permiso para consultar pedidos");
  const pedidos = await repository.buscarPedidoPendiente(usuarioId);
  return { pedido: pedidos[0] || null };
}
export async function cobros(usuarioId) {
  await permiso(repository.verificarAdminCobros, usuarioId, "No tiene permiso para consultar cobros");
  const cuentas = await repository.listarCuentasEmpresa(usuarioId);
  exigir(cuentas.length > 0, 404, "No se encontró la cuenta empresarial");
  const [movimientos, totalesDiarios] = await Promise.all([
    repository.listarAbonosEmpresa(usuarioId), repository.resumenCobrosDiarios(usuarioId)
  ]);
  return { cuentas, movimientos, totalesDiarios, resumen: {
    saldoTotal: cuentas.reduce((a,c) => a+Number(c.saldo),0),
    totalCobrado: movimientos.reduce((a,o) => a+Number(o.monto),0),
    cantidadCobros: movimientos.length
  }};
}
export async function despachos(usuarioId) {
  await permiso(repository.verificarEmpleadoDespacho, usuarioId, "No tiene permiso para consultar despachos");
  return { pedidos: await repository.listarPedidosParaDespacho() };
}
export async function marcarDespacho(usuarioId, id) {
  exigir(idValido(id), 400, "Identificador de pedido inválido");
  await permiso(repository.verificarEmpleadoDespachar, usuarioId, "No tiene permiso para despachar");
  const pedidos = await repository.despacharSiPagado(usuarioId, Number(id));
  exigir(pedidos.length > 0, 409, "Solo se pueden despachar pedidos pagados");
  return { mensaje: "Pedido despachado correctamente", pedido: pedidos[0] };
}
export async function pedidosAdmin(usuarioId) {
  await permiso(repository.verificarAdministradorPedidos, usuarioId, "No tiene permiso para consultar pedidos");
  return { pedidos: await repository.listarPedidosAdministracion() };
}
export async function actualizarPedido(usuarioId, id, { direccion } = {}) {
  exigir(idValido(id), 400, "Identificador de pedido inválido");
  exigir(direccionValida(direccion), 400, "Ingrese una dirección válida");
  await permiso(repository.verificarAdministradorModificar, usuarioId, "No tiene permiso para actualizar pedidos");
  const pedidos = await repository.actualizarDireccionPendiente(direccion.trim(), usuarioId, Number(id));
  exigir(pedidos.length > 0, 409, "Solo se pueden modificar pedidos pendientes");
  return { mensaje: "Pedido actualizado correctamente", pedido: pedidos[0] };
}
