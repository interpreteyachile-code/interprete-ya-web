const KEY = "iy_ratings_v1";

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

// ✅ CREAR RATING MEJORADO
export function createRating(payload) {
  const items = load();

  const rating = {
    id: crypto.randomUUID(),

    // 🔹 relaciones
    interpreterId: payload.interpreterId,
    interpreterName: payload.interpreterName || "",

    clientRut: payload.clientRut,
    clientName: payload.clientName || "",

    serviceId: payload.serviceId,

    // 🔹 evaluación
    stars: Number(payload.stars || 0),
    comment: payload.comment || "",

    // 🔹 meta
    createdAt: payload.createdAt || Date.now(),
  };

  items.push(rating);
  save(items);

  return rating;
}

// 📋 listar
export function listRatings() {
  return load();
}

// ⭐ promedio por intérprete
export function getInterpreterRating(interpreterId) {
  const ratings = load().filter(
    (r) => r.interpreterId === interpreterId
  );

  if (ratings.length === 0) {
    return {
      avg: 0,
      total: 0,
    };
  }

  const sum = ratings.reduce((a, r) => a + Number(r.stars || 0), 0);

  return {
    avg: (sum / ratings.length).toFixed(1),
    total: ratings.length,
  };
}

// 📊 obtener ratings de un intérprete (para panel futuro)
export function getRatingsByInterpreter(interpreterId) {
  return load().filter((r) => r.interpreterId === interpreterId);
}