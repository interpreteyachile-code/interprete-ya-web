import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useHideOnScroll } from "../hooks/useHideOnScroll";

function getCrumb(pathname) {
  const map = {
    "/": "Inicio",
    "/ecosistema": "Ecosistema",
    "/alianzas": "Alianzas",
    "/login": "Ingresar",
    "/register": "Registro",
    "/pending": "Pendiente",
    "/gerente": "Gerente",
    "/usuario": "Panel",
    "/interprete": "Panel",
    "/solicitud": "Solicitud",
    "/cursos": "Cursos",
    "/denuncias": "Reportes",
  };
  return map[pathname] || "Navegación";
}

export default function DesktopNavbar({ filters, setFilters }) {
  const nav = useNavigate();
  const loc = useLocation();
  const { user, logout } = useAuth();

  const hidden = useHideOnScroll({ topThreshold: 8, delta: 6 });
  const crumb = useMemo(() => getCrumb(loc.pathname), [loc.pathname]);

  const tabs = useMemo(() => {
    const publicTabs = [
      { path: "/", label: "Inicio" },
      { path: "/ecosistema", label: "Ecosistema" },
      { path: "/alianzas", label: "Alianzas" },
    ];

    // Opciones privadas (solo si hay sesión activa)
    const privateTabs = user
      ? [
          { path: "/solicitud", label: "Agendar" },
          { path: "/cursos", label: "Cursos" },
          { path: "/denuncias", label: "Reportes" },
        ]
      : [];

    return [...publicTabs, ...privateTabs];
  }, [user]);

  const goPanel = () => {
    if (!user) return nav("/login");
    if (user.role === "manager") return nav("/gerente");
    if (user.profileType === "interpreter") return nav("/interprete");
    return nav("/usuario");
  };

  const clearFilters = () => {
    setFilters({ mode: "now", service: "all", zone: "all" });
  };

  return (
    <div className="hidden md:block nav-shell">
      <div className={"nav-float " + (hidden ? "nav-hidden" : "")}>
        <div className="max-w-6xl mx-auto px-4 pt-4">
          <div className="tron-card p-4">
            {/* FILA 1 */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  className="tron-btn tron-primary px-5 py-2"
                  onClick={() => nav("/")}
                >
                  🤟 <span className="font-semibold">InterpreteYa</span>
                </button>

                <div className="flex gap-2 flex-wrap">
                  {tabs.map((t) => (
                    <button
                      key={t.path}
                      className={
                        "tron-btn px-5 py-2 " +
                        (loc.pathname === t.path ? "tron-primary" : "")
                      }
                      onClick={() => nav(t.path)}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  className="tron-btn tron-muted px-4 py-2"
                  onClick={clearFilters}
                  title="Limpiar filtros"
                >
                  🧹
                </button>

                <button className="tron-btn px-5 py-2" onClick={goPanel}>
                  {user ? "👤 Panel" : "🔐 Ingresar"}
                </button>

                {!user ? (
                  <button
                    className="tron-btn px-5 py-2"
                    onClick={() => nav("/register")}
                  >
                    ✍️ Registro
                  </button>
                ) : (
                  <button
                    className="tron-btn px-5 py-2"
                    onClick={async () => {
                      await logout?.();
                      nav("/", { replace: true });
                    }}
                  >
                    🚪 Salir
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4 glow-line" />

            {/* FILA 2 */}
            <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex gap-2 flex-wrap items-center">
                <span className="tron-chip">📍 {crumb}</span>
                <span className="tron-chip">
                  {filters.mode === "now"
                    ? "⚡ Ahora"
                    : filters.mode === "schedule"
                    ? "📅 Agenda"
                    : "🎥 Video"}
                </span>
                <span className="tron-chip">
                  {user ? "✅ Sesión" : "🔒 Sin sesión"}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* MODO */}
                <div className="flex gap-2">
                  <button
                    className={
                      "tron-btn px-4 py-2 " +
                      (filters.mode === "now" ? "tron-primary" : "")
                    }
                    onClick={() => setFilters((f) => ({ ...f, mode: "now" }))}
                  >
                    ⚡
                  </button>
                  <button
                    className={
                      "tron-btn px-4 py-2 " +
                      (filters.mode === "schedule" ? "tron-primary" : "")
                    }
                    onClick={() =>
                      setFilters((f) => ({ ...f, mode: "schedule" }))
                    }
                  >
                    📅
                  </button>
                  <button
                    className={
                      "tron-btn px-4 py-2 " +
                      (filters.mode === "video" ? "tron-primary" : "")
                    }
                    onClick={() => setFilters((f) => ({ ...f, mode: "video" }))}
                  >
                    🎥
                  </button>
                </div>

                {/* SERVICIO */}
                <select
                  className="tron-select"
                  value={filters.service}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, service: e.target.value }))
                  }
                >
                  <option value="all">🧩 Servicio</option>
                  <option value="tramite">🧾 Trámite</option>
                  <option value="reunion">👥 Reunión</option>
                  <option value="entrevista">💼 Entrevista</option>
                  <option value="evento">🎤 Evento</option>
                </select>

                {/* ZONA */}
                <select
                  className="tron-select"
                  value={filters.zone}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, zone: e.target.value }))
                  }
                >
                  <option value="all">📍 Zona</option>
                  <option value="norte">🌵 Norte</option>
                  <option value="centro">🏙️ Centro</option>
                  <option value="sur">🌲 Sur</option>
                </select>
              </div>
            </div>

            {!user && (
              <div className="text-xs text-white/60 mt-3">
                🔒 Agendar / Cursos / Reportes se habilitan al iniciar sesión.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
