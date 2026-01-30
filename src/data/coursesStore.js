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

export function ensureCourseSeed() {
  const items = load();
  if (items.length > 0) return;

  const seed = [
    {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      createdById: "seed",
      createdByName: "Docente Sordo (Demo)",
      title: "LSCh Básico 1",
      level: "basico",
      format: "online",
      priceCLP: 15000,
      description: "Señas esenciales para comunicación diaria.",
      status: "active",
      enrollCount: 12,
    },
    {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      createdById: "seed",
      createdByName: "Docente Sordo (Demo)",
      title: "LSCh para Empresas",
      level: "intermedio",
      format: "presencial",
      priceCLP: 45000,
      description: "Inclusión laboral + comunicación básica en equipos.",
      status: "active",
      enrollCount: 4,
    },
  ];

  save(seed);
}

export function listCourses() {
  return load();
}

export function createCourse(payload) {
  const items = load();
  const c = {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    createdById: payload.createdById,
    createdByName: payload.createdByName,
    title: payload.title,
    level: payload.level, // basico | intermedio | avanzado
    format: payload.format, // online | presencial
    priceCLP: payload.priceCLP,
    description: payload.description || "",
    status: "active",
    enrollCount: 0,
  };
  items.unshift(c);
  save(items);
  return c;
}

export function updateCourse(id, patch) {
  const items = load();
  const idx = items.findIndex((x) => x.id === id);
  if (idx === -1) throw new Error("No existe");
  items[idx] = { ...items[idx], ...patch };
  save(items);
  return items[idx];
}
