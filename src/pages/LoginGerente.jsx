import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function isEmailValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || "").trim());
}

export default function LoginGerente() {
  const nav = useNavigate();
  const { loginManager } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const emailOk = useMemo(() => isEmailValid(email), [email]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!emailOk) {
      setError("⚠️ Correo inválido.");
      return;
    }

    if (!password) {
      setError("⚠️ Escribe tu contraseña.");
      return;
    }

    try {
      setLoading(true);

      await loginManager({
        email: email.trim().toLowerCase(),
        password,
      });

      nav("/panel", { replace: true });
    } catch (err) {
      if (err?.code === "NO_EXISTS") {
        setError("❌ No existe un gerente con ese correo.");
        return;
      }

      if (err?.code === "BAD_PASSWORD") {
        setError("❌ Contraseña incorrecta.");
        return;
      }

      if (err?.code === "NOT_MANAGER") {
        setError("⛔ Esta cuenta no pertenece a gerente.");
        return;
      }

      if (err?.code === "NOT_ACTIVE") {
        setError("⛔ La cuenta gerente no está activa.");
        return;
      }

      setError("❌ No se pudo ingresar como gerente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] grid place-items-center px-4">
      <div className="w-full max-w-md tron-card p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-2xl font-semibold h-title">
              🧑‍💼 Login Gerente
            </div>
            <div className="text-sm text-white/70 mt-1">
              Acceso gerente con correo y contraseña
            </div>
          </div>

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
          <div>
            <label className="text-sm text-white/70">Correo gerente</label>
            <input
              value={email}
              onChange={(e) => {
                setError("");
                setEmail(e.target.value);
              }}
              className="tron-input mt-1 w-full"
              placeholder="gerente@interpreteya.cl"
              autoComplete="username"
            />
          </div>

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
                placeholder="••••••••••••"
                autoComplete="current-password"
              />

              <button
                type="button"
                className="tron-btn px-4"
                onClick={() => setShowPass((s) => !s)}
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
            {loading ? "⏳ Ingresando..." : "✅ Ingresar como gerente"}
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className="tron-btn tron-muted py-2"
              onClick={() => nav("/login")}
            >
              🔐 Usuario
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
          🧑‍💼 Solo cuentas gerente pueden entrar aquí.
        </div>
      </div>
    </div>
  );
}