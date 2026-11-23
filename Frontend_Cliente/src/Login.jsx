import { PORTAL } from "./config/portal";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import AccesoAnimado from "./components/AccesoAnimado";

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fase, setFase] = useState("idle");

  const { iniciarSesion, cerrarSesion } = useAuth();
  const navigate = useNavigate();
  const cargando = fase !== "idle";

  const ingresar = async (e) => {
    e.preventDefault();
    if (cargando) return;
    setError("");
    setFase("verificando");

    try {
      const datos = await iniciarSesion(correo, password);
      const permitido = datos.roles?.some(r => PORTAL === "cliente"
        ? r.rol === "cliente"
        : ["administrador", "empleado"].includes(r.rol));

      if (!permitido) {
        cerrarSesion();
        throw new Error(PORTAL === "cliente"
          ? "Esta cuenta corresponde al portal de gestión. Abre la URL de administración."
          : "Esta cuenta corresponde al portal de clientes. Abre la URL del cliente.");
      }

      // Animación de transición SOLO después de validar la autenticación y los roles.
      setFase("autorizado");
      await esperar(900);
      navigate("/inicio", { replace: true });
    } catch (err) {
      setError(err?.message || "No se pudo iniciar sesión.");
      setFase("idle");
    }
  };

  return (
    <div className="login-page">
      <form onSubmit={ingresar} className="login-card" aria-busy={cargando}>
        <div className="login-logo">G7</div>
        <h2>Bienvenido al Grupo 7 · {PORTAL === "cliente" ? "Clientes" : "Gestión"}</h2>
        <p className="login-subtitle">FarmaSalud Perú · Banco Andino Perú</p>
        <label htmlFor="correo">Correo electrónico</label>
        <input id="correo" type="email" autoComplete="username" placeholder="usuario@correo.com" value={correo} onChange={(e) => setCorreo(e.target.value)} disabled={cargando} required />
        <label htmlFor="password">Contraseña</label>
        <input id="password" type="password" autoComplete="current-password" placeholder="Ingresa tu contraseña" value={password} onChange={(e) => setPassword(e.target.value)} disabled={cargando} required />
        {error && <p role="alert">{error}</p>}
        <button type="submit" disabled={cargando}>{cargando ? "Ingresando..." : "Iniciar sesión"}</button>
      </form>
      <AccesoAnimado fase={fase} />
    </div>
  );
}
