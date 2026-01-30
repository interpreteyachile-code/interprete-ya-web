import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

// --- helpers RUT (UI) ---
function cleanRutInput(raw) {
  let v = (raw || "").replace(/[^0-9kK-]/g, "");
  const parts = v.split("-");
  if (parts.length > 2) v = parts[0] + "-" + parts.slice(1).join("");

  const [bodyRaw, dvRaw] = v.split("-");
  const body = (bodyRaw || "").replace(/\D/g, "").slice(0, 9);
  let dv = (dvRaw || "").replace(/[^0-9kK]/g, "").slice(0, 1).toUpperCase();

  return v.includes("-") ? `${body}-${dv}` : body;
}

function isRutFormatValid(rut) {
  return /^[0-9]{1,9}-[0-9K]$/.test(rut);
}

// --- password rules (demo) ---
function isPasswordOk(pw) {
  if (!pw || pw.length < 12) return false;
  const hasLetter = /[a-zA-Z]/.test(pw);
  const hasNumber = /[0-9]/.test(pw);
  return hasLetter && hasNumber;
}

export default function Register() {
  const nav = useNavigate();
  const { register } = useAuth();

  const [profileType, setProfileType] = useState("user"); // user | interpreter
  const [fullName, setFullName] = useState("");
  const [rut, setRut] = useState("");

  const [email, setEmail] = useState("");
  const [email2, setEmail2] = useState("");

  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  // ✅ campos extra intérprete (demo)
  const [cert, setCert] = useState("");
  const [years, setYears] = useState("");
  const [specialty, setSpecialty] = useState("general"); // general | salud | educacion | legal | empresa
  const [note, setNote] = useState("");

  const [showPass, setShowPass] = useState(false);
  const [showPass2, setShowPass2] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [okMsg, setOkMsg] = useState("");

  const rutOk = useMemo(() => isRutFormatValid(rut), [rut]);

  const emailOk = useMemo(() => {
    const a = (email || "").trim().toLowerCase();
    const b = (email2 || "").trim().toLowerCase();
    if (!a || !b) return false;
    if (a !== b) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a);
  }, [email, email2]);

  const passOk = useMemo(() => isPasswordOk(password), [password]);
  const passMatch = useMemo(
    () => password && password2 && password === password2,
    [password, password2]
  );

  const interpreterExtraOk = useMemo(() => {
    if (profileType !== "interpreter") return true;
    const y = Number(years || 0);
    if (!cert.trim()) return false;
    if (!Number.isFinite(y) || y < 0 || y > 60) return false;
    return true;
  }, [profileType, cert, years]);

  const canSubmit = useMemo(() => {
    return (
      fullName.trim().length >= 3 &&
      rutOk &&
      emailOk &&
      passOk &&
      passMatch &&
      interpreterExtraOk &&
      !loading
    );
  }, [fullName, rutOk, emailOk, passOk, passMatch, interpreterExtraOk, loading]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setOkMsg("");

    if (fullName.trim().length < 3) return setError("⚠️ Escribe tu nombre completo.");
    if (!rutOk) return setError("⚠️ RUT inválido. Ej: 12345678-0 o 12345678-K");
    if (!emailOk) return setError("⚠️ Revisa el correo y confirmación.");
    if (!passOk) return setError("⚠️ Contraseña débil (mín. 12, letras + números).");
    if (!passMatch) return setError("⚠️ Las contraseñas no coinciden.");

    if (profileType === "interpreter") {
      const y = Number(years || 0);
      if (!cert.trim()) return setError("⚠️ Intérprete: escribe tu certificación.");
      if (!Number.isFinite(y) || y < 0 || y > 60)
        return setError("⚠️ Intérprete: años de experiencia inválidos.");
    }

    try {
      setLoading(true);

      await register({
        profileType,
        fullName: fullName.trim(),
        rut,
        email: (email || "").trim().toLowerCase(),
        password,

        // ✅ extra intérprete (opcional)
        interpreterProfile:
          profileType === "interpreter"
            ? {
                certification: cert.trim(),
                years: Number(years || 0),
                specialty,
                note: note.trim(),
              }
            : null,
      });

      setOkMsg("✅ Registro enviado. Tu cuenta quedará ⏳ pendiente de aprobación por el gerente.");

      // limpiar
      setProfileType("user");
      setFullName("");
      setRut("");
      setEmail("");
      setEmail2("");
      setPassword("");
      setPassword2("");

      setCert("");
      setYears("");
      setSpecialty("general");
      setNote("");

      setTimeout(() => nav("/login", { replace: true }), 900);
    } catch (err) {
      const msg =
        err?.message === "RUT ya existe"
          ? "❌ Ese RUT ya está registrado."
          : err?.message === "Email ya existe"
          ? "❌ Ese correo ya está registrado."
          : "❌ No se pudo registrar. Revisa tus datos.";

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const specialtyLabel =
    specialty === "salud"
      ? "🏥 Salud"
      : specialty === "educacion"
      ? "🏫 Educación"
      : specialty === "legal"
      ? "⚖️ Legal"
      : specialty === "empresa"
      ? "🏢 Empresa"
      : "🧩 General";

  return (
    <div className="min-h-[70vh] grid place-items-center px-4">
      <div className="w-full max-w-md tron-card p-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-2xl font-semibold h-title">✍️ Registro</div>
            <div className="text-sm text-white/70 mt-1">
              Crea cuenta (queda ⏳ pendiente aprobación).
            </div>
          </div>

          {/* Logo marco */}
          <div className="w-12 h-12 rounded-2xl border border-cyan-300/30 bg-cyan-300/10 grid place-items-center">
            🤟
          </div>
        </div>

        <div className="mt-4 glow-line" />

        {error && <div className="mt-4 tron-card p-3 text-sm text-white/85">{error}</div>}
        {okMsg && <div className="mt-4 tron-card p-3 text-sm text-white/85">{okMsg}</div>}

        <form className="mt-4 grid gap-3" onSubmit={onSubmit}>
          {/* Perfil */}
          <div>
            <label className="text-sm text-white/70">Perfil</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                className={"tron-btn py-3 font-semibold " + (profileType === "user" ? "tron-primary" : "")}
                onClick={() => {
                  setError("");
                  setProfileType("user");
                }}
              >
                🧏‍♀️ Usuario
              </button>
              <button
                type="button"
                className={"tron-btn py-3 font-semibold " + (profileType === "interpreter" ? "tron-primary" : "")}
                onClick={() => {
                  setError("");
                  setProfileType("interpreter");
                }}
              >
                🧑‍💼 Intérprete
              </button>
            </div>
          </div>

          {/* Nombre */}
          <div>
            <label className="text-sm text-white/70">Nombre completo</label>
            <input
              value={fullName}
              onChange={(e) => {
                setError("");
                setFullName(e.target.value);
              }}
              className="tron-input mt-1 w-full"
              placeholder="Ej: Juan Pérez"
              autoComplete="name"
            />
          </div>

          {/* RUT */}
          <div>
            <label className="text-sm text-white/70">RUT</label>
            <input
              value={rut}
              onChange={(e) => {
                setError("");
                setRut(cleanRutInput(e.target.value));
              }}
              className="tron-input mt-1 w-full"
              placeholder="12345678-0"
              maxLength={12}
            />
            <div className="text-[11px] text-white/55 mt-1">
              Formato: 1 a 9 dígitos + guion + (0-9 o K)
            </div>
          </div>

          {/* Email + confirm */}
          <div>
            <label className="text-sm text-white/70">Correo</label>
            <input
              value={email}
              onChange={(e) => {
                setError("");
                setEmail(e.target.value);
              }}
              className="tron-input mt-1 w-full"
              placeholder="correo@ejemplo.cl"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="text-sm text-white/70">Confirmar correo</label>
            <input
              value={email2}
              onChange={(e) => {
                setError("");
                setEmail2(e.target.value);
              }}
              className="tron-input mt-1 w-full"
              placeholder="correo@ejemplo.cl"
              autoComplete="email"
            />
          </div>

          {/* Password + confirm */}
          <div>
            <label className="text-sm text-white/70">Contraseña</label>
            <div className="mt-1 flex gap-2">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setError("");
                  setPassword(e.target.value);
                }}
                className="tron-input w-full"
                placeholder="mín. 12 (letras + números)"
                autoComplete="new-password"
              />
              <button type="button" className="tron-btn px-4" onClick={() => setShowPass((s) => !s)}>
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
            <div className="text-[11px] text-white/55 mt-1">
              Requisito demo: mínimo 12 y debe incluir letras + números.
            </div>
          </div>

          <div>
            <label className="text-sm text-white/70">Confirmar contraseña</label>
            <div className="mt-1 flex gap-2">
              <input
                type={showPass2 ? "text" : "password"}
                value={password2}
                onChange={(e) => {
                  setError("");
                  setPassword2(e.target.value);
                }}
                className="tron-input w-full"
                placeholder="repite tu contraseña"
                autoComplete="new-password"
              />
              <button type="button" className="tron-btn px-4" onClick={() => setShowPass2((s) => !s)}>
                {showPass2 ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* ✅ EXTRA SOLO INTÉRPRETE */}
          {profileType === "interpreter" && (
            <div className="tron-card p-4">
              <div className="font-semibold">🧑‍💼 Datos Intérprete (demo)</div>
              <div className="text-xs text-white/60 mt-1">
                Estos datos ayudan al gerente a validar y aprobar.
              </div>

              <div className="mt-3 grid gap-3">
                <div>
                  <label className="text-sm text-white/70">Certificación</label>
                  <input
                    value={cert}
                    onChange={(e) => {
                      setError("");
                      setCert(e.target.value);
                    }}
                    className="tron-input mt-1 w-full"
                    placeholder="Ej: Certificado LSCh / Institución"
                  />
                </div>

                <div>
                  <label className="text-sm text-white/70">Años de experiencia</label>
                  <input
                    value={years}
                    onChange={(e) => {
                      setError("");
                      // solo números
                      const v = (e.target.value || "").replace(/[^0-9]/g, "").slice(0, 2);
                      setYears(v);
                    }}
                    className="tron-input mt-1 w-full"
                    placeholder="Ej: 3"
                    inputMode="numeric"
                  />
                </div>

                <div>
                  <label className="text-sm text-white/70">Especialidad</label>
                  <button
                    type="button"
                    className="tron-btn tron-muted w-full mt-1 flex items-center justify-between"
                    onClick={() => {
                      const order = ["general", "salud", "educacion", "legal", "empresa"];
                      const idx = order.indexOf(specialty);
                      setSpecialty(order[(idx + 1) % order.length]);
                    }}
                    title="Cambiar especialidad"
                  >
                    <span>{specialtyLabel}</span>
                    <span className="opacity-70">↻</span>
                  </button>
                  <div className="text-[11px] text-white/55 mt-1">
                    (Botón demo: toca para cambiar)
                  </div>
                </div>

                <div>
                  <label className="text-sm text-white/70">Nota (opcional)</label>
                  <textarea
                    value={note}
                    onChange={(e) => {
                      setError("");
                      setNote(e.target.value);
                    }}
                    className="tron-input mt-1 w-full"
                    rows={3}
                    placeholder="Ej: disponibilidad, ciudad, experiencia en hospitales, etc."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            className={
              "tron-btn tron-primary w-full py-3 font-semibold " +
              (!canSubmit ? "opacity-70 cursor-not-allowed" : "")
            }
            disabled={!canSubmit}
          >
            {loading ? "⏳ Registrando..." : "✅ Crear cuenta"}
          </button>

          {/* Links */}
          <div className="grid grid-cols-2 gap-2">
            <button type="button" className="tron-btn tron-muted py-2" onClick={() => nav("/login")}>
              🔐 Login
            </button>
            <button type="button" className="tron-btn py-2" onClick={() => nav("/")}>
              🏠 Inicio
            </button>
          </div>
        </form>

        <div className="text-xs text-white/55 mt-4">
          🔒 Las funciones avanzadas se habilitan cuando el gerente aprueba tu registro.
        </div>
      </div>
    </div>
  );
}
