import { useNavigate } from "react-router-dom";

function cx(...arr) {
  return arr.filter(Boolean).join(" ");
}

function Section({ n, title, children }) {
  return (
    <section className="rounded-3xl border border-cyan-500/20 bg-slate-900/35 p-5 shadow-[0_0_40px_rgba(34,211,238,0.08)]">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 shrink-0 rounded-2xl border border-cyan-400/40 bg-cyan-500/10 grid place-items-center text-cyan-200 font-semibold">
          {n}
        </div>
        <div className="flex-1">
          <h2 className="text-lg md:text-xl font-semibold text-cyan-200">
            {title}
          </h2>
          <div className="mt-2 text-slate-200 leading-relaxed">{children}</div>
        </div>
      </div>
    </section>
  );
}

function Chip({ children, tone = "cyan" }) {
  const toneCls =
    tone === "fuchsia"
      ? "border-fuchsia-400/50 bg-fuchsia-500/10 text-fuchsia-200"
      : tone === "emerald"
      ? "border-emerald-400/50 bg-emerald-500/10 text-emerald-200"
      : "border-cyan-400/50 bg-cyan-500/10 text-cyan-200";

  return (
    <span className={cx("rounded-full border px-3 py-1 text-xs", toneCls)}>
      {children}
    </span>
  );
}

function CTAButton({ onClick, icon, title, desc, tone = "cyan" }) {
  const toneCls =
    tone === "fuchsia"
      ? "border-fuchsia-400/60 bg-fuchsia-500/12 text-fuchsia-100 hover:bg-fuchsia-500/22"
      : tone === "emerald"
      ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/20"
      : "border-cyan-400/60 bg-cyan-500/12 text-cyan-100 hover:bg-cyan-500/22";

  return (
    <button
      onClick={onClick}
      className={cx(
        "w-full text-left rounded-3xl border p-4 transition shadow-[0_0_24px_rgba(34,211,238,0.10)]",
        toneCls
      )}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl">{icon}</div>
        <div>
          <div className="font-semibold text-base">{title}</div>
          <div className="text-sm opacity-90 mt-1">{desc}</div>
        </div>
      </div>
    </button>
  );
}

