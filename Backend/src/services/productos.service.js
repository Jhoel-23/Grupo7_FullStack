import * as repo from "../repositories/productos.repository.js";
import { HttpError, exigir, idValido } from "../utils/HttpError.js";
import { normalizarProducto,validarSolicitudPedido } from "../utils/catalogo.validaciones.js";

// Valores monetarios se guardan como NUMERIC; SQL, no React, calcula el total.
export async function listarPublicos(){ return {productos:await repo.listarProductos()}; }
export async function listarAdministracion(){ return {productos:await repo.listarProductos({incluirInactivos:true})}; }
export async function crear(data){ return {producto:await repo.crearProducto(normalizarProducto(data))}; }
export async function modificar(id,data){
  exigir(idValido(id),400,"Identificador de producto inválido");
  const prod=await repo.modificarProducto(Number(id),normalizarProducto(data));
  if(!prod) throw new HttpError(404,"Medicamento no encontrado");
  return {producto:prod};
}
export async function crearPedido(usuarioId,data) {
  return repo.crearPedidoConInventario(usuarioId,validarSolicitudPedido(data));
}
export async function cancelarPedido(usuarioId,id){
  exigir(idValido(id),400,"Identificador del pedido inválido");
  return repo.cancelarPedidoPendiente(usuarioId,Number(id));
}
