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

function clean(v) {
  return (v || "").toString().trim();
}

function normNumber(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

const VALID_STATUS = [
  "created",
  "paid",
  "matched",
  "started",
  "finished",
  "rated",
  "cancelled",
];

const VALID_MODE = ["now", "schedule", "video"];
const VALID_SERVICE_TYPE = ["tramite", "reunion", "entrevista", "evento"];
const VALID_ZONE = ["norte", "centro", "sur"];

export function listServices() {
  return load();
}

export function getService(serviceId) {
  return load().find((x) => x.id === serviceId) || null;
}

export function createService(payload) {
  const items = load();

  const status = VALID_STATUS.includes(payload.status)
    ? payload.status
    : "created";

  const mode = VALID_MODE.includes(payload.mode)
    ? payload.mode
    : "now";

  const serviceType = VALID_SERVICE_TYPE.includes(payload.serviceType)
    ? payload.serviceType
    : "tramite";

  const zone = VALID_ZONE.includes(payload.zone)
    ? payload.zone
    : "centro";

  const s = {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    updatedAt: null,

    // flujo principal
    status,

    // tipo de solicitud
    mode,
    serviceType,
    zone,

    // agenda / duración
    durationMin: Math.max(10, normNumber(payload.durationMin, 30)),
    scheduledAt: payload.scheduledAt || null,

    // cliente
    clientId: payload.clientId || null,
    clientRut: clean(payload.clientRut),
    clientName: clean(payload.clientName),

    // intérprete
    interpreterId: payload.interpreterId || null,
    interpreterName: clean(payload.interpreterName),

    // pago
    amountCLP: Math.max(0, normNumber(payload.amountCLP, 0)),
    paidAt: payload.paidAt || null,

    // códigos demo validación
    startCode:
      payload.startCode ||
      Math.random().toString(36).slice(2, 8).toUpperCase(),
    endCode:
      payload.endCode ||
      Math.random().toString(36).slice(2, 8).toUpperCase(),

    // evaluación
    rating: payload.rating ?? null,
    ratedAt: payload.ratedAt || null,

    // tiempos
    startedAt: payload.startedAt || null,
    finishedAt: payload.finishedAt || null,
    cancelledAt: payload.cancelledAt || null,

    // nota
    note: clean(payload.note),
  };

  items.unshift(s);
  save(items);
  return s;
}

export function updateService(id, patch) {
  const items = load();
  const idx = items.findIndex((x) => x.id === id);

  if (idx === -1) {
    throw new Error("No existe");
  }

  const current = items[idx];

  if (patch.status && !VALID_STATUS.includes(patch.status)) {
    throw new Error("Estado inválido");
  }

  if (patch.mode && !VALID_MODE.includes(patch.mode)) {
    throw new Error("Modo inválido");
  }

  if (patch.serviceType && !VALID_SERVICE_TYPE.includes(patch.serviceType)) {
    throw new Error("Tipo de servicio inválido");
  }

  if (patch.zone && !VALID_ZONE.includes(patch.zone)) {
    throw new Error("Zona inválida");
  }

  const next = {
    ...current,
    ...patch,

    clientRut:
      patch.clientRut !== undefined ? clean(patch.clientRut) : current.clientRut,
    clientName:
      patch.clientName !== undefined ? clean(patch.clientName) : current.clientName,
    interpreterName:
      patch.interpreterName !== undefined
        ? clean(patch.interpreterName)
        : current.interpreterName,
    note: patch.note !== undefined ? clean(patch.note) : current.note,

    durationMin:
      patch.durationMin !== undefined
        ? Math.max(10, normNumber(patch.durationMin, current.durationMin))
        : current.durationMin,

    amountCLP:
      patch.amountCLP !== undefined
        ? Math.max(0, normNumber(patch.amountCLP, current.amountCLP))
        : current.amountCLP,

    updatedAt: Date.now(),
  };

  items[idx] = next;
  save(items);
  return items[idx];
}

export function cancelService(serviceId) {
  const items = load();
  const idx = items.findIndex((x) => x.id === serviceId);

  if (idx === -1) return null;

  items[idx] = {
    ...items[idx],
    status: "cancelled",
    cancelledAt: Date.now(),
    updatedAt: Date.now(),
  };

  save(items);
  return items[idx];
}

export function autoAssignInterpreter(serviceId) {
  const services = load();
  const users = JSON.parse(localStorage.getItem("iy_users_v1") || "[]");

  const interpretes = users.filter(
    (u) => u.profileType === "interpreter" && u.status === "active"
  );

  if (interpretes.length === 0) {
    throw new Error("No hay intérpretes disponibles");
  }

  const idx = services.findIndex((s) => s.id === serviceId);
  if (idx === -1) return null;

  const service = services[idx];

  if (service.interpreterId) {
    throw new Error("El servicio ya tiene intérprete asignado");
  }

  const selected =
    interpretes[Math.floor(Math.random() * interpretes.length)];

  services[idx] = {
    ...service,
    interpreterId: selected.id,
    interpreterName: clean(selected.fullName),
    status: "matched",
    updatedAt: Date.now(),
  };

  save(services);

  return {
    service: services[idx],
    interpreter: selected,
  };
}