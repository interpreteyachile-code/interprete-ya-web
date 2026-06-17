import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { supabase } from "../lib/supabaseClient";

function Chip({ children }) {
  return <span className="tron-chip">{children}</span>;
}

function moneyCLP(n) {
  return "$" + Number(n || 0).toLocaleString("es-CL");
}

function statusLabel(status) {
  return status === "created"
    ? "🧾 Creado"
    : status === "paid"
    ? "💳 Pagado"
    : status === "matched"
    ? "🤝 Intérprete asignado"
    : status === "started"
    ? "🔳 En curso"
    : status === "finished"
    ? "🏁 Finalizado"
    : status === "rated"
    ? "⭐ Evaluado"
    : status === "cancelled"
    ? "⛔ Cancelado"
    : "—";
}

function modeLabel(mode) {
  return mode === "video"
    ? "🎥 Video"
    : mode === "schedule"
    ? "📅 Agenda"
    : "⚡ Ahora";
}

function serviceTypeLabel(type) {
  return type === "tramite"
    ? "🧾 Trámite"
    : type === "reunion"
    ? "👥 Reunión"
    : type === "entrevista"
    ? "💼 Entrevista"
    : type === "evento"
    ? "🎤 Evento"
    : type === "emergencia"
    ? "🚨 Emergencia"
    : "🧩 Servicio";
}

function zoneLabel(zone) {
  return zone === "norte" ? "🌵 Norte" : zone === "sur" ? "🌲 Sur" : "🏙️ Centro";
}

function flowMessage(service) {
  if (service.status === "created") return "🧾 Solicitud creada en el sistema.";

  if (service.status === "paid" && !service.interpreterId) {
    return service.priority === "high"
      ? "🚨 SOS enviado. Esperando intérprete o asignación del gerente."
      : "💳 Pago confirmado. Esperando que gerente asigne intérprete.";
  }

  if (service.status === "matched") {
    return `🤝 Ya tienes intérprete asignado: ${
      service.interpreterName || "Intérprete"
    }. Puedes entrar a la videollamada.`;
  }

  if (service.status === "started") {
    return `🔳 El servicio está en curso con ${
      service.interpreterName || "tu intérprete"
    }.`;
  }

  if (service.status === "finished") {
    return "🏁 El servicio finalizó correctamente. Ya puedes calificar.";
  }

  if (service.status === "rated") {
    return "⭐ Ya evaluaste este servicio. Gracias por aportar a la comunidad.";
  }

  if (service.status === "cancelled") return "⛔ Este servicio fue cancelado.";

  return "ℹ️ Estado actualizado.";
}

function MetricCard({ label, value, hint }) {
  return (
    <div className="aether-mini-metric">
      <div className="aether-mini-label">{label}</div>
      <div className="aether-mini-value">{value}</div>
      {hint ? <div className="text-xs text-white/50">{hint}</div> : null}
    </div>
  );
}

function AetherBar({ label, value }) {
  return (
    <div className="aether-bar">
      <div className="aether-bar-label">{label}</div>
      <div className="aether-bar-track">
        <div
          className="aether-bar-fill"
          style={{ height: `${Math.max(8, Math.min(100, value))}%` }}
        />
      </div>
      <div className="aether-bar-value">{value}%</div>
    </div>
  );
}

function mapService(s) {
  return {
    ...s,
    clientId: s.client_id,
    clientRut: s.client_rut,
    clientName: s.client_name,
    interpreterId: s.interpreter_id,
    interpreterName: s.interpreter_name,
    serviceType: s.service_type,
    durationMin: s.duration_min,
    scheduledAt: s.scheduled_at,
    amountCLP: s.amount_clp,
    paidAt: s.paid_at,
    startCode: s.start_code,
    endCode: s.end_code,
    startedAt: s.started_at,
    finishedAt: s.finished_at,
    ratedAt: s.rated_at,
    createdAt: s.created_at,
    videoRoom: s.video_room,
    priority: s.priority || "normal",
  };
}

