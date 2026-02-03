import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  createUser,
  ensureManagerSeed,
  findUserByRut,
  findUserByEmail,
} from "../data/demoStore";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // ✅ Siempre asegurar gerentes demo (no duplica)
  useEffect(() => {
    ensureManagerSeed();
  }, []);

  // ✅ Cargar sesión si existe
  useEffect(() => {
    try {
      const raw = localStorage.getItem("iy_session_v1");
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  const persist = (u) => {
    setUser(u);
    localStorage.setItem("iy_session_v1", JSON.stringify(u));
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem("iy_session_v1");
  };

  // =========================
  // ✅ LOGIN CLIENTE (RUT)
  // =========================
  const loginUserByRut = async ({ rut, password }) => {
    ensureManagerSeed(); // por seguridad (si limpian localStorage)

    const u = findUserByRut(rut);
    if (!u) {
      const err = new Error("No existe");
      err.code = "NO_EXISTS";
      throw err;
    }

    if ((u.passwordHash || "") !== (password || "")) {
      const err = new Error("Clave incorrecta");
      err.code = "BAD_PASSWORD";
      throw err;
    }

    // estados solo aplican a clientes
    if (u.role !== "manager") {
      if (u.status === "pending") {
        const err = new Error("PENDING");
        err.code = "PENDING";
        throw err;
      }
      if (u.status === "rejected") {
        const err = new Error("REJECTED");
        err.code = "REJECTED";
        throw err;
      }
    }

    persist({
      id: u.id,
      role: u.role, // client
      profileType: u.profileType, // user | interpreter
      fullName: u.fullName,
      rut: u.rut,
      email: u.email,
      status: u.status,
    });

    return u;
  };

  // =========================
  // ✅ LOGIN GERENTE (EMAIL)
  // =========================
  const loginManagerByEmail = async ({ email, password }) => {
    ensureManagerSeed();

    const e = (email || "").trim().toLowerCase();
    const u = findUserByEmail(e);

    if (!u) {
      const err = new Error("No existe");
      err.code = "NO_EXISTS";
      throw err;
    }

    if ((u.passwordHash || "") !== (password || "")) {
      const err = new Error("Clave incorrecta");
      err.code = "BAD_PASSWORD";
      throw err;
    }

    if (u.role !== "manager") {
      const err = new Error("NOT_MANAGER");
      err.code = "NOT_MANAGER";
      throw err;
    }

    if (u.status !== "active") {
      const err = new Error("NOT_ACTIVE");
      err.code = "NOT_ACTIVE";
      throw err;
    }

    persist({
      id: u.id,
      role: "manager",
      profileType: "manager",
      fullName: u.fullName,
      rut: u.rut,
      email: u.email,
      status: u.status,
    });

    return u;
  };

  // =========================
  // ✅ REGISTER (clientes)
  // =========================
  const register = async ({ profileType, fullName, rut, email, password }) => {
    ensureManagerSeed();
    createUser({ profileType, fullName, rut, email, password });
    return true;
  };

  // ✅ Aliases para que tus pantallas usen nombres simples
  const login = loginUserByRut; // /login usa login()
  const loginManager = loginManagerByEmail; // /login-gerente usa loginManager()

  // ✅ FIX Vercel: agregar dependencias completas
  const value = useMemo(
    () => ({
      user,
      login, // cliente rut
      loginManager, // gerente email
      loginUserByRut,
      loginManagerByEmail,
      register,
      logout,
    }),
    [user, login, loginManager, loginUserByRut, loginManagerByEmail, register, logout]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
