import { Link } from "react-router-dom";

// Esta página evita pantallas blancas al abrir una ruta desconocida.
export default function NoEncontrada() {
  return <main><h1>Página no encontrada</h1><p>La dirección solicitada no existe.</p><Link to="/inicio">Volver al inicio</Link></main>;
}
