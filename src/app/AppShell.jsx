import { useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function cx(...arr) {
  return arr.filter(Boolean).join(" ");
}

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cx("tron-btn px-4 py-2 text-sm", isActive && "tron-primary")
      }
    >
      {children}
    </NavLink>
  );
}

export default function AppShell() {
  const nav = useNavigate();
  const loc = useLocation();
  const { user, logout } = useAuth();

  // filtros globales simples para páginas que usen useOutletContext()
  const [zone, setZone] = useState("all");

  const isLogged = !!user;
  const isManager = user?.role === "manager";
  const isInterpreter = user?.profileType === "interpreter";
  const isUser = user?.profileType === "user";

  const links = useMemo(() => {
    const commonPublic = [
      { to: "/", label: "🏠 Inicio" },
      { to: "/ecosistema", label: "🌐 Ecosistema" },
      { to: "/alianzas", label: "🤝 Alianzas" },
      { to: "/propuesta", label: "📘 Propuesta" },
      { to: "/interpretes", label: "🧑‍💼 Intérpretes" },
      { to: "/mapa", label: "🗺️ Mapa" },
    ];

    if (!isLogged) return commonPublic;

    if (isManager) {
      return [
        ...commonPublic,
        { to: "/gerente", label: "🧑‍💼 Gerente" },
        { to: "/gerente/pagos", label: "💳 Pagos" },
        { to: "/denuncias", label: "⚖️ Denuncias" },
        { to: "/cursos", label: "🎓 Cursos" },
        { to: "/historial", label: "📜 Historial" },
      ];
    }

    if (isInterpreter) {
      return [
        ...commonPublic,
        { to: "/interprete", label: "🧑‍💼 Mi Panel" },
        { to: "/historial", label: "📜 Historial" },
        { to: "/cursos", label: "🎓 Cursos" },
      ];
    }

    if (isUser) {
      return [
        ...commonPublic,
        { to: "/usuario", label: "🧏‍♀️ Mi Panel" },
        { to: "/solicitud", label: "🤟 Solicitud" },
        { to: "/pagos", label: "💳 Mis pagos" },
        { to: "/denuncias", label: "⚖️ Denuncias" },
        { to: "/cursos", label: "🎓 Cursos" },
        { to: "/historial", label: "📜 Historial" },
      ];
    }

    return commonPublic;
  }, [isLogged, isManager, isInterpreter, isUser]);

  const pageTitle = useMemo(() => {
    const p = loc.pathname;

    if (p === "/") return "InterpreteYa";
    if (p.startsWith("/usuario")) return "Panel Usuario";
    if (p.startsWith("/interprete")) return "Panel Intérprete";
    if (p.startsWith("/gerente")) return "Panel Gerente";
    if (p.startsWith("/solicitud")) return "Solicitud de Intérprete";
    if (p.startsWith("/pagos")) return "Pagos";
    if (p.startsWith("/denuncias")) return "Denuncias";
    if (p.startsWith("/cursos")) return "Cursos LSCh";
    if (p.startsWith("/historial")) return "Historial";
    if (p.startsWith("/video")) return "Videollamada";
    return "InterpreteYa";
  }, [loc.pathname]);

  const outletContext = {
    filters: {
      zone,
    },
  };

  return (
    <div className="min-h-screen bg-[#07111f] text-white">
      {/* TOPBAR */}
      <header className="sticky top-0 z-40 border-b border-cyan-300/10 bg-[#07111f]/90 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-3 grid gap-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {/* Marca */}
            <div className="flex items-center gap-3">
              <Link to="/" className="tron-card px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl border border-cyan-300/30 bg-cyan-300/10 grid place-items-center">
                  🤟
                </div>
                <div>
                  <div className="font-semibold h-title">InterpreteYa</div>
                  <div className="text-xs text-white/55">
                    Plataforma autónoma LSCh
                  </div>
                </div>
              </Link>

              <div className="hidden md:block text-sm text-white/55">
                {pageTitle}
              </div>
            </div>

            {/* Sesión */}
            <div className="flex items-center gap-2 flex-wrap">
              {!isLogged ? (
                <>
                  <button
                    className="tron-btn px-4 py-2"
                    onClick={() => nav("/login")}
                  >
                    🔐 Login
                  </button>

                  <button
                    className="tron-btn tron-primary px-4 py-2"
                    onClick={() => nav("/register")}
                  >
                    ✍️ Registro
                  </button>

                  <button
                    className="tron-btn px-4 py-2"
                    onClick={() => nav("/g/login")}
                  >
                    🧑‍💼 Gerente
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="tron-btn px-4 py-2"
                    onClick={() => nav("/panel")}
                  >
                    🚀 Ir a mi panel
                  </button>

                  <div className="tron-card px-4 py-3">
                    <div className="text-xs text-white/55">Sesión</div>
                    <div className="text-sm font-semibold">{user.fullName}</div>
                    <div className="text-xs text-white/55 mt-1">
                      {isManager
                        ? "🧑‍💼 Gerente"
                        : isInterpreter
                        ? "🧑‍💼 Intérprete"
                        : "🧏‍♀️ Usuario"}
                    </div>
                  </div>

                  <button
                    className="tron-btn px-4 py-2"
                    onClick={async () => {
                      await logout?.();
                      nav("/", { replace: true });
                    }}
                  >
                    🚪 Salir
                  </button>
                </>
              )}
            </div>
          </div>

          {/* NAV */}
          <nav className="flex gap-2 overflow-x-auto pb-1">
            {links.map((item) => (
              <NavItem key={item.to} to={item.to}>
                {item.label}
              </NavItem>
            ))}
          </nav>

          {/* FILTROS GLOBALES SIMPLES */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="text-xs text-white/55 mr-1">Filtros rápidos:</div>

            <button
              className={cx("tron-btn px-3 py-2 text-xs", zone === "all" && "tron-primary")}
              onClick={() => setZone("all")}
            >
              📍 Todas
            </button>

            <button
              className={cx("tron-btn px-3 py-2 text-xs", zone === "norte" && "tron-primary")}
              onClick={() => setZone("norte")}
            >
              🌵 Norte
            </button>

            <button
              className={cx("tron-btn px-3 py-2 text-xs", zone === "centro" && "tron-primary")}
              onClick={() => setZone("centro")}
            >
              🏙️ Centro
            </button>

            <button
              className={cx("tron-btn px-3 py-2 text-xs", zone === "sur" && "tron-primary")}
              onClick={() => setZone("sur")}
            >
              🌲 Sur
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet context={outletContext} />
      </main>
    </div>
  );
}