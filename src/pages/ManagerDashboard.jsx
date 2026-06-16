import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { supabase } from "../lib/supabaseClient";

function Chip({ children }) {
  return <span className="tron-chip">{children}</span>;
}

function moneyCLP(n) {
  return "$" + Number(n || 0).toLocaleString("es-CL");
}

function userStatus(status) {
  return status === "active" ? "✅ Activo"
    : status === "pending" ? "⏳ Pendiente"
    : status === "rejected" ? "⛔ Rechazado"
    : status === "blocked" ? "🚫 Lista negra"
    : status === "deleted" ? "🗑️ Eliminado"
    : "—";
}

function serviceStatus(status) {
  return status === "paid" ? "💳 Pagado"
    : status === "matched" ? "🤝 Asignado"
    : status === "started" ? "🔳 En curso"
    : status === "finished" ? "🏁 Finalizado"
    : status === "rated" ? "⭐ Evaluado"
    : status === "cancelled" ? "⛔ Cancelado"
    : "🧾 Creado";
}

function modeLabel(mode) {
  return mode === "video" ? "🎥 Video" : mode === "schedule" ? "📅 Agenda" : "⚡ Ahora";
}

function mapProfile(u) {
  return {
    ...u,
    fullName: u.full_name || "",
    profileType: u.profile_type || "user",
    adminNote: u.admin_note || "",
    deletedAt: u.deleted_at || null,
    blockedAt: u.blocked_at || null,
    blockedReason: u.blocked_reason || "",
  };
}

function mapService(s) {
  return {
    ...s,
    clientName: s.client_name || "",
    interpreterName: s.interpreter_name || "",
    amountCLP: s.amount_clp || 0,
    serviceType: s.service_type || "",
    videoRoom: s.video_room || "",
    priority: s.priority || "normal",
  };
}

