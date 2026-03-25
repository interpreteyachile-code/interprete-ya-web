const KEY = "iy_payments_v1";

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

const VALID_TYPES = ["course_enroll", "service_request"];
const VALID_STATUS = ["paid", "pending", "failed"];
const VALID_METHODS = ["demo", "webpay", "mercadopago"];

export function listPayments() {
  return load();
}

export function getPayment(paymentId) {
  return load().find((x) => x.id === paymentId) || null;
}

export function getPaymentsByUser(userId) {
  return load().filter((x) => x.userId === userId);
}

export function getPaymentsByType(type) {
  return load().filter((x) => x.type === type);
}

export function getPaymentsByRefId(refId) {
  return load().filter((x) => x.refId === refId);
}

export function hasPaidCourse(courseId, userId) {
  return load().some(
    (x) =>
      x.type === "course_enroll" &&
      x.refId === courseId &&
      x.userId === userId &&
      x.status === "paid"
  );
}

export function hasPaidService(serviceId, userId) {
  return load().some(
    (x) =>
      x.type === "service_request" &&
      x.refId === serviceId &&
      x.userId === userId &&
      x.status === "paid"
  );
}

export function createPayment(payload) {
  const items = load();

  const type = VALID_TYPES.includes(payload.type)
    ? payload.type
    : "service_request";

  const status = VALID_STATUS.includes(payload.status)
    ? payload.status
    : "paid";

  const method = VALID_METHODS.includes(payload.method)
    ? payload.method
    : "demo";

  const p = {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    updatedAt: null,

    type, // course_enroll | service_request
    refId: clean(payload.refId), // id curso o servicio
    userId: payload.userId || null,
    userName: clean(payload.userName),

    amountCLP: Math.max(0, normNumber(payload.amountCLP, 0)),
    status, // paid | pending | failed
    method, // demo | webpay | mercadopago
    note: clean(payload.note),
  };

  if (!p.refId || !p.userId) {
    throw new Error("Pago inválido");
  }

  // evitar duplicado ya pagado para mismo usuario + referencia + tipo
  const exists = items.find(
    (x) =>
      x.type === p.type &&
      x.refId === p.refId &&
      x.userId === p.userId &&
      x.status === "paid"
  );

  if (exists) {
    return exists;
  }

  items.unshift(p);
  save(items);
  return p;
}

export function updatePayment(id, patch) {
  const items = load();
  const idx = items.findIndex((x) => x.id === id);

  if (idx === -1) {
    throw new Error("No existe");
  }

  if (patch.type && !VALID_TYPES.includes(patch.type)) {
    throw new Error("Tipo inválido");
  }

  if (patch.status && !VALID_STATUS.includes(patch.status)) {
    throw new Error("Estado inválido");
  }

  if (patch.method && !VALID_METHODS.includes(patch.method)) {
    throw new Error("Método inválido");
  }

  const current = items[idx];

  const next = {
    ...current,
    ...patch,

    refId: patch.refId !== undefined ? clean(patch.refId) : current.refId,
    userName:
      patch.userName !== undefined ? clean(patch.userName) : current.userName,
    note: patch.note !== undefined ? clean(patch.note) : current.note,

    amountCLP:
      patch.amountCLP !== undefined
        ? Math.max(0, normNumber(patch.amountCLP, current.amountCLP))
        : current.amountCLP,

    updatedAt: Date.now(),
  };

  items[idx] = next;
  save(items);
  return next;
}

export function deletePayment(id) {
  const items = load().filter((x) => x.id !== id);
  save(items);
  return true;
}