import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { listUsers } from "../data/demoStore";

export default function MapaInterpretes() {

  const nav = useNavigate();

  const interpretes = useMemo(() => {

    const users = listUsers ? listUsers() : [];

    return users
      .filter((u) => u?.profileType === "interpreter" && u?.status === "active")
      .map((u) => ({
        ...u,
        lat: -33.45 + (Math.random() - 0.5) * 0.05,
        lng: -70.66 + (Math.random() - 0.5) * 0.05
      }));

  }, []);

  return (
    <div className="max-w-6xl mx-auto grid gap-4">

      <div className="tron-card p-6">
        <div className="text-2xl font-semibold">
          📍 Intérpretes cercanos
        </div>

        <div className="text-white/70 mt-2">
          Encuentra intérpretes disponibles cerca de ti
        </div>
      </div>

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
            <Marker
              key={i.id || Math.random()}
              position={[i.lat, i.lng]}
            >

              <Popup>

                <div className="grid gap-2">

                  <div className="font-semibold">
                    👩‍💼 {i.fullName || "Intérprete"}
                  </div>

                  <button
                    className="tron-btn tron-primary"
                    onClick={() => nav("/interprete/" + i.id)}
                  >
                    Ver perfil
                  </button>

                </div>

              </Popup>

            </Marker>
          ))}

        </MapContainer>

      </div>

    </div>
  );
}