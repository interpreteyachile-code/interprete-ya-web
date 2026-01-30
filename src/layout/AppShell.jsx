import { Outlet } from "react-router-dom";
import { useState } from "react";
import DesktopNavbar from "../components/DesktopNavbar";
import MobileNavbar from "../components/MobileNavbar";

export default function AppShell() {
  const [filters, setFilters] = useState({ mode: "now", service: "all", zone: "all" });

  return (
    <div>
      <DesktopNavbar filters={filters} setFilters={setFilters} />
      <MobileNavbar filters={filters} setFilters={setFilters} />

      <main className="max-w-6xl mx-auto px-4 py-6">
        <Outlet context={{ filters, setFilters }} />
      </main>
    </div>
  );
}
