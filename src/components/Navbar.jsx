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
      { path: "/ecosistema", icon: "🌐", label: "Ecosistema" },
      { path: "/alianzas", icon: "🤝", label: "Alianzas" },
      { path: "/interpretes", icon: "🧑‍💼", label: "Intérpretes" },
      { path: "/mapa", icon: "🗺️", label: "Mapa" },
      { path: "/cursos", icon: "🎓", label: "Cursos" },
      { path: "/historial", icon: "📜", label: "Historial" },
    ];

    if (!user) {
      return [
        { path: "/register", icon: "✍️", label: "Registro" },
        { path: "/login", icon: "🔐", label: "Ingresar" },
        ...base,
      ];
    }

    if (user.role === "manager") {
      return [{ path: "/gerente", icon: "🧑‍💼", label: "Mi Panel" }, ...base];
    }

    if (user.profileType === "interpreter") {
      return [{ path: "/interprete", icon: "🧑‍💼", label: "Mi Panel" }, ...base];
    }

    return [
      { path: "/usuario", icon: "🧏", label: "Mi Panel" },
      { path: "/solicitud", icon: "🎥", label: "Solicitar" },
      ...base,
    ];
  }, [user]);

  const go = (path) => {
    nav(path);
    setOpen(false);
  };

  const doLogout = async () => {
    await logout?.();
    setOpen(false);
    nav("/login", { replace: true });
  };

  return (
    <div className="hidden lg:block max-w-6xl mx-auto px-4 pt-5">
      <div className="tron-card p-4">
        <div className="flex items-center justify-between gap-4">
          <button
            className="flex items-center gap-3 text-left"
            onClick={() => go("/")}
          >
            <LogoFrame />
            <div>
              <div className="text-lg font-bold tracking-wide h-title">
                InterpreteYa
              </div>
              <div className="text-xs text-white/65">
                Plataforma autónoma LSCh
              </div>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <button className="tron-btn tron-primary px-5" onClick={() => go("/panel")}>
              🚀 Ir a mi panel
            </button>

            {!user ? (
              <>
                <button className="tron-btn" onClick={() => go("/login")}>🔐 Ingresar</button>
                <button className="tron-btn" onClick={() => go("/register")}>✍️ Registro</button>
              </>
            ) : (
              <>
                <span className="tron-chip">
                  {user.role === "manager"
                    ? "🧑‍💼 Gerente"
                    : user.profileType === "interpreter"
                    ? "🧑‍💼 Intérprete"
                    : "🧏 Usuario"}
                </span>
                <button className="tron-btn" onClick={doLogout}>🚪 Salir</button>
              </>
            )}

            <button
              className="tron-btn w-[52px] h-[50px] grid place-items-center"
              onClick={() => setOpen((v) => !v)}
            >
              ☰
            </button>
          </div>
        </div>

        <div className="mt-3 glow-line" />

        <div className="mt-4 flex flex-wrap gap-2">
          {items.map((it) => {
            const active = loc.pathname === it.path;
            return (
              <button
                key={it.path}
                className={"tron-btn flex items-center gap-2 " + (active ? "tron-primary" : "")}
                onClick={() => go(it.path)}
              >
                <span>{it.icon}</span>
                <span>{it.label}</span>
              </button>
            );
          })}
        </div>

        {open && (
          <div className="mt-4 grid lg:grid-cols-3 gap-2">
            <button className="tron-btn tron-danger py-3" onClick={() => go("/solicitud")}>
              🚨 Emergencia / Solicitud rápida
            </button>
            <button className="tron-btn py-3" onClick={() => go("/denuncias")}>
              ⚖️ Reportes / Denuncias
            </button>
            <button className="tron-btn py-3" onClick={() => go("/gerente/pagos")}>
              💳 Pagos
            </button>
          </div>
        )}
      </div>
    </div>
  );
}