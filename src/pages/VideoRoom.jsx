import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

export default function VideoRoom() {
  const container = useRef(null);
  const apiRef = useRef(null);

  const { roomId } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();

  const service = useMemo(() => getService(roomId), [roomId]);

  const durationMinutes = Number(service?.durationMin || 30);
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);
  const [error, setError] = useState("");

  // reiniciar contador si cambia servicio/duración
  useEffect(() => {
    setSecondsLeft(durationMinutes * 60);
  }, [durationMinutes]);

  // marcar inicio si aún no empezó
  useEffect(() => {
    if (!service) return;

    if (service.status === "matched") {
      updateService(service.id, {
        status: "started",
        startedAt: service.startedAt || Date.now(),
      });
    }
  }, [service]);

  // iniciar Jitsi
  useEffect(() => {
    if (!container.current) return;

    if (!window.JitsiMeetExternalAPI) {
      setError("❌ Jitsi no está disponible en esta página.");
      return;
    }

    const domain = "meet.jit.si";

    const options = {
      roomName: "interpreteya-" + roomId,
      parentNode: container.current,
      width: "100%",
      height: 600,
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_BRAND_WATERMARK: false,
      },
    };

    try {
      apiRef.current = new window.JitsiMeetExternalAPI(domain, options);
    } catch (err) {
      setError("❌ No se pudo abrir la videollamada.");
    }

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
    };
  }, [roomId]);

  // contador
  useEffect(() => {
    if (!service) return;

    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timer);

          updateService(service.id, {
            status: "finished",
            finishedAt: Date.now(),
          });

          alert("⏱ Tiempo finalizado");

          if (user?.profileType === "user") {
            nav(`/calificar/${roomId}`, { replace: true });
          } else if (user?.profileType === "interpreter") {
            nav("/interprete", { replace: true });
          } else {
            nav("/historial", { replace: true });
          }

          return 0;
        }

        return s - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [roomId, nav, service, user]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  if (!service) {
    return (
      <div className="tron-card p-6 max-w-2xl mx-auto">
        ❌ No se encontró el servicio.
        <div className="mt-4">
          <button className="tron-btn tron-primary" onClick={() => nav("/historial")}>
            ⬅️ Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto grid gap-4">
      <div className="tron-card p-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-2xl font-semibold h-title">
            🎥 Videollamada InterpreteYa
          </div>

          <div className="text-white/70 mt-1">
            Comunicación en Lengua de Señas Chilena
          </div>

          <div className="mt-3 text-sm text-white/75">
            {serviceTypeLabel(service.serviceType)} • {modeLabel(service.mode)}
          </div>

          <div className="text-sm text-white/75 mt-1">
            👤 Cliente: <b>{service.clientName || service.clientRut || "—"}</b>
          </div>

          <div className="text-sm text-white/75 mt-1">
            🧑‍💼 Intérprete: <b>{service.interpreterName || "—"}</b>
          </div>

          <div className="text-sm text-white/75 mt-1">
            💳 Monto: <b>{moneyCLP(service.amountCLP)}</b>
          </div>

          <div className="text-sm text-white/75 mt-1">
            ⏱️ Duración: <b>{durationMinutes} min</b>
          </div>
        </div>

        <div className="tron-chip text-lg font-semibold">
          ⏱ {minutes}:{seconds.toString().padStart(2, "0")}
        </div>
      </div>

      {error && (
        <div className="tron-card p-4 text-sm text-white/85">
          {error}
        </div>
      )}

      <div ref={container} className="tron-card p-2 min-h-[620px]" />

      <div className="grid md:grid-cols-2 gap-3">
        <button
          className="tron-btn tron-muted py-3 font-semibold"
          onClick={() => {
            if (user?.profileType === "interpreter") nav("/interprete");
            else if (user?.role === "manager") nav("/gerente");
            else nav("/usuario");
          }}
        >
          ⬅️ Volver al panel
        </button>

        <button
          className="tron-btn py-3 font-semibold"
          onClick={() => {
            updateService(service.id, {
              status: "finished",
              finishedAt: Date.now(),
            });

            if (user?.profileType === "user") {
              nav(`/calificar/${roomId}`);
            } else if (user?.profileType === "interpreter") {
              nav("/interprete");
            } else {
              nav("/historial");
            }
          }}
        >
          🏁 Finalizar llamada
        </button>
      </div>
    </div>
  );
}