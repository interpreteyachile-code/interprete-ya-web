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

export function listPayments() {
  return load();
}

// type: "course_enroll" | "service_request"
export function createPayment(payload) {
  const items = load();

  const p = {
    id: crypto.randomUUID(),
    createdAt: Date.now(),

    type: payload.type, // "course_enroll" | "service_request"
    refId: payload.refId, // courseId | serviceId
    userId: payload.userId,
    userName: clean(payload.userName),

    amountCLP: Number(payload.amountCLP) || 0,
    status: payload.status || "paid", // paid | failed | pending

    method: payload.method || "demo", // demo | webpay | mercadopago
    note: clean(payload.note || ""),
  };

  if (!p.type || !p.refId || !p.userId) {
    throw new Error("Pago inválido");
  }

  // evitar pago duplicado ya pagado del mismo usuario y referencia
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

  items.push(p);
  save(items);
  return p;
}

export function hasPaidCourse(courseId, userId) {
  const items = load();

  return items.some(
    (x) =>
      x.type === "course_enroll" &&
      x.refId === courseId &&
      x.userId === userId &&
      x.status === "paid"
  );
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