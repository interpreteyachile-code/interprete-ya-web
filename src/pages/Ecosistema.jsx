import { useNavigate } from "react-router-dom";

function Block({ icon, title, desc, children }) {
  return (
    <div className="tron-card p-5 md:p-6">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-2xl border border-cyan-300/30 bg-cyan-300/10 grid place-items-center text-2xl shrink-0">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-xl font-semibold h-title">{title}</div>
          <div className="text-white/70 mt-2">{desc}</div>

          {children && <div className="mt-4">{children}</div>}
        </div>
      </div>
    </div>
  );
}

function ActorCard({ icon, title, items }) {
  return (
    <div className="tron-card p-5">
      <div className="text-3xl">{icon}</div>
      <div className="font-semibold mt-3">{title}</div>

      <div className="mt-3 grid gap-2 text-sm text-white/75">
        {items.map((item, idx) => (
          <div key={idx}>• {item}</div>
        ))}
      </div>
    </div>
  );
}

function FlowStep({ number, title, desc }) {
  return (
    <div className="tron-card p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl border border-cyan-300/30 bg-cyan-300/10 grid place-items-center font-semibold shrink-0">
          {number}
        </div>

        <div>
          <div className="font-semibold">{title}</div>
          <div className="text-sm text-white/70 mt-1">{desc}</div>
        </div>
      </div>
    </div>
  );
}

