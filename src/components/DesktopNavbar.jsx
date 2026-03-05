import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function cx(...arr) {
  return arr.filter(Boolean).join(" ");
}

export default function DesktopNavbar({ filters, setFilters }) {

  const nav = useNavigate();
  const { user, logout } = useAuth();

  const goPanel = () => {

    if (!user) return nav("/login");

    if (user.role === "manager") return nav("/gerente");

    if (user.profileType === "interpreter")
      return nav("/interprete");

    return nav("/usuario");

  };

  return (

    <div className="hidden lg:block sticky top-0 z-50 px-6 pt-4">

      <div className="tron-card p-4">

        <div className="flex items-center justify-between gap-4">

          {/* LOGO + LINKS */}
          <div className="flex items-center gap-2 flex-wrap">

            <button
              className="tron-btn tron-primary px-4 py-2"
              onClick={() => nav("/")}
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
              to="/interpretes"
              className={({ isActive }) =>
                cx("tron-btn px-4 py-2", isActive && "tron-primary")
              }
            >
              👩‍💼 Intérpretes
            </NavLink>

            <NavLink
              to="/mapa"
              className={({ isActive }) =>
                cx("tron-btn px-4 py-2", isActive && "tron-primary")
              }
            >
              📍 Mapa
            </NavLink>

            <NavLink
              to="/solicitud"
              className={({ isActive }) =>
                cx("tron-btn px-4 py-2", isActive && "tron-primary")
              }
            >
              ➕ Solicitud
            </NavLink>

            {user && (
              <NavLink
                to="/historial"
                className={({ isActive }) =>
                  cx("tron-btn px-4 py-2", isActive && "tron-primary")
                }
              >
                📜 Historial
              </NavLink>
            )}

          </div>

          {/* FILTROS */}
          <div className="flex items-center gap-2">

            <select
              className="tron-select"
              value={filters.mode}
              onChange={(e) =>
                setFilters({ ...filters, mode: e.target.value })
              }
            >
              <option value="now">⚡ Ahora</option>
              <option value="schedule">📅 Agenda</option>
              <option value="video">🎥 Video</option>
            </select>

            <select
              className="tron-select"
              value={filters.service}
              onChange={(e) =>
                setFilters({ ...filters, service: e.target.value })
              }
            >
              <option value="all">🧩 Servicio</option>
              <option value="tramite">🧾 Trámite</option>
              <option value="reunion">👥 Reunión</option>
              <option value="entrevista">💼 Entrevista</option>
              <option value="evento">🎤 Evento</option>
            </select>

            <select
              className="tron-select"
              value={filters.zone}
              onChange={(e) =>
                setFilters({ ...filters, zone: e.target.value })
              }
            >
              <option value="all">📍 Zona</option>
              <option value="norte">🌵 Norte</option>
              <option value="centro">🏙️ Centro</option>
              <option value="sur">🌲 Sur</option>
            </select>

          </div>

          {/* ACCIONES */}
          <div className="flex items-center gap-2">

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
                    nav("/");
                  }}
                >
                  🚪 Salir
                </button>
              </>

            )}

          </div>

        </div>

      </div>

    </div>

  );
}