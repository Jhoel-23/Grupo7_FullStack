/** Controla página y límites sin depender del servidor, adecuado para ~200 registros. */
export function paginarLista(items, pagina = 1, porPagina = 10, totalOverride) {
  const total = totalOverride === undefined ? items.length : totalOverride;
  const limite = Number.isFinite(porPagina) && porPagina > 0 ? Math.floor(porPagina) : 10;
  const totalPaginas = Math.max(1, Math.ceil(total / limite));
  const paginaActual = Math.min(totalPaginas, Math.max(1, Math.floor(Number(pagina) || 1)));
  const inicio = total ? (paginaActual - 1) * limite + 1 : 0;
  const fin = Math.min(total, paginaActual * limite);
  return { items: items.slice((paginaActual - 1) * limite, paginaActual * limite), total, inicio, fin, totalPaginas, paginaActual };
}

/** Solo enseña las páginas cercanas, con saltos al inicio y al final. */
export function paginasVisibles(actual, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const visibles = new Set([1, total]);
  for (let i = Math.max(2, actual - 1); i <= Math.min(total - 1, actual + 1); i++) visibles.add(i);
  const numeros = [...visibles].sort((a, b) => a - b);
  const salida = [];
  numeros.forEach((n, i) => { if (i && n - numeros[i - 1] > 1) salida.push("…"); salida.push(n); });
  return salida;
}
