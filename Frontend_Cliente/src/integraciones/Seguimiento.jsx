import { fechaLocal } from "../utils/formato.js";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSeguimiento } from "../hooks/useSeguimiento";
export default function Seguimiento() {
  const { usuario } = useAuth();
  const [params, setParams] = useSearchParams();
  const [codigo, setCodigo] = useState(params.get("codigo") || sessionStorage.getItem("grupo7_ultimo_pedido") || "");
  const activo = params.get("codigo") || "";
  const { datos, error } = useSeguimiento(usuario.token, activo);
  return <main className="g7-timeline">
    <Link to="/farmacia/pedido">Volver a mis pedidos</Link>
    <h1>Seguimiento FarmaSalud</h1>
    <form onSubmit={e => { e.preventDefault(); setParams({ codigo: codigo.trim().toUpperCase() }); }}>
      <label htmlFor="codigo">Código de pedido</label>
      <input id="codigo" value={codigo} maxLength={30} onChange={e=>setCodigo(e.target.value)} placeholder="PDF-00001" required />
      <button type="submit">Consultar</button>
    </form>
    {error && <p role="alert" className="g7-error">{error}</p>}
    {datos?.pedido && <section aria-live="polite"><h2>{datos.pedido.codigo} · {datos.pedido.estado}</h2>
      <p>{datos.pedido.producto} · S/ {Number(datos.pedido.total).toFixed(2)}</p>
      <ol>{datos.historial.map(x=><li key={x.id}><b>{x.estado}</b> · {fechaLocal(x.fecha)}<small>{x.actor || "Registro del sistema"} {x.detalle ? `· ${x.detalle}` : ""}</small></li>)}</ol>
      <p>Actualización automática cada 5 segundos.</p>
    </section>}
  </main>;
}