export default function ManagerDashboard() {
  const nav = useNavigate();
  const { user } = useAuth();

  const [tab, setTab] = useState("accounts");
  const [profiles, setProfiles] = useState([]);
  const [services, setServices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [q, setQ] = useState("");
  const [filterStatus, setFilterStatus] = useState("pending");
  const [filterType, setFilterType] = useState("all");
  const [loading, setLoading] = useState(true);

  const [editUser, setEditUser] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedInterpreterId, setSelectedInterpreterId] = useState("");

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    await Promise.all([loadProfiles(), loadServices(), loadPayments()]);
    setLoading(false);
  }

  async function loadProfiles() {
    const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (error) return console.log(error);
    setProfiles((data || []).map(mapProfile));
  }

  async function loadServices() {
    const { data, error } = await supabase.from("services").select("*").order("created_at", { ascending: false });
    if (error) return console.log(error);
    setServices((data || []).map(mapService));
  }

  async function loadPayments() {
    const { data, error } = await supabase.from("payments").select("*").order("created_at", { ascending: false });
    if (error) return console.log(error);
    setPayments(data || []);
  }

  if (!user) return <div className="tron-card p-6">🔒 Debes iniciar sesión.</div>;
  if (user.role !== "manager") return <div className="tron-card p-6">🔒 Solo gerente.</div>;

  const clients = profiles.filter((p) => p.role !== "manager");

  const activeInterpreters = clients.filter(
    (u) => u.profileType === "interpreter" && u.status === "active"
  );

  const sortedServices = [...services].sort((a, b) => {
    if (a.priority === "high" && b.priority !== "high") return -1;
    if (a.priority !== "high" && b.priority === "high") return 1;
    if (a.status === "paid" && !a.interpreter_id && !(b.status === "paid" && !b.interpreter_id)) return -1;
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });

  const visibleUsers = clients
    .filter((u) => filterStatus === "all" ? u.status !== "deleted" : u.status === filterStatus)
    .filter((u) => filterType === "all" ? true : u.profileType === filterType)
    .filter((u) => {
      const s = q.toLowerCase();
      return !s || u.fullName.toLowerCase().includes(s) || (u.email || "").toLowerCase().includes(s) || (u.rut || "").toLowerCase().includes(s);
    });

  const stats = {
    pending: clients.filter((u) => u.status === "pending").length,
    active: clients.filter((u) => u.status === "active").length,
    rejected: clients.filter((u) => u.status === "rejected").length,
    blocked: clients.filter((u) => u.status === "blocked").length,
    deleted: clients.filter((u) => u.status === "deleted").length,
    sos: services.filter((s) => s.priority === "high" && s.status !== "finished").length,
    waiting: services.filter((s) => s.status === "paid" && !s.interpreter_id).length,
    money: payments.filter((p) => p.status === "paid").reduce((a, p) => a + Number(p.amount_clp || 0), 0),
  };

  async function updateUser(id, patch) {
    const { error } = await supabase.from("profiles").update(patch).eq("id", id);
    if (error) {
      alert("❌ Error actualizando usuario");
      console.log(error);
      return;
    }
    await loadProfiles();
  }

  async function setStatus(u, status) {
    if (!window.confirm(`¿Confirmas cambiar a ${u.fullName} → ${userStatus(status)}?`)) return;

    await updateUser(u.id, {
      status,
      deleted_at: status === "deleted" ? new Date().toISOString() : null,
      blocked_at: status === "blocked" ? new Date().toISOString() : null,
    });
  }

  async function assignInterpreter() {
    if (!selectedService) return;
    if (!selectedInterpreterId) return alert("⚠️ Selecciona intérprete");

    const intp = activeInterpreters.find((i) => i.id === selectedInterpreterId);
    if (!intp) return alert("❌ Intérprete no encontrado");

    const { error } = await supabase
      .from("services")
      .update({
        interpreter_id: intp.id,
        interpreter_name: intp.fullName,
        status: "matched",
        accepted_at: new Date().toISOString(),
        assigned_by: "manager",
      })
      .eq("id", selectedService.id);

    if (error) {
      console.log(error);
      alert("❌ No se pudo asignar");
      return;
    }

    setSelectedService(null);
    await loadServices();
    alert("✅ Intérprete asignado");
  }

  function UserCard({ u }) {
    return (
      <div className="tron-card p-5">
        <div className="flex justify-between gap-3">
          <div>
            <div className="font-semibold text-lg">{u.fullName || "Sin nombre"}</div>
            <div className="text-sm text-white/70">
              {u.profileType === "interpreter" ? "🧑‍💼 Intérprete" : "🧏 Usuario"} · {u.rut}
            </div>
            <div className="text-xs text-white/55">{u.email}</div>
          </div>
          <Chip>{userStatus(u.status)}</Chip>
        </div>

        {u.adminNote && <div className="panel-mini mt-3 text-sm">📝 {u.adminNote}</div>}
        {u.blockedAt && <div className="panel-mini mt-3 text-sm">🚫 Bloqueado: {new Date(u.blockedAt).toLocaleString("es-CL")}</div>}
        {u.deletedAt && <div className="panel-mini mt-3 text-sm">🗑️ Eliminado: {new Date(u.deletedAt).toLocaleString("es-CL")}</div>}

        <div className="grid grid-cols-2 gap-2 mt-4">
          <button className="tron-btn tron-primary" onClick={() => setStatus(u, "active")}>✅ Aprobar</button>
          <button className="tron-btn tron-danger" onClick={() => setStatus(u, "rejected")}>⛔ Rechazar</button>
          <button className="tron-btn tron-muted" onClick={() => setStatus(u, "blocked")}>🚫 Bloquear</button>
          <button className="tron-btn" onClick={() => setStatus(u, "pending")}>↩️ Pendiente</button>
          <button className="tron-btn tron-muted" onClick={() => setEditUser(u)}>✏️ Editar</button>
          <button className="tron-btn tron-danger" onClick={() => setStatus(u, "deleted")}>🗑️ Eliminar</button>
        </div>
      </div>
    );
  }

  function ServiceCard({ s }) {
    const urgent = s.priority === "high";
    const waiting = s.status === "paid" && !s.interpreter_id;

    return (
      <button
        className={"tron-btn w-full text-left " + (urgent ? "tron-danger" : "")}
        onClick={() => {
          setSelectedService(s);
          setSelectedInterpreterId(s.interpreter_id || "");
        }}
      >
        <div className="flex justify-between gap-3">
          <div>
            <div className="font-semibold">
              {urgent ? "🚨 SOS · " : ""}
              {serviceStatus(s.status)} · {modeLabel(s.mode)}
            </div>
            <div className="text-xs text-white/70 mt-1">
              Cliente: <b>{s.clientName || "—"}</b> · {moneyCLP(s.amountCLP)}
            </div>
            <div className="text-xs text-white/55 mt-1">
              Intérprete: <b>{s.interpreterName || "Sin asignar"}</b>
            </div>
            {s.videoRoom && <div className="text-xs text-white/55 mt-1">🎥 Sala: {s.videoRoom}</div>}
          </div>
          <Chip>{urgent ? "🚨 URGENTE" : waiting ? "⚠️ Sin intérprete" : serviceStatus(s.status)}</Chip>
        </div>
      </button>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="tron-card p-5">
        <div className="flex justify-between flex-wrap gap-4">
          <div>
            <div className="text-2xl font-semibold h-title">🧑‍💼 Panel Gerente PRO</div>
            <div className="text-white/70 mt-1">Control de cuentas, SOS, servicios y pagos.</div>
          </div>
          <button className="tron-btn tron-primary px-4" onClick={loadAll}>🔄 Actualizar</button>
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-8 gap-3 mt-4">
          <div className="panel-mini"><div className="panel-label">Pendientes</div><div className="panel-stat">{stats.pending}</div></div>
          <div className="panel-mini"><div className="panel-label">Activos</div><div className="panel-stat">{stats.active}</div></div>
          <div className="panel-mini"><div className="panel-label">Rechazados</div><div className="panel-stat">{stats.rejected}</div></div>
          <div className="panel-mini"><div className="panel-label">Lista negra</div><div className="panel-stat">{stats.blocked}</div></div>
          <div className="panel-mini"><div className="panel-label">Eliminados</div><div className="panel-stat">{stats.deleted}</div></div>
          <div className="panel-mini"><div className="panel-label">SOS</div><div className="panel-stat">{stats.sos}</div></div>
          <div className="panel-mini"><div className="panel-label">Sin asignar</div><div className="panel-stat">{stats.waiting}</div></div>
          <div className="panel-mini"><div className="panel-label">Pagos</div><div className="panel-stat text-sm">{moneyCLP(stats.money)}</div></div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button className={"tron-btn px-4 " + (tab === "accounts" ? "tron-primary" : "")} onClick={() => setTab("accounts")}>👥 Cuentas</button>
          <button className={"tron-btn px-4 " + (tab === "services" ? "tron-primary" : "")} onClick={() => setTab("services")}>🧾 Servicios / SOS</button>
          <button className="tron-btn px-4" onClick={() => nav("/gerente/pagos")}>💳 Pagos</button>
        </div>
      </div>

      {tab === "accounts" && (
        <div className="grid gap-3">
          <div className="tron-card p-4 grid md:grid-cols-3 gap-2">
            <input className="tron-input" placeholder="Buscar..." value={q} onChange={(e) => setQ(e.target.value)} />
            <select className="tron-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="pending">⏳ Pendientes</option>
              <option value="active">✅ Activos</option>
              <option value="rejected">⛔ Rechazados</option>
              <option value="blocked">🚫 Lista negra</option>
              <option value="deleted">🗑️ Eliminados</option>
              <option value="all">🧩 Todos sin eliminados</option>
            </select>
            <select className="tron-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="all">Todos</option>
              <option value="user">Usuarios</option>
              <option value="interpreter">Intérpretes</option>
            </select>
          </div>

          {loading ? <div className="tron-card p-6">Cargando...</div> : (
            <div className="grid md:grid-cols-2 gap-3">
              {visibleUsers.map((u) => <UserCard key={u.id} u={u} />)}
            </div>
          )}
        </div>
      )}

      {tab === "services" && (
        <div className="grid md:grid-cols-2 gap-3">
          {sortedServices.map((s) => <ServiceCard key={s.id} s={s} />)}
        </div>
      )}

      {selectedService && (
        <div className="fixed inset-0 bg-black/80 z-50 grid place-items-center p-4">
          <div className="tron-card p-6 max-w-3xl w-full">
            <div className="text-2xl h-title">🧾 Detalle servicio</div>
            <div className="mt-3 text-white/70">
              {selectedService.priority === "high" && "🚨 SOS · "}
              {serviceStatus(selectedService.status)} · {modeLabel(selectedService.mode)}
            </div>

            <div className="panel-mini mt-4">
              Cliente: <b>{selectedService.clientName || "—"}</b><br />
              Monto: <b>{moneyCLP(selectedService.amountCLP)}</b><br />
              Sala: <b>{selectedService.videoRoom || "—"}</b><br />
              Intérprete: <b>{selectedService.interpreterName || "Sin asignar"}</b>
            </div>

            <div className="grid md:grid-cols-[1fr_auto] gap-2 mt-4">
              <select className="tron-select" value={selectedInterpreterId} onChange={(e) => setSelectedInterpreterId(e.target.value)}>
                <option value="">Selecciona intérprete activo</option>
                {activeInterpreters.map((i) => (
                  <option key={i.id} value={i.id}>{i.fullName}</option>
                ))}
              </select>
              <button className="tron-btn tron-primary px-4" onClick={assignInterpreter}>✅ Asignar</button>
            </div>

            {selectedService.videoRoom && (
              <button
                className="tron-btn tron-primary w-full mt-3 py-3"
                onClick={() => window.open(`https://meet.jit.si/${selectedService.videoRoom}`, "_blank")}
              >
                🎥 Abrir videollamada
              </button>
            )}

            <button className="tron-btn tron-muted w-full mt-3 py-3" onClick={() => setSelectedService(null)}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      {editUser && (
        <div className="fixed inset-0 bg-black/80 z-50 grid place-items-center p-4">
          <div className="tron-card p-6 max-w-xl w-full">
            <div className="text-2xl h-title">✏️ Editar usuario</div>
            <div className="mt-4 grid gap-2">
              <input className="tron-input" defaultValue={editUser.fullName} onBlur={(e) => (editUser.fullName = e.target.value)} />
              <input className="tron-input" defaultValue={editUser.email} onBlur={(e) => (editUser.email = e.target.value)} />
              <textarea className="tron-input" defaultValue={editUser.adminNote} onBlur={(e) => (editUser.adminNote = e.target.value)} />
              <button
                className="tron-btn tron-primary"
                onClick={async () => {
                  await updateUser(editUser.id, {
                    full_name: editUser.fullName,
                    email: editUser.email,
                    admin_note: editUser.adminNote,
                  });
                  setEditUser(null);
                }}
              >
                ✅ Guardar
              </button>
              <button className="tron-btn tron-muted" onClick={() => setEditUser(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}