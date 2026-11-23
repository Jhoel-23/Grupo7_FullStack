import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "../styles/confirmacion.css";

const ConfirmacionContext = createContext(null);

/**
 * confirmacion({ titulo, descripcion, detalles, accion, variante }) devuelve true/false.
 * No ejecuta operaciones: cada pantalla solo ejecuta su acción después de obtener true.
 */
export function ConfirmacionProvider({ children }) {
  const [solicitud, setSolicitud] = useState(null);
  const resolverRef = useRef(null);
  const previoRef = useRef(null);
  const cancelarRef = useRef(null);
  const aceptarRef = useRef(null);

  const confirmar = useCallback((opciones) => new Promise(resolve => {
    // Nunca abrir dos confirmaciones superpuestas ni ejecutar dos acciones.
    if (resolverRef.current) { resolve(false); return; }
    previoRef.current = document.activeElement;
    resolverRef.current = resolve;
    setSolicitud({
      titulo: "Confirmar operación",
      descripcion: "Revisa los datos antes de continuar.",
      detalles: [],
      accion: "Sí, confirmar",
      variante: "normal",
      ...opciones
    });
  }), []);

  const responder = useCallback((aceptada) => {
    const resolver = resolverRef.current;
    resolverRef.current = null;
    setSolicitud(null);
    resolver?.(aceptada);
    // Conserva el foco en el botón que inició la operación.
    requestAnimationFrame(() => previoRef.current?.focus?.());
  }, []);

  useEffect(() => {
    if (!solicitud) return undefined;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelarRef.current?.focus();
    const onKey = e => {
      if (e.key === "Escape") { e.preventDefault(); responder(false); }
      if (e.key !== "Tab") return;
      const primero = cancelarRef.current;
      const ultimo = aceptarRef.current;
      if (!primero || !ultimo) return;
      if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = anterior;
      document.removeEventListener("keydown", onKey);
    };
  }, [solicitud, responder]);

  // Evita dejar una Promise sin resolver si el proveedor se desmonta.
  useEffect(() => () => {
    resolverRef.current?.(false);
    resolverRef.current = null;
  }, []);

  return <ConfirmacionContext.Provider value={confirmar}>
    {children}
    {solicitud && createPortal(
      <div className="g7-confirm-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) responder(false); }}>
        <section className="g7-confirm-dialog" role="alertdialog" aria-modal="true"
          aria-labelledby="g7-confirm-titulo" aria-describedby="g7-confirm-descripcion">
          <div className={`g7-confirm-icon ${solicitud.variante === "peligro" ? "g7-confirm-danger" : ""}`} aria-hidden="true">
            {solicitud.variante === "peligro" ? "!" : "✓"}
          </div>
          <p className="g7-confirm-eyebrow">GRUPO 7 · CONFIRMACIÓN</p>
          <h2 id="g7-confirm-titulo">{solicitud.titulo}</h2>
          <p id="g7-confirm-descripcion" className="g7-confirm-description">{solicitud.descripcion}</p>
          {solicitud.detalles?.length > 0 && <dl className="g7-confirm-details">
            {solicitud.detalles.map(([clave, valor], i) => <div key={`${clave}-${i}`}>
              <dt>{clave}</dt><dd>{String(valor)}</dd>
            </div>)}
          </dl>}
          <p className="g7-confirm-footnote">La operación se realizará únicamente si eliges confirmar.</p>
          <div className="g7-confirm-actions">
            <button ref={cancelarRef} type="button" className="g7-confirm-cancel" onClick={() => responder(false)}>Volver</button>
            <button ref={aceptarRef} type="button"
              className={`g7-confirm-accept ${solicitud.variante === "peligro" ? "g7-confirm-accept-danger" : ""}`}
              onClick={() => responder(true)}>{solicitud.accion}</button>
          </div>
        </section>
      </div>, document.body)}
  </ConfirmacionContext.Provider>;
}

export function useConfirmacion() {
  const confirmar = useContext(ConfirmacionContext);
  if (!confirmar) throw new Error("useConfirmacion requiere ConfirmacionProvider");
  return confirmar;
}
