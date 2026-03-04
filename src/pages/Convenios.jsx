import { useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import {
  createConvenio,
  deleteConvenio,
  listConvenios,
  updateConvenio,
} from "../data/conveniosStore";

function Chip({ children }) {
  return <span className="tron-chip">{children}</span>;
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

function labelStatus(s) {
  return s === "prospecto"
    ? "🟡 Prospecto"
    : s === "activo"
    ? "🟢 Activo"
    : s === "pausado"
    ? "🟣 Pausado"
    : "⚫ Cerrado";
}

function labelType(t) {
  return t === "empresa" ? "🏢 Empresa" : "🤝 Organización";
}

function labelCat(c) {
  return c === "inclusion"
    ? "🧩 Inclusión laboral"
    : c === "atencion"
    ? "🧾 Atención accesible"
    : c === "capacitacion"
    ? "🎓 Capacitación LSCh"
    : "✨ Mixto";
}

export default function Convenios() {
  const { user } = useAuth();
  const canManage = user?.role === "manager";
  const isLogged = !!user;

  // refresco simple
  const [tick, setTick] = useState(0);
  const allLive = useMemo(() => {
    void tick;
    return listConvenios();
  }, [tick]);

  // crear
  const [allyType, setAllyType] = useState("empresa");
  const [name, setName] = useState("");
  const [rut, setRut] = useState("");
  const [category, setCategory] = useState("inclusion");
  const [region, setRegion] = useState("RM");
  const [comuna, setComuna] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [notes, setNotes] = useState("");

  // filtros
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | prospecto | activo | pausado | cerrado
  const [typeFilter, setTypeFilter] = useState("all"); // all | empresa | organizacion
  const [catFilter, setCatFilter] = useState("all"); // all | inclusion | atencion | capacitacion | mixto

  // modal
  const [selected, setSelected] = useState(null);
  const [managerNote, setManagerNote] = useState("");

  const visible = useMemo(() => {
    const query = (q || "").trim().toLowerCase();
    let data = allLive;

    if (typeFilter !== "all") data = data.filter((x) => x.allyType === typeFilter);
    if (catFilter !== "all") data = data.filter((x) => x.category === catFilter);
    if (statusFilter !== "all") data = data.filter((x) => x.status === statusFilter);

    if (query) {
      data = data.filter((x) => {
        const blob = `${x.name} ${x.rut} ${x.contactName} ${x.contactEmail} ${x.contactPhone} ${x.region} ${x.comuna} ${x.notes}`.toLowerCase();
        return blob.includes(query);
      });
    }

    return [...data].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [allLive, q, typeFilter, catFilter, statusFilter]);

  const counts = useMemo(() => {
    return {
      prospecto: allLive.filter((x) => x.status === "prospecto").length,
      activo: allLive.filter((x) => x.status === "activo").length,
      pausado: allLive.filter((x) => x.status === "pausado").length,
      cerrado: allLive.filter((x) => x.status === "cerrado").length,
    };
  }, [allLive]);

  const resetForm = () => {
    setAllyType("empresa");
    setName("");
    setRut("");
    setCategory("inclusion");
    setRegion("RM");
    setComuna("");
    setContactName("");
    setContactEmail("");
    setContactPhone("");
    setNotes("");
  };

  const submit = () => {
    if (!isLogged) return alert("Debes iniciar sesión.");
    if (!canManage) return alert("Solo gerente puede crear/editar convenios.");
    if (!name.trim()) return alert("Escribe el nombre del aliado.");

    const c = createConvenio({
      allyType,
      name,
      rut,
      category,
      region,
      comuna,
      contactName,
      contactEmail,
      contactPhone,
      notes,
      status: "prospecto",
    });

    resetForm();
    setTick((x) => x + 1);
    setSelected(c);
    setManagerNote(c.managerNote || "");
  };

  const openDetail = (c) => {
    setSelected(c);
    setManagerNote(c.managerNote || "");
  };

  const setStatus = (id, status) => {
    updateConvenio(id, { status, managerNote });
    setTick((x) => x + 1);
    setSelected((s) => (s && s.id === id ? { ...s, status, managerNote } : s));
  };

  const saveNote = (id) => {
    updateConvenio(id, { managerNote });
    setTick((x) => x + 1);
    setSelected((s) => (s && s.id === id ? { ...s, managerNote } : s));
  };

  const del = (id) => {
    if (!confirm("¿Eliminar convenio?")) return;
    deleteConvenio(id);
    setTick((x) => x + 1);
    setSelected(null);
  };

  return (
    <div className="grid gap-4">
      {/* HEADER */}
      <div className="tron-card p-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="text-2xl font-semibold h-title">🤝 Convenios</div>
            <div className="text-white/70 mt-2">
              Alianzas directas con empresas y organizaciones representativas (sin representar instituciones públicas).
            </div>

            <div className="mt-4 flex gap-2 flex-wrap">
              <Chip>🟡 {counts.prospecto}</Chip>
              <Chip>🟢 {counts.activo}</Chip>
              <Chip>🟣 {counts.pausado}</Chip>
              <Chip>⚫ {counts.cerrado}</Chip>
            </div>
          </div>

          {user && (
            <div className="tron-card p-4">
              <div className="text-xs text-white/60">Sesión</div>
              <div className="text-sm font-semibold">{user.fullName}</div>
              <div className="text-xs text-white/55 mt-1">
                {canManage ? "🧑‍💼 Gerente" : "👤 Usuario"}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CREAR (solo gerente) */}
      {!user ? (
        <div className="tron-card p-6 max-w-xl mx-auto">🔒 Debes iniciar sesión.</div>
      ) : !canManage ? (
        <div className="tron-card p-6 max-w-xl mx-auto">
          🔒 Solo gerente puede crear/editar convenios.
        </div>
      ) : (
        <div className="tron-card p-6">
          <div className="font-semibold">📝 Crear convenio (Gerencia)</div>
          <div className="text-sm text-white/70 mt-1">
            Registra aliado, contacto y tipo de convenio. Queda en prospecto por defecto.
          </div>

          <div className="mt-4 grid md:grid-cols-2 gap-2">
            <div>
              <label className="text-sm text-white/70">Tipo de aliado</label>
              <select className="tron-select w-full mt-1" value={allyType} onChange={(e) => setAllyType(e.target.value)}>
                <option value="empresa">🏢 Empresa</option>
                <option value="organizacion">🤝 Organización</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-white/70">Nombre *</label>
              <input className="tron-input w-full mt-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Empresa X / Federación Y" />
            </div>

            <div>
              <label className="text-sm text-white/70">RUT (opcional)</label>
              <input className="tron-input w-full mt-1" value={rut} onChange={(e) => setRut(e.target.value)} placeholder="Ej: 76.123.456-7" />
            </div>

            <div>
              <label className="text-sm text-white/70">Tipo de convenio</label>
              <select className="tron-select w-full mt-1" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="inclusion">🧩 Inclusión laboral</option>
                <option value="atencion">🧾 Atención accesible</option>
                <option value="capacitacion">🎓 Capacitación LSCh</option>
                <option value="mixto">✨ Mixto</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-white/70">Región</label>
              <input className="tron-input w-full mt-1" value={region} onChange={(e) => setRegion(e.target.value)} placeholder="Ej: RM" />
            </div>

            <div>
              <label className="text-sm text-white/70">Comuna</label>
              <input className="tron-input w-full mt-1" value={comuna} onChange={(e) => setComuna(e.target.value)} placeholder="Ej: Pudahuel" />
            </div>

            <div>
              <label className="text-sm text-white/70">Contacto</label>
              <input className="tron-input w-full mt-1" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Ej: RRHH / Encargado" />
            </div>

            <div>
              <label className="text-sm text-white/70">Email</label>
              <input className="tron-input w-full mt-1" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="correo@empresa.cl" />
            </div>

            <div>
              <label className="text-sm text-white/70">Teléfono</label>
              <input className="tron-input w-full mt-1" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+56 9 ..." />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-white/70">Notas</label>
              <textarea className="tron-input w-full mt-1 min-h-[70px]" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ej: objetivo, alcance, etc." />
            </div>
          </div>

          <button className="tron-btn tron-primary w-full mt-4 py-3 font-semibold" onClick={submit}>
            ✅ Guardar convenio (prospecto)
          </button>
        </div>
      )}

      {/* LISTA + FILTROS */}
      <div className="tron-card p-6">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="font-semibold">📚 Aliados / Convenios</div>
          <div className="text-xs text-white/60">Vista: {canManage ? "Gerencia" : "Solo lectura"}</div>
        </div>

        <div className="mt-3 grid md:grid-cols-4 gap-2">
          <input className="tron-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔎 Buscar (nombre, comuna, contacto)..." />

          <select className="tron-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">🧩 Tipo (todos)</option>
            <option value="empresa">🏢 Empresas</option>
            <option value="organizacion">🤝 Organizaciones</option>
          </select>

          <select className="tron-select" value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
            <option value="all">✨ Convenio (todos)</option>
            <option value="inclusion">🧩 Inclusión</option>
            <option value="atencion">🧾 Atención</option>
            <option value="capacitacion">🎓 Capacitación</option>
            <option value="mixto">✨ Mixto</option>
          </select>

          <select className="tron-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">📍 Estado (todos)</option>
            <option value="prospecto">🟡 Prospecto</option>
            <option value="activo">🟢 Activo</option>
            <option value="pausado">🟣 Pausado</option>
            <option value="cerrado">⚫ Cerrado</option>
          </select>
        </div>

        <div className="mt-4 glow-line" />

        {visible.length === 0 ? (
          <div className="mt-4 text-white/70">No hay convenios con esos filtros.</div>
        ) : (
          <div className="mt-4 grid md:grid-cols-2 gap-3">
            {visible.map((c) => (
              <button key={c.id} className="tron-btn w-full text-left" onClick={() => openDetail(c)}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">{c.name}</div>
                    <div className="text-sm text-white/70 mt-1">
                      {labelType(c.allyType)} • {labelCat(c.category)}
                    </div>
                    <div className="text-xs text-white/55 mt-1">
                      📍 {c.comuna || "—"} • {c.region || "—"} • 🕒 {new Date(c.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <Chip>{labelStatus(c.status)}</Chip>
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
            <div className="text-2xl font-semibold h-title">📌 Detalle convenio</div>

            <div className="flex flex-wrap gap-2 mt-3">
              <Chip>{labelType(selected.allyType)}</Chip>
              <Chip>{labelCat(selected.category)}</Chip>
              <Chip>{labelStatus(selected.status)}</Chip>
              <Chip>🕒 {new Date(selected.createdAt).toLocaleString()}</Chip>
            </div>

            <div className="mt-4 glow-line" />

            <div className="mt-4 tron-card p-5">
              <div className="font-semibold">{selected.name}</div>

              <div className="text-sm text-white/75 mt-2">
                <b>RUT:</b> {selected.rut || "—"}
              </div>

              <div className="text-sm text-white/75 mt-2">
                <b>Ubicación:</b> {selected.comuna || "—"} • {selected.region || "—"}
              </div>

              <div className="text-sm text-white/75 mt-2">
                <b>Contacto:</b> {selected.contactName || "—"}
              </div>

              <div className="text-sm text-white/75 mt-2">
                <b>Email:</b> {selected.contactEmail || "—"}
              </div>

              <div className="text-sm text-white/75 mt-2">
                <b>Teléfono:</b> {selected.contactPhone || "—"}
              </div>

              <div className="text-sm text-white/75 mt-3">
                <b>Notas:</b>
                <div className="text-white/75 mt-1">{selected.notes || "—"}</div>
              </div>
            </div>

            {/* GERENCIA */}
            {canManage && (
              <div className="mt-4 tron-card p-5">
                <div className="font-semibold">🧑‍💼 Gestión gerente</div>

                <div className="mt-3">
                  <label className="text-sm text-white/70">Nota interna</label>
                  <textarea
                    className="tron-input w-full mt-1 min-h-[70px]"
                    value={managerNote}
                    onChange={(e) => setManagerNote(e.target.value)}
                    placeholder="Ej: reunión agendada, propuesta enviada, etc."
                  />
                  <button className="tron-btn tron-muted w-full mt-2" onClick={() => saveNote(selected.id)}>
                    💾 Guardar nota
                  </button>
                </div>

                <div className="mt-3 grid md:grid-cols-4 gap-2">
                  <button className="tron-btn tron-primary font-semibold py-3" onClick={() => setStatus(selected.id, "activo")}>
                    🟢 Activar
                  </button>
                  <button className="tron-btn font-semibold py-3" onClick={() => setStatus(selected.id, "pausado")}>
                    🟣 Pausar
                  </button>
                  <button className="tron-btn tron-muted font-semibold py-3" onClick={() => setStatus(selected.id, "cerrado")}>
                    ⚫ Cerrar
                  </button>
                  <button className="tron-btn font-semibold py-3" onClick={() => del(selected.id)}>
                    🗑️ Eliminar
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