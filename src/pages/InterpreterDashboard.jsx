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
    ? "🤝 Asignado"
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
  return mode === "video" ? "🎥 Video" : mode === "schedule" ? "📅 Agenda" : "⚡ Ahora";
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
    : "🧩 Servicio";
}

function zoneLabel(zone) {
  return zone === "norte" ? "🌵 Norte" : zone === "sur" ? "🌲 Sur" : "🏙️ Centro";
}

function flowMessage(service, user) {
  if (service.status === "paid" && !service.interpreterId) {
    return "💳 Servicio pagado y disponible para aceptar.";
  }

  if (service.status === "matched" && service.interpreterId === user?.id) {
    return "🤝 Ya fuiste asignado a este servicio. Puedes iniciarlo cuando corresponda.";
  }

  if (service.status === "started" && service.interpreterId === user?.id) {
    return "🔳 Servicio en curso. Mantén la comunicación activa con el usuario.";
  }

  if (service.status === "finished" && service.interpreterId === user?.id) {
    return "🏁 Servicio finalizado. Esperando evaluación del usuario.";
  }

  if (service.status === "rated" && service.interpreterId === user?.id) {
    return "⭐ Este servicio ya fue evaluado por el usuario.";
  }

  if (service.status === "cancelled") {
    return "⛔ Este servicio fue cancelado.";
  }

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

function roleLabel(user) {
  if (user?.role === "manager") return "Supervisor";
  return "Interpreter";
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
  };
}

