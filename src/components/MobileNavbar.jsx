import { useMemo, useState } from "react";
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
    "/usuario": "Usuario",
    "/interprete": "Intérprete",
    "/solicitud": "Solicitud",
    "/cursos": "Cursos",
    "/denuncias": "Reportes",
    "/historial": "Historial",
    "/mapa": "Mapa",
    "/interpretes": "Intérpretes",
  };

  return map[pathname] || "InterpreteYa";
}

export default function MobileNavbar({ filters, setFilters }) {
  const nav = useNavigate();
  const loc = useLocation();
  const { user, logout } = useAuth();

  const [open, setOpen] = useState(false);
  const hidden = useHideOnScroll({ topThreshold: 8, delta: 6 });

  const crumb = useMemo(() => getCrumb(loc.pathname), [loc.pathname]);

  const panelPath = useMemo(() => {
    if (!user) return "/login";
    if (user.role === "manager") return "/gerente";
    if (user.profileType === "interpreter") return "/interprete";
    return "/usuario";
  }, [user]);

  const items = useMemo(() => {
    const arr = [
      { path: "/", icon: "🏠", label: "Inicio" },
      { path: "/ecosistema", icon: "🌐", label: "Ecosistema" },
      { path: "/alianzas", icon: "🤝", label: "Alianzas" },
      { path: "/interpretes", icon: "🧑‍💼", label: "Intérpretes" },
      { path: "/mapa", icon: "🗺️", label: "Mapa" },
      { path: "/cursos", icon: "🎓", label: "Cursos" },
    ];

    if (!user) {
      return [
        { path: "/login", icon: "🔐", label: "Ingresar" },
        { path: "/register", icon: "✍️", label: "Registro" },
        ...arr,
      ];
    }

    return [
      { path: panelPath, icon: "🚀", label: "Mi Panel" },
      { path: "/solicitud", icon: "🎥", label: "Solicitar" },
      { path: "/historial", icon: "📜", label: "Historial" },
      ...arr,
      { path: "/denuncias", icon: "⚖️", label: "Reportes" },
    ];
  }, [user, panelPath]);

  const go = (path) => {
    nav(path);
    setOpen(false);
  };

  const doLogout = async () => {
    await logout?.();
    setOpen(false);
    nav("/", { replace: true });
  };

  const clearFilters = () => {
    if (!setFilters) return;
    setFilters({ mode: "now", service: "all", zone: "all" });
  };

  return (
    <div className="lg:hidden">
      <div className={"iy-mobile-top " + (hidden && !open ? "iy-mobile-hidden" : "")}>
        <div className="iy-mobile-bar">
          <button className="iy-brand-mini" onClick={() => go("/")}>
            <span className="text-xl">🤟</span>
            <span>
              <b>InterpreteYa</b>
              <small>{crumb}</small>
            </span>
          </button>

          <div className="flex items-center gap-2">
            <button className="iy-icon-btn" onClick={() => go(panelPath)}>
              🚀
            </button>
            <button className="iy-icon-btn" onClick={() => setOpen((v) => !v)}>
              {open ? "✖" : "☰"}
            </button>
          </div>
        </div>

        {open && (
          <div className="iy-mobile-drawer">
            <div className="grid grid-cols-2 gap-2">
              <button className="tron-btn tron-danger py-3 font-semibold" onClick={() => go("/solicitud")}>
                🚨 SOS
              </button>
              <button className="tron-btn tron-primary py-3 font-semibold" onClick={() => go("/solicitud")}>
                🎥 Solicitar
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              {items.map((it) => (
                <button
                  key={it.path}
                  className={"tron-btn py-3 " + (loc.pathname === it.path ? "tron-primary" : "")}
                  onClick={() => go(it.path)}
                >
                  <div className="text-xl">{it.icon}</div>
                  <div className="text-xs mt-1">{it.label}</div>
                </button>
              ))}
            </div>

            {filters && setFilters && (
              <div className="mt-3 tron-card p-3">
                <div className="text-xs text-white/60 mb-2">Filtros rápidos</div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    className={"tron-btn py-3 " + (filters.mode === "now" ? "tron-primary" : "")}
                    onClick={() => setFilters((f) => ({ ...f, mode: "now" }))}
                  >
                    ⚡
                  </button>
                  <button
                    className={"tron-btn py-3 " + (filters.mode === "schedule" ? "tron-primary" : "")}
                    onClick={() => setFilters((f) => ({ ...f, mode: "schedule" }))}
                  >
                    📅
                  </button>
                  <button
                    className={"tron-btn py-3 " + (filters.mode === "video" ? "tron-primary" : "")}
                    onClick={() => setFilters((f) => ({ ...f, mode: "video" }))}
                  >
                    🎥
                  </button>
                </div>
                <button className="tron-btn tron-muted w-full mt-2" onClick={clearFilters}>
                  🧹 Limpiar filtros
                </button>
              </div>
            )}

            {user ? (
              <button className="tron-btn tron-muted w-full mt-3 py-3" onClick={doLogout}>
                🚪 Cerrar sesión
              </button>
            ) : (
              <div className="text-xs text-white/55 mt-3">
                🔒 Inicia sesión para usar solicitudes, video y panel.
              </div>
            )}
          </div>
        )}
      </div>

      {!open && (
        <button className="iy-floating-menu" onClick={() => setOpen(true)}>
          ☰
        </button>
      )}
    </div>
  );
}