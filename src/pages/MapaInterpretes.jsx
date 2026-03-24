import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { listUsers } from "../data/demoStore";
import { getInterpreterRating } from "../data/ratingsStore";

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

export default function MapaInterpretes() {
  const nav = useNavigate();

  const interpretes = useMemo(() => {
    const users = listUsers ? listUsers() : [];

    return users
      .filter((u) => u?.profileType === "interpreter" && u?.status === "active")
      .map((u) => {
        const rating = getInterpreterRating(u.id);

        return {
          ...u,
          ratingAvg: rating.avg,
          ratingTotal: rating.total,

          // demo: coordenadas simuladas cerca de Santiago
          lat: -33.45 + (Math.random() - 0.5) * 0.05,
          lng: -70.66 + (Math.random() - 0.5) * 0.05,
        };
      });
  }, []);

  return (
    <div className="max-w-6xl mx-auto grid gap-4">
      <div className="tron-card p-6">
        <div className="text-2xl font-semibold h-title">
          📍 Intérpretes cercanos
        </div>

        <div className="text-white/70 mt-2">
          Encuentra intérpretes activos disponibles cerca de ti.
        </div>
      </div>

      {interpretes.length === 0 ? (
        <div className="tron-card p-6 text-white/60">
          No hay intérpretes activos para mostrar en el mapa.
        </div>
      ) : (
        <div className="tron-card p-2">
          <MapContainer
            center={[-33.45, -70.66]}
            zoom={12}
            style={{ height: "600px", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="© OpenStreetMap"
            />

            {interpretes.map((i) => (
              <Marker key={i.id} position={[i.lat, i.lng]}>
                <Popup>
                  <div className="grid gap-2 min-w-[220px]">
                    <div className="font-semibold">
                      👩‍💼 {i.fullName || "Intérprete"}
                    </div>

                    <div className="text-sm">
                      ⭐ <b>{i.ratingAvg}</b> ({i.ratingTotal})
                    </div>

                    <div className="text-sm">
                      {specialtyLabel(i.interpreterProfile?.specialty)}
                    </div>

                    <div className="text-sm">
                      🕒 <b>{i.interpreterProfile?.years ?? 0}</b> años experiencia
                    </div>

                    {i.interpreterProfile?.certification && (
                      <div className="text-sm">
                        📜 {i.interpreterProfile.certification}
                      </div>
                    )}

                    <button
                      className="tron-btn tron-primary"
                      onClick={() => nav("/solicitud")}
                    >
                      🤟 Solicitar intérprete
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}
    </div>
  );
}