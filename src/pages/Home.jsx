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
      className={
        "tron-btn w-full text-left " +
        (disabled ? "opacity-55 cursor-not-allowed" : "")
      }
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl border border-cyan-300/30 bg-cyan-300/10 grid place-items-center text-2xl shrink-0">
          {icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-semibold">{title}</div>
          <div className="text-sm text-white/70 mt-1">{desc}</div>
        </div>

        <div className="text-xl opacity-70">➜</div>
      </div>
    </button>
  );
}

function PanelTitle({ title, subtitle, rightTag }) {
  return (
    <div className="aether-header">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="aether-title">{title}</div>
          {subtitle && <div className="aether-subtitle">{subtitle}</div>}
        </div>

        {rightTag ? <GlowTag>{rightTag}</GlowTag> : null}
      </div>
    </div>
  );
}

function NeonCard({ icon, title, desc, button, onClick }) {
  return (
    <div className="aether-glow-box p-4 grid gap-3">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl border border-cyan-300/30 bg-cyan-300/10 grid place-items-center text-2xl">
          {icon}
        </div>

        <div>
          <div className="font-semibold">{title}</div>
          <div className="text-sm text-white/70 mt-1">{desc}</div>
        </div>
      </div>

      {button && (
        <button className="tron-btn tron-primary py-3 font-semibold" onClick={onClick}>
          {button}
        </button>
      )}
    </div>
  );
}

