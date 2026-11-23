import { paginarLista, paginasVisibles } from "../utils/paginacion.js";
import "../styles/paginacion.css";

/** Navegación accesible para listados cargados desde la API. */
export default function Paginador({ total, pagina, porPagina, onPagina, onPorPagina, opciones = [10, 20, 50], sustantivo = "registros" }) {
  const datos = paginarLista([], pagina, porPagina, total);
  const { totalPaginas, paginaActual, inicio, fin } = datos;
  return <nav className="g7-pagination" aria-label={`Paginación de ${sustantivo}`}>
    <p className="g7-pagination-summary" aria-live="polite">
      {total ? `Mostrando ${inicio}–${fin} de ${total} ${sustantivo}` : `0 ${sustantivo}`}
    </p>
    <div className="g7-pagination-actions">
      <label className="g7-page-size">Por página
        <select value={porPagina} onChange={e => onPorPagina(Number(e.target.value))} aria-label={`Cantidad de ${sustantivo} por página`}>
          {opciones.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </label>
      <span className="g7-pagination-count">Página {paginaActual} de {totalPaginas}</span>
      <div className="g7-page-buttons">
        <button type="button" onClick={() => onPagina(1)} disabled={paginaActual === 1} aria-label="Primera página">«</button>
        <button type="button" onClick={() => onPagina(paginaActual - 1)} disabled={paginaActual === 1} aria-label="Página anterior">‹</button>
        {paginasVisibles(paginaActual, totalPaginas).map((p, i) => p === "…" ? <span key={`sep-${i}`} className="g7-page-gap" aria-hidden="true">…</span> :
          <button type="button" key={p} aria-label={`Página ${p}`} aria-current={p === paginaActual ? "page" : undefined} className={p === paginaActual ? "g7-page-active" : ""} onClick={() => onPagina(p)}>{p}</button>)}
        <button type="button" onClick={() => onPagina(paginaActual + 1)} disabled={paginaActual === totalPaginas} aria-label="Página siguiente">›</button>
        <button type="button" onClick={() => onPagina(totalPaginas)} disabled={paginaActual === totalPaginas} aria-label="Última página">»</button>
      </div>
    </div>
  </nav>;
}
