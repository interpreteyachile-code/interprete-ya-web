import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { ensureCourseSeed, listCourses, createCourse, updateCourse } from "../data/coursesStore";

function Chip({ children }) {
  return <span className="tron-chip">{children}</span>;
}

function levelLabel(l) {
  return l === "basico" ? "🟢 Básico" : l === "intermedio" ? "🟡 Intermedio" : "🔴 Avanzado";
}

function formatLabel(f) {
  return f === "online" ? "💻 Online" : "🏫 Presencial";
}

function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="w-full max-w-2xl tron-card p-6 relative">
          <button className="tron-btn px-4 py-2 absolute right-4 top-4" onClick={onClose}>✖</button>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function Cursos() {
  const { user } = useAuth();
  const [tick, setTick] = useState(0);

  // seed demo
  useEffect(() => {
    ensureCourseSeed();
    setTick((x) => x + 1);
  }, []);

  // filtros
  const [q, setQ] = useState("");
  const [level, setLevel] = useState("all");
  const [format, setFormat] = useState("all");

  // crear curso (solo demo)
  const [openCreate, setOpenCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [newLevel, setNewLevel] = useState("basico");
  const [newFormat, setNewFormat] = useState("online");
  const [priceCLP, setPriceCLP] = useState(15000);
  const [description, setDescription] = useState("");

  const courses = useMemo(() => {
    const all = listCourses();
    const query = (q || "").trim().toLowerCase();

    return all
      .filter((c) => (level === "all" ? true : c.level === level))
      .filter((c) => (format === "all" ? true : c.format === format))
      .filter((c) => {
        if (!query) return true;
        return (
          (c.title || "").toLowerCase().includes(query) ||
          (c.description || "").toLowerCase().includes(query) ||
          (c.createdByName || "").toLowerCase().includes(query)
        );
      })
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [tick, q, level, format]);

  const create = () => {
    if (!user) return alert("Debes iniciar sesión para crear cursos (demo).");
    if (!title.trim()) return alert("Pon un título.");

    createCourse({
      createdById: user.id,
      createdByName: user.fullName,
      title: title.trim(),
      level: newLevel,
      format: newFormat,
      priceCLP: Number(priceCLP) || 0,
      description: description.trim(),
    });

    setOpenCreate(false);
    setTitle("");
    setDescription("");
    setPriceCLP(15000);
    setNewLevel("basico");
    setNewFormat("online");
    setTick((x) => x + 1);
  };

  const enrollDemo = (c) => {
    // demo: subir contador
    updateCourse(c.id, { enrollCount: (c.enrollCount || 0) + 1 });
    setTick((x) => x + 1);
    alert("✅ Inscripción registrada (demo).");
  };

  return (
    <div className="grid gap-4">
      <div className="tron-card p-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="text-2xl font-semibold h-title">🎓 Cursos LSCh</div>
            <div className="text-white/70 mt-2">
              Docencia y monetización: cursos creados por sordos (demo funcional).
            </div>
            <div className="mt-3 flex gap-2 flex-wrap">
              <Chip>💰 Monetización</Chip>
              <Chip>🧠 Cultura sorda</Chip>
              <Chip>📚 Formación</Chip>
            </div>
          </div>

          <button className="tron-btn tron-primary px-4 py-2 font-semibold" onClick={() => setOpenCreate(true)}>
            ➕ Crear curso
          </button>
        </div>

        <div className="mt-4 glow-line" />

        <div className="mt-4 grid md:grid-cols-3 gap-2">
          <input className="tron-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔎 Buscar curso" />
          <select className="tron-select" value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="all">🧩 Nivel: Todos</option>
            <option value="basico">🟢 Básico</option>
            <option value="intermedio">🟡 Intermedio</option>
            <option value="avanzado">🔴 Avanzado</option>
          </select>
          <select className="tron-select" value={format} onChange={(e) => setFormat(e.target.value)}>
            <option value="all">🧩 Formato: Todos</option>
            <option value="online">💻 Online</option>
            <option value="presencial">🏫 Presencial</option>
          </select>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="tron-card p-6 text-white/70">No hay cursos con esos filtros.</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {courses.map((c) => (
            <div key={c.id} className="tron-card p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold">{c.title}</div>
                  <div className="text-sm text-white/70 mt-1">
                    {levelLabel(c.level)} • {formatLabel(c.format)}
                  </div>
                  <div className="text-xs text-white/55 mt-1">👤 {c.createdByName}</div>
                </div>
                <span className="tron-chip">${Number(c.priceCLP || 0).toLocaleString("es-CL")}</span>
              </div>

              <div className="text-sm text-white/75 mt-3">{c.description || "—"}</div>

              <div className="mt-4 flex items-center justify-between gap-2">
                <span className="tron-chip">👥 {c.enrollCount || 0}</span>
                <button className="tron-btn tron-primary px-4 py-2 font-semibold" onClick={() => enrollDemo(c)}>
                  ✅ Inscribirme (demo)
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Crear */}
      <Modal open={openCreate} onClose={() => setOpenCreate(false)}>
        <div className="text-2xl font-semibold h-title">➕ Crear curso</div>
        <div className="text-white/70 mt-2">Demo: se guarda en localStorage.</div>

        <div className="mt-4 glow-line" />

        <div className="mt-4 grid gap-3">
          <div>
            <label className="text-sm text-white/70">Título</label>
            <input className="tron-input w-full mt-1" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="grid md:grid-cols-2 gap-2">
            <div>
              <label className="text-sm text-white/70">Nivel</label>
              <select className="tron-select w-full mt-1" value={newLevel} onChange={(e) => setNewLevel(e.target.value)}>
                <option value="basico">🟢 Básico</option>
                <option value="intermedio">🟡 Intermedio</option>
                <option value="avanzado">🔴 Avanzado</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-white/70">Formato</label>
              <select className="tron-select w-full mt-1" value={newFormat} onChange={(e) => setNewFormat(e.target.value)}>
                <option value="online">💻 Online</option>
                <option value="presencial">🏫 Presencial</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm text-white/70">Precio (CLP)</label>
            <input className="tron-input w-full mt-1" type="number" value={priceCLP} onChange={(e) => setPriceCLP(e.target.value)} />
          </div>

          <div>
            <label className="text-sm text-white/70">Descripción</label>
            <textarea className="tron-input w-full mt-1 min-h-[90px]" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <button className="tron-btn tron-primary w-full py-3 font-semibold" onClick={create}>
            ✅ Guardar curso
          </button>
        </div>
      </Modal>
    </div>
  );
}
