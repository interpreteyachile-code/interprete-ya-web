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
        <div className="w-12 h-12 rounded-2xl border border-cyan-300/30 bg-cyan-300/10 grid place-items-center text-2xl shrink-0">
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
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <div>
        <div className="text-2xl font-semibold h-title">{title}</div>
        {subtitle && <div className="text-white/70 mt-2">{subtitle}</div>}
      </div>

      {rightTag ? <GlowTag>{rightTag}</GlowTag> : null}
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

  const canAdvanced = !!user;

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
        title: "Continuar en Video",
        path: "/solicitud",
      };
    }

    if (filters.mode === "schedule") {
      return {
        icon: "📅",
        title: "Continuar con Agenda",
        path: "/solicitud",
      };
    }

    return {
      icon: "⚡",
      title: "Continuar Ahora",
      path: "/solicitud",
    };
  }, [filters.mode]);

  return (
    <div className="grid gap-4">
      {/* ENCABEZADO PRINCIPAL */}
      <div className="tron-card p-4 md:p-6 overflow-hidden">
        <div className="grid lg:grid-cols-[220px_1fr] gap-6 items-center">
          {/* LOGO */}
          <div className="flex justify-center lg:justify-start">
            <div className="w-full max-w-[190px] logo-frame p-2">
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

          {/* TEXTO */}
          <div>
            <div className="text-3xl md:text-5xl font-semibold h-title leading-tight">
              🤟 InterpreteYa
            </div>

            <div className="text-white/85 mt-3 text-base md:text-lg">
              Plataforma autónoma, creada por y para la comunidad sorda chilena.
            </div>

            <div className="text-white/70 mt-3">
              Conectamos usuarios sordos, intérpretes de LSCh, empresas aliadas
              y organizaciones de la comunidad, sin representar instituciones
              públicas.
            </div>

            <div className="flex flex-wrap gap-2 mt-5">
              <GlowTag>{modeLabel}</GlowTag>
              <GlowTag>{serviceLabel}</GlowTag>
              <GlowTag>{zoneLabel}</GlowTag>
              <GlowTag>{user ? "✅ Con sesión" : "🔒 Sin sesión"}</GlowTag>
            </div>

            {!user ? (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  className="tron-btn tron-primary text-center font-semibold py-3"
                  onClick={() => nav("/login")}
                >
                  🔐 Ingresar
                </button>

                <button
                  className="tron-btn text-center font-semibold py-3"
                  onClick={() => nav("/register")}
                >
                  ✍️ Registrarse
                </button>
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  className="tron-btn tron-primary text-center font-semibold py-3"
                  onClick={goPanel}
                >
                  🚀 Ir a mi panel
                </button>

                <button
                  className="tron-btn text-center font-semibold py-3"
                  onClick={() => nav("/solicitud")}
                >
                  🤟 Solicitar intérprete
                </button>
              </div>
            )}

            <div className="text-xs text-white/55 mt-4">
              InterpreteYa impulsa autonomía, autogestión, defensa de la LSCh y
              oportunidades económicas para la comunidad sorda.
            </div>
          </div>
        </div>
      </div>

      {/* BLOQUE DE VIDEOS */}
      <div className="grid xl:grid-cols-[1.6fr_1fr] gap-4">
        {/* VIDEO PRINCIPAL TUTORIALES */}
        <div className="tron-card p-4 md:p-6">
          <PanelTitle
            title="🎬 Tutoriales"
            subtitle="Video principal para mostrar el flujo de uso de InterpreteYa."
            rightTag="📱 Mobile First"
          />

          <div className="mt-4 tron-card p-2">
            <div className="overflow-hidden rounded-3xl border border-cyan-300/20 bg-black aspect-video">
              <video
                className="w-full h-full object-cover"
                controls
                playsInline
                preload="metadata"
                poster="/logo-interpreteya.png"
              >
                <source src="/tutorial-interpreteya.mp4" type="video/mp4" />
                Tu navegador no soporta video HTML5.
              </video>
            </div>
          </div>

          <div className="text-xs text-white/55 mt-3">
            Guarda tu video principal en <b>public/tutorial-interpreteya.mp4</b>
          </div>
        </div>

        {/* VIDEO BIENVENIDA */}
        <div className="tron-card p-4 md:p-6">
          <PanelTitle
            title="👋 Bienvenido"
            subtitle="Video corto de presentación rápida."
            rightTag="✨ Intro"
          />

          <div className="mt-4 tron-card p-2">
            <div className="overflow-hidden rounded-3xl border border-cyan-300/20 bg-black aspect-video">
              <video
                className="w-full h-full object-cover"
                controls
                playsInline
                preload="metadata"
                poster="/logo-interpreteya.png"
              >
                <source src="/bienvenido-interpreteya.mp4" type="video/mp4" />
                Tu navegador no soporta video HTML5.
              </video>
            </div>
          </div>

          <div className="text-xs text-white/55 mt-3">
            Guarda tu video corto en <b>public/bienvenido-interpreteya.mp4</b>
          </div>
        </div>
      </div>

      {/* ACCIONES RÁPIDAS */}
      <div className="tron-card p-4 md:p-6">
        <PanelTitle
          title="⚡ Accesos Rápidos"
          subtitle="Accesos principales del ecosistema InterpreteYa."
        />

        <div className="mt-4 grid md:grid-cols-2 gap-2">
          <Tile
            icon={nextAction.icon}
            title={nextAction.title}
            desc="Continúa según el modo activo de la app."
            disabled={!canAdvanced}
            onClick={() => nav(nextAction.path)}
          />

          <Tile
            icon="🌐"
            title="Ecosistema Autónomo"
            desc="Conoce cómo funciona InterpreteYa con usuarios, intérpretes, comunidad y empresas."
            disabled={false}
            onClick={() => nav("/ecosistema")}
          />

          <Tile
            icon="📘"
            title="Ver Propuesta"
            desc="Explora la propuesta social, tecnológica y autónoma del proyecto."
            disabled={false}
            onClick={() => nav("/propuesta")}
          />

          <Tile
            icon="🤝"
            title="Alianzas"
            desc="Convenios directos con empresas y organizaciones de la comunidad sorda."
            disabled={false}
            onClick={() => nav("/alianzas")}
          />
        </div>

        {!user && (
          <div className="text-xs text-white/55 mt-4">
            🔒 Para Solicitud / Denuncias / Cursos / Pagos: debes iniciar sesión.
          </div>
        )}
      </div>

      {/* BLOQUES DE VALOR */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="tron-card p-5">
          <div className="text-3xl">🤟</div>
          <div className="font-semibold mt-3">
            Creada por y para la comunidad sorda
          </div>
          <div className="text-sm text-white/70 mt-2">
            InterpreteYa pone a la comunidad sorda en el centro como usuarios,
            docentes, proveedores y agentes de cambio.
          </div>
        </div>

        <div className="tron-card p-5">
          <div className="text-3xl">🎥</div>
          <div className="font-semibold mt-3">
            Servicios en tiempo real y videollamada
          </div>
          <div className="text-sm text-white/70 mt-2">
            Solicitudes ahora, agendadas o por video, con validación y seguimiento
            del servicio.
          </div>
        </div>

        <div className="tron-card p-5">
          <div className="text-3xl">⚖️</div>
          <div className="font-semibold mt-3">
            Defensa activa de la LSCh
          </div>
          <div className="text-sm text-white/70 mt-2">
            Las denuncias y reportes generan evidencia, retroalimentación y base
            para proyectos de defensa e incidencia.
          </div>
        </div>
      </div>
    </div>
  );
}