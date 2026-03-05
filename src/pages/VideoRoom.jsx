import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";

export default function VideoRoom() {

  const container = useRef(null);
  const { roomId } = useParams();
  const [search] = useSearchParams();
  const nav = useNavigate();

  // minutos pagados (por defecto 30)
  const durationMinutes = Number(search.get("minutes") || 30);

  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);

  useEffect(() => {

    const domain = "meet.jit.si";

    const options = {
      roomName: "interpreteya-" + roomId,
      parentNode: container.current,
      width: "100%",
      height: 600,

      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false
      },

      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_BRAND_WATERMARK: false
      }
    };

    const api = new window.JitsiMeetExternalAPI(domain, options);

    return () => api.dispose();

  }, [roomId]);

  // contador de tiempo
  useEffect(() => {

    const timer = setInterval(() => {

      setSecondsLeft((s) => {

        if (s <= 1) {

          clearInterval(timer);

          alert("⏱ Tiempo finalizado");

          // ir a evaluación del servicio
          nav(`/calificar/${roomId}`);

          return 0;
        }

        return s - 1;

      });

    }, 1000);

    return () => clearInterval(timer);

  }, [roomId, nav]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (

    <div className="max-w-5xl mx-auto grid gap-4">

      <div className="tron-card p-6 flex items-center justify-between">

        <div>
          <div className="text-2xl font-semibold">
            🎥 Videollamada InterpreteYa
          </div>

          <div className="text-white/70 mt-1">
            Comunicación en Lengua de Señas Chilena
          </div>
        </div>

        <div className="tron-chip text-lg font-semibold">

          ⏱ {minutes}:{seconds.toString().padStart(2,"0")}

        </div>

      </div>

      <div
        ref={container}
        className="tron-card p-2"
      />

    </div>

  );
}