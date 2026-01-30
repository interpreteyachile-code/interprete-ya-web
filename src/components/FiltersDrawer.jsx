export default function FiltersDrawer({
  open,
  onClose,
  filters,
  setFilters,
}) {
  if (!open) return null;

  const set = (patch) => setFilters((f) => ({ ...f, ...patch }));

  return (
    <div className="fixed inset-0 z-50">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* panel */}
      <div className="absolute right-0 top-0 h-full w-[92%] max-w-sm tron-card p-5 overflow-y-auto">
        <div className="flex items-center justify-between gap-3">
          <div className="text-lg font-semibold">🎛️ Filtros</div>
          <button className="tron-btn px-3 py-2" onClick={onClose}>
            ✖️
          </button>
        </div>

        <div className="mt-3 glow-line" />

        <div className="mt-4 grid gap-4">
          {/* Búsqueda */}
          <div className="grid gap-2">
            <div className="text-sm font-semibold">🔎 Buscar</div>
            <input
              className="tron-btn"
              placeholder="Ej: salud, entrevista, reunión..."
              value={filters.q}
              onChange={(e) => set({ q: e.target.value })}
            />
          </div>

          {/* Tipo */}
          <div className="grid gap-2">
            <div className="text-sm font-semibold">🧩 Tipo</div>
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                className={"tron-btn " + (filters.type === "all" ? "border-cyan-300/60" : "")}
                onClick={() => set({ type: "all" })}
              >
                🌐 Todos
              </button>
              <button
                type="button"
                className={"tron-btn " + (filters.type === "now" ? "border-cyan-300/60" : "")}
                onClick={() => set({ type: "now" })}
              >
                ⚡ Ahora
              </button>
              <button
                type="button"
                className={"tron-btn " + (filters.type === "schedule" ? "border-cyan-300/60" : "")}
                onClick={() => set({ type: "schedule" })}
              >
                📅 Agenda
              </button>
              <button
                type="button"
                className={"tron-btn " + (filters.type === "video" ? "border-cyan-300/60" : "")}
                onClick={() => set({ type: "video" })}
              >
                🎥 Video
              </button>
            </div>
          </div>

          {/* Perfil */}
          <div className="grid gap-2">
            <div className="text-sm font-semibold">👤 Perfil</div>
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                className={"tron-btn " + (filters.profile === "all" ? "border-cyan-300/60" : "")}
                onClick={() => set({ profile: "all" })}
              >
                🌐 Todos
              </button>
              <button
                type="button"
                className={"tron-btn " + (filters.profile === "user" ? "border-cyan-300/60" : "")}
                onClick={() => set({ profile: "user" })}
              >
                🧏‍♀️ Usuario
              </button>
              <button
                type="button"
                className={"tron-btn " + (filters.profile === "interpreter" ? "border-cyan-300/60" : "")}
                onClick={() => set({ profile: "interpreter" })}
              >
                🧑‍💼 Intérprete
              </button>
            </div>
          </div>

          {/* Quick toggles */}
          <div className="grid gap-2">
            <div className="text-sm font-semibold">⚙️ Opciones</div>
            <label className="tron-card p-4 flex items-center justify-between gap-3">
              <span className="text-sm text-white/80">✅ Solo verificados</span>
              <input
                type="checkbox"
                checked={filters.verified}
                onChange={(e) => set({ verified: e.target.checked })}
              />
            </label>

            <label className="tron-card p-4 flex items-center justify-between gap-3">
              <span className="text-sm text-white/80">⭐ Alta reputación</span>
              <input
                type="checkbox"
                checked={filters.top}
                onChange={(e) => set({ top: e.target.checked })}
              />
            </label>
          </div>

          {/* Actions */}
          <div className="grid gap-2">
            <button
              type="button"
              className="tron-btn text-center font-semibold"
              onClick={onClose}
            >
              ✅ Aplicar
            </button>

            <button
              type="button"
              className="tron-btn text-center"
              onClick={() =>
                setFilters({ q: "", type: "all", profile: "all", verified: false, top: false })
              }
            >
              ♻️ Limpiar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
