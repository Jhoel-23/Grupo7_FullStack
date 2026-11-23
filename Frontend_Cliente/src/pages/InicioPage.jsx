import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { consultarCuentasNeon } from "../api/banco.api.js";
import { consultarPedidoPendienteNeon } from "../api/farmacia.api.js";
import Icon from "../components/Icon";

const monto = valor => new Intl.NumberFormat("es-PE", {style:"currency",currency:"PEN"}).format(Number(valor) || 0);
export default function InicioPage() {
  const { usuario, salirConAnimacion } = useAuth();
  const [resumen, setResumen] = useState({cuentas:null, saldo:null, pedido:null});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const farmacia = usuario?.roles?.some(r=>r.modulo==="farmacia"&&r.rol==="cliente");
  const banco = usuario?.roles?.some(r=>r.modulo==="banco"&&r.rol==="cliente");
  const cargar = useCallback(async () => {
    setCargando(true);setError("");
    const [cuentas, pedido] = await Promise.allSettled([
      banco ? consultarCuentasNeon(usuario.token) : Promise.resolve(null),
      farmacia ? consultarPedidoPendienteNeon(usuario.token) : Promise.resolve(null)
    ]);
    if(cuentas.status==="fulfilled"&&pedido.status==="fulfilled") {
      const registros = cuentas.value?.cuentas || [];
      setResumen({cuentas:banco?registros.length:null,saldo:banco?registros.reduce((s,c)=>s+Number(c.saldo||0),0):null,pedido:pedido.value?.pedido||null});
    } else {
      const registros = cuentas.status==="fulfilled" ? cuentas.value?.cuentas||[] : [];
      setResumen({cuentas:banco&&cuentas.status==="fulfilled"?registros.length:null,saldo:banco&&cuentas.status==="fulfilled"?registros.reduce((s,c)=>s+Number(c.saldo||0),0):null,pedido:pedido.status==="fulfilled"?pedido.value?.pedido||null:null});
      setError("Algunos indicadores no están disponibles. Puedes seguir usando los módulos.");
    }
    setCargando(false);
  }, [banco, farmacia, usuario.token]);
  useEffect(()=>{cargar();},[cargar]);
  const primerNombre=usuario?.nombre?.split(" ")[0]||"";
  return <div className="pro-dashboard pro-client-home">
    <section className="pro-hero pro-client-hero">
      <div className="pro-hero-text"><p className="pro-eyebrow">BIENVENIDO A TU ESPACIO</p><h1>¡Hola, {primerNombre}!</h1><p>Gestiona tus pedidos de farmacia y operaciones bancarias desde un solo lugar, de forma simple y segura.</p><Link className="pro-link-hero" to={farmacia?"/farmacia/catalogo":"/banco/mis-cuentas"}>Explorar servicios <Icon name="flecha" size={17}/></Link></div>
      <div className="pro-medical-art" aria-hidden="true"><div className="pro-art-plus">✚</div><div className="pro-art-pill">+</div><div className="pro-art-orbit" /></div>
    </section>
    <section className="pro-quick-grid" aria-label="Acceso rápido a módulos">
      {farmacia && <Link className="pro-service-card" to="/farmacia/catalogo"><span className="pro-service-icon pro-mint"><Icon name="pastilla" size={27}/></span><span><strong>FarmaSalud Perú</strong><small>Explorar medicamentos y realizar pedidos</small></span><Icon name="flecha" className="pro-service-arrow"/></Link>}
      {banco && <Link className="pro-service-card" to="/banco/mis-cuentas"><span className="pro-service-icon pro-blue"><Icon name="banco" size={27}/></span><span><strong>Banco Andino Perú</strong><small>Consultar cuentas y movimientos</small></span><Icon name="flecha" className="pro-service-arrow"/></Link>}
    </section>
    <div className="pro-section-head"><div><p className="pro-eyebrow">TU INFORMACIÓN</p><h2>Resumen de tu actividad</h2></div><button type="button" className="pro-refresh" onClick={cargar} disabled={cargando}><Icon name="actualizar" size={16}/> Actualizar</button></div>
    {error && <p className="pro-warning" role="status">{error}</p>}
    <section className="pro-kpi-grid pro-kpi-client">
      {banco && <><div className="pro-kpi-card"><span className="pro-kpi-icon"><Icon name="tarjeta"/></span><div><strong>{cargando?"…":resumen.cuentas??"—"}</strong><small>Cuentas registradas</small></div></div><div className="pro-kpi-card"><span className="pro-kpi-icon"><Icon name="banco"/></span><div><strong>{cargando?"…":resumen.saldo===null?"—":monto(resumen.saldo)}</strong><small>Saldo total disponible</small></div></div></>}
      {farmacia && <><div className="pro-kpi-card"><span className="pro-kpi-icon"><Icon name="pedidos"/></span><div><strong>{cargando?"…":resumen.pedido?.codigo||"Sin pendientes"}</strong><small>Pedido pendiente actual</small></div></div><div className="pro-kpi-card"><span className="pro-kpi-icon"><Icon name="camion"/></span><div><strong>{cargando?"…":resumen.pedido?.estado||"—"}</strong><small>Estado del pedido</small></div></div></>}
    </section>
    <div className="pro-bottom-grid"><section className="pro-simple-card"><h3>Continúa donde lo dejaste</h3><p>Accede directamente a las operaciones que necesitas hoy.</p><div className="pro-mini-actions">{farmacia&&<Link to="/farmacia/pedido"><Icon name="carrito" size={16}/> Delivery y pagos</Link>}{farmacia&&<Link to="/farmacia/seguimiento"><Icon name="camion" size={16}/> Seguimiento</Link>}{banco&&<Link to="/banco/abrir-cuenta"><Icon name="mas" size={16}/> Abrir cuenta</Link>}</div></section><section className="pro-simple-card"><h3>Tu cuenta y permisos</h3><div className="pro-role-list">{usuario?.roles?.filter(r=>r.rol==="cliente").map(r=><span key={`${r.modulo}-${r.rol}`}><Icon name="escudo" size={14}/>{r.modulo} · {r.rol}</span>)}</div><button type="button" className="pro-text-logout" onClick={salirConAnimacion}>Cerrar sesión de forma segura</button></section></div>
  </div>;
}
