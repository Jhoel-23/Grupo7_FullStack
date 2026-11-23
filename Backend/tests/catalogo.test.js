import test from "node:test";
import assert from "node:assert/strict";
import { normalizarProducto,validarSolicitudPedido } from "../src/utils/catalogo.validaciones.js";

test("Valida el catálogo y precios con máximo dos decimales",()=>{
  const p=normalizarProducto({sku:" para500x20 ",nombre:"Paracetamol 500 mg",descripcion:"Ejemplo",precio:"24.50",stock:25,imagenId:null,activo:true});
  assert.equal(p.sku,"PARA500X20"); assert.equal(p.precio,"24.50");assert.equal(p.stock,25);
  assert.throws(()=>normalizarProducto({...p,precio:"0"}),/Precio inválido/);
  assert.throws(()=>normalizarProducto({...p,precio:"1.001"}),/Precio inválido/);
  assert.throws(()=>normalizarProducto({...p,stock:-1}),/Stock inválido/);
  assert.throws(()=>normalizarProducto({...p,imagenId:-4}),/Imagen/);
});
test("El pedido solo acepta productoId, cantidad y dirección: nunca total/precio",()=>{
  assert.deepEqual(validarSolicitudPedido({productoId:"7",cantidad:2,direccion:"Av. Los Pinos 102"}),{productoId:7,cantidad:2,direccion:"Av. Los Pinos 102"});
  for (const extra of [{total:1},{precio:"0.01"},{producto:"pirata"},{precioUnitario:0.01}]) {
    assert.throws(()=>validarSolicitudPedido({productoId:7,cantidad:2,direccion:"Jr. Lima 123",...extra}),/No está permitido/);
  }
  assert.throws(()=>validarSolicitudPedido({productoId:1,cantidad:0,direccion:"Jr. Lima 123"}),/Cantidad/);
  assert.throws(()=>validarSolicitudPedido({productoId:1,cantidad:2.5,direccion:"Jr. Lima 123"}),/Cantidad/);
});
