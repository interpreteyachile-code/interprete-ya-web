import { Outlet } from "react-router-dom";
import { useState } from "react";
import DesktopNavbar from "../components/DesktopNavbar";
import MobileNavbar from "../components/MobileNavbar";

export default function AppShell() {

  // filtros globales de la app
  const [filters, setFilters] = useState({
    mode: "now",      // now | schedule | video
    service: "all",   // tramite | reunion | evento
    zone: "all"       // norte | centro | sur
  });

  return (
    <div className="min-h-screen bg-black">

      {/* Navbar Desktop */}
      <DesktopNavbar
        filters={filters}
        setFilters={setFilters}
      />

      {/* Navbar Mobile */}
      <MobileNavbar
        filters={filters}
        setFilters={setFilters}
      />

      {/* Contenido */}
      <main className="max-w-6xl mx-auto px-4 py-6">

        <Outlet
          context={{
            filters,
            setFilters
          }}
        />

      </main>

    </div>
  );
}