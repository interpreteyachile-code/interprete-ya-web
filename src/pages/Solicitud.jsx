import { useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { createService } from "../data/servicesStore";

function Chip({ children }) {
  return <span className="tron-chip">{children}</span>;
}

function cx(...arr) {
  return arr.filter(Boolean).join(" ");
}

function moneyCLP(n) {
  return "$" + Number(n || 0).toLocaleString("es-CL");
}

function calcAmount({ mode, service }) {
  // ✅ demo: precios base
  const baseByService = {
    all: 12000,
    tramite: 15000,
    reunion: 22000,
    entrevista: 28000,
    evento: 45000,
  };

  const base = baseByService[service] ?? 12000;

  // modo: ahora / agenda / video
  const factor = mode === "now" ? 1.0 : mode === "schedule" ? 1.15 : 0.95; // video un poco más barato demo
  return Math.round(base * factor);
}

function genCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export default function Solicitud() {
  const nav = useNavigate();
  const { user } = useAuth();

  const outlet = useOutletContext() || {};
  const filters = outlet.filters || { mode: "now", service: "all", zone: "all" };
  const setFilters = outlet.setFilters;

  // ✅ Solo con sesión (como pediste)
  const isLogged = !!user;

  // inputs
  const [note, setNote] = useState("");
  const [when, setWhen] = useState(""); // agenda: fecha/hora
  const [duration, setDuration] = useState(30); // demo minutos
  const [creating, setCreating] = useState(false);

  const mode = filters.mode || "now";
  const service = filters.service || "all";
  const zone = filters.zone || "all";

  const amountCLP = useMemo(() => calcAmount({ mode, service }), [mode, service]);

  const modeLabel =
    mode === "now" ? "⚡ Ahora" : mode === "schedule" ? "📅 Agenda" : "🎥 Video";
  const serviceLabel =
    service === "tramite"
      ? "🧾 Trámite"
      : service === "reunion"
      ? "👥 Reunión"
      : service === "entrevista"
      ? "💼 Entrevista"
      : service === "evento"
      ? "🎤 Evento"
      : "🧩 Todos";

  const zoneLabel =
    zone === "norte" ? "🌵 Norte" : zone === "centro" ? "🏙️ Centro" : zone === "sur" ? "🌲 Sur" : "📍 Todas";

  const canCreate = useMemo(() => {
    if (!isLogged) return false;
    if (!note.trim()) return false;
    if (mode === "schedule" && !when) return false;
    return true;
  }, [isLogged, note, mode, when]);

  const create = async () => {
    if (!isLogged) return nav("/login");

    try {
      setCreating(true);

      const startCode = genCode();
      const endCode = genCode();

      createService({
        clientId: user.id,
        clientName: user.fullName,
        mode,
        amountCLP,
        startCode,
        endCode,

        // extras demo
        serviceType: service,
        zone,
        note: note.trim(),
        scheduledFor: mode === "schedule" ? when : null,
        durationMin: duration,
      });

      alert(
        "✅ Solicitud creada (demo).\n\n" +
          "🔳 Código INICIO: " +
          startCode +
          "\n🔳 Código FIN: " +
          endCode +
          "\n\n" +
          "Ahora el Intérprete lo verá en su Panel."
      );

      // opcional: ir al panel según perfil
      if (user.profileType === "interpreter") nav("/interprete");
      else nav("/usuario");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="grid gap-4">
      {/* Header */}
      <div className="tron-card p-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="text-2xl font-semibold h-title">🧾 Solicitud</div>
            <div className="text-white/70 mt-2">
              Flujo demo: Solicitud → Intérprete acepta → Validación (códigos) → Video (si aplica) → Fin.
            </div>

            <div className="mt-4 flex gap-2 flex-wrap">
              <Chip>{modeLabel}</Chip>
              <Chip>{serviceLabel}</Chip>
              <Chip>{zoneLabel}</Chip>
            </div>
          </div>

          <div className="tron-card p-4">
            <div className="text-xs text-white/60">Monto estimado</div>
            <div className="text-xl font-semibold">{moneyCLP(amountCLP)}</div>
            <div className="text-xs text-white/55 mt-1">Demo (se ajusta por modo/servicio)</div>
          </div>
        </div>
      </div>

      {/* Si no hay sesión */}
      {!isLogged ? (
        <div className="tron-card p-6 max-w-xl mx-auto">
          🔒 Debes iniciar sesión para crear una solicitud.
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button className="tron-btn tron-primary py-3 font-semibold" onClick={() => nav("/login")}>
              🔐 Ingresar
            </button>
            <button className="tron-btn py-3 font-semibold" onClick={() => nav("/register")}>
              ✍️ Registro
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Controles (re-usa filtros del navbar, pero aquí puedes cambiar rápido) */}
          <div className="tron-card p-6">
            <div className="font-semibold">⚙️ Configurar solicitud</div>
            <div className="text-sm text-white/70 mt-1">Cambios rápidos (se guardan en filtros).</div>

            <div className="mt-4 grid md:grid-cols-3 gap-2">
              {/* Modo */}
              <div className="tron-card p-3">
                <div className="text-xs text-white/60">⚡ Modo</div>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <button
                    className={cx("tron-btn py-2", mode === "now" && "tron-primary")}
                    onClick={() => setFilters?.((f) => ({ ...f, mode: "now" }))}
                  >
                    ⚡
                  </button>
                  <button
                    className={cx("tron-btn py-2", mode === "schedule" && "tron-primary")}
                    onClick={() => setFilters?.((f) => ({ ...f, mode: "schedule" }))}
                  >
                    📅
                  </button>
                  <button
                    className={cx("tron-btn py-2", mode === "video" && "tron-primary")}
                    onClick={() => setFilters?.((f) => ({ ...f, mode: "video" }))}
                  >
                    🎥
                  </button>
                </div>
              </div>

              {/* Servicio */}
              <div className="tron-card p-3">
                <div className="text-xs text-white/60">🧩 Servicio</div>
                <select
                  className="tron-select w-full mt-2"
                  value={service}
                  onChange={(e) => setFilters?.((f) => ({ ...f, service: e.target.value }))}
                >
                  <option value="all">🧩 Todos</option>
                  <option value="tramite">🧾 Trámite</option>
                  <option value="reunion">👥 Reunión</option>
                  <option value="entrevista">💼 Entrevista</option>
                  <option value="evento">🎤 Evento</option>
                </select>
              </div>

              {/* Zona */}
              <div className="tron-card p-3">
                <div className="text-xs text-white/60">📍 Zona</div>
                <select
                  className="tron-select w-full mt-2"
                  value={zone}
                  onChange={(e) => setFilters?.((f) => ({ ...f, zone: e.target.value }))}
                >
                  <option value="all">📍 Todas</option>
                  <option value="norte">🌵 Norte</option>
                  <option value="centro">🏙️ Centro</option>
                  <option value="sur">🌲 Sur</option>
                </select>
              </div>
            </div>

            {/* Agenda extra */}
            {mode === "schedule" && (
              <div className="mt-4 grid md:grid-cols-2 gap-2">
                <div>
                  <label className="text-sm text-white/70">📅 Fecha y hora</label>
                  <input
                    type="datetime-local"
                    className="tron-input w-full mt-1"
                    value={when}
                    onChange={(e) => setWhen(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm text-white/70">⏱️ Duración (min)</label>
                  <select className="tron-select w-full mt-1" value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
                    <option value={10}>10</option>
                    <option value={30}>30</option>
                    <option value={60}>60</option>
                  </select>
                </div>
              </div>
            )}

            <div className="mt-4">
              <label className="text-sm text-white/70">📝 Nota / Motivo</label>
              <textarea
                className="tron-input w-full mt-1 min-h-[90px]"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ej: Necesito intérprete para reunión..."
              />
              <div className="text-xs text-white/55 mt-1">
                Se usará para que el intérprete entienda rápido.
              </div>
            </div>

            <button
              className={cx(
                "tron-btn tron-primary w-full mt-4 py-3 font-semibold",
                (!canCreate || creating) && "opacity-70 cursor-not-allowed"
              )}
              disabled={!canCreate || creating}
              onClick={create}
            >
              {creating ? "⏳ Creando..." : "✅ Crear solicitud"}
            </button>

            <div className="text-xs text-white/55 mt-3">
              🔳 Se generan 2 códigos (Inicio/Fin) para validación demo (tipo QR).
            </div>
          </div>

          {/* Guía visual */}
          <div className="tron-card p-6">
            <div className="font-semibold">🔁 Flujo (demo)</div>
            <div className="mt-3 grid md:grid-cols-5 gap-2">
              <div className="tron-card p-4">
                <div className="text-2xl">1️⃣</div>
                <div className="text-sm font-semibold mt-2">Crear</div>
                <div className="text-xs text-white/60 mt-1">Solicitud con filtros</div>
              </div>
              <div className="tron-card p-4">
                <div className="text-2xl">2️⃣</div>
                <div className="text-sm font-semibold mt-2">Aceptar</div>
                <div className="text-xs text-white/60 mt-1">Intérprete toma</div>
              </div>
              <div className="tron-card p-4">
                <div className="text-2xl">🔳</div>
                <div className="text-sm font-semibold mt-2">Inicio</div>
                <div className="text-xs text-white/60 mt-1">Código inicio</div>
              </div>
              <div className="tron-card p-4">
                <div className="text-2xl">🎥</div>
                <div className="text-sm font-semibold mt-2">Servicio</div>
                <div className="text-xs text-white/60 mt-1">Video / presencial</div>
              </div>
              <div className="tron-card p-4">
                <div className="text-2xl">🏁</div>
                <div className="text-sm font-semibold mt-2">Fin</div>
                <div className="text-xs text-white/60 mt-1">Código fin</div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button className="tron-btn py-3" onClick={() => nav("/interprete")}>
                🧑‍💼 Ir Panel Intérprete
              </button>
              <button className="tron-btn tron-muted py-3" onClick={() => nav("/")}>
                🏠 Inicio
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}