import { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import LogoFrame from "./LogoFrame";

export default function Navbar() {
  const nav = useNavigate();
  const loc = useLocation();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const items = useMemo(() => {
    const base = [
      { path: "/", icon: "🏠", label: "Inicio" },
      { path: "/solicitud", icon: "📅", label: "Servicios" },
      { path: "/cursos", icon: "🎓", label: "Cursos" },
      { path: "/denuncias", icon: "⚖️", label: "Reportes" },
      { path: "/alianzas", icon: "🤝", label: "Alianzas" },
    ];

    // accesos rápidos según sesión
    if (!user) {
      base.unshift({ path: "/login", icon: "🔐", label: "Ingresar" });
      base.unshift({ path: "/register", icon: "✍️", label: "Registrarse" });
    } else if (user.role === "manager") {
      base.unshift({ path: "/gerente", icon: "🧑‍💼", label: "Gerente" });
    } else if (user.profileType === "interpreter") {
      base.unshift({ path: "/interprete", icon: "🧑‍💼", label: "Intérprete" });
    } else {
      base.unshift({ path: "/usuario", icon: "🧏‍♀️", label: "Usuario" });
    }

    return base;
  }, [user]);

  const go = (path) => {
    nav(path);
    setOpen(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 pt-6">
      <div className="tron-card p-4">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <LogoFrame />
            </div>

            <div className="leading-tight">
              <div className="text-lg font-semibold tracking-wide flex items-center gap-2">
                InterpreteYa <span className="tron-chip">🤟 LSCh</span>
              </div>
              <div className="text-xs text-white/70">
                Visual • Intuitivo • Comunidad Sorda
              </div>
            </div>
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-2">
            {!user ? (
              <>
                <button className="tron-btn" onClick={() => go("/login")}>🔐 Ingresar</button>
                <button className="tron-btn" onClick={() => go("/register")}>✍️ Registrarse</button>
              </>
            ) : (
              <>
                <span className="tron-chip">
                  {user.role === "manager"
                    ? "🧑‍💼 Gerente"
                    : user.profileType === "interpreter"
                    ? "🧑‍💼 Intérprete"
                    : "🧏‍♀️ Usuario"}
                </span>
                <button
                  className="tron-btn"
                  onClick={() => {
                    logout();
                    go("/login");
                  }}
                >
                  🚪 Salir
                </button>
              </>
            )}

            <button className="tron-btn w-[52px] h-[48px] grid place-items-center"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menú"
              title="Menú"
            >
              ☰
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden tron-btn w-[52px] h-[48px] grid place-items-center"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menú"
            title="Menú"
          >
            ☰
          </button>
        </div>

        <div className="mt-3 glow-line" />

        {/* Nav pills (desktop) */}
        <div className="hidden md:flex flex-wrap gap-2 mt-4">
          {items.map((it) => {
            const active = loc.pathname === it.path;
            return (
              <button
                key={it.path}
                className={
                  "tron-btn flex items-center gap-2 " +
                  (active ? "border-cyan-300/60 shadow-[0_0_18px_rgba(0,255,255,.18)]" : "")
                }
                onClick={() => go(it.path)}
                aria-label={it.label}
                title={it.label}
              >
                <span className="text-xl">{it.icon}</span>
                <span className="text-sm">{it.label}</span>
              </button>
            );
          })}
        </div>

        {/* Nav list (mobile) */}
        {open && (
          <div className="md:hidden mt-4 grid gap-2">
            {items.map((it) => {
              const active = loc.pathname === it.path;
              return (
                <button
                  key={it.path}
                  className={
                    "tron-btn flex items-center justify-between " +
                    (active ? "border-cyan-300/60" : "")
                  }
                  onClick={() => go(it.path)}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-xl">{it.icon}</span>
                    <span className="text-sm">{it.label}</span>
                  </span>
                  <span className="opacity-70">➜</span>
                </button>
              );
            })}

            {user && (
              <button
                className="tron-btn text-center"
                onClick={() => {
                  logout();
                  go("/login");
                }}
              >
                🚪 Cerrar sesión
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
