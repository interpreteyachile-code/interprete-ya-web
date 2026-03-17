import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createRating } from "../data/ratingsStore";
import { getService, updateService } from "../data/servicesStore";
import { useAuth } from "../auth/AuthContext";

function moneyCLP(n) {
  return "$" + Number(n || 0).toLocaleString("es-CL");
}

function modeLabel(mode) {
  return mode === "video"
    ? "🎥 Video"
    : mode === "schedule"
    ? "📅 Agenda"
    : "⚡ Ahora";
}

function serviceTypeLabel(type) {
  return type === "tramite"
    ? "🧾 Trámite"
    : type === "reunion"
    ? "👥 Reunión"
    : type === "entrevista"
    ? "💼 Entrevista"
    : type === "evento"
    ? "🎤 Evento"
    : "🧩 Servicio";
}

export default function CalificarServicio() {
  const { serviceId } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();

  const service = useMemo(() => getService(serviceId), [serviceId]);

  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  if (!service) {
    return (
      <div className="tron-card p-6 max-w-xl mx-auto">
        ❌ No se encontró el servicio.
        <div className="mt-4">
          <button className="tron-btn tron-primary" onClick={() => nav("/historial")}>
            ⬅️ Volver
          </button>
        </div>
      </div>
    );
  }

  const submit = () => {
    setError("");

    if (!service.interpreterId) {
      setError("⚠️ Este servicio aún no tiene intérprete asignado.");
      return;
    }

    try {
      setLoading(true);

      createRating({
        interpreterId: service.interpreterId,
        interpreterName: service.interpreterName || "",
        clientRut: user.rut,
        clientName: user.fullName || "",
        serviceId: service.id,
        stars,
        comment: comment.trim(),
        createdAt: Date.now(),
      });

      updateService(service.id, {
        status: "rated",
        rating: stars,
        ratedAt: Date.now(),
      });

      alert("⭐ Evaluación enviada correctamente");

      nav("/usuario", { replace: true });
    } catch (err) {
      setError("❌ No se pudo enviar la evaluación.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto grid gap-4">
      <div className="tron-card p-6">
        <div className="text-2xl font-semibold h-title">
          ⭐ Calificar Intérprete
        </div>

        <div className="text-white/70 mt-2">
          Tu opinión ayuda a mejorar InterpreteYa y fortalecer la comunidad.
        </div>

        <div className="mt-4 tron-card p-4">
          <div className="text-sm text-white/80">
            🧩 Servicio: <b>{serviceTypeLabel(service.serviceType)}</b>
          </div>

          <div className="text-sm text-white/75 mt-1">
            🎥 Modalidad: <b>{modeLabel(service.mode)}</b>
          </div>

          <div className="text-sm text-white/75 mt-1">
            🧑‍💼 Intérprete: <b>{service.interpreterName || "—"}</b>
          </div>

          <div className="text-sm text-white/75 mt-1">
            💳 Monto: <b>{moneyCLP(service.amountCLP)}</b>
          </div>
        </div>
      </div>

      {error && (
        <div className="tron-card p-4 text-sm text-white/85">
          {error}
        </div>
      )}

      <div className="tron-card p-6 grid gap-4">
        <div>
          <div className="text-sm text-white/70 mb-2">Selecciona tu evaluación</div>

          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                className={`tron-btn ${stars >= n ? "tron-primary" : ""}`}
                onClick={() => setStars(n)}
              >
                ⭐
              </button>
            ))}
          </div>

          <div className="text-xs text-white/60 mt-2">
            Puntaje elegido: <b>{stars} / 5</b>
          </div>
        </div>

        <div>
          <div className="text-sm text-white/70 mb-1">📝 Comentario</div>
          <textarea
            className="tron-input w-full"
            rows={4}
            placeholder="Comentario opcional sobre la atención, puntualidad, claridad, trato, etc."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className="tron-btn tron-muted py-3"
            onClick={() => nav("/historial")}
            disabled={loading}
          >
            ⬅️ Volver
          </button>

          <button
            type="button"
            className={
              "tron-btn tron-primary py-3 font-semibold " +
              (loading ? "opacity-70 cursor-not-allowed" : "")
            }
            onClick={submit}
            disabled={loading}
          >
            {loading ? "⏳ Enviando..." : "⭐ Enviar evaluación"}
          </button>
        </div>
      </div>
    </div>
  );
}