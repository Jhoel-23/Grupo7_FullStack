import { useCallback, useEffect, useState } from "react";
import { consultarSeguimientoNeon } from "../api/grupo7.api";
/** Consulta cada cinco segundos. Siempre cancela el intervalo al cambiar de pedido. */
export function useSeguimiento(token, codigo) {
 const [datos,setDatos]=useState(null);
 const [error,setError]=useState("");
 const cargar=useCallback(async()=>{
  if(!codigo || !token) return;
  try { const resultado=await consultarSeguimientoNeon(token,codigo); setDatos(resultado); setError(""); }
  catch(e){setError(e.message);setDatos(null)}
 },[token,codigo]);
 useEffect(()=>{
  setDatos(null); setError("");
  if(!codigo || !token) return;
  cargar();
  const intervalo=setInterval(cargar,5000);
  return ()=>clearInterval(intervalo);
 },[codigo,token,cargar]);
 return {datos,error,cargar};
}
