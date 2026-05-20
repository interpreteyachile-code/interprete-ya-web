import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { supabase } from "../lib/supabaseClient";

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

function randomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
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
    return `${scheduledDate}T${scheduledTime}:00`;
  }, [mode, scheduledDate, scheduledTime]);

  if (!user) {
    return (
      <div className="tron-card p-6 max-w-xl mx-auto">
        🔒 Debes iniciar sesión.
      </div>
    );
  }

  const submit = async () => {
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

      const servicePayload = {
        client_id: user.id,
        client_name: user.fullName,
        client_rut: user.rut,
        mode,
        service_type: serviceType,
        zone,
        duration_min: Number(durationMin) || 30,
        amount_clp: amountCLP,
        note: note.trim(),
        scheduled_at: scheduledAt,
        status: "created",
        start_code: randomCode(),
        end_code: randomCode(),
      };

      const { data: createdService, error: serviceError } = await supabase
        .from("services")
        .insert(servicePayload)
        .select()
        .single();

      if (serviceError) throw serviceError;

      const paymentPayload = {
        type: "service_request",
        ref_id: createdService.id,
        user_id: user.id,
        user_name: user.fullName,
        amount_clp: amountCLP,
        status: "paid",
        method: "demo",
        note: "Pago demo de solicitud de intérprete",
      };

      const { error: paymentError } = await supabase
        .from("payments")
        .insert(paymentPayload);

      if (paymentError) throw paymentError;

      const { error: paidError } = await supabase
        .from("services")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
        })
        .eq("id", createdService.id);

      if (paidError) throw paidError;

      let assignedInterpreter = null;

      const { data: interpreters, error: interpreterError } = await supabase
        .from("profiles")
        .select("*")
        .eq("profile_type", "interpreter")
        .eq("status", "active");

      if (!interpreterError && interpreters?.length > 0) {
        assignedInterpreter =
          interpreters[Math.floor(Math.random() * interpreters.length)];

        const { error: assignError } = await supabase
          .from("services")
          .update({
            interpreter_id: assignedInterpreter.id,
            interpreter_name: assignedInterpreter.full_name,
            status: "matched",
          })
          .eq("id", createdService.id);

        if (assignError) throw assignError;
      }

      if (assignedInterpreter) {
        alert(
          `✅ Solicitud creada, pago registrado y asignada a ${assignedInterpreter.full_name}`
        );
      } else {
        alert(
          "✅ Solicitud creada y pago registrado. Aún no hay intérprete disponible."
        );
      }

      nav("/usuario", { replace: true });
    } catch (err) {
      console.log("Solicitud error:", err);
      setError("❌ No se pudo crear la solicitud. Revisa consola o permisos de Supabase.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto grid gap-4">
      <div className="aether-shell">
        <div className="aether-header">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="aether-title">🤟 Solicitud de intérprete</div>
              <div className="aether-subtitle">
                Crear servicio real · pago demo · asignación automática
              </div>
            </div>

            <span className="aether-tag-ok">CLIENTE ACTIVO</span>
          </div>
        </div>

        <div className="p-4 grid md:grid-cols-[1fr_.8fr] gap-4">
          <div className="aether-block">
            <div className="aether-block-head">Datos del cliente</div>
            <div className="aether-block-body grid gap-2 text-sm text-white/75">
              <div>👤 Cliente: <b>{user.fullName}</b></div>
              <div>🪪 RUT: <b>{user.rut}</b></div>
              <div>📡 Estado: <b>Preparando solicitud</b></div>
            </div>
          </div>

          <div className="aether-block">
            <div className="aether-block-head">Vista previa de pago</div>
            <div className="aether-block-body">
              <div className="text-3xl font-semibold h-title">
                {moneyCLP(amountCLP)}
              </div>
              <div className="text-sm text-white/60 mt-2">
                El pago se registrará en modo demo dentro de Supabase.
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="aether-shell">
          <div className="p-4 text-sm text-white/85">{error}</div>
        </div>
      )}

      <div className="aether-shell">
        <div className="aether-header">
          <div className="aether-title">Configuración de solicitud</div>
          <div className="aether-subtitle">
            Define modalidad, tipo de servicio, zona y duración
          </div>
        </div>

        <div className="p-4 grid gap-4">
          <div className="aether-block">
            <div className="aether-block-head">Modalidad</div>
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
              <div className="aether-block-head">Tipo de servicio</div>
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
              <div className="aether-block-head">Zona</div>
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
              <div className="aether-block-head">Duración</div>
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
                <div className="aether-block-head">Fecha agendada</div>
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
                <div className="aether-block-head">Hora agendada</div>
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
            <div className="aether-block-head">Descripción</div>
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

      <div className="aether-shell">
        <div className="aether-header">
          <div className="aether-title">Resumen de solicitud</div>
          <div className="aether-subtitle">Revisa antes de pagar y solicitar</div>
        </div>

        <div className="p-4 grid md:grid-cols-[1fr_.8fr] gap-4">
          <div className="aether-block">
            <div className="aether-block-head">Datos finales</div>
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
            <div className="aether-block-head">Confirmación de pago</div>
            <div className="aether-block-body">
              <div className="text-3xl font-semibold h-title">
                💳 {moneyCLP(amountCLP)}
              </div>

              <div className="text-xs text-white/55 mt-3">
                Se registrará el pago demo e intentará asignar un intérprete activo automáticamente.
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