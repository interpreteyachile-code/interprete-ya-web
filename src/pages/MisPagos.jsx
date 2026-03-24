import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getPaymentsByUser } from "../data/paymentsStore";

function Chip({ children }) {
  return <span className="tron-chip">{children}</span>;
}

function formatCLP(n) {
  try {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(n || 0);
  } catch {
    return `$${n || 0}`;
  }
}

function typeLabel(type) {
  return type === "course_enroll"
    ? "🎓 Inscripción curso"
    : type === "service_request"
    ? "🤟 Solicitud servicio"
    : "💳 Pago";
}

function statusLabel(status) {
  return status === "paid"
    ? "✅ Pagado"
    : status === "pending"
    ? "⏳ Pendiente"
    : status === "failed"
    ? "❌ Fallido"
    : "—";
}

function methodLabel(method) {
  return method === "webpay"
    ? "💙 WebPay"
    : method === "mercadopago"
    ? "🟦 Mercado Pago"
    : "🧪 Demo";
}

export default function MisPagos() {
  const nav = useNavigate();
  const { user } = useAuth();

  const payments = useMemo(() => {
    if (!user?.id) return [];
    return [...getPaymentsByUser(user.id)].sort(
      (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
    );
  }, [user?.id]);

  const totals = useMemo(() => {
    return {
      total: payments.length,
      paid: payments.filter((p) => p.status === "paid").length,
      pending: payments.filter((p) => p.status === "pending").length,
      failed: payments.filter((p) => p.status === "failed").length,
      amountPaid: payments
        .filter((p) => p.status === "paid")
        .reduce((acc, p) => acc + Number(p.amountCLP || 0), 0),
    };
  }, [payments]);

  if (!user) {
    return (
      <div className="tron-card p-6 max-w-xl mx-auto">
        🔒 Debes iniciar sesión.
        <div className="mt-4">
          <button className="tron-btn tron-primary" onClick={() => nav("/login")}>
            🔐 Ir a login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="tron-card p-6">
        <div className="text-2xl font-semibold h-title">💳 Mis Pagos</div>
        <div className="text-white/70 mt-2">
          Aquí puedes revisar tus pagos registrados en la plataforma.
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Chip>📄 Total: {totals.total}</Chip>
          <Chip>✅ Pagados: {totals.paid}</Chip>
          <Chip>⏳ Pendientes: {totals.pending}</Chip>
          <Chip>❌ Fallidos: {totals.failed}</Chip>
          <Chip>💰 Total pagado: {formatCLP(totals.amountPaid)}</Chip>
        </div>

        <div className="mt-4">
          <button
            className="tron-btn tron-muted py-3"
            onClick={() => nav("/usuario")}
          >
            ⬅️ Volver al panel
          </button>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="tron-card p-6 text-white/70">
          Aún no tienes pagos registrados.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {payments.map((p) => (
            <div key={p.id} className="tron-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-lg">
                    {typeLabel(p.type)}
                  </div>
                  <div className="text-sm text-white/70 mt-1">
                    Método: <b>{methodLabel(p.method)}</b>
                  </div>
                </div>

                <Chip>{statusLabel(p.status)}</Chip>
              </div>

              <div className="mt-3 text-sm text-white/75">
                💰 Monto: <b>{formatCLP(p.amountCLP)}</b>
              </div>

              <div className="text-sm text-white/75 mt-1">
                🆔 Referencia: <b>{p.refId}</b>
              </div>

              <div className="text-sm text-white/75 mt-1">
                👤 Usuario: <b>{p.userName || user.fullName}</b>
              </div>

              <div className="text-sm text-white/65 mt-1">
                🕒 Fecha: {new Date(p.createdAt).toLocaleString("es-CL")}
              </div>

              {p.note && (
                <div className="text-sm text-white/60 mt-2">
                  📝 {p.note}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}