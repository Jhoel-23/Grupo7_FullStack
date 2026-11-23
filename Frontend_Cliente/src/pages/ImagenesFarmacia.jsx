import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiUrl } from "../api/client.js";
import { consultarCatalogoNeon } from "../api/grupo7.api.js";
import Icon from "../components/Icon";
import Paginador from "../components/Paginador.jsx";
import { paginarLista } from "../utils/paginacion.js";
import "../styles/catalogo.css";

function Producto({p}){
  const [cantidad,setCantidad]=useState(1);
  const maximo=Math.max(1,Math.min(Number(p.stock)||1,100));
  return <article className="catalogo-item pro-product-card">
    <div className="pro-product-visual"><span className={`catalogo-estado ${p.stock>0?"":"sin-stock"}`}>{p.stock>0?"Disponible":"Agotado"}</span><div className="catalogo-imagen">{p.imagen_id?<img loading="lazy" alt={p.nombre} src={apiUrl(`/farmacia/imagenes/${p.imagen_id}/archivo`)}/>:<span><Icon name="pastilla" size={42}/> Sin fotografía</span>}</div></div>
    <div className="pro-product-info"><strong>{p.nombre}</strong><small className="pro-product-sku">SKU: {p.sku}</small><p className="catalogo-nota">{p.descripcion||"Medicamento disponible en FarmaSalud."}</p></div>
    <div className="pro-product-price">S/ {Number(p.precio).toFixed(2)}</div>
    <div className="pro-product-buy"><small>Stock: {p.stock} unidades</small>{p.stock>0&&<div className="pro-stepper"><button type="button" aria-label={`Disminuir cantidad de ${p.nombre}`} disabled={cantidad<=1} onClick={()=>setCantidad(c=>Math.max(1,c-1))}>−</button><output>{cantidad}</output><button type="button" aria-label={`Aumentar cantidad de ${p.nombre}`} disabled={cantidad>=maximo} onClick={()=>setCantidad(c=>Math.min(maximo,c+1))}>+</button></div>}</div>
    {p.stock>0?<Link className="catalogo-boton" to={`/farmacia/pedido?producto=${encodeURIComponent(p.id)}&cantidad=${cantidad}`}><Icon name="carrito" size={17}/> Agregar al pedido</Link>:<span className="catalogo-boton secundario pro-unavailable">No disponible</span>}
  </article>;
}
export default function ImagenesFarmacia(){
  const [productos,setProductos]=useState([]);
  const [estado,setEstado]=useState("Cargando catálogo de FarmaSalud...");
  const [busqueda,setBusqueda]=useState("");
  const [filtro,setFiltro]=useState("todos");
  const [orden,setOrden]=useState("nombre");
  const [pagina,setPagina]=useState(1);
  const [porPagina,setPorPagina]=useState(12);
  useEffect(()=>{let activo=true;consultarCatalogoNeon().then(d=>{if(activo){setProductos(d.productos||[]);setEstado("");}}).catch(e=>{if(activo)setEstado(e.message);});return()=>{activo=false;};},[]);
  const visibles=useMemo(()=>productos.filter(p=>(filtro==="todos" || (filtro==="disponibles" && p.stock>0) || (filtro==="agotados" && p.stock<=0))&&`${p.nombre} ${p.sku} ${p.descripcion||""}`.toLocaleLowerCase("es").includes(busqueda.toLocaleLowerCase("es"))).sort((a,b)=>orden==="precio-asc"?Number(a.precio)-Number(b.precio):orden==="precio-desc"?Number(b.precio)-Number(a.precio):orden==="recientes"?Number(b.id)-Number(a.id):String(a.nombre).localeCompare(String(b.nombre),"es",{sensitivity:"base"})),[productos,busqueda,filtro,orden]);
  const paginacion=paginarLista(visibles,pagina,porPagina);
  return <main className="pro-catalog-page">
    <Link to="/inicio">Volver al inicio</Link>
    <div className="pro-catalog-header"><div><p className="pro-eyebrow">FARMASALUD PERÚ</p><h1 className="catalogo-titulo">Catálogo de medicamentos</h1><p className="catalogo-subtitulo">Encuentra lo que necesitas, consulta precios oficiales y prepara tu pedido con delivery.</p></div><span className="pro-chip">{productos.length} productos</span></div>
    <div className="pro-catalog-toolbar g7-list-toolbar">
      <label className="g7-list-search">Buscar medicamentos
        <input className="g7-list-control" type="search" placeholder="Nombre, SKU o descripción…" value={busqueda}
          onChange={e=>{setBusqueda(e.target.value);setPagina(1);}} aria-label="Buscar medicamentos" />
      </label>
      <label className="g7-list-select">Disponibilidad
        <select className="g7-list-control" value={filtro} onChange={e=>{setFiltro(e.target.value);setPagina(1);}}>
          <option value="todos">Todos los productos</option><option value="disponibles">Disponibles</option><option value="agotados">Sin stock</option>
        </select>
      </label>
      <label className="g7-list-select">Ordenar por
        <select className="g7-list-control" value={orden} onChange={e=>{setOrden(e.target.value);setPagina(1);}}>
          <option value="nombre">Nombre A–Z</option><option value="recientes">Novedades</option>
          <option value="precio-asc">Precio menor a mayor</option><option value="precio-desc">Precio mayor a menor</option>
        </select>
      </label>
    </div>
    {!estado&&<p className="catalogo-nota" style={{margin:"4px 0 18px"}}>Encontrados: <strong>{visibles.length}</strong> de {productos.length} medicamentos</p>}
    {estado&&<p role="status" className={estado.startsWith("Cargando")?"pro-info-message":"catalogo-alerta"}>{estado}</p>}
    {!estado&&productos.length===0&&<div className="catalogo-panel pro-empty-msg">Todavía no hay medicamentos activos. El administrador debe registrar productos con stock.</div>}
    {!estado&&productos.length>0&&visibles.length===0&&<div className="catalogo-panel pro-empty-msg">No se encontraron medicamentos con esos filtros.</div>}
    <div className="catalogo-grid">{paginacion.items.map(p=><Producto key={p.id} p={p}/>)}</div>
    {!estado && <Paginador total={visibles.length} pagina={paginacion.paginaActual} porPagina={porPagina} onPagina={setPagina}
      onPorPagina={n=>{setPorPagina(n);setPagina(1);}} opciones={[12,24,48]} sustantivo="medicamentos" />}
  </main>;
}
