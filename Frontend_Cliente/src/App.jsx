import { ConfirmacionProvider } from "./components/ConfirmacionProvider.jsx";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AppLayout from "./components/AppLayout";
import RutaProtegida from "./components/RutaProtegida";
import Login from "./Login";
import InicioPage from "./pages/InicioPage";
import NoEncontrada from "./pages/NoEncontrada";
import AbrirCuenta from "./integraciones/AbrirCuenta";
import MisCuentas from "./modulos/banco/MisCuentas";
import PagoDelivery from "./integraciones/PagoDelivery";
import Seguimiento from "./integraciones/Seguimiento";
import ImagenesFarmacia from "./pages/ImagenesFarmacia";
export default function App() {
 return <AuthProvider><ConfirmacionProvider><BrowserRouter><AppLayout><Routes>
  <Route path="/" element={<Navigate to="/inicio" replace />} />
  <Route path="/login" element={<Login />} />
  <Route path="/inicio" element={<RutaProtegida><InicioPage /></RutaProtegida>} />
  <Route path="/banco/abrir-cuenta" element={<RutaProtegida modulo="banco" rolesPermitidos={["cliente"]}><AbrirCuenta /></RutaProtegida>} />
  <Route path="/banco/mis-cuentas" element={<RutaProtegida modulo="banco" rolesPermitidos={["cliente"]}><MisCuentas /></RutaProtegida>} />
  <Route path="/farmacia/pedido" element={<RutaProtegida modulo="farmacia" rolesPermitidos={["cliente"]}><PagoDelivery /></RutaProtegida>} />
  <Route path="/farmacia/catalogo" element={<RutaProtegida modulo="farmacia" rolesPermitidos={["cliente"]}><ImagenesFarmacia /></RutaProtegida>} />
  <Route path="/farmacia/imagenes" element={<RutaProtegida modulo="farmacia" rolesPermitidos={["cliente"]}><ImagenesFarmacia /></RutaProtegida>} />
  <Route path="/farmacia/seguimiento" element={<RutaProtegida modulo="farmacia" rolesPermitidos={["cliente"]}><Seguimiento /></RutaProtegida>} />
  <Route path="*" element={<NoEncontrada />} />
 </Routes></AppLayout></BrowserRouter></ConfirmacionProvider></AuthProvider>;
}
