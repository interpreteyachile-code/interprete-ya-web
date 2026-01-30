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

export default function MobileNavbar({ filters, setFilters }) {
  const nav = useNavigate();
  const loc = useLocation();
  const { user, logout } = useAuth();

  const hidden = useHideOnScroll({ topThreshold: 8, delta: 6 });
  const crumb = useMemo(() => getCrumb(loc.pathname), [loc.pathname]);

  const tabs = useMemo(() => {
    const publicTabs = [
      { path: "/", icon: "🏠", label: "Inicio" },
      { path: "/ecosistema", icon: "🧩", label: "Ecosistema" },
      { path: "/alianzas", icon: "🤝", label: "Alianzas" },
    ];

    const privateTabs = user
      ? [
          { path: "/solicitud", icon: "📅", label: "Agendar" },
          { path: "/cursos", icon: "🎓", label: "Cursos" },
          { path: "/denuncias", icon: "⚖️", label: "Reportes" },
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

  const clearFilters = () => setFilters({ mode: "now", service: "all", zone: "all" });

  return (
    <div className="md:hidden nav-shell">
      <div className={"nav-float " + (hidden ? "nav-hidden" : "")}>
        <div className="mx-3 mt-3 tron-card p-4">
          <div className="flex items-center justify-between gap-3">
            <button
              className="tron-btn tron-primary px-4 py-2 flex items-center gap-2"
              onClick={() => nav("/")}
            >
              <span className="text-lg">🤟</span>
              <span className="text-sm font-semibold">InterpreteYa</span>
            </button>

            <div className="flex items-center gap-2">
              {!user ? (
                <>
                  <button className="tron-btn px-4 py-2" onClick={() => nav("/login")}>
                    🔐
                  </button>
                  <button className="tron-btn px-4 py-2" onClick={() => nav("/register")}>
                    ✍️
                  </button>
                </>
              ) : (
                <>
                  <button className="tron-btn px-4 py-2" onClick={goPanel}>
                    👤
                  </button>
                  <button
                    className="tron-btn px-4 py-2"
                    onClick={async () => {
                      await logout?.();
                      nav("/", { replace: true });
                    }}
                  >
                    🚪
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="tron-chip">📍 {crumb}</span>
            <span className="tron-chip">
              {filters.mode === "now" ? "⚡" : filters.mode === "schedule" ? "📅" : "🎥"}
            </span>
            <span className="tron-chip">{user ? "✅" : "🔒"}</span>
          </div>

          <div className="mt-3 glow-line" />

          {/* MODO (rápido) */}
          <div className="mt-3 grid grid-cols-3 gap-2">
            <button
              className={"tron-btn py-3 font-semibold " + (filters.mode === "now" ? "tron-primary" : "")}
              onClick={() => setFilters((f) => ({ ...f, mode: "now" }))}
            >
              ⚡
            </button>
            <button
              className={"tron-btn py-3 font-semibold " + (filters.mode === "schedule" ? "tron-primary" : "")}
              onClick={() => setFilters((f) => ({ ...f, mode: "schedule" }))}
            >
              📅
            </button>
            <button
              className={"tron-btn py-3 font-semibold " + (filters.mode === "video" ? "tron-primary" : "")}
              onClick={() => setFilters((f) => ({ ...f, mode: "video" }))}
            >
              🎥
            </button>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2">
            <button className="tron-btn tron-muted py-2" onClick={clearFilters}>
              🧹 Limpiar
            </button>
            <button className="tron-btn py-2" onClick={goPanel}>
              {user ? "⚡ Panel" : "🔐 Ingresar"}
            </button>
          </div>

          {!user && (
            <div className="text-[11px] text-white/55 mt-3">
              🔒 Funciones avanzadas se habilitan al iniciar sesión.
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mx-3 mt-3 tron-card p-3">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.path}
                className={
                  "tron-btn min-w-[96px] py-3 flex flex-col items-center gap-1 " +
                  (loc.pathname === t.path ? "tron-primary" : "")
                }
                onClick={() => nav(t.path)}
              >
                <div className="text-xl">{t.icon}</div>
                <div className="text-[12px] text-white/75">{t.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
