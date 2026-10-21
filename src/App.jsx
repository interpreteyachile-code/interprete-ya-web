
import React, { useState } from "react";
import "./App.css";

export default function App() {
  const [apagado, setApagado] = useState(false);

  return (
    <main className={`final-page ${apagado ? "apagado" : ""}`}>
      {!apagado ? (
        <section className="final-card">
          <button
            type="button"
            className="power-circle"
            onClick={() => setApagado(true)}
            aria-label="Mostrar despedida final"
            title="Finalizar"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 2v10" />
              <path d="M18.36 6.64a9 9 0 1 1-12.72 0" />
            </svg>
          </button>

          <p className="project-status">
            ESTADO DEL PROYECTO: FINALIZADO
          </p>

          <h1>INTERPRETEYA</h1>
          <hr />

          <h2>FIN DE UNA ETAPA.</h2>

          <p className="message">
            Informamos que el desarrollo de la plataforma
            InterpreteYa ha sido suspendido de manera indefinida.
          </p>

          <p className="message">
            Agradecemos a quienes formaron parte de este camino,
            por su tiempo, dedicación y compromiso.
          </p>

          <p className="goodbye">ADIÓS.</p>

          <hr />

          <footer>
            <p>INTERPRETEYA © 2026</p>
            <p>
              Desarrollo suspendido · Sitio fuera de servicio
            </p>
          </footer>
        </section>
      ) : (
        <section className="shutdown-screen" aria-live="polite">
          <div className="shutdown-power">⏻</div>
          <h1>FIN.</h1>
          <h2>GRACIAS POR TODO.</h2>
          <p>INTERPRETEYA © 2026</p>

          <button
            type="button"
            className="return-button"
            onClick={() => setApagado(false)}
          >
            VOLVER
          </button>
        </section>
      )}
    </main>
  );
}
