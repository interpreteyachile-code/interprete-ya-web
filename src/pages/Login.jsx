import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

// --- helpers RUT (UI) ---
function cleanRutInput(raw) {
  let v = (raw || "").replace(/[^0-9kK-]/g, "");

  // Solo 1 guion
  const parts = v.split("-");
  if (parts.length > 2) v = parts[0] + "-" + parts.slice(1).join("");

  // Limitar cuerpo a 9 dígitos
  const [bodyRaw, dvRaw] = v.split("-");
  const body = (bodyRaw || "").replace(/\D/g, "").slice(0, 9);

  // DV: 1 char (0-9 o K)
  let dv = (dvRaw || "").replace(/[^0-9kK]/g, "").slice(0, 1).toUpperCase();

  // Reconstruir
  if (v.includes("-")) return `${body}-${dv}`;
  return body;
}

function isRutFormatValid(rut) {
  return /^[0-9]{1,9}-[0-9K]$/.test(rut);
}

export default function Login() {
  const nav = useNavigate();
  const { login } = useAuth(); // ✅ alias cliente

  const [rut, setRut] = useState("");
  const [password, setPassword] = useState("");

  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const rutOk = useMemo(() => isRutFormatValid(rut), [rut]);

  const onRutChange = (e) => {
    setError("");
    setRut(cleanRutInput(e.target.value));
  };

  const onPasswordChange = (e) => {
    setError("");
    setPassword(e.target.value);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!rutOk) return setError("⚠️ RUT inválido. Ej: 12345678-0 o 12345678-K");
    if (!password) return setError("⚠️ Escribe tu contraseña.");

    try {
      setLoading(true);
      await login({ rut, password });
      nav("/panel", { replace: true });
    } catch (err) {
      if (err?.code === "PENDING")
        return setError("⏳ Tu cuenta está pendiente de aprobación (Gerente).");
      if (err?.code === "REJECTED")
        return setError("⛔ Tu cuenta fue rechazada. Contacta al gerente.");

      const msg =
        err?.code === "NO_EXISTS"
          ? "❌ No existe una cuenta con ese RUT."
          : err?.code === "BAD_PASSWORD"
          ? "❌ Contraseña incorrecta."
          : "❌ No se pudo ingresar. Revisa tus datos.";

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] grid place-items-center px-4">
      <div className="w-full max-w-md tron-card p-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-2xl font-semibold h-title">🔐 Ingresar</div>
            <div className="text-sm text-white/70 mt-1">
              Acceso seguro (RUT + contraseña)
            </div>
          </div>

          {/* Marco logo (placeholder) */}
          <div className="w-12 h-12 rounded-2xl border border-cyan-300/30 bg-cyan-300/10 grid place-items-center">
            🤟
          </div>
        </div>

        <div className="mt-4 glow-line" />

        {/* Error */}
        {error && (
          <div className="mt-4 tron-card p-3 text-sm text-white/85">
            {error}
          </div>
        )}

        {/* Form */}
        <form className="mt-4 grid gap-3" onSubmit={onSubmit}>
          {/* RUT */}
          <div>
            <label className="text-sm text-white/70">RUT</label>
            <input
              value={rut}
              onChange={onRutChange}
              inputMode="text"
              autoComplete="username"
              placeholder="12345678-0"
              className="tron-input mt-1 w-full"
              maxLength={12}
            />
            <div className="text-[11px] text-white/55 mt-1">
              Formato: 1 a 9 dígitos + guion + (0-9 o K)
            </div>
          </div>

          {/* Password + toggle */}
          <div>
            <label className="text-sm text-white/70">Contraseña</label>

            <div className="mt-1 flex gap-2">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={onPasswordChange}
                autoComplete="current-password"
                placeholder="••••••••••••"
                className="tron-input w-full"
              />
              <button
                type="button"
                className="tron-btn px-4"
                onClick={() => setShowPass((s) => !s)}
                title={showPass ? "Ocultar" : "Mostrar"}
              >
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            className={
              "tron-btn tron-primary w-full py-3 font-semibold " +
              (!rutOk || !password || loading ? "opacity-70 cursor-not-allowed" : "")
            }
            disabled={!rutOk || !password || loading}
          >
            {loading ? "⏳ Ingresando..." : "✅ Ingresar"}
          </button>

          {/* Links */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className="tron-btn tron-muted py-2"
              onClick={() => nav("/register")}
            >
              ✍️ Registro
            </button>
            <button
              type="button"
              className="tron-btn py-2"
              onClick={() => nav("/")}
            >
              🏠 Inicio
            </button>
          </div>
        </form>

        <div className="text-xs text-white/55 mt-4">
          🔒 Si tu cuenta está pendiente, el gerente debe aprobarla.
        </div>
      </div>
    </div>
  );
}