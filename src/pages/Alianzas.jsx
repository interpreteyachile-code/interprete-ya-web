import TronTile from "../components/TronTile";

function GlowTag({ children }) {
  return <span className="tron-chip">{children}</span>;
}

function InfoCard({ icon, title, desc }) {
  return (
    <div className="tron-card p-5 text-left">
      <div className="text-3xl">{icon}</div>
      <div className="font-semibold mt-3">{title}</div>
      <div className="text-sm text-white/70 mt-2">{desc}</div>
    </div>
  );
}

export default function Alianzas() {
  return (
    <div className="grid gap-4">
      {/* HEADER */}
      <div className="tron-card p-5 md:p-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="text-2xl md:text-3xl font-semibold h-title">
              🤝 Alianzas Estratégicas
            </div>

            <div className="text-white/70 mt-2">
              InterpreteYa establece convenios directos con empresas y con la
              comunidad sorda organizada, manteniendo su carácter autónomo.
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              <GlowTag>🏢 Empresas</GlowTag>
              <GlowTag>🤟 Comunidad</GlowTag>
              <GlowTag>🚀 Autonomía</GlowTag>
            </div>
          </div>
        </div>
      </div>

      {/* BLOQUES PRINCIPALES */}
      <div className="grid md:grid-cols-3 gap-3">
        <TronTile
          icon="🏢"
          title="Empresas Aliadas"
          desc="Convenios directos para inclusión laboral, atención accesible y servicios de interpretación."
        />

        <TronTile
          icon="🤟"
          title="Organizaciones Sordas"
          desc="Colaboración con corporaciones, clubes y federaciones, sin representarlas institucionalmente."
        />

        <TronTile
          icon="📈"
          title="Impacto"
          desc="Modelo autosustentable: un pequeño porcentaje por transacción ayuda a mantener el sistema."
        />
      </div>

      {/* DETALLE */}
      <div className="tron-card p-5 md:p-6">
        <div className="text-xl md:text-2xl font-semibold h-title">
          🌐 ¿Cómo funcionan las alianzas?
        </div>

        <div className="mt-4 grid md:grid-cols-2 gap-3">
          <InfoCard
            icon="🏢"
            title="Convenios con Empresas"
            desc="Las empresas pueden usar InterpreteYa como proveedor de accesibilidad comunicacional, capacitaciones y servicios de interpretación en LSCh."
          />

          <InfoCard
            icon="🤝"
            title="Colaboración con la Comunidad"
            desc="La comunidad sorda aporta validación cultural, retroalimentación y orientación para que la plataforma mantenga coherencia, autenticidad y utilidad real."
          />
        </div>
      </div>

      {/* BENEFICIOS */}
      <div className="tron-card p-5 md:p-6">
        <div className="text-xl md:text-2xl font-semibold h-title">
          🚀 Beneficios del Ecosistema
        </div>

        <div className="mt-4 grid md:grid-cols-3 gap-3">
          <InfoCard
            icon="💼"
            title="Más oportunidades"
            desc="Los intérpretes acceden a más servicios y posibilidades laborales a través de una plataforma formal."
          />

          <InfoCard
            icon="🤟"
            title="Más inclusión"
            desc="Los usuarios sordos acceden a servicios de interpretación, formación y defensa de derechos en un solo ecosistema."
          />

          <InfoCard
            icon="📊"
            title="Más sostenibilidad"
            desc="El modelo se fortalece con cada servicio, curso y alianza, generando un círculo virtuoso de crecimiento."
          />
        </div>
      </div>

      {/* MENSAJE FINAL */}
      <div className="tron-card p-5 md:p-6">
        <div className="text-xl md:text-2xl font-semibold h-title">
          ✨ Visión de las alianzas
        </div>

        <div className="mt-4 grid gap-3 text-white/80">
          <p>
            InterpreteYa busca construir puentes directos entre la comunidad sorda,
            los intérpretes y las empresas, sin depender de representación estatal.
          </p>

          <p>
            Las alianzas estratégicas permiten ampliar el impacto social, mejorar la
            accesibilidad y sostener un modelo de negocio social autónomo y escalable.
          </p>
        </div>
      </div>
    </div>
  );
}