import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  loginManager,
  loginByRut,
  registerUser,
} from "../lib/authApi";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("iy_session_v1");

      if (raw) {
        setUser(JSON.parse(raw));
      }
    } catch {}
  }, []);

  const persist = (u) => {
    setUser(u);

    localStorage.setItem(
      "iy_session_v1",
      JSON.stringify(u)
    );
  };

  const logout = async () => {
    setUser(null);

    localStorage.removeItem("iy_session_v1");
  };

  // LOGIN CLIENTE
  const login = async ({ rut, password }) => {
    const u = await loginByRut(rut, password);

    if (!u) {
      throw new Error("Usuario no encontrado");
    }

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

    persist({
      id: u.id,
      role: u.role,
      profileType: u.profile_type,
      fullName: u.full_name,
      rut: u.rut,
      email: u.email,
      status: u.status,
    });

    return u;
  };

  // LOGIN GERENTE
  const loginManagerByEmail = async ({
    email,
    password,
  }) => {
    const u = await loginManager(email, password);

    if (!u) {
      throw new Error("Gerente no encontrado");
    }

    persist({
      id: u.id,
      role: u.role,
      profileType: u.profile_type,
      fullName: u.full_name,
      rut: u.rut,
      email: u.email,
      status: u.status,
    });

    return u;
  };

  // REGISTER
  const register = async ({
    profileType,
    fullName,
    rut,
    email,
    password,
  }) => {
    return await registerUser({
      profileType,
      fullName,
      rut,
      email,
      password,
    });
  };

  const value = useMemo(
    () => ({
      user,
      login,
      loginManager: loginManagerByEmail,
      register,
      logout,
    }),
    [user]
  );

  return (
    <AuthCtx.Provider value={value}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}