import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { listServices } from "../data/servicesStore";

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
    : "🧩 Servicio";
}

function zoneLabel(zone) {
  return zone === "norte"
    ? "🌵 Norte"
    : zone === "sur"
    ? "🌲 Sur"
    : "🏙️ Centro";
}

function flowMessage(service) {
  if (service.status === "created") {
    return "🧾 Solicitud creada en el sistema.";
  }

  if (service.status === "paid" && !service.interpreterId) {
    return "💳 Pago confirmado. Buscando intérprete disponible...";
  }

  if (service.status === "paid" && service.interpreterId) {
    return `✅ Pago confirmado. Intérprete asignado: ${service.interpreterName || "Intérprete"}.`;
  }

  if (service.status === "matched") {
    return `🤝 Ya tienes intérprete asignado: ${service.interpreterName || "Intérprete"}.`;
  }

  if (service.status === "started") {
    return `🔳 El servicio está en curso con ${service.interpreterName || "tu intérprete"}.`;
  }

  if (service.status === "finished") {
    return "🏁 El servicio finalizó correctamente. Ya puedes calificar.";
  }

  if (service.status === "rated") {
    return "⭐ Ya evaluaste este servicio. Gracias por aportar a la comunidad.";
  }

  if (service.status === "cancelled") {
    return "⛔ Este servicio fue cancelado.";
  }

  return "ℹ️ Estado actualizado.";
}

export default function UserDashboard() {
  const nav = useNavigate();
  const { user } = useAuth();

  const my = useMemo(() => {
    const all = listServices();

    return all
      .filter((s) => s.clientRut === user?.rut)
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [user?.rut]);

  const counts = useMemo(() => {
    return {
      total: my.length,
      created: my.filter((s) => s.status === "created").length,
      paid: my.filter((s) => s.status === "paid").length,
      matched: my.filter((s) => s.status === "matched").length,
      started: my.filter((s) => s.status === "started").length,
      finished: my.filter((s) => s.status === "finished").length,
      rated: my.filter((s) => s.status === "rated").length,
    };
  }, [my]);

  if (!user) {
    return (
      <div className="tron-card p-6 max-w-xl mx-auto">
        🔒 Debes iniciar sesión.

        <div className="mt-3">
          <button
            className="tron-btn tron-primary"
            onClick={() => nav("/login")}
          >
            🔐 Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {/* PANEL */}
      <div className="tron-card p-4 md:p-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="text-2xl md:text-3xl font-semibold h-title">
              🧏‍♀️ Panel Usuario
            </div>

            <div className="text-white/70 mt-2">
              Revisa tus solicitudes, pagos, estado del servicio y accesos rápidos.
            </div>
          </div>

          <div className="tron-card p-4 min-w-[220px]">
            <div className="text-xs text-white/60">Sesión</div>
            <div className="text-sm font-semibold">{user.fullName}</div>
            <div className="text-xs text-white/55 mt-1">
              🪪 {user.rut}
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-2 flex-wrap">
          <Chip>📄 Solicitudes: {counts.total}</Chip>
          <Chip>🧾 Creadas: {counts.created}</Chip>
          <Chip>💳 Pagadas: {counts.paid}</Chip>
          <Chip>🤝 Asignadas: {counts.matched}</Chip>
          <Chip>🔳 En curso: {counts.started}</Chip>
          <Chip>🏁 Finalizadas: {counts.finished}</Chip>
          <Chip>⭐ Evaluadas: {counts.rated}</Chip>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            className="tron-btn tron-primary py-3 font-semibold"
            onClick={() => nav("/solicitud")}
          >
            ➕ Nueva Solicitud
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

          <button
            className="tron-btn py-3 font-semibold"
            onClick={() => nav("/cursos")}
          >
            🎓 Cursos LSCh
          </button>
        </div>
      </div>

      {/* LISTA */}
      {my.length === 0 ? (
        <div className="tron-card p-6 text-white/70">
          Aún no tienes solicitudes creadas.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {my.map((s) => (
            <div key={s.id} className="tron-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-lg">
                    {serviceTypeLabel(s.serviceType)}
                  </div>

                  <div className="text-sm text-white/70 mt-1">
                    {modeLabel(s.mode)} • {zoneLabel(s.zone)}
                  </div>
                </div>

                <Chip>{statusLabel(s.status)}</Chip>
              </div>

              <div className="mt-3 grid gap-1 text-sm text-white/75">
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

                <div>
                  🧑‍💼 Intérprete: <b>{s.interpreterName || "Aún no asignado"}</b>
                </div>
              </div>

              <div className="mt-3 tron-card p-3">
                <div className="text-sm text-white/80">
                  {flowMessage(s)}
                </div>
              </div>

              {s.note && (
                <div className="text-sm text-white/65 mt-2">
                  📝 {s.note}
                </div>
              )}

              <div className="mt-4 grid gap-2">
                {s.mode === "video" &&
                  (s.status === "matched" || s.status === "started" || (s.status === "paid" && s.interpreterId)) && (
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}