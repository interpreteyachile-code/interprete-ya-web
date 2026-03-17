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

export function listServices() {
  return load();
}

export function createService(payload) {
  const items = load();

  const s = {
    id: crypto.randomUUID(),
    createdAt: Date.now(),

    // flujo principal
    status: payload.status || "created",
    // created | matched | started | finished | paid | rated | cancelled

    // tipo de solicitud
    mode: payload.mode || "now", // now | schedule | video
    serviceType: payload.serviceType || "tramite", // tramite | reunion | entrevista | evento
    zone: payload.zone || "centro", // norte | centro | sur

    // agenda / duración
    durationMin: Number(payload.durationMin || 30),
    scheduledAt: payload.scheduledAt || null,

    // cliente
    clientId: payload.clientId || null,
    clientRut: payload.clientRut || "",
    clientName: payload.clientName || "",

    // intérprete
    interpreterId: payload.interpreterId || null,
    interpreterName: payload.interpreterName || "",

    // pago
    amountCLP: Number(payload.amountCLP || 0),
    paidAt: payload.paidAt || null,

    // códigos demo de validación
    startCode:
      payload.startCode ||
      Math.random().toString(36).slice(2, 8).toUpperCase(),
    endCode:
      payload.endCode ||
      Math.random().toString(36).slice(2, 8).toUpperCase(),

    // evaluación
    rating: payload.rating || null,
    ratedAt: payload.ratedAt || null,

    // tiempos del servicio
    startedAt: payload.startedAt || null,
    finishedAt: payload.finishedAt || null,

    // texto libre
    note: payload.note || "",
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

  items[idx] = { ...items[idx], ...patch };
  save(items);
  return items[idx];
}

export function getService(serviceId) {
  return load().find((x) => x.id === serviceId) || null;
}

export function cancelService(serviceId) {
  const items = load();
  const idx = items.findIndex((x) => x.id === serviceId);

  if (idx === -1) return null;

  items[idx] = {
    ...items[idx],
    status: "cancelled",
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

  const selected =
    interpretes[Math.floor(Math.random() * interpretes.length)];

  const idx = services.findIndex((s) => s.id === serviceId);

  if (idx === -1) return null;

  services[idx] = {
    ...services[idx],
    interpreterId: selected.id,
    interpreterName: selected.fullName || "",
    status: "matched",
  };

  save(services);

  return {
    service: services[idx],
    interpreter: selected,
  };
}