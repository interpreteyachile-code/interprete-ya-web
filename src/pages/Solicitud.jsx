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

      // 1) Crear servicio
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

      // 2) Registrar pago demo
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

      // 3) Marcar servicio como pagado
      updateService(service.id, {
        status: "paid",
        paidAt: Date.now(),
      });

      // 4) Intentar auto asignar intérprete
      let assignedInterpreter = null;

      try {
        const result = autoAssignInterpreter(service.id);
        assignedInterpreter = result?.interpreter || null;
      } catch (assignErr) {
        console.log("Sin intérprete disponible para autoasignación");
      }

      // 5) Mensaje final
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
    } catch (err) {
      setError("❌ No se pudo crear la solicitud.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto grid gap-4">
      <div className="tron-card p-6">
        <div className="text-2xl font-semibold h-title">
          🤟 Solicitar Intérprete
        </div>
        <div className="text-white/70 mt-2">
          Completa los datos para crear tu solicitud en InterpreteYa.
        </div>

        <div className="mt-4 tron-card p-4">
          <div className="text-sm text-white/80">
            👤 Cliente: <b>{user.fullName}</b>
          </div>
          <div className="text-xs text-white/55 mt-1">
            🪪 RUT: {user.rut}
          </div>
        </div>
      </div>

      {error && (
        <div className="tron-card p-4 text-sm text-white/85">
          {error}
        </div>
      )}

      <div className="tron-card p-5 grid gap-4">
        <div>
          <div className="text-sm text-white/70 mb-2">⚡ Modalidad</div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              className={`tron-btn ${mode === "now" ? "tron-primary" : ""}`}
              onClick={() => setMode("now")}
            >
              ⚡ Ahora
            </button>

            <button
              type="button"
              className={`tron-btn ${mode === "schedule" ? "tron-primary" : ""}`}
              onClick={() => setMode("schedule")}
            >
              📅 Agenda
            </button>

            <button
              type="button"
              className={`tron-btn ${mode === "video" ? "tron-primary" : ""}`}
              onClick={() => setMode("video")}
            >
              🎥 Video
            </button>
          </div>
        </div>

        <div>
          <div className="text-sm text-white/70 mb-1">🧩 Tipo de servicio</div>

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

        <div>
          <div className="text-sm text-white/70 mb-1">📍 Zona</div>

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

        <div>
          <div className="text-sm text-white/70 mb-1">⏱️ Duración estimada</div>

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

        {mode === "schedule" && (
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <div className="text-sm text-white/70 mb-1">📅 Fecha</div>
              <input
                type="date"
                className="tron-input w-full"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </div>

            <div>
              <div className="text-sm text-white/70 mb-1">🕒 Hora</div>
              <input
                type="time"
                className="tron-input w-full"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>
          </div>
        )}

        <div>
          <div className="text-sm text-white/70 mb-1">📝 Descripción</div>

          <textarea
            className="tron-input w-full"
            rows={4}
            placeholder="Ej: necesito intérprete para reunión médica, entrevista laboral, trámite, etc."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="tron-card p-4">
          <div className="font-semibold">📌 Resumen</div>

          <div className="text-sm text-white/75 mt-2">
            Modalidad:{" "}
            <b>
              {mode === "now"
                ? "⚡ Ahora"
                : mode === "schedule"
                ? "📅 Agenda"
                : "🎥 Video"}
            </b>
          </div>

          <div className="text-sm text-white/75 mt-1">
            Tipo:{" "}
            <b>
              {serviceType === "tramite"
                ? "🧾 Trámite"
                : serviceType === "reunion"
                ? "👥 Reunión"
                : serviceType === "entrevista"
                ? "💼 Entrevista"
                : "🎤 Evento"}
            </b>
          </div>

          <div className="text-sm text-white/75 mt-1">
            Duración: <b>{durationMin} min</b>
          </div>

          <div className="text-sm text-white/75 mt-1">
            Zona:{" "}
            <b>
              {zone === "norte"
                ? "🌵 Norte"
                : zone === "centro"
                ? "🏙️ Centro"
                : "🌲 Sur"}
            </b>
          </div>

          {mode === "schedule" && scheduledAt && (
            <div className="text-sm text-white/75 mt-1">
              Fecha agendada: <b>{scheduledDate}</b> a las <b>{scheduledTime}</b>
            </div>
          )}

          <div className="text-lg font-semibold mt-3">
            💳 Precio estimado: {moneyCLP(amountCLP)}
          </div>

          <div className="text-xs text-white/55 mt-2">
            Se registrará el pago demo e intentará asignar intérprete automáticamente.
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
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
  );
}