export default function InterpreterDashboard() {
  const nav = useNavigate();
  const { user } = useAuth();

  const [services, setServices] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, [user?.id]);

  async function loadAll() {
    setLoading(true);
    await Promise.all([loadServices(), loadRatings()]);
    setLoading(false);
  }

  async function loadServices() {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Interpreter services error:", error);
      setServices([]);
      return;
    }

    setServices((data || []).map(mapService));
  }

  async function loadRatings() {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from("ratings")
      .select("*")
      .eq("interpreter_id", user.id);

    if (error) {
      console.log("Interpreter ratings error:", error);
      setRatings([]);
      return;
    }

    setRatings(data || []);
  }

  const available = useMemo(() => {
    return services.filter((s) => s.status === "paid" && !s.interpreterId);
  }, [services]);

  const mine = useMemo(() => {
    return services.filter((s) => s.interpreterId === user?.id);
  }, [services, user?.id]);

  const activeMine = useMemo(() => {
    return mine.filter((s) => s.status === "matched" || s.status === "started");
  }, [mine]);

  const finishedMine = useMemo(() => {
    return mine.filter((s) => s.status === "finished" || s.status === "rated");
  }, [mine]);

  const myRating = useMemo(() => {
    if (!ratings.length) return { avg: 0, total: 0 };

    const total = ratings.length;
    const sum = ratings.reduce((acc, r) => acc + Number(r.rating || 0), 0);
    const avg = Math.round((sum / total) * 10) / 10;

    return { avg, total };
  }, [ratings]);

  if (!user) {
    return (
      <div className="tron-card p-6 max-w-xl mx-auto">
        🔒 Debes iniciar sesión.
        <div className="mt-3">
          <button className="tron-btn tron-primary" onClick={() => nav("/login")}>
            🔐 Ir a Login
          </button>
        </div>
      </div>
    );
  }

  if (user.profileType !== "interpreter" && user.role !== "manager") {
    return (
      <div className="tron-card p-6 max-w-xl mx-auto">
        🔒 Solo intérprete.
      </div>
    );
  }

  const take = async (serviceId) => {
    const service = services.find((s) => s.id === serviceId);
    if (!service) return;

    if (service.interpreterId) {
      alert("⚠️ Este servicio ya fue asignado a otro intérprete.");
      return;
    }

    const { error } = await supabase
      .from("services")
      .update({
        interpreter_id: user.id,
        interpreter_name: user.fullName,
        status: "matched",
      })
      .eq("id", serviceId)
      .is("interpreter_id", null);

    if (error) {
      console.log(error);
      alert("❌ No se pudo aceptar la solicitud.");
      return;
    }

    await loadServices();
    alert("✅ Solicitud aceptada correctamente.");
  };

  const start = async (serviceId) => {
    const { error } = await supabase
      .from("services")
      .update({
        status: "started",
        started_at: new Date().toISOString(),
      })
      .eq("id", serviceId);

    if (error) {
      console.log(error);
      alert("❌ No se pudo iniciar el servicio.");
      return;
    }

    await loadServices();
  };

  const finish = async (serviceId) => {
    const { error } = await supabase
      .from("services")
      .update({
        status: "finished",
        finished_at: new Date().toISOString(),
      })
      .eq("id", serviceId);

    if (error) {
      console.log(error);
      alert("❌ No se pudo finalizar el servicio.");
      return;
    }

    await loadServices();
  };

  const availablePercent = services.length
    ? Math.round((available.length / services.length) * 100)
    : 8;

  const activePercent = services.length
    ? Math.round((activeMine.length / services.length) * 100)
    : 8;

  const ratingPercent = Math.max(
    8,
    Math.min(100, Math.round((Number(myRating.avg || 0) / 5) * 100))
  );

  const Card = ({ s, showTake = false }) => (
    <div className="aether-shell">
      <div className="aether-header">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="aether-title">
              {serviceTypeLabel(s.serviceType)} · {modeLabel(s.mode)}
            </div>
            <div className="aether-subtitle">
              {zoneLabel(s.zone)} · {statusLabel(s.status)}
            </div>
          </div>

          <Chip>{statusLabel(s.status)}</Chip>
        </div>
      </div>

      <div className="p-4 grid gap-3">
        <div className="aether-block">
          <div className="aether-block-head">Datos del servicio</div>
          <div className="aether-block-body grid gap-1 text-sm text-white/75">
            <div>👤 Cliente: <b>{s.clientName || s.clientRut || "—"}</b></div>
            <div>💳 Precio: <b>{moneyCLP(s.amountCLP)}</b></div>
            <div>⏱️ Duración: <b>{s.durationMin || 30} min</b></div>

            {s.scheduledAt && (
              <div>📅 Agenda: <b>{String(s.scheduledAt).replace("T", " ")}</b></div>
            )}

            {s.interpreterName && (
              <div>🧑‍💼 Asignado: <b>{s.interpreterName}</b></div>
            )}

            {s.note ? (
              <div className="text-xs text-white/58 mt-2">📝 {s.note}</div>
            ) : null}
          </div>
        </div>

        <div className="aether-block">
          <div className="aether-block-head">Estado en vivo</div>
          <div className="aether-block-body text-sm text-white/80">
            {flowMessage(s, user)}
          </div>
        </div>

        {showTake && (
          <button
            className="tron-btn tron-primary w-full font-semibold py-3"
            onClick={() => take(s.id)}
          >
            ✅ Aceptar solicitud
          </button>
        )}

        {(s.status === "matched" || s.status === "started") &&
          s.interpreterId === user.id && (
            <div className="grid gap-2">
              {s.mode === "video" && (
                <button
                  className="tron-btn tron-primary w-full font-semibold py-3"
                  onClick={() => nav(`/video/${s.id}`)}
                >
                  🎥 Entrar a videollamada
                </button>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  className="tron-btn tron-muted font-semibold py-3"
                  onClick={() => start(s.id)}
                  disabled={s.status === "started"}
                >
                  {s.status === "started" ? "✅ En curso" : "⏳ Iniciar"}
                </button>

                <button
                  className="tron-btn font-semibold py-3"
                  onClick={() => finish(s.id)}
                >
                  🏁 Finalizar
                </button>
              </div>
            </div>
          )}

        {s.status === "finished" && s.interpreterId === user.id && (
          <div className="panel-mini text-sm text-white/75">
            ✅ Servicio finalizado. Esperando evaluación del usuario.
          </div>
        )}

        {s.status === "rated" && s.interpreterId === user.id && (
          <div className="panel-mini text-sm text-white/75">
            ⭐ Este servicio ya fue evaluado.
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="grid gap-4">
      <div className="aether-shell">
        <div className="aether-header">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="aether-title">🤟 Panel Intérprete</div>
              <div className="aether-subtitle">
                Centro real de asignaciones conectado a Supabase · {roleLabel(user)}
              </div>
            </div>

            <div className="panel-mini min-w-[220px]">
              <div className="panel-label">Operator</div>
              <div className="text-sm font-semibold mt-2">{user.fullName}</div>
              <div className="text-xs text-white/55 mt-1">
                ⭐ Rating: {myRating.avg} ({myRating.total})
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 grid lg:grid-cols-[1.3fr_.7fr] gap-4">
          <div className="grid gap-4">
            <div className="aether-block">
              <div className="aether-block-head">Datos activos</div>
              <div className="aether-block-body">
                <div className="aether-wave" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
              <MetricCard label="Disponibles" value={available.length} hint="Pagados sin intérprete" />
              <MetricCard label="Activos" value={activeMine.length} hint="Asignados / en curso" />
              <MetricCard label="Finalizados" value={finishedMine.length} hint="Cerrados o evaluados" />
              <MetricCard label="Rating" value={myRating.avg} hint={`${myRating.total} evaluaciones`} />
            </div>
          </div>

          <div className="aether-block">
            <div className="aether-block-head">Resumen del sistema</div>
            <div className="aether-block-body">
              <div className="aether-statbars">
                <AetherBar label="Disp." value={availablePercent} />
                <AetherBar label="Activo" value={activePercent} />
                <AetherBar label="Rate" value={ratingPercent} />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 pt-0 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button className="tron-btn tron-primary py-3 font-semibold" onClick={loadAll}>
            🔄 Actualizar
          </button>

          <button className="tron-btn py-3 font-semibold" onClick={() => nav("/historial")}>
            📜 Ver historial
          </button>

          <button className="tron-btn py-3 font-semibold" onClick={() => nav("/cursos")}>
            🎓 Ver cursos
          </button>
        </div>
      </div>

      <div className="aether-shell">
        <div className="aether-header">
          <div className="aether-title">Solicitudes disponibles</div>
          <div className="aether-subtitle">
            Servicios pagados que aún no tienen intérprete asignado
          </div>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="panel-mini text-white/70">Cargando solicitudes...</div>
          ) : available.length === 0 ? (
            <div className="panel-mini text-white/70">
              No hay solicitudes pagadas disponibles por ahora.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              {available.map((s) => (
                <Card key={s.id} s={s} showTake />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="aether-shell">
        <div className="aether-header">
          <div className="aether-title">Mis servicios activos</div>
          <div className="aether-subtitle">
            Servicios ya asignados para ti, manual o automáticamente
          </div>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="panel-mini text-white/70">Cargando servicios...</div>
          ) : mine.length === 0 ? (
            <div className="panel-mini text-white/70">
              Aún no tienes servicios asignados.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              {mine.map((s) => (
                <Card key={s.id} s={s} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}