import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function StatCard({ icon, value, label }) {
  return (
    <div className="aether-mini-metric">
      <div className="text-2xl">{icon}</div>
      <div className="aether-mini-value">{value}</div>
      <div className="aether-mini-label">{label}</div>
    </div>
  );
}

function FeatureCard({ icon, title, text }) {
  return (
    <div className="aether-block">
      <div className="aether-block-head">
        {icon} {title}
      </div>
      <div className="aether-block-body text-sm text-white/75">
        {text}
      </div>
    </div>
  );
}

function FilterButton({ active, children, onClick }) {
  return (
    <button
      className={"tron-btn py-3 font-semibold " + (active ? "tron-primary" : "")}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function RadarMap() {
  return (
    <div className="iy-radar-card">
      <div className="iy-radar">
        <span className="iy-radar-dot iy-dot-a">🤟</span>
        <span className="iy-radar-dot iy-dot-b">🎥</span>
        <span className="iy-radar-dot iy-dot-c">🚨</span>
        <span className="iy-radar-dot iy-dot-d">🧑‍💼</span>
        <div className="iy-radar-center">📍</div>
      </div>
      <div className="text-center text-xs text-white/60 mt-3">
        Radar visual demo · futuro mapa tipo Uber
      </div>
    </div>
  );
}

export default function Home() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [filter, setFilter] = useState("video");

  const panelPath = useMemo(() => {
    if (!user) return "/login";
    if (user.role === "manager") return "/gerente";
    if (user.profileType === "interpreter") return "/interprete";
    return "/usuario";
  }, [user]);

  const filteredText = {
    video: "🎥 Videollamada inmediata para comunicación visual rápida.",
    agenda: "📅 Reserva un intérprete para hora y fecha futura.",
    sos: "🚨 Emergencia prioritaria para casos urgentes.",
    cursos: "🎓 Cursos LSCh para comunidad, empresas y familias.",
  };

  return (
    <div className="grid gap-6">
      <section className="iy-home-hero">
        <div className="grid lg:grid-cols-[1.05fr_.95fr] gap-5 items-center">
          <div className="grid gap-4">
            <div className="inline-flex w-fit tron-chip">
              🤟 Comunidad Sorda · Tecnología · Inclusión
            </div>

            <div>
              <h1 className="iy-hero-title">
                Bienvenido a <span>InterpreteYa</span>
              </h1>
              <p className="iy-hero-text">
                Plataforma visual para conectar personas sordas con intérpretes,
                videollamadas, reservas, cursos y apoyo en emergencias.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <button
                className="tron-btn tron-primary py-4 text-lg font-bold"
                onClick={() => nav(user ? "/solicitud" : "/login")}
              >
                🎥 Solicitar intérprete
              </button>

              <button
                className="tron-btn tron-danger py-4 text-lg font-bold"
                onClick={() => nav(user ? "/solicitud" : "/login")}
              >
                🚨 Emergencia SOS
              </button>

              <button
                className="tron-btn py-4 font-semibold"
                onClick={() => nav(panelPath)}
              >
                🚀 Ir a mi panel
              </button>

              <button
                className="tron-btn tron-muted py-4 font-semibold"
                onClick={() => nav(user ? "/cursos" : "/register")}
              >
                {user ? "🎓 Ver cursos" : "✍️ Registrarme"}
              </button>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <div className="panel-mini text-sm">🛡️ Acceso seguro</div>
              <div className="panel-mini text-sm">🎥 Video LSCh</div>
              <div className="panel-mini text-sm">📱 Móvil / Tablet / PC</div>
            </div>
          </div>

          <div className="media-frame">
            <div className="media-screen iy-video-demo">
              <div className="iy-video-person">🧏‍♀️</div>
              <div className="iy-video-person iy-video-person-right">🧑‍💼</div>
              <div className="iy-video-caption">
                🎥 Sala visual preparada para LSCh
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="aether-shell">
        <div className="aether-header">
          <div className="aether-title">⚡ Acciones rápidas</div>
          <div className="aether-subtitle">
            Elige lo que necesitas ver o solicitar
          </div>
        </div>

        <div className="p-4 grid gap-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            <FilterButton active={filter === "video"} onClick={() => setFilter("video")}>
              🎥 Video
            </FilterButton>
            <FilterButton active={filter === "agenda"} onClick={() => setFilter("agenda")}>
              📅 Agenda
            </FilterButton>
            <FilterButton active={filter === "sos"} onClick={() => setFilter("sos")}>
              🚨 SOS
            </FilterButton>
            <FilterButton active={filter === "cursos"} onClick={() => setFilter("cursos")}>
              🎓 Cursos
            </FilterButton>
          </div>

          <div className="panel-mini text-white/80">
            {filteredText[filter]}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <button className="tron-btn tron-primary" onClick={() => nav("/solicitud")}>
              🎥 Crear solicitud
            </button>
            <button className="tron-btn tron-danger" onClick={() => nav("/solicitud")}>
              🚨 Pedir SOS
            </button>
            <button className="tron-btn" onClick={() => nav("/interpretes")}>
              🧑‍💼 Ver intérpretes
            </button>
            <button className="tron-btn" onClick={() => nav("/mapa")}>
              🗺️ Ver mapa
            </button>
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-[.9fr_1.1fr] gap-5">
        <div className="aether-shell">
          <div className="aether-header">
            <div className="aether-title">🗺️ Radar de intérpretes</div>
            <div className="aether-subtitle">
              Vista demo futurista estilo ubicación
            </div>
          </div>
          <div className="p-4">
            <RadarMap />
          </div>
        </div>

        <div className="aether-shell">
          <div className="aether-header">
            <div className="aether-title">🛡️ Seguridad y confianza</div>
            <div className="aether-subtitle">
              Pensado para salud, justicia, educación y trámites
            </div>
          </div>

          <div className="p-4 grid sm:grid-cols-2 gap-3">
            <FeatureCard
              icon="✅"
              title="Aprobación gerente"
              text="Los intérpretes quedan pendientes hasta ser aprobados."
            />
            <FeatureCard
              icon="🔒"
              title="Sesión protegida"
              text="Cada rol entra a su propio panel: usuario, intérprete o gerente."
            />
            <FeatureCard
              icon="🎥"
              title="Video automático"
              text="Al asignar intérprete, se crea una sala de videollamada."
            />
            <FeatureCard
              icon="🚨"
              title="SOS prioritario"
              text="Las emergencias aparecen destacadas para responder más rápido."
            />
          </div>
        </div>
      </section>

      <section className="aether-shell">
        <div className="aether-header">
          <div className="aether-title">📊 Plataforma en crecimiento</div>
          <div className="aether-subtitle">
            Demo visual para presentación del proyecto
          </div>
        </div>

        <div className="p-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon="🧏" value="24/7" label="Acceso visual" />
          <StatCard icon="🎥" value="HD" label="Videollamada" />
          <StatCard icon="🚨" value="SOS" label="Emergencias" />
          <StatCard icon="🤟" value="LSCh" label="Comunidad sorda" />
        </div>
      </section>

      <section className="aether-shell">
        <div className="aether-header">
          <div className="aether-title">🤟 InterpreteYa</div>
          <div className="aether-subtitle">
            Una plataforma creada para reducir barreras comunicacionales
          </div>
        </div>

        <div className="p-4 grid md:grid-cols-3 gap-3">
          <button className="tron-btn tron-primary py-4" onClick={() => nav("/register")}>
            ✍️ Crear cuenta
          </button>
          <button className="tron-btn py-4" onClick={() => nav("/login")}>
            🔐 Ingresar
          </button>
          <button className="tron-btn tron-muted py-4" onClick={() => nav("/propuesta")}>
            📘 Ver propuesta
          </button>
        </div>
      </section>
    </div>
  );
}