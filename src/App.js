import React from "react";
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

function RedirectByRole() {
  const rawUser = localStorage.getItem("iy_session_v1");

  if (!rawUser) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(rawUser);

    if (user?.status !== "active") {
      return <Navigate to="/pending" replace />;
    }

    if (user?.role === "manager") {
      return <Navigate to="/gerente" replace />;
    }

    if (user?.profileType === "interpreter") {
      return <Navigate to="/interprete" replace />;
    }

    if (user?.profileType === "user") {
      return <Navigate to="/usuario" replace />;
    }

    return <Navigate to="/" replace />;
  } catch {
    return <Navigate to="/login" replace />;
  }
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          {/* Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/ecosistema" element={<Ecosistema />} />
          <Route path="/alianzas" element={<Alianzas />} />
          <Route path="/propuesta" element={<Propuesta />} />
          <Route path="/interpretes" element={<InterpretesDisponibles />} />
          <Route path="/mapa" element={<MapaInterpretes />} />

          {/* Login / Registro */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pending" element={<Pending />} />
          <Route path="/g/login" element={<LoginGerente />} />
          <Route
            path="/login-gerente"
            element={<Navigate to="/g/login" replace />}
          />
          <Route path="/panel" element={<RedirectByRole />} />

          {/* Flujo de servicio protegido */}
          <Route
            path="/video/:roomId"
            element={
              <ProtectedRoute requireStatus="active">
                <VideoRoom />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calificar/:serviceId"
            element={
              <ProtectedRoute requireStatus="active">
                <CalificarServicio />
              </ProtectedRoute>
            }
          />
          <Route
            path="/historial"
            element={
              <ProtectedRoute requireStatus="active">
                <HistorialServicios />
              </ProtectedRoute>
            }
          />

          {/* Protegidas por rol / perfil */}
          <Route
            path="/solicitud"
            element={
              <ProtectedRoute
                allowRoles={["client"]}
                allowProfileTypes={["user"]}
                requireStatus="active"
              >
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

          {/* Dashboards */}
          <Route
            path="/usuario"
            element={
              <ProtectedRoute
                allowRoles={["client"]}
                allowProfileTypes={["user"]}
                requireStatus="active"
              >
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interprete"
            element={
              <ProtectedRoute
                allowRoles={["client"]}
                allowProfileTypes={["interpreter"]}
                requireStatus="active"
              >
                <InterpreterDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gerente"
            element={
              <ProtectedRoute
                allowRoles={["manager"]}
                requireStatus="active"
              >
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;