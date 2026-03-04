import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { listServices, updateService } from "../data/servicesStore";
import { useAuth } from "../auth/AuthContext";

export default function Pago() {
  const nav = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const service = useMemo(() => listServices().find((s) => s.id === id), [id]);

  if (!user) {
    return (
      <div className="tron-card p-6 max-w-xl mx-auto">
        🔒 Debes iniciar sesión.
      </div>
    );
  }

  if (!service) {
    return (
      <div className="tron-card p-6 max-w-xl mx-auto">
        ⚠️ No existe la solicitud.
      </div>
    );
  }

  const pay = () => {
    updateService(service.id, { status: "paid", paidAt: Date.now() });
    nav("/usuario");
  };

  return (
    <div className="grid gap-4">
      <div className="tron-card p-6">
        <div className="text-2xl font-semibold h-title">💳 Pago (Demo)</div>
        <div className="text-white/70 mt-2">Confirmación de pago para continuar el flujo.</div>

        <div className="mt-4 glow-line" />

        <div className="mt-4 tron-card p-5">
          <div className="text-sm text-white/70">Resumen</div>
          <div className="mt-2 text-white/85">
            🧩 {service.serviceType} • 📍 {service.zone} • {service.mode}
          </div>
          <div className="mt-1 text-white/70">
            🪪 {service.clientRut} • 💰 ${Number(service.priceCLP || 0).toLocaleString("es-CL")} CLP
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button className="tron-btn tron-muted py-3" onClick={() => nav("/solicitud")}>
            ↩️ Volver
          </button>
          <button className="tron-btn tron-primary py-3 font-semibold" onClick={pay}>
            ✅ Pagar (Demo)
          </button>
        </div>
      </div>
    </div>
  );
}