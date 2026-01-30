import { useMemo } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function GlowTag({ children }) {
  return <span className="tron-chip">{children}</span>;
}

function Tile({ icon, title, desc, tags = [], onClick, disabled = false, primary = false }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={
        "tron-btn w-full text-left " +
        (primary ? "tron-primary " : "") +
        (disabled ? "opacity-55 cursor-not-allowed" : "")
      }
      disabled={disabled}
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-2xl border border-cyan-300/30 bg-cyan-300/10 grid place-items-center text-2xl">
          {icon}
        </div>

        <div className="flex-1">
          <div className="font-semibold">{title}</div>
          <div className="text-sm text-white/70 mt-1">{desc}</div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {tags.map((t) => (
                <GlowTag key={t}>{t}</GlowTag>
              ))}
            </div>
          )}
        </div>

        <div className="text-xl opacity-70">➜</div>
      </div>
    </button>
  );
}

function Section({ title, subtitle, children, right }) {
  return (
    <div className="tron-card p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold h-title">{title}</div>
          {subtitle && <div className="text-sm text-white/70 mt-1">{subtitle}</div>}
        </div>
        {right}
      </div>

      <div className="mt-4 glow-line" />
      <div className="mt-4">{children}</div>
    </div>
  );
}

function MiniStat({ icon, label, value }) {
  return (
    <div className="tron-card p-4">
      <div className="flex items-center justify-between">
        <div className="text-2xl">{icon}</div>
        <div className="tron-chip">{value}</div>
      </div>
      <div className="font-semibold mt-2">{label}</div>
      <div className="text-xs text-white/65 mt-1">Vista demo</div>
    </div>
  );
}

