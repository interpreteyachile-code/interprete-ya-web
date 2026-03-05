import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { listUsers } from "../data/demoStore";

export default function MapaInterpretes() {

  const nav = useNavigate();

  const interpretes = useMemo(() => {

    const users = listUsers();

    return users.filter(
      (u) =>
        u.profileType === "interpreter" &&
        u.status === "active"
    );

  }, []);

  return (
    <div className="max-w-5xl mx-auto grid gap-4">

      <div className="tron-card p-6">
        <div className="text-2xl font-semibold">
          📍 Intérpretes disponibles
        </div>

        <div className="text-white/70 mt-2">
          Lista de intérpretes activos en InterpreteYa
        </div>
      </div>

      {interpretes.length === 0 && (
        <div className="tron-card p-6 text-white/60">
          No hay intérpretes disponibles
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-3">

        {interpretes.map((i) => (

          <div key={i.id} className="tron-card p-5">

            <div className="font-semibold text-lg">
              👩‍💼 {i.fullName}
            </div>

            <div className="text-sm text-white/60 mt-1">
              Intérprete LSCh
            </div>

            <button
              className="tron-btn tron-primary mt-3 w-full"
              onClick={() => nav("/interprete/" + i.id)}
            >
              Ver perfil
            </button>

          </div>

        ))}

      </div>

    </div>
  );
}