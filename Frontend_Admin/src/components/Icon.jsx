import React from "react";

const trazos = {
  inicio: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" /></>,
  pastilla: <><rect x="3" y="7" width="18" height="10" rx="5" transform="rotate(-45 12 12)"/><path d="m8.5 8.5 7 7"/></>,
  carrito: <><circle cx="9" cy="20" r="1"/><circle cx="19" cy="20" r="1"/><path d="M2 3h2l2.6 12H20l2-9H5"/></>,
  camion: <><path d="M2 7h12v11H2zM14 11h4l4 4v3h-8z"/><circle cx="7" cy="19" r="2"/><circle cx="18" cy="19" r="2"/></>,
  banco: <><path d="M3 9 12 3l9 6zM4 21h16M6 10v9M10 10v9M14 10v9M18 10v9"/></>,
  tarjeta: <><rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20M6 15h5"/></>,
  cuenta: <><rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20M6 15h5"/></>,
  mas: <><circle cx="12" cy="12" r="9"/><path d="M12 7v10M7 12h10"/></>,
  pedidos: <><rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 4.5h6M8 10h8M8 14h8M8 18h5"/></>,
  caja: <><path d="m3 7 9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10"/></>,
  grafica: <><path d="M3 20h19M5 17l5-5 4 2 6-8"/><path d="M20 6v4m0-4h-4"/></>,
  busqueda: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>,
  campana: <><path d="M18 8a6 6 0 0 0-12 0c0 8-3 8-3 10h18c0-2-3-2-3-10M10 21h4"/></>,
  salir: <><path d="M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5M14 7l5 5-5 5M8 12h11"/></>,
  flecha: <><path d="M5 12h14m-7-7 7 7-7 7"/></>,
  comprobar: <><path d="m4 12 5 5 11-11"/></>,
  historial: <><path d="M3 12a9 9 0 1 0 3-6M3 4v5h5M12 7v5l4 2"/></>,
  imagen: <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="1"/><path d="m3 17 5-5 4 4 4-4 5 5"/></>,
  usuarios: <><circle cx="9" cy="8" r="3"/><path d="M2 20v-2a7 7 0 0 1 14 0v2M17 5a3 3 0 0 1 0 6M18 14a6 6 0 0 1 4 6"/></>,
  escudo: <><path d="m12 2 8 4v6c0 5-3 8-8 10-5-2-8-5-8-10V6z"/><path d="m8 12 3 3 5-6"/></>,
  actualizar: <><path d="M20 8a8 8 0 0 0-14-2L3 9M3 4v5h5M4 16a8 8 0 0 0 14 2l3-3M16 15h5v5"/></>
};
export default function Icon({ name, size = 20, className = "", ...rest }) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>{trazos[name] || trazos.inicio}</svg>;
}
