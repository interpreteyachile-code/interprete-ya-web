import { useMemo } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function GlowTag({ children, danger }) {
  return (
    <span className={danger ? "aether-tag-danger" : "tron-chip"}>
      {children}
    </span>
  );
}

function QuickCard({ icon, title, desc, onClick, danger }) {
  return (
    <button
      className={
        "tron-btn w-full text-left p-4 " + (danger ? "tron-danger" : "")
      }
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="w-14 h-14 rounded-2xl border border-cyan-300/30 bg-cyan-300/10 grid place-items-center text-3xl shrink-0">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="font-bold text-lg">{title}</div>
          <div className="text-sm text-white/65 mt-1">{desc}</div>
        </div>

        <div className="text-xl opacity-70">➜</div>
      </div>
    </button>
  );
}

function StatCard({ icon, label, value, hint }) {
  return (
    <div className="aether-mini-metric">
      <div className="text-3xl">{icon}</div>
      <div className="aether-mini-value mt-2">{value}</div>
      <div className="aether-mini-label">{label}</div>
      {hint && <div className="text-xs text-white/50 mt-1">{hint}</div>}
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="aether-glow-box p-4">
      <div className="text-3xl">{icon}</div>
      <div className="font-bold mt-3">{title}</div>
      <div className="text-sm text-white/65 mt-2">{desc}</div>
    </div>
  );
}

