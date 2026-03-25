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
          <button
            className="tron-btn px-4 py-2 absolute right-4 top-4"
            onClick={onClose}
          >
            ✖
          </button>
          {children}
        </div>
      </div>
    </div>
  );
}

function labelZone(z) {
  return z === "norte"
    ? "🌵 Norte"
    : z === "centro"
    ? "🏙️ Centro"
    : z === "sur"
    ? "🌲 Sur"
    : "📍 Todas";
}

function labelCat(c) {
  return c === "barrera"
    ? "🚫 Barrera comunicacional"
    : c === "discriminacion"
    ? "⚠️ Discriminación"
    : c === "servicio"
    ? "🧾 Servicio / atención"
    : "📝 Otro";
}

function escapeHtml(s) {
  return (s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export default function Denuncias() {
  const { user } = useAuth();
  const outlet = useOutletContext() || {};
  const filters = outlet.filters || { zone: "all" };

  const canManage = user?.role === "manager";
  const isLogged = !!user;
  const isInterpreter = user?.profileType === "interpreter";

  // FORM
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("barrera");
  const [zone, setZone] = useState(filters.zone || "all");
  const [locationText, setLocationText] = useState("");
  const [description, setDescription] = useState("");
  const [evidenceText, setEvidenceText] = useState("");
  const [evidenceImages, setEvidenceImages] = useState([]);

  // LISTA
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [managerNote, setManagerNote] = useState("");
  const [tick, setTick] = useState(0);

  const allLive = useMemo(() => {
    void tick;
    return listReports();
  }, [tick]);

  const MAX_IMAGES = 4;
  const MAX_MB = 2;

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  async function onPickImages(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";

    if (!files.length) return;

    const remain = Math.max(0, MAX_IMAGES - evidenceImages.length);
    const take = files.slice(0, remain);

    const out = [];
    for (const f of take) {
      const mb = f.size / (1024 * 1024);

      if (mb > MAX_MB) {
        alert(`La imagen "${f.name}" supera ${MAX_MB}MB.`);
        continue;
      }

      const b64 = await fileToBase64(f);
      out.push(b64);
    }

    setEvidenceImages((prev) => [...prev, ...out].slice(0, MAX_IMAGES));
  }

  function removeImage(idx) {
    setEvidenceImages((prev) => prev.filter((_, i) => i !== idx));
  }

  function printReportAsPDF(r) {
    const w = window.open("", "_blank");
    if (!w) {
      alert("Bloqueado por el navegador. Permite pop-ups para exportar.");
      return;
    }

    const cat = labelCat(r.category);
    const zon = labelZone(r.zone);
    const st =
      r.status === "pending"
        ? "Pendiente"
        : r.status === "accepted"
        ? "Aceptado"
        : r.status === "resolved"
        ? "Resuelto"
        : "Rechazado";

    const imagesHtml = (r.evidenceImages || [])
      .map(
        (src) => `
        <div class="imgbox">
          <img src="${src}" />
        </div>
      `
      )
      .join("");

    w.document.write(`
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Reporte InterpreteYa</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color:#0b1220; }
            h1 { margin: 0 0 8px; }
            .meta { color:#334155; margin-bottom: 12px; font-size: 12px; }
            .chip { display:inline-block; padding:6px 10px; border:1px solid #cbd5e1; border-radius:999px; margin-right:6px; font-size:12px; }
            .card { border:1px solid #cbd5e1; border-radius:12px; padding:14px; margin-top:12px; }
            .row { margin:6px 0; }
            .label { font-weight:700; }
            .imgs { display:flex; flex-wrap:wrap; gap:10px; margin-top:10px; }
            .imgbox { border:1px solid #cbd5e1; border-radius:12px; padding:6px; }
            img { width:220px; height:160px; object-fit:cover; border-radius:10px; }
            @media print { img { width:180px; height:130px; } }
          </style>
        </head>
        <body>
          <h1>InterpreteYa • Denuncia / Reporte</h1>
          <div class="meta">Generado: ${new Date().toLocaleString("es-CL")}</div>

          <div>
            <span class="chip">${escapeHtml(cat)}</span>
            <span class="chip">${escapeHtml(zon)}</span>
            <span class="chip">Estado: ${escapeHtml(st)}</span>
            <span class="chip">Hash: ${escapeHtml(r.hash)}</span>
            <span class="chip">Fecha: ${escapeHtml(
              new Date(r.createdAt).toLocaleString("es-CL")
            )}</span>
          </div>

          <div class="card">
            <div class="row"><span class="label">Título:</span> ${escapeHtml(r.title || "Reporte")}</div>
            <div class="row"><span class="label">Ubicación:</span> ${escapeHtml(r.locationText || "—")}</div>
            <div class="row"><span class="label">Descripción:</span><br/>${escapeHtml(r.description || "—").replaceAll("\n", "<br/>")}</div>
            <div class="row" style="margin-top:10px;"><span class="label">Evidencia:</span><br/>${escapeHtml(r.evidenceText || "—").replaceAll("\n", "<br/>")}</div>
            <div class="row" style="margin-top:10px;"><span class="label">Reportado por:</span> ${escapeHtml(r.createdByName || "")} ${r.createdByRut ? "• " + escapeHtml(r.createdByRut) : ""}</div>

            ${
              (r.evidenceImages || []).length
                ? `<div class="row" style="margin-top:12px;"><span class="label">Fotos:</span>
                     <div class="imgs">${imagesHtml}</div>
                   </div>`
                : ""
            }
          </div>

          <script>
            window.onload = () => { window.print(); };
          </script>
        </body>
      </html>
    `);

    w.document.close();
  }

  const visibleReports = useMemo(() => {
    const query = (q || "").trim().toLowerCase();
    let data = allLive;

    if (!canManage) {
      data = data.filter((r) => r.createdById === user?.id);
    }

    if (statusFilter !== "all") {
      data = data.filter((r) => r.status === statusFilter);
    }

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

    return [...data].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [allLive, q, statusFilter, canManage, user?.id]);

  const counts = useMemo(() => {
    const base = canManage
      ? allLive
      : allLive.filter((r) => r.createdById === user?.id);

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
    setEvidenceImages([]);
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
      evidenceImages,
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

  // ✅ bloqueo después de hooks
  if (isLogged && !canManage && isInterpreter) {
    return (
      <div className="tron-card p-6 max-w-xl mx-auto">
        🔒 Este módulo está disponible solo para usuarios y gerente.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="tron-card p-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="text-2xl font-semibold h-title">
              ⚖️ Denuncias / Reportes
            </div>

            <div className="text-white/70 mt-2">
              Motor de cambio: evidencia → proyectos → defensa LSCh.
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
                {canManage
                  ? "🧑‍💼 Gerente"
                  : user.profileType === "interpreter"
                  ? "🧑‍💼 Intérprete"
                  : "🧏‍♀️ Usuario"}
              </div>
            </div>
          )}
        </div>
      </div>

      {!user ? (
        <div className="tron-card p-6 max-w-xl mx-auto">
          🔒 Debes iniciar sesión para crear denuncias.
        </div>
      ) : (
        <div className="tron-card p-6">
          <div className="font-semibold">📝 Crear reporte</div>
          <div className="text-sm text-white/70 mt-1">
            Guarda fecha, zona, hash demo y evidencia.
          </div>

          <div className="mt-4 grid md:grid-cols-2 gap-2">
            <div>
              <label className="text-sm text-white/70">Título (opcional)</label>
              <input
                className="tron-input w-full mt-1"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Falta intérprete en..."
              />
            </div>

            <div>
              <label className="text-sm text-white/70">Categoría</label>
              <select
                className="tron-select w-full mt-1"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="barrera">🚫 Barrera comunicacional</option>
                <option value="discriminacion">⚠️ Discriminación</option>
                <option value="servicio">🧾 Servicio / atención</option>
                <option value="otro">📝 Otro</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-white/70">Zona</label>
              <select
                className="tron-select w-full mt-1"
                value={zone}
                onChange={(e) => setZone(e.target.value)}
              >
                <option value="all">📍 Todas</option>
                <option value="norte">🌵 Norte</option>
                <option value="centro">🏙️ Centro</option>
                <option value="sur">🌲 Sur</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-white/70">Ubicación (texto)</label>
              <input
                className="tron-input w-full mt-1"
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                placeholder="Ej: Metro Laguna Sur"
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="text-sm text-white/70">Descripción</label>
            <textarea
              className="tron-input w-full mt-1 min-h-[90px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el problema..."
            />
          </div>

          <div className="mt-3">
            <label className="text-sm text-white/70">Evidencia (texto)</label>
            <textarea
              className="tron-input w-full mt-1 min-h-[70px]"
              value={evidenceText}
              onChange={(e) => setEvidenceText(e.target.value)}
              placeholder="Ej: fecha, testigos, detalle..."
            />
          </div>

          <div className="mt-3">
            <label className="text-sm text-white/70">
              📷 Adjuntar fotos (opcional)
            </label>

            <input
              type="file"
              accept="image/*"
              multiple
              className="tron-input w-full mt-1"
              onChange={onPickImages}
            />

            <div className="text-xs text-white/55 mt-1">
              Máx {MAX_IMAGES} imágenes • hasta {MAX_MB}MB c/u.
            </div>

            {evidenceImages.length > 0 && (
              <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                {evidenceImages.map((src, idx) => (
                  <div key={idx} className="tron-card p-2 relative">
                    <img
                      src={src}
                      alt={`evidencia-${idx}`}
                      className="w-full h-24 object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      className="tron-btn px-2 py-1 absolute right-2 top-2"
                      onClick={() => removeImage(idx)}
                    >
                      ✖
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            className="tron-btn tron-primary w-full mt-4 py-3 font-semibold"
            onClick={submit}
          >
            ✅ Guardar reporte
          </button>
        </div>
      )}

      <div className="tron-card p-6">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="font-semibold">📚 Reportes</div>
          <div className="text-xs text-white/60">
            {canManage
              ? "Vista gerente (todos)"
              : "Vista usuario (solo los tuyos)"}
          </div>
        </div>

        <div className="mt-3 grid md:grid-cols-3 gap-2">
          <input
            className="tron-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="🔎 Buscar: texto / ubicación / hash"
          />

          <select
            className="tron-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
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
          <div className="mt-4 text-white/70">
            No hay reportes con esos filtros.
          </div>
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
                      🕒 {new Date(r.createdAt).toLocaleString("es-CL")} • 🔒 {r.hash}
                    </div>
                  </div>

                  <StatusChip status={r.status} />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

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
                  <Chip>🕒 {new Date(selected.createdAt).toLocaleString("es-CL")}</Chip>
                </div>

                <button
                  className="tron-btn tron-primary w-full mt-3 py-3 font-semibold"
                  onClick={() => printReportAsPDF(selected)}
                >
                  🧾 Exportar / Guardar como PDF
                </button>
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
                <div className="text-white/75 mt-1">
                  {selected.description || "—"}
                </div>
              </div>

              <div className="text-sm text-white/75 mt-3">
                <b>📎 Evidencia:</b>
                <div className="text-white/75 mt-1">
                  {selected.evidenceText || "—"}
                </div>
              </div>

              {(selected.evidenceImages || []).length > 0 && (
                <div className="text-sm text-white/75 mt-3">
                  <b>📷 Fotos:</b>
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                    {selected.evidenceImages.map((src, idx) => (
                      <a
                        key={idx}
                        href={src}
                        target="_blank"
                        rel="noreferrer"
                        className="tron-card p-2"
                      >
                        <img
                          src={src}
                          alt={`img-${idx}`}
                          className="w-full h-24 object-cover rounded-xl"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-xs text-white/55 mt-3">
                Reportado por: <b>{selected.createdByName}</b>{" "}
                {selected.createdByRut ? `• ${selected.createdByRut}` : ""}
              </div>
            </div>

            {canManage && (
              <div className="mt-4 tron-card p-5">
                <div className="font-semibold">🧑‍💼 Gestión gerente</div>

                <div className="mt-3">
                  <label className="text-sm text-white/70">
                    Nota interna (opcional)
                  </label>
                  <textarea
                    className="tron-input w-full mt-1 min-h-[70px]"
                    value={managerNote}
                    onChange={(e) => setManagerNote(e.target.value)}
                    placeholder="Ej: derivado a proyecto, contacto, etc."
                  />
                  <button
                    className="tron-btn tron-muted w-full mt-2"
                    onClick={() => saveNote(selected.id)}
                  >
                    💾 Guardar nota
                  </button>
                </div>

                <div className="mt-3 grid md:grid-cols-3 gap-2">
                  <button
                    className="tron-btn tron-primary font-semibold py-3"
                    onClick={() => action(selected.id, "accepted")}
                  >
                    ✅ Aceptar
                  </button>

                  <button
                    className="tron-btn font-semibold py-3"
                    onClick={() => action(selected.id, "rejected")}
                  >
                    ⛔ Rechazar
                  </button>

                  <button
                    className="tron-btn tron-muted font-semibold py-3"
                    onClick={() => action(selected.id, "resolved")}
                  >
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