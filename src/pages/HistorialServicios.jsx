import { useMemo } from "react";
import { useAuth } from "../auth/AuthContext";
import { listServices } from "../data/servicesStore";

function Chip({ children }) {
  return <span className="tron-chip">{children}</span>;
}

export default function HistorialServicios() {

  const { user } = useAuth();

  const services = useMemo(() => {

    const all = listServices();

    if (!user) return [];

    if (user.role === "manager") return all;

    if (user.profileType === "interpreter") {
      return all.filter((s) => s.interpreterId === user.id);
    }

    return all.filter((s) => s.clientRut === user.rut);

  }, [user]);

  return (

    <div className="max-w-5xl mx-auto grid gap-4">

      <div className="tron-card p-6">

        <div className="text-2xl font-semibold">
          📜 Historial de Servicios
        </div>

        <div className="text-white/70 mt-2">
          Servicios realizados en InterpreteYa
        </div>

      </div>

      {services.length === 0 && (

        <div className="tron-card p-6 text-white/60">
          Aún no hay servicios registrados
        </div>

      )}

      <div className="grid md:grid-cols-2 gap-3">

        {services.map((s) => (

          <div key={s.id} className="tron-card p-5">

            <div className="flex justify-between">

              <div className="font-semibold">
                🧩 {s.serviceType || "Servicio"}
              </div>

              <Chip>{s.status}</Chip>

            </div>

            <div className="text-sm text-white/70 mt-2">

              📍 Zona: {s.zone || "—"}

            </div>

            <div className="text-sm text-white/70">

              💰 ${Number(s.amountCLP || 0).toLocaleString("es-CL")}

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}