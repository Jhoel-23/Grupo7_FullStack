import { useCallback, useEffect, useState } from "react";
import { consultarCuentasNeon } from "../api/banco.api.js";

/** Reusable banking data hook. Each token has its own request lifecycle. */
export function useMisCuentas(token) {
  const [cuentas, setCuentas] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const recargar = useCallback(async () => {
    setCargando(true); setError("");
    try {
      const datos = await consultarCuentasNeon(token);
      setCuentas(datos.cuentas || []);
      setMovimientos(datos.movimientos || []);
    } catch (e) { setError(e.message); }
    finally { setCargando(false); }
  }, [token]);
  useEffect(() => { recargar(); }, [recargar]);
  return { cuentas, movimientos, cargando, error, recargar };
}
