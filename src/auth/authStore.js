const USERS_KEY = "iy_users_v3";
const SESSION_KEY = "iy_session_v3";

/* ---------------- RUT helpers (bloqueo estricto) ----------------
   - Solo 0-9, K/k y guion
   - Formato: body-dv
   - Body: máximo 9 dígitos (según tu requisito)
   - DV: 0-9 o K
*/
export function cleanRut(value = "") {
  return value
    .toString()
    .toUpperCase()
    .replace(/[^0-9K-]/g, "");
}

export function normalizeRut(value = "") {
  const raw = value.toString().toUpperCase().replace(/[^0-9K]/g, "");
  if (raw.length === 0) return "";

  // Máximo: 9 dígitos body + 1 dv = 10 caracteres sin guion
  const limited = raw.slice(0, 10);

  if (limited.length < 2) return limited;

  let body = limited.slice(0, -1);
  const dv = limited.slice(-1);

  // body máximo 9 dígitos
  body = body.slice(0, 9);

  return `${body}-${dv}`;
}

export function isValidRut(rut = "") {
  const nr = normalizeRut(rut);
  const m = nr.match(/^(\d{1,9})-([0-9K])$/);
  if (!m) return false;

  const body = m[1];
  const dv = m[2];

  let sum = 0;
  let mul = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }

  const mod = 11 - (sum % 11);
  const expected = mod === 11 ? "0" : mod === 10 ? "K" : String(mod);
  return expected === dv;
}

/* ---------------- Password policy ----------------
Requisitos:
- Alfanumérica (solo letras y números)
- Mínimo 12
- Debe contener al menos 1 letra (mayúscula o minúscula)
- No puede contener nombre ni apellido
- Distinta a las 25 anteriores
*/
function isAlphanumeric(str) {
  return /^[A-Za-z0-9]+$/.test(str);
}

function splitNameParts(fullName = "") {
  return fullName
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

function validatePasswordPolicy({ password, fullName, passwordHistory = [] }) {
  if (!password) throw new Error("La contraseña es obligatoria.");
  if (password.length < 12) throw new Error("Contraseña: mínimo 12 caracteres.");
  if (!isAlphanumeric(password)) throw new Error("Contraseña: debe ser alfanumérica (solo letras y números).");
  if (!/[A-Za-z]/.test(password)) throw new Error("Contraseña: debe contener al menos 1 letra.");

  const parts = splitNameParts(fullName);
  const lowerPass = password.toLowerCase();
  for (const p of parts) {
    if (p.length >= 3 && lowerPass.includes(p)) {
      throw new Error("Contraseña: no puede contener tu nombre o apellido.");
    }
  }

  const last25 = (passwordHistory || []).slice(0, 25);
  if (last25.includes(password)) {
    throw new Error("Contraseña: debe ser diferente a las últimas 25.");
  }
}

/* ---------------- Storage helpers ---------------- */
function loadUsers() {
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function ensureSeed() {
  const users = loadUsers();

  // ✅ Gerente interno (para aprobar)
  const hasManager = users.some(u => u.role === "manager");
  if (!hasManager) {
    const fullName = "Gerente InterpreteYa";
    const password = "Admin2026Inter"; // 13, alfanumérica

    users.push({
      id: crypto.randomUUID(),
      fullName,
      rut: "12345678-5", // demo
      email: "gerente@interpreteya.cl",
      password,
      passwordHistory: [password],
      role: "manager",              // interno
      profileType: "manager",       // interno
      status: "approved",
      createdAt: Date.now(),
    });
  }

  saveUsers(users);
}

/* ---------------- API ---------------- */
export function registerUser({
  fullName,
  rut,
  email,
  emailConfirm,
  password,
  passwordConfirm,
  profileType, // "user" | "interpreter"
}) {
  const users = loadUsers();

  const nrut = normalizeRut(rut);

  if (!fullName?.trim()) throw new Error("Nombre completo es obligatorio.");
  if (!nrut) throw new Error("RUT es obligatorio.");
  if (!isValidRut(nrut)) throw new Error("RUT inválido. Revisa el dígito verificador.");
  if (!email?.trim()) throw new Error("Email es obligatorio.");
  if (!emailConfirm?.trim()) throw new Error("Confirmar correo es obligatorio.");
  if (email.toLowerCase() !== emailConfirm.toLowerCase()) throw new Error("Los correos no coinciden.");

  if (!passwordConfirm?.trim()) throw new Error("Confirmar contraseña es obligatorio.");
  if (password !== passwordConfirm) throw new Error("Las contraseñas no coinciden.");

  if (!["user", "interpreter"].includes(profileType)) {
    throw new Error("Debes seleccionar perfil: Usuario o Intérprete.");
  }

  const rutExists = users.some(u => u.rut === nrut);
  if (rutExists) throw new Error("Este RUT ya está registrado.");

  const emailExists = users.some(u => u.email?.toLowerCase() === email.toLowerCase());
  if (emailExists) throw new Error("Este correo ya está registrado.");

  validatePasswordPolicy({ password, fullName, passwordHistory: [] });

  const newUser = {
    id: crypto.randomUUID(),
    fullName: fullName.trim(),
    rut: nrut,
    email: email.trim(),
    password,
    passwordHistory: [password],
    role: "client",           // “client” como usuario del sistema (no gerente)
    profileType,              // "user" | "interpreter"
    status: "pending",        // ✅ siempre pendiente hasta aprobación
    createdAt: Date.now(),
  };

  users.push(newUser);
  saveUsers(users);
  return newUser;
}

export function loginUser({ rut, password }) {
  const users = loadUsers();
  const nrut = normalizeRut(rut);

  const user = users.find(u => u.rut === nrut && u.password === password);
  if (!user) throw new Error("RUT o contraseña incorrectos.");

  if (user.role !== "manager" && user.status !== "approved") {
    throw new Error("Tu cuenta está PENDIENTE 🟡. Espera aprobación del gerente.");
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id }));
  return user;
}

export function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
}

export function getSessionUser() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const { userId } = JSON.parse(raw);
    const users = loadUsers();
    return users.find(u => u.id === userId) || null;
  } catch {
    return null;
  }
}

export function getAllUsers() {
  return loadUsers();
}

export function approveUser(userId) {
  const users = loadUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) return;
  users[idx].status = "approved";
  saveUsers(users);
}

export function rejectUser(userId) {
  const users = loadUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) return;
  users[idx].status = "rejected";
  saveUsers(users);
}
