const KEY = "iy_denuncias_v1";

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

// 📋 listar denuncias
export function listDenuncias() {
  return load().sort((a, b) => b.createdAt - a.createdAt);
}

// ➕ crear denuncia
export function createDenuncia(payload) {
  const items = load();

  const createdAt = Date.now();
  const d = {
    id: crypto.randomUUID(),
    createdAt,

    // autor (demo; luego AuthContext)
    authorId: payload.authorId || "user_demo_01",
    authorName: payload.authorName || "Usuario Sordo",

    // contenido
    category: payload.category || "tramite",
    title: payload.title?.trim() || "",
    description: payload.description?.trim() || "",

    // evidencia
    location: payload.location || null, // { lat, lng, accuracy } o null
    hash: makeHash({
      createdAt,
      authorName: payload.authorName || "Usuario Sordo",
      category: payload.category || "tramite",
      title: payload.title || "",
      description: payload.description || "",
      loc: payload.location || null,
    }),

    status: "open", // open | reviewing | closed
  };

  if (!d.title) throw new Error("Falta título");
  if (!d.description) throw new Error("Falta descripción");

  items.push(d);
  save(items);
  return d;
}

// 🔄 cambiar estado
export function setDenunciaStatus(id, status) {
  const items = load();
  const d = items.find((x) => x.id === id);
  if (!d) return null;
  d.status = status;
  save(items);
  return d;
}

// 🗑️ eliminar
export function deleteDenuncia(id) {
  const items = load().filter((x) => x.id !== id);
  save(items);
  return true;
}

// ---- Hash demo (evidencia ligera) ----
// Nota: NO es criptografía legal. Sirve como "fingerprint" para demo/prototipo.
function makeHash(obj) {
  const str = JSON.stringify(obj);
  let h = 2166136261; // FNV-1a base
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ("00000000" + (h >>> 0).toString(16)).slice(-8).toUpperCase();
}