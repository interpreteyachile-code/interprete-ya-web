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

export function createRating(payload) {

  const items = load();

  const rating = {
    id: crypto.randomUUID(),
    interpreterId: payload.interpreterId,
    clientRut: payload.clientRut,
    serviceId: payload.serviceId,
    stars: payload.stars,
    comment: payload.comment || "",
    createdAt: Date.now()
  };

  items.push(rating);

  save(items);

  return rating;
}

export function listRatings() {
  return load();
}

export function getInterpreterRating(interpreterId) {

  const ratings = load().filter(
    (r) => r.interpreterId === interpreterId
  );

  if (ratings.length === 0) {
    return {
      avg: 0,
      total: 0
    };
  }

  const sum = ratings.reduce((a, r) => a + r.stars, 0);

  return {
    avg: (sum / ratings.length).toFixed(1),
    total: ratings.length
  };
}