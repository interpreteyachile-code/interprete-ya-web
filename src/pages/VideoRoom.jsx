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

function AetherBar({ label, value }) {
  return (
    <div className="aether-bar">
      <div className="aether-bar-label">{label}</div>
      <div className="aether-bar-track">
        <div
          className="aether-bar-fill"
          style={{ height: `${Math.max(8, Math.min(100, value))}%` }}
        />
      </div>
      <div className="aether-bar-value">{value}%</div>
    </div>
  );
}

function userRoleLabel(user) {
  if (user?.role === "manager") return "🧑‍💼 Gerente";
  if (user?.profileType === "interpreter") return "🧑‍💼 Intérprete";
  return "🧏‍♀️ Cliente";
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

  const [chatText, setChatText] = useState("");
  const [chatItems, setChatItems] = useState([
    { id: 1, author: "Sistema", text: "Sala preparada para videollamada." },
  ]);

  const [audioMuted, setAudioMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);

  useEffect(() => {
    setSecondsLeft(durationMinutes * 60);
  }, [durationMinutes]);

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

      apiRef.current.addEventListener("videoConferenceJoined", () => {
        setIsReady(true);
        setChatItems((prev) => [
          ...prev,
          { id: Date.now(), author: "Sistema", text: "Videollamada conectada en vivo." },
        ]);
      });

      apiRef.current.addEventListener("readyToClose", () => {
        finishAndExit(false);
      });
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

    nav("/gerente", { replace: true });
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

  const handleSendChat = () => {
    const value = chatText.trim();
    if (!value) return;

    setChatItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        author: user?.fullName || "Usuario",
        text: value,
      },
    ]);
    setChatText("");
  };

  const toggleAudio = () => {
    if (!apiRef.current) return;
    apiRef.current.executeCommand("toggleAudio");
    setAudioMuted((prev) => !prev);
  };

  const toggleVideo = () => {
    if (!apiRef.current) return;
    apiRef.current.executeCommand("toggleVideo");
    setVideoMuted((prev) => !prev);
  };

  const addMinute = () => {
    setSecondsLeft((prev) => prev + 60);
    setChatItems((prev) => [
      ...prev,
      { id: Date.now(), author: "Sistema", text: "Se agregó 1 minuto a la sesión." },
    ]);
  };

  const addFiveMinutes = () => {
    setSecondsLeft((prev) => prev + 300);
    setChatItems((prev) => [
      ...prev,
      { id: Date.now(), author: "Sistema", text: "Se agregaron 5 minutos a la sesión." },
    ]);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  const timePercent = Math.max(
    0,
    Math.min(100, Math.round((secondsLeft / (durationMinutes * 60 || 1)) * 100))
  );

  const connectionPercent = isReady ? 92 : 35;
  const audioPercent = audioMuted ? 12 : 88;
  const videoPercent = videoMuted ? 8 : 90;

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

  const isManager = user?.role === "manager";
  const isInterpreter = user?.profileType === "interpreter";
  const isClient = user?.profileType === "user";

  return (
    <div className="max-w-7xl mx-auto grid gap-4">
      {/* HEADER */}
      <div className="aether-shell">
        <div className="aether-header">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="aether-title">AETHER | VIDEO CALL CENTER</div>
              <div className="aether-subtitle">
                InterpreteYa · live call room · {userRoleLabel(user)}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className={isReady ? "aether-tag-ok" : "aether-tag-warn"}>
                {isReady ? "● EN VIVO" : "● CONECTANDO"}
              </span>
              <span className="aether-tag-ok">
                ⏱ {minutes}:{seconds.toString().padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 grid lg:grid-cols-[1.5fr_.7fr] gap-4">
          {/* LEFT MAIN */}
          <div className="aether-grid">
            <div className="aether-block">
              <div className="aether-block-head">Active Data Streams</div>
              <div className="aether-block-body">
                <div className="aether-wave" />
              </div>
            </div>

            <div className="aether-block">
              <div className="aether-block-head">Video Call Center</div>
              <div className="aether-block-body p-2">
                {error && (
                  <div className="panel-mini mb-3 text-sm text-white/80">
                    {error}
                  </div>
                )}

                <div
                  ref={container}
                  className="w-full min-h-[360px] h-[52vh] md:h-[62vh] rounded-xl overflow-hidden border border-cyan-300/10"
                />
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="aether-grid">
            <div className="aether-block">
              <div className="aether-block-head">System Overview</div>
              <div className="aether-block-body">
                <div className="aether-statbars">
                  <AetherBar label="Time" value={timePercent} />
                  <AetherBar label="Audio" value={audioPercent} />
                  <AetherBar label="Video" value={videoPercent} />
                  <AetherBar label="Link" value={connectionPercent} />
                </div>
              </div>
            </div>

            <div className="aether-block">
              <div className="aether-block-head">Service Data</div>
              <div className="aether-block-body grid gap-2 text-sm text-white/75">
                <div>{serviceTypeLabel(service.serviceType)} • {modeLabel(service.mode)}</div>
                <div>💳 Monto: <b>{moneyCLP(service.amountCLP)}</b></div>
                <div>👤 Cliente: <b>{service.clientName || service.clientRut || "—"}</b></div>
                <div>🧑‍💼 Intérprete: <b>{service.interpreterName || "—"}</b></div>
                <div>⏱ Duración base: <b>{durationMinutes} min</b></div>
                <div>
                  📡 Estado:{" "}
                  <b>{service.status === "finished" ? "Finalizado" : isReady ? "En vivo" : "Conectando"}</b>
                </div>
              </div>
            </div>

            <div className="aether-block">
              <div className="aether-block-head">Quick Controls</div>
              <div className="aether-block-body grid gap-2">
                <button
                  className="tron-btn tron-primary font-semibold"
                  onClick={toggleAudio}
                >
                  {audioMuted ? "🎤 Activar audio" : "🔇 Silenciar audio"}
                </button>

                <button
                  className="tron-btn font-semibold"
                  onClick={toggleVideo}
                >
                  {videoMuted ? "📷 Activar cámara" : "🚫 Apagar cámara"}
                </button>

                {(isManager || isInterpreter) && (
                  <>
                    <button
                      className="tron-btn tron-muted font-semibold"
                      onClick={addMinute}
                    >
                      ➕ Agregar 1 minuto
                    </button>

                    <button
                      className="tron-btn tron-muted font-semibold"
                      onClick={addFiveMinutes}
                    >
                      ⏱➕ Agregar 5 minutos
                    </button>
                  </>
                )}

                {isClient && (
                  <button
                    className="tron-btn font-semibold"
                    onClick={() =>
                      setChatItems((prev) => [
                        ...prev,
                        {
                          id: Date.now(),
                          author: "Cliente",
                          text: "Necesito apoyo adicional en esta parte de la llamada.",
                        },
                      ])
                    }
                  >
                    🙋 Pedir apoyo
                  </button>
                )}

                {isInterpreter && (
                  <button
                    className="tron-btn font-semibold"
                    onClick={() =>
                      setChatItems((prev) => [
                        ...prev,
                        {
                          id: Date.now(),
                          author: "Intérprete",
                          text: "Interpretación fluida. Continuamos con la sesión.",
                        },
                      ])
                    }
                  >
                    🤟 Marcar avance
                  </button>
                )}

                {isManager && (
                  <button
                    className="tron-btn font-semibold"
                    onClick={() =>
                      setChatItems((prev) => [
                        ...prev,
                        {
                          id: Date.now(),
                          author: "Gerencia",
                          text: "Supervisión activa. Todo en funcionamiento.",
                        },
                      ])
                    }
                  >
                    🧑‍💼 Supervisar sesión
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECOND ROW */}
      <div className="grid xl:grid-cols-[1.1fr_.9fr] gap-4">
        {/* CHAT */}
        <div className="aether-shell">
          <div className="aether-header">
            <div className="aether-title">Secure Chat / Session Notes</div>
            <div className="aether-subtitle">Mensajes rápidos durante la videollamada</div>
          </div>

          <div className="p-4 grid gap-3">
            <div className="aether-block">
              <div className="aether-block-body max-h-[260px] overflow-auto grid gap-2">
                {chatItems.length === 0 ? (
                  <div className="text-sm text-white/55">Sin mensajes todavía.</div>
                ) : (
                  chatItems.map((item) => (
                    <div key={item.id} className="panel-mini">
                      <div className="text-xs text-white/50 uppercase tracking-[.08em]">
                        {item.author}
                      </div>
                      <div className="text-sm text-white/80 mt-1">{item.text}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-[1fr_auto] gap-2">
              <input
                className="tron-input"
                placeholder="Escribe una nota o mensaje rápido..."
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
              />
              <button
                className="tron-btn tron-primary font-semibold"
                onClick={handleSendChat}
              >
                ➤ Enviar
              </button>
            </div>
          </div>
        </div>

        {/* ACTION PANEL */}
        <div className="aether-shell">
          <div className="aether-header">
            <div className="aether-title">Session Actions</div>
            <div className="aether-subtitle">Control operativo por rol</div>
          </div>

          <div className="p-4 grid gap-3">
            <div className="aether-mini-metric">
              <div className="aether-mini-label">User role</div>
              <div className="aether-mini-value">{userRoleLabel(user)}</div>
            </div>

            <div className="aether-mini-metric">
              <div className="aether-mini-label">Live status</div>
              <div className="aether-mini-value">
                {isReady ? "ACTIVO" : "PREPARANDO"}
              </div>
            </div>

            <div className="aether-mini-metric">
              <div className="aether-mini-label">Remaining time</div>
              <div className="aether-mini-value">
                {minutes}:{seconds.toString().padStart(2, "0")}
              </div>
            </div>

            <button
              className="tron-btn tron-muted py-3 md:py-4 font-semibold"
              onClick={() => nav(getBackRoute(user))}
            >
              ⬅️ Volver al panel
            </button>

            <button
              className="tron-btn tron-danger py-3 md:py-4 font-semibold"
              onClick={() => finishAndExit(false)}
            >
              🏁 Finalizar llamada
            </button>

            {isClient && (
              <div className="panel-mini text-sm text-white/75">
                Al terminar, irás a calificar al intérprete.
              </div>
            )}

            {isInterpreter && (
              <div className="panel-mini text-sm text-white/75">
                Al terminar, volverás al panel de intérprete.
              </div>
            )}

            {isManager && (
              <div className="panel-mini text-sm text-white/75">
                Modo supervisión activo para gerencia.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}