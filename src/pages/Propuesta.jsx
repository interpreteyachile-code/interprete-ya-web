import { useNavigate } from "react-router-dom";

function SectionCard({ number, title, children }) {
  return (
    <section className="tron-card p-5 md:p-6">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-2xl border border-cyan-300/30 bg-cyan-300/10 grid place-items-center shrink-0 font-semibold">
          {number}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-xl md:text-2xl font-semibold h-title">{title}</h2>
          <div className="text-white/80 mt-3 grid gap-3">{children}</div>
        </div>
      </div>
    </section>
  );
}

function ValueItem({ icon, title, desc }) {
  return (
    <div className="tron-card p-4">
      <div className="text-2xl">{icon}</div>
      <div className="font-semibold mt-2">{title}</div>
      <div className="text-sm text-white/70 mt-2">{desc}</div>
    </div>
  );
}

function ActorItem({ title, items }) {
  return (
    <div className="tron-card p-4">
      <div className="font-semibold">{title}</div>
      <div className="mt-3 grid gap-2 text-sm text-white/75">
        {items.map((item, idx) => (
          <div key={idx}>• {item}</div>
        ))}
      </div>
    </div>
  );
}

export default function Propuesta() {
  const nav = useNavigate();

  return (
    <div className="grid gap-4">
      {/* HERO */}
      <div className="tron-card p-5 md:p-8 overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-6 items-center">
          <div>
            <div className="text-3xl md:text-5xl font-semibold h-title leading-tight">
              📘 Propuesta InterpreteYa
            </div>

            <div className="text-white/85 mt-4 text-base md:text-lg">
              Una plataforma autónoma, creada por y para la comunidad sorda chilena.
            </div>

            <div className="text-white/70 mt-3">
              InterpreteYa conecta usuarios sordos, intérpretes de LSCh, empresas aliadas
              y organizaciones representativas de la comunidad, fortaleciendo la autonomía,
              la autogestión económica y la defensa activa de la Lengua de Señas Chilena.
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="tron-chip">🤟 Comunidad Sorda</span>
              <span className="tron-chip">🎥 Videollamada</span>
              <span className="tron-chip">💳 Pagos</span>
              <span className="tron-chip">⚖️ Denuncias</span>
              <span className="tron-chip">🎓 Cursos LSCh</span>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                className="tron-btn tron-primary py-3 font-semibold"
                onClick={() => nav("/alianzas")}
              >
                🤝 Ver Alianzas
              </button>

              <button
                className="tron-btn py-3 font-semibold"
                onClick={() => nav("/ecosistema")}
              >
                🌐 Ver Ecosistema
              </button>
            </div>
          </div>

          <div>
            <div className="tron-card p-2">
              <div className="relative overflow-hidden rounded-3xl border border-cyan-300/20 bg-cyan-300/5 min-h-[220px] h-[260px] md:h-[320px] lg:h-[380px]">
                <img
                  src="/hero-interpreteya.jpg"
                  alt="Propuesta visual InterpreteYa"
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
                    <div className="text-6xl">📘</div>
                    <div className="mt-3 text-lg font-semibold">
                      Aquí puedes poner una imagen institucional
                    </div>
                    <div className="text-sm text-white/60 mt-2">
                      Guarda una imagen en <b>public/hero-interpreteya.jpg</b>
                    </div>
                  </div>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                  <div className="text-sm md:text-base font-semibold">
                    Autonomía • Tecnología • Defensa LSCh
                  </div>
                  <div className="text-xs text-white/70 mt-1">
                    Modelo social y comunitario
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ÍNDICE */}
      <div className="tron-card p-5 md:p-6">
        <div className="text-2xl font-semibold h-title">🗂️ Índice</div>

        <div className="mt-4 grid md:grid-cols-2 gap-2 text-sm text-white/75">
          <div>1. Introducción: Una Plataforma Autónoma por y para la Comunidad Sorda</div>
          <div>2. Objetivo Central: Empoderamiento y Autogestión</div>
          <div>3. Descripción General: Conectividad y Autonomía</div>
          <div>4. Propuesta de Valor Autogestionada</div>
          <div>5. Actores y Funciones en un Ecosistema Autónomo</div>
          <div>6. Funcionamiento del Sistema: De la Solicitud al Pago</div>
          <div>7. Registro y Clasificación de Intérpretes: Validación por Pares</div>
          <div>8. Formación y Monetización: Los Sordos como Docentes</div>
          <div>9. Módulo de Denuncias y Reportes: Motor de Cambio y Defensa de la LSCh</div>
          <div>10. Alianzas Estratégicas: Convenios con Empresas y la Comunidad</div>
          <div>11. Impacto: Retroalimentación y Fortalecimiento del Negocio</div>
          <div>12. Conclusión: Autonomía, Defensa y Futuro</div>
        </div>
      </div>

      <SectionCard
        number="1"
        title="Introducción: Una Plataforma Autónoma por y para la Comunidad Sorda"
      >
        <p>
          InterpreteYa es una aplicación móvil autónoma y autogestionada, creada
          como una herramienta de empoderamiento para la comunidad sorda chilena.
        </p>
        <p>
          No representamos a instituciones públicas; somos un puente digital directo
          entre usuarios sordos, intérpretes de LSCh, empresas privadas y las
          organizaciones naturales de la comunidad sorda.
        </p>
        <p>
          Nuestra razón de ser es facilitar la comunicación, generar oportunidades
          económicas para nuestros usuarios y defender activamente la Lengua de Señas
          Chilena (LSCh) y los derechos lingüísticos, basándonos en la retroalimentación
          constante de nuestra comunidad.
        </p>
      </SectionCard>

      <SectionCard number="2" title="Objetivo Central: Empoderamiento y Autogestión">
        <div className="grid md:grid-cols-2 gap-3">
          <ValueItem
            icon="🧏‍♀️"
            title="Para la Comunidad Sorda"
            desc="Acceso rápido, confiable y autónomo a intérpretes, generación de ingresos mediante enseñanza de LSCh y herramientas para reportar y defender derechos."
          />
          <ValueItem
            icon="🧑‍💼"
            title="Para los Intérpretes"
            desc="Una plataforma formal para encontrar trabajo, gestionar servicios y recibir pagos oportunos."
          />
          <ValueItem
            icon="🏢"
            title="Para las Empresas"
            desc="Una solución directa para inclusión laboral y accesibilidad comunicacional, mediante convenios simples y efectivos."
          />
          <ValueItem
            icon="🌐"
            title="Para el Ecosistema"
            desc="Fortalecer la LSCh y la inclusión real a través de proyectos nacidos desde las necesidades reportadas por los usuarios."
          />
        </div>
      </SectionCard>

      <SectionCard number="3" title="Descripción General: Conectividad y Autonomía">
        <p>
          Funcionamos como un mercado digital especializado que conecta la demanda
          y la oferta de interpretación en LSCh.
        </p>
        <p>
          La plataforma permite solicitudes en tiempo real, agendamiento y videollamadas,
          con un sistema de pagos integrado y validación autónoma del servicio mediante QR.
        </p>
        <p>
          Todo el proceso es gestionado y retroalimentado por sus principales actores:
          los sordos y los intérpretes.
        </p>
      </SectionCard>

      <SectionCard number="4" title="Propuesta de Valor Autogestionada">
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">
          <ValueItem
            icon="📅"
            title="Agenda y QR de Validación"
            desc="Registra inicio y fin del servicio, calcula costos automáticamente y previene malentendidos."
          />
          <ValueItem
            icon="🎓"
            title="Cursos LSCh por Sordos"
            desc="Los usuarios sordos certificados generan ingresos impartiendo cursos online y presenciales."
          />
          <ValueItem
            icon="⚖️"
            title="Denuncias que Generan Proyectos"
            desc="Los reportes generan evidencia y sirven de base para proyectos de defensa e incidencia."
          />
          <ValueItem
            icon="🤝"
            title="Convenios Directos"
            desc="Alianzas con empresas, corporaciones y federaciones para validación, inclusión y co-creación."
          />
        </div>
      </SectionCard>

      <SectionCard number="5" title="Actores y Funciones en un Ecosistema Autónomo">
        <div className="grid md:grid-cols-3 gap-3">
          <ActorItem
            title="🧏‍♀️ Usuario Sordo"
            items={[
              "Solicita intérpretes para trámites, reuniones, entrevistas o eventos.",
              "Ofrece y monetiza cursos de LSCh como docente.",
              "Reporta denuncias que alimentan proyectos de defensa comunitaria.",
            ]}
          />

          <ActorItem
            title="🧑‍💼 Intérprete de LSCh"
            items={[
              "Ofrece servicios para reuniones, charlas, eventos y urgencias.",
              "Es evaluado y retroalimentado por la comunidad usuaria.",
              "Participa en un sistema autónomo de reputación y validación.",
            ]}
          />

          <ActorItem
            title="🏢 Empresa Aliada"
            items={[
              "Contrata servicios de interpretación para inclusión laboral y atención accesible.",
              "Establece convenios directos con la plataforma.",
              "Contribuye a un ecosistema real de accesibilidad e inclusión.",
            ]}
          />
        </div>
      </SectionCard>

      <SectionCard number="6" title="Funcionamiento del Sistema: De la Solicitud al Pago">
        <div className="grid gap-3 text-sm md:text-base">
          <div className="tron-card p-4">1. Solicitud: Un usuario sordo pide un intérprete (ahora, para luego o por videollamada).</div>
          <div className="tron-card p-4">2. Elección: Define tipo de servicio (trámite, reunión, entrevista, evento).</div>
          <div className="tron-card p-4">3. Conexión: El sistema asigna o permite elegir un intérprete disponible.</div>
          <div className="tron-card p-4">4. Validación Autónoma: Al inicio y fin, se escanea un QR para registrar el servicio.</div>
          <div className="tron-card p-4">5. Pago Automático: Se procesa por WebPay, MercadoPago u otras pasarelas.</div>
          <div className="tron-card p-4">6. Retroalimentación: Ambas partes se califican, fortaleciendo el ecosistema.</div>
        </div>
      </SectionCard>

      <SectionCard number="7" title="Registro y Clasificación de Intérpretes: Validación por Pares">
        <p>• Registro: presentación de credenciales y certificaciones.</p>
        <p>
          • Validación: verificación de documentos y, en algunos casos, evaluación
          por referentes sordos de la comunidad.
        </p>
        <p>• Clasificación Autónoma:</p>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="tron-card p-4">
            <div className="font-semibold">🧩 Intérprete en Formación</div>
            <div className="text-sm text-white/70 mt-2">
              Acceso a servicios de menor complejidad.
            </div>
          </div>
          <div className="tron-card p-4">
            <div className="font-semibold">✅ Intérprete Certificado</div>
            <div className="text-sm text-white/70 mt-2">
              Acceso total a la plataforma. Su reputación se construye con las calificaciones de los usuarios sordos.
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard number="8" title="Formación y Monetización: Los Sordos como Docentes">
        <p>
          Los usuarios sordos expertos en LSCh pueden crear y publicar sus propios
          cursos online o presenciales en la plataforma.
        </p>
        <p>
          Generan ganancias directas por cada estudiante, ya sea usuario oyente o
          intérprete en formación.
        </p>
        <p>
          Este sistema fortalece la enseñanza desde la perspectiva y cultura sorda,
          asegurando una formación auténtica y de calidad.
        </p>
      </SectionCard>

      <SectionCard
        number="9"
        title="Módulo de Denuncias y Reportes: Motor de Cambio y Defensa de la LSCh"
      >
        <p>
          Cuando un usuario reporta una barrera comunicacional o un incumplimiento,
          no solo se genera un documento con validez mediante geolocalización,
          hora y hash.
        </p>
        <p>
          Estas denuncias se convierten en la materia prima para diseñar y ejecutar
          proyectos específicos de incidencia, sensibilización y defensa legal del
          derecho a la LSCh.
        </p>
      </SectionCard>

      <SectionCard
        number="10"
        title="Alianzas Estratégicas: Convenios con Empresas y la Comunidad"
      >
        <div className="grid md:grid-cols-2 gap-3">
          <div className="tron-card p-4">
            <div className="font-semibold">🏢 Con Empresas</div>
            <div className="text-sm text-white/70 mt-2">
              Convenios directos para utilizar InterpreteYa como proveedor oficial
              de servicios de interpretación y accesibilidad.
            </div>
          </div>

          <div className="tron-card p-4">
            <div className="font-semibold">🤟 Con la Comunidad Sorda</div>
            <div className="text-sm text-white/70 mt-2">
              Trabajo colaborativo con corporaciones, clubes y federaciones para
              validación cultural, retroalimentación y co-creación.
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard number="11" title="Impacto: Retroalimentación y Fortalecimiento del Negocio">
        <p>
          • Autosustentabilidad: la plataforma se financia con un pequeño porcentaje
          de cada transacción, asegurando viabilidad y autonomía.
        </p>
        <p>
          • Retroalimentación Constante: cada calificación, reporte y solicitud mejora
          el algoritmo, la oferta de servicios y la orientación de proyectos.
        </p>
        <p>
          • Círculo Virtuoso: más usuarios atraen más intérpretes y empresas, lo que
          genera más ingresos para la comunidad sorda y más fondos para proyectos de incidencia.
        </p>
      </SectionCard>

      <SectionCard number="12" title="Conclusión: Autonomía, Defensa y Futuro">
        <p>
          InterpreteYa es más que una app: es un modelo de negocio social autónomo
          que pone a la comunidad sorda en el centro, no como beneficiarios pasivos,
          sino como clientes, proveedores, docentes y agentes de cambio.
        </p>
        <p>
          Combinamos tecnología, autogestión económica y defensa comunitaria para
          construir, desde la autonomía, un Chile más inclusivo y respetuoso con la
          Lengua de Señas Chilena.
        </p>
      </SectionCard>

      {/* FIRMA */}
      <div className="tron-card p-5 md:p-6">
        <div className="text-xl font-semibold h-title">✍️ Firmado por</div>

        <div className="mt-4 grid md:grid-cols-2 gap-3">
          <div className="tron-card p-4">
            <div className="font-semibold">Sebastián Valenzuela</div>
            <div className="text-sm text-white/70 mt-1">Gerente</div>
          </div>

          <div className="tron-card p-4">
            <div className="font-semibold">André Heredia</div>
            <div className="text-sm text-white/70 mt-1">Gerente</div>
          </div>
        </div>
      </div>
    </div>
  );
}