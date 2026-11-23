import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiUrl } from "../api/client.js";
import {
  registrarPedidoNeon,pagarDeliveryNeon,consultarPedidoPendienteNeon,
  consultarCatalogoNeon,cancelarPedidoNeon
} from "../api/grupo7.api";
import "../styles/catalogo.css";
import { useConfirmacion } from "../components/ConfirmacionProvider.jsx";

export default function PagoDelivery(){
  const {usuario}=useAuth();
  const confirmar=useConfirmacion();
  const [searchParams]=useSearchParams();
  const [productos,setProductos]=useState([]);
  const [productoId,setProductoId]=useState("");
  const [cantidad,setCantidad]=useState(1);
  const [direccion,setDireccion]=useState("");
  const [pedido,setPedido]=useState(null);
  const [pago,setPago]=useState(null);
  const [error,setError]=useState("");
  const [cargando,setCargando]=useState(false);
  const [pagando,setPagando]=useState(false);
  const [cancelando,setCancelando]=useState(false);
  const [consultando,setConsultando]=useState(true);
  const seleccionado=useMemo(()=>productos.find(p=>String(p.id)===String(productoId)),[productos,productoId]);
  const maximo=seleccionado?Math.min(seleccionado.stock,100):100;
  const estimado=seleccionado?Number(seleccionado.precio)*cantidad:0;
  useEffect(()=>{
    let activo=true;
    Promise.all([consultarPedidoPendienteNeon(usuario.token),consultarCatalogoNeon()])
      .then(([datos,catalogo])=>{
        if(!activo)return;
        setProductos(catalogo.productos);
        setPedido(datos.pedido||null);
        const elegido=catalogo.productos.find(p=>String(p.id)===searchParams.get("producto"));
        const primero=catalogo.productos.find(p=>p.stock>0);
        setProductoId(String((elegido||primero||catalogo.productos[0])?.id||""));
        if (elegido && searchParams.has("cantidad")) { const q=Number(searchParams.get("cantidad")); setCantidad(Number.isSafeInteger(q)&&q>=1?Math.min(q,Math.min(elegido.stock,100)):1); }
      }).catch(e=>{if(activo)setError(e.message);})
      .finally(()=>{if(activo)setConsultando(false);});
    return ()=>{activo=false;};
  },[usuario.token,searchParams]);
  const elegir=id=>{setProductoId(String(id));setCantidad(1);setError("");};
  const registrar=async e=>{
    e.preventDefault();if(cargando||!seleccionado||!Number.isInteger(cantidad)||cantidad<1||cantidad>maximo)return;
    if(!await confirmar({titulo:"¿Registrar pedido?",descripcion:"Se registrará el pedido y se reservarán las unidades seleccionadas. El total final se validará en el servidor.",
      detalles:[["Medicamento",seleccionado.nombre],["Cantidad",cantidad],["Total estimado",`S/ ${estimado.toFixed(2)}`],["Entrega",direccion]],accion:"Sí, registrar pedido"}))return;
    setError("");setCargando(true);
    try{
      const resultado=await registrarPedidoNeon(usuario.token,Number(productoId),cantidad,direccion);
      setPedido(resultado.pedido);sessionStorage.setItem("grupo7_ultimo_pedido",resultado.pedido.codigo);
      setProductos(anterior=>anterior.map(p=>String(p.id)===String(productoId)?{...p,stock:p.stock-cantidad}:p));
    }catch(e){setError(e.message);}finally{setCargando(false);}
  };
  const procesarPago=async()=>{
    if(!pedido||pagando||pedido.estado!=="pendiente")return;
    if(!await confirmar({titulo:"¿Confirmar pago bancario?",descripcion:"Banco Andino descontará este importe de tu cuenta. Revisa el monto antes de autorizar.",
      detalles:[["Pedido",pedido.codigo],["Total a pagar",`S/ ${Number(pedido.total).toFixed(2)}`]],accion:"Sí, pagar pedido"}))return;
    setError("");setPagando(true);
    try{
      const resultado=await pagarDeliveryNeon(usuario.token,pedido.id);
      setPago(resultado.pago);sessionStorage.setItem("grupo7_ultimo_pedido",pedido.codigo);
      setPedido(prev=>({...prev,estado:"pagado",id_operacion:resultado.pago.id_operacion}));
    }catch(e){setError(e.message);}finally{setPagando(false);}
  };
  const cancelar=async()=>{
    if(!pedido||cancelando||pedido.estado!=="pendiente")return;
    if(!await confirmar({titulo:"¿Cancelar pedido?",descripcion:"El pedido pendiente se cancelará. Si tenía stock reservado, las unidades se devolverán al inventario.",
      detalles:[["Pedido",pedido.codigo],["Total",`S/ ${Number(pedido.total).toFixed(2)}`]],accion:"Sí, cancelar pedido",variante:"peligro"}))return;
    setError("");setCancelando(true);
    try{
      await cancelarPedidoNeon(usuario.token,pedido.id);
      setPedido(null);setPago(null);
      const catalogo=await consultarCatalogoNeon();setProductos(catalogo.productos);
    }catch(e){setError(e.message);}finally{setCancelando(false);}
  };
  return <main style={{maxWidth:1060,margin:"24px auto"}}>
    <Link to="/inicio">← Volver al inicio</Link>
    <h1 className="catalogo-titulo" style={{marginTop:16}}>FarmaSalud Perú</h1>
    <p className="catalogo-subtitulo">Delivery de medicamentos · Cliente: <strong>{usuario.nombre}</strong></p>
    {consultando && <p role="status">Consultando catálogo y pedidos en Neon…</p>}
    {!consultando && pedido ? <div className="catalogo-panel">
      <h2>Pedido {pedido.codigo}</h2>
      <p><b>Medicamento:</b> {pedido.producto}</p>
      {pedido.cantidad && <p><b>Cantidad:</b> {pedido.cantidad} × S/ {Number(pedido.precio_unitario).toFixed(2)}</p>}
      <p><b>Dirección:</b> {pedido.direccion}</p>
      <div className="catalogo-precio-total"><span>Total oficial</span><strong>S/ {Number(pedido.total).toFixed(2)}</strong></div>
      <p><b>Estado:</b> {pedido.estado}</p>
      <p><Link to={`/farmacia/seguimiento?codigo=${encodeURIComponent(pedido.codigo)}`}>Ver seguimiento del pedido</Link></p>
      {pago && <div className="catalogo-ok"><b>Pago aprobado por Banco Andino.</b> Operación OP-{String(pago.id_operacion).padStart(5,"0")} · Monto S/ {Number(pago.monto).toFixed(2)}. <Link to="/banco/mis-cuentas">Consultar movimientos</Link></div>}
      {error && <p role="alert" className="catalogo-alerta">{error}</p>}
      {pedido.estado==="pendiente" && <div className="catalogo-fila">
        <button className="catalogo-boton" disabled={pagando||cancelando} onClick={procesarPago}>{pagando?"Procesando pago…":"Pagar con Banco Andino"}</button>
        <button className="catalogo-boton peligro" disabled={pagando||cancelando} onClick={cancelar}>{cancelando?"Cancelando…":"Cancelar pedido pendiente"}</button>
      </div>}
      {error.toLowerCase().includes("saldo insuficiente") && <p><Link to="/banco/mis-cuentas">Consultar mi cuenta bancaria</Link></p>}
    </div> : !consultando && <>
      <section className="catalogo-panel">
        <h2>1. Selecciona tu medicamento</h2>
        {!productos.length && <p>El catálogo todavía está vacío. El administrador debe activar medicamentos con inventario.</p>}
        <div className="catalogo-grid">
          {productos.map(prod=><button type="button" aria-pressed={String(productoId)===String(prod.id)} className={`catalogo-item ${String(productoId)===String(prod.id)?"seleccionado":""}`} key={prod.id} disabled={prod.stock<=0} onClick={()=>elegir(prod.id)}>
            <span className="catalogo-imagen">{prod.imagen_id?<img src={apiUrl(`/farmacia/imagenes/${prod.imagen_id}/archivo`)} alt={prod.nombre} loading="lazy"/>:<span>Sin fotografía</span>}</span>
            <strong>{prod.nombre}</strong><small className="catalogo-nota">{prod.descripcion}</small>
            <span className="catalogo-precio">S/ {Number(prod.precio).toFixed(2)}</span>
            <span className={`catalogo-estado ${prod.stock>0?"":"sin-stock"}`}>{prod.stock>0?`Disponibles: ${prod.stock}`:"Sin stock"}</span>
            <span>{String(productoId)===String(prod.id)?"✓ Seleccionado":"Seleccionar"}</span>
          </button>)}
        </div>
      </section>
      <form className="catalogo-panel" onSubmit={registrar}>
        <h2>2. Confirma tu pedido</h2>
        <p className="catalogo-subtitulo">El precio se obtiene directamente de Neon y el backend vuelve a calcular el total. No puedes editarlo.</p>
        <div className="catalogo-dos">
          <label className="catalogo-campo">Medicamento seleccionado
            <input readOnly value={seleccionado?.nombre||"Selecciona un medicamento"}/>
          </label>
          <label className="catalogo-campo">Cantidad (máximo {maximo})
            <input type="number" min="1" max={maximo||1} step="1" value={cantidad} onChange={e=>setCantidad(Number(e.target.value))} required />
          </label>
        </div>
        <label className="catalogo-campo" style={{marginTop:14}}>Dirección de entrega
          <textarea rows="2" minLength="5" maxLength="500" placeholder="Av. principal, número, ciudad" value={direccion} onChange={e=>setDireccion(e.target.value)} required/>
        </label>
        <div className="catalogo-precio-total"><span>Total estimado ({cantidad} unidad{cantidad===1?"":"es"})</span><strong>S/ {estimado.toFixed(2)}</strong></div>
        {error && <p role="alert" className="catalogo-alerta">{error}</p>}
        <button className="catalogo-boton" style={{width:"100%",marginTop:15}} type="submit" disabled={cargando||!seleccionado||seleccionado.stock<=0||!Number.isInteger(cantidad)||cantidad<1||cantidad>maximo}>{cargando?"Registrando…":"Registrar pedido al precio oficial"}</button>
        <p className="catalogo-nota">El stock se reserva al registrar el pedido y se devuelve si lo cancelas antes de pagar. Un pedido anterior pendiente debe pagarse o cancelarse primero.</p>
      </form>
    </>}
  </main>;
}
