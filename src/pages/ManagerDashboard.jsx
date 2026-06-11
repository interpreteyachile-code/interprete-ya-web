import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { supabase } from "../lib/supabaseClient";

function Chip({ children }) {
  return <span className="tron-chip">{children}</span>;
}

function cx(...arr) {
  return arr.filter(Boolean).join(" ");
}

function moneyCLP(n) {
  return "$" + Number(n || 0).toLocaleString("es-CL");
}

function MetricCard({ label, value, hint }) {
  return (
    <div className="panel-mini">
      <div className="panel-label">{label}</div>
      <div className="panel-stat mt-2">{value}</div>
      {hint ? <div className="text-xs text-white/50 mt-1">{hint}</div> : null}
    </div>
  );
}

function Modal({ open, onClose, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="w-full max-w-5xl tron-card p-5 md:p-6 relative">
          <button
            className="tron-btn px-4 py-2 absolute right-4 top-4 z-10"
            onClick={onClose}
          >
            ✖
          </button>
          {children}
        </div>
      </div>
    </div>
  );
}

function statusUserLabel(status) {
  return status === "pending"
    ? "⏳ Pendiente"
    : status === "active"
    ? "✅ Activo"
    : status === "blocked"
    ? "🚫 Bloqueado"
    : status === "rejected"
    ? "⛔ Rechazado"
    : "—";
}

function statusServiceLabel(status) {
  return status === "created"
    ? "🧾 Creado"
    : status === "matched"
    ? "🤝 Conectado"
    : status === "started"
    ? "🔳 En curso"
    : status === "finished"
    ? "🏁 Finalizado"
    : status === "paid"
    ? "💳 Pagado"
    : status === "rated"
    ? "⭐ Evaluado"
    : status === "cancelled"
    ? "⛔ Cancelado"
    : "—";
}

function modeLabel(mode) {
  return mode === "video"
    ? "🎥 Video"
    : mode === "schedule"
    ? "📅 Agenda"
    : "⚡ Ahora";
}

function specialtyLabel(specialty) {
  return specialty === "salud"
    ? "🏥 Salud"
    : specialty === "educacion"
    ? "🏫 Educación"
    : specialty === "legal"
    ? "⚖️ Legal"
    : specialty === "empresa"
    ? "🏢 Empresa"
    : "🧩 General";
}

function mapProfile(u) {
  return {
    ...u,
    fullName: u.full_name || u.fullName || "",
    profileType: u.profile_type || u.profileType || "user",
    interpreterProfile: u.interpreter_profile || u.interpreterProfile || null,
    createdAt: u.created_at || u.createdAt || 0,
  };
}

function mapService(s) {
  return {
    ...s,
    clientName: s.client_name || s.clientName || "",
    interpreterName: s.interpreter_name || s.interpreterName || "",
    amountCLP: s.amount_clp ?? s.amountCLP ?? 0,
    startCode: s.start_code || s.startCode || "",
    endCode: s.end_code || s.endCode || "",
    createdAt: s.created_at || s.createdAt || 0,
  };
}

function mapPayment(p) {
  return {
    ...p,
    userName: p.user_name || p.userName || "",
    amountCLP: p.amount_clp ?? p.amountCLP ?? 0,
    createdAt: p.created_at || p.createdAt || 0,
  };
}

