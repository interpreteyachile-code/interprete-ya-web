import { useMemo, useState } from "react";
import { listUsers, updateUserStatus } from "../data/demoStore";
import { useAuth } from "../auth/AuthContext";

function Chip({ children }) {
  return <span className="tron-chip">{children}</span>;
}

function StatusChip({ status }) {
  const label =
    status === "pending"
      ? "⏳ Pendiente"
      : status === "active"
      ? "✅ Activo"
      : "⛔ Rechazado";
  return <span className="tron-chip">{label}</span>;
}

function specialtyLabel(s) {
  return s === "salud"
    ? "🏥 Salud"
    : s === "educacion"
    ? "🏫 Educación"
    : s === "legal"
    ? "⚖️ Legal"
    : s === "empresa"
    ? "🏢 Empresa"
    : "🧩 General";
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }
}

function Modal({ open, onClose, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} aria-hidden="true" />
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="w-full max-w-2xl tron-card p-6 relative">
          <button
            className="tron-btn px-4 py-2 absolute right-4 top-4"
            onClick={onClose}
            title="Cerrar"
          >
            ✖
          </button>
          {children}
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ open, title, desc, confirmLabel, onCancel, onConfirm }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/70" onClick={onCancel} />
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="w-full max-w-md tron-card p-6">
          <div className="text-xl font-semibold h-title">{title}</div>
          {desc && <div className="text-sm text-white/70 mt-2">{desc}</div>}

          <div className="mt-4 glow-line" />

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button className="tron-btn tron-muted py-3 font-semibold" onClick={onCancel}>
              ❌ Cancelar
            </button>
            <button className="tron-btn tron-primary py-3 font-semibold" onClick={onConfirm}>
              {confirmLabel}
            </button>
          </div>

          <div className="text-xs text-white/55 mt-3">
            🔒 Confirmación para evitar clic accidental.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ManagerDashboard() {
  const { user } = useAuth();

  const [tick, setTick] = useState(0);

  // filtros
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending"); // pending | active | rejected | all
  const [typeFilter, setTypeFilter] = useState("all"); // all | user | interpreter

  // modal detalle
  const [selected, setSelected] = useState(null);

  // toast
  const [toast, setToast] = useState("");

  // confirmación
  const [confirm, setConfirm] = useState({
    open: false,
    id: null,
    status: null,
    name: "",
    rut: "",
  });

  // ✅ datos
  const allClients = useMemo(() => {
    return listUsers().filter((u) => u.role !== "manager");
  }, [tick]);

  const counts = useMemo(() => {
    const pending = allClients.filter((u) => u.status === "pending").length;
    const active = allClients.filter((u) => u.status === "active").length;
    const rejected = allClients.filter((u) => u.status === "rejected").length;
    return { pending, active, rejected };
  }, [allClients]);

  const users = useMemo(() => {
    const query = (q || "").trim().toLowerCase();

    return allClients
      .filter((u) => (statusFilter === "all" ? true : u.status === statusFilter))
      .filter((u) => (typeFilter === "all" ? true : u.profileType === typeFilter))
      .filter((u) => {
        if (!query) return true;
        return (
          (u.fullName || "").toLowerCase().includes(query) ||
          (u.rut || "").toLowerCase().includes(query) ||
          (u.email || "").toLowerCase().includes(query)
        );
      })
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [allClients, q, statusFilter, typeFilter]);

  // ✅ AHORA recién validamos permisos (después de hooks)
  if (!user || user.role !== "manager") {
    return (
      <div className="tron-card p-6 max-w-xl mx-auto">
        🔒 Solo gerente
      </div>
    );
  }

  const notify = (msg) => {
    setToast(msg);
    window.clearTimeout(window.__iy_toast);
    window.__iy_toast = window.setTimeout(() => setToast(""), 1200);
  };

  const action = (id, status) => {
    updateUserStatus(id, status);
    setTick((x) => x + 1);
    setSelected((s) => (s && s.id === id ? { ...s, status } : s));
  };

  const askConfirm = (u, status) => {
    setConfirm({
      open: true,
      id: u.id,
      status,
      name: u.fullName || "",
      rut: u.rut || "",
    });
  };

  // ✅ SIN useMemo (evita el error hooks)
  const confirmUI = (() => {
    if (confirm.status === "active") {
      return {
        title: "✅ Confirmar aprobación",
        desc: `¿Aprobar a: ${confirm.name} (${confirm.rut})?`,
        confirmLabel: "✅ Aprobar",
      };
    }
    if (confirm.status === "rejected") {
      return {
        title: "⛔ Confirmar rechazo",
        desc: `¿Rechazar a: ${confirm.name} (${confirm.rut})?`,
        confirmLabel: "⛔ Rechazar",
      };
    }
    return {
      title: "↩️ Confirmar cambio",
      desc: `¿Volver a pendiente a: ${confirm.name} (${confirm.rut})?`,
      confirmLabel: "↩️ Pendiente",
    };
  })();

  const Card = ({ u }) => {
    const typeLabel = u.profileType === "interpreter" ? "🧑‍💼 Intérprete" : "🧏‍♀️ Usuario";

    return (
      <div className="tron-card p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="w-full">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="font-semibold text-lg">{u.fullName}</div>
              <StatusChip status={u.status} />
              <Chip>{typeLabel}</Chip>
            </div>

            <div className="text-sm text-white/70 mt-2 grid gap-1">
              <div>🪪 RUT: <b>{u.rut}</b></div>
              <div>📧 Correo: <b>{u.email}</b></div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <button className="tron-btn tron-muted py-2" onClick={() => setSelected(u)}>
                👁️ Ver
              </button>

              <button
                className="tron-btn py-2"
                onClick={async () => {
                  const ok = await copyText(u.rut || "");
                  notify(ok ? "📋 RUT copiado" : "⚠️ No se pudo copiar");
                }}
              >
                📋 RUT
              </button>

              <button
                className="tron-btn py-2"
                onClick={async () => {
                  const ok = await copyText(u.email || "");
                  notify(ok ? "📋 Correo copiado" : "⚠️ No se pudo copiar");
                }}
              >
                📋 Correo
              </button>
            </div>

            {u.status === "pending" ? (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  className="tron-btn tron-primary font-semibold py-3"
                  onClick={() => askConfirm(u, "active")}
                >
                  ✅ Aprobar
                </button>
                <button
                  className="tron-btn font-semibold py-3"
                  onClick={() => askConfirm(u, "rejected")}
                >
                  ⛔ Rechazar
                </button>
              </div>
            ) : (
              <div className="mt-3">
                <button
                  className="tron-btn tron-muted w-full font-semibold py-3"
                  onClick={() => askConfirm(u, "pending")}
                >
                  ↩️ Volver a Pendiente
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const Detail = ({ u }) => {
    if (!u) return null;
    const typeLabel = u.profileType === "interpreter" ? "🧑‍💼 Intérprete" : "🧏‍♀️ Usuario";
    const ip = u.interpreterProfile || null;

    return (
      <div>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="text-2xl font-semibold h-title">👁️ Detalle</div>
            <div className="text-sm text-white/70 mt-1">Información completa</div>

            <div className="flex flex-wrap gap-2 mt-3">
              <StatusChip status={u.status} />
              <Chip>{typeLabel}</Chip>
              <Chip>🪪 {u.rut}</Chip>
              <Chip>📧 {u.email}</Chip>
            </div>
          </div>

          <div className="tron-card p-4">
            <div className="text-xs text-white/60">Nombre</div>
            <div className="text-sm font-semibold">{u.fullName}</div>
            <div className="text-xs text-white/55 mt-1">
              🕒 {u.createdAt ? new Date(u.createdAt).toLocaleString() : "—"}
            </div>
          </div>
        </div>

        <div className="mt-4 glow-line" />

        {u.profileType === "interpreter" && (
          <div className="mt-4 tron-card p-5">
            <div className="font-semibold">🧑‍💼 Datos Intérprete</div>

            {ip ? (
              <div className="mt-2 text-sm text-white/75 grid gap-2">
                <div>📄 Certificación: <b>{ip.certification || "—"}</b></div>
                <div>🕒 Experiencia: <b>{Number.isFinite(ip.years) ? ip.years : "—"}</b> años</div>
                <div>🏷️ Especialidad: <b>{specialtyLabel(ip.specialty)}</b></div>
                <div className="text-xs text-white/65">
                  📝 Nota: <b>{ip.note || "—"}</b>
                </div>
              </div>
            ) : (
              <div className="text-sm text-white/65 mt-2">⚠️ Sin datos extra.</div>
            )}
          </div>
        )}

        <div className="mt-4 grid md:grid-cols-3 gap-2">
          <button className="tron-btn tron-primary font-semibold py-3" onClick={() => askConfirm(u, "active")}>
            ✅ Aprobar
          </button>
          <button className="tron-btn font-semibold py-3" onClick={() => askConfirm(u, "rejected")}>
            ⛔ Rechazar
          </button>
          <button className="tron-btn tron-muted font-semibold py-3" onClick={() => askConfirm(u, "pending")}>
            ↩️ Pendiente
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="grid gap-4">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 tron-card px-4 py-3 text-sm">
          {toast}
        </div>
      )}

      {/* Modal detalle */}
      <Modal open={!!selected} onClose={() => setSelected(null)}>
        <Detail u={selected} />
      </Modal>

      {/* Modal confirmación */}
      <ConfirmModal
        open={confirm.open}
        title={confirmUI.title}
        desc={confirmUI.desc}
        confirmLabel={confirmUI.confirmLabel}
        onCancel={() => setConfirm({ open: false, id: null, status: null, name: "", rut: "" })}
        onConfirm={() => {
          action(confirm.id, confirm.status);
          notify(
            confirm.status === "active"
              ? "✅ Aprobado"
              : confirm.status === "rejected"
              ? "⛔ Rechazado"
              : "↩️ Pendiente"
          );
          setConfirm({ open: false, id: null, status: null, name: "", rut: "" });
        }}
      />

      {/* Header */}
      <div className="tron-card p-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="text-2xl font-semibold h-title">🧑‍💼 Panel Gerente</div>
            <div className="text-white/70 mt-2">Gestión de cuentas: aprobar o rechazar.</div>
            <div className="mt-4 flex gap-2 flex-wrap">
              <Chip>⏳ Pendientes: {counts.pending}</Chip>
              <Chip>✅ Activos: {counts.active}</Chip>
              <Chip>⛔ Rechazados: {counts.rejected}</Chip>
            </div>
          </div>

          <div className="tron-card p-4">
            <div className="text-xs text-white/60">Gerente</div>
            <div className="text-sm font-semibold">{user.fullName}</div>
            <div className="text-xs text-white/55 mt-1">{user.email}</div>
          </div>
        </div>

        <div className="mt-4 glow-line" />

        <div className="mt-4 grid md:grid-cols-4 gap-2">
          <input
            className="tron-input"
            placeholder="🔎 Buscar: nombre / RUT / correo"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <select className="tron-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="pending">⏳ Pendientes</option>
            <option value="active">✅ Activos</option>
            <option value="rejected">⛔ Rechazados</option>
            <option value="all">🧩 Todos</option>
          </select>

          <select className="tron-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">🧩 Tipo: Todos</option>
            <option value="user">🧏‍♀️ Usuario</option>
            <option value="interpreter">🧑‍💼 Intérprete</option>
          </select>

          <button
            className="tron-btn tron-muted font-semibold"
            onClick={() => {
              setQ("");
              setStatusFilter("pending");
              setTypeFilter("all");
            }}
          >
            🧹 Limpiar
          </button>
        </div>
      </div>

      {/* Cards */}
      {users.length === 0 ? (
        <div className="tron-card p-6 text-white/70">No hay resultados con esos filtros.</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {users.map((u) => (
            <Card key={u.id} u={u} />
          ))}
        </div>
      )}
    </div>
  );
}
