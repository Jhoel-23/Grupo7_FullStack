// Funciones compartidas de presentación: nunca calculan el precio ni el saldo en el navegador.
export function fechaLocal(fecha) {
  return fecha ? new Date(fecha).toLocaleString("es-PE") : "Sin fecha";
}
export function soles(monto) {
  return `S/ ${Number(monto || 0).toFixed(2)}`;
}
