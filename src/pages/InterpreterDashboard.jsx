import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { listServices, updateService } from "../data/servicesStore";

function Chip({ children }) {
  return <span className="tron-chip">{children}</span>;
}

function moneyCLP(n) {
  return "$" + Number(n || 0).toLocaleString("es-CL");
}

function statusLabel(status) {
  return status === "created"
    ? "🧾 Creado"
    : status === "matched"
    ? "🤝 Asignado"
    : status === "started"
    ? "🔳 En curso"
    : status === "finished"
    ? "🏁 Finalizado"
    : status === "paid"
    ? "💳 Pagado"
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

export default function InterpreterDashboard() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [tick, setTick] = useState(0);

  const services = useMemo(() => {
    return listServices().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [tick]);

  const available = useMemo(() => {
    return services.filter((s) => s.status === "created");
  }, [services]);

  const mine = useMemo(() => {
    return services.filter((s) => s.interpreterId === user?.id);
  }, [services, user?.id]);

  const activeMine = useMemo(() => {
    return mine.filter((s) => s.status === "matched" || s.status === "started");
  }, [mine]);

  const finishedMine = useMemo(() => {
    return mine.filter(
      (s) =>
        s.status === "finished" ||
        s.status === "paid" ||
        s.status === "rated"
    );
  }, [mine]);

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
    <div className="tron-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-lg">
            {serviceTypeLabel(s.serviceType)}
          </div>

          <div className="text-sm text-white/70 mt-1">
            {modeLabel(s.mode)} • {zoneLabel(s.zone)}
          </div>

          <div className="text-sm text-white/70 mt-1">
            👤 Cliente: <b>{s.clientName || s.clientRut || "—"}</b>
          </div>

          <div className="text-sm text-white/70 mt-1">
            💳 {moneyCLP(s.amountCLP)}
          </div>

          <div className="text-sm text-white/70 mt-1">
            ⏱️ Duración: <b>{s.durationMin || 30} min</b>
          </div>

          {s.scheduledAt && (
            <div className="text-sm text-white/70 mt-1">
              📅 Agenda: <b>{String(s.scheduledAt).replace("T", " ")}</b>
            </div>
          )}

          {s.note ? (
            <div className="text-xs text-white/60 mt-2">📝 {s.note}</div>
          ) : null}
        </div>

        <Chip>{statusLabel(s.status)}</Chip>
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

            <div className="grid grid-cols-2 gap-2">
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
    </div>
  );

  return (
    <div className="grid gap-4">
      {/* HEADER */}
      <div className="tron-card p-6">
        <div className="text-2xl font-semibold h-title">🧑‍💼 Panel Intérprete</div>
        <div className="text-white/70 mt-2">
          Solicitudes disponibles, servicios asignados y estado del trabajo.
        </div>

        <div className="mt-4 flex gap-2 flex-wrap">
          <Chip>📥 Disponibles: {available.length}</Chip>
          <Chip>🤝 Activos: {activeMine.length}</Chip>
          <Chip>🏁 Finalizados: {finishedMine.length}</Chip>
        </div>

        <div className="mt-4 grid md:grid-cols-2 gap-3">
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
        <div className="tron-card p-5">
          <div className="text-xl font-semibold">📥 Solicitudes disponibles</div>
          <div className="text-white/65 mt-1">
            Aquí puedes aceptar nuevas solicitudes.
          </div>
        </div>

        {available.length === 0 ? (
          <div className="tron-card p-6 text-white/70">
            No hay solicitudes disponibles por ahora.
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
        <div className="tron-card p-5">
          <div className="text-xl font-semibold">🤝 Mis servicios</div>
          <div className="text-white/65 mt-1">
            Servicios ya tomados por ti.
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