export default function Propuesta() {
  const nav = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* HERO */}
        <div className="rounded-3xl border border-cyan-500/25 bg-slate-900/40 p-6 shadow-[0_0_50px_rgba(34,211,238,0.12)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-4xl font-semibold tracking-wide">
                InterpreteYa ⚡{" "}
                <span className="text-cyan-300">Plataforma Autónoma</span>
              </h1>
              <p className="mt-2 text-slate-300 max-w-2xl">
                Creada por y para la comunidad sorda chilena 🤟. No representamos
                instituciones públicas: colaboramos directamente con sus
                organizaciones representativas y con empresas aliadas.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Chip>Autonomía</Chip>
                <Chip tone="fuchsia">LSCh</Chip>
                <Chip tone="emerald">Pagos + QR</Chip>
                <Chip>Denuncias</Chip>
                <Chip tone="fuchsia">Cursos dictados por sordos</Chip>
              </div>
            </div>

            <div className="grid gap-3 w-full md:w-[380px]">
              <CTAButton
                tone="cyan"
                icon="⚡"
                title="Solicitar Intérprete"
                desc="Ahora • Agendar • Videollamada (QR inicio/fin + pago)."
                onClick={() => nav("/services")}
              />
              <CTAButton
                tone="fuchsia"
                icon="⚖️"
                title="Denuncias y Reportes"
                desc="Motor de cambio: reportes con hora/ubicación/hash (módulo)."
                onClick={() => nav("/denuncias")}
              />
              <CTAButton
                tone="emerald"
                icon="🤝"
                title="Convenios con Empresas"
                desc="Alianzas directas para inclusión y accesibilidad comunicacional."
                onClick={() => nav("/convenios")}
              />
            </div>
          </div>
        </div>

        {/* ÍNDICE */}
        <div className="mt-6 rounded-3xl border border-slate-700/60 bg-slate-900/30 p-5">
          <h2 className="text-lg font-semibold">🗂️ Índice</h2>
          <div className="mt-3 grid gap-2 md:grid-cols-2 text-slate-200">
            {[
              "1. Introducción: Plataforma Autónoma por y para la Comunidad Sorda",
              "2. Objetivo Central: Empoderamiento y Autogestión",
              "3. Descripción General: Conectividad y Autonomía",
              "4. Propuesta de Valor Autogestionada",
              "5. Actores y Funciones en un Ecosistema Autónomo",
              "6. Funcionamiento del Sistema: De la Solicitud al Pago",
              "7. Registro y Clasificación de Intérpretes: Validación por Pares",
              "8. Formación y Monetización: Los Sordos como Docentes",
              "9. Denuncias y Reportes: Motor de Cambio y Defensa de la LSCh",
              "10. Alianzas Estratégicas: Empresas y Comunidad",
              "11. Impacto: Retroalimentación y Fortalecimiento",
              "12. Conclusión: Autonomía, Defensa y Futuro",
            ].map((t) => (
              <div
                key={t}
                className="rounded-2xl border border-slate-700/60 bg-slate-950/20 px-3 py-2"
              >
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* SECCIONES */}
        <div className="mt-6 grid gap-5">
          <Section
            n="1"
            title="Introducción: Una Plataforma Autónoma por y para la Comunidad Sorda"
          >
            <p>
              InterpreteYa es una plataforma autónoma y autogestionada, creada
              como una herramienta de empoderamiento para la comunidad sorda
              chilena. No representamos instituciones públicas; somos un puente
              digital directo entre usuarios sordos, intérpretes de LSCh,
              empresas privadas y las organizaciones naturales de la comunidad
              sorda.
            </p>
            <p className="mt-3">
              Nuestra razón de ser es facilitar la comunicación, generar
              oportunidades económicas para nuestros usuarios y defender
              activamente la Lengua de Señas Chilena (LSCh) y los derechos
              lingüísticos, basándonos en la retroalimentación constante de
              nuestra comunidad.
            </p>
          </Section>

          <Section n="2" title="Objetivo Central: Empoderamiento y Autogestión">
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <b>Comunidad Sorda:</b> acceso rápido y confiable a intérpretes,
                ingresos enseñando LSCh y herramientas para reportar y defender
                derechos.
              </li>
              <li>
                <b>Intérpretes:</b> plataforma formal para encontrar trabajo,
                gestionar servicios y recibir pagos oportunos.
              </li>
              <li>
                <b>Empresas:</b> solución directa para inclusión y accesibilidad
                comunicacional mediante convenios simples.
              </li>
              <li>
                <b>Ecosistema:</b> fortalecer la LSCh e inclusión real desde las
                necesidades reportadas por usuarios.
              </li>
            </ul>
          </Section>

          <Section n="3" title="Descripción General: Conectividad y Autonomía">
            <p>
              Funcionamos como un mercado digital especializado que conecta la
              demanda y oferta de interpretación en LSCh. Permitimos solicitudes
              en tiempo real, agendamiento y videollamadas, con pagos integrados
              y validación autónoma del servicio (QR).
            </p>
            <p className="mt-3">
              Todo el proceso es gestionado y retroalimentado por sus principales
              actores: personas sordas e intérpretes.
            </p>
          </Section>

          <Section n="4" title="Propuesta de Valor Autogestionada">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-3xl border border-cyan-400/20 bg-slate-950/25 p-4">
                <div className="font-semibold text-cyan-200">
                  📅 Agenda + QR de Validación
                </div>
                <div className="text-slate-200 mt-2">
                  Registra inicio/fin, calcula costos y previene malentendidos
                  sin intervención externa.
                </div>
              </div>
              <div className="rounded-3xl border border-fuchsia-400/20 bg-slate-950/25 p-4">
                <div className="font-semibold text-fuchsia-200">
                  🎓 Cursos LSCh dictados por Sordos
                </div>
                <div className="text-slate-200 mt-2">
                  Usuarios sordos certificados generan ingresos impartiendo
                  cursos online/presenciales.
                </div>
              </div>
              <div className="rounded-3xl border border-emerald-400/20 bg-slate-950/25 p-4">
                <div className="font-semibold text-emerald-200">
                  ⚖️ Denuncias que generan proyectos
                </div>
                <div className="text-slate-200 mt-2">
                  Reportes con evidencia alimentan proyectos de defensa e
                  incidencia en favor de la LSCh.
                </div>
              </div>
              <div className="rounded-3xl border border-cyan-400/20 bg-slate-950/25 p-4">
                <div className="font-semibold text-cyan-200">
                  🤝 Convenios Directos
                </div>
                <div className="text-slate-200 mt-2">
                  Alianzas con empresas y con organizaciones de la comunidad
                  sorda para co-crear y validar.
                </div>
              </div>
            </div>
          </Section>

          <Section n="5" title="Actores y Funciones en un Ecosistema Autónomo">
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <b>Usuario Sordo:</b> solicita intérprete, enseña LSCh (cursos) y
                reporta denuncias.
              </li>
              <li>
                <b>Intérprete LSCh:</b> ofrece servicios para trámites, reuniones,
                eventos, emergencias; recibe evaluación comunitaria.
              </li>
              <li>
                <b>Empresa Aliada:</b> contrata interpretación para inclusión y
                accesibilidad mediante convenios directos.
              </li>
            </ul>
          </Section>

          <Section n="6" title="Funcionamiento del Sistema: De la Solicitud al Pago">
            <ol className="list-decimal pl-5 space-y-2">
              <li>Solicitud: ahora / agendar / videollamada.</li>
              <li>Elección: tipo de servicio (trámite, reunión, entrevista, evento).</li>
              <li>Conexión: asignación o elección de intérprete disponible.</li>
              <li>Validación: QR inicio y QR fin.</li>
              <li>Pago automático: WebPay / MercadoPago (integración).</li>
              <li>Retroalimentación: calificaciones mutuas.</li>
            </ol>
          </Section>

          <Section n="7" title="Registro y Clasificación de Intérpretes: Validación por Pares">
            <ul className="list-disc pl-5 space-y-2">
              <li>Registro con credenciales y certificaciones.</li>
              <li>Verificación documental y, si aplica, evaluación por referentes sordos.</li>
              <li>
                Clasificación:
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li><b>En Formación:</b> servicios de menor complejidad.</li>
                  <li><b>Certificado:</b> acceso total; reputación por calificaciones.</li>
                </ul>
              </li>
            </ul>
          </Section>

          <Section n="8" title="Formación y Monetización: Los Sordos como Docentes">
            <p>
              Usuarios sordos expertos pueden crear y publicar cursos (online o
              presenciales) y generar ingresos directos por estudiante. Esto
              fortalece la enseñanza desde la cultura sorda y mejora la calidad
              formativa.
            </p>
          </Section>

          <Section n="9" title="Denuncias y Reportes: Motor de Cambio y Defensa de la LSCh">
            <p>
              Un reporte no es solo un reclamo: es evidencia (hora, ubicación y
              hash) que permite diseñar proyectos de incidencia, sensibilización
              y defensa del derecho a la LSCh, en colaboración con organizaciones
              de la comunidad sorda.
            </p>
          </Section>

          <Section n="10" title="Alianzas Estratégicas: Convenios con Empresas y la Comunidad">
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <b>Empresas:</b> proveedor oficial de intérpretes para inclusión y
                accesibilidad.
              </li>
              <li>
                <b>Comunidad Sorda:</b> convenios con corporaciones, clubes y
                federaciones para co-creación y validación cultural, sin
                representarlas institucionalmente.
              </li>
            </ul>
          </Section>

          <Section n="11" title="Impacto: Retroalimentación y Fortalecimiento del Negocio">
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <b>Autosustentabilidad:</b> porcentaje pequeño por transacción.
              </li>
              <li>
                <b>Mejora continua:</b> calificaciones + reportes mejoran la oferta.
              </li>
              <li>
                <b>Círculo virtuoso:</b> más usuarios → más intérpretes/empresas →
                más ingresos → más proyectos.
              </li>
            </ul>
          </Section>

          <Section n="12" title="Conclusión: Autonomía, Defensa y Futuro">
            <p>
              InterpreteYa es más que una app: es un modelo de negocio social
              autónomo que pone a la comunidad sorda en el centro como clientes,
              proveedores, docentes y agentes de cambio. Combinamos tecnología,
              autogestión económica y defensa comunitaria para construir una
              Chile más inclusiva y respetuosa con la LSCh.
            </p>

            <div className="mt-4 rounded-3xl border border-slate-700/60 bg-slate-950/20 p-4">
              <div className="text-slate-300 text-sm">✍️ Firmado por</div>
              <div className="mt-2 font-semibold text-slate-100">
                Sebastián Valenzuela — Gerente
              </div>
              <div className="font-semibold text-slate-100">
                André Heredia — Gerente
              </div>
            </div>
          </Section>
        </div>

        {/* Footer actions */}
        <div className="mt-8 rounded-3xl border border-slate-700/60 bg-slate-900/25 p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="text-slate-300">
              ¿Quieres avanzar al siguiente módulo? (QR real + Denuncias + Convenios)
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => nav("/services")}
                className="rounded-2xl border border-cyan-400/60 bg-cyan-500/12 px-4 py-2 text-cyan-100 hover:bg-cyan-500/22 transition"
              >
                Ir a Solicitudes ⚡
              </button>
              <button
                onClick={() => nav("/denuncias")}
                className="rounded-2xl border border-fuchsia-400/60 bg-fuchsia-500/12 px-4 py-2 text-fuchsia-100 hover:bg-fuchsia-500/22 transition"
              >
                Ir a Denuncias ⚖️
              </button>
              <button
                onClick={() => nav("/convenios")}
                className="rounded-2xl border border-emerald-400/60 bg-emerald-500/10 px-4 py-2 text-emerald-100 hover:bg-emerald-500/20 transition"
              >
                Ir a Convenios 🤝
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}