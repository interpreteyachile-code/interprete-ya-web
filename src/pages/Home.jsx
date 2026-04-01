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
      {/* HERO PRINCIPAL */}
      <div className="tron-card p-4 md:p-6 overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-6 items-center">
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

          {/* IMAGEN PRINCIPAL */}
          <div>
            <div className="tron-card p-2">
              <div className="relative overflow-hidden rounded-3xl border border-cyan-300/20 bg-cyan-300/5 min-h-[220px] h-[260px] md:h-[320px] lg:h-[380px]">
                <img
                  src="/hero-interpreteya.jpg"
                  alt="Presentación visual de InterpreteYa"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const fallback = e.currentTarget.nextElementSibling;
                    if (fallback) fallback.style.display = "grid";
                  }}
                />

                <div
                  className="absolute inset-0 hidden place-items-center text-center p-6"
                  style={{ display: "none" }}
                >
                  <div>
                    <div className="text-6xl">🤟</div>
                    <div className="mt-3 text-lg font-semibold">
                      Aquí irá tu imagen principal
                    </div>
                    <div className="text-sm text-white/60 mt-2">
                      Guarda tu foto o banner en <b>public/hero-interpreteya.jpg</b>
                    </div>
                  </div>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                  <div className="text-sm md:text-base font-semibold">
                    InterpreteYa • Comunidad Sorda • LSCh
                  </div>
                  <div className="text-xs text-white/70 mt-1">
                    Modelo autónomo, social y tecnológico
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* VIDEO DEMO */}
      <div className="tron-card p-4 md:p-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-2xl font-semibold h-title">
              🎬 Video de Presentación
            </div>
            <div className="text-white/70 mt-2">
              Muestra cómo funciona InterpreteYa: solicitud, pago, asignación,
              videollamada y defensa de la LSCh.
            </div>
          </div>

          <GlowTag>📱 Mobile First</GlowTag>
        </div>

        <div className="mt-4 tron-card p-2">
          <div className="overflow-hidden rounded-3xl border border-cyan-300/20 bg-black aspect-video">
            <video
              className="w-full h-full object-cover"
              controls
              playsInline
              preload="metadata"
              poster="/hero-interpreteya.jpg"
            >
              <source src="/demo-interpreteya.mp4" type="video/mp4" />
              Tu navegador no soporta video HTML5.
            </video>
          </div>
        </div>

        <div className="text-xs text-white/55 mt-3">
          Guarda tu video en <b>public/demo-interpreteya.mp4</b> para verlo aquí.
        </div>
      </div>

      {/* ACCIONES RÁPIDAS */}
      <div className="tron-card p-4 md:p-6">
        <div className="text-2xl font-semibold h-title">
          ⚡ Accesos Rápidos
        </div>

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