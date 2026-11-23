import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { apiRequest, apiUrl } from "../api/client.js";
import { consultarCatalogoAdminNeon, crearMedicamentoNeon, actualizarMedicamentoNeon } from "../api/grupo7.api.js";
import { validarArchivoImagen } from "../utils/validarImagen.js";
import "../styles/catalogo.css";
import Paginador from "../components/Paginador.jsx";
import { paginarLista } from "../utils/paginacion.js";
import { useConfirmacion } from "../components/ConfirmacionProvider.jsx";

const vacio = { sku: "", nombre: "", descripcion: "", precio: "", stock: "0", activo: true, imagenId: "" };

export default function ImagenesFarmaciaAdmin() {
  const { usuario } = useAuth();
  const confirmar = useConfirmacion();
  const [productos, setProductos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [orden, setOrden] = useState("nombre");
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(10);
  const [imagenes, setImagenes] = useState([]);
  const [form, setForm] = useState(vacio);
  const [editando, setEditando] = useState(null);
  const [archivo, setArchivo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [revisandoImagen, setRevisandoImagen] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [errorFoto, setErrorFoto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(true);
  const fileInputRef = useRef(null);
  const validacionRef = useRef(0);

  const actualizar = useCallback(async () => {
    const [catalogo, imgs] = await Promise.all([
      consultarCatalogoAdminNeon(usuario.token),
      apiRequest("/farmacia/imagenes")
    ]);
    setProductos(catalogo.productos);
    setImagenes(imgs.imagenes);
  }, [usuario.token]);

  useEffect(() => {
    let activo = true;
    actualizar().catch(e => { if (activo) setError(e.message); })
      .finally(() => { if (activo) setCargando(false); });
    return () => { activo = false; };
  }, [actualizar]);

  useEffect(() => {
    if (!archivo) { setPreviewUrl(""); return; }
    const url = URL.createObjectURL(archivo);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [archivo]);

  const cambiar = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const limpiarArchivo = () => {
    validacionRef.current += 1;
    setArchivo(null);
    setErrorFoto("");
    setRevisandoImagen(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const limpiar = () => {
    setMostrarFormulario(false);
    limpiarArchivo();
    setEditando(null);
    setForm(vacio);
    setError("");
  };
  const editar = p => {
    setMostrarFormulario(true);
    limpiarArchivo();
    setEditando(p.id);
    setForm({
      sku: p.sku, nombre: p.nombre, descripcion: p.descripcion,
      precio: String(p.precio), stock: String(p.stock), activo: p.activo,
      imagenId: p.imagen_id ? String(p.imagen_id) : ""
    });
    setMensaje("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const seleccionarArchivo = async e => {
    const seleccionado = e.target.files?.[0] || null;
    const revision = ++validacionRef.current;
    setArchivo(null);
    setErrorFoto("");
    if (!seleccionado) { setRevisandoImagen(false); return; }
    setRevisandoImagen(true);
    const error = await validarArchivoImagen(seleccionado);
    if (revision !== validacionRef.current) return;
    setRevisandoImagen(false);
    if (error) {
      setErrorFoto(error);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setArchivo(seleccionado);
    setMensaje("");
  };

  const subirImagen = async imagen => {
    // El usuario autoriza la subida al guardar el medicamento: un solo flujo.
    const res = await fetch(apiUrl("/farmacia/imagenes"), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${usuario.token}`,
        "Content-Type": imagen.type,
        "X-File-Name": encodeURIComponent(imagen.name).slice(0, 400)
      },
      body: imagen
    });
    let datos = {};
    try { datos = await res.json(); } catch { /* respuesta inesperada */ }
    if (!res.ok) throw new Error(datos.error || `No se pudo subir la imagen (HTTP ${res.status})`);
    if (!datos.imagen?.id) throw new Error("Object Storage no devolvió el identificador de la imagen");
    return String(datos.imagen.id);
  };

  const guardar = async e => {
    e.preventDefault();
    if (revisandoImagen || guardando) return;
    // Confirma antes de subir archivos al bucket y antes de escribir en Neon.
    if (archivo) {
      const err = await validarArchivoImagen(archivo);
      if (err) { setErrorFoto(err); return; }
    }
    if (!await confirmar({
      titulo: editando ? "¿Guardar cambios del medicamento?" : "¿Registrar medicamento?",
      descripcion: editando ? "Se actualizarán los datos oficiales de este medicamento en el catálogo." : "El medicamento se añadirá al inventario y, si elegiste una fotografía nueva, se subirá a Object Storage.",
      detalles: [["Medicamento", form.nombre], ["SKU", form.sku], ["Precio oficial", `S/ ${Number(form.precio).toFixed(2)}`], ["Stock", form.stock], ["Estado", form.activo ? "Activo" : "Inactivo"], ["Fotografía", archivo ? archivo.name : form.imagenId ? "Imagen existente" : "Sin fotografía"]],
      accion: editando ? "Sí, guardar cambios" : "Sí, registrar medicamento"
    })) return;
    setError(""); setMensaje(""); setErrorFoto("");
    setGuardando(true);
    try {
      // La comprobación del servidor es obligatoria incluso si React la superó.
      if (archivo) {
        const error = await validarArchivoImagen(archivo);
        if (error) { setErrorFoto(error); return; }
      }
      let imagenId = form.imagenId || null;
      if (archivo) {
        imagenId = await subirImagen(archivo);
        // Si el guardado del producto falla, la foto sigue disponible para reintentar.
        setForm(prev => ({ ...prev, imagenId }));
        limpiarArchivo();
      }
      const datos = { ...form, stock: Number(form.stock), imagenId };
      if (editando) await actualizarMedicamentoNeon(usuario.token, editando, datos);
      else await crearMedicamentoNeon(usuario.token, datos);
      setMensaje(editando ? "Medicamento e imagen actualizados correctamente." : "Medicamento registrado correctamente.");
      limpiar();
      await actualizar();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const productosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLocaleLowerCase("es");
    return productos.filter(p => {
      const coincide = !termino || `${p.nombre} ${p.sku} ${p.descripcion || ""}`.toLocaleLowerCase("es").includes(termino);
      const stock = Number(p.stock) || 0;
      const estado = filtro === "todos" ||
        (filtro === "activos" && p.activo) ||
        (filtro === "inactivos" && !p.activo) ||
        (filtro === "bajo" && p.activo && stock > 0 && stock <= 5) ||
        (filtro === "agotados" && stock <= 0);
      return coincide && estado;
    }).sort((a, b) => {
      if (orden === "stock") return Number(a.stock) - Number(b.stock);
      if (orden === "precio-asc") return Number(a.precio) - Number(b.precio);
      if (orden === "precio-desc") return Number(b.precio) - Number(a.precio);
      if (orden === "recientes") return Number(b.id) - Number(a.id);
      return String(a.nombre).localeCompare(String(b.nombre), "es", { sensitivity: "base" });
    });
  }, [productos, busqueda, filtro, orden]);
  const paginacion = paginarLista(productosFiltrados, pagina, porPagina);
  const reiniciarFiltros = () => setPagina(1);

  const imagenSeleccionada = archivo ? previewUrl
    : form.imagenId ? apiUrl(`/farmacia/imagenes/${form.imagenId}/archivo`) : "";

  return <main className="catalogo-admin-main">
    <Link to="/farmacia/admin/pedidos">← Volver a administración</Link>
    <h1 className="catalogo-titulo" style={{ marginTop: 17 }}>Gestión de medicamentos</h1>
    <p className="catalogo-subtitulo">FarmaSalud · Registra el medicamento y su fotografía en un solo formulario. Los precios y el stock se guardan en Neon; la imagen, en Object Storage.</p>
    {error && <p className="catalogo-alerta" role="alert">{error}</p>}
    {mensaje && <p className="catalogo-ok" role="status">{mensaje}</p>}
    <div className="g7-inventory-layout">
      <div className="g7-list-head">
        <div><h2>Inventario de medicamentos</h2><p className="catalogo-nota">Busca, filtra y edita los productos registrados en Neon.</p></div>
        <button type="button" className="g7-inventory-new" onClick={() => { if (mostrarFormulario) limpiar(); else { limpiar(); setMostrarFormulario(true); } }}>
          {mostrarFormulario ? "Cerrar formulario" : "+ Nuevo medicamento"}
        </button>
      </div>
      {mostrarFormulario && <section className="catalogo-panel catalogo-panel-form g7-inventory-editor" style={{ marginTop: 0 }}>
        <div className="catalogo-panel-heading">
          <div>
            <p className="catalogo-eyebrow">CATÁLOGO FARMASALUD</p>
            <h2>{editando ? "Editar medicamento" : "Registrar medicamento"}</h2>
            <p className="catalogo-nota">Completa los datos del producto y agrega su imagen.</p>
          </div>
          <span className="catalogo-estado">{editando ? "Edición" : "Nuevo"}</span>
        </div>
        <form onSubmit={guardar} className="catalogo-formulario">
          <div className="catalogo-foto-bloque">
            <div className="catalogo-foto-top">
              <span className="catalogo-foto-titulo">Fotografía del medicamento</span>
              <span className="catalogo-foto-tag">JPG · PNG · WebP</span>
            </div>
            <div className="catalogo-foto-contenido">
              <div className="catalogo-foto-vista" aria-label="Vista previa de la fotografía">
                {imagenSeleccionada ? <img src={imagenSeleccionada} alt={form.nombre ? `Fotografía de ${form.nombre}` : "Vista previa del medicamento"} />
                  : <div className="catalogo-foto-sin-imagen"><span aria-hidden="true">▧</span><small>Sin fotografía</small></div>}
              </div>
              <div className="catalogo-foto-opciones">
                <input ref={fileInputRef} id="foto-medicamento" className="catalogo-file-oculto"
                  type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  aria-label="Archivo de imagen del medicamento" tabIndex={-1}
                  aria-describedby={errorFoto ? "foto-ayuda foto-error" : "foto-ayuda"}
                  aria-invalid={Boolean(errorFoto)} disabled={guardando || revisandoImagen} onChange={seleccionarArchivo} />
                <button type="button" className="catalogo-upload-action"
                  disabled={guardando || revisandoImagen}
                  onClick={() => fileInputRef.current?.click()}>
                  <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18"
                    fill="none" stroke="currentColor" strokeWidth="1.9"
                    strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="3" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="m21 15-5-5L5 21" />
                  </svg>
                  <span>{revisandoImagen ? "Validando imagen…" : archivo ? "Cambiar imagen" : "Seleccionar imagen"}</span>
                </button>
                <p id="foto-ayuda" className="catalogo-nota">Solo imágenes reales JPG, PNG o WebP. Máximo 5 MB.</p>
                {revisandoImagen && <p className="catalogo-foto-estado" role="status">Validando la imagen…</p>}
                {archivo && <p className="catalogo-foto-estado">✓ {archivo.name}</p>}
                {errorFoto && <p id="foto-error" className="catalogo-foto-error" role="alert">{errorFoto}</p>}
                {(archivo || form.imagenId) && <button className="catalogo-foto-quitar" type="button" disabled={guardando} onClick={async () => {
                  if (!await confirmar({ titulo: "¿Quitar fotografía del formulario?",
                    descripcion: "Se quitará la imagen seleccionada de este formulario. No se borrará el archivo del bucket; el cambio en el producto se aplicará solamente cuando guardes.",
                    detalles: [["Medicamento", form.nombre || "Nuevo medicamento"]], accion: "Sí, quitar imagen", variante: "peligro" })) return;
                  limpiarArchivo(); cambiar("imagenId", "");
                }}>Quitar imagen</button>}
              </div>
            </div>
            <label className="catalogo-campo catalogo-reutilizar">
              O utilizar una fotografía ya guardada
              <select value={archivo ? "" : form.imagenId} onChange={e => { limpiarArchivo(); cambiar("imagenId", e.target.value); }} disabled={guardando}>
                <option value="">{archivo ? "Nueva fotografía seleccionada" : "Sin imagen"}</option>
                {form.imagenId && !imagenes.some(im => String(im.id) === String(form.imagenId)) && <option value={form.imagenId}>Fotografía actual (#{form.imagenId})</option>}
                {imagenes.map(im => <option key={im.id} value={String(im.id)}>{im.nombre} (#{im.id})</option>)}
              </select>
            </label>
          </div>

          <div className="catalogo-dos">
            <label className="catalogo-campo">Código SKU<input value={form.sku} required minLength="3" maxLength="40" onChange={e => cambiar("sku", e.target.value)} placeholder="PARA500X20" /></label>
            <label className="catalogo-campo">Precio oficial (S/)<input value={form.precio} required inputMode="decimal" onChange={e => cambiar("precio", e.target.value)} placeholder="24.50" /></label>
          </div>
          <label className="catalogo-campo">Nombre del medicamento<input value={form.nombre} required minLength="3" maxLength="150" onChange={e => cambiar("nombre", e.target.value)} placeholder="Ej.: Paracetamol 500 mg x 20" /></label>
          <label className="catalogo-campo">Descripción<textarea rows="3" maxLength="1000" value={form.descripcion} onChange={e => cambiar("descripcion", e.target.value)} placeholder="Presentación e información del medicamento" /></label>
          <label className="catalogo-campo">Stock disponible<input type="number" min="0" max="1000000" step="1" required value={form.stock} onChange={e => cambiar("stock", e.target.value)} /></label>
          <label className="catalogo-fila"><input type="checkbox" checked={form.activo} onChange={e => cambiar("activo", e.target.checked)} /> <strong>Visible en el catálogo de clientes</strong></label>
          <div className="catalogo-fila catalogo-acciones">
            <button className="catalogo-boton" disabled={guardando || revisandoImagen}>
              {guardando ? "Guardando medicamento e imagen…" : editando ? "Guardar cambios" : "Registrar medicamento"}
            </button>
            {editando && <button type="button" className="catalogo-boton secundario" disabled={guardando} onClick={limpiar}>Cancelar edición</button>}
          </div>
        </form>
      </section>}
      <section className="catalogo-panel g7-inventory-list" style={{ marginTop: 0 }}>
        <div className="g7-list-head"><h2>Medicamentos registrados</h2><span className="g7-list-stats">{productos.length} productos en total</span></div>
        <div className="g7-list-toolbar">
          <label className="g7-list-search">Buscar por nombre, SKU o descripción
            <input className="g7-list-control" type="search" placeholder="Ej.: paracetamol, PARA500X20…" value={busqueda} onChange={e => { setBusqueda(e.target.value); reiniciarFiltros(); }} />
          </label>
          <label className="g7-list-select">Estado / stock
            <select className="g7-list-control" value={filtro} onChange={e => { setFiltro(e.target.value); reiniciarFiltros(); }}>
              <option value="todos">Todos</option><option value="activos">Activos</option><option value="inactivos">Inactivos</option>
              <option value="bajo">Stock bajo (1–5)</option><option value="agotados">Agotados</option>
            </select>
          </label>
          <label className="g7-list-select">Ordenar
            <select className="g7-list-control" value={orden} onChange={e => { setOrden(e.target.value); reiniciarFiltros(); }}>
              <option value="nombre">Nombre A–Z</option><option value="recientes">Más recientes</option>
              <option value="stock">Menor stock</option><option value="precio-asc">Menor precio</option><option value="precio-desc">Mayor precio</option>
            </select>
          </label>
        </div>
        {cargando ? <p role="status">Cargando medicamentos…</p> : productosFiltrados.length === 0 ?
          <div className="g7-table-empty">{productos.length ? "No hay medicamentos para los filtros seleccionados." : "No hay medicamentos. Pulsa «Nuevo medicamento» para registrar el primero."}</div> :
          <div className="g7-table-scroll"><table className="g7-data-table">
            <thead><tr><th>Medicamento</th><th>Precio oficial</th><th>Stock</th><th>Estado</th><th>Acción</th></tr></thead>
            <tbody>{paginacion.items.map(p => <tr key={p.id}>
              <td><div className="g7-table-product"><div className="g7-table-photo">{p.imagen_id ? <img loading="lazy" src={apiUrl(`/farmacia/imagenes/${p.imagen_id}/archivo`)} alt={p.nombre}/> : <span>Sin foto</span>}</div>
                <div><strong>{p.nombre}</strong><small>SKU: {p.sku}</small></div></div></td>
              <td><span className="g7-table-price">S/ {Number(p.precio).toFixed(2)}</span></td>
              <td><strong>{p.stock}</strong> <span className="g7-table-muted">uds.</span></td>
              <td><span className={`g7-status-pill ${p.activo && Number(p.stock) > 0 ? "despachado" : p.activo ? "pendiente" : "cancelado"}`}>
                {p.activo ? Number(p.stock) > 0 ? "Activo" : "Sin stock" : "Inactivo"}</span></td>
              <td><button type="button" className="g7-table-action" onClick={() => editar(p)}>Editar</button></td>
            </tr>)}</tbody>
          </table></div>}
        <Paginador total={productosFiltrados.length} pagina={paginacion.paginaActual} porPagina={porPagina}
          onPagina={setPagina} onPorPagina={n => { setPorPagina(n); setPagina(1); }} opciones={[10, 20, 50]}
          sustantivo="medicamentos" />
      </section>
    </div>
  </main>;
}
