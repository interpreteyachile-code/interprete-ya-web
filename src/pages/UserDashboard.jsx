import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function Chip({ children }) {
  return <span className="tron-chip">{children}</span>;
}

function Tile({ icon, title, desc, onClick }) {
  return (
    <button className="tron-btn w-full text-left" onClick={onClick}>
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-2xl border border-cyan-300/30 bg-cyan-300/10 grid place-items-center text-2xl">
          {icon}
        </div>
        <div className="flex-1">
          <div className="font-semibold">{title}</div>
          <div className="text-sm text-white/70 mt-1">{desc}</div>
        </div>
        <div className="text-xl opacity-70">➜</div>
      </div>
    </button>
  );
}

export default function UserDashboard() {
  const nav = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className="grid gap-4">
      {/* Header */}
      <div className="tron-card p-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="text-2xl font-semibold h-title">🧏‍♀️ Panel Usuario</div>
            <div className="text-sm text-white/70 mt-2">
              Acceso seguro y ordenado.
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              <Chip>✅ Activo</Chip>
              <Chip>🪪 {user?.rut}</Chip>
              <Chip>📧 {user?.email}</Chip>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="tron-card p-4">
              <div className="text-xs text-white/60">Sesión</div>
              <div className="text-sm font-semibold">{user?.fullName}</div>
            </div>

            <button
              className="tron-btn px-5 py-3"
              onClick={async () => {
                await logout?.();
                nav("/", { replace: true });
              }}
            >
              🚪 Salir
            </button>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="grid md:grid-cols-2 gap-3">
        <Tile
          icon="📅"
          title="Agendar intérprete"
          desc="Solicita ahora, agenda o videollamada."
          onClick={() => nav("/solicitud")}
        />
        <Tile
          icon="⚖️"
          title="Reportes / Denuncias"
          desc="Registra barreras comunicacionales (demo)."
          onClick={() => nav("/denuncias")}
        />
        <Tile
          icon="🎓"
          title="Cursos LSCh"
          desc="Explora cursos publicados por docentes sordos."
          onClick={() => nav("/cursos")}
        />
        <Tile
          icon="🏠"
          title="Volver al inicio"
          desc="Ver presentación / información general."
          onClick={() => nav("/")}
        />
      </div>

      {/* Resumen */}
      <div className="tron-card p-6">
        <div className="font-semibold">🧠 Resumen</div>
        <div className="text-sm text-white/70 mt-2">
          Tu cuenta está activa. Ya puedes usar módulos avanzados.
        </div>
      </div>
    </div>
  );
}
