import { useEffect, useMemo, useState } from "react";
import {
  listServices,
  createService,
  acceptService,
  startService,
  finishService,
  // cancelService, // opcional si lo agregaste
} from "../data/servicesStore";

function cx(...arr) {
  return arr.filter(Boolean).join(" ");
}

function formatCLP(n) {
  try {
    return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(n || 0);
  } catch {
    return `$${n || 0}`;
  }
}

const MODES = [
  { value: "now", label: "Ahora ⚡" },
  { value: "schedule", label: "Agendar 📅" },
  { value: "video", label: "Videollamada 🎥" },
];

const STATUS_LABEL = {
  pending: "Pendiente",
  accepted: "Aceptado",
  active: "En curso",
  finished: "Finalizado",
  cancelled: "Cancelado",
};

export default function Services() {
  // ✅ Demo: luego lo conectamos con AuthContext real
  const [role, setRole] = useState("client"); // client | interpreter

  // formulario solicitud
  const [clientName, setClientName] = useState("Usuario Sordo");
  const [mode, setMode] = useState("now");
  const [amountCLP, setAmountCLP] = useState(7000);

  // intérprete demo
  const interpreter = useMemo(
    () => ({ id: "interp_demo_01", name: "Intérprete Demo 🤟" }),
    []
  );

  const [items, setItems] = useState([]);

  function refresh() {
    setItems(listServices().sort((a, b) => b.createdAt - a.createdAt));
  }

  useEffect(() => {
    refresh();
  }, []);

  // filtros por rol
  const visible = useMemo(() => {
    if (role === "client") return items;
    // intérprete: ve pendientes y las que él aceptó
    return items.filter(
      (s) => s.status === "pending" || s.interpreterId === interpreter.id
    );
  }, [items, role, interpreter.id]);

  function onCreate(e) {
    e.preventDefault();
    if (!clientName.trim()) return;

    createService({
      clientId: "client_demo_01",
      clientName: clientName.trim(),
      mode,
      amountCLP: Number(amountCLP) || 0,
    });
    refresh();
  }

  function onAccept(serviceId) {
    acceptService(serviceId, interpreter);
    refresh();
  }

  function onStart(serviceId) {
    startService(serviceId);
    refresh();
  }

  function onFinish(serviceId) {
    finishService(serviceId);
    refresh();
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Header TRON */}
        <div className="rounded-3xl border border-cyan-500/30 bg-slate-900/40 p-5 shadow-[0_0_40px_rgba(34,211,238,0.12)]">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-wide">
                InterpreteYa ⚡ <span className="text-cyan-300">Solicitudes</span>
              </h1>
              <p className="text-slate-300 mt-1">
                Plataforma autónoma por y para la comunidad sorda 🤟 • Validación QR • Pagos • Retroalimentación
              </p>
            </div>

            {/* Selector rol */}
            <div className="flex gap-2">
              <button
                onClick={() => setRole("client")}
                className={cx(
                  "rounded-2xl px-4 py-2 border transition",
                  role === "client"
                    ? "border-cyan-400 bg-cyan-500/15 text-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.25)]"
                    : "border-slate-700 bg-slate-900/30 text-slate-200 hover:border-slate-500"
                )}
              >
                Cliente 👤
              </button>
              <button
                onClick={() => setRole("interpreter")}
                className={cx(
                  "rounded-2xl px-4 py-2 border transition",
                  role === "interpreter"
                    ? "border-fuchsia-400 bg-fuchsia-500/15 text-fuchsia-200 shadow-[0_0_18px_rgba(232,121,249,0.25)]"
                    : "border-slate-700 bg-slate-900/30 text-slate-200 hover:border-slate-500"
                )}
              >
                Intérprete 🤟
              </button>
            </div>
          </div>
        </div>

        {/* Panel Cliente */}
        {role === "client" && (
          <div className="mt-6 grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-2 rounded-3xl border border-cyan-500/25 bg-slate-900/40 p-5">
              <h2 className="text-lg font-semibold text-cyan-200">Crear Solicitud</h2>
              <p className="text-sm text-slate-300 mt-1">
                Pide un intérprete para ahora, agenda o videollamada.
              </p>

              <form onSubmit={onCreate} className="mt-4 space-y-3">
                <label className="block">
                  <span className="text-sm text-slate-300">Nombre (cliente)</span>
                  <input
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-slate-700 bg-slate-950/50 px-3 py-2 outline-none focus:border-cyan-400"
                    placeholder="Ej: Sebastián"
                  />
                </label>

                <label className="block">
                  <span className="text-sm text-slate-300">Modo</span>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-slate-700 bg-slate-950/50 px-3 py-2 outline-none focus:border-cyan-400"
                  >
                    {MODES.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm text-slate-300">Monto (CLP)</span>
                  <input
                    type="number"
                    value={amountCLP}
                    onChange={(e) => setAmountCLP(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-slate-700 bg-slate-950/50 px-3 py-2 outline-none focus:border-cyan-400"
                    placeholder="Ej: 7000"
                    min={0}
                  />
                  <div className="text-xs text-slate-400 mt-1">
                    Vista previa: <span className="text-slate-200">{formatCLP(Number(amountCLP) || 0)}</span>
                  </div>
                </label>

                <button
                  type="submit"
                  className="w-full rounded-2xl border border-cyan-400/60 bg-cyan-500/15 px-4 py-2 text-cyan-200 hover:bg-cyan-500/25 transition shadow-[0_0_18px_rgba(34,211,238,0.18)]"
                >
                  Crear solicitud ⚡
                </button>
              </form>
            </div>

            <div className="lg:col-span-3 rounded-3xl border border-slate-700/60 bg-slate-900/30 p-5">
              <h2 className="text-lg font-semibold">Mis Solicitudes</h2>
              <p className="text-sm text-slate-300 mt-1">
                Aquí verás estado, códigos demo y el intérprete asignado.
              </p>

              <List
                items={visible}
                role={role}
                onAccept={onAccept}
                onStart={onStart}
                onFinish={onFinish}
              />
            </div>
          </div>
        )}

        {/* Panel Intérprete */}
        {role === "interpreter" && (
          <div className="mt-6 rounded-3xl border border-fuchsia-500/20 bg-slate-900/35 p-5">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-fuchsia-200">
                  Panel Intérprete 🤟
                </h2>
                <p className="text-sm text-slate-300 mt-1">
                  Ver pendientes • Aceptar • Iniciar • Finalizar (QR demo en la tarjeta)
                </p>
              </div>
              <div className="text-sm text-slate-200">
                Sesión demo: <span className="text-fuchsia-200">{interpreter.name}</span>
              </div>
            </div>

            <div className="mt-4">
              <List
                items={visible}
                role={role}
                onAccept={onAccept}
                onStart={onStart}
                onFinish={onFinish}
                interpreterId={interpreter.id}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function List({ items, role, onAccept, onStart, onFinish, interpreterId }) {
  if (!items.length) {
    return (
      <div className="mt-4 rounded-2xl border border-slate-700/60 bg-slate-950/30 p-4 text-slate-300">
        No hay solicitudes todavía.
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      {items.map((s) => {
        const mine = interpreterId && s.interpreterId === interpreterId;

        return (
          <div
            key={s.id}
            className="rounded-3xl border border-slate-700/60 bg-slate-950/30 p-4"
          >
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="text-sm text-slate-300">
                  {new Date(s.createdAt).toLocaleString("es-CL")}
                </div>
                <div className="mt-1 text-lg font-semibold">
                  {s.clientName} •{" "}
                  <span className="text-cyan-200">{s.mode}</span>
                </div>
                <div className="text-sm text-slate-200 mt-1">
                  Monto: <span className="font-semibold">{formatCLP(s.amountCLP)}</span>
                </div>

                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <Chip label={`Estado: ${STATUS_LABEL[s.status] || s.status}`} />
                  {s.interpreterName && <Chip label={`Intérprete: ${s.interpreterName}`} />}
                  <Chip label={`Inicio QR: ${s.startCode}`} />
                  <Chip label={`Fin QR: ${s.endCode}`} />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 md:justify-end">
                {/* Acciones por rol */}
                {role === "interpreter" && s.status === "pending" && (
                  <button
                    onClick={() => onAccept(s.id)}
                    className="rounded-2xl border border-fuchsia-400/60 bg-fuchsia-500/15 px-3 py-2 text-fuchsia-200 hover:bg-fuchsia-500/25 transition"
                  >
                    Aceptar 🤟
                  </button>
                )}

                {(role === "interpreter" || role === "client") && s.status === "accepted" && (
                  <button
                    onClick={() => onStart(s.id)}
                    className="rounded-2xl border border-emerald-400/60 bg-emerald-500/10 px-3 py-2 text-emerald-200 hover:bg-emerald-500/20 transition"
                  >
                    Iniciar ▶
                  </button>
                )}

                {(role === "interpreter" || role === "client") && s.status === "active" && (
                  <button
                    onClick={() => onFinish(s.id)}
                    className="rounded-2xl border border-cyan-400/60 bg-cyan-500/15 px-3 py-2 text-cyan-200 hover:bg-cyan-500/25 transition"
                  >
                    Finalizar ✅
                  </button>
                )}

                {mine && (
                  <span className="text-xs text-slate-400 self-center">
                    Asignado a ti
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Chip({ label }) {
  return (
    <span className="rounded-full border border-slate-700/70 bg-slate-900/40 px-3 py-1 text-slate-200">
      {label}
    </span>
  );
}