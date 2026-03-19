import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listUsers } from "../data/demoStore";
import { getInterpreterRating } from "../data/ratingsStore";

function Chip({ children }) {
  return <span className="tron-chip">{children}</span>;
}

function specialtyLabel(s) {
  return s === "salud"
    ? "🏥 Salud"
    : s === "educacion"
    ? "🏫 Educación"
    : s === "legal"
    ? "⚖️ Legal"
    : s === "empresa"
    ? "🏢 Empresa"
    : "🧩 General";
}

export default function InterpretesDisponibles() {
  const nav = useNavigate();
  const [interpretes, setInterpretes] = useState([]);

  useEffect(() => {
    const users = listUsers();

    const activos = users
      .filter(
        (u) => u.profileType === "interpreter" && u.status === "active"
      )
      .map((u) => {
        const rating = getInterpreterRating(u.id);

        return {
          ...u,
          ratingAvg: rating.avg,
          ratingTotal: rating.total,
        };
      });

    setInterpretes(activos);
  }, []);

  return (
    <div className="max-w-5xl mx-auto grid gap-4">
      <div className="tron-card p-6">
        <div className="text-2xl font-semibold h-title">
          👩‍💼 Intérpretes disponibles
        </div>

        <div className="text-white/70 mt-2">
          Profesionales activos para Lengua de Señas Chilena.
        </div>
      </div>

      {interpretes.length === 0 && (
        <div className="tron-card p-6 text-white/60">
          No hay intérpretes disponibles por ahora.
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-3">
        {interpretes.map((i) => (
          <div key={i.id} className="tron-card p-5">
            <div className="flex justify-between items-start gap-3">
              <div>
                <div className="font-semibold text-lg">
                  👩‍💼 {i.fullName}
                </div>

                <div className="text-sm text-white/60 mt-1">
                  Intérprete LSCh
                </div>
              </div>

              <Chip>🟢 Disponible</Chip>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Chip>
                ⭐ {i.ratingAvg} ({i.ratingTotal})
              </Chip>

              <Chip>
                {specialtyLabel(i.interpreterProfile?.specialty)}
              </Chip>
            </div>

            {i.interpreterProfile?.certification && (
              <div className="text-sm text-white/70 mt-3">
                📜 Certificación: <b>{i.interpreterProfile.certification}</b>
              </div>
            )}

            <div className="text-sm text-white/70 mt-1">
              🕒 Experiencia:{" "}
              <b>{i.interpreterProfile?.years ?? 0} años</b>
            </div>

            {i.interpreterProfile?.note && (
              <div className="text-sm text-white/60 mt-2">
                📝 {i.interpreterProfile.note}
              </div>
            )}

            <div className="mt-4 grid gap-2">
              <button
                className="tron-btn tron-primary w-full py-3 font-semibold"
                onClick={() => nav("/solicitud")}
              >
                🤟 Solicitar intérprete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}