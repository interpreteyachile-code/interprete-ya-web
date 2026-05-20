import { supabase } from "./supabaseClient";

// LOGIN GERENTE
export async function loginManager(email, password) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", email)
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

// REGISTER
export async function registerUser(payload) {
  const { data, error } = await supabase
    .from("profiles")
    .insert([
      {
        full_name: payload.fullName,
        rut: payload.rut,
        email: payload.email,
        password_demo: payload.password,
        profile_type: payload.profileType,
        role: "client",
        status: "pending",
      },
    ])
    .select()
    .single();

  if (error) throw error;

  return data;
}