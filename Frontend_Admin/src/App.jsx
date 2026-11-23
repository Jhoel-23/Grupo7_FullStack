import { ConfirmacionProvider } from "./components/ConfirmacionProvider.jsx";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AppLayout from "./components/AppLayout";
import RutaProtegida from "./components/RutaProtegida";
import Login from "./Login";
import InicioPage from "./pages/InicioPage";
import NoEncontrada from "./pages/NoEncontrada";
import Despachos from "./modulos/farmacia/Despachos";
import PanelFarmacia from "./modulos/farmacia/PanelFarmacia";
import CobrosFarmacia from "./integraciones/CobrosFarmacia";
import Ventanilla from "./modulos/banco/Ventanilla";
import OperacionesDia from "./modulos/banco/OperacionesDia";
import PanelBanco from "./modulos/banco/PanelBanco";
import HistorialGestion from "./integraciones/HistorialGestion";
import ImagenesFarmaciaAdmin from "./pages/ImagenesFarmaciaAdmin";
export default function App() {
 return <AuthProvider><ConfirmacionProvider><BrowserRouter><AppLayout><Routes>
  <Route path="/" element={<Navigate to="/inicio" replace />} />
  <Route path="/login" element={<Login />} />
  <Route path="/inicio" element={<RutaProtegida><InicioPage /></RutaProtegida>} />
  <Route path="/farmacia/admin/pedidos" element={<RutaProtegida modulo="farmacia" rolesPermitidos={["administrador"]}><PanelFarmacia /></RutaProtegida>} />
  <Route path="/farmacia/productos" element={<RutaProtegida modulo="farmacia" rolesPermitidos={["administrador"]}><ImagenesFarmaciaAdmin /></RutaProtegida>} />
  <Route path="/farmacia/imagenes" element={<RutaProtegida modulo="farmacia" rolesPermitidos={["administrador"]}><ImagenesFarmaciaAdmin /></RutaProtegida>} />
  <Route path="/farmacia/cobros" element={<RutaProtegida modulo="farmacia" rolesPermitidos={["administrador"]}><CobrosFarmacia /></RutaProtegida>} />
  <Route path="/farmacia/despachos" element={<RutaProtegida modulo="farmacia" rolesPermitidos={["empleado"]}><Despachos /></RutaProtegida>} />
  <Route path="/farmacia/historial/:codigo" element={<RutaProtegida modulo="farmacia" rolesPermitidos={["administrador","empleado"]}><HistorialGestion /></RutaProtegida>} />
  <Route path="/banco/ventanilla" element={<RutaProtegida modulo="banco" rolesPermitidos={["empleado"]}><Ventanilla /></RutaProtegida>} />
  <Route path="/banco/operaciones-dia" element={<RutaProtegida modulo="banco" rolesPermitidos={["empleado"]}><OperacionesDia /></RutaProtegida>} />
  <Route path="/banco/admin" element={<RutaProtegida modulo="banco" rolesPermitidos={["administrador"]}><PanelBanco /></RutaProtegida>} />
  <Route path="*" element={<NoEncontrada />} />
 </Routes></AppLayout></BrowserRouter></ConfirmacionProvider></AuthProvider>;
}
