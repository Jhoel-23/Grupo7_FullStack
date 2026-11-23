import { PORTAL } from "../config/portal";

/** Pantalla compartida de acceso y cierre de sesión. */
export default function AccesoAnimado({ fase }) {
  if (fase === "idle") return null;

  const autorizado = fase === "autorizado";
  const saliendo = fase === "saliendo";
  const titulo = saliendo ? "Cerrando sesión" : autorizado ? "Acceso autorizado" : "Verificando credenciales";
  const mensaje = saliendo
    ? "Tu acceso ha finalizado de forma segura. Gracias por utilizar Grupo 7."
    : autorizado ? "Preparando tu espacio de trabajo…" : "Estamos validando tu identidad de forma segura…";

  return (
    <div className="g7-access" role="status" aria-live="polite" aria-atomic="true">
      <div className="g7-access__glow g7-access__glow--one" aria-hidden="true" />
      <div className="g7-access__glow g7-access__glow--two" aria-hidden="true" />
      <section className="g7-access__panel" aria-label={saliendo ? "Cierre de sesión" : "Estado del inicio de sesión"}>
        <div className="g7-access__brand">
          <span className="g7-access__brand-icon" aria-hidden="true">G7</span>
          <span>GRUPO 7 <small>FarmaSalud Perú · Banco Andino Perú</small></span>
        </div>

        <div className={`g7-access__orb ${autorizado ? "g7-access__orb--ok" : ""}`} aria-hidden="true">
          <span className="g7-access__ring g7-access__ring--outer" />
          <span className="g7-access__ring g7-access__ring--inner" />
          <span className="g7-access__orb-center">
            {saliendo ? (
              <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
                <rect x="8" y="7" width="20" height="34" rx="3" stroke="currentColor" strokeWidth="3" />
                <path d="M21 24H41m-7-7 7 7-7 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : autorizado ? (
              <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
                <path d="M11 24.5L20 33L38 15" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <span className="g7-access__pulse-logo">G7</span>
            )}
          </span>
        </div>

        <div className="g7-access__eyebrow">{PORTAL === "cliente" ? "PORTAL DE CLIENTES" : "PORTAL DE GESTIÓN"}</div>
        <h2 className="g7-access__title" key={fase}>{titulo}</h2>
        <p className="g7-access__message">{mensaje}</p>
        <div className={`g7-access__progress ${autorizado ? "g7-access__progress--ok" : ""}`} aria-hidden="true"><span /></div>
        <p className="g7-access__footnote">
          {saliendo ? "Volviendo a la pantalla de inicio de sesión…" : autorizado ? "Te estamos redirigiendo al inicio" : "Por favor, espera un momento"}
        </p>
      </section>
      <div className="g7-access__bottom">ACCESO SEGURO · GRUPO 7</div>
    </div>
  );
}
