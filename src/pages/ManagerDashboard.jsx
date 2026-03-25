import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { listUsers, updateUserStatus } from "../data/demoStore";
import { listServices, updateService } from "../data/servicesStore";
import { getPaymentsByRefId } from "../data/paymentsStore";

function Chip({ children }) {
  return <span className="tron-chip">{children}</span>;
}

function cx(...arr) {
  return arr.filter(Boolean).join(" ");
}

function moneyCLP(n) {
  return "$" + Number(n || 0).toLocaleString("es-CL");
}

function Modal({ open, onClose, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="w-full max-w-3xl tron-card p-6 relative">
          <button
            className="tron-btn px-4 py-2 absolute right-4 top-4"
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
    : "⛔ Rechazado";
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

export default function ManagerDashboard() {
  const nav = useNavigate();
  const { user } = useAuth();

  const [tick, setTick] = useState(0);
  const [tab, setTab] = useState("accounts");
  const [q, setQ] = useState("");

  const [accStatus, setAccStatus] = useState("pending");
  const [accType, setAccType] = useState("all");

  const [svcStatus, setSvcStatus] = useState("all");
  const [svcMode, setSvcMode] = useState("all");

  const [selectedService, setSelectedService] = useState(null);
  const [selectedInterpreterId, setSelectedInterpreterId] = useState("");

  const isLogged = !!user;
  const isManager = user?.role === "manager";

  const allClients = useMemo(() => {
    return listUsers().filter((u) => u.role !== "manager");
  }, [tick]);

  const activeInterpreters = useMemo(() => {
    return listUsers().filter(
      (u) => u.profileType === "interpreter" && u.status === "active"
    );
  }, [tick]);

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
      })
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [allClients, q, accStatus, accType]);

  const accCounts = useMemo(() => {
    return {
      pending: allClients.filter((u) => u.status === "pending").length,
      active: allClients.filter((u) => u.status === "active").length,
      rejected: allClients.filter((u) => u.status === "rejected").length,
    };
  }, [allClients]);

  const allServices = useMemo(() => {
    return [...listServices()].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [tick]);

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
    };
  }, [allServices]);

  const selectedServicePayments = useMemo(() => {
    if (!selectedService?.id) return [];
    return getPaymentsByRefId(selectedService.id);
  }, [selectedService]);

  const selectedServicePayment = useMemo(() => {
    if (!selectedServicePayments.length) return null;
    return [...selectedServicePayments].sort(
      (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
    )[0];
  }, [selectedServicePayments]);

  if (!isLogged) {
    return (
      <div className="tron-card p-6 max-w-xl mx-auto">
        🔒 Debes iniciar sesión.
      </div>
    );
  }

  if (!isManager) {
    return (
      <div className="tron-card p-6 max-w-xl mx-auto">
        🔒 Solo gerente.
      </div>
    );
  }

  const setAccountStatus = (id, status) => {
    updateUserStatus(id, status);
    setTick((x) => x + 1);
  };

  const setServicePatch = (id, patch) => {
    const next = updateService(id, patch);
    setSelectedService((s) => (s && s.id === id ? next : s));
    setTick((x) => x + 1);
  };

  const openService = (service) => {
    setSelectedService(service);
    setSelectedInterpreterId(service?.interpreterId || "");
  };

  const assignInterpreter = () => {
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

    const next = updateService(selectedService.id, {
      interpreterId: selectedInterpreter.id,
      interpreterName: selectedInterpreter.fullName,
      status: "matched",
    });

    setSelectedService(next);
    setTick((x) => x + 1);
    alert("✅ Intérprete asignado correctamente");
  };

  return (
    <div className="grid gap-4">
      <div className="tron-card p-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="text-2xl font-semibold h-title">
              🧑‍💼 Panel Gerente
            </div>

            <div className="text-white/70 mt-2">
              Cuentas, servicios y pagos del sistema.
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Chip>⏳ Pendientes: {accCounts.pending}</Chip>
              <Chip>✅ Activos: {accCounts.active}</Chip>
              <Chip>⛔ Rechazados: {accCounts.rejected}</Chip>
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              <Chip>🧾 {svcCounts.created}</Chip>
              <Chip>🤝 {svcCounts.matched}</Chip>
              <Chip>🔳 {svcCounts.started}</Chip>
              <Chip>🏁 {svcCounts.finished}</Chip>
              <Chip>💳 {svcCounts.paid}</Chip>
              <Chip>⭐ {svcCounts.rated}</Chip>
            </div>
          </div>

          <div className="tron-card p-4">
            <div className="text-xs text-white/60">Gerente</div>
            <div className="text-sm font-semibold">{user.fullName}</div>
            <div className="text-xs text-white/55 mt-1">{user.email}</div>
          </div>
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

          <button
            className="tron-btn px-4 py-2"
            onClick={() => nav("/gerente/pagos")}
          >
            💳 Ver pagos
          </button>

          <div className="flex-1" />

          <input
            className="tron-input w-full sm:w-[340px]"
            placeholder="🔎 Buscar (nombre / rut / correo / id)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      {tab === "accounts" && (
        <div className="grid gap-3">
          <div className="tron-card p-5">
            <div className="grid md:grid-cols-3 gap-2">
              <select
                className="tron-select"
                value={accStatus}
                onChange={(e) => setAccStatus(e.target.value)}
              >
                <option value="pending">⏳ Pendientes</option>
                <option value="active">✅ Activos</option>
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
            <div className="tron-card p-6 text-white/70">
              No hay resultados.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              {accounts.map((u) => (
                <div key={u.id} className="tron-card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-lg">{u.fullName}</div>

                      <div className="text-sm text-white/70 mt-1">
                        {u.profileType === "interpreter"
                          ? "🧑‍💼 Intérprete"
                          : "🧏‍♀️ Usuario"}{" "}
                        • 🪪 <b>{u.rut}</b>
                      </div>

                      <div className="text-xs text-white/55 mt-1">
                        📧 {u.email}
                      </div>

                      {u.profileType === "interpreter" && u.interpreterProfile && (
                        <div className="mt-3 tron-card p-3">
                          <div className="text-sm font-semibold">
                            🧑‍💼 Datos Intérprete
                          </div>

                          <div className="text-xs text-white/70 mt-2">
                            📜 Certificación:{" "}
                            <b>{u.interpreterProfile.certification || "—"}</b>
                          </div>

                          <div className="text-xs text-white/70 mt-1">
                            🕒 Años experiencia:{" "}
                            <b>{u.interpreterProfile.years ?? 0}</b>
                          </div>

                          <div className="text-xs text-white/70 mt-1">
                            🧩 Especialidad:{" "}
                            <b>{specialtyLabel(u.interpreterProfile.specialty)}</b>
                          </div>

                          {u.interpreterProfile.note && (
                            <div className="text-xs text-white/60 mt-1">
                              📝 {u.interpreterProfile.note}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <Chip>{statusUserLabel(u.status)}</Chip>
                  </div>

                  {u.status === "pending" ? (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        className="tron-btn tron-primary font-semibold py-3"
                        onClick={() => setAccountStatus(u.id, "active")}
                      >
                        ✅ Aprobar
                      </button>

                      <button
                        className="tron-btn font-semibold py-3"
                        onClick={() => setAccountStatus(u.id, "rejected")}
                      >
                        ⛔ Rechazar
                      </button>
                    </div>
                  ) : (
                    <button
                      className="tron-btn tron-muted w-full font-semibold py-3 mt-3"
                      onClick={() => setAccountStatus(u.id, "pending")}
                    >
                      ↩️ Volver a Pendiente
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "services" && (
        <div className="grid gap-3">
          <div className="tron-card p-5">
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
                    <div>
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
                      {s.mode === "video"
                        ? "🎥"
                        : s.mode === "schedule"
                        ? "📅"
                        : "⚡"}
                    </Chip>
                  </div>
                </button>
              ))}
            </div>
          )}

          <Modal open={!!selectedService} onClose={() => setSelectedService(null)}>
            {!selectedService ? null : (
              <div>
                <div className="text-2xl font-semibold h-title">
                  📌 Servicio
                </div>

                <div className="text-white/70 mt-1">
                  {statusServiceLabel(selectedService.status)} •{" "}
                  {modeLabel(selectedService.mode)}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Chip>Cliente: {selectedService.clientName || "—"}</Chip>
                  <Chip>Intérprete: {selectedService.interpreterName || "—"}</Chip>
                  <Chip>💳 {moneyCLP(selectedService.amountCLP)}</Chip>
                  <Chip>🔳 Inicio: {selectedService.startCode}</Chip>
                  <Chip>🔳 Fin: {selectedService.endCode}</Chip>
                </div>

                {selectedServicePayment ? (
                  <div className="mt-4 tron-card p-4">
                    <div className="font-semibold">💳 Pago asociado</div>

                    <div className="text-sm text-white/75 mt-2">
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

                    <div className="text-sm text-white/65 mt-1">
                      Fecha:{" "}
                      {new Date(selectedServicePayment.createdAt).toLocaleString(
                        "es-CL"
                      )}
                    </div>

                    {selectedServicePayment.note && (
                      <div className="text-sm text-white/60 mt-2">
                        📝 {selectedServicePayment.note}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-4 tron-card p-4 text-white/70">
                    ⚠️ Este servicio aún no tiene pago asociado.
                  </div>
                )}

                {/* ASIGNACIÓN MANUAL */}
                <div className="mt-4 tron-card p-5">
                  <div className="font-semibold">🧑‍💼 Asignar intérprete</div>

                  <div className="mt-3 grid md:grid-cols-[1fr_auto] gap-2">
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

                  <div className="text-xs text-white/55 mt-2">
                    Al asignar, el servicio pasa a estado <b>matched</b>.
                  </div>
                </div>

                {selectedService.mode === "video" && (
                  <div className="mt-4 tron-card p-5">
                    <div className="font-semibold">🎥 Sala (demo)</div>
                    <button
                      className="tron-btn tron-primary w-full py-3 font-semibold mt-3"
                      onClick={() =>
                        window.open(
                          `https://meet.jit.si/InterpreteYa-${selectedService.id}`,
                          "_blank"
                        )
                      }
                    >
                      Abrir videollamada
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
    </div>
  );
}