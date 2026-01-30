export function passwordIssues({ password, fullName }) {
  const issues = [];
  const pwd = String(password || "");

  // 12+
  if (pwd.length < 12) issues.push("Mínimo 12 caracteres.");

  // alfanumérica (solo letras/números)
  if (!/^[A-Za-z0-9]+$/.test(pwd)) issues.push("Solo letras y números (sin símbolos).");

  // debe tener letras y números
  if (!/[A-Za-z]/.test(pwd) || !/[0-9]/.test(pwd)) issues.push("Debe incluir letras y números.");

  // no contener nombre/apellido (palabras del nombre)
  const nameWords = String(fullName || "")
    .toLowerCase()
    .split(/\s+/)
    .map(w => w.trim())
    .filter(w => w.length >= 3);

  const lowerPwd = pwd.toLowerCase();
  const found = nameWords.find(w => lowerPwd.includes(w));
  if (found) issues.push("No puede contener tu nombre o apellido.");

  // (25 anteriores) -> backend
  issues.push("Debe ser diferente a tus 25 contraseñas anteriores (se valida al cambiar).");

  return issues;
}
