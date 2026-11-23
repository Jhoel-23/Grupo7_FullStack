import test from "node:test";
import assert from "node:assert/strict";
import { validarArchivoImagen } from "../src/utils/validarImagen.js";

const archivo = (type, datos, tamano = datos.length) => ({
  type, size: tamano, slice: () => ({ arrayBuffer: async () => Uint8Array.from(datos).buffer })
});

test("acepta PNG, JPEG y WebP con firmas reales", async () => {
  assert.equal(await validarArchivoImagen(archivo("image/png", [137,80,78,71,13,10,26,10])), null);
  assert.equal(await validarArchivoImagen(archivo("image/jpeg", [255,216,255,224])), null);
  assert.equal(await validarArchivoImagen(archivo("image/webp", [82,73,70,70,0,0,0,0,87,69,66,80])), null);
});
test("rechaza PDFs, SVG, imagen falsa, archivo vacío y tamaño excesivo", async () => {
  assert.match(await validarArchivoImagen(archivo("application/pdf", [37,80,68,70])), /Solo se permiten/);
  assert.match(await validarArchivoImagen(archivo("image/svg+xml", [60,115,118,103])), /Solo se permiten/);
  assert.match(await validarArchivoImagen(archivo("image/png", [37,80,68,70])), /no contiene una imagen válida/);
  assert.match(await validarArchivoImagen(archivo("image/png", [], 0)), /tamaño/);
  assert.match(await validarArchivoImagen(archivo("image/jpeg", [255,216,255], 5*1024*1024+1)), /tamaño/);
});
