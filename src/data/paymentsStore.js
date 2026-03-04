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

// type: "course_enroll" | "service_request" (por ahora usamos course_enroll)
export function createPayment(payload) {
  const items = load();
  const p = {
    id: crypto.randomUUID(),
    createdAt: Date.now(),

    type: payload.type, // "course_enroll"
    refId: payload.refId, // courseId
    userId: payload.userId,
    userName: clean(payload.userName),

    amountCLP: Number(payload.amountCLP) || 0,
    status: payload.status || "paid", // paid | failed | pending

    method: payload.method || "demo", // demo | webpay | mercadopago
    note: clean(payload.note || ""),
  };

  if (!p.type || !p.refId || !p.userId) throw new Error("Pago inválido");
  items.push(p);
  save(items);
  return p;
}

export function hasPaidCourse(courseId, userId) {
  const items = load();
  return items.some(
    (x) => x.type === "course_enroll" && x.refId === courseId && x.userId === userId && x.status === "paid"
  );
}