import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { consultarCatalogoAdminNeon, consultarPedidosAdminNeon } from "../api/farmacia.api.js";
import Icon from "../components/Icon";

export default function InicioPage() {
  const {usuario,salirConAnimacion}=useAuth();
  const esAdminFarmacia=usuario?.roles?.some(r=>r.modulo==="farmacia"&&r.rol==="administrador");
  const esEmpleadoFarmacia=usuario?.roles?.some(r=>r.modulo==="farmacia"&&r.rol==="empleado");
  const esBanco=usuario?.roles?.some(r=>r.modulo==="banco"&&r.rol!=="cliente");
  const [resumen,setResumen]=useState(null);
  const [pendiente,setPendiente]=useState(true);
  const [error,setError]=useState("");
  const cargar=useCallback(async()=>{
    if(!esAdminFarmacia){setPendiente(false);return;}
    setPendiente(true);setError("");
    try{
      const [catalogo,pedidos]=await Promise.all([consultarCatalogoAdminNeon(usuario.token),consultarPedidosAdminNeon(usuario.token)]);
      const productos=catalogo.productos||[];
      const registros=pedidos.pedidos||[];
      setResumen({productos:productos.filter(p=>p.activo).length,stockBajo:productos.filter(p=>p.activo&&Number(p.stock)<=5).length,pendientes:registros.filter(p=>p.estado==="pendiente").length,pagados:registros.filter(p=>p.estado==="pagado").length,despachados:registros.filter(p=>p.estado==="despachado").length,pedidos:registros.slice(0,5)});
    } catch(e){setError(e.message);}
    finally{setPendiente(false);}
  },[esAdminFarmacia,usuario.token]);
  useEffect(()=>{cargar();},[cargar]);
  return <div className="pro-dashboard pro-admin-home">
    <div className="pro-section-head pro-dashboard-heading"><div><p className="pro-eyebrow">GRUPO 7 · PANEL DE GESTIÓN</p><h1>Panel de administración</h1><p>Bienvenido, <strong>{usuario?.nombre}</strong>. Supervisa las operaciones habilitadas para tu rol.</p></div><button className="pro-refresh" onClick={cargar} disabled={pendiente}><Icon name="actualizar" size={16}/> Actualizar</button></div>
    {esAdminFarmacia&&<>
      {error&&<div className="pro-warning" role="status">No se pudieron actualizar los indicadores: {error}</div>}
      <section className="pro-kpi-grid pro-kpi-admin">
        <div className="pro-kpi-card"><span className="pro-kpi-icon"><Icon name="pastilla"/></span><div><strong>{pendiente?"…":resumen?.productos??"—"}</strong><small>Medicamentos activos</small></div></div>
        <div className="pro-kpi-card"><span className="pro-kpi-icon amber"><Icon name="caja"/></span><div><strong>{pendiente?"…":resumen?.stockBajo??"—"}</strong><small>Productos con stock bajo</small></div></div>
        <div className="pro-kpi-card"><span className="pro-kpi-icon blue"><Icon name="pedidos"/></span><div><strong>{pendiente?"…":resumen?.pendientes??"—"}</strong><small>Pedidos pendientes</small></div></div>
        <div className="pro-kpi-card"><span className="pro-kpi-icon"><Icon name="comprobar"/></span><div><strong>{pendiente?"…":resumen?.pagados??"—"}</strong><small>Pedidos pagados</small></div></div>
      </section>
      <div className="pro-bottom-grid pro-admin-overview"><section className="pro-simple-card"><div className="pro-card-header"><h3>Estado de los pedidos</h3><span className="pro-chip">Datos de Neon</span></div><div className="pro-order-bars">{[["Pendientes",resumen?.pendientes||0,"pendientes"],["Pagados",resumen?.pagados||0,"pagados"],["Despachados",resumen?.despachados||0,"despachados"]].map(([label,total,css])=><div className="pro-order-bar-row" key={css}><div><span>{label}</span><strong>{pendiente?"…":resumen?total:"—"}</strong></div><div className="pro-order-track"><span className={css} style={{width:`${resumen?100*total/Math.max(1,resumen.pendientes+resumen.pagados+resumen.despachados):0}%`}}/></div></div>)}</div><div className="pro-mini-actions"><Link to="/farmacia/productos"><Icon name="pastilla" size={17}/> Medicamentos</Link><Link to="/farmacia/cobros"><Icon name="tarjeta" size={17}/> Cobros</Link></div></section><section className="pro-simple-card"><div className="pro-card-header"><h3>Pedidos recientes</h3><Link to="/farmacia/admin/pedidos">Ver todos</Link></div>{pendiente?<p>Actualizando pedidos…</p>:resumen?.pedidos?.length?<div className="pro-order-list">{resumen.pedidos.map(p=><div key={p.id} className="pro-order-row"><div><strong>{p.codigo}</strong><small>{p.producto||"Pedido de farmacia"}</small></div><span className={`pro-order-status ${p.estado}`}>{p.estado}</span></div>)}</div>:<p className="pro-empty-msg">Todavía no hay pedidos registrados.</p>}</section></div>
    </>}
    {!esAdminFarmacia&&<section className="pro-simple-card"><h2>Tu espacio de trabajo</h2><p>Estas son las opciones que puedes utilizar con tus permisos actuales.</p><div className="pro-mini-actions">{esEmpleadoFarmacia&&<Link to="/farmacia/despachos"><Icon name="camion" size={17}/> Despacho de pedidos</Link>}{esBanco&&<Link to={usuario?.roles?.some(r=>r.modulo==="banco"&&r.rol==="administrador")?"/banco/admin":"/banco/ventanilla"}><Icon name="banco" size={17}/> Operaciones bancarias</Link>}</div></section>}
    <section className="pro-bottom-grid pro-footer-overview"><div className="pro-simple-card"><h3>Permisos asignados</h3><div className="pro-role-list">{usuario?.roles?.filter(r=>r.rol!=="cliente").map(r=><span key={`${r.modulo}-${r.rol}`}><Icon name="escudo" size={14}/>{r.modulo} · {r.rol}</span>)}</div></div><div className="pro-simple-card"><h3>Sesión protegida</h3><p>Los accesos y acciones están restringidos según los permisos de tu cuenta.</p><button type="button" className="pro-text-logout" onClick={salirConAnimacion}>Cerrar sesión de forma segura</button></div></section>
  </div>;
}
