import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { listServices, updateService } from "../data/servicesStore";
import { getInterpreterRating } from "../data/ratingsStore";

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
    : "🧩 Servicio";
}

function zoneLabel(zone) {
  return zone === "norte"
    ? "🌵 Norte"
    : zone === "sur"
    ? "🌲 Sur"
    : "🏙️ Centro";
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

export default function InterpreterDashboard() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [tick, setTick] = useState(0);

  const services = useMemo(() => {
    return listServices().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [tick]);

  // solo pagados y sin intérprete asignado
  const available = useMemo(() => {
    return services.filter((s) => s.status === "paid" && !s.interpreterId);
  }, [services]);

  // asignados al intérprete actual
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
    if (!user?.id) return { avg: 0, total: 0 };
    return getInterpreterRating(user.id);
  }, [user?.id, tick]);

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

  const refresh = () => setTick((x) => x + 1);

  const take = (serviceId) => {
    const service = services.find((s) => s.id === serviceId);

    if (!service) return;

    if (service.interpreterId) {
      alert("⚠️ Este servicio ya fue asignado a otro intérprete.");
      return;
    }

    updateService(serviceId, {
      interpreterId: user.id,
      interpreterName: user.fullName,
      status: "matched",
    });

    refresh();
  };

  const start = (serviceId) => {
    updateService(serviceId, {
      status: "started",
      startedAt: Date.now(),
    });
    refresh();
  };

  const finish = (serviceId) => {
    updateService(serviceId, {
      status: "finished",
      finishedAt: Date.now(),
    });
    refresh();
  };

  const Card = ({ s, showTake = false }) => (
    <div className="tron-card p-4 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-semibold text-lg">
            {serviceTypeLabel(s.serviceType)}
          </div>

          <div className="text-sm text-white/70 mt-1">
            {modeLabel(s.mode)} • {zoneLabel(s.zone)}
          </div>

          <div className="mt-3 grid gap-1 text-sm text-white/75">
            <div>
              👤 Cliente: <b>{s.clientName || s.clientRut || "—"}</b>
            </div>

            <div>
              💳 Precio: <b>{moneyCLP(s.amountCLP)}</b>
            </div>

            <div>
              ⏱️ Duración: <b>{s.durationMin || 30} min</b>
            </div>

            {s.scheduledAt && (
              <div>
                📅 Agenda: <b>{String(s.scheduledAt).replace("T", " ")}</b>
              </div>
            )}

            {s.interpreterName && (
              <div>
                🧑‍💼 Asignado: <b>{s.interpreterName}</b>
              </div>
            )}
          </div>

          {s.note ? (
            <div className="text-xs text-white/60 mt-2">📝 {s.note}</div>
          ) : null}
        </div>

        <Chip>{statusLabel(s.status)}</Chip>
      </div>

      <div className="mt-3 tron-card p-3">
        <div className="text-sm text-white/80">
          {flowMessage(s, user)}
        </div>
      </div>

      {showTake && (
        <div className="mt-4">
          <button
            className="tron-btn tron-primary w-full font-semibold py-3"
            onClick={() => take(s.id)}
          >
            ✅ Aceptar solicitud
          </button>
        </div>
      )}

      {(s.status === "matched" || s.status === "started") &&
        s.interpreterId === user.id && (
          <div className="mt-4 grid gap-2">
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
        <div className="mt-4 tron-card p-3 text-sm text-white/75">
          ✅ Servicio finalizado. Esperando evaluación del usuario.
        </div>
      )}

      {s.status === "rated" && s.interpreterId === user.id && (
        <div className="mt-4 tron-card p-3 text-sm text-white/75">
          ⭐ Este servicio ya fue evaluado.
        </div>
      )}
    </div>
  );

  return (
    <div className="grid gap-4">
      {/* HEADER */}
      <div className="tron-card p-4 md:p-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="text-2xl md:text-3xl font-semibold h-title">
              🧑‍💼 Panel Intérprete
            </div>
            <div className="text-white/70 mt-2">
              Solicitudes pagadas disponibles, servicios asignados y estado del trabajo.
            </div>
          </div>

          <div className="tron-card p-4 min-w-[220px]">
            <div className="text-xs text-white/60">Sesión</div>
            <div className="text-sm font-semibold">{user.fullName}</div>
            <div className="text-xs text-white/55 mt-1">
              ⭐ Rating: {myRating.avg} ({myRating.total})
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-2 flex-wrap">
          <Chip>💳 Disponibles: {available.length}</Chip>
          <Chip>🤝 Activos: {activeMine.length}</Chip>
          <Chip>🏁 Finalizados: {finishedMine.length}</Chip>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            className="tron-btn tron-primary py-3 font-semibold"
            onClick={() => nav("/historial")}
          >
            📜 Ver historial
          </button>

          <button
            className="tron-btn py-3 font-semibold"
            onClick={() => nav("/cursos")}
          >
            🎓 Ver cursos
          </button>
        </div>
      </div>

      {/* DISPONIBLES */}
      <div className="grid gap-3">
        <div className="tron-card p-4 md:p-5">
          <div className="text-xl font-semibold">💳 Solicitudes disponibles</div>
          <div className="text-white/65 mt-1">
            Servicios pagados que aún no tienen intérprete asignado.
          </div>
        </div>

        {available.length === 0 ? (
          <div className="tron-card p-6 text-white/70">
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

      {/* MIS SERVICIOS */}
      <div className="grid gap-3">
        <div className="tron-card p-4 md:p-5">
          <div className="text-xl font-semibold">🤝 Mis servicios</div>
          <div className="text-white/65 mt-1">
            Servicios ya asignados para ti, manual o automáticamente.
          </div>
        </div>

        {mine.length === 0 ? (
          <div className="tron-card p-6 text-white/70">
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
  );
}