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
  return status === "paid"
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
    : "🧾 Creado";
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
    : type === "emergencia"
    ? "🚨 Emergencia"
    : "🧩 Servicio";
}

function zoneLabel(zone) {
  return zone === "norte" ? "🌵 Norte" : zone === "sur" ? "🌲 Sur" : "🏙️ Centro";
}

function makeVideoRoom(id) {
  return `InterpreteYa-${String(id).replace(/[^a-zA-Z0-9]/g, "")}`;
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
    startCode: s.start_code,
    endCode: s.end_code,
    videoRoom: s.video_room,
    priority: s.priority || "normal",
    acceptedAt: s.accepted_at,
    createdAt: s.created_at,
  };
}

export default function InterpreterDashboard() {
  const nav = useNavigate();
  const { user } = useAuth();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServices();

    const timer = setInterval(() => {
      loadServices(false);
    }, 8000);

    return () => clearInterval(timer);
  }, [user?.id]);

  async function loadServices(showLoading = true) {
    if (showLoading) setLoading(true);

    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Interpreter services error:", error);
      setServices([]);
    } else {
      setServices((data || []).map(mapService));
    }

    if (showLoading) setLoading(false);
  }

  const available = useMemo(() => {
    return services
      .filter((s) => s.status === "paid" && !s.interpreterId)
      .sort((a, b) => {
        if (a.priority === "high" && b.priority !== "high") return -1;
        if (a.priority !== "high" && b.priority === "high") return 1;
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
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

  if (!user) {
    return <div className="tron-card p-6">🔒 Debes iniciar sesión.</div>;
  }

  if (user.profileType !== "interpreter" && user.role !== "manager") {
    return <div className="tron-card p-6">🔒 Solo intérprete.</div>;
  }

  const take = async (serviceId) => {
    const service = services.find((s) => s.id === serviceId);
    if (!service) return;

    if (service.interpreterId) {
      alert("⚠️ Este servicio ya fue asignado.");
      return;
    }

    const room =
      service.videoRoom ||
      service.video_room ||
      makeVideoRoom(service.id);

    const { error } = await supabase
      .from("services")
      .update({
        interpreter_id: user.id,
        interpreter_name: user.fullName,
        status: "matched",
        accepted_at: new Date().toISOString(),
        assigned_by: "interpreter",
        video_room: room,
      })
      .eq("id", serviceId)
      .is("interpreter_id", null);

    if (error) {
      console.log(error);
      alert("❌ No se pudo aceptar la solicitud.");
      return;
    }

    await loadServices();
    alert("✅ Solicitud aceptada y sala de video creada.");
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

  const Card = ({ s, showTake = false }) => {
    const canEnterVideo =
      (s.mode === "video" || s.videoRoom || s.priority === "high") &&
      (s.status === "matched" || s.status === "started") &&
      s.interpreterId === user.id;

    return (
      <div className="aether-shell">
        <div className="aether-header">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="aether-title">
                {s.priority === "high" ? "🚨 SOS · " : ""}
                {serviceTypeLabel(s.serviceType)} · {modeLabel(s.mode)}
              </div>
              <div className="aether-subtitle">
                {zoneLabel(s.zone)} · {statusLabel(s.status)}
              </div>
            </div>

            <Chip>{s.priority === "high" ? "🚨 URGENTE" : statusLabel(s.status)}</Chip>
          </div>
        </div>

        <div className="p-4 grid gap-3">
          <div className="aether-block">
            <div className="aether-block-head">Datos del servicio</div>
            <div className="aether-block-body grid gap-1 text-sm text-white/75">
              <div>👤 Cliente: <b>{s.clientName || s.clientRut || "—"}</b></div>
              <div>💳 Precio: <b>{moneyCLP(s.amountCLP)}</b></div>
              <div>⏱️ Duración: <b>{s.durationMin || 30} min</b></div>
              <div>📍 Zona: <b>{zoneLabel(s.zone)}</b></div>

              {s.scheduledAt && (
                <div>📅 Agenda: <b>{String(s.scheduledAt).replace("T", " ")}</b></div>
              )}

              {s.videoRoom && <div>🎥 Sala: <b>{s.videoRoom}</b></div>}

              {s.note && <div className="text-xs text-white/58 mt-2">📝 {s.note}</div>}
            </div>
          </div>

          {showTake && (
            <button
              className={
                s.priority === "high"
                  ? "tron-btn tron-danger w-full py-3 font-semibold"
                  : "tron-btn tron-primary w-full py-3 font-semibold"
              }
              onClick={() => take(s.id)}
            >
              {s.priority === "high" ? "🚨 Aceptar SOS urgente" : "✅ Aceptar solicitud"}
            </button>
          )}

          {canEnterVideo && (
            <button
              className="tron-btn tron-primary w-full py-3 font-semibold"
              onClick={() => nav(`/video/${s.id}`)}
            >
              🎥 Entrar a videollamada
            </button>
          )}

          {(s.status === "matched" || s.status === "started") &&
            s.interpreterId === user.id && (
              <div className="grid sm:grid-cols-2 gap-2">
                <button
                  className="tron-btn tron-muted py-3 font-semibold"
                  onClick={() => start(s.id)}
                  disabled={s.status === "started"}
                >
                  {s.status === "started" ? "✅ En curso" : "⏳ Iniciar"}
                </button>

                <button className="tron-btn py-3 font-semibold" onClick={() => finish(s.id)}>
                  🏁 Finalizar
                </button>
              </div>
            )}

          {s.status === "finished" && (
            <div className="panel-mini text-sm text-white/75">
              ✅ Servicio finalizado. Esperando calificación del usuario.
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="grid gap-4">
      <div className="aether-shell">
        <div className="aether-header">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="aether-title">🤟 Panel Intérprete Pro</div>
              <div className="aether-subtitle">
                Solicitudes normales + 🚨 SOS · actualización automática cada 8 segundos
              </div>
            </div>

            <div className="panel-mini min-w-[220px]">
              <div className="panel-label">Intérprete</div>
              <div className="text-sm font-semibold mt-2">{user.fullName}</div>
              <div className="text-xs text-white/55 mt-1">{user.email}</div>
            </div>
          </div>
        </div>

        <div className="p-4 grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <div className="aether-mini-metric">
            <div className="aether-mini-label">Disponibles</div>
            <div className="aether-mini-value">{available.length}</div>
          </div>

          <div className="aether-mini-metric">
            <div className="aether-mini-label">SOS</div>
            <div className="aether-mini-value">
              {available.filter((s) => s.priority === "high").length}
            </div>
          </div>

          <div className="aether-mini-metric">
            <div className="aether-mini-label">Activos</div>
            <div className="aether-mini-value">{activeMine.length}</div>
          </div>

          <div className="aether-mini-metric">
            <div className="aether-mini-label">Finalizados</div>
            <div className="aether-mini-value">{finishedMine.length}</div>
          </div>
        </div>

        <div className="p-4 pt-0 grid sm:grid-cols-3 gap-3">
          <button className="tron-btn tron-primary py-3 font-semibold" onClick={() => loadServices()}>
            🔄 Actualizar
          </button>

          <button className="tron-btn py-3 font-semibold" onClick={() => nav("/historial")}>
            📜 Historial
          </button>

          <button className="tron-btn py-3 font-semibold" onClick={() => nav("/cursos")}>
            🎓 Cursos
          </button>
        </div>
      </div>

      <div className="aether-shell">
        <div className="aether-header">
          <div className="aether-title">🚨 Solicitudes disponibles</div>
          <div className="aether-subtitle">Las SOS aparecen primero automáticamente</div>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="panel-mini text-white/70">Cargando...</div>
          ) : available.length === 0 ? (
            <div className="panel-mini text-white/70">No hay solicitudes disponibles.</div>
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
          <div className="aether-title">Mis servicios</div>
          <div className="aether-subtitle">Servicios asignados a ti</div>
        </div>

        <div className="p-4">
          {mine.length === 0 ? (
            <div className="panel-mini text-white/70">Aún no tienes servicios asignados.</div>
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