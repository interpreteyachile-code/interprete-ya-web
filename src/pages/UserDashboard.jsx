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
    : status === "matched"
    ? "🤝 Intérprete asignado"
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
      matched: my.filter((s) => s.status === "matched").length,
      started: my.filter((s) => s.status === "started").length,
      finished: my.filter((s) => s.status === "finished").length,
      paid: my.filter((s) => s.status === "paid").length,
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
      <div className="tron-card p-6">
        <div className="text-2xl font-semibold h-title">
          🧏‍♀️ Panel Usuario
        </div>

        <div className="text-white/70 mt-2">
          Revisa tus solicitudes, estado del servicio y accesos rápidos.
        </div>

        <div className="mt-4 flex gap-2 flex-wrap">
          <Chip>📄 Solicitudes: {counts.total}</Chip>
          <Chip>🧾 Creadas: {counts.created}</Chip>
          <Chip>🤝 Asignadas: {counts.matched}</Chip>
          <Chip>🔳 En curso: {counts.started}</Chip>
          <Chip>🏁 Finalizadas: {counts.finished}</Chip>
        </div>

        <div className="mt-4 grid md:grid-cols-3 gap-3">
          <button
            className="tron-btn tron-primary py-3 font-semibold"
            onClick={() => nav("/solicitud")}
          >
            ➕ Nueva Solicitud
          </button>

          <button
            className="tron-btn py-3 font-semibold"
            onClick={() => nav("/historial")}
          >
            📜 Ver Historial
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

              <div className="mt-3 text-sm text-white/75">
                💳 Precio: <b>{moneyCLP(s.amountCLP)}</b>
              </div>

              <div className="text-sm text-white/75 mt-1">
                ⏱️ Duración: <b>{s.durationMin || 30} min</b>
              </div>

              {s.scheduledAt && (
                <div className="text-sm text-white/75 mt-1">
                  📅 Agenda: <b>{String(s.scheduledAt).replace("T", " ")}</b>
                </div>
              )}

              <div className="text-sm text-white/75 mt-1">
                🧑‍💼 Intérprete: <b>{s.interpreterName || "Aún no asignado"}</b>
              </div>

              {s.note && (
                <div className="text-sm text-white/65 mt-2">
                  📝 {s.note}
                </div>
              )}

              <div className="mt-4 grid gap-2">
                {s.mode === "video" &&
                  (s.status === "matched" || s.status === "started") && (
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