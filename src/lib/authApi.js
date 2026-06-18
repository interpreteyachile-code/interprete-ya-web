import { supabase } from "./supabaseClient";

function cleanEmail(email) {
  return String(email || "").trim().toLowerCase();
}

// LOGIN GERENTE
export async function loginManager(email, password) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", cleanEmail(email))
    .eq("password_demo", password)
    .eq("role", "manager")
    .single();

  if (error) throw error;
  return data;
}

// LOGIN CLIENTE / INTERPRETE
export async function loginByRut(rut, password) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("rut", rut)
    .eq("password_demo", password)
    .single();

  if (error) throw error;
  return data;
}

// REGISTER USUARIO / INTERPRETE
export async function registerUser(payload) {
  const email = cleanEmail(payload.email);

  // Evitar duplicados claros
  const { data: existsRut } = await supabase
    .from("profiles")
    .select("id")
    .eq("rut", payload.rut)
    .maybeSingle();

  if (existsRut) throw new Error("RUT ya existe");

  const { data: existsEmail } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existsEmail) throw new Error("Email ya existe");

  const isInterpreter = payload.profileType === "interpreter";

  const { data, error } = await supabase
    .from("profiles")
    .insert([
      {
        full_name: payload.fullName,
        rut: payload.rut,
        email,
        password_demo: payload.password,

        // IMPORTANTE
        role: "client",
        profile_type: isInterpreter ? "interpreter" : "user",
        status: "pending",

        // AQUÍ estaba faltando
        interpreter_profile: isInterpreter
          ? payload.interpreterProfile || {
              certification: "",
              years: 0,
              specialty: "general",
              note: "",
            }
          : null,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  return data;
}