function MiniSignal({ label, value }) {
  return (
    <div className="aether-glow-box p-3">
      <div className="text-xs text-white/50 uppercase tracking-[.12em]">
        {label}
      </div>
      <div className="font-semibold mt-1">{value}</div>
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

  const modeLabel =
    filters.mode === "now"
      ? "⚡ Ahora"
      : filters.mode === "schedule"
      ? "📅 Agenda"
      : "🎥 Video";

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

  const goPanel = () => {
    if (!user) return nav("/login");
    if (user.role === "manager") return nav("/gerente");
    if (user.profileType === "interpreter") return nav("/interprete");
    return nav("/usuario");
  };

  const nextAction = useMemo(() => {
    if (filters.mode === "video") {
      return {
        icon: "🎥",
        title: "Solicitar por videollamada",
        path: "/solicitud",
      };
    }

    if (filters.mode === "schedule") {
      return {
        icon: "📅",
        title: "Agendar intérprete",
        path: "/solicitud",
      };
    }

    return {
      icon: "⚡",
      title: "Solicitar ahora",
      path: "/solicitud",
    };
  }, [filters.mode]);

  return (
    <div className="grid gap-4">
      {/* HERO PRINCIPAL */}
      <section className="aether-shell">
        <PanelTitle
          title="🤟 InterpreteYa | Centro de acceso LSCh"
          subtitle="Tecnología autónoma · comunidad sorda · intérpretes · inclusión real"
          rightTag={user ? "✅ Sesión activa" : "🔒 Invitado"}
        />

        <div className="p-4 md:p-6 grid xl:grid-cols-[260px_1fr_.85fr] gap-5 items-stretch">
          {/* LOGO */}
          <div className="flex justify-center xl:justify-start">
            <div className="w-full max-w-[220px] logo-frame p-2">
              <div className="logo-inner">
                <img
                  src="/logo-interpreteya.png"
                  alt="Logo InterpreteYa"
                  className="logo-img"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const fallback = e.currentTarget.nextElementSibling;
                    if (fallback) fallback.style.display = "grid";
                  }}
                />

                <div
                  className="hidden w-full h-[130px] md:h-[148px] place-items-center text-center p-4"
                  style={{ display: "none" }}
                >
                  <div>
                    <div className="text-5xl">🤟</div>
                    <div className="mt-3 text-sm font-semibold">
                      Logo InterpreteYa
                    </div>
                    <div className="text-xs text-white/60 mt-2">
                      Usa <b>public/logo-interpreteya.png</b>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TEXTO CENTRAL */}
          <div className="grid gap-4 content-center">
            <div>
              <div className="text-3xl md:text-5xl font-semibold h-title leading-tight">
                InterpreteYa
              </div>

              <div className="text-white/85 mt-4 text-base md:text-lg">
                Plataforma autónoma creada por y para la comunidad sorda chilena.
              </div>

              <div className="text-white/70 mt-3">
                Conectamos usuarios sordos, intérpretes de LSCh, empresas aliadas
                y organizaciones de la comunidad, con servicios presenciales,
                agendados y por videollamada.
              </div>
            </div>

            <div className="aether-circuit" />

            <div className="grid sm:grid-cols-2 gap-2">
              {!user ? (
                <>
                  <button
                    className="tron-btn tron-primary font-semibold py-3"
                    onClick={() => nav("/login")}
                  >
                    🔐 Ingresar
                  </button>

                  <button
                    className="tron-btn font-semibold py-3"
                    onClick={() => nav("/register")}
                  >
                    ✍️ Registrarse
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="tron-btn tron-primary font-semibold py-3"
                    onClick={goPanel}
                  >
                    🚀 Ir a mi panel
                  </button>

                  <button
                    className="tron-btn font-semibold py-3"
                    onClick={() => nav("/solicitud")}
                  >
                    🤟 Solicitar intérprete
                  </button>
                </>
              )}
            </div>
          </div>

          {/* PANEL DERECHO */}
          <div className="grid gap-3 content-center">
            <MiniSignal label="Modo activo" value={modeLabel} />
            <MiniSignal label="Servicio" value={serviceLabel} />
            <MiniSignal label="Zona" value={zoneLabel} />

            <div className="aether-glow-box p-4">
              <div className="flex items-center gap-2">
                <span className="aether-dot" />
                <div className="font-semibold">Sistema accesible</div>
              </div>

              <div className="text-sm text-white/65 mt-3">
                Diseñado para lectura rápida, navegación clara y apoyo visual
                con emojis para usuarios sordos.
              </div>

              <div className="aether-line" />

              <div className="aether-light-row">
                <div className="aether-light" />
                <div className="aether-light" />
                <div className="aether-light" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VIDEO HERO / TUTORIALES */}
      <section className="grid xl:grid-cols-[1.55fr_.9fr] gap-4">
        <div className="aether-shell">
          <PanelTitle
            title="🎬 Video tutorial principal"
            subtitle="Guía visual para entender cómo funciona la plataforma"
            rightTag="📱 Mobile First"
          />

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

            <div className="mt-3 text-xs text-white/55">
              P<b>ronto...</b>
            </div>
          </div>
        </div>

        <div className="aether-shell">
          <PanelTitle
            title="👋 Bienvenida"
            subtitle="Presentación corta para usuarios nuevos"
            rightTag="✨ Intro"
          />

          <div className="p-4 grid gap-3">
            <div className="media-frame">
  <div className="media-screen aspect-video">
                <video
                  className="w-full h-full object-cover"
                  controls
                  playsInline
                  preload="metadata"
                  poster="/banner-bienvenido.png"
                >
                  <source src="/bienvenido-interpreteya.mp4" type="video/mp4" />
                  Tu navegador no soporta video HTML5.
                </video>
              </div>
            </div>

            <div className="aether-glow-box p-4 text-sm text-white/70">
              💡 Ideal para explicar en pocos segundos qué es InterpreteYa y cómo
              ayuda a la comunicación sin barreras.
            </div>
          </div>
        </div>
      </section>

      {/* ACCESOS RÁPIDOS */}
      <section className="aether-shell">
        <PanelTitle
          title="⚡ Accesos rápidos"
          subtitle="Botones principales para moverse dentro de InterpreteYa"
          rightTag="🧭 Navegación"
        />

        <div className="p-4 grid md:grid-cols-2 xl:grid-cols-3 gap-3">
          <Tile
            icon={nextAction.icon}
            title={nextAction.title}
            desc="Crea una solicitud de intérprete según el modo activo."
            disabled={!user}
            onClick={() => nav(nextAction.path)}
          />

          <Tile
            icon="🗺️"
            title="Mapa de intérpretes"
            desc="Revisa ubicación y disponibilidad dentro del sistema."
            disabled={false}
            onClick={() => nav("/mapa")}
          />

          <Tile
            icon="🧑‍💼"
            title="Intérpretes disponibles"
            desc="Explora perfiles activos de intérpretes LSCh."
            disabled={false}
            onClick={() => nav("/interpretes")}
          />

          <Tile
            icon="🎓"
            title="Cursos LSCh"
            desc="Aprendizaje, talleres y formación desde la comunidad sorda."
            disabled={false}
            onClick={() => nav("/cursos")}
          />

          <Tile
            icon="⚖️"
            title="Denuncias y reportes"
            desc="Reporta barreras comunicacionales y genera evidencia."
            disabled={!user}
            onClick={() => nav("/denuncias")}
          />

          <Tile
            icon="🤝"
            title="Alianzas"
            desc="Convenios con empresas y organizaciones de la comunidad."
            disabled={false}
            onClick={() => nav("/alianzas")}
          />
        </div>

        {!user && (
          <div className="px-4 pb-4 text-xs text-white/55">
            🔒 Para solicitar intérprete o crear reportes debes iniciar sesión.
          </div>
        )}
      </section>

      {/* MAPA / DISPONIBILIDAD SIMULADA */}
      <section className="aether-shell">
        <PanelTitle
          title="🗺️ Centro de cobertura"
          subtitle="Vista rápida de zonas, intérpretes y atención accesible"
          rightTag="📍 Santiago"
        />

        <div className="p-4 grid lg:grid-cols-[1.2fr_.8fr] gap-4">
          <div className="aether-glow-box p-4">
            <div className="aether-circuit min-h-[220px]" />

            <div className="mt-4 grid sm:grid-cols-3 gap-2">
              <GlowTag>🌵 Norte</GlowTag>
              <GlowTag>🏙️ Centro</GlowTag>
              <GlowTag>🌲 Sur</GlowTag>
            </div>
          </div>

          <div className="grid gap-3">
            <NeonCard
              icon="📡"
              title="Cobertura activa"
              desc="Vista preparada para integrar mapa real, GPS o disponibilidad por zona."
              button="🗺️ Ver mapa"
              onClick={() => nav("/mapa")}
            />

            <NeonCard
              icon="🧑‍💼"
              title="Intérpretes"
              desc="Consulta intérpretes disponibles y perfiles dentro de la plataforma."
              button="🔎 Ver intérpretes"
              onClick={() => nav("/interpretes")}
            />
          </div>
        </div>
      </section>

      {/* APOYO COMUNIDAD */}
      <section className="aether-shell">
        <PanelTitle
          title="🤟 Apoyo para la comunidad sorda"
          subtitle="Módulos principales del ecosistema autónomo"
          rightTag="💙 Inclusión"
        />

        <div className="p-4 grid md:grid-cols-2 xl:grid-cols-4 gap-3">
          <NeonCard
            icon="🎓"
            title="Cursos y talleres"
            desc="Personas sordas pueden enseñar LSCh y generar ingresos."
            button="Ver cursos ✨"
            onClick={() => nav("/cursos")}
          />

          <NeonCard
            icon="🚨"
            title="Apoyo urgente"
            desc="Solicitudes rápidas para momentos importantes o sensibles."
            button="Solicitar ahora ⚡"
            onClick={() => nav(user ? "/solicitud" : "/login")}
          />

          <NeonCard
            icon="⚖️"
            title="Defensa LSCh"
            desc="Reportes y denuncias que pueden generar proyectos de cambio."
            button="Crear reporte 🛡️"
            onClick={() => nav(user ? "/denuncias" : "/login")}
          />

          <NeonCard
            icon="🤝"
            title="Empresas aliadas"
            desc="Accesibilidad, inclusión laboral y convenios directos."
            button="Ver alianzas 🤝"
            onClick={() => nav("/alianzas")}
          />
        </div>
      </section>

      {/* PROPUESTA + ECOSISTEMA */}
      <section className="grid lg:grid-cols-2 gap-4">
        <div className="aether-shell">
          <PanelTitle
            title="📘 Propuesta InterpreteYa"
            subtitle="Autonomía, negocio social y comunidad"
            rightTag="📄 Proyecto"
          />

          <div className="p-4 grid gap-3">
            <div className="aether-glow-box p-4 text-sm text-white/75">
              InterpreteYa no representa instituciones públicas. Es una
              plataforma autónoma que colabora con comunidad, empresas y
              organizaciones sordas.
            </div>

            <button
              className="tron-btn tron-primary py-3 font-semibold"
              onClick={() => nav("/propuesta")}
            >
              📘 Ver propuesta completa
            </button>
          </div>
        </div>

        <div className="aether-shell">
          <PanelTitle
            title="🌐 Ecosistema autónomo"
            subtitle="Usuarios, intérpretes, docentes, empresas y comunidad"
            rightTag="🔗 Red"
          />

          <div className="p-4 grid gap-3">
            <div className="aether-glow-box p-4 text-sm text-white/75">
              El ecosistema conecta solicitud, pago, videollamada, cursos,
              denuncias, alianzas y evaluación del servicio.
            </div>

            <button
              className="tron-btn tron-primary py-3 font-semibold"
              onClick={() => nav("/ecosistema")}
            >
              🌐 Ver ecosistema
            </button>
          </div>
        </div>
      </section>

      {/* CONTACTO */}
      <section className="aether-shell">
        <PanelTitle
          title="📩 Contacto y apoyo"
          subtitle="Información para comunidad, intérpretes y empresas"
          rightTag="📍 Chile"
        />

        <div className="p-4 grid md:grid-cols-2 gap-4">
          <div className="aether-glow-box p-4">
            <div className="font-semibold">📧 Correo</div>
            <div className="text-white/70 mt-2">contacto@interpreteya.cl</div>

            <div className="aether-line" />

            <div className="font-semibold">📱 WhatsApp</div>
            <div className="text-white/70 mt-2">+56 9 1234 5678</div>
          </div>

          <div className="aether-glow-box p-4">
            <div className="font-semibold">📍 Ubicación</div>
            <div className="text-white/70 mt-2">Santiago, Chile</div>

            <div className="aether-line" />

            <div className="text-sm text-white/70">
              Plataforma pensada para accesibilidad, comunicación clara y apoyo
              real para la comunidad sorda.
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="aether-shell">
        <div className="p-4 md:p-5">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div>
              <div className="font-semibold text-lg">
                🤟 InterpreteYa — Comunicación sin barreras
              </div>

              <div className="text-sm text-white/60 mt-2 max-w-2xl">
                Plataforma autónoma para conectar usuarios sordos, intérpretes,
                empresas y comunidad con tecnología accesible.
              </div>
            </div>

            <div className="grid grid-cols-2 sm:flex gap-2">
              <button className="tron-btn py-2 px-4" onClick={() => nav("/propuesta")}>
                📘 Propuesta
              </button>

              <button className="tron-btn py-2 px-4" onClick={() => nav("/alianzas")}>
                🤝 Alianzas
              </button>

              <button className="tron-btn py-2 px-4" onClick={() => nav("/cursos")}>
                🎓 Cursos
              </button>

              <button className="tron-btn py-2 px-4" onClick={() => nav("/login")}>
                🔐 Login
              </button>
            </div>
          </div>

          <div className="aether-line" />

          <div className="text-xs text-white/50">
            💙 Diseño futurista inspirado en tecnología, accesibilidad e inclusión.
          </div>
        </div>
      </footer>
    </div>
  );
}