export default function ManagerDashboard() {
  const nav = useNavigate();
  const { user } = useAuth();

  const [tab, setTab] = useState("accounts");
  const [q, setQ] = useState("");

  const [accStatus, setAccStatus] = useState("pending");
  const [accType, setAccType] = useState("all");

  const [svcStatus, setSvcStatus] = useState("all");
  const [svcMode, setSvcMode] = useState("all");

  const [accountsData, setAccountsData] = useState([]);
  const [servicesData, setServicesData] = useState([]);
  const [paymentsData, setPaymentsData] = useState([]);

  const [selectedService, setSelectedService] = useState(null);
  const [selectedInterpreterId, setSelectedInterpreterId] = useState("");

  const [editUser, setEditUser] = useState(null);
  const [editFullName, setEditFullName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRut, setEditRut] = useState("");
  const [editProfileType, setEditProfileType] = useState("user");
  const [editStatus, setEditStatus] = useState("pending");

  const isLogged = !!user;
  const isManager = user?.role === "manager";

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    await Promise.all([loadProfiles(), loadServices(), loadPayments()]);
  }

  async function loadProfiles() {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log("profiles error:", error);
      return;
    }

    setAccountsData((data || []).map(mapProfile));
  }

  async function loadServices() {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log("services error:", error);
      return;
    }

    setServicesData((data || []).map(mapService));
  }

  async function loadPayments() {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log("payments error:", error);
      return;
    }

    setPaymentsData((data || []).map(mapPayment));
  }

  const allClients = useMemo(() => {
    return accountsData.filter((u) => u.role !== "manager");
  }, [accountsData]);

  const activeInterpreters = useMemo(() => {
    return accountsData.filter(
      (u) => u.profileType === "interpreter" && u.status === "active"
    );
  }, [accountsData]);

  const accounts = useMemo(() => {
    const query = (q || "").trim().toLowerCase();

    return allClients
      .filter((u) => (accStatus === "all" ? true : u.status === accStatus))
      .filter((u) => (accType === "all" ? true : u.profileType === accType))
      .filter((u) => {
        if (!query) return true;
        return (
          (u.fullName || "").toLowerCase().includes(query) ||
          (u.rut || "").toLowerCase().includes(query) ||
          (u.email || "").toLowerCase().includes(query)
        );
      });
  }, [allClients, q, accStatus, accType]);

  const accCounts = useMemo(() => {
    return {
      pending: allClients.filter((u) => u.status === "pending").length,
      active: allClients.filter((u) => u.status === "active").length,
      rejected: allClients.filter((u) => u.status === "rejected").length,
      blocked: allClients.filter((u) => u.status === "blocked").length,
      users: allClients.filter((u) => u.profileType === "user").length,
      interpreters: allClients.filter((u) => u.profileType === "interpreter").length,
    };
  }, [allClients]);

  const allServices = useMemo(() => servicesData, [servicesData]);

  const services = useMemo(() => {
    const query = (q || "").trim().toLowerCase();

    return allServices
      .filter((s) => (svcStatus === "all" ? true : s.status === svcStatus))
      .filter((s) => (svcMode === "all" ? true : s.mode === svcMode))
      .filter((s) => {
        if (!query) return true;
        return (
          (s.clientName || "").toLowerCase().includes(query) ||
          (s.interpreterName || "").toLowerCase().includes(query) ||
          String(s.id || "").toLowerCase().includes(query)
        );
      });
  }, [allServices, q, svcStatus, svcMode]);

  const svcCounts = useMemo(() => {
    const by = (status) => allServices.filter((s) => s.status === status).length;

    return {
      created: by("created"),
      matched: by("matched"),
      started: by("started"),
      finished: by("finished"),
      paid: by("paid"),
      rated: by("rated"),
      waitingAssign: allServices.filter(
        (s) => s.status === "paid" && !s.interpreter_id
      ).length,
    };
  }, [allServices]);

  const selectedServicePayments = useMemo(() => {
    if (!selectedService?.id) return [];
    return paymentsData.filter((p) => p.ref_id === selectedService.id);
  }, [selectedService, paymentsData]);

  const selectedServicePayment = useMemo(() => {
    if (!selectedServicePayments.length) return null;
    return [...selectedServicePayments].sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    )[0];
  }, [selectedServicePayments]);

  if (!isLogged) {
    return <div className="tron-card p-6 max-w-xl mx-auto">🔒 Debes iniciar sesión.</div>;
  }

  if (!isManager) {
    return <div className="tron-card p-6 max-w-xl mx-auto">🔒 Solo gerente.</div>;
  }

  const setAccountStatus = async (id, status) => {
    const { error } = await supabase.from("profiles").update({ status }).eq("id", id);

    if (error) {
      console.log(error);
      alert("❌ Error actualizando usuario");
      return;
    }

    await loadProfiles();
    alert("✅ Estado actualizado");
  };

  const deleteAccount = async (id, name) => {
    const ok = window.confirm(
      `¿Seguro que quieres eliminar a ${name || "este usuario"}?\n\nEsta acción no se puede deshacer.`
    );

    if (!ok) return;

    const { error } = await supabase.from("profiles").delete().eq("id", id);

    if (error) {
      console.log(error);
      alert("❌ No se pudo eliminar usuario.");
      return;
    }

    await loadProfiles();
    alert("✅ Usuario eliminado.");
  };

  const openEditUser = (u) => {
    setEditUser(u);
    setEditFullName(u.fullName || "");
    setEditEmail(u.email || "");
    setEditRut(u.rut || "");
    setEditProfileType(u.profileType || "user");
    setEditStatus(u.status || "pending");
  };

  const saveEditUser = async () => {
    if (!editUser) return;

    if (!editFullName.trim()) {
      alert("⚠️ Falta nombre.");
      return;
    }

    if (!editEmail.trim()) {
      alert("⚠️ Falta correo.");
      return;
    }

    if (!editRut.trim()) {
      alert("⚠️ Falta RUT.");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: editFullName.trim(),
        email: editEmail.trim().toLowerCase(),
        rut: editRut.trim(),
        profile_type: editProfileType,
        status: editStatus,
      })
      .eq("id", editUser.id);

    if (error) {
      console.log(error);
      alert("❌ No se pudo editar usuario.");
      return;
    }

    setEditUser(null);
    await loadProfiles();
    alert("✅ Usuario actualizado.");
  };

  const setServicePatch = async (id, patch) => {
    const dbPatch = {};

    if (patch.status !== undefined) dbPatch.status = patch.status;
    if (patch.finishedAt !== undefined) dbPatch.finished_at = new Date(patch.finishedAt).toISOString();
    if (patch.paidAt !== undefined) dbPatch.paid_at = new Date(patch.paidAt).toISOString();
    if (patch.ratedAt !== undefined) dbPatch.rated_at = new Date(patch.ratedAt).toISOString();
    if (patch.rating !== undefined) dbPatch.rating = patch.rating;
    if (patch.interpreterId !== undefined) dbPatch.interpreter_id = patch.interpreterId;
    if (patch.interpreterName !== undefined) dbPatch.interpreter_name = patch.interpreterName;

    const { data, error } = await supabase
      .from("services")
      .update(dbPatch)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.log(error);
      alert("❌ Error actualizando servicio");
      return;
    }

    const next = mapService(data);
    setSelectedService((s) => (s && s.id === id ? next : s));
    await loadServices();
  };

  const openService = (service) => {
    setSelectedService(service);
    setSelectedInterpreterId(service?.interpreter_id || "");
  };

  const assignInterpreter = async () => {
    if (!selectedService) return;

    if (!selectedInterpreterId) {
      alert("Selecciona un intérprete.");
      return;
    }

    const selectedInterpreter = activeInterpreters.find(
      (i) => i.id === selectedInterpreterId
    );

    if (!selectedInterpreter) {
      alert("No se encontró el intérprete seleccionado.");
      return;
    }

    await setServicePatch(selectedService.id, {
      interpreterId: selectedInterpreter.id,
      interpreterName: selectedInterpreter.fullName,
      status: "matched",
    });

    alert("✅ Intérprete asignado correctamente");
  };

  return (
    <div className="grid gap-4">
      <div className="tron-card p-5 md:p-6">
        <div className="panel-head">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-2xl md:text-3xl font-semibold h-title">
                AETHER | PANEL GERENTE BETA
              </div>
              <div className="text-white/70 mt-2">
                Centro operativo real conectado a Supabase.
              </div>
            </div>

            <div className="panel-mini min-w-[220px]">
              <div className="panel-label">System operator</div>
              <div className="text-sm font-semibold mt-2">{user.fullName}</div>
              <div className="text-xs text-white/55 mt-1">{user.email}</div>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-6 gap-3">
          <MetricCard label="Pending" value={accCounts.pending} hint="Por revisar" />
          <MetricCard label="Active" value={accCounts.active} hint="Habilitados" />
          <MetricCard label="Blocked" value={accCounts.blocked} hint="Bloqueados" />
          <MetricCard label="Interpreters" value={accCounts.interpreters} hint="Intérpretes" />
          <MetricCard label="Paid services" value={svcCounts.paid} hint="Pagados" />
          <MetricCard label="Waiting assign" value={svcCounts.waitingAssign} hint="Sin intérprete" />
        </div>

        <div className="mt-4 glow-line" />

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            className={cx("tron-btn px-4 py-2", tab === "accounts" && "tron-primary")}
            onClick={() => setTab("accounts")}
          >
            👤 Cuentas
          </button>

          <button
            className={cx("tron-btn px-4 py-2", tab === "services" && "tron-primary")}
            onClick={() => setTab("services")}
          >
            🧾 Servicios
          </button>

          <button className="tron-btn px-4 py-2" onClick={() => nav("/gerente/pagos")}>
            💳 Ver pagos
          </button>

          <button className="tron-btn px-4 py-2" onClick={loadAll}>
            🔄 Actualizar
          </button>

          <div className="flex-1" />

          <input
            className="tron-input w-full sm:w-[340px]"
            placeholder="🔎 Buscar nombre / rut / correo / id"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      {tab === "accounts" && (
        <div className="grid gap-3">
          <div className="tron-card p-5">
            <div className="panel-head">
              <div className="text-xl font-semibold h-title">Client records</div>
            </div>

            <div className="grid md:grid-cols-3 gap-2">
              <select
                className="tron-select"
                value={accStatus}
                onChange={(e) => setAccStatus(e.target.value)}
              >
                <option value="pending">⏳ Pendientes</option>
                <option value="active">✅ Activos</option>
                <option value="blocked">🚫 Bloqueados</option>
                <option value="rejected">⛔ Rechazados</option>
                <option value="all">🧩 Todos</option>
              </select>

              <select
                className="tron-select"
                value={accType}
                onChange={(e) => setAccType(e.target.value)}
              >
                <option value="all">🧩 Tipo: Todos</option>
                <option value="user">🧏‍♀️ Usuario</option>
                <option value="interpreter">🧑‍💼 Intérprete</option>
              </select>

              <button
                className="tron-btn tron-muted font-semibold"
                onClick={() => {
                  setQ("");
                  setAccStatus("pending");
                  setAccType("all");
                }}
              >
                🧹 Limpiar
              </button>
            </div>
          </div>

          {accounts.length === 0 ? (
            <div className="tron-card p-6 text-white/70">No hay resultados.</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              {accounts.map((u) => (
                <div key={u.id} className="tron-card p-5">
                  <div className="panel-head">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-lg">{u.fullName}</div>
                        <div className="text-sm text-white/70 mt-1">
                          {u.profileType === "interpreter"
                            ? "🧑‍💼 Intérprete"
                            : "🧏‍♀️ Usuario"}{" "}
                          • 🪪 <b>{u.rut}</b>
                        </div>
                        <div className="text-xs text-white/55 mt-1">📧 {u.email}</div>
                      </div>

                      <Chip>{statusUserLabel(u.status)}</Chip>
                    </div>
                  </div>

                  {u.profileType === "interpreter" && u.interpreterProfile && (
                    <div className="panel-mini mt-3">
                      <div className="panel-label">Interpreter profile</div>

                      <div className="text-xs text-white/75 mt-3">
                        📜 Certificación:{" "}
                        <b>{u.interpreterProfile.certification || "—"}</b>
                      </div>

                      <div className="text-xs text-white/75 mt-1">
                        🕒 Años experiencia:{" "}
                        <b>{u.interpreterProfile.years ?? 0}</b>
                      </div>

                      <div className="text-xs text-white/75 mt-1">
                        🧩 Especialidad:{" "}
                        <b>{specialtyLabel(u.interpreterProfile.specialty)}</b>
                      </div>

                      {u.interpreterProfile.note && (
                        <div className="text-xs text-white/60 mt-2">
                          📝 {u.interpreterProfile.note}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      className="tron-btn tron-primary font-semibold py-3"
                      onClick={() => setAccountStatus(u.id, "active")}
                    >
                      ✅ Aprobar
                    </button>

                    <button
                      className="tron-btn tron-danger font-semibold py-3"
                      onClick={() => setAccountStatus(u.id, "rejected")}
                    >
                      ⛔ Rechazar
                    </button>

                    <button
                      className="tron-btn tron-muted font-semibold py-3"
                      onClick={() => setAccountStatus(u.id, "blocked")}
                    >
                      🚫 Bloquear
                    </button>

                    <button
                      className="tron-btn font-semibold py-3"
                      onClick={() => setAccountStatus(u.id, "pending")}
                    >
                      ↩️ Pendiente
                    </button>
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button
                      className="tron-btn tron-muted font-semibold py-3"
                      onClick={() => openEditUser(u)}
                    >
                      ✏️ Editar
                    </button>

                    <button
                      className="tron-btn tron-danger font-semibold py-3"
                      onClick={() => deleteAccount(u.id, u.fullName)}
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "services" && (
        <div className="grid gap-3">
          <div className="tron-card p-5">
            <div className="panel-head">
              <div className="text-xl font-semibold h-title">Service registry</div>
            </div>

            <div className="grid md:grid-cols-3 gap-2">
              <select
                className="tron-select"
                value={svcStatus}
                onChange={(e) => setSvcStatus(e.target.value)}
              >
                <option value="all">🧩 Estado: Todos</option>
                <option value="created">🧾 Creado</option>
                <option value="matched">🤝 Conectado</option>
                <option value="started">🔳 En curso</option>
                <option value="finished">🏁 Finalizado</option>
                <option value="paid">💳 Pagado</option>
                <option value="rated">⭐ Evaluado</option>
              </select>

              <select
                className="tron-select"
                value={svcMode}
                onChange={(e) => setSvcMode(e.target.value)}
              >
                <option value="all">🧩 Modo: Todos</option>
                <option value="now">⚡ Ahora</option>
                <option value="schedule">📅 Agenda</option>
                <option value="video">🎥 Video</option>
              </select>

              <button
                className="tron-btn tron-muted font-semibold"
                onClick={() => {
                  setQ("");
                  setSvcStatus("all");
                  setSvcMode("all");
                }}
              >
                🧹 Limpiar
              </button>
            </div>
          </div>

          {services.length === 0 ? (
            <div className="tron-card p-6 text-white/70">
              No hay servicios con esos filtros.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              {services.map((s) => (
                <button
                  key={s.id}
                  className="tron-btn w-full text-left"
                  onClick={() => openService(s)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold">
                        {statusServiceLabel(s.status)} • {modeLabel(s.mode)}
                      </div>

                      <div className="text-xs text-white/60 mt-1">
                        Cliente: <b>{s.clientName || "—"}</b> • 💳{" "}
                        {moneyCLP(s.amountCLP)}
                      </div>

                      <div className="text-xs text-white/55 mt-1">
                        Intérprete: <b>{s.interpreterName || "—"}</b> • ID{" "}
                        {String(s.id).slice(0, 6)}…
                      </div>
                    </div>

                    <Chip>
                      {s.mode === "video" ? "🎥" : s.mode === "schedule" ? "📅" : "⚡"}
                    </Chip>
                  </div>
                </button>
              ))}
            </div>
          )}

          <Modal open={!!selectedService} onClose={() => setSelectedService(null)}>
            {!selectedService ? null : (
              <div>
                <div className="panel-head">
                  <div className="text-2xl font-semibold h-title">Service detail</div>
                  <div className="text-white/70 mt-2">
                    {statusServiceLabel(selectedService.status)} •{" "}
                    {modeLabel(selectedService.mode)}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Chip>Cliente: {selectedService.clientName || "—"}</Chip>
                  <Chip>Intérprete: {selectedService.interpreterName || "—"}</Chip>
                  <Chip>💳 {moneyCLP(selectedService.amountCLP)}</Chip>
                  <Chip>🔳 Inicio: {selectedService.startCode}</Chip>
                  <Chip>🔳 Fin: {selectedService.endCode}</Chip>
                </div>

                {selectedServicePayment ? (
                  <div className="panel-mini mt-4">
                    <div className="panel-label">Payment overview</div>
                    <div className="text-sm text-white/75 mt-3">
                      Estado: <b>{selectedServicePayment.status || "—"}</b>
                    </div>
                    <div className="text-sm text-white/75 mt-1">
                      Método: <b>{selectedServicePayment.method || "demo"}</b>
                    </div>
                    <div className="text-sm text-white/75 mt-1">
                      Usuario: <b>{selectedServicePayment.userName || "—"}</b>
                    </div>
                    <div className="text-sm text-white/75 mt-1">
                      Monto: <b>{moneyCLP(selectedServicePayment.amountCLP)}</b>
                    </div>
                  </div>
                ) : (
                  <div className="panel-mini mt-4 text-white/70">
                    ⚠️ Este servicio aún no tiene pago asociado.
                  </div>
                )}

                <div className="mt-4 tron-card p-5">
                  <div className="panel-head">
                    <div className="text-lg font-semibold h-title">
                      Interpreter registry
                    </div>
                  </div>

                  <div className="grid md:grid-cols-[1fr_auto] gap-2">
                    <select
                      className="tron-select"
                      value={selectedInterpreterId}
                      onChange={(e) => setSelectedInterpreterId(e.target.value)}
                    >
                      <option value="">Selecciona intérprete activo</option>
                      {activeInterpreters.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.fullName}
                        </option>
                      ))}
                    </select>

                    <button
                      className="tron-btn tron-primary px-4 py-3 font-semibold"
                      onClick={assignInterpreter}
                    >
                      ✅ Asignar
                    </button>
                  </div>
                </div>

                {selectedService.mode === "video" && (
                  <div className="mt-4 tron-card p-5">
                    <div className="panel-head">
                      <div className="text-lg font-semibold h-title">
                        Video call center
                      </div>
                    </div>

                    <button
                      className="tron-btn tron-primary w-full py-3 font-semibold"
                      onClick={() => nav(`/video/${selectedService.id}`)}
                    >
                      🎥 Abrir videollamada dentro de InterpreteYa
                    </button>
                  </div>
                )}

                <div className="mt-4 glow-line" />

                <div className="mt-4 grid md:grid-cols-3 gap-2">
                  <button
                    className="tron-btn tron-muted font-semibold py-3"
                    onClick={() =>
                      setServicePatch(selectedService.id, {
                        status: "finished",
                        finishedAt: Date.now(),
                      })
                    }
                  >
                    🏁 Marcar Finalizado
                  </button>

                  <button
                    className="tron-btn tron-primary font-semibold py-3"
                    onClick={() =>
                      setServicePatch(selectedService.id, {
                        status: "paid",
                        paidAt: Date.now(),
                      })
                    }
                  >
                    💳 Marcar Pagado
                  </button>

                  <button
                    className="tron-btn font-semibold py-3"
                    onClick={() =>
                      setServicePatch(selectedService.id, {
                        status: "rated",
                        ratedAt: Date.now(),
                        rating: 5,
                      })
                    }
                  >
                    ⭐ Marcar Evaluado
                  </button>
                </div>
              </div>
            )}
          </Modal>
        </div>
      )}

      <Modal open={!!editUser} onClose={() => setEditUser(null)}>
        {!editUser ? null : (
          <div>
            <div className="panel-head">
              <div className="text-2xl font-semibold h-title">✏️ Editar cuenta</div>
              <div className="text-white/70 mt-2">
                Solo gerente puede modificar datos de usuarios e intérpretes.
              </div>
            </div>

            <div className="grid gap-3">
              <div>
                <label className="text-sm text-white/70">Nombre completo</label>
                <input
                  className="tron-input mt-1"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm text-white/70">Correo</label>
                <input
                  className="tron-input mt-1"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm text-white/70">RUT</label>
                <input
                  className="tron-input mt-1"
                  value={editRut}
                  onChange={(e) => setEditRut(e.target.value)}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-white/70">Tipo</label>
                  <select
                    className="tron-select mt-1"
                    value={editProfileType}
                    onChange={(e) => setEditProfileType(e.target.value)}
                  >
                    <option value="user">🧏‍♀️ Usuario</option>
                    <option value="interpreter">🧑‍💼 Intérprete</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-white/70">Estado</label>
                  <select
                    className="tron-select mt-1"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                  >
                    <option value="pending">⏳ Pendiente</option>
                    <option value="active">✅ Activo</option>
                    <option value="blocked">🚫 Bloqueado</option>
                    <option value="rejected">⛔ Rechazado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                <button
                  className="tron-btn tron-muted py-3 font-semibold"
                  onClick={() => setEditUser(null)}
                >
                  ⬅️ Cancelar
                </button>

                <button
                  className="tron-btn tron-primary py-3 font-semibold"
                  onClick={saveEditUser}
                >
                  ✅ Guardar cambios
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}