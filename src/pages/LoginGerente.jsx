import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function LoginGerente() {
  const nav = useNavigate();
  const { loginManager } = useAuth(); // ✅ alias gerente

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || "").trim());

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!emailOk) return setError("⚠️ Correo inválido.");
    if (!password) return setError("⚠️ Escribe tu contraseña.");

    try {
      setLoading(true);
      await loginManager({ email, password });
      nav("/gerente", { replace: true });
    } catch (err) {
      const msg =
        err?.code === "NO_EXISTS"
          ? "❌ No existe un gerente con ese correo."
          : err?.code === "BAD_PASSWORD"
          ? "❌ Contraseña incorrecta."
          : err?.code === "NOT_MANAGER"
          ? "⛔ Este correo no es de gerente."
          : err?.code === "NOT_ACTIVE"
          ? "⛔ Cuenta no activa."
          : "❌ No se pudo ingresar.";

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
            <div className="text-2xl font-semibold h-title">🧑‍💼 Acceso Gerente</div>
            <div className="text-sm text-white/70 mt-1">
              Ingreso seguro (correo + contraseña)
            </div>
          </div>

          {/* Marco logo */}
          <div className="w-12 h-12 rounded-2xl border border-cyan-300/30 bg-cyan-300/10 grid place-items-center">
            🛡️
          </div>
        </div>

        <div className="mt-4 glow-line" />

        {error && (
          <div className="mt-4 tron-card p-3 text-sm text-white/85">
            {error}
          </div>
        )}

        <form className="mt-4 grid gap-3" onSubmit={onSubmit}>
          {/* Email */}
          <div>
            <label className="text-sm text-white/70">Correo</label>
            <input
              value={email}
              onChange={(e) => {
                setError("");
                setEmail(e.target.value);
              }}
              inputMode="email"
              autoComplete="username"
              placeholder="correo@dominio.cl"
              className="tron-input mt-1 w-full"
            />
          </div>

          {/* Password */}
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

          <button
            className={
              "tron-btn tron-primary w-full py-3 font-semibold " +
              (!emailOk || !password || loading ? "opacity-70 cursor-not-allowed" : "")
            }
            disabled={!emailOk || !password || loading}
          >
            {loading ? "⏳ Ingresando..." : "✅ Entrar como Gerente"}
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button type="button" className="tron-btn tron-muted py-2" onClick={() => nav("/")}>
              🏠 Inicio
            </button>
            <button type="button" className="tron-btn py-2" onClick={() => nav("/login")}>
              🔐 Login usuario
            </button>
          </div>
        </form>

        <div className="text-xs text-white/55 mt-4">
          🔒 Acceso exclusivo para gerencia.
        </div>
      </div>
    </div>
  );
}
