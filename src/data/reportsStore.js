const KEY = "iy_reports_v1";

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function save(items) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

// ✅ Hash demo (huella simple). No es legal/cripto, pero sirve para prototipo.
function makeHash(obj) {
  const str = JSON.stringify(obj);
  let h = 2166136261; // FNV-1a base
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ("00000000" + (h >>> 0).toString(16)).slice(-8).toUpperCase();
}

// ✅ Normaliza para evitar undefined
function cleanText(v) {
  return (v || "").toString().trim();
}

export function listReports() {
  return load();
}

export function createReport(payload) {
  const items = load();

  const createdAt = Date.now();

  const report = {
    id: crypto.randomUUID(),
    createdAt,

    createdById: payload.createdById,
    createdByName: cleanText(payload.createdByName) || "Usuario",
    createdByRut: cleanText(payload.createdByRut),

    title: cleanText(payload.title) || "Reporte",
    category: payload.category || "barrera", // barrera | discriminacion | servicio | otro
    zone: payload.zone || "all", // norte | centro | sur | all
    locationText: cleanText(payload.locationText),

    description: cleanText(payload.description),
    evidenceText: cleanText(payload.evidenceText),

    // ✅ NUEVO: fotos evidencia (base64)
    evidenceImages: Array.isArray(payload.evidenceImages) ? payload.evidenceImages : [],

    status: "pending", // pending | accepted | rejected | resolved
    managerNote: "",

    hash: makeHash({
      createdAt,
      createdById: payload.createdById,
      title: cleanText(payload.title) || "Reporte",
      category: payload.category || "barrera",
      zone: payload.zone || "all",
      locationText: cleanText(payload.locationText),
      description: cleanText(payload.description),
      evidenceText: cleanText(payload.evidenceText),
      // no metemos images al hash (pesado)
    }),
  };

  if (!report.createdById) throw new Error("Falta createdById");
  if (!report.description) throw new Error("Falta descripción");

  items.push(report);
  save(items);

  return report;
}

export function updateReport(id, patch) {
  const items = load();
  const idx = items.findIndex((x) => x.id === id);
  if (idx === -1) return null;

  const current = items[idx];
  const allowed = {};

  if (patch.status) {
    const s = patch.status;
    if (!["pending", "accepted", "rejected", "resolved"].includes(s)) {
      throw new Error("Estado inválido");
    }
    allowed.status = s;
  }

  if (typeof patch.managerNote === "string") {
    allowed.managerNote = patch.managerNote;
  }

  // ✅ NUEVO: actualizar imágenes si se envía
  if (Array.isArray(patch.evidenceImages)) {
    allowed.evidenceImages = patch.evidenceImages;
  }

  items[idx] = { ...current, ...allowed, updatedAt: Date.now() };
  save(items);
  return items[idx];
}

