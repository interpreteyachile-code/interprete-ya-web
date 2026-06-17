import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { supabase } from "../lib/supabaseClient";

function moneyCLP(n) {
  return "$" + Number(n || 0).toLocaleString("es-CL");
}

function modeLabel(mode) {
  return mode === "video" ? "🎥 Video" : mode === "schedule" ? "📅 Agenda" : "⚡ Ahora";
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
    : type === "emergencia"
    ? "🚨 Emergencia"
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
  return "🧏 Cliente";
}

function makeVideoRoom(id) {
  return `InterpreteYa-${String(id).replace(/[^a-zA-Z0-9]/g, "")}`;
}

function mapService(s) {
  return {
    ...s,
    clientId: s.client_id,
    clientRut: s.client_rut,
    clientName: s.client_name,
    interpreterId: s.interpreter_id,
    interpreterName: s.interpreter_name,
    serviceType: s.service_type,
    durationMin: s.duration_min,
    scheduledAt: s.scheduled_at,
    amountCLP: s.amount_clp,
    paidAt: s.paid_at,
    startCode: s.start_code,
    endCode: s.end_code,
    startedAt: s.started_at,
    finishedAt: s.finished_at,
    ratedAt: s.rated_at,
    createdAt: s.created_at,
    videoRoom: s.video_room,
    priority: s.priority || "normal",
  };
}

