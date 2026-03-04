import { useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { createService } from "../data/servicesStore";

export default function Solicitud() {
  const nav = useNavigate();
  const { user } = useAuth();
  const outlet = useOutletContext() || {};
  const filters = outlet.filters || { mode: "now", service: "all", zone: "all" };

  const [serviceType, setServiceType] = useState(filters.service === "all" ? "tramite" : filters.service);
  const [zone, setZone] = useState(filters.zone === "all" ? "centro" : filters.zone);
  const [note, setNote] = useState("");
  const [whenISO, setWhenISO] = useState("");
  const [priceCLP, setPriceCLP] = useState(15000);

  const isSchedule = filters.mode === "schedule";

  const title = useMemo(() => {
    return filters.mode === "video" ? "🎥 Solicitud Video" : filters.mode === "schedule" ? "📅 Solicitud Agenda" : "⚡ Solicitud Ahora";
  }, [filters.mode]);

  if (!user) {
    return (
      <div className="tron-card p-6 max-w-xl mx-auto">
        🔒 Debes iniciar sesión para solicitar.
        <div className="mt-3">
          <button className="tron-btn tron-primary" onClick={() => nav("/login")}>🔐 Ir a Login</button>
        </div>
      </div>
    );
  }

  const submit = () => {
    const s = createService({
      mode: filters.mode,
      serviceType,
      zone,
      note,
      whenISO: isSchedule ? whenISO : null,
      priceCLP,
      clientRut: user.rut,
      clientName: user.fullName,
    });

    nav(`/pago/${s.id}`);
  };

  return (
    <div className="grid gap-4">
      <div className="tron-card p-6">
        <div className="text-2xl font-semibold h-title">{title}</div>
        <div className="text-white/70 mt-2">Completa datos y continúa a pago (demo).</div>

        <div className="mt-4 glow-line" />

        <div className="mt-4 grid md:grid-cols-2 gap-3">
          <div>
            <div className="text-sm text-white/70">🧩 Servicio</div>
            <select className="tron-select w-full mt-1" value={serviceType} onChange={(e) => setServiceType(e.target.value)}>
              <option value="tramite">🧾 Trámite</option>
              <option value="reunion">👥 Reunión</option>
              <option value="entrevista">💼 Entrevista</option>
              <option value="evento">🎤 Evento</option>
            </select>
          </div>

          <div>
            <div className="text-sm text-white/70">📍 Zona</div>
            <select className="tron-select w-full mt-1" value={zone} onChange={(e) => setZone(e.target.value)}>
              <option value="norte">🌵 Norte</option>
              <option value="centro">🏙️ Centro</option>
              <option value="sur">🌲 Sur</option>
            </select>
          </div>

          {isSchedule && (
            <div className="md:col-span-2">
              <div className="text-sm text-white/70">📅 Fecha y hora</div>
              <input className="tron-input w-full mt-1" type="datetime-local" value={whenISO} onChange={(e) => setWhenISO(e.target.value)} />
              <div className="text-xs text-white/55 mt-1">Requerido para agenda.</div>
            </div>
          )}

          <div>
            <div className="text-sm text-white/70">💳 Precio (demo)</div>
            <input className="tron-input w-full mt-1" type="number" value={priceCLP} onChange={(e) => setPriceCLP(Number(e.target.value || 0))} />
          </div>

          <div className="md:col-span-2">
            <div className="text-sm text-white/70">📝 Nota</div>
            <textarea className="tron-input w-full mt-1 min-h-[90px]" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
        </div>

        <div className="mt-4">
          <button className="tron-btn tron-primary w-full py-3 font-semibold" onClick={submit}>
            ✅ Continuar a Pago
          </button>
        </div>
      </div>
    </div>
  );
}