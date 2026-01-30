import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";

function cx(...arr) {
  return arr.filter(Boolean).join(" ");
}

/**
 * ✅ Oculta al bajar (scroll down)
 * ✅ Aparece al subir (scroll up)
 * ✅ Aparece cuando estás arriba del todo
 */
function useHideOnScroll() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      const goingDown = y > lastY;

      // si estás arriba del todo, siempre visible
      if (y <= 10) {
        setHidden(false);
        lastY = y;
        return;
      }

      // baja => ocultar / sube => mostrar
      if (goingDown && y > 80) setHidden(true);
      if (!goingDown) setHidden(false);

      lastY = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return hidden;
}

const DEFAULT_FILTERS = { mode: "now", service: "all", zone: "all" };

export default function AppShell() {
  const nav = useNavigate();
  const { user, logout } = useAuth();

  // ✅ navbar se oculta al bajar
  const hidden = useHideOnScroll();

  // ✅ filtros reales (guardados + enviados por Outlet context)
  const [filters, setFilters] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("iy_filters_v1") || "null") ||
        DEFAULT_FILTERS
      );
    } catch {
      return DEFAULT_FILTERS;
    }
  });

  useEffect(() => {
    localStorage.setItem("iy_filters_v1", JSON.stringify(filters));
  }, [filters]);

  // ✅ panel según rol
  const goPanel = () => {
    if (!user) return nav("/login");
    if (user.role === "manager") return nav("/gerente");
    if (user.profileType === "interpreter") return nav("/interprete");
    return nav("/usuario");
  };

  return (
    <div className="min-h-screen">
      {/* NAVBAR */}
      <div
        className={cx(
          "sticky top-0 z-50 transition-all duration-300",
          hidden ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
        )}
      >
        <div className="px-3 sm:px-6 pt-3">
          <div className="tron-card p-3 sm:p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              {/* IZQ: LOGO + LINKS */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  className="tron-btn tron-primary px-4 py-2"
                  onClick={() => nav("/")}
                  title="Inicio"
                >
                  🤟 InterpreteYa
                </button>

                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    cx("tron-btn px-4 py-2", isActive && "tron-primary")
                  }
                >
                  Inicio
                </NavLink>

                <NavLink
                  to="/ecosistema"
                  className={({ isActive }) =>
                    cx("tron-btn px-4 py-2", isActive && "tron-primary")
                  }
                >
                  Ecosistema
                </NavLink>

                <NavLink
                  to="/alianzas"
                  className={({ isActive }) =>
                    cx("tron-btn px-4 py-2", isActive && "tron-primary")
                  }
                >
                  Alianzas
                </NavLink>

                {/* ✅ IMPORTANTE:
                    NO mostramos /login-gerente aquí.
                    Eso queda solo por URL directa.
                */}
              </div>

              {/* DER: ACCIONES */}
              <div className="flex flex-wrap items-center gap-2 justify-start lg:justify-end">
                {!user ? (
                  <>
                    <button
                      className="tron-btn px-4 py-2"
                      onClick={() => nav("/login")}
                    >
                      🔐 Ingresar
                    </button>
                    <button
                      className="tron-btn tron-primary px-4 py-2"
                      onClick={() => nav("/register")}
                    >
                      ✍️ Registro
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="tron-btn tron-primary px-4 py-2"
                      onClick={goPanel}
                    >
                      ⚡ Panel
                    </button>
                    <button
                      className="tron-btn px-4 py-2"
                      onClick={() => {
                        logout();
                        nav("/", { replace: true });
                      }}
                    >
                      🚪 Salir
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* ✅ FILTROS FUNCIONALES */}
            <div className="mt-3 glow-line" />

            <div className="mt-3 grid gap-2 md:grid-cols-3">
              <div className="tron-card p-2">
                <div className="text-xs text-white/65 mb-1">⚡ Modo</div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    className={cx(
                      "tron-btn py-2",
                      filters.mode === "now" && "tron-primary"
                    )}
                    onClick={() => setFilters((f) => ({ ...f, mode: "now" }))}
                  >
                    ⚡ Ahora
                  </button>
                  <button
                    className={cx(
                      "tron-btn py-2",
                      filters.mode === "schedule" && "tron-primary"
                    )}
                    onClick={() =>
                      setFilters((f) => ({ ...f, mode: "schedule" }))
                    }
                  >
                    📅 Agenda
                  </button>
                  <button
                    className={cx(
                      "tron-btn py-2",
                      filters.mode === "video" && "tron-primary"
                    )}
                    onClick={() => setFilters((f) => ({ ...f, mode: "video" }))}
                  >
                    🎥 Video
                  </button>
                </div>
              </div>

              <div className="tron-card p-2">
                <div className="text-xs text-white/65 mb-1">🧩 Servicio</div>
                <select
                  className="tron-select w-full"
                  value={filters.service}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, service: e.target.value }))
                  }
                >
                  <option value="all">🧩 Todos</option>
                  <option value="tramite">🧾 Trámite</option>
                  <option value="reunion">👥 Reunión</option>
                  <option value="entrevista">💼 Entrevista</option>
                  <option value="evento">🎤 Evento</option>
                </select>
              </div>

              <div className="tron-card p-2">
                <div className="text-xs text-white/65 mb-1">📍 Zona</div>
                <select
                  className="tron-select w-full"
                  value={filters.zone}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, zone: e.target.value }))
                  }
                >
                  <option value="all">📍 Todas</option>
                  <option value="norte">🌵 Norte</option>
                  <option value="centro">🏙️ Centro</option>
                  <option value="sur">🌲 Sur</option>
                </select>
              </div>
            </div>

            {!user && (
              <div className="mt-2 text-xs text-white/55">
                🔒 Funciones avanzadas se habilitan al iniciar sesión.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="px-3 sm:px-6 pb-10">
        {/* ✅ Enviamos filtros a Home / Solicitud / etc */}
        <Outlet context={{ filters, setFilters }} />
      </div>
    </div>
  );
}