export default function VideoRoom() {
  const container = useRef(null);
  const apiRef = useRef(null);
  const finishedRef = useRef(false);

  const { roomId } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  const [secondsLeft, setSecondsLeft] = useState(30 * 60);
  const [error, setError] = useState("");
  const [isReady, setIsReady] = useState(false);

  const [chatText, setChatText] = useState("");
  const [chatItems, setChatItems] = useState([
    { id: 1, author: "Sistema", text: "Sala preparada para videollamada." },
  ]);

  const [audioMuted, setAudioMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);

  useEffect(() => {
    loadService();

    const timer = setInterval(() => {
      loadService(false);
    }, 5000);

    return () => clearInterval(timer);
  }, [roomId, user?.id]);

  async function loadService(showLoading = true) {
    if (showLoading) setLoading(true);

    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("id", roomId)
      .single();

    if (error) {
      console.log("VideoRoom load error:", error);
      setError("❌ No se encontró el servicio en Supabase.");
      setService(null);
      if (showLoading) setLoading(false);
      return;
    }

    let mapped = mapService(data);

    const allowed =
      user?.role === "manager" ||
      mapped.clientId === user?.id ||
      mapped.interpreterId === user?.id;

    if (!allowed) {
      setError("⛔ No tienes permiso para entrar a esta videollamada.");
      setService(null);
      if (showLoading) setLoading(false);
      return;
    }

    if (!mapped.videoRoom) {
      const roomName = makeVideoRoom(mapped.id);

      const { data: updatedRoom, error: roomError } = await supabase
        .from("services")
        .update({ video_room: roomName })
        .eq("id", mapped.id)
        .select()
        .single();

      if (!roomError && updatedRoom) {
        mapped = mapService(updatedRoom);
      } else {
        mapped.videoRoom = roomName;
      }
    }

    const shouldStart =
      mapped.status === "matched" ||
      (mapped.status === "paid" && mapped.interpreterId);

    if (shouldStart) {
      const { data: updated } = await supabase
        .from("services")
        .update({
          status: "started",
          started_at: mapped.startedAt || new Date().toISOString(),
        })
        .eq("id", mapped.id)
        .select()
        .single();

      if (updated) mapped = mapService(updated);
    }

    setService(mapped);
    setSecondsLeft((prev) => {
      if (prev > 0 && prev !== 30 * 60) return prev;
      return Number(mapped.durationMin || 30) * 60;
    });

    if (showLoading) setLoading(false);
  }

  useEffect(() => {
    if (!service || !container.current || apiRef.current) return;

    if (!window.JitsiMeetExternalAPI) {
      setError("❌ Jitsi no está disponible. Revisa public/index.html.");
      return;
    }

    const finalRoomName =
      service.videoRoom ||
      service.video_room ||
      makeVideoRoom(roomId);

    const options = {
      roomName: finalRoomName,
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
      apiRef.current = new window.JitsiMeetExternalAPI("meet.jit.si", options);

      apiRef.current.addEventListener("videoConferenceJoined", () => {
        setIsReady(true);
        setChatItems((prev) => [
          ...prev,
          {
            id: Date.now(),
            author: "Sistema",
            text: "Videollamada conectada en vivo.",
          },
        ]);
      });

      apiRef.current.addEventListener("readyToClose", () => {
        finishAndExit(false);
      });
    } catch (e) {
      console.log(e);
      setError("❌ No se pudo abrir la videollamada.");
      setIsReady(false);
    }

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
    };
  }, [service?.id, service?.videoRoom, roomId]);

  async function finishAndExit(fromTimer = false) {
    if (!service || finishedRef.current) return;
    finishedRef.current = true;

    await supabase
      .from("services")
      .update({
        status: "finished",
        finished_at: new Date().toISOString(),
      })
      .eq("id", service.id);

    if (fromTimer) alert("⏱ Tiempo finalizado");

    if (apiRef.current) {
      apiRef.current.dispose();
      apiRef.current = null;
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
  }

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
  }, [service?.id]);

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

  const addMinute = () => setSecondsLeft((prev) => prev + 60);
  const addFiveMinutes = () => setSecondsLeft((prev) => prev + 300);

  if (loading) {
    return <div className="tron-card p-6 max-w-2xl mx-auto">🔄 Cargando sala...</div>;
  }

  if (!service) {
    return (
      <div className="tron-card p-6 max-w-2xl mx-auto">
        {error || "❌ No se encontró el servicio."}
        <div className="mt-4">
          <button className="tron-btn tron-primary" onClick={() => nav(getBackRoute(user))}>
            ⬅️ Volver
          </button>
        </div>
      </div>
    );
  }

  const durationMinutes = Number(service.durationMin || 30);
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  const timePercent = Math.max(
    0,
    Math.min(100, Math.round((secondsLeft / (durationMinutes * 60 || 1)) * 100))
  );

  const connectionPercent = isReady ? 92 : 35;
  const audioPercent = audioMuted ? 12 : 88;
  const videoPercent = videoMuted ? 8 : 90;

  const connectionText = isReady ? "🟢 Conectado" : "🟡 Esperando conexión";

  const isManager = user?.role === "manager";
  const isInterpreter = user?.profileType === "interpreter";
  const isClient = user?.profileType === "user";

  return (
    <div className="max-w-7xl mx-auto grid gap-4">
      {service.priority === "high" && (
        <div className="panel-mini border-danger text-center text-lg font-bold">
          🚨 SERVICIO SOS PRIORIDAD ALTA 🚨
        </div>
      )}

      <div className="aether-shell">
        <div className="aether-header">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="aether-title">
                {service.priority === "high" ? "🚨 " : ""}🎥 Sala de videollamada
              </div>
              <div className="aether-subtitle">
                InterpreteYa · {service.videoRoom || "Sala automática"} · {userRoleLabel(user)}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {service.priority === "high" && <span className="aether-tag-danger">🚨 SOS</span>}
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
          <div className="aether-grid">
            <div className="aether-block">
              <div className="aether-block-head">Video Call Center</div>
              <div className="aether-block-body p-2">
                {error && <div className="panel-mini mb-3 text-sm text-white/80">{error}</div>}

                <div
                  ref={container}
                  className="w-full min-h-[360px] h-[52vh] md:h-[62vh] rounded-xl overflow-hidden border border-cyan-300/10"
                />
              </div>
            </div>
          </div>

          <div className="aether-grid">
            <div className="aether-block">
              <div className="aether-block-head">Estado del sistema</div>
              <div className="aether-block-body">
                <div className="panel-mini mb-3 text-sm text-white/80">
                  {connectionText}
                </div>

                <div className="aether-statbars">
                  <AetherBar label="Time" value={timePercent} />
                  <AetherBar label="Audio" value={audioPercent} />
                  <AetherBar label="Video" value={videoPercent} />
                  <AetherBar label="Link" value={connectionPercent} />
                </div>
              </div>
            </div>

            <div className="aether-block">
              <div className="aether-block-head">Datos del servicio</div>
              <div className="aether-block-body grid gap-2 text-sm text-white/75">
                <div>{serviceTypeLabel(service.serviceType)} • {modeLabel(service.mode)}</div>
                <div>💳 Monto: <b>{moneyCLP(service.amountCLP)}</b></div>
                <div>👤 Cliente: <b>{service.clientName || service.clientRut || "—"}</b></div>
                <div>🧑‍💼 Intérprete: <b>{service.interpreterName || "—"}</b></div>
                <div>🎥 Sala: <b>{service.videoRoom || "Automática"}</b></div>
                <div>⏱ Duración base: <b>{durationMinutes} min</b></div>
                <div>
                  📡 Estado:{" "}
                  <b>{service.status === "finished" ? "Finalizado" : isReady ? "En vivo" : "Conectando"}</b>
                </div>
              </div>
            </div>

            <div className="aether-block">
              <div className="aether-block-head">Controles rápidos</div>
              <div className="aether-block-body grid gap-2">
                <button className="tron-btn tron-primary font-semibold" onClick={toggleAudio}>
                  {audioMuted ? "🎤 Activar audio" : "🔇 Silenciar audio"}
                </button>

                <button className="tron-btn font-semibold" onClick={toggleVideo}>
                  {videoMuted ? "📷 Activar cámara" : "🚫 Apagar cámara"}
                </button>

                {(isManager || isInterpreter) && (
                  <>
                    <button className="tron-btn tron-muted font-semibold" onClick={addMinute}>
                      ➕ Agregar 1 minuto
                    </button>

                    <button className="tron-btn tron-muted font-semibold" onClick={addFiveMinutes}>
                      ⏱➕ Agregar 5 minutos
                    </button>
                  </>
                )}

                <button className="tron-btn tron-danger py-3 font-semibold" onClick={() => finishAndExit(false)}>
                  🏁 Finalizar llamada
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid xl:grid-cols-[1.1fr_.9fr] gap-4">
        <div className="aether-shell">
          <div className="aether-header">
            <div className="aether-title">Chat / notas de sesión</div>
            <div className="aether-subtitle">Mensajes rápidos durante la videollamada</div>
          </div>

          <div className="p-4 grid gap-3">
            <div className="aether-block">
              <div className="aether-block-body max-h-[260px] overflow-auto grid gap-2">
                {chatItems.map((item) => (
                  <div key={item.id} className="panel-mini">
                    <div className="text-xs text-white/50 uppercase tracking-[.08em]">
                      {item.author}
                    </div>
                    <div className="text-sm text-white/80 mt-1">{item.text}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-[1fr_auto] gap-2">
              <input
                className="tron-input"
                placeholder="Escribe una nota o mensaje rápido..."
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendChat();
                }}
              />
              <button className="tron-btn tron-primary font-semibold" onClick={handleSendChat}>
                ➤ Enviar
              </button>
            </div>
          </div>
        </div>

        <div className="aether-shell">
          <div className="aether-header">
            <div className="aether-title">Acciones de sesión</div>
            <div className="aether-subtitle">Control operativo por rol</div>
          </div>

          <div className="p-4 grid gap-3">
            <div className="aether-mini-metric">
              <div className="aether-mini-label">Rol</div>
              <div className="aether-mini-value">{userRoleLabel(user)}</div>
            </div>

            <div className="aether-mini-metric">
              <div className="aether-mini-label">Estado</div>
              <div className="aether-mini-value">{isReady ? "ACTIVO" : "PREPARANDO"}</div>
            </div>

            <button className="tron-btn tron-muted py-3 md:py-4 font-semibold" onClick={() => nav(getBackRoute(user))}>
              ⬅️ Volver al panel
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