export default function Home() {
  const nav = useNavigate();
  const { user } = useAuth();
  const outlet = useOutletContext() || {};

  const filters = outlet.filters || {
    mode: "now",
    service: "all",
    zone: "all",
  };

  const panelRoute = useMemo(() => {
    if (!user) return "/login";
    if (user.role === "manager") return "/gerente";
    if (user.profileType === "interpreter") return "/interprete";
    return "/usuario";
  }, [user]);

  const openSolicitud = (type = "normal") => {
    if (!user) return nav("/login");
    if (user.role === "manager") return nav("/gerente");
    if (user.profileType === "interpreter") return nav("/interprete");

    nav("/solicitud", {
      state: type === "sos" ? { sos: true } : {},
    });
  };

  const modeLabel =
    filters.mode === "video"
      ? "🎥 Video"
      : filters.mode === "schedule"
      ? "📅 Agenda"
      : "⚡ Ahora";

  return (
    <div className="grid gap-5">
      {/* HERO */}
      <section className="aether-panel p-4 md:p-6">
        <div className="grid xl:grid-cols-[280px_1fr_.75fr] gap-6 items-center">
          <div className="flex justify-center">
            <div className="logo-frame w-full max-w-[250px]">
              <div className="logo-inner">
                <img
                  src="/logo-interpreteya.png"
                  alt="InterpreteYa"
                  className="logo-img"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              <GlowTag>🤟 Comunidad Sorda</GlowTag>
              <GlowTag>🎥 Video</GlowTag>
              <GlowTag>📍 Chile</GlowTag>
              {user ? <GlowTag>✅ Sesión activa</GlowTag> : <GlowTag>🔒 Invitado</GlowTag>}
            </div>

            <h1 className="text-4xl md:text-6xl font-black h-title leading-tight">
              InterpreteYa
            </h1>

            <p className="text-white/85 text-lg md:text-xl mt-5 max-w-3xl">
              Plataforma de interpretación para la comunidad sorda de Chile.
              Solicita intérpretes por videollamada, agenda o atención urgente.
            </p>

            <p className="text-white/60 mt-3 max-w-3xl">
              Diseño accesible, visual, rápido y cómodo para usuarios sordos,
              intérpretes, empresas, hospitales, tribunales y organizaciones.
            </p>

            <div className="mt-6 grid sm:grid-cols-3 gap-3">
              <button
                className="tron-btn tron-primary py-4 font-bold"
                onClick={() => openSolicitud("video")}
              >
                🎥 Solicitar ahora
              </button>

              <button
                className="tron-btn py-4 font-bold"
                onClick={() => openSolicitud("agenda")}
              >
                📅 Reservar
              </button>

              <button
                className="tron-btn tron-danger py-4 font-bold"
                onClick={() => openSolicitud("sos")}
              >
                🚨 Emergencia SOS
              </button>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="aether-glow-box p-4">
              <div className="flex items-center gap-2">
                <span className="aether-dot" />
                <div className="font-bold">Sistema activo</div>
              </div>

              <div className="text-sm text-white/65 mt-3">
                Modo actual: <b>{modeLabel}</b>
              </div>

              <div className="aether-line" />

              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-2xl">⚡</div>
                  <div className="text-xs text-white/55">Rápido</div>
                </div>
                <div>
                  <div className="text-2xl">🔒</div>
                  <div className="text-xs text-white/55">Seguro</div>
                </div>
                <div>
                  <div className="text-2xl">🤟</div>
                  <div className="text-xs text-white/55">LSCh</div>
                </div>
              </div>
            </div>

            <button className="tron-btn tron-primary py-4 font-bold" onClick={() => nav(panelRoute)}>
              🚀 Ir a mi panel
            </button>
          </div>
        </div>
      </section>

      {/* ACCESOS RÁPIDOS */}
      <section className="aether-shell">
        <div className="aether-header">
          <div className="aether-title">⚡ Accesos rápidos</div>
          <div className="aether-subtitle">
            Acciones principales para usar InterpreteYa
          </div>
        </div>

        <div className="p-4 grid md:grid-cols-2 xl:grid-cols-4 gap-3">
          <QuickCard
            icon="🎥"
            title="Video inmediato"
            desc="Solicita intérprete por videollamada."
            onClick={() => openSolicitud("video")}
          />

          <QuickCard
            icon="📅"
            title="Agendar"
            desc="Reserva intérprete para otra fecha."
            onClick={() => openSolicitud("agenda")}
          />

          <QuickCard
            icon="🧑‍💼"
            title="Intérpretes"
            desc="Ver perfiles disponibles."
            onClick={() => nav("/interpretes")}
          />

          <QuickCard
            icon="🚨"
            title="SOS"
            desc="Emergencia con prioridad alta."
            danger
            onClick={() => openSolicitud("sos")}
          />
        </div>
      </section>

      {/* ESTADÍSTICAS VISUALES */}
      <section className="aether-shell">
        <div className="aether-header">
          <div className="aether-title">📊 Plataforma Beta</div>
          <div className="aether-subtitle">
            Indicadores visuales para presentar el proyecto
          </div>
        </div>

        <div className="p-4 grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <StatCard icon="🧏" label="Usuarios" value="Beta" hint="Comunidad sorda" />
          <StatCard icon="🤟" label="Intérpretes" value="LSCh" hint="Validación gerente" />
          <StatCard icon="🎥" label="Videollamada" value="Jitsi" hint="Sala automática" />
          <StatCard icon="🚨" label="SOS" value="Prioridad" hint="Emergencias" />
        </div>
      </section>

      {/* ECOSISTEMA */}
      <section className="aether-shell">
        <div className="aether-header">
          <div className="aether-title">🌐 Ecosistema InterpreteYa</div>
          <div className="aether-subtitle">
            Usuarios, intérpretes, empresas y comunidad conectados
          </div>
        </div>

        <div className="p-4 grid md:grid-cols-2 xl:grid-cols-3 gap-3">
          <FeatureCard
            icon="🧏"
            title="Usuarios sordos"
            desc="Solicitudes visuales, simples y rápidas para acceder a comunicación."
          />

          <FeatureCard
            icon="🤟"
            title="Intérpretes LSCh"
            desc="Panel de trabajos, disponibilidad, videollamada e historial."
          />

          <FeatureCard
            icon="🧑‍💼"
            title="Gerente"
            desc="Aprueba, bloquea, asigna intérpretes, revisa pagos y SOS."
          />

          <FeatureCard
            icon="🏥"
            title="Salud"
            desc="Apoyo en hospitales, controles médicos y atención urgente."
          />

          <FeatureCard
            icon="⚖️"
            title="Justicia"
            desc="Apoyo en tribunales, trámites legales y denuncias."
          />

          <FeatureCard
            icon="🏢"
            title="Empresas"
            desc="Inclusión laboral, reuniones, entrevistas y capacitaciones."
          />
        </div>
      </section>

      {/* VIDEO / PRESENTACIÓN */}
      <section className="grid xl:grid-cols-[1.35fr_.85fr] gap-4">
        <div className="aether-shell">
          <div className="aether-header">
            <div className="aether-title">🎬 Video tutorial</div>
            <div className="aether-subtitle">
              Presentación visual para explicar la plataforma
            </div>
          </div>

          <div className="p-4">
            <div className="media-frame">
              <div className="media-screen aspect-video">
                <video
                  className="w-full h-full object-cover"
                  controls
                  playsInline
                  preload="metadata"
                  poster="/Pronto.png"
                >
                  <source src="/tutorial-interpreteya.mp4" type="video/mp4" />
                  Tu navegador no soporta video HTML5.
                </video>
              </div>
            </div>
          </div>
        </div>

        <div className="aether-shell">
          <div className="aether-header">
            <div className="aether-title">🤟 Accesibilidad visual</div>
            <div className="aether-subtitle">
              Pensado para lectura simple y clara
            </div>
          </div>

          <div className="p-4 grid gap-3">
            <FeatureCard
              icon="👁️"
              title="Íconos grandes"
              desc="Menos texto complejo, más señales visuales."
            />

            <FeatureCard
              icon="📱"
              title="Responsive"
              desc="Funciona cómodo en celular, tablet y PC."
            />

            <FeatureCard
              icon="💙"
              title="Comunidad"
              desc="Proyecto autónomo con enfoque social y tecnológico."
            />
          </div>
        </div>
      </section>

      {/* RUTAS PRINCIPALES */}
      <section className="aether-shell">
        <div className="aether-header">
          <div className="aether-title">🧭 Navegación principal</div>
          <div className="aether-subtitle">
            Módulos importantes de la Beta
          </div>
        </div>

        <div className="p-4 grid md:grid-cols-2 xl:grid-cols-4 gap-3">
          <QuickCard icon="🎓" title="Cursos LSCh" desc="Cursos y talleres." onClick={() => nav("/cursos")} />
          <QuickCard icon="🗺️" title="Mapa" desc="Cobertura e intérpretes." onClick={() => nav("/mapa")} />
          <QuickCard icon="⚖️" title="Denuncias" desc="Reportes de barreras." onClick={() => nav(user ? "/denuncias" : "/login")} />
          <QuickCard icon="🤝" title="Alianzas" desc="Empresas y convenios." onClick={() => nav("/alianzas")} />
        </div>
      </section>

      {/* CONTACTO */}
      <section className="aether-shell">
        <div className="aether-header">
          <div className="aether-title">📩 Contacto</div>
          <div className="aether-subtitle">
            Información para comunidad, intérpretes y empresas
          </div>
        </div>

        <div className="p-4 grid md:grid-cols-2 gap-4">
          <div className="aether-glow-box p-4">
            <div className="font-bold">📧 Correo</div>
            <div className="text-white/70 mt-2">contacto@interpreteya.cl</div>

            <div className="aether-line" />

            <div className="font-bold">📍 Ubicación</div>
            <div className="text-white/70 mt-2">Santiago, Chile</div>
          </div>

          <div className="aether-glow-box p-4">
            <div className="font-bold">💙 Mensaje</div>
            <div className="text-white/70 mt-2">
              InterpreteYa busca reducir barreras comunicacionales y mejorar el
              acceso a salud, justicia, educación, trabajo y trámites.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}