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

function clean(v) {
  return (v || "").toString().trim();
}

function makeHash() {
  return (
    "REP-" +
    Math.random().toString(36).slice(2, 8).toUpperCase() +
    "-" +
    Date.now().toString().slice(-6)
  );
}

const VALID_STATUS = ["pending", "accepted", "rejected", "resolved"];
const VALID_CATEGORY = ["barrera", "discriminacion", "servicio", "otro"];
const VALID_ZONE = ["all", "norte", "centro", "sur"];

export function listReports() {
  return load();
}

export function getReport(reportId) {
  return load().find((x) => x.id === reportId) || null;
}

export function createReport(payload) {
  const items = load();

  const category = VALID_CATEGORY.includes(payload.category)
    ? payload.category
    : "otro";

  const zone = VALID_ZONE.includes(payload.zone)
    ? payload.zone
    : "all";

  const status = VALID_STATUS.includes(payload.status)
    ? payload.status
    : "pending";

  const report = {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    updatedAt: null,

    // creador
    createdById: payload.createdById || null,
    createdByName: clean(payload.createdByName) || "Usuario",
    createdByRut: clean(payload.createdByRut),

    // contenido
    title: clean(payload.title) || "Reporte",
    category,
    zone,
    locationText: clean(payload.locationText),
    description: clean(payload.description),
    evidenceText: clean(payload.evidenceText),

    // imágenes / evidencia
    evidenceImages: Array.isArray(payload.evidenceImages)
      ? payload.evidenceImages
      : [],

    // gestión
    status,
    managerNote: clean(payload.managerNote),

    // hash demo
    hash: clean(payload.hash) || makeHash(),
  };

  if (!report.createdById) {
    throw new Error("Falta createdById");
  }

  if (!report.description) {
    throw new Error("Falta descripción");
  }

  items.unshift(report);
  save(items);
  return report;
}

export function updateReport(id, patch) {
  const items = load();
  const idx = items.findIndex((x) => x.id === id);

  if (idx === -1) {
    throw new Error("No existe");
  }

  if (patch.status && !VALID_STATUS.includes(patch.status)) {
    throw new Error("Estado inválido");
  }

  if (patch.category && !VALID_CATEGORY.includes(patch.category)) {
    throw new Error("Categoría inválida");
  }

  if (patch.zone && !VALID_ZONE.includes(patch.zone)) {
    throw new Error("Zona inválida");
  }

  const current = items[idx];

  const next = {
    ...current,
    ...patch,

    title: patch.title !== undefined ? clean(patch.title) : current.title,
    createdByName:
      patch.createdByName !== undefined
        ? clean(patch.createdByName)
        : current.createdByName,
    createdByRut:
      patch.createdByRut !== undefined
        ? clean(patch.createdByRut)
        : current.createdByRut,
    locationText:
      patch.locationText !== undefined
        ? clean(patch.locationText)
        : current.locationText,
    description:
      patch.description !== undefined
        ? clean(patch.description)
        : current.description,
    evidenceText:
      patch.evidenceText !== undefined
        ? clean(patch.evidenceText)
        : current.evidenceText,
    managerNote:
      patch.managerNote !== undefined
        ? clean(patch.managerNote)
        : current.managerNote,
    hash: patch.hash !== undefined ? clean(patch.hash) : current.hash,

    evidenceImages:
      patch.evidenceImages !== undefined
        ? Array.isArray(patch.evidenceImages)
          ? patch.evidenceImages
          : []
        : current.evidenceImages,

    updatedAt: Date.now(),
  };

  items[idx] = next;
  save(items);
  return next;
}

export function deleteReport(id) {
  const items = load().filter((x) => x.id !== id);
  save(items);
  return true;
}