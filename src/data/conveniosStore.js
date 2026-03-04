const KEY = "iy_convenios_v1";

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

export function listConvenios() {
  return load();
}

export function createConvenio(payload) {
  const items = load();
  const createdAt = Date.now();

  const c = {
    id: crypto.randomUUID(),
    createdAt,

    // tipo de aliado
    allyType: payload.allyType || "empresa", // empresa | organizacion
    name: clean(payload.name),
    rut: clean(payload.rut), // opcional
    contactName: clean(payload.contactName),
    contactEmail: clean(payload.contactEmail),
    contactPhone: clean(payload.contactPhone),

    // info
    category: payload.category || "inclusion", // inclusion | atencion | capacitacion | mixto
    region: clean(payload.region),
    comuna: clean(payload.comuna),
    notes: clean(payload.notes),

    status: payload.status || "prospecto", // prospecto | activo | pausado | cerrado
    managerNote: clean(payload.managerNote || ""),

    updatedAt: null,
  };

  if (!c.name) throw new Error("Falta el nombre del aliado.");
  items.push(c);
  save(items);
  return c;
}

export function updateConvenio(id, patch) {
  const items = load();
  const idx = items.findIndex((x) => x.id === id);
  if (idx === -1) return null;

  const cur = items[idx];

  const next = {
    ...cur,
    ...patch,
    name: patch.name !== undefined ? clean(patch.name) : cur.name,
    rut: patch.rut !== undefined ? clean(patch.rut) : cur.rut,
    contactName: patch.contactName !== undefined ? clean(patch.contactName) : cur.contactName,
    contactEmail: patch.contactEmail !== undefined ? clean(patch.contactEmail) : cur.contactEmail,
    contactPhone: patch.contactPhone !== undefined ? clean(patch.contactPhone) : cur.contactPhone,
    region: patch.region !== undefined ? clean(patch.region) : cur.region,
    comuna: patch.comuna !== undefined ? clean(patch.comuna) : cur.comuna,
    notes: patch.notes !== undefined ? clean(patch.notes) : cur.notes,
    managerNote: patch.managerNote !== undefined ? clean(patch.managerNote) : cur.managerNote,
    updatedAt: Date.now(),
  };

  // validación de status si viene
  if (patch.status && !["prospecto", "activo", "pausado", "cerrado"].includes(patch.status)) {
    throw new Error("Estado inválido");
  }

  // validación allyType si viene
  if (patch.allyType && !["empresa", "organizacion"].includes(patch.allyType)) {
    throw new Error("Tipo inválido");
  }

  // validación category si viene
  if (patch.category && !["inclusion", "atencion", "capacitacion", "mixto"].includes(patch.category)) {
    throw new Error("Categoría inválida");
  }

  items[idx] = next;
  save(items);
  return next;
}

export function deleteConvenio(id) {
  const items = load().filter((x) => x.id !== id);
  save(items);
  return true;
}