export default function UserDashboard() {
  const nav = useNavigate();
  const { user } = useAuth();

  const [my, setMy] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyServices();

    const timer = setInterval(() => {
      loadMyServices(false);
    }, 8000);

    return () => clearInterval(timer);
  }, [user?.id, user?.rut]);

  async function loadMyServices(showLoading = true) {
    if (!user?.id && !user?.rut) return;

    if (showLoading) setLoading(true);

    const { data, error } = await supabase
      .from("services")
      .select("*")
      .or(`client_id.eq.${user.id},client_rut.eq.${user.rut}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.log("UserDashboard services error:", error);
      setMy([]);
    } else {
      setMy((data || []).map(mapService));
    }

    if (showLoading) setLoading(false);
  }

  const counts = useMemo(() => {
    return {
      total: my.length,
      paid: my.filter((s) => s.status === "paid").length,
      matched: my.filter((s) => s.status === "matched").length,
      started: my.filter((s) => s.status === "started").length,
      finished: my.filter((s) => s.status === "finished").length,
      rated: my.filter((s) => s.status === "rated").length,
      sos: my.filter((s) => s.priority === "high").length,
    };
  }, [my]);

  if (!user) {
    return (
      <div className="tron-card p-6 max-w-xl mx-auto">
        🔒 Debes iniciar sesión.
        <div className="mt-3">
          <button className="tron-btn tron-primary" onClick={() => nav("/login")}>
            🔐 Login
          </button>
        </div>
      </div>
    );
  }

  const totalBase = Math.max(1, counts.total);
  const paidPercent = Math.round((counts.paid / totalBase) * 100);
  const activePercent = Math.round(
    ((counts.matched + counts.started) / totalBase) * 100
  );
  const completedPercent = Math.round(
    ((counts.finished + counts.rated) / totalBase) * 100
  );

  return (
    <div className="grid gap-4">
      <div className="aether-shell">
        <div className="aether-header">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="aether-title">🤟 Panel Usuario</div>
              <div className="aether-subtitle">
                Solicitudes reales · actualización automática cada 8 segundos
              </div>
            </div>

            <div className="panel-mini min-w-[220px]">
              <div className="panel-label">Sesión usuario</div>
              <div className="text-sm font-semibold mt-2">{user.fullName}</div>
              <div className="text-xs text-white/55 mt-1">🪪 {user.rut}</div>
            </div>
          </div>
        </div>

        <div className="p-4 grid lg:grid-cols-[1.3fr_.7fr] gap-4">
          <div className="grid gap-4">
            <div className="aether-block">
              <div className="aether-block-head">Señal activa</div>
              <div className="aether-block-body">
                <div className="aether-wave" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-3">
              <MetricCard label="Solicitudes" value={counts.total} hint="Total registradas" />
              <MetricCard label="Pagadas" value={counts.paid} hint="Esperando intérprete" />
              <MetricCard
                label="Activas"
                value={counts.matched + counts.started}
                hint="Asignadas / en curso"
              />
              <MetricCard
                label="Finalizadas"
                value={counts.finished + counts.rated}
                hint="Cerradas / evaluadas"
              />
              <MetricCard label="SOS" value={counts.sos} hint="Emergencias" />
            </div>
          </div>

          <div className="aether-block">
            <div className="aether-block-head">Resumen</div>
            <div className="aether-block-body">
              <div className="aether-statbars">
                <AetherBar label="Pago" value={paidPercent} />
                <AetherBar label="Activo" value={activePercent} />
                <AetherBar label="Listo" value={completedPercent} />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 pt-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            className="tron-btn tron-primary py-3 font-semibold"
            onClick={() => nav("/solicitud")}
          >
            ➕ Nueva Solicitud
          </button>

          <button
            className="tron-btn tron-danger py-3 font-semibold"
            onClick={() => nav("/solicitud")}
          >
            🚨 Crear SOS
          </button>

          <button
            className="tron-btn py-3 font-semibold"
            onClick={() => nav("/pagos")}
          >
            💳 Mis pagos
          </button>

          <button
            className="tron-btn py-3 font-semibold"
            onClick={() => nav("/historial")}
          >
            📜 Historial
          </button>
        </div>
      </div>

      <div className="aether-shell">
        <div className="aether-header">
          <div className="aether-title">📚 Mis solicitudes</div>
          <div className="aether-subtitle">
            Seguimiento de pagos, asignación y videollamada
          </div>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="panel-mini text-white/70">Cargando solicitudes...</div>
          ) : my.length === 0 ? (
            <div className="panel-mini text-white/70">
              Aún no tienes solicitudes creadas.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              {my.map((s) => {
                const canEnterVideo =
                  (s.mode === "video" || s.videoRoom || s.priority === "high") &&
                  (s.status === "matched" || s.status === "started");

                return (
                  <div key={s.id} className="aether-shell">
                    <div className="aether-header">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="aether-title">
                            {s.priority === "high" ? "🚨 SOS · " : ""}
                            {serviceTypeLabel(s.serviceType)} · {modeLabel(s.mode)}
                          </div>
                          <div className="aether-subtitle">
                            {zoneLabel(s.zone)} · {statusLabel(s.status)}
                          </div>
                        </div>

                        <Chip>
                          {s.priority === "high" ? "🚨 SOS" : statusLabel(s.status)}
                        </Chip>
                      </div>
                    </div>

                    <div className="p-4 grid gap-3">
                      <div className="aether-block">
                        <div className="aether-block-head">Datos del servicio</div>
                        <div className="aether-block-body grid gap-1 text-sm text-white/75">
                          <div>💳 Precio: <b>{moneyCLP(s.amountCLP)}</b></div>
                          <div>⏱️ Duración: <b>{s.durationMin || 30} min</b></div>

                          {s.scheduledAt && (
                            <div>
                              📅 Agenda: <b>{String(s.scheduledAt).replace("T", " ")}</b>
                            </div>
                          )}

                          <div>
                            🧑‍💼 Intérprete:{" "}
                            <b>{s.interpreterName || "Aún no asignado"}</b>
                          </div>

                          {s.videoRoom && <div>🎥 Sala: <b>{s.videoRoom}</b></div>}
                          {s.startCode && <div>🔳 Código inicio: <b>{s.startCode}</b></div>}
                          {s.endCode && <div>🏁 Código fin: <b>{s.endCode}</b></div>}
                        </div>
                      </div>

                      <div className="aether-block">
                        <div className="aether-block-head">Estado en vivo</div>
                        <div className="aether-block-body text-sm text-white/80">
                          {flowMessage(s)}
                        </div>
                      </div>

                      {s.note && (
                        <div className="panel-mini text-sm text-white/65">
                          📝 {s.note}
                        </div>
                      )}

                      <div className="grid gap-2">
                        {canEnterVideo && (
                          <button
                            className="tron-btn tron-primary w-full py-3 font-semibold"
                            onClick={() => nav(`/video/${s.id}`)}
                          >
                            🎥 Entrar a videollamada
                          </button>
                        )}

                        {s.status === "finished" && (
                          <button
                            className="tron-btn w-full py-3 font-semibold"
                            onClick={() => nav(`/calificar/${s.id}`)}
                          >
                            ⭐ Calificar servicio
                          </button>
                        )}

                        <button
                          className="tron-btn tron-muted w-full py-3 font-semibold"
                          onClick={() => loadMyServices()}
                        >
                          🔄 Actualizar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}