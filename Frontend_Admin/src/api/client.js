/** HTTP único para ambos portales. Sólo Node/Express conoce la clave de Neon. */
/** Durante desarrollo Vite usa proxy /api; en Vercel apunta a Render via VITE_API_URL. */
const apiOrigin = (import.meta.env?.VITE_API_URL || "").replace(/\/$/, "");
export const apiUrl = (path) => `${apiOrigin}/api${path}`;
export async function apiRequest(path, { method = "GET", token, body } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";
  let respuesta;
  try {
    respuesta = await fetch(apiUrl(path), {
      method, headers,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {})
    });
  } catch {
    throw new Error("No se pudo conectar con la API. Verifica VITE_API_URL (Render) o el backend local.");
  }
  const contenido = await respuesta.text();
  let datos;
  try { datos = contenido ? JSON.parse(contenido) : {}; }
  catch { throw new Error("El servidor no devolvió JSON válido"); }
  if (!respuesta.ok) throw new Error(datos.error || `Error HTTP ${respuesta.status}`);
  return datos;
}
