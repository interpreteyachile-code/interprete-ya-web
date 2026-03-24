import { useMemo, useState } from "react";
import { createPayment, hasPaidCourse } from "../data/paymentsStore";
import { useAuth } from "../auth/AuthContext";
import {
  cancelEnrollment,
  createCourse,
  deleteCourse,
  enrollCourse,
  listCourses,
  updateCourse,
} from "../data/coursesStore";

function Chip({ children }) {
  return <span className="tron-chip">{children}</span>;
}

function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="w-full max-w-4xl tron-card p-6 relative">
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

function formatCLP(n) {
  try {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(n || 0);
  } catch {
    return `$${n || 0}`;
  }
}

function labelLevel(l) {
  return l === "basico"
    ? "🟦 Básico"
    : l === "intermedio"
    ? "🟨 Intermedio"
    : "🟥 Avanzado";
}

function labelMode(m) {
  return m === "online"
    ? "💻 Online"
    : m === "presencial"
    ? "🏫 Presencial"
    : "🔁 Mixto";
}

function labelStatus(s) {
  return s === "draft"
    ? "📝 Borrador"
    : s === "published"
    ? "✅ Publicado"
    : "⏸️ Pausado";
}

export default function Cursos() {
  const { user } = useAuth();
  const isLogged = !!user;
  const canManage = user?.role === "manager";

  // por ahora solo gerente crea/gestiona
  const canCreate = isLogged && canManage;

  const [tick, setTick] = useState(0);
  const allLive = useMemo(() => {
    void tick;
    return listCourses();
  }, [tick]);

  const [payOpen, setPayOpen] = useState(false);
  const [payMethod, setPayMethod] = useState("demo");
  const [payNote, setPayNote] = useState("");

  const [title, setTitle] = useState("");
  const [level, setLevel] = useState("basico");
  const [mode, setMode] = useState("online");
  const [city, setCity] = useState("Santiago");
  const [place, setPlace] = useState("");
  const [durationMin, setDurationMin] = useState(60);
  const [priceCLP, setPriceCLP] = useState(15000);
  const [seats, setSeats] = useState(10);
  const [description, setDescription] = useState("");

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("published");
  const [levelFilter, setLevelFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all");

  const [selected, setSelected] = useState(null);

  const visible = useMemo(() => {
    const query = (q || "").trim().toLowerCase();
    let data = allLive;

    if (!canManage) {
      data = data.filter((c) => c.status === "published");
    }

    if (statusFilter !== "all") data = data.filter((c) => c.status === statusFilter);
    if (levelFilter !== "all") data = data.filter((c) => c.level === levelFilter);
    if (modeFilter !== "all") data = data.filter((c) => c.mode === modeFilter);

    if (query) {
      data = data.filter((c) => {
        const blob =
          `${c.title} ${c.description} ${c.teacherName} ${c.city} ${c.place}`.toLowerCase();
        return blob.includes(query);
      });
    }

    return [...data].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [allLive, q, canManage, statusFilter, levelFilter, modeFilter]);

  const myEnrollments = useMemo(() => {
    if (!user) return [];
    return allLive.filter((c) => c.enrollments?.some((e) => e.userId === user.id));
  }, [allLive, user]);

  const resetForm = () => {
    setTitle("");
    setLevel("basico");
    setMode("online");
    setCity("Santiago");
    setPlace("");
    setDurationMin(60);
    setPriceCLP(15000);
    setSeats(10);
    setDescription("");
  };

  function submit() {
    if (!canCreate) return alert("Solo gerente puede crear cursos por ahora.");
    if (!title.trim()) return alert("Falta título");
    if (!description.trim()) return alert("Falta descripción");

    const c = createCourse({
      teacherId: user.id,
      teacherName: user.fullName,
      title,
      level,
      mode,
      city,
      place,
      durationMin: Number(durationMin) || 60,
      priceCLP: Number(priceCLP) || 0,
      seats: Number(seats) || 1,
      description,
      status: "draft",
    });

    resetForm();
    setTick((x) => x + 1);
    setSelected(c);
  }

  function openDetail(c) {
    setSelected(c);
  }

  function setStatus(id, status) {
    updateCourse(id, { status });
    setTick((x) => x + 1);
    setSelected((s) => (s && s.id === id ? { ...s, status } : s));
  }

  function enroll(id) {
    if (!user) return alert("Debes iniciar sesión.");

    if (hasPaidCourse(id, user.id)) {
      try {
        const c = enrollCourse(id, user);
        setTick((x) => x + 1);
        setSelected(c);
      } catch (e) {
        alert(e?.message || "No se pudo inscribir");
      }
      return;
    }

    setPayMethod("demo");
    setPayNote("");
    setPayOpen(true);
  }

  function confirmPayAndEnroll() {
    if (!selected || !user) return;

    createPayment({
      type: "course_enroll",
      refId: selected.id,
      userId: user.id,
      userName: user.fullName,
      amountCLP: selected.priceCLP,
      status: "paid",
      method: payMethod,
      note: payNote,
    });

    try {
      const c = enrollCourse(selected.id, user);
      setTick((x) => x + 1);
      setSelected(c);
      setPayOpen(false);
    } catch (e) {
      alert(e?.message || "No se pudo inscribir");
    }
  }

  function cancel(id) {
    if (!user) return;
    cancelEnrollment(id, user.id);
    setTick((x) => x + 1);
    setSelected((s) =>
      s && s.id === id
        ? { ...s, enrollments: (s.enrollments || []).filter((e) => e.userId !== user.id) }
        : s
    );
  }

  function del(id) {
    if (!canManage && user?.id !== selected?.teacherId) return alert("No autorizado.");
    if (!window.confirm("¿Eliminar curso?")) return;
    deleteCourse(id);
    setTick((x) => x + 1);
    setSelected(null);
  }

  const isMine = selected && user && (canManage || selected.teacherId === user.id);
  const isEnrolled =
    selected && user && selected.enrollments?.some((e) => e.userId === user.id);

  const seatsLeft = selected
    ? Math.max(0, (selected.seats || 0) - (selected.enrollments?.length || 0))
    : 0;

  const hasPaid = selected && user ? hasPaidCourse(selected.id, user.id) : false;

  return (
    <div className="grid gap-4">
      <div className="tron-card p-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="text-2xl font-semibold h-title">🎓 Cursos LSCh</div>
            <div className="text-white/70 mt-2">
              Cursos online, presenciales y mixtos para fortalecer la Lengua de Señas Chilena.
            </div>

            <div className="mt-4 flex gap-2 flex-wrap">
              <Chip>💻 Online</Chip>
              <Chip>🏫 Presencial</Chip>
              <Chip>🔁 Mixto</Chip>
              <Chip>✅ Publicados</Chip>
            </div>
          </div>

          {user && (
            <div className="tron-card p-4">
              <div className="text-xs text-white/60">Sesión</div>
              <div className="text-sm font-semibold">{user.fullName}</div>
              <div className="text-xs text-white/55 mt-1">
                {canManage ? "🧑‍💼 Gerente" : "👤 Estudiante"}
              </div>
            </div>
          )}
        </div>
      </div>

      {isLogged && myEnrollments.length > 0 && (
        <div className="tron-card p-6">
          <div className="font-semibold">📌 Mis cursos inscritos</div>
          <div className="mt-3 grid md:grid-cols-2 gap-3">
            {myEnrollments.map((c) => (
              <button
                key={c.id}
                className="tron-btn text-left"
                onClick={() => openDetail(c)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">{c.title}</div>
                    <div className="text-sm text-white/70 mt-1">
                      {labelLevel(c.level)} • {labelMode(c.mode)} • {formatCLP(c.priceCLP)}
                    </div>
                    <div className="text-xs text-white/55 mt-1">
                      Docente: {c.teacherName}
                    </div>
                  </div>
                  <Chip>✅ Inscrito</Chip>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {!canCreate ? null : (
        <div className="tron-card p-6">
          <div className="font-semibold">📝 Crear curso</div>
          <div className="text-sm text-white/70 mt-1">
            Crear en borrador, luego publicar.
          </div>

          <div className="mt-4 grid md:grid-cols-2 gap-2">
            <div>
              <label className="text-sm text-white/70">Título *</label>
              <input
                className="tron-input w-full mt-1"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: LSCh Básico para empresas"
              />
            </div>

            <div>
              <label className="text-sm text-white/70">Nivel</label>
              <select
                className="tron-select w-full mt-1"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              >
                <option value="basico">🟦 Básico</option>
                <option value="intermedio">🟨 Intermedio</option>
                <option value="avanzado">🟥 Avanzado</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-white/70">Modo</label>
              <select
                className="tron-select w-full mt-1"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
              >
                <option value="online">💻 Online</option>
                <option value="presencial">🏫 Presencial</option>
                <option value="mixto">🔁 Mixto</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-white/70">Ciudad</label>
              <input
                className="tron-input w-full mt-1"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ej: Santiago"
              />
            </div>

            <div>
              <label className="text-sm text-white/70">Lugar (opcional)</label>
              <input
                className="tron-input w-full mt-1"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                placeholder="Ej: Sala / Dirección / Zoom"
              />
            </div>

            <div>
              <label className="text-sm text-white/70">Duración (min)</label>
              <input
                className="tron-input w-full mt-1"
                type="number"
                min={30}
                value={durationMin}
                onChange={(e) => setDurationMin(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm text-white/70">Precio (CLP)</label>
              <input
                className="tron-input w-full mt-1"
                type="number"
                min={0}
                value={priceCLP}
                onChange={(e) => setPriceCLP(e.target.value)}
              />
              <div className="text-xs text-white/55 mt-1">
                Vista: {formatCLP(Number(priceCLP) || 0)}
              </div>
            </div>

            <div>
              <label className="text-sm text-white/70">Cupos</label>
              <input
                className="tron-input w-full mt-1"
                type="number"
                min={1}
                value={seats}
                onChange={(e) => setSeats(e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-white/70">Descripción *</label>
              <textarea
                className="tron-input w-full mt-1 min-h-[90px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Qué aprenderán, requisitos, etc."
              />
            </div>
          </div>

          <button
            className="tron-btn tron-primary w-full mt-4 py-3 font-semibold"
            onClick={submit}
          >
            ✅ Guardar curso (borrador)
          </button>
        </div>
      )}

      <div className="tron-card p-6">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="font-semibold">📚 Catálogo de cursos</div>
          <div className="text-xs text-white/60">
            {canManage ? "Vista gerente" : "Vista estudiante"}
          </div>
        </div>

        <div className="mt-3 grid md:grid-cols-4 gap-2">
          <input
            className="tron-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="🔎 Buscar curso / docente / ciudad..."
          />

          <select
            className="tron-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">🧩 Estado (todos)</option>
            <option value="published">✅ Publicados</option>
            <option value="draft">📝 Borradores</option>
            <option value="paused">⏸️ Pausados</option>
          </select>

          <select
            className="tron-select"
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
          >
            <option value="all">🎚️ Nivel (todos)</option>
            <option value="basico">🟦 Básico</option>
            <option value="intermedio">🟨 Intermedio</option>
            <option value="avanzado">🟥 Avanzado</option>
          </select>

          <select
            className="tron-select"
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
          >
            <option value="all">🧭 Modo (todos)</option>
            <option value="online">💻 Online</option>
            <option value="presencial">🏫 Presencial</option>
            <option value="mixto">🔁 Mixto</option>
          </select>
        </div>

        <div className="mt-4 glow-line" />

        {visible.length === 0 ? (
          <div className="mt-4 text-white/70">No hay cursos con esos filtros.</div>
        ) : (
          <div className="mt-4 grid md:grid-cols-2 gap-3">
            {visible.map((c) => (
              <button
                key={c.id}
                className="tron-btn w-full text-left"
                onClick={() => openDetail(c)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">{c.title}</div>
                    <div className="text-sm text-white/70 mt-1">
                      {labelLevel(c.level)} • {labelMode(c.mode)} • {formatCLP(c.priceCLP)}
                    </div>
                    <div className="text-xs text-white/55 mt-1">
                      Docente: {c.teacherName} • Cupos: {(c.seats || 0) - (c.enrollments?.length || 0)}/{c.seats}
                    </div>
                  </div>
                  <Chip>{labelStatus(c.status)}</Chip>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)}>
        {!selected ? null : (
          <div>
            <div className="text-2xl font-semibold h-title">📌 Detalle del curso</div>

            <div className="flex flex-wrap gap-2 mt-3">
              <Chip>{labelLevel(selected.level)}</Chip>
              <Chip>{labelMode(selected.mode)}</Chip>
              <Chip>{labelStatus(selected.status)}</Chip>
              <Chip>💰 {formatCLP(selected.priceCLP)}</Chip>
              <Chip>⏱️ {selected.durationMin} min</Chip>
              <Chip>🎟️ Cupos: {seatsLeft}/{selected.seats}</Chip>
              {hasPaid && <Chip>✅ Ya pagado</Chip>}
            </div>

            <div className="mt-4 glow-line" />

            <div className="mt-4 tron-card p-5">
              <div className="font-semibold">{selected.title}</div>
              <div className="text-sm text-white/75 mt-2">
                <b>Docente:</b> {selected.teacherName}
              </div>
              <div className="text-sm text-white/75 mt-2">
                <b>Ciudad / Lugar:</b> {selected.city || "—"} • {selected.place || "—"}
              </div>
              <div className="text-sm text-white/75 mt-3">
                <b>Descripción:</b>
                <div className="text-white/75 mt-1 whitespace-pre-wrap">
                  {selected.description || "—"}
                </div>
              </div>
            </div>

            {user && !isMine && selected.status === "published" && (
              <div className="mt-4 tron-card p-5">
                <div className="font-semibold">👤 Inscripción</div>

                {!isEnrolled ? (
                  <button
                    className="tron-btn tron-primary w-full mt-3 py-3 font-semibold"
                    onClick={() => enroll(selected.id)}
                  >
                    ✅ Inscribirme
                  </button>
                ) : (
                  <button
                    className="tron-btn tron-muted w-full mt-3 py-3 font-semibold"
                    onClick={() => cancel(selected.id)}
                  >
                    ❌ Cancelar inscripción
                  </button>
                )}

                <div className="text-xs text-white/55 mt-2">
                  Pago demo antes de inscribirse. Luego conectamos WebPay/MercadoPago.
                </div>
              </div>
            )}

            {isMine && (
              <div className="mt-4 tron-card p-5">
                <div className="font-semibold">🧑‍🏫 Gestión del curso</div>

                <div className="mt-3 grid md:grid-cols-3 gap-2">
                  <button
                    className="tron-btn tron-primary font-semibold py-3"
                    onClick={() => setStatus(selected.id, "published")}
                  >
                    ✅ Publicar
                  </button>
                  <button
                    className="tron-btn font-semibold py-3"
                    onClick={() => setStatus(selected.id, "paused")}
                  >
                    ⏸️ Pausar
                  </button>
                  <button
                    className="tron-btn tron-muted font-semibold py-3"
                    onClick={() => setStatus(selected.id, "draft")}
                  >
                    📝 Borrador
                  </button>
                </div>

                <button
                  className="tron-btn w-full mt-3 py-3 font-semibold"
                  onClick={() => del(selected.id)}
                >
                  🗑️ Eliminar curso
                </button>

                <div className="mt-3 text-sm text-white/70">
                  Inscritos: {selected.enrollments?.length || 0}
                </div>

                {(selected.enrollments || []).length > 0 && (
                  <div className="mt-2 grid md:grid-cols-2 gap-2">
                    {selected.enrollments.map((e) => (
                      <div key={e.userId} className="tron-card p-3">
                        <div className="font-semibold">{e.userName}</div>
                        <div className="text-xs text-white/55">
                          🕒 {new Date(e.enrolledAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal open={payOpen} onClose={() => setPayOpen(false)}>
        {!selected ? null : (
          <div>
            <div className="text-2xl font-semibold h-title">💳 Pago (demo)</div>
            <div className="text-sm text-white/70 mt-2">
              Pago simulado para validar el flujo.
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Chip>Curso: {selected.title}</Chip>
              <Chip>Monto: {formatCLP(selected.priceCLP)}</Chip>
              {hasPaid && <Chip>✅ Ya pagado</Chip>}
            </div>

            <div className="mt-4 glow-line" />

            <div className="mt-4 tron-card p-5">
              <label className="text-sm text-white/70">Método</label>
              <select
                className="tron-select w-full mt-1"
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
              >
                <option value="demo">🧪 Demo</option>
              </select>

              <div className="mt-3">
                <label className="text-sm text-white/70">Nota (opcional)</label>
                <textarea
                  className="tron-input w-full mt-1 min-h-[70px]"
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  placeholder="Ej: pago confirmado (demo)"
                />
              </div>

              <button
                className="tron-btn tron-primary w-full mt-4 py-3 font-semibold"
                onClick={confirmPayAndEnroll}
              >
                ✅ Pagar e Inscribirme
              </button>

              <button
                className="tron-btn tron-muted w-full mt-2 py-3 font-semibold"
                onClick={() => setPayOpen(false)}
              >
                ↩️ Cancelar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}