export default function Home() {
  const nav = useNavigate();
  const { user } = useAuth();
  const outlet = useOutletContext() || {};
  const filters = outlet.filters || { mode: "now", service: "all", zone: "all" };

  const modeLabel =
    filters.mode === "now" ? "⚡ Ahora" : filters.mode === "schedule" ? "📅 Agenda" : "🎥 Video";

  const serviceLabel =
    filters.service === "tramite"
      ? "🧾 Trámite"
      : filters.service === "reunion"
      ? "👥 Reunión"
      : filters.service === "entrevista"
      ? "💼 Entrevista"
      : filters.service === "evento"
      ? "🎤 Evento"
      : "🧩 Todos";

  const zoneLabel =
    filters.zone === "norte"
      ? "🌵 Norte"
      : filters.zone === "centro"
      ? "🏙️ Centro"
      : filters.zone === "sur"
      ? "🌲 Sur"
      : "📍 Todas";

  const canShowAdvanced = !!user;

  const goPanel = () => {
    if (!user) return nav("/login");
    if (user.role === "manager") return nav("/gerente");
    if (user.profileType === "interpreter") return nav("/interprete");
    return nav("/usuario");
  };

  const recommendation = useMemo(() => {
    const base = {
      title: "Sugerencia",
      desc: `${modeLabel} • ${serviceLabel} • ${zoneLabel}`,
      tags: ["⚙️ Filtros activos"],
    };

    if (filters.mode === "video") {
      return {
        ...base,
        icon: "🎥",
        detail: "Opción recomendada para distancia o urgencias.",
        next: "/solicitud",
        cta: "Continuar",
      };
    }

    if (filters.mode === "schedule") {
      return {
        ...base,
        icon: "📅",
        detail: "Ideal para reuniones y eventos programados.",
        next: "/solicitud",
        cta: "Continuar",
      };
    }

    return {
      ...base,
      icon: "⚡",
      detail: "Ideal para atención rápida y directa.",
      next: "/solicitud",
      cta: "Continuar",
    };
  }, [filters.mode, filters.service, filters.zone, modeLabel, serviceLabel, zoneLabel]);

  const dynamicCards = useMemo(() => {
    const cards = [
      {
        icon: "🧩",
        title: "Ecosistema",
        desc: "Modelo y roles.",
        tags: ["🧠 Autonomía", "🤝 Comunidad"],
        path: "/ecosistema",
        locked: false,
      },
      {
        icon: "🤝",
        title: "Alianzas",
        desc: "Convenios y colaboración.",
        tags: ["🏢 Empresas", "🏛️ Organizaciones"],
        path: "/alianzas",
        locked: false,
      },
      {
        icon: filters.mode === "video" ? "🎥" : filters.mode === "schedule" ? "📅" : "⚡",
        title: "Solicitud",
        desc: "Acceso a solicitud según filtros.",
        tags: [modeLabel, serviceLabel, zoneLabel],
        path: "/solicitud",
        locked: !canShowAdvanced,
      },
      {
        icon: "🎓",
        title: "Cursos",
        desc: "Acceso a cursos.",
        tags: ["🎓", "🧠"],
        path: "/cursos",
        locked: !canShowAdvanced,
      },
      {
        icon: "⚖️",
        title: "Reportes",
        desc: "Acceso a reportes.",
        tags: ["⚖️", "🛡️"],
        path: "/denuncias",
        locked: !canShowAdvanced,
      },
    ];

    return cards;
  }, [filters.mode, modeLabel, serviceLabel, zoneLabel, canShowAdvanced]);

  return (
    <div className="grid gap-4">
      {/* HERO minimal (sin textos extra) */}
      <div className="tron-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="max-w-2xl">
            <div className="text-2xl font-semibold leading-tight h-title">
              🤟 Bienvenido
            </div>

            <div className="text-white/75 mt-2">
              Acceso ordenado y seguro.  
              Las funciones avanzadas aparecen solo al iniciar sesión.
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              <GlowTag>🔳 Validación</GlowTag>
              <GlowTag>💳 Pagos</GlowTag>
              <GlowTag>⭐ Evaluación</GlowTag>
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
              <div className="mt-5">
                <button className="tron-btn tron-primary w-full text-center font-semibold" onClick={goPanel}>
                  👤 Mi Panel
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 glow-line" />
        <div className="mt-4 flex flex-wrap gap-2">
          <GlowTag>{modeLabel}</GlowTag>
          <GlowTag>{serviceLabel}</GlowTag>
          <GlowTag>{zoneLabel}</GlowTag>
          <GlowTag>{user ? "✅ Sesión" : "🔒 Sin sesión"}</GlowTag>
        </div>
      </div>

      {/* mini stats (muy corto) */}
      <div className="grid md:grid-cols-3 gap-3">
        <MiniStat icon="🔳" label="Validación" value="QR" />
        <MiniStat icon="💳" label="Pagos" value="Online" />
        <MiniStat icon="⭐" label="Evaluación" value="Mutua" />
      </div>

      {/* sugerencia */}
      <Section title="🧭 Sugerencia" subtitle="Basado en tus filtros">
        <div className="grid md:grid-cols-2 gap-3">
          <Tile
            icon={recommendation.icon}
            title={recommendation.title}
            desc={recommendation.desc}
            tags={recommendation.tags}
            onClick={() => nav("/ecosistema")}
            primary
          />

          <div className="tron-card p-5">
            <div className="font-semibold">Detalle</div>
            <div className="text-sm text-white/75 mt-2">{recommendation.detail}</div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button className="tron-btn tron-muted text-center" onClick={() => nav("/ecosistema")}>
                Ver modelo
              </button>

              <button
                className={"tron-btn tron-primary text-center font-semibold " + (!canShowAdvanced ? "opacity-55 cursor-not-allowed" : "")}
                disabled={!canShowAdvanced}
                onClick={() => nav(recommendation.next)}
              >
                {canShowAdvanced ? recommendation.cta : "🔒 Inicia sesión"}
              </button>
            </div>

            {!user && (
              <div className="text-xs text-white/60 mt-3">
                🔒 Funciones avanzadas solo con sesión.
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* módulos */}
      <Section title="🧩 Módulos" subtitle="Lo avanzado aparece solo con sesión">
        <div className="grid md:grid-cols-2 gap-3">
          {dynamicCards.map((c) => (
            <Tile
              key={c.title}
              icon={c.icon}
              title={c.title}
              desc={c.desc}
              tags={c.tags}
              disabled={c.locked}
              onClick={() => nav(c.path)}
            />
          ))}
        </div>
      </Section>
    </div>
  );
}
