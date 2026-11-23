import { fechaLocal } from "../utils/formato.js";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useHistorial } from "../hooks/useHistorial.js";
export default function HistorialGestion() {
 const { codigo }=useParams(); const {usuario}=useAuth();
 const { datos, error } = useHistorial(usuario.token, codigo);
 return <main className="g7-timeline"><Link to="/inicio">Volver al inicio</Link><h1>Historial de pedido {codigo}</h1>
 {error&&<p role="alert" className="g7-error">{error}</p>}
 {datos?.pedido&&<><h2>Estado: {datos.pedido.estado}</h2><p>{datos.pedido.producto} · S/ {Number(datos.pedido.total).toFixed(2)}</p>
 <ol>{datos.historial.map(x=><li key={x.id}><b>{x.estado}</b> · {fechaLocal(x.fecha)}<small>{x.actor || "Registro del sistema"} {x.detalle ? `· ${x.detalle}` : ""}</small></li>)}</ol></>}
 </main>;
}
