import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Pending() {
  const nav = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-[70vh] grid place-items-center px-4">
      <div className="w-full max-w-md tron-card p-6">
        <div className="text-2xl font-semibold h-title">⏳ Cuenta pendiente</div>

        <div className="text-sm text-white/75 mt-2">
          Tu cuenta está en revisión por el gerente.
        </div>

        <div className="mt-4 tron-card p-4">
          <div className="text-sm text-white/80">
            👤 {user?.fullName || "Usuario"}
          </div>
          <div className="text-xs text-white/60 mt-1">
            Estado: <b>PENDIENTE</b>
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          <button className="tron-btn tron-primary w-full py-3 font-semibold" onClick={() => nav("/")}>
            🏠 Volver al inicio
          </button>

          <button
            className="tron-btn tron-muted w-full py-3"
            onClick={async () => {
              await logout?.();
              nav("/login", { replace: true });
            }}
          >
            🚪 Cerrar sesión
          </button>
        </div>

        <div className="text-xs text-white/55 mt-4">
          ✅ Cuando el gerente apruebe, podrás acceder a Agendar / Cursos / Reportes.
        </div>
      </div>
    </div>
  );
}
