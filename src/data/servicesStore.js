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

    // flujo
    status: "requested", // requested | accepted | in_progress | paid | done | cancelled

    // datos básicos
    mode: payload.mode || "now", // now | schedule | video
    serviceType: payload.serviceType || "tramite", // tramite | reunion | entrevista | evento
    zone: payload.zone || "centro", // norte | centro | sur
    whenISO: payload.whenISO || null, // para agenda

    // cliente (demo)
    clientRut: payload.clientRut || "",
    clientName: payload.clientName || "",

    // intérprete (demo)
    interpreterId: null,

    // pago (demo)
    priceCLP: Number(payload.priceCLP || 0),
    paidAt: null,

    note: payload.note || "",
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


export function getService(serviceId) {
  return load().find((x) => x.id === serviceId) || null;
}

export function cancelService(serviceId) {
  const items = load();
  const s = items.find((x) => x.id === serviceId);
  if (!s) return null;
  s.status = "cancelled";
  save(items);
  return s;
}

export function autoAssignInterpreter(serviceId) {

  const services = load();
  const users = JSON.parse(localStorage.getItem("iy_users_v1") || "[]");

  const interpretes = users.filter(
    (u) =>
      u.profileType === "interpreter" &&
      u.status === "active"
  );

  if (interpretes.length === 0) {
    throw new Error("No hay intérpretes disponibles");
  }

  // elegir uno al azar (luego se puede mejorar)
  const selected =
    interpretes[Math.floor(Math.random() * interpretes.length)];

  const idx = services.findIndex((s) => s.id === serviceId);

  if (idx === -1) return null;

  services[idx].interpreterId = selected.id;
  services[idx].status = "assigned";

  save(services);

  return selected;

}