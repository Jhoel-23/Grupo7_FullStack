
import { createContext, useContext, useEffect, useRef, useState } from "react";
import AccesoAnimado from "../components/AccesoAnimado";
import { iniciarSesionNeon } from "../api/grupo7.api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [cerrandoSesion, setCerrandoSesion] = useState(false);
  const cierreEnCurso = useRef(false);

  const [usuario, setUsuario] = useState(() => {
    try {
      const guardado = sessionStorage.getItem("usuario");
      return guardado ? JSON.parse(guardado) : null;
    } catch {
      return null;
    }
  });

  const iniciarSesion = async (correo, password) => {
    const datos = await iniciarSesionNeon(correo, password);

    setUsuario(datos);
    sessionStorage.setItem("usuario", JSON.stringify(datos));

    return datos;
  };

  const cerrarSesion = () => {
    setUsuario(null);
    sessionStorage.removeItem("usuario");
    sessionStorage.removeItem("usuarioDemo");
  };

  // Al salir, las credenciales se eliminan inmediatamente. La animación
  // continúa sobre la pantalla de login, sin mantener una sesión abierta.
  const salirConAnimacion = () => {
    if (cierreEnCurso.current) return;
    cierreEnCurso.current = true;
    setCerrandoSesion(true);
    cerrarSesion();
  };

  useEffect(() => {
    if (!cerrandoSesion) return undefined;
    const temporizador = window.setTimeout(() => {
      setCerrandoSesion(false);
      cierreEnCurso.current = false;
    }, 1300);
    return () => window.clearTimeout(temporizador);
  }, [cerrandoSesion]);

  const tieneRol = (modulo, rolesPermitidos = []) => {
    if (!usuario) {
      return false;
    }

    return usuario.roles.some(
      (r) =>
        r.modulo === modulo &&
        (rolesPermitidos.length === 0 ||
          rolesPermitidos.includes(r.rol))
    );
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        iniciarSesion,
        cerrarSesion,
        salirConAnimacion,
        tieneRol
      }}
    >
      {children}
      <AccesoAnimado fase={cerrandoSesion ? "saliendo" : "idle"} />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
