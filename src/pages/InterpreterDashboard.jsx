import { useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { listServices, updateService } from "../data/servicesStore"; // ✅ ruta correcta

function Chip({ children }) {
  return <span className="tron-chip">{children}</span>;
}

function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="w-full max-w-3xl tron-card p-6 relative">
          <button className="tron-btn px-4 py-2 absolute right-4 top-4" onClick={onClose}>
            ✖
          </button>
          {children}
        </div>
      </div>
    </div>
  );
}

function statusLabel(s) {
  return s === "created"
    ? "🧾 Creado"
    : s === "matched"
    ? "🤝 Conectado"
    : s === "started"
    ? "🔳 En curso"
    : s === "finished"
    ? "🏁 Finalizado"
    : s === "paid"
    ? "💳 Pagado"
    : s === "rated"
    ? "⭐ Calificado"
    : "—";
}

export default function InterpreterDashboard() {
  const { user } = useAuth();

  // ✅ hooks SIEMPRE arriba
  const [tick, setTick] = useState(0);
  const [selected, setSelected] = useState(null);
  const [code, setCode] = useState("");

  // ✅ derivar permisos sin cortar hooks
  const isLogged = !!user;
  const isInterpreter = user?.profileType === "interpreter" && user?.role === "client";
  const isManager = user?.role === "manager";
  const allowed = isLogged && (isInterpreter || isManager);

  const services = useMemo(() => {
    // refresco con tick
    const all = listServices();
    return [...all].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [tick]);

  const pending = services.filter((s) => s.status === "created");
  const matched = services.filter((s) => s.status === "matched");
  const started = services.filter((s) => s.status === "started");
  const done = services.filter((s) => ["finished", "paid", "rated"].includes(s.status));

  const pick = (s) => {
    setSelected(s);
    setCode("");
  };

  const accept = (id) => {
    const next = updateService(id, {
      status: "matched",
      interpreterId: user.id,
      interpreterName: user.fullName,
    });
    setSelected(next);
    setTick((x) => x + 1);
  };

  const start = (s) => {
    if ((code || "").trim().toUpperCase() !== (s.startCode || "").toUpperCase()) {
      return alert("⚠️ Código inicio incorrecto.");
    }
    const next = updateService(s.id, { status: "started", startedAt: Date.now() });
    setSelected(next);
    setCode("");
    setTick((x) => x + 1);
  };

  const finish = (s) => {
    if ((code || "").trim().toUpperCase() !== (s.endCode || "").toUpperCase()) {
      return alert("⚠️ Código fin incorrecto.");
    }
    const next = updateService(s.id, { status: "finished", finishedAt: Date.now() });
    setSelected(next);
    setCode("");
    setTick((x) => x + 1);
  };

  // ✅ renders (ahora sí podemos retornar sin romper hooks)
  if (!isLogged) {
    return <div className="tron-card p-6 max-w-xl mx-auto">🔒 Debes iniciar sesión.</div>;
  }

  if (!allowed) {
    return <div className="tron-card p-6 max-w-xl mx-auto">🔒 Solo intérprete (o gerente).</div>;
  }

  return (
    <div className="grid gap-4">
      <div className="tron-card p-6">
        <div className="text-2xl font-semibold h-title">🧑‍💼 Panel Intérprete</div>
        <div className="text-white/70 mt-2">
          Aceptar solicitudes + validar inicio/fin + videollamada (demo funcional).
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Chip>🧾 Nuevas: {pending.length}</Chip>
          <Chip>🤝 Conectadas: {matched.length}</Chip>
          <Chip>🔳 En curso: {started.length}</Chip>
          <Chip>🏁 Historial: {done.length}</Chip>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {services.map((s) => (
          <button key={s.id} className="tron-btn w-full text-left" onClick={() => pick(s)}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold">
                  {statusLabel(s.status)} • {s.clientName || "Cliente"}
                </div>
                <div className="text-xs text-white/60 mt-1">
                  ID {String(s.id).slice(0, 6)}… • 💳 ${Number(s.amountCLP || 0).toLocaleString("es-CL")}
                </div>
              </div>
              <span className="tron-chip">
                {s.mode === "video" ? "🎥" : s.mode === "schedule" ? "📅" : "⚡"}
              </span>
            </div>
          </button>
        ))}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)}>
        {!selected ? null : (
          <div>
            <div className="text-2xl font-semibold h-title">📌 Servicio</div>
            <div className="text-white/70 mt-1">
              {statusLabel(selected.status)} • Cliente: <b>{selected.clientName}</b>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <Chip>💳 ${Number(selected.amountCLP || 0).toLocaleString("es-CL")}</Chip>
              <Chip>🔳 Inicio: {selected.startCode}</Chip>
              <Chip>🔳 Fin: {selected.endCode}</Chip>
            </div>

            {/* Video demo */}
            {selected.mode === "video" && (
              <div className="mt-4 tron-card p-4">
                <div className="font-semibold">🎥 Videollamada (demo)</div>
                <div className="mt-3" style={{ width: "100%", height: 420 }}>
                  <iframe
                    title="InterpreteYa-Video"
                    src={`https://meet.jit.si/InterpreteYa-${selected.id}`}
                    style={{ width: "100%", height: "100%", border: 0, borderRadius: 16 }}
                    allow="camera; microphone; fullscreen; display-capture"
                  />
                </div>
              </div>
            )}

            <div className="mt-4 glow-line" />

            {selected.status === "created" && (
              <button
                className="tron-btn tron-primary w-full py-3 font-semibold mt-4"
                onClick={() => accept(selected.id)}
              >
                ✅ Aceptar solicitud
              </button>
            )}

            {selected.status === "matched" && (
              <div className="mt-4 tron-card p-5">
                <div className="font-semibold">🔳 Validar Inicio</div>
                <div className="text-xs text-white/60 mt-1">Ingresa el código inicio (demo).</div>
                <input
                  className="tron-input w-full mt-3"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Código inicio"
                />
                <button className="tron-btn tron-primary w-full mt-3 py-3 font-semibold" onClick={() => start(selected)}>
                  ✅ Iniciar servicio
                </button>
              </div>
            )}

            {selected.status === "started" && (
              <div className="mt-4 tron-card p-5">
                <div className="font-semibold">🔳 Validar Fin</div>
                <div className="text-xs text-white/60 mt-1">Ingresa el código fin (demo).</div>
                <input
                  className="tron-input w-full mt-3"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Código fin"
                />
                <button className="tron-btn tron-primary w-full mt-3 py-3 font-semibold" onClick={() => finish(selected)}>
                  ✅ Finalizar servicio
                </button>
              </div>
            )}

            {["finished", "paid", "rated"].includes(selected.status) && (
              <div className="mt-4 tron-card p-5 text-white/75">
                🏁 Servicio finalizado. (demo) Luego: pago + evaluación.
              </div>
            )}
          </div>
        )}
      </Modal>

      <div className="text-xs text-white/55">
        🔁 Si no ves servicios: crea uno en <b>Solicitud</b> (modo video/agenda/ahora).
      </div>
    </div>
  );
}
