const KEY = "iy_services_v1";

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

// ✅ para tu Solicitud (si ya tienes otro store, puedes ignorar esto)
export function listServices() {
  return load();
}

export function createService(payload) {
  const items = load();

  const s = {
    id: crypto.randomUUID(),
    createdAt: Date.now(),

    // cliente
    clientId: payload.clientId,
    clientName: payload.clientName,

    // modo
    mode: payload.mode || "now", // now | schedule | video

    // pago demo
    amountCLP: payload.amountCLP || 0,

    // códigos “QR demo”
    startCode: payload.startCode || Math.random().toString(36).slice(2, 8).toUpperCase(),
    endCode: payload.endCode || Math.random().toString(36).slice(2, 8).toUpperCase(),

    // intérprete
    interpreterId: null,
    interpreterName: null,

    // estados
    status: "created", // created | matched | started | finished | paid | rated

    startedAt: null,
    finishedAt: null,
  };

  items.unshift(s);
  save(items);
  return s;
}

export function updateService(id, patch) {
  const items = load();
  const idx = items.findIndex((x) => x.id === id);
  if (idx === -1) throw new Error("No existe");

  items[idx] = { ...items[idx], ...patch };
  save(items);
  return items[idx];
}
