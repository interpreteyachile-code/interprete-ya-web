const KEY = "iy_courses_v1";

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

function normMoney(v) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0;
}

export function listCourses() {
  return load();
}

export function createCourse(payload) {
  const items = load();
  const createdAt = Date.now();

  const c = {
    id: crypto.randomUUID(),
    createdAt,

    // docente (persona sorda)
    teacherId: payload.teacherId,
    teacherName: clean(payload.teacherName) || "Docente",

    title: clean(payload.title),
    level: payload.level || "basico", // basico | intermedio | avanzado
    mode: payload.mode || "online", // online | presencial | mixto
    city: clean(payload.city), // para presencial
    place: clean(payload.place),
    description: clean(payload.description),

    durationMin: Math.max(30, Number(payload.durationMin) || 60),
    priceCLP: normMoney(payload.priceCLP),
    seats: Math.max(1, Number(payload.seats) || 10),

    // estado
    status: payload.status || "draft", // draft | published | paused

    // inscripciones
    enrollments: [], // { userId, userName, enrolledAt }

    updatedAt: null,
  };

  if (!c.teacherId) throw new Error("Falta teacherId");
  if (!c.title) throw new Error("Falta título");
  if (!c.description) throw new Error("Falta descripción");

  items.push(c);
  save(items);
  return c;
}

export function updateCourse(id, patch) {
  const items = load();
  const idx = items.findIndex((x) => x.id === id);
  if (idx === -1) return null;

  const cur = items[idx];

  const next = {
    ...cur,
    ...patch,
    title: patch.title !== undefined ? clean(patch.title) : cur.title,
    city: patch.city !== undefined ? clean(patch.city) : cur.city,
    place: patch.place !== undefined ? clean(patch.place) : cur.place,
    description: patch.description !== undefined ? clean(patch.description) : cur.description,
    durationMin: patch.durationMin !== undefined ? Math.max(30, Number(patch.durationMin) || 60) : cur.durationMin,
    priceCLP: patch.priceCLP !== undefined ? normMoney(patch.priceCLP) : cur.priceCLP,
    seats: patch.seats !== undefined ? Math.max(1, Number(patch.seats) || 10) : cur.seats,
    updatedAt: Date.now(),
  };

  if (patch.status && !["draft", "published", "paused"].includes(patch.status)) {
    throw new Error("Estado inválido");
  }
  if (patch.level && !["basico", "intermedio", "avanzado"].includes(patch.level)) {
    throw new Error("Nivel inválido");
  }
  if (patch.mode && !["online", "presencial", "mixto"].includes(patch.mode)) {
    throw new Error("Modo inválido");
  }

  items[idx] = next;
  save(items);
  return next;
}

export function deleteCourse(id) {
  const items = load().filter((x) => x.id !== id);
  save(items);
  return true;
}

export function enrollCourse(courseId, user) {
  const items = load();
  const c = items.find((x) => x.id === courseId);
  if (!c) return null;

  if (c.status !== "published") throw new Error("Curso no disponible.");
  const exists = c.enrollments.some((e) => e.userId === user.id);
  if (exists) return c;

  if (c.enrollments.length >= c.seats) throw new Error("Sin cupos.");

  c.enrollments.push({
    userId: user.id,
    userName: clean(user.fullName) || "Estudiante",
    enrolledAt: Date.now(),
  });

  c.updatedAt = Date.now();
  save(items);
  return c;
}

export function cancelEnrollment(courseId, userId) {
  const items = load();
  const c = items.find((x) => x.id === courseId);
  if (!c) return null;

  c.enrollments = c.enrollments.filter((e) => e.userId !== userId);
  c.updatedAt = Date.now();
  save(items);
  return c;
}