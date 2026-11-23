import { PORTAL } from "../config/portal";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Icon from "./Icon";

const enlaces = {
  banco: {
    cliente: [{to: "/banco/mis-cuentas", label: "Mis cuentas", icono: "tarjeta"}, {to: "/banco/abrir-cuenta", label: "Abrir cuenta", icono: "mas"}],
    empleado: [{to: "/banco/ventanilla", label: "Ventanilla", icono: "cuenta"}, {to: "/banco/operaciones-dia", label: "Operaciones del día", icono: "historial"}],
    administrador: [{to: "/banco/admin", label: "Panel bancario", icono: "grafica"}]
  },
  farmacia: {
    cliente: [{to: "/farmacia/catalogo", label: "Catálogo de medicamentos", icono: "pastilla"}, {to: "/farmacia/pedido", label: "Delivery y pagos", icono: "carrito"}, {to: "/farmacia/seguimiento", label: "Seguimiento de pedidos", icono: "camion"}],
    empleado: [{to: "/farmacia/despachos", label: "Despacho de pedidos", icono: "camion"}],
    administrador: [{to: "/farmacia/productos", label: "Medicamentos y stock", icono: "pastilla"}, {to: "/farmacia/admin/pedidos", label: "Administrar pedidos", icono: "pedidos"}, {to: "/farmacia/cobros", label: "Cobros bancarios", icono: "tarjeta"}]
  }
};

export default function AppLayout({ children }) {
  const { usuario, salirConAnimacion } = useAuth();
  const location = useLocation();
  if (location.pathname === "/login" || !usuario) return children;
  const roles = (usuario.roles || []).filter(r => PORTAL === "cliente" ? r.rol === "cliente" : r.rol !== "cliente");
  const secciones = [
    { titulo: "FarmaSalud Perú", modulo: "farmacia" },
    { titulo: "Banco Andino Perú", modulo: "banco" }
  ].map(sec => ({...sec, opciones: roles.filter(r => r.modulo === sec.modulo).flatMap(r => enlaces[sec.modulo]?.[r.rol] || [])}))
    .filter(sec => sec.opciones.length);
  const inicial = usuario.nombre?.trim()?.[0]?.toUpperCase() || "U";
  const ocupacion = PORTAL === "cliente" ? "Portal del cliente" : "Administración y empleados";

  return <div className="app-layout pro-shell">
    <aside className="app-sidebar pro-sidebar" aria-label="Menú principal">
      <NavLink className="pro-side-brand" to="/inicio" aria-label="Grupo 7, inicio">
        <span className="app-brand-mark">G7</span><span><strong>Grupo 7</strong><small>FarmaSalud · Banco Andino</small></span>
      </NavLink>
      <nav className="pro-nav-content" aria-label="Secciones de la aplicación">
        <NavLink to="/inicio" end className={({isActive}) => `app-navlink ${isActive ? "active" : ""}`}><Icon name="inicio"/><span>Inicio</span></NavLink>
        {secciones.map(sec => <section className="app-navgroup" key={sec.modulo}>
          <div className="app-navtitle">{sec.titulo}</div>
          {sec.opciones.map(item => <NavLink key={item.to} to={item.to} className={({isActive}) => `app-navlink ${isActive ? "active" : ""}`}><Icon name={item.icono}/><span>{item.label}</span></NavLink>)}
        </section>)}
      </nav>
      <div className="app-sidebar-footer"><span className="pro-side-shield"><Icon name="escudo" size={17}/></span><span>Entorno protegido<small>{ocupacion}</small></span></div>
    </aside>
    <div className="pro-main-area">
      <header className="app-topbar pro-topbar">
        <div className="pro-topbar-crumb"><span className="pro-topbar-dot"/> <span>{PORTAL === "cliente" ? "Espacio del cliente" : "Panel de gestión"}</span><span className="pro-breadcrumb-sep">/</span><strong>{location.pathname === "/inicio" ? "Inicio" : secciones.flatMap(s => s.opciones).find(o => o.to === location.pathname)?.label || "Grupo 7"}</strong></div>
        <div className="app-topbar-user"><span className="pro-topbar-role">{ocupacion}</span><span className="app-user-dot">{inicial}</span><span className="app-user-name">{usuario.nombre}</span><button type="button" className="app-logout" onClick={salirConAnimacion}><Icon name="salir" size={16}/><span>Salir</span></button></div>
      </header>
      <div className="app-content"><div className="app-content-inner">{children}</div></div>
    </div>
  </div>;
}
