```jsx
import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { listUsers } from "../data/demoStore";
import { getInterpreterRating } from "../data/ratingsStore";

function Chip({ children }) {
  return <span className="tron-chip">{children}</span>;
}

export default function PerfilInterprete() {

  const { id } = useParams();
  const nav = useNavigate();

  const interpreter = useMemo(() => {

    const users = listUsers();
    return users.find((u) => u.id === id);

  }, [id]);

  const rating = useMemo(() => {

    if (!interpreter) return { avg: 0, total: 0 };

    return getInterpreterRating(interpreter.id);

  }, [interpreter]);

  if (!interpreter) {
    return (
      <div className="tron-card p-6 max-w-xl mx-auto">
        Intérprete no encontrado
      </div>
    );
  }

  const ip = interpreter.interpreterProfile || {};

  return (
    <div className="max-w-4xl mx-auto grid gap-4">

      <div className="tron-card p-6">

        <div className="flex items-start justify-between">

          <div>

            <div className="text-2xl font-semibold">
              👩‍💼 {interpreter.fullName}
            </div>

            <div className="text-white/70 mt-1">

              ⭐ {rating.avg} ({rating.total} evaluaciones)

            </div>

          </div>

          <Chip>🟢 Disponible</Chip>

        </div>

      </div>

      <div className="tron-card p-6 grid gap-2">

        <div>
          🏷 Especialidad: <b>{ip.specialty || "General"}</b>
        </div>

        <div>
          📚 Certificación: <b>{ip.certification || "No indicada"}</b>
        </div>

        <div>
          🕒 Experiencia: <b>{ip.years || 0} años</b>
        </div>

      </div>

      <div className="tron-card p-6">

        <button
          className="tron-btn tron-primary w-full py-3 font-semibold"
          onClick={() => nav("/solicitud")}
        >
          Solicitar intérprete
        </button>

      </div>

    </div>
  );
}
```
