
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  consultarPedidosAdminNeon,
  actualizarPedidoAdminNeon
} from "../../api/grupo7.api";
import RegistroCliente from "../../components/RegistroCliente";
import Paginador from "../../components/Paginador.jsx";
import { paginarLista } from "../../utils/paginacion.js";
import { useConfirmacion } from "../../components/ConfirmacionProvider.jsx";


export default function PanelFarmacia() {
  const { usuario } = useAuth();
  const confirmar = useConfirmacion();

  const [pedidos, setPedidos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [orden, setOrden] = useState("recientes");
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(10);
  const [editando, setEditando] = useState(null);
  const [direccion, setDireccion] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const cargar = useCallback(async () => {
    setCargando(true);
    setError("");

    try {
      const datos = await consultarPedidosAdminNeon(usuario.token);
      setPedidos(datos.pedidos);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, [usuario.token]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const editar = (pedido) => {
    setEditando(pedido.id);
    setDireccion(pedido.direccion);
    setError("");
    setMensaje("");
  };

  const guardar = async (id) => {
    if(guardando)return;
    const pedido=pedidos.find(p=>p.id===id);
    if (!await confirmar({ titulo: "¿Guardar cambios del pedido?",
      descripcion: "Se modificará la dirección de entrega del pedido pendiente.",
      detalles: [["Pedido", pedido?.codigo || id], ["Nueva dirección", direccion]], accion: "Sí, actualizar pedido" })) return;
    setGuardando(true);
    setError("");

    try {
      const resultado = await actualizarPedidoAdminNeon(
        usuario.token,
        id,
        direccion
      );

      setMensaje(resultado.mensaje);
      setEditando(null);
      await cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const filtrados = useMemo(() => pedidos.filter((p) => {
    const coincide = [p.codigo, p.nombre, p.apellido, p.producto, p.estado, p.direccion]
      .join(" ").toLocaleLowerCase("es").includes(busqueda.trim().toLocaleLowerCase("es"));
    return coincide && (filtro === "todos" || p.estado === filtro);
  }).sort((a,b) => {
    if (orden === "antiguos") return Number(a.id) - Number(b.id);
    if (orden === "importe") return Number(b.total) - Number(a.total);
    return Number(b.id) - Number(a.id);
  }), [pedidos, busqueda, filtro, orden]);
  const paginacion = paginarLista(filtrados, pagina, porPagina);

  const colorEstado = (estado) => {
    if (estado === "pagado") return "#15803d";
    if (estado === "despachado") return "#2563eb";
    if (estado === "pendiente") return "#b45309";
    return "#475569";
  };

  const celda = {
    padding: 12,
    borderBottom: "1px solid #e2e8f0",
    textAlign: "left"
  };

  const boton = {
    padding: "9px 14px",
    background: "#16a34a",
    color: "white",
    border: 0,
    borderRadius: 7,
    cursor: "pointer"
  };

  return (
    <main style={{
      maxWidth: 1200,
      margin: "30px auto",
      padding: 25,
      fontFamily: "Arial, sans-serif"
    }}>
      <Link to="/inicio">Volver al inicio</Link>

      <p className="pro-eyebrow">FARMASALUD PERÚ</p>
      <h1 style={{ color: "#0f3d24" }}>Administrar pedidos</h1>
      <p className="catalogo-nota">Consulta pedidos, filtra por estado y actualiza la dirección de entrega cuando corresponda.</p>

      <details className="g7-order-details">
        <summary>+ Registrar nuevo cliente de FarmaSalud</summary>
        <RegistroCliente modulo="farmacia" />
      </details>

      <p>
        Administrador: <strong>{usuario.nombre}</strong>
      </p>

      <section style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 12,
        marginBottom: 25
      }}>
        <Link to="/farmacia/productos" className="g7-table-action">Gestionar medicamentos</Link>
        <Link to="/farmacia/cobros">
          <button style={boton}>Consultar cobros</button>
        </Link>

        <button
          style={boton}
          onClick={cargar}
          disabled={cargando}
        >
          Actualizar listado
        </button>
      </section>

      <section className="g7-order-overview">
        {[
          ["Total de pedidos", pedidos.length],
          ["Pendientes", pedidos.filter(p => p.estado === "pendiente").length],
          ["Pagados", pedidos.filter(p => p.estado === "pagado").length],
          ["Despachados", pedidos.filter(p => p.estado === "despachado").length]
        ].map(([titulo, valor]) => (
          <article
            key={titulo}
            className="g7-order-kpi"
          >
            <span>{titulo}</span>
            <strong>{valor}</strong>
          </article>
        ))}
      </section>

      <section className="g7-order-section">
        <div className="g7-list-head"><h2>Listado de pedidos</h2><span className="g7-list-stats">{pedidos.length} pedidos registrados</span></div>
        <div className="g7-list-toolbar">
          <label className="g7-list-search">Buscar pedido
            <input id="buscar-pedido" className="g7-list-control" type="search"
              placeholder="Código, cliente, producto o dirección…" value={busqueda}
              onChange={e => {setBusqueda(e.target.value);setPagina(1);}} />
          </label>
          <label className="g7-list-select">Estado
            <select className="g7-list-control" value={filtro} onChange={e => {setFiltro(e.target.value);setPagina(1);}}>
              <option value="todos">Todos los estados</option><option value="pendiente">Pendientes</option>
              <option value="pagado">Pagados</option><option value="despachado">Despachados</option><option value="cancelado">Cancelados</option>
            </select>
          </label>
          <label className="g7-list-select">Ordenar
            <select className="g7-list-control" value={orden} onChange={e => {setOrden(e.target.value);setPagina(1);}}>
              <option value="recientes">Más recientes</option><option value="antiguos">Más antiguos</option><option value="importe">Mayor importe</option>
            </select>
          </label>
        </div>

      {error && (
        <p role="alert" style={{ color: "#dc2626" }}>
          {error}
        </p>
      )}

      {mensaje && (
        <p role="status" style={{ color: "#15803d" }}>
          {mensaje}
        </p>
      )}

      {cargando ? (
        <p>Cargando pedidos...</p>
      ) : (
        <div className="g7-table-scroll">
          <table className="g7-data-table">
            <thead>
              <tr style={{ background: "#d1fae5" }}>
                {[
                  "Código",
                  "Cliente",
                  "Producto",
                  "Dirección",
                  "Total",
                  "Estado",
                  "Acciones"
                ].map(t => (
                  <th key={t} style={celda}>{t}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {paginacion.items.map(p => (
                <tr key={p.id}>
                  <td style={celda}><Link to={`/farmacia/historial/${encodeURIComponent(p.codigo)}`}>{p.codigo}</Link></td>
                  <td style={celda}>
                    {p.nombre} {p.apellido}
                  </td>
                  <td style={celda}>{p.producto}</td>

                  <td style={celda}>
                    {editando === p.id ? (
                      <input
                        aria-label="Dirección de entrega"
                        value={direccion}
                        onChange={e => setDireccion(e.target.value)}
                        minLength={5}
                        maxLength={500}
                      />
                    ) : p.direccion}
                  </td>

                  <td style={celda}>
                    S/ {Number(p.total).toFixed(2)}
                  </td>

                  <td style={celda}>
                    <span className={`g7-status-pill ${p.estado}`} style={{color:colorEstado(p.estado)}}>{p.estado}</span>
                  </td>

                  <td style={celda}>
                    {editando === p.id ? (
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          style={boton}
                          disabled={guardando}
                          onClick={() => guardar(p.id)}
                        >
                          Guardar
                        </button>
                        <button onClick={() => setEditando(null)}>
                          Cancelar
                        </button>
                      </div>
                    ) : (

                        <button
                        style={{
                            ...boton,
                            background: p.estado === "pendiente"
                            ? "#16a34a"
                            : "#94a3b8",
                            cursor: p.estado === "pendiente"
                            ? "pointer"
                            : "not-allowed"
                        }}
                        disabled={p.estado !== "pendiente"}
                        onClick={() => editar(p)}
                        >
                        {p.estado === "pendiente" ? "Editar" : "Bloqueado"}
                        </button>

                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtrados.length === 0 && (
            <p className="g7-table-empty">No se encontraron pedidos con los filtros seleccionados.</p>
          )}
        </div>
      )}
        <Paginador total={filtrados.length} pagina={paginacion.paginaActual} porPagina={porPagina} onPagina={setPagina}
          onPorPagina={n=>{setPorPagina(n);setPagina(1);}} opciones={[10,20,50]} sustantivo="pedidos" />
      </section>
    </main>
  );
}
