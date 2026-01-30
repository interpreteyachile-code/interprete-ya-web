// Normaliza: quita puntos, espacios, y pone guión antes del DV
export function normalizeRut(input = "") {
  let v = String(input).toUpperCase().replace(/\./g, "").replace(/\s+/g, "");
  v = v.replace(/[^0-9K-]/g, ""); // solo 0-9, K y -
  // si tiene más de un guión, deja el primero
  const parts = v.split("-").filter(Boolean);
  if (parts.length >= 2) {
    v = parts[0] + "-" + parts[1].slice(0, 1);
  } else {
    // sin guión: si hay más de 1 char, último es DV
    if (v.length >= 2) {
      const body = v.slice(0, -1).replace(/-/g, "");
      const dv = v.slice(-1).replace(/-/g, "");
      v = body + "-" + dv;
    }
  }
  // recorta: cuerpo max 8, DV 1
  const m = v.match(/^(\d{0,8})(?:-([0-9K]{0,1}))?$/);
  if (!m) return "";
  const body = m[1] || "";
  const dv = m[2] || "";
  return dv ? `${body}-${dv}` : body;
}

export function isValidRut(rut = "") {
  const r = normalizeRut(rut);
  const m = r.match(/^(\d{7,8})-([0-9K])$/);
  if (!m) return false;
  const body = m[1];
  const dv = m[2];

  let sum = 0;
  let mul = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const res = 11 - (sum % 11);
  const dvCalc = res === 11 ? "0" : res === 10 ? "K" : String(res);
  return dv === dvCalc;
}
