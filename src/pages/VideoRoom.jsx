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

function getBackRoute(user) {
  if (user?.profileType === "interpreter") return "/interprete";
  if (user?.role === "manager") return "/gerente";
  return "/usuario";
}

export default function VideoRoom() {
  const container = useRef(null);
  const apiRef = useRef(null);
  const finishedRef = useRef(false);

  const { roomId } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();

  const service = useMemo(() => getService(roomId), [roomId]);

  const durationMinutes = Number(service?.durationMin || 30);
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);
  const [error, setError] = useState("");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setSecondsLeft(durationMinutes * 60);
  }, [durationMinutes]);

  // marcar inicio si está listo para comenzar
  useEffect(() => {
    if (!service) return;

    const shouldStart =
      service.status === "matched" ||
      (service.status === "paid" && service.interpreterId);

    if (shouldStart) {
      updateService(service.id, {
        status: "started",
        startedAt: service.startedAt || Date.now(),
      });
    }
  }, [service]);

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
      height: "100%",
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        prejoinPageEnabled: false,
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_BRAND_WATERMARK: false,
      },
    };

    try {
      apiRef.current = new window.JitsiMeetExternalAPI(domain, options);
      setIsReady(true);
    } catch (err) {
      setError("❌ No se pudo abrir la videollamada.");
      setIsReady(false);
    }

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
    };
  }, [roomId]);

  const finishAndExit = (fromTimer = false) => {
    if (!service || finishedRef.current) return;
    finishedRef.current = true;

    updateService(service.id, {
      status: "finished",
      finishedAt: Date.now(),
    });

    if (fromTimer) {
      alert("⏱ Tiempo finalizado");
    }

    if (user?.profileType === "user") {
      nav(`/calificar/${roomId}`, { replace: true });
      return;
    }

    if (user?.profileType === "interpreter") {
      nav("/interprete", { replace: true });
      return;
    }

    nav("/historial", { replace: true });
  };

  useEffect(() => {
    if (!service) return;

    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timer);
          finishAndExit(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [service, roomId, user]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  if (!service) {
    return (
      <div className="tron-card p-6 max-w-2xl mx-auto">
        ❌ No se encontró el servicio.
        <div className="mt-4">
          <button
            className="tron-btn tron-primary"
            onClick={() => nav("/historial")}
          >
            ⬅️ Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto grid gap-4">
      <div className="tron-card p-4 md:p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="min-w-0">
            <div className="text-2xl md:text-3xl font-semibold h-title">
              🎥 Videollamada InterpreteYa
            </div>

            <div className="text-white/70 mt-1">
              Servicio en vivo de interpretación en Lengua de Señas Chilena
            </div>

            <div className="mt-4 grid sm:grid-cols-2 gap-2 text-sm text-white/75">
              <div>
                {serviceTypeLabel(service.serviceType)} • {modeLabel(service.mode)}
              </div>

              <div>
                💳 Monto: <b>{moneyCLP(service.amountCLP)}</b>
              </div>

              <div>
                👤 Cliente: <b>{service.clientName || service.clientRut || "—"}</b>
              </div>

              <div>
                🧑‍💼 Intérprete: <b>{service.interpreterName || "—"}</b>
              </div>

              <div>
                ⏱️ Duración: <b>{durationMinutes} min</b>
              </div>

              <div>
                📡 Estado: <b>{service.status === "finished" ? "Finalizado" : "En curso"}</b>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 items-start lg:items-end">
            <div className="tron-chip text-base md:text-lg font-semibold">
              ⏱ {minutes}:{seconds.toString().padStart(2, "0")}
            </div>

            <div className="tron-card px-4 py-3 text-sm text-white/75">
              {isReady
                ? "✅ Cámara lista"
                : error
                ? "❌ Error de conexión"
                : "🔄 Preparando sala"}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="tron-card p-4 text-sm text-white/85">
          {error}
        </div>
      )}

      <div className="tron-card p-2">
        <div
          ref={container}
          className="w-full min-h-[420px] h-[55vh] md:h-[65vh] lg:h-[72vh] rounded-2xl overflow-hidden"
        />
      </div>

      <div className="tron-card p-4">
        <div className="font-semibold">📌 Estado del servicio</div>
        <div className="text-sm text-white/75 mt-2">
          {user?.profileType === "user" &&
            "Tu videollamada está activa. Al terminar, podrás calificar al intérprete."}

          {user?.profileType === "interpreter" &&
            "La videollamada está en curso. Cuando finalice, volverás a tu panel."}

          {user?.role === "manager" &&
            "La sala está abierta en modo supervisión/demo."}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          className="tron-btn tron-muted py-3 md:py-4 font-semibold"
          onClick={() => nav(getBackRoute(user))}
        >
          ⬅️ Volver al panel
        </button>

        <button
          className="tron-btn tron-primary py-3 md:py-4 font-semibold"
          onClick={() => finishAndExit(false)}
        >
          🏁 Finalizar llamada
        </button>
      </div>
    </div>
  );
}