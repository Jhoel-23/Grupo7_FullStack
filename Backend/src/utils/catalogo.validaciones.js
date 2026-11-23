import { exigir, idValido } from "./HttpError.js";

export function normalizarProducto(data) {
  exigir(data && typeof data === "object" && !Array.isArray(data),400,"Datos de medicamento inválidos");
  const sku=String(data.sku||"").trim().toUpperCase();
  const nombre=String(data.nombre||"").trim();
  const descripcion=String(data.descripcion||"").trim();
  const precio=String(data.precio??"").trim();
  const stock=Number(data.stock);
  const activo=data.activo === undefined ? true : data.activo;
  const imagenId = data.imagenId === "" || data.imagenId == null ? null : Number(data.imagenId);
  exigir(/^[A-Z0-9][A-Z0-9_-]{2,39}$/.test(sku),400,"SKU inválido: 3 a 40 letras/números");
  exigir(nombre.length>=3 && nombre.length<=150,400,"Nombre: 3 a 150 caracteres");
  exigir(descripcion.length<=1000,400,"Descripción: máximo 1000 caracteres");
  exigir(/^(?:[1-9]\d{0,5}|0)(?:\.\d{1,2})?$/.test(precio) && Number(precio)>0,400,"Precio inválido (máximo dos decimales)");
  exigir(Number.isSafeInteger(stock)&&stock>=0&&stock<=1000000,400,"Stock inválido");
  exigir(typeof activo==="boolean",400,"Estado del medicamento inválido");
  exigir(imagenId===null||idValido(imagenId),400,"Imagen seleccionada inválida");
  return {sku,nombre,descripcion,precio,stock,activo,imagenId};
}

export function validarSolicitudPedido(data) {
  exigir(data && typeof data==="object" && !Array.isArray(data),400,"Datos de pedido inválidos");
  const permitidas=["productoId","cantidad","direccion"];
  exigir(Object.keys(data).every(k=>permitidas.includes(k)),400,"No está permitido enviar o modificar productos, precios ni totales desde el cliente");
  const productoId=Number(data.productoId),cantidad=Number(data.cantidad),direccion=data.direccion;
  exigir(idValido(productoId),400,"Selecciona un medicamento del catálogo");
  exigir(Number.isSafeInteger(cantidad)&&cantidad>=1&&cantidad<=100,400,"Cantidad inválida (1 a 100)");
  exigir(typeof direccion==="string"&&direccion.trim().length>=5&&direccion.trim().length<=500,400,"Dirección inválida");
  return {productoId,cantidad,direccion:direccion.trim()};
}
