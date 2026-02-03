import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { createReport, listReports, updateReport } from "../data/reportsStore";



function Chip({ children }) {
  return <span className="tron-chip">{children}</span>;
}

function StatusChip({ status }) {
  const label =
    status === "pending"
      ? "⏳ Pendiente"
      : status === "accepted"
      ? "✅ Aceptado"
      : status === "resolved"
      ? "🛡️ Resuelto"
      : "⛔ Rechazado";
  return <span className="tron-chip">{label}</span>;
}

function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="w-full max-w-3xl tron-card p-6 relative">
          <button className="tron-btn px-4 py-2 absolute right-4 top-4" onClick={onClose}>
            ✖
          </button>
          {children}
        </div>
      </div>
    </div>
  );
}

function labelZone(z) {
  return z === "norte" ? "🌵 Norte" : z === "centro" ? "🏙️ Centro" : z === "sur" ? "🌲 Sur" : "📍 Todas";
}

function labelCat(c) {
  return c === "barrera"
    ? "🚫 Barrera comunicacional"
    : c === "discriminacion"
    ? "⚠️ Discriminación"
    : c === "servicio"
    ? "🧾 Servicio/atención"
    : "📝 Otro";
}

export default function Denuncias() {
  const { user } = useAuth();
  const outlet = useOutletContext() || {};
  const filters = outlet.filters || { mode: "now", service: "all", zone: "all" };

  // crear denuncia
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("barrera");
  const [zone, setZone] = useState(filters.zone || "all");
  const [locationText, setLocationText] = useState("");
  const [description, setDescription] = useState("");
  const [evidenceText, setEvidenceText] = useState("");

  // filtros lista
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | pending | accepted | rejected | resolved

  // modal detalle
  const [selected, setSelected] = useState(null);
  const [managerNote, setManagerNote] = useState("");



  // refresco simple
  const [tick, setTick] = useState(0);
  const allLive = useMemo(() => listReports(), [tick]);

  const canManage = user?.role === "manager";
  const isLogged = !!user;

  // lo que ve cada uno
  const visibleReports = useMemo(() => {
    const query = (q || "").trim().toLowerCase();

    let data = allLive;

    // clientes ven solo lo suyo (gerente ve todo)
    if (!canManage) {
      data = data.filter((r) => r.createdById === user?.id);
    }

    // status filter
    if (statusFilter !== "all") {
      data = data.filter((r) => r.status === statusFilter);
    }

    // search
    if (query) {
      data = data.filter((r) => {
        return (
          (r.title || "").toLowerCase().includes(query) ||
          (r.description || "").toLowerCase().includes(query) ||
          (r.locationText || "").toLowerCase().includes(query) ||
          (r.hash || "").toLowerCase().includes(query)
        );
      });
    }

    // sort
    data = [...data].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return data;
  }, [allLive, q, statusFilter, canManage, user?.id]);

  const counts = useMemo(() => {
    const base = canManage ? allLive : allLive.filter((r) => r.createdById === user?.id);
    return {
      pending: base.filter((x) => x.status === "pending").length,
      accepted: base.filter((x) => x.status === "accepted").length,
      rejected: base.filter((x) => x.status === "rejected").length,
      resolved: base.filter((x) => x.status === "resolved").length,
    };
  }, [allLive, canManage, user?.id]);

  const resetForm = () => {
    setTitle("");
    setCategory("barrera");
    setZone(filters.zone || "all");
    setLocationText("");
    setDescription("");
    setEvidenceText("");
  };

  const submit = () => {
    if (!isLogged) return alert("Debes iniciar sesión.");

    if (!description.trim()) return alert("Escribe una descripción.");
    const rep = createReport({
      createdById: user.id,
      createdByName: user.fullName,
      createdByRut: user.rut,
      title: title.trim() || "Reporte",
      category,
      zone,
      locationText: locationText.trim(),
      description: description.trim(),
      evidenceText: evidenceText.trim(),
    });

    resetForm();
    setTick((x) => x + 1);
    setSelected(rep);
    setManagerNote(rep.managerNote || "");
  };

  const openDetail = (r) => {
    setSelected(r);
    setManagerNote(r.managerNote || "");
  };

  const action = (id, status) => {
    updateReport(id, { status, managerNote });
    setTick((x) => x + 1);
    setSelected((s) => (s && s.id === id ? { ...s, status, managerNote } : s));
  };

  const saveNote = (id) => {
    updateReport(id, { managerNote });
    setTick((x) => x + 1);
    setSelected((s) => (s && s.id === id ? { ...s, managerNote } : s));
  };

  return (
    <div className="grid gap-4">
      {/* HEADER */}
      <div className="tron-card p-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="text-2xl font-semibold h-title">⚖️ Denuncias / Reportes</div>
            <div className="text-white/70 mt-2">
              Motor de cambio: evidencia → proyectos → defensa LSCh (demo funcional).
            </div>

            <div className="mt-4 flex gap-2 flex-wrap">
              <Chip>⏳ {counts.pending}</Chip>
              <Chip>✅ {counts.accepted}</Chip>
              <Chip>⛔ {counts.rejected}</Chip>
              <Chip>🛡️ {counts.resolved}</Chip>
            </div>
          </div>

          {user && (
            <div className="tron-card p-4">
              <div className="text-xs text-white/60">Sesión</div>
              <div className="text-sm font-semibold">{user.fullName}</div>
              <div className="text-xs text-white/55 mt-1">
                {canManage ? "🧑‍💼 Gerente" : user.profileType === "interpreter" ? "🧑‍💼 Intérprete" : "🧏‍♀️ Usuario"}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CREAR (solo con sesión) */}
      {!user ? (
        <div className="tron-card p-6 max-w-xl mx-auto">
          🔒 Debes iniciar sesión para crear denuncias.
        </div>
      ) : (
        <div className="tron-card p-6">
          <div className="font-semibold">📝 Crear reporte</div>
          <div className="text-sm text-white/70 mt-1">
            Guarda fecha/hora, zona y un hash demo para presentación.
          </div>

          <div className="mt-4 grid md:grid-cols-2 gap-2">
            <div>
              <label className="text-sm text-white/70">Título (opcional)</label>
              <input className="tron-input w-full mt-1" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Falta intérprete en..." />
            </div>

            <div>
              <label className="text-sm text-white/70">Categoría</label>
              <select className="tron-select w-full mt-1" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="barrera">🚫 Barrera comunicacional</option>
                <option value="discriminacion">⚠️ Discriminación</option>
                <option value="servicio">🧾 Servicio/atención</option>
                <option value="otro">📝 Otro</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-white/70">Zona</label>
              <select className="tron-select w-full mt-1" value={zone} onChange={(e) => setZone(e.target.value)}>
                <option value="all">📍 Todas</option>
                <option value="norte">🌵 Norte</option>
                <option value="centro">🏙️ Centro</option>
                <option value="sur">🌲 Sur</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-white/70">Ubicación (texto)</label>
              <input className="tron-input w-full mt-1" value={locationText} onChange={(e) => setLocationText(e.target.value)} placeholder="Ej: Metro Laguna Sur" />
            </div>
          </div>

          <div className="mt-3">
            <label className="text-sm text-white/70">Descripción</label>
            <textarea className="tron-input w-full mt-1 min-h-[90px]" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe el problema..." />
          </div>

          <div className="mt-3">
            <label className="text-sm text-white/70">Evidencia (texto)</label>
            <textarea className="tron-input w-full mt-1 min-h-[70px]" value={evidenceText} onChange={(e) => setEvidenceText(e.target.value)} placeholder="Ej: fecha, testigos, detalle..." />
          </div>

          <button className="tron-btn tron-primary w-full mt-4 py-3 font-semibold" onClick={submit}>
            ✅ Guardar reporte
          </button>
        </div>
      )}

      {/* LISTA + FILTROS */}
      <div className="tron-card p-6">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="font-semibold">📚 Reportes</div>
          <div className="text-xs text-white/60">
            {canManage ? "Vista gerente (todo)" : "Vista usuario (solo los tuyos)"}
          </div>
        </div>

        <div className="mt-3 grid md:grid-cols-3 gap-2">
          <input
            className="tron-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="🔎 Buscar: texto / ubicación / hash"
          />

          <select className="tron-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">🧩 Todos</option>
            <option value="pending">⏳ Pendientes</option>
            <option value="accepted">✅ Aceptados</option>
            <option value="rejected">⛔ Rechazados</option>
            <option value="resolved">🛡️ Resueltos</option>
          </select>

          <button
            className="tron-btn tron-muted font-semibold"
            onClick={() => {
              setQ("");
              setStatusFilter("all");
            }}
          >
            🧹 Limpiar
          </button>
        </div>

        <div className="mt-4 glow-line" />

        {visibleReports.length === 0 ? (
          <div className="mt-4 text-white/70">No hay reportes con esos filtros.</div>
        ) : (
          <div className="mt-4 grid md:grid-cols-2 gap-3">
            {visibleReports.map((r) => (
              <button
                key={r.id}
                className="tron-btn w-full text-left"
                onClick={() => openDetail(r)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">{r.title || "Reporte"}</div>
                    <div className="text-sm text-white/70 mt-1">
                      {labelCat(r.category)} • {labelZone(r.zone)}
                    </div>
                    <div className="text-xs text-white/55 mt-1">
                      🕒 {new Date(r.createdAt).toLocaleString()} • 🔒 {r.hash}
                    </div>
                  </div>
                  <StatusChip status={r.status} />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* MODAL DETALLE */}
      <Modal open={!!selected} onClose={() => setSelected(null)}>
        {!selected ? null : (
          <div>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="text-2xl font-semibold h-title">📌 Detalle</div>
                <div className="text-sm text-white/70 mt-1">
                  {labelCat(selected.category)} • {labelZone(selected.zone)}
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  <StatusChip status={selected.status} />
                  <Chip>🔒 {selected.hash}</Chip>
                  <Chip>🕒 {new Date(selected.createdAt).toLocaleString()}</Chip>
                </div>
              </div>
            </div>

            <div className="mt-4 glow-line" />

            <div className="mt-4 tron-card p-5">
              <div className="font-semibold">{selected.title || "Reporte"}</div>

              <div className="text-sm text-white/75 mt-2">
                <b>📍 Ubicación:</b> {selected.locationText || "—"}
              </div>

              <div className="text-sm text-white/75 mt-2">
                <b>📝 Descripción:</b>
                <div className="text-white/75 mt-1">{selected.description || "—"}</div>
              </div>

              <div className="text-sm text-white/75 mt-3">
                <b>📎 Evidencia:</b>
                <div className="text-white/75 mt-1">{selected.evidenceText || "—"}</div>
              </div>

              <div className="text-xs text-white/55 mt-3">
                Reportado por: <b>{selected.createdByName}</b> {selected.createdByRut ? `• ${selected.createdByRut}` : ""}
              </div>
            </div>

            {/* ✅ acciones gerente */}
            {canManage && (
              <div className="mt-4 tron-card p-5">
                <div className="font-semibold">🧑‍💼 Gestión gerente</div>

                <div className="mt-3">
                  <label className="text-sm text-white/70">Nota interna (opcional)</label>
                  <textarea
                    className="tron-input w-full mt-1 min-h-[70px]"
                    value={managerNote}
                    onChange={(e) => setManagerNote(e.target.value)}
                    placeholder="Ej: derivado a proyecto, contacto, etc."
                  />
                  <button className="tron-btn tron-muted w-full mt-2" onClick={() => saveNote(selected.id)}>
                    💾 Guardar nota
                  </button>
                </div>

                <div className="mt-3 grid md:grid-cols-3 gap-2">
                  <button className="tron-btn tron-primary font-semibold py-3" onClick={() => action(selected.id, "accepted")}>
                    ✅ Aceptar
                  </button>
                  <button className="tron-btn font-semibold py-3" onClick={() => action(selected.id, "rejected")}>
                    ⛔ Rechazar
                  </button>
                  <button className="tron-btn tron-muted font-semibold py-3" onClick={() => action(selected.id, "resolved")}>
                    🛡️ Resuelto
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
