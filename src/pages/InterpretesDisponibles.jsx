import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listUsers } from "../data/demoStore";

function Chip({ children }) {
  return <span className="tron-chip">{children}</span>;
}

export default function InterpretesDisponibles() {

  const nav = useNavigate();
  const [interpretes, setInterpretes] = useState([]);

  useEffect(() => {

    const users = listUsers();

    const activos = users.filter(
      (u) =>
        u.profileType === "interpreter" &&
        u.status === "active"
    );

    setInterpretes(activos);

  }, []);

  return (
    <div className="max-w-5xl mx-auto grid gap-4">

      <div className="tron-card p-6">
        <div className="text-2xl font-semibold">
          👩‍💼 Intérpretes disponibles
        </div>

        <div className="text-white/70 mt-2">
          Profesionales disponibles para Lengua de Señas Chilena
        </div>
      </div>

      {interpretes.length === 0 && (
        <div className="tron-card p-6 text-white/60">
          No hay intérpretes disponibles ahora
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-3">

        {interpretes.map((i) => (

          <div key={i.id} className="tron-card p-5">

            <div className="flex justify-between items-center">

              <div>
                <div className="font-semibold text-lg">
                  👩‍💼 {i.fullName}
                </div>

                <div className="text-sm text-white/60">
                  Intérprete LSCh
                </div>
              </div>

              <Chip>🟢 Disponible</Chip>

            </div>

            <div className="mt-3">

              <button
                className="tron-btn tron-primary w-full"
              onClick={() => nav("/interprete/" + i.id)}
              >
                Solicitar intérprete
              </button>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}