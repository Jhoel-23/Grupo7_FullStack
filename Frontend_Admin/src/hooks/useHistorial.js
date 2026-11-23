import { useCallback, useEffect, useState } from "react";
import { consultarSeguimientoNeon } from "../api/farmacia.api.js";

/** Hook de empleado y administrador: historial de cambios cada cinco segundos. */
export function useHistorial(token, codigo) {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState("");
  const cargar = useCallback(async () => {
    if (!codigo || !token) return;
    try { setDatos(await consultarSeguimientoNeon(token, codigo)); setError(""); }
    catch (e) { setError(e.message); }
  }, [token, codigo]);
  useEffect(() => {
    cargar();
    const intervalo = setInterval(cargar, 5000);
    return () => clearInterval(intervalo);
  }, [cargar]);
  return { datos, error, cargar };
}
