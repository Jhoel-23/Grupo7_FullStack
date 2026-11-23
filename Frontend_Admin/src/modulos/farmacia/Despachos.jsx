
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Paginador from "../../components/Paginador.jsx";
import { paginarLista } from "../../utils/paginacion.js";
import { useConfirmacion } from "../../components/ConfirmacionProvider.jsx";
import {
  consultarDespachosNeon,
  despacharPedidoNeon
} from "../../api/grupo7.api";

export default function Despachos() {
  const { usuario } = useAuth();
  const confirmar = useConfirmacion();

  const [pedidos, setPedidos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(10);
  const filtrados = useMemo(() => pedidos.filter(p => {
    const coincide = `${p.codigo} ${p.nombre} ${p.apellido} ${p.producto} ${p.estado}`.toLocaleLowerCase("es")
      .includes(busqueda.trim().toLocaleLowerCase("es"));
    return coincide && (filtro === "todos" || p.estado === filtro);
  }).sort((a,b) => Number(b.id)-Number(a.id)), [pedidos,busqueda,filtro]);
  const paginacion = paginarLista(filtrados,pagina,porPagina);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(null);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const cargarPedidos = useCallback(async () => {
    setCargando(true);
    setError("");

    try {
      const datos = await consultarDespachosNeon(usuario.token);
      setPedidos(datos.pedidos);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, [usuario.token]);

  useEffect(() => {
    cargarPedidos();
  }, [cargarPedidos]);

  useEffect(() => {
    const id = setInterval(() => { if (procesando === null) cargarPedidos(); }, 5000);
    return () => clearInterval(id);
  }, [cargarPedidos, procesando]);

  const despachar = async (pedido) => {
    if (procesando !== null) return;

    const confirmado = await confirmar({ titulo: "¿Confirmar despacho?",
      descripcion: "El pedido pasará a estado despachado. Verifica que esté preparado para entregar.",
      detalles: [["Pedido", pedido.codigo], ["Producto", pedido.producto], ["Total", `S/ ${Number(pedido.total).toFixed(2)}`]], accion: "Sí, despachar pedido"
    });

    if (!confirmado) return;

    setProcesando(pedido.id);
    setError("");
    setMensaje("");

    try {
      const resultado = await despacharPedidoNeon(
        usuario.token,
        pedido.id
      );

      setMensaje(resultado.mensaje);
      await cargarPedidos();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(null);
    }
  };

  return (
    <main style={{
      maxWidth: 1100,
      margin: "30px auto",
      padding: 25,
      fontFamily: "Arial, sans-serif"
    }}>
      <Link to="/inicio">Volver al inicio</Link>

      <h1 style={{ color: "#0f3d24" }}>
        FarmaSalud Perú
      </h1>

      <h2>Despacho de pedidos delivery</h2>

      <p>
        Empleado: <strong>{usuario.nombre}</strong>
      </p>

      <button
        onClick={cargarPedidos}
        disabled={cargando}
        style={{
          background: "#16a34a",
          color: "white",
          padding: 12,
          border: 0,
          borderRadius: 8,
          marginBottom: 20
        }}
      >
        Actualizar pedidos
      </button>

      <div className="g7-list-toolbar">
        <label className="g7-list-search">Buscar pedido
          <input type="search" className="g7-list-control" placeholder="Código, cliente o medicamento…" value={busqueda}
            onChange={e => {setBusqueda(e.target.value);setPagina(1);}} />
        </label>
        <label className="g7-list-select">Estado
          <select className="g7-list-control" value={filtro} onChange={e => {setFiltro(e.target.value);setPagina(1);}}>
            <option value="todos">Todos</option><option value="pagado">Por despachar</option><option value="despachado">Despachados</option>
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
      ) : pedidos.length === 0 ? (
        <p>No existen pedidos pagados para despachar.</p>
      ) : (
        <div className="g7-table-scroll">
          <table className="g7-data-table">
            <thead>
              <tr style={{ background: "#d1fae5" }}>
                {[
                  "Pedido",
                  "Cliente",
                  "Producto",
                  "Total",
                  "Estado",
                  "Acción"
                ].map((titulo) => (
                  <th
                    key={titulo}
                    style={{
                      padding: 12,
                      textAlign: "left"
                    }}
                  >
                    {titulo}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {paginacion.items.map((pedido) => (
                <tr key={pedido.id}>
                  <td style={{ padding: 12 }}>
                    <Link to={`/farmacia/historial/${encodeURIComponent(pedido.codigo)}`}>{pedido.codigo}</Link>
                  </td>

                  <td style={{ padding: 12 }}>
                    {pedido.nombre} {pedido.apellido}
                  </td>

                  <td style={{ padding: 12 }}>
                    {pedido.producto}
                  </td>

                  <td style={{ padding: 12 }}>
                    S/ {Number(pedido.total).toFixed(2)}
                  </td>

                  <td style={{ padding: 12 }}>
                    <span style={{
                      color: pedido.estado === "pagado"
                        ? "#15803d"
                        : "#475569",
                      fontWeight: "bold"
                    }}>
                      {pedido.estado}
                    </span>
                  </td>

                  <td style={{ padding: 12 }}>
                    <button
                      disabled={
                        pedido.estado !== "pagado" ||
                        procesando !== null
                      }
                      onClick={() => despachar(pedido)}
                      style={{
                        padding: "9px 13px",
                        background: pedido.estado === "pagado"
                          ? "#16a34a"
                          : "#94a3b8",
                        color: "white",
                        border: 0,
                        borderRadius: 7
                      }}
                    >
                      {procesando === pedido.id
                        ? "Procesando..."
                        : pedido.estado === "pagado"
                          ? "Despachar"
                          : "Despachado"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Paginador total={filtrados.length} pagina={paginacion.paginaActual} porPagina={porPagina} onPagina={setPagina}
        onPorPagina={n=>{setPorPagina(n);setPagina(1);}} opciones={[10,20,50]} sustantivo="pedidos" />
    </main>
  );
}