export default function Ecosistema() {
  const nav = useNavigate();

  return (
    <div className="grid gap-4">
      {/* HERO */}
      <div className="tron-card p-5 md:p-8 overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-6 items-center">
          <div>
            <div className="text-3xl md:text-5xl font-semibold h-title leading-tight">
              🌐 Ecosistema InterpreteYa
            </div>

            <div className="text-white/85 mt-4 text-base md:text-lg">
              Una red autónoma que conecta comunidad sorda, intérpretes,
              organizaciones y empresas aliadas.
            </div>

            <div className="text-white/70 mt-3">
              InterpreteYa no es solo una app: es un ecosistema social y
              tecnológico donde cada actor cumple un rol real en accesibilidad,
              inclusión, educación y defensa de la LSCh.
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="tron-chip">🤟 Comunidad</span>
              <span className="tron-chip">🧑‍💼 Intérpretes</span>
              <span className="tron-chip">🏢 Empresas</span>
              <span className="tron-chip">⚖️ Defensa LSCh</span>
              <span className="tron-chip">🎓 Formación</span>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                className="tron-btn tron-primary py-3 font-semibold"
                onClick={() => nav("/propuesta")}
              >
                📘 Ver Propuesta
              </button>

              <button
                className="tron-btn py-3 font-semibold"
                onClick={() => nav("/alianzas")}
              >
                🤝 Ver Alianzas
              </button>
            </div>
          </div>

          <div>
            <div className="tron-card p-2">
              <div className="relative overflow-hidden rounded-3xl border border-cyan-300/20 bg-cyan-300/5 min-h-[220px] h-[260px] md:h-[320px] lg:h-[380px]">
                <img
                  src="/hero-interpreteya.jpg"
                  alt="Ecosistema InterpreteYa"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const fallback = e.currentTarget.nextElementSibling;
                    if (fallback) fallback.style.display = "grid";
                  }}
                />

                <div
                  className="absolute inset-0 hidden place-items-center text-center p-6"
                  style={{ display: "none" }}
                >
                  <div>
                    <div className="text-6xl">🌐</div>
                    <div className="mt-3 text-lg font-semibold">
                      Aquí puedes poner imagen del ecosistema
                    </div>
                    <div className="text-sm text-white/60 mt-2">
                      Usa <b>public/hero-interpreteya.jpg</b>
                    </div>
                  </div>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                  <div className="text-sm md:text-base font-semibold">
                    Comunidad • Servicios • Formación • Defensa
                  </div>
                  <div className="text-xs text-white/70 mt-1">
                    Tecnología al servicio de la autonomía
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* IDEA CENTRAL */}
      <Block
        icon="🤟"
        title="Una Plataforma Autónoma por y para la Comunidad Sorda"
        desc="InterpreteYa se construye desde la autonomía, no desde la representación institucional del Estado."
      >
        <div className="grid gap-3 text-sm md:text-base text-white/80">
          <div>
            No representamos instituciones públicas. En cambio, colaboramos con
            corporaciones, clubes, federaciones y empresas aliadas para construir
            soluciones reales de accesibilidad comunicacional.
          </div>
          <div>
            La comunidad sorda no es un actor pasivo dentro del sistema: ocupa
            un rol central como usuaria, docente, generadora de ingresos y agente
            de cambio.
          </div>
        </div>
      </Block>

      {/* ACTORES */}
      <div className="grid gap-3">
        <div className="tron-card p-5 md:p-6">
          <div className="text-2xl font-semibold h-title">👥 Actores del Ecosistema</div>
          <div className="text-white/70 mt-2">
            Cada actor cumple una función concreta dentro del modelo autónomo de InterpreteYa.
          </div>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">
          <ActorCard
            icon="🧏‍♀️"
            title="Usuario Sordo"
            items={[
              "Solicita intérpretes para trámites, reuniones, entrevistas y eventos.",
              "Reporta barreras comunicacionales y vulneraciones.",
              "Puede participar en formación y monetización de cursos LSCh.",
            ]}
          />

          <ActorCard
            icon="🧑‍💼"
            title="Intérprete LSCh"
            items={[
              "Ofrece servicios en tiempo real, agenda o videollamada.",
              "Recibe pagos y reputación basada en retroalimentación.",
              "Participa en un sistema autónomo de validación y clasificación.",
            ]}
          />

          <ActorCard
            icon="🏢"
            title="Empresa Aliada"
            items={[
              "Contrata servicios de interpretación y accesibilidad.",
              "Genera inclusión laboral y mejor atención al público.",
              "Se conecta mediante convenios simples y directos.",
            ]}
          />

          <ActorCard
            icon="🤝"
            title="Comunidad Organizada"
            items={[
              "Corporaciones, clubes y federaciones aportan validación cultural.",
              "Entregan retroalimentación comunitaria.",
              "Fortalecen el desarrollo del ecosistema sin representación institucional directa.",
            ]}
          />
        </div>
      </div>

      {/* FLUJO DEL ECOSISTEMA */}
      <div className="grid gap-3">
        <div className="tron-card p-5 md:p-6">
          <div className="text-2xl font-semibold h-title">🔄 Cómo se mueve el ecosistema</div>
          <div className="text-white/70 mt-2">
            El valor de InterpreteYa surge de la conexión entre tecnología, comunidad, trabajo y defensa de derechos.
          </div>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
          <FlowStep
            number="1"
            title="Solicitud"
            desc="La persona sorda solicita un intérprete según necesidad: ahora, agenda o videollamada."
          />

          <FlowStep
            number="2"
            title="Conexión"
            desc="El sistema conecta con intérprete disponible o el gerente asigna manualmente."
          />

          <FlowStep
            number="3"
            title="Servicio"
            desc="Se realiza el servicio con validación, registro y eventual videollamada o atención presencial."
          />

          <FlowStep
            number="4"
            title="Pago"
            desc="El sistema registra pagos, historial y trazabilidad de cada servicio."
          />

          <FlowStep
            number="5"
            title="Retroalimentación"
            desc="Ambas partes evalúan y eso mejora reputación, experiencia y calidad."
          />

          <FlowStep
            number="6"
            title="Impacto"
            desc="Cada interacción fortalece el negocio social, la accesibilidad y la defensa activa de la LSCh."
          />
        </div>
      </div>

      {/* PILARES */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">
        <Block
          icon="🎥"
          title="Conectividad"
          desc="Solicitudes en vivo, videollamada y coordinación rápida para responder a necesidades reales."
        />

        <Block
          icon="🎓"
          title="Formación"
          desc="Cursos LSCh impartidos por personas sordas, fortaleciendo enseñanza auténtica y generación de ingresos."
        />

        <Block
          icon="⚖️"
          title="Defensa"
          desc="Denuncias y reportes como motor de proyectos de incidencia, sensibilización y protección de derechos lingüísticos."
        />

        <Block
          icon="💳"
          title="Autosustentabilidad"
          desc="Modelo de negocio social basado en transacciones, convenios y servicios que permiten viabilidad autónoma."
        />
      </div>

      {/* MENSAJE FINAL */}
      <div className="tron-card p-5 md:p-6">
        <div className="text-2xl font-semibold h-title">🚀 Visión del Ecosistema</div>

        <div className="mt-4 grid gap-3 text-white/80">
          <p>
            InterpreteYa no se limita a conectar servicios de interpretación:
            construye una red donde la comunidad sorda participa activamente en
            la economía, la formación, la innovación y la defensa de la LSCh.
          </p>

          <p>
            Este ecosistema permite que la accesibilidad deje de depender solo de
            respuestas externas y se convierta en una estructura autónoma, viva
            y retroalimentada por quienes la necesitan y la sostienen.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            className="tron-btn tron-primary py-3 font-semibold"
            onClick={() => nav("/solicitud")}
          >
            🤟 Solicitar intérprete
          </button>

          <button
            className="tron-btn py-3 font-semibold"
            onClick={() => nav("/denuncias")}
          >
            ⚖️ Ir a denuncias
          </button>
        </div>
      </div>
    </div>
  );
}