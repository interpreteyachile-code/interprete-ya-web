// src/pages/InterpreterDashboard.jsx
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { listServices, updateService } from "../data/servicesStore";

function Chip({ children }) {
  return <span className="tron-chip">{children}</span>;
}

function StatusChip({ status }) {
  const label =
    status === "requested"
      ? "📥 Solicitado"
      : status === "accepted"
      ? "✅ Aceptado"
      : status === "in_progress"
      ? "⏳ En curso"
      : status === "done"
      ? "🏁 Finalizado"
      : status === "cancelled"
      ? "⛔ Cancelado"
      : "📝 Borrador";
  return <span className="tron-chip">{label}</span>;
}

export default function InterpreterDashboard() {
  const nav = useNavigate();
  const { user } = useAuth();

  // ✅ hooks SIEMPRE arriba
  const services = useMemo(() => {
    // demo: todos los servicios
    return listServices().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, []);

  const requested = services.filter((s) => s.status === "requested");
  const accepted = services.filter((s) => s.status === "accepted" || s.status === "in_progress");
  const done = services.filter((s) => s.status === "done");

  // ✅ recién acá podemos hacer return temprano
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
        🔒 Solo Intérprete
      </div>
    );
  }

  const take = (id) => updateService(id, { status: "accepted", interpreterId: user.id });
  const start = (id) => updateService(id, { status: "in_progress" });
  const finish = (id) => updateService(id, { status: "done" });

  const Card = ({ s }) => (
    <div className="tron-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold">
            🧩 {s.serviceType} • 📍 {s.zone} • {s.mode === "video" ? "🎥 Video" : s.mode === "schedule" ? "📅 Agenda" : "⚡ Ahora"}
          </div>
          <div className="text-sm text-white/70 mt-1">
            💳 {s.priceCLP ? `$${Number(s.priceCLP).toLocaleString("es-CL")} CLP` : "Precio por definir"} • 🪪 {s.clientRut || "—"}
          </div>
          {s.note ? <div className="text-xs text-white/60 mt-2">📝 {s.note}</div> : null}
        </div>
        <StatusChip status={s.status} />
      </div>

      {s.status === "requested" && (
        <div className="mt-3">
          <button className="tron-btn tron-primary w-full font-semibold py-3" onClick={() => take(s.id)}>
            ✅ Aceptar solicitud
          </button>
        </div>
      )}

      {(s.status === "accepted" || s.status === "in_progress") && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button className="tron-btn tron-muted font-semibold py-3" onClick={() => start(s.id)}>
            ⏳ Iniciar
          </button>
          <button className="tron-btn tron-primary font-semibold py-3" onClick={() => finish(s.id)}>
            🏁 Finalizar
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="grid gap-4">
      <div className="tron-card p-6">
        <div className="text-2xl font-semibold h-title">🧑‍💼 Panel Intérprete</div>
        <div className="text-white/70 mt-2">Solicitudes, aceptación y estado del servicio.</div>

        <div className="mt-4 flex gap-2 flex-wrap">
          <Chip>📥 Solicitados: {requested.length}</Chip>
          <Chip>✅ Activos: {accepted.length}</Chip>
          <Chip>🏁 Finalizados: {done.length}</Chip>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {services.length === 0 ? (
          <div className="tron-card p-6 text-white/70">No hay servicios aún.</div>
        ) : (
          services.map((s) => <Card key={s.id} s={s} />)
        )}
      </div>
    </div>
  );
}