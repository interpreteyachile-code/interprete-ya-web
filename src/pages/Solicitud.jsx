import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createService,
  updateService,
  autoAssignInterpreter,
} from "../data/servicesStore";
import { createPayment } from "../data/paymentsStore";
import { useAuth } from "../auth/AuthContext";

function moneyCLP(n) {
  return "$" + Number(n || 0).toLocaleString("es-CL");
}

function calcPrice({ mode, serviceType, durationMin }) {
  let base = 0;

  if (mode === "now") base = 12000;
  else if (mode === "schedule") base = 15000;
  else if (mode === "video") base = 10000;

  let extraType = 0;
  if (serviceType === "reunion") extraType = 4000;
  else if (serviceType === "entrevista") extraType = 5000;
  else if (serviceType === "evento") extraType = 8000;

  let extraDuration = 0;
  if (durationMin > 30) {
    extraDuration = Math.ceil((durationMin - 30) / 30) * 5000;
  }

  return base + extraType + extraDuration;
}

function modeText(mode) {
  return mode === "now" ? "⚡ Ahora" : mode === "schedule" ? "📅 Agenda" : "🎥 Video";
}

function typeText(type) {
  return type === "tramite"
    ? "🧾 Trámite"
    : type === "reunion"
    ? "👥 Reunión"
    : type === "entrevista"
    ? "💼 Entrevista"
    : "🎤 Evento";
}

function zoneText(zone) {
  return zone === "norte" ? "🌵 Norte" : zone === "centro" ? "🏙️ Centro" : "🌲 Sur";
}

function OptionButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      className={`tron-btn font-semibold ${active ? "tron-primary" : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default function Solicitud() {
  const nav = useNavigate();
  const { user } = useAuth();

  const [mode, setMode] = useState("now");
  const [serviceType, setServiceType] = useState("tramite");
  const [zone, setZone] = useState("centro");
  const [durationMin, setDurationMin] = useState("30");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const amountCLP = useMemo(() => {
    return calcPrice({
      mode,
      serviceType,
      durationMin: Number(durationMin) || 30,
    });
  }, [mode, serviceType, durationMin]);

  const scheduledAt = useMemo(() => {
    if (mode !== "schedule") return null;
    if (!scheduledDate || !scheduledTime) return null;
    return `${scheduledDate}T${scheduledTime}`;
  }, [mode, scheduledDate, scheduledTime]);

  if (!user) {
    return (
      <div className="tron-card p-6 max-w-xl mx-auto">
        🔒 Debes iniciar sesión.
      </div>
    );
  }

  const submit = () => {
    setError("");

    if (mode === "schedule" && (!scheduledDate || !scheduledTime)) {
      setError("⚠️ Debes elegir fecha y hora para una solicitud agendada.");
      return;
    }

    if (!note.trim()) {
      setError("⚠️ Escribe una breve descripción del servicio.");
      return;
    }

    try {
      setSubmitting(true);

      const service = createService({
        clientId: user.id,
        clientName: user.fullName,
        clientRut: user.rut,
        mode,
        serviceType,
        zone,
        durationMin: Number(durationMin) || 30,
        amountCLP,
        note: note.trim(),
        scheduledAt,
        status: "created",
      });

      createPayment({
        type: "service_request",
        refId: service.id,
        userId: user.id,
        userName: user.fullName,
        amountCLP,
        status: "paid",
        method: "demo",
        note: "Pago demo de solicitud de intérprete",
      });

      updateService(service.id, {
        status: "paid",
        paidAt: Date.now(),
      });

      let assignedInterpreter = null;

      try {
        const result = autoAssignInterpreter(service.id);
        assignedInterpreter = result?.interpreter || null;
      } catch {
        console.log("Sin intérprete disponible para autoasignación");
      }

      if (assignedInterpreter) {
        alert(
          `✅ Solicitud creada, pago registrado y asignada a ${assignedInterpreter.fullName}`
        );
      } else {
        alert(
          "✅ Solicitud creada y pago registrado. Aún no hay intérprete disponible."
        );
      }

      nav("/usuario", { replace: true });
    } catch {
      setError("❌ No se pudo crear la solicitud.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto grid gap-4">
      {/* HEADER */}
      <div className="aether-shell">
        <div className="aether-header">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="aether-title">AETHER | SERVICE REQUEST</div>
              <div className="aether-subtitle">
                Solicitar intérprete · pago demo · asignación automática
              </div>
            </div>

            <span className="aether-tag-ok">CLIENT SESSION</span>
          </div>
        </div>

        <div className="p-4 grid md:grid-cols-[1fr_.8fr] gap-4">
          <div className="aether-block">
            <div className="aether-block-head">Client Data</div>
            <div className="aether-block-body grid gap-2 text-sm text-white/75">
              <div>👤 Cliente: <b>{user.fullName}</b></div>
              <div>🪪 RUT: <b>{user.rut}</b></div>
              <div>📡 Estado: <b>Preparando solicitud</b></div>
            </div>
          </div>

          <div className="aether-block">
            <div className="aether-block-head">Payment Preview</div>
            <div className="aether-block-body">
              <div className="text-3xl font-semibold h-title">
                {moneyCLP(amountCLP)}
              </div>
              <div className="text-sm text-white/60 mt-2">
                El pago se registrará en modo demo y luego se intentará asignar
                intérprete automáticamente.
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="aether-shell">
          <div className="p-4 text-sm text-white/85">
            {error}
          </div>
        </div>
      )}

      {/* FORM */}
      <div className="aether-shell">
        <div className="aether-header">
          <div className="aether-title">Request Configuration</div>
          <div className="aether-subtitle">
            Define modalidad, tipo de servicio, zona y duración
          </div>
        </div>

        <div className="p-4 grid gap-4">
          <div className="aether-block">
            <div className="aether-block-head">Mode Selection</div>
            <div className="aether-block-body grid grid-cols-1 sm:grid-cols-3 gap-2">
              <OptionButton active={mode === "now"} onClick={() => setMode("now")}>
                ⚡ Ahora
              </OptionButton>

              <OptionButton
                active={mode === "schedule"}
                onClick={() => setMode("schedule")}
              >
                📅 Agenda
              </OptionButton>

              <OptionButton active={mode === "video"} onClick={() => setMode("video")}>
                🎥 Video
              </OptionButton>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            <div className="aether-block">
              <div className="aether-block-head">Service Type</div>
              <div className="aether-block-body">
                <select
                  className="tron-select w-full"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                >
                  <option value="tramite">🧾 Trámite</option>
                  <option value="reunion">👥 Reunión</option>
                  <option value="entrevista">💼 Entrevista</option>
                  <option value="evento">🎤 Evento</option>
                </select>
              </div>
            </div>

            <div className="aether-block">
              <div className="aether-block-head">Zone</div>
              <div className="aether-block-body">
                <select
                  className="tron-select w-full"
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                >
                  <option value="norte">🌵 Norte</option>
                  <option value="centro">🏙️ Centro</option>
                  <option value="sur">🌲 Sur</option>
                </select>
              </div>
            </div>

            <div className="aether-block">
              <div className="aether-block-head">Duration</div>
              <div className="aether-block-body">
                <select
                  className="tron-select w-full"
                  value={durationMin}
                  onChange={(e) => setDurationMin(e.target.value)}
                >
                  <option value="30">30 minutos</option>
                  <option value="60">1 hora</option>
                  <option value="90">1 hora 30 min</option>
                  <option value="120">2 horas</option>
                </select>
              </div>
            </div>
          </div>

          {mode === "schedule" && (
            <div className="grid md:grid-cols-2 gap-3">
              <div className="aether-block">
                <div className="aether-block-head">Scheduled Date</div>
                <div className="aether-block-body">
                  <input
                    type="date"
                    className="tron-input w-full"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="aether-block">
                <div className="aether-block-head">Scheduled Time</div>
                <div className="aether-block-body">
                  <input
                    type="time"
                    className="tron-input w-full"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="aether-block">
            <div className="aether-block-head">Description</div>
            <div className="aether-block-body">
              <textarea
                className="tron-input w-full"
                rows={4}
                placeholder="Ej: necesito intérprete para reunión médica, entrevista laboral, trámite, etc."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="aether-shell">
        <div className="aether-header">
          <div className="aether-title">Request Summary</div>
          <div className="aether-subtitle">Revisa antes de pagar y solicitar</div>
        </div>

        <div className="p-4 grid md:grid-cols-[1fr_.8fr] gap-4">
          <div className="aether-block">
            <div className="aether-block-head">Summary Data</div>
            <div className="aether-block-body grid gap-2 text-sm text-white/75">
              <div>Modalidad: <b>{modeText(mode)}</b></div>
              <div>Tipo: <b>{typeText(serviceType)}</b></div>
              <div>Duración: <b>{durationMin} min</b></div>
              <div>Zona: <b>{zoneText(zone)}</b></div>

              {mode === "schedule" && scheduledAt && (
                <div>
                  Fecha agendada: <b>{scheduledDate}</b> a las{" "}
                  <b>{scheduledTime}</b>
                </div>
              )}
            </div>
          </div>

          <div className="aether-block">
            <div className="aether-block-head">Payment Confirmation</div>
            <div className="aether-block-body">
              <div className="text-3xl font-semibold h-title">
                💳 {moneyCLP(amountCLP)}
              </div>

              <div className="text-xs text-white/55 mt-3">
                Se registrará el pago demo e intentará asignar intérprete
                automáticamente.
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  className="tron-btn tron-muted py-3"
                  onClick={() => nav("/usuario")}
                  disabled={submitting}
                >
                  ⬅️ Volver
                </button>

                <button
                  type="button"
                  className={
                    "tron-btn tron-primary py-3 font-semibold " +
                    (submitting ? "opacity-70 cursor-not-allowed" : "")
                  }
                  onClick={submit}
                  disabled={submitting}
                >
                  {submitting ? "⏳ Enviando..." : "💳 Pagar y solicitar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}