import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./app/AppShell";

import Home from "./pages/Home";
import Ecosistema from "./pages/Ecosistema";
import Solicitud from "./pages/Solicitud";
import Denuncias from "./pages/Denuncias";
import Cursos from "./pages/Cursos";
import Alianzas from "./pages/Alianzas";
import Propuesta from "./pages/Propuesta";
import VideoRoom from "./pages/VideoRoom";
import CalificarServicio from "./pages/CalificarServicio";
import HistorialServicios from "./pages/HistorialServicios";
import InterpretesDisponibles from "./pages/InterpretesDisponibles";
import MapaInterpretes from "./pages/MapaInterpretes";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Pending from "./pages/Pending";

import ManagerDashboard from "./pages/ManagerDashboard";
import UserDashboard from "./pages/UserDashboard";
import InterpreterDashboard from "./pages/InterpreterDashboard";
import LoginGerente from "./pages/LoginGerente";


import ProtectedRoute from "./auth/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          {/* PUBLIC */}
          <Route path="/" element={<Home />} />
          <Route path="/ecosistema" element={<Ecosistema />} />
          <Route path="/alianzas" element={<Alianzas />} />
          <Route path="/video/:roomId" element={<VideoRoom />} />
          <Route path="/calificar/:serviceId" element={<CalificarServicio />} />
          <Route path="/historial" element={<HistorialServicios />} />
          <Route path="/interpretes" element={<InterpretesDisponibles />} />
          <Route path="/mapa" element={<MapaInterpretes />} />
<Route path="/propuesta" element={<Propuesta />} />
          {/* AUTH */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pending" element={<Pending />} />

          {/* ✅ Gerente PRIVADO (ruta oculta) */}
          <Route path="/g/login" element={<LoginGerente />} />
          <Route path="/login-gerente" element={<Navigate to="/" replace />} />

          {/* 🔒 RUTAS AVANZADAS (solo con sesión ACTIVE) */}
          <Route
            path="/solicitud"
            element={
              <ProtectedRoute requireStatus="active">
                <Solicitud />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cursos"
            element={
              <ProtectedRoute requireStatus="active">
                <Cursos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/denuncias"
            element={
              <ProtectedRoute requireStatus="active">
                <Denuncias />
              </ProtectedRoute>
            }
          />

          {/* DASHBOARDS */}
          <Route
            path="/usuario"
            element={
              <ProtectedRoute allowRoles={["client"]} requireStatus="active">
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/interprete"
            element={
              <ProtectedRoute allowRoles={["client"]} requireStatus="active">
                <InterpreterDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/gerente"
            element={
              <ProtectedRoute allowRoles={["manager"]} requireStatus="active">
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
