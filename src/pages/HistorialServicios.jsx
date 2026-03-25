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

export default function HistorialServicios() {
  const nav = useNavigate();
  const { user } = useAuth();

  const history = useMemo(() => {
    const all = listServices().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    if (!user) return [];

    if (user.role === "manager") {
      return all;
    }

    if (user.profileType === "interpreter") {
      return all.filter((s) => s.interpreterId === user.id);
    }

    return all.filter((s) => s.clientRut === user.rut);
  }, [user]);

  const counts = useMemo(() => {
    return {
      total: history.length,
      paid: history.filter((s) => s.status === "paid").length,
      started: history.filter((s) => s.status === "started").length,
      finished: history.filter((s) => s.status === "finished").length,
      rated: history.filter((s) => s.status === "rated").length,
      cancelled: history.filter((s) => s.status === "cancelled").length,
    };
  }, [history]);

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

  const goBack = () => {
    if (user.role === "manager") {
      nav("/gerente");
      return;
    }

    if (user.profileType === "interpreter") {
      nav("/interprete");
      return;
    }

    nav("/usuario");
  };

  return (
    <div className="grid gap-4">
      {/* HEADER */}
      <div className="tron-card p-6">
        <div className="text-2xl font-semibold h-title">
          📜 Historial de Servicios
        </div>

        <div className="text-white/70 mt-2">
          Revisa tus servicios anteriores y su estado.
        </div>

        <div className="mt-4 flex gap-2 flex-wrap">
          <Chip>📄 Total: {counts.total}</Chip>
          <Chip>💳 Pagados: {counts.paid}</Chip>
          <Chip>🔳 En curso: {counts.started}</Chip>
          <Chip>🏁 Finalizados: {counts.finished}</Chip>
          <Chip>⭐ Evaluados: {counts.rated}</Chip>
          <Chip>⛔ Cancelados: {counts.cancelled}</Chip>
        </div>

        <div className="mt-4">
          <button className="tron-btn tron-muted py-3" onClick={goBack}>
            ⬅️ Volver al panel
          </button>
        </div>
      </div>

      {/* LISTA */}
      {history.length === 0 ? (
        <div className="tron-card p-6 text-white/70">
          No hay servicios en tu historial.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {history.map((s) => (
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
                👤 Cliente: <b>{s.clientName || s.clientRut || "—"}</b>
              </div>

              <div className="text-sm text-white/75 mt-1">
                🧑‍💼 Intérprete: <b>{s.interpreterName || "—"}</b>
              </div>

              <div className="text-sm text-white/75 mt-1">
                💳 Monto: <b>{moneyCLP(s.amountCLP)}</b>
              </div>

              <div className="text-sm text-white/75 mt-1">
                ⏱️ Duración: <b>{s.durationMin || 30} min</b>
              </div>

              {s.scheduledAt && (
                <div className="text-sm text-white/75 mt-1">
                  📅 Agenda: <b>{String(s.scheduledAt).replace("T", " ")}</b>
                </div>
              )}

              {s.startedAt && (
                <div className="text-sm text-white/65 mt-1">
                  ▶️ Inicio: {new Date(s.startedAt).toLocaleString("es-CL")}
                </div>
              )}

              {s.finishedAt && (
                <div className="text-sm text-white/65 mt-1">
                  🏁 Fin: {new Date(s.finishedAt).toLocaleString("es-CL")}
                </div>
              )}

              <div className="mt-3 tron-card p-3">
                {s.status === "paid" && (
                  <div className="text-sm text-white/80">
                    💳 Pago confirmado. Esperando asignación o atención.
                  </div>
                )}

                {s.status === "matched" && (
                  <div className="text-sm text-white/80">
                    🤝 Servicio asignado correctamente.
                  </div>
                )}

                {s.status === "started" && (
                  <div className="text-sm text-white/80">
                    🔳 Servicio actualmente en curso.
                  </div>
                )}

                {s.status === "finished" && (
                  <div className="text-sm text-white/80">
                    🏁 Servicio finalizado.
                  </div>
                )}

                {s.status === "rated" && (
                  <div className="text-sm text-white/80">
                    ⭐ Servicio evaluado por el usuario.
                  </div>
                )}

                {s.status === "cancelled" && (
                  <div className="text-sm text-white/80">
                    ⛔ Servicio cancelado.
                  </div>
                )}

                {s.status === "created" && (
                  <div className="text-sm text-white/80">
                    🧾 Servicio creado en el sistema.
                  </div>
                )}
              </div>

              {s.note && (
                <div className="text-sm text-white/60 mt-2">
                  📝 {s.note}
                </div>
              )}

              {user.profileType === "user" && s.status === "finished" && (
                <div className="mt-4">
                  <button
                    className="tron-btn tron-primary w-full py-3 font-semibold"
                    onClick={() => nav(`/calificar/${s.id}`)}
                  >
                    ⭐ Calificar servicio
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}