/** Validación de usabilidad: el backend vuelve a comprobar MIME, tamaño y firma. */
export const MAX_IMAGEN_BYTES = 5 * 1024 * 1024;
export const TIPOS_IMAGEN = Object.freeze(["image/jpeg", "image/png", "image/webp"]);

export async function validarArchivoImagen(archivo) {
  if (!archivo) return "Selecciona una fotografía del medicamento.";
  if (!TIPOS_IMAGEN.includes(archivo.type)) return "Solo se permiten imágenes JPG, PNG o WebP.";
  if (!archivo.size || archivo.size > MAX_IMAGEN_BYTES) return "La imagen debe tener un tamaño de hasta 5 MB.";
  try {
    const datos = new Uint8Array(await archivo.slice(0, 16).arrayBuffer());
    const png = archivo.type === "image/png" &&
      [137, 80, 78, 71, 13, 10, 26, 10].every((b, i) => datos[i] === b);
    const jpeg = archivo.type === "image/jpeg" &&
      datos[0] === 255 && datos[1] === 216 && datos[2] === 255;
    const webp = archivo.type === "image/webp" &&
      [82, 73, 70, 70].every((b, i) => datos[i] === b) &&
      [87, 69, 66, 80].every((b, i) => datos[i + 8] === b);
    if (!(png || jpeg || webp)) return "El archivo no contiene una imagen válida del formato indicado.";
    return null;
  } catch {
    return "No se pudo leer la fotografía seleccionada. Prueba con otra imagen.";
  }
}
