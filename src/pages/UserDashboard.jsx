import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { listServices } from "../data/servicesStore";

function Chip({ children }) {
  return <span className="tron-chip">{children}</span>;
}

function StatusLabel(status) {
  if (status === "requested") return "📥 Solicitud enviada";
  if (status === "accepted") return "✅ Intérprete asignado";
  if (status === "in_progress") return "⏳ En curso";
  if (status === "done") return "🏁 Finalizado";
  return status;
}

export default function UserDashboard() {
  const nav = useNavigate();
  const { user } = useAuth();

  const my = useMemo(() => {
    const all = listServices();
    return all.filter((s) => s.clientRut === user?.rut);
  }, [user?.rut]);

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
          Tus solicitudes y estado del servicio.
        </div>

        <div className="mt-4 flex gap-2 flex-wrap">
          <Chip>📄 Solicitudes: {my.length}</Chip>
        </div>

        {/* BOTONES */}
        <div className="mt-4 grid md:grid-cols-2 gap-3">

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

        </div>

      </div>

      {/* LISTA DE SERVICIOS */}

      {my.length === 0 ? (
        <div className="tron-card p-6 text-white/70">
          Aún no tienes solicitudes.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">

          {my.map((s) => (

            <div key={s.id} className="tron-card p-5">

              <div className="font-semibold">
                🧩 {s.serviceType} • 📍 {s.zone}
              </div>

              <div className="text-sm text-white/70 mt-1">
                Estado: <b>{StatusLabel(s.status)}</b>
              </div>

              <div className="text-sm text-white/70 mt-1">
                💰 ${Number(s.priceCLP || 0).toLocaleString("es-CL")}
              </div>

              {/* VIDEOLLAMADA */}

              {s.mode === "video" && s.status === "accepted" && (
                <div className="mt-3">
                  <button
                    className="tron-btn tron-primary w-full"
                    onClick={() => nav(`/pago/${s.id}`)}
                  >
                    🎥 Iniciar videollamada
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