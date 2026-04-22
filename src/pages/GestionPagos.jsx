import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { listPayments } from "../data/paymentsStore";

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

function typeBadge(type) {
  return type === "course_enroll" ? "🎓 Curso" : "🤟 Servicio";
}

export default function GestionPagos() {
  const nav = useNavigate();
  const { user } = useAuth();

  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");

  const allPayments = useMemo(() => {
    return [...listPayments()].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, []);

  const payments = useMemo(() => {
    const query = (q || "").trim().toLowerCase();

    return allPayments.filter((p) => {
      const okType = typeFilter === "all" ? true : p.type === typeFilter;
      const okStatus = statusFilter === "all" ? true : p.status === statusFilter;
      const okMethod = methodFilter === "all" ? true : p.method === methodFilter;

      const okQuery = !query
        ? true
        : `${p.userName || ""} ${p.refId || ""} ${p.type || ""} ${p.method || ""} ${p.note || ""}`
            .toLowerCase()
            .includes(query);

      return okType && okStatus && okMethod && okQuery;
    });
  }, [allPayments, q, typeFilter, statusFilter, methodFilter]);

  const stats = useMemo(() => {
    const paid = allPayments.filter((p) => p.status === "paid");
    const pending = allPayments.filter((p) => p.status === "pending");
    const failed = allPayments.filter((p) => p.status === "failed");

    const coursePayments = allPayments.filter((p) => p.type === "course_enroll");
    const servicePayments = allPayments.filter((p) => p.type === "service_request");

    const totalPaidCLP = paid.reduce(
      (acc, p) => acc + Number(p.amountCLP || 0),
      0
    );

    return {
      total: allPayments.length,
      paid: paid.length,
      pending: pending.length,
      failed: failed.length,
      totalPaidCLP,
      coursePayments: coursePayments.length,
      servicePayments: servicePayments.length,
    };
  }, [allPayments]);

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

  if (user.role !== "manager") {
    return (
      <div className="tron-card p-6 max-w-xl mx-auto">
        🔒 Solo gerente puede ver pagos.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="tron-card p-6">
        <div className="text-2xl font-semibold h-title">💳 Gestión de Pagos</div>

        <div className="text-white/70 mt-2">
          Revisa pagos de cursos y solicitudes de intérprete.
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Chip>📄 Total: {stats.total}</Chip>
          <Chip>✅ Pagados: {stats.paid}</Chip>
          <Chip>⏳ Pendientes: {stats.pending}</Chip>
          <Chip>❌ Fallidos: {stats.failed}</Chip>
          <Chip>🎓 Cursos: {stats.coursePayments}</Chip>
          <Chip>🤟 Servicios: {stats.servicePayments}</Chip>
          <Chip>💰 Recaudado: {formatCLP(stats.totalPaidCLP)}</Chip>
        </div>

        <div className="mt-4 grid md:grid-cols-4 gap-2">
          <input
            className="tron-input"
            placeholder="🔎 Buscar usuario / referencia / tipo / nota"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <select
            className="tron-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">🧩 Tipo: Todos</option>
            <option value="course_enroll">🎓 Curso</option>
            <option value="service_request">🤟 Servicio</option>
          </select>

          <select
            className="tron-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">🧩 Estado: Todos</option>
            <option value="paid">✅ Pagado</option>
            <option value="pending">⏳ Pendiente</option>
            <option value="failed">❌ Fallido</option>
          </select>

          <select
            className="tron-select"
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
          >
            <option value="all">🧩 Método: Todos</option>
            <option value="demo">🧪 Demo</option>
            <option value="webpay">💙 WebPay</option>
            <option value="mercadopago">🟦 Mercado Pago</option>
          </select>
        </div>

        <div className="mt-4">
          <button
            className="tron-btn tron-muted py-3"
            onClick={() => nav("/gerente")}
          >
            ⬅️ Volver al panel gerente
          </button>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="tron-card p-6 text-white/70">
          No hay pagos con esos filtros.
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

                <div className="flex flex-col gap-2 items-end">
                  <Chip>{typeBadge(p.type)}</Chip>
                  <Chip>{statusLabel(p.status)}</Chip>
                </div>
              </div>

              <div className="mt-4 tron-card p-4">
                <div className="text-sm text-white/80">
                  💰 Monto: <b>{formatCLP(p.amountCLP)}</b>
                </div>

                <div className="text-sm text-white/75 mt-1">
                  🆔 Referencia: <b>{p.refId}</b>
                </div>

                <div className="text-sm text-white/75 mt-1">
                  👤 Usuario: <b>{p.userName || "—"}</b>
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

              <div className="mt-3 text-xs text-white/55">
                {p.type === "course_enroll"
                  ? "Este pago corresponde a una inscripción de curso."
                  : p.type === "service_request"
                  ? "Este pago corresponde a una solicitud de intérprete."
                  : "Pago registrado en el sistema."}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}