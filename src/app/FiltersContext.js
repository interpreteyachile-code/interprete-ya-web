import { createContext, useContext, useMemo, useState } from "react";

const FiltersCtx = createContext(null);

export function FiltersProvider({ children }) {
  const [filters, setFilters] = useState({
    mode: "now",        // now | schedule | video
    service: "all",     // all | tramite | reunion | entrevista | evento
    zone: "all",        // all | norte | centro | sur
    q: "",              // buscador
  });

  const value = useMemo(() => ({ filters, setFilters }), [filters]);
  return <FiltersCtx.Provider value={value}>{children}</FiltersCtx.Provider>;
}

export function useFilters() {
  const ctx = useContext(FiltersCtx);
  if (!ctx) throw new Error("useFilters debe usarse dentro de <FiltersProvider />");
  return ctx;
}
