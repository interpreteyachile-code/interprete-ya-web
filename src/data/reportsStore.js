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

// demo hash (no cripto real, solo presentación)
function makeHash() {
  return (
    "iy_" +
    Math.random().toString(16).slice(2) +
    "_" +
    Date.now().toString(16)
  ).toUpperCase();
}

export function createReport(payload) {
  const items = load();

  const report = {
    id: crypto.randomUUID(),
    createdAt: Date.now(),

    // quién reporta
    createdById: payload.createdById,
    createdByName: payload.createdByName,
    createdByRut: payload.createdByRut || null,

    // contenido
    title: payload.title || "Reporte",
    category: payload.category || "barrera", // barrera | discriminacion | servicio | otro
    zone: payload.zone || "all", // norte | centro | sur | all
    locationText: payload.locationText || "", // demo (sin gps)
    description: payload.description || "",
    evidenceText: payload.evidenceText || "",

    // “validez demo”
    hash: makeHash(),

    // estado
    status: "pending", // pending | accepted | rejected | resolved
    managerNote: "",
    updatedAt: null,
  };

  items.unshift(report);
  save(items);
  return report;
}

export function listReports() {
  return load();
}

export function findReport(id) {
  return load().find((x) => x.id === id);
}

export function updateReport(id, patch) {
  const items = load();
  const idx = items.findIndex((x) => x.id === id);
  if (idx === -1) throw new Error("No existe");

  items[idx] = {
    ...items[idx],
    ...patch,
    updatedAt: Date.now(),
  };
  save(items);
  return items[idx];
}
