import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createService } from "../data/servicesStore";
import { useAuth } from "../auth/AuthContext";

export default function Solicitud() {
  const nav = useNavigate();
  const { user } = useAuth();

  const [mode, setMode] = useState("now");
  const [serviceType, setServiceType] = useState("tramite");
  const [zone, setZone] = useState("centro");
  const [priceCLP, setPriceCLP] = useState("");
  const [note, setNote] = useState("");

  if (!user) {
    return (
      <div className="tron-card p-6 max-w-xl mx-auto">
        🔒 Debes iniciar sesión.
      </div>
    );
  }

  const submit = () => {
    createService({
      mode,
      serviceType,
      zone,
      priceCLP: Number(priceCLP) || 0,
      clientRut: user.rut,
      note,
      status: "requested",
    });

    alert("✅ Solicitud enviada");

    nav("/usuario");
  };

  return (
    <div className="max-w-2xl mx-auto grid gap-4">

      <div className="tron-card p-6">
        <div className="text-2xl font-semibold">🤟 Solicitar Intérprete</div>
        <div className="text-white/70 mt-2">
          Completa los datos para crear la solicitud.
        </div>
      </div>

      <div className="tron-card p-5 grid gap-3">

        {/* MODO */}
        <div>
          <div className="text-sm text-white/70 mb-1">⚡ Modo</div>

          <div className="grid grid-cols-3 gap-2">
            <button
              className={`tron-btn ${mode === "now" ? "tron-primary" : ""}`}
              onClick={() => setMode("now")}
            >
              ⚡ Ahora
            </button>

            <button
              className={`tron-btn ${mode === "schedule" ? "tron-primary" : ""}`}
              onClick={() => setMode("schedule")}
            >
              📅 Agenda
            </button>

            <button
              className={`tron-btn ${mode === "video" ? "tron-primary" : ""}`}
              onClick={() => setMode("video")}
            >
              🎥 Video
            </button>
          </div>
        </div>

        {/* SERVICIO */}
        <div>
          <div className="text-sm text-white/70 mb-1">🧩 Tipo de servicio</div>

          <select
            className="tron-select w-full"
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
          >
            <option value="tramite">🧾 Trámite</option>
            <option value="reunion">👥 Reunión</option>
            <option value="entrevista">💼 Entrevista</option>
            <option value="evento">🎤 Evento</option>
          </select>
        </div>

        {/* ZONA */}
        <div>
          <div className="text-sm text-white/70 mb-1">📍 Zona</div>

          <select
            className="tron-select w-full"
            value={zone}
            onChange={(e) => setZone(e.target.value)}
          >
            <option value="norte">🌵 Norte</option>
            <option value="centro">🏙️ Centro</option>
            <option value="sur">🌲 Sur</option>
          </select>
        </div>

        {/* PRECIO */}
        <div>
          <div className="text-sm text-white/70 mb-1">💳 Precio CLP</div>

          <input
            className="tron-input w-full"
            placeholder="Ej: 20000"
            value={priceCLP}
            onChange={(e) => setPriceCLP(e.target.value)}
          />
        </div>

        {/* NOTA */}
        <div>
          <div className="text-sm text-white/70 mb-1">📝 Nota</div>

          <textarea
            className="tron-input w-full"
            rows="3"
            placeholder="Describe el servicio"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <button
          className="tron-btn tron-primary w-full py-3 font-semibold"
          onClick={submit}
        >
          🚀 Crear solicitud
        </button>

      </div>
    </div>
  );
}