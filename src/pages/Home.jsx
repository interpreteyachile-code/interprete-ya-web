import { useMemo } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function GlowTag({ children }) {
  return <span className="tron-chip">{children}</span>;
}

function Tile({ icon, title, desc, onClick, disabled }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={"tron-btn w-full text-left " + (disabled ? "opacity-55 cursor-not-allowed" : "")}
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-2xl border border-cyan-300/30 bg-cyan-300/10 grid place-items-center text-2xl">
          {icon}
        </div>
        <div className="flex-1">
          <div className="font-semibold">{title}</div>
          <div className="text-sm text-white/70 mt-1">{desc}</div>
        </div>
        <div className="text-xl opacity-70">➜</div>
      </div>
    </button>
  );
}

export default function Home() {
  const nav = useNavigate();
  const { user } = useAuth();
  const outlet = useOutletContext() || {};
  const filters = outlet.filters || { mode: "now", service: "all", zone: "all" };

  const modeLabel = filters.mode === "now" ? "⚡ Ahora" : filters.mode === "schedule" ? "📅 Agenda" : "🎥 Video";
  const serviceLabel =
    filters.service === "tramite" ? "🧾 Trámite" :
    filters.service === "reunion" ? "👥 Reunión" :
    filters.service === "entrevista" ? "💼 Entrevista" :
    filters.service === "evento" ? "🎤 Evento" : "🧩 Todos";

  const zoneLabel =
    filters.zone === "norte" ? "🌵 Norte" :
    filters.zone === "centro" ? "🏙️ Centro" :
    filters.zone === "sur" ? "🌲 Sur" : "📍 Todas";

  const canAdvanced = !!user;

  const goPanel = () => {
    if (!user) return nav("/login");
    if (user.role === "manager") return nav("/gerente");
    if (user.profileType === "interpreter") return nav("/interprete");
    return nav("/usuario");
  };

  const nextAction = useMemo(() => {
    if (filters.mode === "video") return { icon: "🎥", title: "Continuar en Video", path: "/solicitud" };
    if (filters.mode === "schedule") return { icon: "📅", title: "Continuar con Agenda", path: "/solicitud" };
    return { icon: "⚡", title: "Continuar Ahora", path: "/solicitud" };
  }, [filters.mode]);

  return (
    <div className="grid gap-4">
      {/* HERO */}
      <div className="tron-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="max-w-2xl">
            <div className="text-2xl font-semibold h-title">🤟 InterpreteYa</div>

            <div className="text-white/80 mt-2">
              Bienvenido. Acceso claro, ordenado y seguro para la comunidad sorda.
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              <GlowTag>{modeLabel}</GlowTag>
              <GlowTag>{serviceLabel}</GlowTag>
              <GlowTag>{zoneLabel}</GlowTag>
              <GlowTag>{user ? "✅ Con sesión" : "🔒 Sin sesión"}</GlowTag>
            </div>

            {!user ? (
              <div className="mt-5 grid grid-cols-2 gap-2">
                <button className="tron-btn tron-primary text-center font-semibold" onClick={() => nav("/login")}>
                  🔐 Ingresar
                </button>
                <button className="tron-btn text-center font-semibold" onClick={() => nav("/register")}>
                  ✍️ Registro
                </button>
              </div>
            ) : (
              <div className="mt-5 tron-card p-4">
                <div className="text-sm text-white/75">
                  ✅ {user.fullName}
                </div>
                <div className="mt-3">
                  <button className="tron-btn tron-primary w-full text-center font-semibold" onClick={goPanel}>
                    ⚡ Ir a mi Panel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Marco logo (si luego me mandas tu imagen, la pongo aquí) */}
          <div className="hidden sm:block">
            <div className="w-28 h-28 rounded-3xl border border-cyan-300/30 bg-cyan-300/10 grid place-items-center text-5xl">
              🤟
            </div>
            <div className="text-xs text-white/55 mt-3 text-center">Logo</div>
          </div>
        </div>

        <div className="mt-5 glow-line" />

        <div className="mt-4 grid md:grid-cols-2 gap-2">
          <Tile
            icon={nextAction.icon}
            title={nextAction.title}
            desc="Según tus filtros del navbar."
            disabled={!canAdvanced}
            onClick={() => nav(nextAction.path)}
          />
          <Tile
            icon="🧩"
            title="Ver modelo público"
            desc="Ecosistema + Alianzas (sin iniciar sesión)."
            disabled={false}
            onClick={() => nav("/ecosistema")}
          />
        </div>

        {!user && (
          <div className="text-xs text-white/55 mt-4">
            🔒 Para Solicitud / Denuncias / Cursos: debes iniciar sesión.
          </div>
        )}
      </div>
    </div>
  );
}