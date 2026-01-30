const KEY = "iy_users_v1";

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function save(users) {
  localStorage.setItem(KEY, JSON.stringify(users));
}

function upsertUser(users, user) {
  const idx = users.findIndex((u) => u.email === user.email || u.rut === user.rut);
  if (idx >= 0) {
    users[idx] = { ...users[idx], ...user };
  } else {
    users.push(user);
  }
}

/**
 * ✅ Seed de gerentes (2 cuentas)
 * - Si ya existen, NO duplica.
 */
export function ensureManagerSeed() {
  const users = load();

  const managers = [
    {
      id: crypto.randomUUID(),
      role: "manager",
      profileType: "manager",
      fullName: "Sebastián Valenzuela",
      rut: "11111111-1",
      email: "sebastian@interpreteya.cl",
      passwordHash: "SebaSurf", // demo
      status: "active",
      createdAt: Date.now(),
      interpreterProfile: null,
    },
    {
      id: crypto.randomUUID(),
      role: "manager",
      profileType: "manager",
      fullName: "André Heredia",
      rut: "22222222-2",
      email: "andre@interpreteya.cl",
      passwordHash: "FlacoDuro", // demo
      status: "active",
      createdAt: Date.now(),
      interpreterProfile: null,
    },
  ];

  managers.forEach((m) => upsertUser(users, m));
  save(users);
}

export function listUsers() {
  return load();
}

export function findUserByRut(rut) {
  return load().find((u) => u.rut === rut);
}

export function findUserByEmail(email) {
  return load().find((u) => u.email === (email || "").trim().toLowerCase());
}

export function createUser(payload) {
  const users = load();

  const rut = payload.rut;
  const email = (payload.email || "").trim().toLowerCase();

  if (users.some((u) => u.rut === rut)) throw new Error("RUT ya existe");
  if (users.some((u) => u.email === email)) throw new Error("Email ya existe");

  const user = {
    id: crypto.randomUUID(),
    role: "client", // ✅ para ProtectedRoute allowRoles=["client"]
    profileType: payload.profileType, // user | interpreter
    fullName: payload.fullName,
    rut,
    email,
    passwordHash: payload.password, // demo
    status: "pending",
    createdAt: Date.now(),

    // ✅ NUEVO: datos extra del intérprete (si aplica)
    interpreterProfile: payload.interpreterProfile || null,
  };

  users.push(user);
  save(users);
  return user;
}

export function updateUserStatus(id, status) {
  const users = load();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) throw new Error("No existe");

  users[idx] = { ...users[idx], status };
  save(users);
  return users[idx];
}

/**
 * ✅ (Opcional) actualizar datos del perfil (por si luego haces “editar perfil”)
 */
export function updateUserProfile(id, patch) {
  const users = load();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) throw new Error("No existe");

  users[idx] = { ...users[idx], ...patch };
  save(users);
  return users[idx];
}

export function loginManagerByEmail(email, password) {
  const e = (email || "").trim().toLowerCase();
  const u = load().find((x) => x.role === "manager" && x.email === e);

  if (!u) {
    const err = new Error("No existe");
    err.code = "NO_EXISTS";
    throw err;
  }

  // demo: passwordHash guarda texto
  if ((u.passwordHash || "") !== (password || "")) {
    const err = new Error("Clave incorrecta");
    err.code = "BAD_PASSWORD";
    throw err;
  }

  if (u.status !== "active") {
    const err = new Error("No activo");
    err.code = "NOT_ACTIVE";
    throw err;
  }

  return u;
}

